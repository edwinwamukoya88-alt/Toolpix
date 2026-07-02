import "dotenv/config"
import path from "path"
import { PrismaClient } from "@/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db"
  const dbPath = rawUrl.replace(/^file:/, "").replace(/^\//, "")
  const absolutePath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath)
  const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
