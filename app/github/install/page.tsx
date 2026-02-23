import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function InstallPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { success, error } = await searchParams

  const installations = await db.installation.findMany({
    where: { userId: session.user.id, suspendedAt: null },
    include: { _count: { select: { reviews: true } } },
    orderBy: { installedAt: "desc" },
  })

  const appName = process.env.GITHUB_APP_NAME ?? "your-app"
  const installUrl = `https://github.com/apps/${appName}/installations/new`

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub App</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Install the AI Code Reviewer GitHub App on your repositories to get automatic PR reviews.
        </p>
      </div>

      {success === "installed" && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
          GitHub App installed successfully. Open a pull request to trigger your first review.
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          Installation error: {error}. Please try again.
        </div>
      )}

      {/* Install button */}
      <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">Install on a Repository</h2>
        <p className="mt-1 text-sm text-zinc-500">
          You can install on specific repositories or grant access to all repos in your account or org.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>Automatic review on every pull request opened or updated</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>Reviews posted as PR comments under the bot identity</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>Advisory only — never blocks merges</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">✓</span>
            <span>Review history tracked in your dashboard</span>
          </div>
        </div>
        <a
          href={installUrl}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          Install GitHub App
        </a>
      </div>

      {/* Installed repos */}
      {installations.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold">Active Installations</h2>
          <div className="flex flex-col gap-2">
            {installations.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
              >
                <div>
                  <div className="font-medium">{inst.accountLogin}</div>
                  <div className="text-xs text-zinc-400">
                    {inst.accountType} · {inst._count.reviews} review
                    {inst._count.reviews !== 1 ? "s" : ""}
                  </div>
                </div>
                <Link
                  href="/reviews"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View reviews →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
