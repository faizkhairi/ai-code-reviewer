import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/reviews — DB-backed review history for authenticated user
// This is the bot-review history; manual reviews (web UI) do not create DB rows.
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const installationId = searchParams.get("installationId")

  const reviews = await db.review.findMany({
    where: {
      installation: { userId: session.user.id },
      ...(status && { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "SKIPPED" }),
      ...(installationId && { installationId }),
    },
    include: {
      installation: { select: { accountLogin: true, accountType: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(reviews)
}
