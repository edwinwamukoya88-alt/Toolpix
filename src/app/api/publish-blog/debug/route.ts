import { NextResponse } from "next/server"
import { verifyGitHubAccess } from "@/lib/github-publisher"
import { checkGitHubEnv } from "@/lib/env"

export const runtime = "nodejs"

export async function GET() {
  const env = checkGitHubEnv()

  let gitHubStatus = null
  try {
    gitHubStatus = await verifyGitHubAccess()
  } catch (err) {
    gitHubStatus = {
      configured: true,
      apiReachable: false,
      apiError: err instanceof Error ? err.message : "Exception during verification",
    }
  }

  const config = {
    owner: env.owner ? process.env.GITHUB_OWNER!.charAt(0) + "***" : null,
    repo: env.repo ? process.env.GITHUB_REPO!.charAt(0) + "***" : null,
    branch: env.branch ? process.env.GITHUB_BRANCH : "main",
  }

  return NextResponse.json({
    env: {
      GITHUB_TOKEN: env.token,
      GITHUB_OWNER: env.owner,
      GITHUB_REPO: env.repo,
      GITHUB_BRANCH: env.branch,
    },
    loadedFrom: "process.env (runtime)",
    gitHub: gitHubStatus,
    config,
    timestamp: new Date().toISOString(),
  })
}
