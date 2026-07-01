import { tools, categories, type Tool } from "./tools-data"

const TOOLS_CONFIG_KEY = "tf_tools_config"

export interface ToolConfig {
  slug: string
  enabled: boolean
  featured: boolean
  popular: boolean
  new: boolean
}

export { categories, type Tool }

function loadConfig(): ToolConfig[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TOOLS_CONFIG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveConfig(config: ToolConfig[]) {
  localStorage.setItem(TOOLS_CONFIG_KEY, JSON.stringify(config))
}

export function getToolsWithConfig(): (Tool & ToolConfig)[] {
  const config = loadConfig()
  return tools.map((tool) => {
    const cfg = config.find((c) => c.slug === tool.slug)
    return {
      ...tool,
      enabled: cfg?.enabled ?? true,
      featured: cfg?.featured ?? false,
      popular: cfg?.popular ?? false,
      new: cfg?.new ?? false,
    }
  })
}

export function updateToolConfig(
  slug: string,
  updates: Partial<Pick<ToolConfig, "enabled" | "featured" | "popular" | "new">>,
): boolean {
  const config = loadConfig()
  const index = config.findIndex((c) => c.slug === slug)
  if (index >= 0) {
    config[index] = { ...config[index], ...updates }
  } else {
    config.push({ slug, enabled: true, featured: false, popular: false, new: false, ...updates })
  }
  saveConfig(config)
  return true
}

export function bulkUpdateTools(
  slugs: string[],
  updates: Partial<Pick<ToolConfig, "enabled" | "featured" | "popular" | "new">>,
): void {
  const config = loadConfig()
  for (const slug of slugs) {
    const index = config.findIndex((c) => c.slug === slug)
    if (index >= 0) {
      config[index] = { ...config[index], ...updates }
    } else {
      config.push({ slug, enabled: true, featured: false, popular: false, new: false, ...updates })
    }
  }
  saveConfig(config)
}

export function getToolBySlug(slug: string): (Tool & ToolConfig) | null {
  const tool = tools.find((t) => t.slug === slug)
  if (!tool) return null
  const config = loadConfig().find((c) => c.slug === slug)
  return {
    ...tool,
    enabled: config?.enabled ?? true,
    featured: config?.featured ?? false,
    popular: config?.popular ?? false,
    new: config?.new ?? false,
  }
}
