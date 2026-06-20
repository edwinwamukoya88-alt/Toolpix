import { NextResponse } from "next/server"
import { publishBlog as githubPublish } from "@/lib/github-publisher"
import { getGitHubConfig, checkGitHubEnv, checkGitHubEnvVerbose, MissingEnvError } from "@/lib/env"
import { correctSpelling, optimizeTitle, validateDescription, cleanTags, optimizeSlug, autoFixAll, runPrePublishValidation } from "@/lib/seo-cleanup"

export const runtime = "nodejs"

function diagError(step: string, message: string, details?: string) {
  console.error(`[publish-blog] FAILED at step "${step}": ${message}${details ? ` | ${details}` : ""}`)
  return NextResponse.json({
    success: false,
    step,
    error: message,
    details: details || null,
  }, { status: 500 })
}

export async function POST(request: Request) {
  const envVerbose = checkGitHubEnvVerbose()
  console.log("[publish-blog] POST received")
  console.log("[publish-blog] Env states:", JSON.stringify(envVerbose))

  const isMissingOrEmpty = (key: "GITHUB_TOKEN" | "GITHUB_OWNER" | "GITHUB_REPO") =>
    envVerbose[key] === "missing" || envVerbose[key] === "empty"
  if (isMissingOrEmpty("GITHUB_TOKEN") || isMissingOrEmpty("GITHUB_OWNER") || isMissingOrEmpty("GITHUB_REPO")) {
    const failed: string[] = []
    if (isMissingOrEmpty("GITHUB_TOKEN")) failed.push(`GITHUB_TOKEN=${process.env.GITHUB_TOKEN === undefined ? "not defined" : "empty string"}`)
    if (isMissingOrEmpty("GITHUB_OWNER")) failed.push(`GITHUB_OWNER=${process.env.GITHUB_OWNER === undefined ? "not defined" : "empty string"}`)
    if (isMissingOrEmpty("GITHUB_REPO")) failed.push(`GITHUB_REPO=${process.env.GITHUB_REPO === undefined ? "not defined" : "empty string"}`)
    console.warn(`[publish-blog] ${failed.join(", ")}`)
  }

  try {
    let body
    try {
      body = await request.json()
    } catch {
      return diagError("parse-body", "Failed to parse request JSON", "Request body is not valid JSON")
    }

    const { slug, content, title, description, tags, skipValidation, skipAutoFix } = body

    if (!slug || !content) {
      return diagError("validate-input", "Missing slug or content", `slug: ${typeof slug}, content: ${typeof content}`)
    }

    if (typeof slug !== "string" || typeof content !== "string") {
      return diagError("validate-input", "Invalid slug or content type", `slug type: ${typeof slug}, content type: ${typeof content}`)
    }

    console.log(`[publish-blog] slug="${slug}", content.length=${content.length}`)

    try {
      getGitHubConfig()
    } catch (err) {
      if (err instanceof MissingEnvError) {
        console.warn("[publish-blog] Missing env vars — returning structured error")
        return NextResponse.json({
          success: false,
          step: "check-env",
          error: err.message,
          missing: err.missing,
          details: err.hint,
        }, { status: 500 })
      }
      throw err
    }

    if (!skipAutoFix) {
      const tagsArray: string[] = tags || []
      const autoFixed = autoFixAll({
        title: title || "",
        description: description || "",
        tags: tagsArray,
        slug,
        content,
      })
      return NextResponse.json({
        success: false,
        step: "auto-fix",
        autoFixAvailable: true,
        autoFixResult: autoFixed,
        message: "Auto-fix suggestions available. Call again with skipAutoFix=true to publish.",
        validationIssues: runPrePublishValidation({
          title: autoFixed.title || title || "",
          description: autoFixed.description || description || "",
          tags: autoFixed.tags || tags || [],
          slug: autoFixed.slug || slug,
          content: autoFixed.fixesApplied.length > 0 ? content : content,
        }),
      })
    }

    if (!skipValidation) {
      const validationIssues = runPrePublishValidation({
        title: title || "",
        description: description || "",
        tags: tags || [],
        slug,
        content,
      })
      const errors = validationIssues.filter((i) => i.severity === "error")
      if (errors.length > 0) {
        return NextResponse.json({
          success: false,
          step: "validation",
          error: "Validation failed",
          validationIssues,
          message: errors.map((e) => e.message).join("; "),
        }, { status: 422 })
      }
    }

    console.log(`[publish-blog] Calling githubPublish(slug="${slug}", content.length=${content.length})`)
    const commitMessage = `Publish blog post: ${slug} [automated]`
    const result = await githubPublish(slug, content)

    if (!result.success) {
      console.error(`[publish-blog] githubPublish failed: ${result.error} (status: ${result.status || "N/A"})`)
      return diagError(
        "github-publish",
        result.error || "GitHub publish returned failure without error message",
        `GitHub API status: ${result.status || "unknown"}`,
      )
    }

    console.log(`[publish-blog] GitHub publish succeeded: path=${result.path}, sha=${result.sha}`)

    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const host = request.headers.get("host") || "smart-tools-kit.vercel.app"
    const baseUrl = `${protocol}://${host}`

    try {
      await fetch(`${baseUrl}/api/revalidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => {})
    } catch {}

    try {
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`)
        .catch(() => {})
    } catch {}

    console.log("[publish-blog] Success — returning 200")
    return NextResponse.json({
      success: true,
      filePath: result.path,
      slug,
      sha: result.sha,
      url: result.url,
      message: `Blog post published to ${result.path}`,
      commitMessage,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    const stack = error instanceof Error ? error.stack : undefined
    console.error(`[publish-blog] UNCAUGHT EXCEPTION: ${message}`)
    if (stack) console.error(`[publish-blog] Stack trace: ${stack}`)
    return diagError("unhandled", message, stack || "No stack trace available")
  }
}
