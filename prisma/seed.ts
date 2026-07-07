import "dotenv/config"
import path from "path"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

function createPrismaClient() {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db"
  const dbPath = rawUrl.replace(/^file:/, "").replace(/^\//, "")
  const absolutePath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), dbPath)
  const adapter = new PrismaBetterSqlite3({ url: `file:${absolutePath}` })
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  const existingSettings = await prisma.siteSetting.findUnique({ where: { id: 1 } })
  if (!existingSettings) {
    await prisma.siteSetting.create({ data: { id: 1 } })
    console.log("Seeded default site settings.")
  } else {
    console.log("Site settings already exist.")
  }

  const adminEmails = ["edwinwamukoya88@gmail.com"]
  for (const email of adminEmails) {
    const existing = await prisma.adminUser.findUnique({ where: { email } })
    if (!existing) {
      await prisma.adminUser.create({
        data: { email, role: "admin", status: "active" },
      })
      console.log(`Seeded admin user: ${email}`)
    }
  }

  const toolSlugs = [
    "planner", "pomodoro", "notes", "day-planner", "habit-tracker", "stopwatch", "kanban",
    "grade-calculator", "revision-planner", "lesson-plan-generator", "exam-generator",
    "teacher-comment-generator", "scheme-of-work-generator",
    "password-generator", "text-cleaner", "base64", "url-encoder", "random-generator",
    "qr-generator", "qr-scanner", "qr-extractor", "url-shortener",
    "pdf-converter", "image-converter", "document-converter", "audio-converter", "file-compressor",
    "json-formatter", "regex-tester", "markdown-preview", "unit-converter",
    "color-picker", "lorem-ipsum", "favicon-generator", "image-placeholder", "design-cards-studio",
    "currency-converter", "loan-calculator", "profit-calculator", "blog-generator",
  ]
  for (const slug of toolSlugs) {
    const existing = await prisma.toolConfig.findUnique({ where: { slug } })
    if (!existing) {
      await prisma.toolConfig.create({ data: { slug } })
    }
  }
  console.log(`Seeded ${toolSlugs.length} tool configs.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
