export type FeatureCategory = "writing" | "education" | "design"

export interface SettingField {
  key: string
  label: string
  type: "text" | "select" | "number"
  options?: { value: string; label: string }[]
  placeholder?: string
  defaultValue?: string
}

export interface FeatureDef {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  category: FeatureCategory
  settings?: SettingField[]
  promptPlaceholder: string
}

export interface HistoryItem {
  id: string
  feature: string
  input: string
  output: string
  timestamp: number
  favorite?: boolean
}

export interface CategoryDef {
  id: FeatureCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export interface WorkspaceState {
  activeCategory: FeatureCategory
  activeFeature: string | null
  input: string
  output: string
  htmlOutput: string | undefined
  settings: Record<string, string>
  isGenerating: boolean
  error: string | null
  settingsOpen: boolean
  historyOpen: boolean
  history: HistoryItem[]
  usageRemaining: number
  copySuccess: boolean
  feature: FeatureDef | undefined
  showOutput: boolean
  wordCount: number
  charCount: number
}
