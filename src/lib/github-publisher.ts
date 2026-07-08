import { getGitHubConfig, checkGitHubEnv } from "./env"
import type { GitHubConfig } from "./env"

interface GitHubApiError {
  message?: string
  documentation_url?: string
}

interface GitHubContentItem {
  sha: string
  path: string
}

interface GitHubCommitResponse {
  success: boolean
  sha?: string
  path?: string
  url?: string
  error?: string
  status?: number
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "zilita-blog-publisher",
  }
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/")
}

function extractGitHubError(res: Response, body: GitHubApiError): string {
  return body.message || `GitHub API error: ${res.status} ${res.statusText}`
}

export async function getFileSha(path: string, config?: GitHubConfig): Promise<{ sha: string | null; error?: string; status?: number }> {
  let cfg: GitHubConfig
  try {
    cfg = config || getGitHubConfig()
  } catch {
    return { sha: null, error: "GitHub not configured" }
  }
  const encoded = encodePath(path)
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${encoded}?ref=${encodeURIComponent(cfg.branch)}`
  const res = await fetch(url, {
    headers: githubHeaders(cfg.token),
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 404) return { sha: null }
    const body: GitHubApiError = await res.json().catch(() => ({}))
    return { sha: null, error: extractGitHubError(res, body), status: res.status }
  }
  const data: { sha: string } = await res.json()
  return { sha: data.sha }
}

export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
): Promise<GitHubCommitResponse> {
  let config: GitHubConfig
  try {
    config = getGitHubConfig()
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "GitHub not configured",
    }
  }

  const existing = await getFileSha(path, config)
  if (existing.error) {
    return { success: false, error: `Failed to check existing file: ${existing.error}`, status: existing.status }
  }

  const encoded = Buffer.from(content, "utf-8").toString("base64")

  const body: Record<string, unknown> = {
    message,
    content: encoded,
    branch: config.branch,
  }
  if (existing.sha) {
    body.sha = existing.sha
  }

  const encodedPath = encodePath(path)
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`
  console.log(`[github-publisher] PUT ${url} (branch: ${config.branch}, update: ${!!existing.sha})`)
  const res = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(config.token),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errData: GitHubApiError = await res.json().catch(() => ({}))
    console.error(`[github-publisher] PUT failed: ${res.status} ${res.statusText} — ${errData.message || "no message"}`)
    return {
      success: false,
      error: errData.message || `GitHub API error: ${res.status} ${res.statusText}`,
      status: res.status,
    }
  }

  const data: { content: GitHubContentItem; commit: { sha: string } } = await res.json()
  return {
    success: true,
    sha: data.commit.sha,
    path: data.content.path,
    url: `https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${data.content.path}`,
  }
}

export async function publishBlog(
  slug: string,
  mdxContent: string,
): Promise<GitHubCommitResponse> {
  const today = new Date().toISOString().split("T")[0]
  let content = mdxContent

  if (!content.includes("lastModified:")) {
    content = content.replace(/^(---\n)/m, `$1lastModified: "${today}"\n`)
  } else {
    content = content.replace(/^(lastModified:\s*").+?(")/m, `$1${today}$2`)
  }

  const filePath = `content/blog/${slug}.mdx`
  return createOrUpdateFile(
    filePath,
    content,
    `Publish blog post: ${slug} [automated]`,
  )
}

export async function verifyGitHubAccess(): Promise<{
  configured: boolean
  tokenPresent: boolean
  ownerPresent: boolean
  repoPresent: boolean
  branchPresent: boolean
  apiReachable: boolean | null
  apiError?: string
  owner?: string
  repo?: string
  branch?: string
}> {
  const env = checkGitHubEnv()
  const configured = env.token && env.owner && env.repo

  if (!configured) {
    return { tokenPresent: env.token, ownerPresent: env.owner, repoPresent: env.repo, branchPresent: env.branch, configured: false, apiReachable: null }
  }

  let config: GitHubConfig
  try {
    config = getGitHubConfig()
  } catch (err) {
    return {
      tokenPresent: env.token,
      ownerPresent: env.owner,
      repoPresent: env.repo,
      branchPresent: env.branch,
      configured: false,
      apiReachable: null,
      apiError: err instanceof Error ? err.message : "Config error",
    }
  }

  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/branches/${encodeURIComponent(config.branch)}`
    const res = await fetch(url, {
      headers: githubHeaders(config.token),
      cache: "no-store",
    })
    if (res.ok) {
      return { tokenPresent: env.token, ownerPresent: env.owner, repoPresent: env.repo, branchPresent: env.branch, configured: true, apiReachable: true, owner: config.owner, repo: config.repo, branch: config.branch }
    }
    const body: GitHubApiError = await res.json().catch(() => ({}))
    return {
      tokenPresent: env.token,
      ownerPresent: env.owner,
      repoPresent: env.repo,
      branchPresent: env.branch,
      configured: true,
      apiReachable: false,
      apiError: extractGitHubError(res, body),
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
    }
  } catch (err) {
    return {
      tokenPresent: env.token,
      ownerPresent: env.owner,
      repoPresent: env.repo,
      branchPresent: env.branch,
      configured: true,
      apiReachable: false,
      apiError: err instanceof Error ? err.message : "Unknown error",
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
    }
  }
}
