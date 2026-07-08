import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(import.meta.dirname, "..", ".env.local") })
config({ path: resolve(import.meta.dirname, "..", ".env") })

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in .env.local")
  process.exit(1)
}

async function main() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
  const res = await fetch(url)

  if (!res.ok) {
    const text = await res.text()
    console.error(`API error (${res.status}): ${text}`)
    process.exit(1)
  }

  const data = await res.json()
  const models = data.models || []

  console.log(`\nFound ${models.length} models available for this API key:\n`)

  for (const m of models) {
    const name = m.name || "???"
    const displayName = m.displayName || ""
    const supportedMethods = m.supportedGenerationMethods || []
    const hasGenerateContent = supportedMethods.includes("generateContent")
    const hasEmbedContent = supportedMethods.includes("embedContent")
    const desc = m.description || ""

    const badge = hasGenerateContent ? "✅ generateContent" : ""
    const embedBadge = hasEmbedContent ? " 📐 embedContent" : ""
    const tags = [badge, embedBadge].filter(Boolean).join(" | ")

    console.log(`  ${name}`)
    if (displayName) console.log(`    Display: ${displayName}`)
    if (tags) console.log(`    Methods: ${tags}`)
    if (hasGenerateContent) console.log(`    STATUS:  COMPATIBLE with Zilita AI Workspace`)
    if (desc) {
      const short = desc.length > 120 ? desc.slice(0, 120) + "..." : desc
      console.log(`    Info:    ${short}`)
    }
    console.log("")
  }

  const compatible = models.filter((m) =>
    (m.supportedGenerationMethods || []).includes("generateContent"),
  )
  console.log("─── RECOMMENDATION ───────────────────────────────────")
  console.log("")
  if (compatible.length > 0) {
    console.log(`Models that support generateContent (${compatible.length}):`)
    for (const m of compatible) {
      console.log(`  GEMINI_MODEL=${m.name.replace("models/", "")}`)
    }
  } else {
    console.log("No models with generateContent found.")
  }
  console.log("")
}

main().catch((err) => {
  console.error("Script failed:", err)
  process.exit(1)
})
