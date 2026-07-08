export interface GitHubConfig {
  token: string
  owner: string
  repo: string
  branch: string
}

export interface EnvCheckResult {
  token: boolean
  owner: boolean
  repo: boolean
  branch: boolean
}

function envState(key: string): "set" | "empty" | "missing" {
  const val = process.env[key]
  if (val === undefined) return "missing"
  if (val === "") return "empty"
  return "set"
}

export function checkGitHubEnvVerbose() {
  return {
    GITHUB_TOKEN: envState("GITHUB_TOKEN"),
    GITHUB_OWNER: envState("GITHUB_OWNER"),
    GITHUB_REPO: envState("GITHUB_REPO"),
    GITHUB_BRANCH: envState("GITHUB_BRANCH"),
  }
}

export function checkGitHubEnv(): EnvCheckResult {
  return {
    token: !!process.env.GITHUB_TOKEN,
    owner: !!process.env.GITHUB_OWNER,
    repo: !!process.env.GITHUB_REPO,
    branch: !!process.env.GITHUB_BRANCH,
  }
}

export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || "main"

  const missing: string[] = []
  const empty: string[] = []

  for (const key of ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO"] as const) {
    const state = envState(key)
    if (state === "missing") missing.push(key)
    else if (state === "empty") empty.push(key)
  }

  if (missing.length > 0 || empty.length > 0) {
    const parts: string[] = []
    if (missing.length > 0) parts.push(`not defined: ${missing.join(", ")}`)
    if (empty.length > 0) parts.push(`set but empty: ${empty.join(", ")}`)

    const hint = process.env.NODE_ENV === "development"
      ? "In your .env.local file, add (or uncomment) non-empty values:\n" +
        "  GITHUB_TOKEN=ghp_yourActualTokenHere\n" +
        "  GITHUB_OWNER=your-github-username\n" +
        "  GITHUB_REPO=your-repo-name\n\n" +
        "After editing .env.local, RESTART the dev server (npm run dev)."
      : "Add them in Vercel Dashboard → Project Settings → Environment Variables."

    throw new MissingEnvError([...missing, ...empty], hint)
  }

  return { token: token!, owner: owner!, repo: repo!, branch }
}

function startupWarning(): void {
  const verbose = checkGitHubEnvVerbose()
  const bad = (Object.entries(verbose) as [string, string][]).filter(([, v]) => v !== "set")
  if (bad.length > 0) {
    const details = bad.map(([k, v]) => `${k}=${v === "empty" ? '""' : "(not defined)"}`).join(", ")
    console.warn(
      `⚠️  GitHub env vars incomplete: ${details}\n` +
      `   → Open .env.local and fill in the values after the "=" sign.\n` +
      `   → Then RESTART the dev server: npm run dev\n` +
      `   → See .env.example for documentation.`
    )
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    console.warn(
      `⚠️  NEXT_PUBLIC_APP_URL not set — using fallback "https://smart-tools-kit.vercel.app"\n` +
      `   → Set NEXT_PUBLIC_APP_URL in .env.local for correct canonical URLs and SEO.`
    )
  }

  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  if (!adClient) {
    console.warn(
      `⚠️  NEXT_PUBLIC_ADSENSE_CLIENT not set — using fallback AdSense client ID.\n` +
      `   → Set NEXT_PUBLIC_ADSENSE_CLIENT in .env.local to your own AdSense publisher ID.`
    )
  }
}

// Only warn during Node.js runtime, not during Turbopack module evaluation
if (typeof process !== "undefined" && process?.release?.name === "node") {
  startupWarning()
}

export class MissingEnvError extends Error {
  public readonly missing: string[]
  public readonly hint: string

  constructor(missing: string[], hint: string) {
    const msg = `Missing required environment variables: ${missing.join(", ")}. ${hint}`
    super(msg)
    this.name = "MissingEnvError"
    this.missing = missing
    this.hint = hint
  }
}
