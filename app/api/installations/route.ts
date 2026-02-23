import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/installations — current user's GitHub App installations
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const installations = await db.installation.findMany({
    where: {
      userId: session.user.id,
      suspendedAt: null,
    },
    include: {
      _count: { select: { reviews: true } },
    },
    orderBy: { installedAt: "desc" },
  })

  return NextResponse.json(installations)
}
