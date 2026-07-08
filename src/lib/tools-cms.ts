import { tools, categories, type Tool } from "./tools-data"

export interface ToolConfigData {
  slug: string
  enabled: boolean
  featured: boolean
  popular: boolean
  new: boolean
}

export interface ToolWithConfig extends Tool {
  enabled: boolean
  featured: boolean
  popular: boolean
  new: boolean
}

export { categories, type Tool }

const API = "/api/admin/tools"

async function fetchAll(): Promise<ToolWithConfig[]> {
  try {
    const res = await fetch(API)
    if (!res.ok) return tools.map(t => ({ ...t, enabled: true, featured: false, popular: false, new: false }))
    const data = await res.json()
    return data.tools as ToolWithConfig[]
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_tools_config")
        const config: ToolConfigData[] = raw ? JSON.parse(raw) : []
        const configMap = new Map(config.map((c) => [c.slug, c]))
        return tools.map((tool) => {
          const cfg = configMap.get(tool.slug)
          return { ...tool, enabled: cfg?.enabled ?? true, featured: cfg?.featured ?? false, popular: cfg?.popular ?? false, new: cfg?.new ?? false }
        })
      }
    } catch {}
    return tools.map(t => ({ ...t, enabled: true, featured: false, popular: false, new: false }))
  }
}

export async function getToolsWithConfig(): Promise<ToolWithConfig[]> {
  return fetchAll()
}

export async function updateToolConfig(
  slug: string,
  updates: Partial<Pick<ToolConfigData, "enabled" | "featured" | "popular" | "new">>,
): Promise<boolean> {
  try {
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, updates }),
    })
    return res.ok
  } catch {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("zil_tools_config")
        const config: ToolConfigData[] = raw ? JSON.parse(raw) : []
        const index = config.findIndex((c) => c.slug === slug)
        if (index >= 0) {
          config[index] = { ...config[index], ...updates }
        } else {
          config.push({ slug, enabled: true, featured: false, popular: false, new: false, ...updates })
        }
        localStorage.setItem("zil_tools_config", JSON.stringify(config))
      }
    } catch {}
    return true
  }
}

export async function bulkUpdateTools(
  slugs: string[],
  updates: Partial<Pick<ToolConfigData, "enabled" | "featured" | "popular" | "new">>,
): Promise<void> {
  try {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs, updates }),
    })
  } catch {
    for (const slug of slugs) {
      await updateToolConfig(slug, updates)
    }
  }
}

export async function getToolBySlug(slug: string): Promise<ToolWithConfig | null> {
  const all = await fetchAll()
  return all.find((t) => t.slug === slug) ?? null
}
