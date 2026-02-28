import { PrismaClient } from "@/app/generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"

function createPrismaClient() {
  // PrismaNeon({ connectionString }) creates a WebSocket Pool that supports
  // interactive transactions (db.$transaction with async callback).
  // Do NOT use neon(url) here — that's the HTTP adapter and cannot support transactions.
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { db: PrismaClient }
export const db = globalForPrisma.db ?? createPrismaClient()
globalForPrisma.db = db
