import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import type { ReviewStatus } from "@/app/generated/prisma"

const statusColors: Record<ReviewStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  PROCESSING: "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  COMPLETED: "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  FAILED: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  SKIPPED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
}

export default async function ReviewsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const reviews = await db.review.findMany({
    where: {
      installation: { userId: session.user.id },
    },
    include: {
      installation: { select: { accountLogin: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bot Reviews</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Automated AI reviews posted to your GitHub pull requests.
          </p>
        </div>
        <Link
          href="/github/install"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Manage Installations
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
          <p className="text-zinc-500">No bot reviews yet.</p>
          <p className="text-sm text-zinc-400">
            Install the GitHub App on a repo and open a pull request to trigger your first review.
          </p>
          <Link
            href="/github/install"
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Install GitHub App →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Repository / PR</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Files</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {review.repoOwner}/{review.repoName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      #{review.prNumber} · {review.prTitle}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[review.status]}`}
                    >
                      {review.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{review.filesReviewed}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {review.prUrl ? (
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        View PR ↗
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
