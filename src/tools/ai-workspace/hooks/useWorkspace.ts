"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { processAI, type Feature } from "../modules/ai-processor"
import { getRemaining, incrementUsage } from "../usage-tracker"
import { getFeature, getFeaturesByCategory, getDefaultSettings, formatWordCount, formatCharCount } from "../data"
import { stripMarkdown, markdownToPrintHtml } from "../utils/markdown-formatter"
import { exportPdf } from "../utils/pdf-exporter"
import { exportDocx } from "../utils/docx-exporter"
import type { HistoryItem, FeatureCategory } from "../types"

const HISTORY_KEY = "ai-workspace-history"

function getCategoryFromPathname(pathname: string): FeatureCategory {
  const segments = pathname.split("/").filter(Boolean)
  const last = segments[segments.length - 1]
  if (last === "education") return "education"
  if (last === "design") return "design"
  return "writing"
}

export function useWorkspace() {
  const pathname = usePathname()
  const initialCategory = getCategoryFromPathname(pathname)

  const [activeCategory, setActiveCategory] = useState<FeatureCategory>(initialCategory)
  const [activeFeature, setActiveFeature] = useState<string | null>(() => {
    const feats = getFeaturesByCategory(initialCategory)
    return feats.length > 0 ? feats[0].id : null
  })
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [htmlOutput, setHtmlOutput] = useState<string | undefined>()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [usageRemaining, setUsageRemaining] = useState(5)
  const [copySuccess, setCopySuccess] = useState(false)

  const outputRef = useRef<HTMLDivElement>(null)
  const initialLoadDone = useRef(false)

  const feature = activeFeature ? getFeature(activeFeature) : undefined
  const showOutput = !!output
  const wordCount = formatWordCount(output)
  const charCount = formatCharCount(output)

  function loadHistory() {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[]
        setHistory(parsed)
      }
    } catch {}
  }

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true
    loadHistory()
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsageRemaining(getRemaining())
  }, [])

  function saveHistory(items: HistoryItem[]) {
    setHistory(items)
    if (typeof window !== "undefined") {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
    }
  }

  function handleCategoryChange(cat: FeatureCategory) {
    setActiveCategory(cat)
    const feats = getFeaturesByCategory(cat)
    if (feats.length > 0) {
      const firstId = feats[0].id
      setActiveFeature(firstId)
      const feat = getFeature(firstId)
      if (feat) {
        setSettings(getDefaultSettings(feat))
      }
    }
    setOutput("")
    setHtmlOutput(undefined)
    setError(null)
    setCopySuccess(false)
  }

  function handleFeatureSelect(id: string) {
    setActiveFeature(id)
    setOutput("")
    setHtmlOutput(undefined)
    setError(null)
    setCopySuccess(false)
    const feat = getFeature(id)
    if (feat) {
      setSettings(getDefaultSettings(feat))
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleGenerate() {
    if (!activeFeature || !input.trim()) return
    if (usageRemaining <= 0) {
      setError("Daily usage limit reached. Come back tomorrow!")
      return
    }

    setIsGenerating(true)
    setError(null)
    setOutput("")
    setHtmlOutput(undefined)

    try {
      const result = await processAI(activeFeature as Feature, input, settings)
      setOutput(result.output)
      setHtmlOutput(result.html)
      incrementUsage()
      setUsageRemaining(getRemaining())
      const item: HistoryItem = {
        id: crypto.randomUUID?.() ?? Date.now().toString(36),
        feature: activeFeature,
        input,
        output: result.output,
        timestamp: Date.now(),
      }
      saveHistory([item, ...history].slice(0, 50))
    } catch (err) {
      let msg = err instanceof Error ? err.message : "An unexpected error occurred"
      const colon = msg.indexOf(": ")
      if (colon !== -1) msg = msg.slice(colon + 2)
      setError(msg)
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(stripMarkdown(output))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch {}
  }

  const handleDownload = useCallback(() => {
    if (!output) return
    exportPdf(output, feature?.name || "document", feature?.name || "CBC Document", activeFeature || undefined, settings)
  }, [output, feature?.name, activeFeature, settings])

  const handleDownloadDocx = useCallback(() => {
    if (!output || !activeFeature) return
    exportDocx(output, settings, feature?.name || "CBC Document", activeFeature)
  }, [output, activeFeature, settings, feature?.name])

  function handlePrint() {
    if (!output || !activeFeature) return
    const html = markdownToPrintHtml(output, feature?.name || "Document", feature?.name || "AI Generated Document", activeFeature, settings)
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.print()
  }

  function restoreFromHistory(item: HistoryItem) {
    setActiveFeature(item.feature)
    setInput(item.input)
    setOutput(item.output)
    setHistoryOpen(false)
    const feat = getFeature(item.feature)
    if (feat) setSettings(getDefaultSettings(feat))
    setError(null)
  }

  function deleteHistoryItem(id: string) {
    saveHistory(history.filter((h) => h.id !== id))
  }

  function toggleFavorite(id: string) {
    saveHistory(
      history.map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h))
    )
  }

  const catFeatures = getFeaturesByCategory(activeCategory)

  return {
    activeCategory,
    handleCategoryChange,
    activeFeature,
    handleFeatureSelect,
    catFeatures,
    input,
    setInput,
    output,
    htmlOutput,
    showOutput,
    isGenerating,
    error,
    settings,
    updateSetting,
    historyOpen,
    setHistoryOpen,
    history,
    handleGenerate,
    handleCopy,
    handleDownload,
    handleDownloadDocx,
    handlePrint,
    copySuccess,
    usageRemaining,
    wordCount,
    charCount,
    feature,
    outputRef,
    restoreFromHistory,
    deleteHistoryItem,
    toggleFavorite,
  }
}
