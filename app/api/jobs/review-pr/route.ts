import { NextResponse } from "next/server"
import { Receiver } from "@upstash/qstash"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { db } from "@/lib/db"
import { getGitHubApp } from "@/lib/github"
import { getSystemPrompt } from "@/lib/prompts"

// Files that don't benefit from AI review — skip them to reduce token usage
const SKIP_PATTERNS = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.min\.(js|css)$/,
  /\.svg$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.gif$/,
  /\.ico$/,
  /\.woff2?$/,
  /\.ttf$/,
  /dist\//,
  /\.next\//,
  /generated\//,
]

const MAX_DIFF_CHARS = 12_000 // ~3k tokens, leaves room for system prompt + response
const MAX_FILES = 300

interface JobPayload {
  reviewId: string
  githubInstallationId: number
  repoOwner: string
  repoName: string
  prNumber: number
  headSha: string
}

async function handler(req: Request) {
  // ── QStash signature verification ────────────────────────────────────────
  // Verify that this request genuinely came from QStash, not an arbitrary caller.
  const signature = req.headers.get("upstash-signature") ?? ""
  const rawBody = await req.text()

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  })

  try {
    await receiver.verify({ signature, body: rawBody })
  } catch {
    return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as JobPayload
  const { reviewId, githubInstallationId, repoOwner, repoName, prNumber, headSha } = body

  // Mark as processing
  await db.review.update({
    where: { id: reviewId },
    data: { status: "PROCESSING" },
  })

  try {
    // ── Fetch PR diff files ────────────────────────────────────────────────
    // @octokit/app's getInstallationOctokit returns base Octokit (no .rest types).
    // The .rest plugin IS loaded at runtime; only the TypeScript generic is missing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const octokit = (await getGitHubApp().getInstallationOctokit(githubInstallationId)) as any

    // List all changed files — paginate if needed (GitHub caps at 100/page)
    const allFiles: Array<{ filename: string; patch?: string; status: string }> = []
    let page = 1
    while (allFiles.length < MAX_FILES) {
      const { data: files } = await octokit.rest.pulls.listFiles({
        owner: repoOwner,
        repo: repoName,
        pull_number: prNumber,
        per_page: 100,
        page,
      })
      allFiles.push(...files)
      if (files.length < 100) break
      page++
    }

    // Skip if PR is too large
    if (allFiles.length >= MAX_FILES) {
      await db.review.update({
        where: { id: reviewId },
        data: {
          status: "SKIPPED",
          summary: `PR has ${allFiles.length}+ changed files — too large for automated review.`,
        },
      })
      await octokit.rest.pulls.createReview({
        owner: repoOwner,
        repo: repoName,
        pull_number: prNumber,
        commit_id: headSha,
        body: `## AI Code Review\n\n⚠️ This PR has too many changed files (${allFiles.length}+) for automated review. Consider breaking it into smaller PRs.`,
        event: "COMMENT",
      })
      return NextResponse.json({ ok: true, status: "SKIPPED" })
    }

    // Filter reviewable files
    const reviewableFiles = allFiles.filter(
      (f) =>
        f.patch &&
        f.status !== "removed" &&
        !SKIP_PATTERNS.some((p) => p.test(f.filename)),
    )

    if (reviewableFiles.length === 0) {
      await db.review.update({
        where: { id: reviewId },
        data: {
          status: "SKIPPED",
          summary: "No reviewable source files changed.",
        },
      })
      return NextResponse.json({ ok: true, status: "SKIPPED" })
    }

    // ── Build diff chunks ─────────────────────────────────────────────────
    // Each chunk is a subset of the diff that fits within the token budget.
    const chunks: string[] = []
    let currentChunk = ""

    for (const file of reviewableFiles) {
      const fileDiff = `\n### ${file.filename}\n\`\`\`diff\n${file.patch}\n\`\`\`\n`
      if (currentChunk.length + fileDiff.length > MAX_DIFF_CHARS && currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = fileDiff
      } else {
        currentChunk += fileDiff
      }
    }
    if (currentChunk.length > 0) chunks.push(currentChunk)

    // ── Run AI review on each chunk ───────────────────────────────────────
    const chunkReviews: string[] = []
    for (const [i, chunk] of chunks.entries()) {
      const prompt =
        chunks.length > 1
          ? `Review this code diff (part ${i + 1} of ${chunks.length}):\n${chunk}`
          : `Review this code diff:\n${chunk}`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: getSystemPrompt("general"),
        prompt,
      })
      chunkReviews.push(text)
    }

    // ── Synthesize final review ───────────────────────────────────────────
    let finalReview: string
    if (chunkReviews.length === 1) {
      finalReview = chunkReviews[0]
    } else {
      // Synthesize multiple chunk reviews into one coherent summary
      const { text: synthesis } = await generateText({
        model: openai("gpt-4o"),
        system:
          "You are a code review synthesizer. Combine multiple partial code reviews into one coherent, deduplicated review. Remove duplicates, organize findings by severity, and produce a final actionable review.",
        prompt: `Combine these ${chunkReviews.length} partial reviews into one final review:\n\n${chunkReviews.map((r, i) => `## Part ${i + 1}\n${r}`).join("\n\n")}`,
      })
      finalReview = synthesis
    }

    // ── Post as GitHub PR Review Comment ──────────────────────────────────
    // Use event: "COMMENT" — never APPROVE or REQUEST_CHANGES.
    // The bot should never block merges; it's advisory only.
    const prReviewBody = `## AI Code Review 🤖\n\n${finalReview}\n\n---\n*Reviewed ${reviewableFiles.length} file(s) · Powered by GPT-4o*`

    const { data: postedReview } = await octokit.rest.pulls.createReview({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
      commit_id: headSha,
      body: prReviewBody,
      event: "COMMENT",
    })

    // ── Update DB record ──────────────────────────────────────────────────
    const summary = finalReview.slice(0, 300) + (finalReview.length > 300 ? "…" : "")
    await db.review.update({
      where: { id: reviewId },
      data: {
        status: "COMPLETED",
        content: finalReview,
        summary,
        filesReviewed: reviewableFiles.length,
        githubCommentId: postedReview.id,
      },
    })

    return NextResponse.json({ ok: true, status: "COMPLETED", reviewId })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    await db.review.update({
      where: { id: reviewId },
      data: { status: "FAILED", errorMessage: message },
    })
    throw error // Let QStash see the 500 and retry
  }
}

export const POST = handler
