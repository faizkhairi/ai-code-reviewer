import { NextResponse } from "next/server"
import { Client } from "@upstash/qstash"
import { db } from "@/lib/db"

// CRITICAL: Must use req.text() to get the raw body BEFORE any JSON.parse.
// req.json() consumes the stream and makes the body unavailable for HMAC verification.
export async function POST(req: Request) {
  const rawBody = await req.text()

  // ── Verify GitHub signature ──────────────────────────────────────────────
  const signature = req.headers.get("x-hub-signature-256")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 })
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? ""
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  )
  // Use crypto.subtle.verify for constant-time comparison — it computes the MAC
  // and compares internally, preventing timing attacks without manual hex encoding.
  const sigHex = signature.startsWith("sha256=") ? signature.slice(7) : ""
  const sigBytes = new Uint8Array(
    (sigHex.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)),
  )
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    encoder.encode(rawBody),
  )
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // ── Route by event type ──────────────────────────────────────────────────
  const event = req.headers.get("x-github-event")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = JSON.parse(rawBody) as Record<string, any>

  // Handle installation lifecycle
  if (event === "installation") {
    const installId = payload.installation?.id as number | undefined
    if (!installId) return NextResponse.json({ ok: true })

    if (payload.action === "created") {
      await db.installation.upsert({
        where: { installationId: installId },
        create: {
          installationId: installId,
          accountLogin: payload.installation.account?.login ?? "",
          accountType: payload.installation.account?.type ?? "User",
        },
        update: { suspendedAt: null },
      })
    } else if (payload.action === "deleted" || payload.action === "suspend") {
      await db.installation.updateMany({
        where: { installationId: installId },
        data: { suspendedAt: new Date() },
      })
    }
    return NextResponse.json({ ok: true })
  }

  // Only handle pull_request events
  if (event !== "pull_request") {
    return NextResponse.json({ ok: true })
  }

  // Only trigger review on opened or synchronize (new commits pushed to PR)
  const action = payload.action as string
  if (action !== "opened" && action !== "synchronize") {
    return NextResponse.json({ ok: true })
  }

  const pr = payload.pull_request as {
    number: number
    title: string
    html_url: string
    head: { sha: string }
  }
  const repo = payload.repository as { owner: { login: string }; name: string }
  const installationId = payload.installation?.id as number | undefined

  if (!installationId) {
    return NextResponse.json({ error: "No installation ID in payload" }, { status: 400 })
  }

  // Find installation in our DB
  const installation = await db.installation.findUnique({
    where: { installationId },
  })
  if (!installation) {
    return NextResponse.json({ error: "Installation not found" }, { status: 404 })
  }

  // ── Idempotency check ────────────────────────────────────────────────────
  // pull_request.synchronize fires on EVERY push to the PR branch.
  // The @@unique on headSha ensures the same commit is never reviewed twice.
  const existing = await db.review.findUnique({
    where: {
      repoOwner_repoName_prNumber_headSha: {
        repoOwner: repo.owner.login,
        repoName: repo.name,
        prNumber: pr.number,
        headSha: pr.head.sha,
      },
    },
  })
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true, reviewId: existing.id })
  }

  // Create a PENDING review record — the actual review runs asynchronously via QStash
  const review = await db.review.create({
    data: {
      installationId: installation.id,
      repoOwner: repo.owner.login,
      repoName: repo.name,
      prNumber: pr.number,
      prTitle: pr.title,
      prUrl: pr.html_url,
      headSha: pr.head.sha,
      status: "PENDING",
    },
  })

  // ── Enqueue QStash job ───────────────────────────────────────────────────
  // Do NOT await the AI review here — webhook must return within 10 seconds.
  // QStash will POST to our job handler with retry logic.
  const qstash = new Client({ token: process.env.QSTASH_TOKEN! })
  await qstash.publishJSON({
    url: `${process.env.NEXTAUTH_URL}/api/jobs/review-pr`,
    body: {
      reviewId: review.id,
      githubInstallationId: installationId,
      repoOwner: repo.owner.login,
      repoName: repo.name,
      prNumber: pr.number,
      headSha: pr.head.sha,
    },
    retries: 2,
  })

  return NextResponse.json({ ok: true, reviewId: review.id })
}
