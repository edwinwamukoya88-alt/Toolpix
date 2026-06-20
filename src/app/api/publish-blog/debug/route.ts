import { NextResponse } from "next/server"
import { verifyGitHubAccess } from "@/lib/github-publisher"
import { checkGitHubEnvVerbose } from "@/lib/env"

export const runtime = "nodejs"

export async function GET() {
  const env = checkGitHubEnvVerbose()

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

  return NextResponse.json({
    env,
    loadedFrom: "process.env (runtime)",
    note: '"missing" means the variable is not defined at all (undefined). "empty" means it is defined but set to an empty string (KEY=). "set" means it has a non-empty value.',
    gitHub: gitHubStatus,
    timestamp: new Date().toISOString(),
  })
}
