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

/**
 * Returns a snapshot of which GITHUB_* env vars are present.
 * Never exposes actual values — only booleans.
 */
export function checkGitHubEnv(): EnvCheckResult {
  return {
    token: !!process.env.GITHUB_TOKEN,
    owner: !!process.env.GITHUB_OWNER,
    repo: !!process.env.GITHUB_REPO,
    branch: !!process.env.GITHUB_BRANCH,
  }
}

/**
 * Reads and validates GITHUB_* env vars at runtime.
 * Throws a clear error listing every missing variable.
 * Works in Node.js runtime (Next.js App Router API routes).
 */
export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || "main"

  const missing: string[] = []
  if (!token) missing.push("GITHUB_TOKEN")
  if (!owner) missing.push("GITHUB_OWNER")
  if (!repo) missing.push("GITHUB_REPO")

  if (missing.length > 0) {
    const hint = process.env.NODE_ENV === "development"
      ? "Create a .env.local file in the project root with:\n" +
        missing.map((k) => `${k}=your_value_here`).join("\n") +
        "\n\nSee .env.example for documentation."
      : "Add them in Vercel Dashboard → Project Settings → Environment Variables."
    throw new MissingEnvError(missing, hint)
  }

  return { token: token!, owner: owner!, repo: repo!, branch }
}

function startupWarning(): void {
  const { token, owner, repo } = checkGitHubEnv()
  if (!token || !owner || !repo) {
    const missing: string[] = []
    if (!token) missing.push("GITHUB_TOKEN")
    if (!owner) missing.push("GITHUB_OWNER")
    if (!repo) missing.push("GITHUB_REPO")
    console.warn(
      `⚠️  Missing ${missing.join(", ")} — GitHub publishing will not work locally.\n` +
      `   Create a .env.local file in the project root with these variables set.\n` +
      `   See .env.example for documentation.`
    )
  }
}

startupWarning()

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
