"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, useSyncExternalStore, ReactNode } from "react"
import { toast } from "sonner"
import { getRemaining, incrementUsage } from "@/tools/ai-workspace/usage-tracker"
import { processAI } from "@/tools/ai-workspace/modules/ai-processor"
import { subscribe, cancelRequest, getQueueState, type QueueItem, type QueueState } from "@/lib/ai/queue-manager"

const EMPTY_QUEUE_STATE: QueueState = Object.freeze({
  items: [],
  processing: false,
  queuedCount: 0,
  activeItem: null,
})

export interface SettingDef {
  key: string
  label: string
  type: "select" | "text"
  options?: { label: string; value: string }[]
}

interface WorkspaceContextType {
  input: string
  setInput: (v: string) => void
  output: string
  setOutput: (v: string) => void
  outputHtml: string | undefined
  setOutputHtml: (v: string | undefined) => void
  processing: boolean
  activeFeature: string
  setActiveFeature: (v: string) => void
  featureSettings: Record<string, string>
  remaining: number
  settingsDefs: SettingDef[]
  registerSettings: (defs: SettingDef[]) => void
  updateSetting: (key: string, value: string) => void
  wordCount: number
  charCount: number
  handleProcess: () => Promise<void>
  handleCopy: () => Promise<void>
  handleDownload: () => void
  handleClear: () => void
  outputRef: React.RefObject<HTMLDivElement | null>
  queueItems: QueueItem[]
  cancelQueued: (id: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}

const DAILY_LIMIT = 5

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [outputHtml, setOutputHtml] = useState<string | undefined>()
  const [activeFeature, setActiveFeature] = useState("humanize")
  const [featureSettings, setFeatureSettings] = useState<Record<string, string>>({})
  const [remaining, setRemaining] = useState(DAILY_LIMIT)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(getRemaining())
  }, [])
  const [settingsDefs, setSettingsDefs] = useState<SettingDef[]>([])
  const outputRef = useRef<HTMLDivElement>(null)

  const queueStateRef = useRef<QueueState>(EMPTY_QUEUE_STATE)

  const queueState = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => {
      queueStateRef.current = getQueueState()
      const unsub = subscribe((state) => {
        queueStateRef.current = state
        onStoreChange()
      })
      return unsub
    }, []),
    useCallback(() => queueStateRef.current, []),
    useCallback(() => EMPTY_QUEUE_STATE, []),
  )

  const queueItems = queueState.items
  const processing = queueState.processing || queueState.queuedCount > 0

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0
  const charCount = input.length

  const registerSettings = useCallback((defs: SettingDef[]) => {
    setSettingsDefs(defs)
  }, [])

  const updateSetting = useCallback((key: string, value: string) => {
    setFeatureSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const needsTextInput = (featureId: string): boolean => {
    const noText = ["design-cards", "social-media", "flyer", "poster", "certificate", "business-card"]
    return !noText.includes(featureId)
  }

  const handleProcess = useCallback(async () => {
    if (remaining <= 0) {
      toast.error("Daily limit reached. Come back tomorrow!")
      return
    }
    if (needsTextInput(activeFeature) && !input.trim()) {
      toast.error("Please enter some text")
      return
    }

    setOutput("")
    setOutputHtml(undefined)

    try {
      const result = await processAI(activeFeature as any, input, featureSettings)
      setOutput(result.output)
      setOutputHtml(result.html)
      incrementUsage()
      setRemaining(getRemaining())
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI processing failed"
      if (msg === "CANCELLED" || msg === "") return
      const errorMessages: Record<string, string> = {
        DAILY_COST_LIMIT_REACHED: "Cost limit reached. Try simpler requests.",
        RATE_LIMITED: "Service is busy. Please wait a moment.",
        MODEL_NOT_AVAILABLE: "AI model unavailable. Please try again later.",
        QUOTA_EXCEEDED: "API quota exceeded. Try again later.",
        API_KEY_INVALID: "AI service not configured. Please contact support.",
        SAFETY_BLOCKED: "Request blocked by content safety filters.",
        TOKEN_FETCH_FAILED: "Authentication failed. Please refresh and try again.",
      }
      const matchedPrefix = Object.keys(errorMessages).find((key) => msg.startsWith(key))
      if (matchedPrefix) {
        toast.error(errorMessages[matchedPrefix])
      } else if (msg.startsWith("GEMINI_ERROR")) {
        toast.error(msg.replace("GEMINI_ERROR: ", "AI error: "))
      } else {
        toast.error(msg || "AI processing failed. Please try again.")
      }
    }
  }, [activeFeature, input, featureSettings, remaining])

  const handleCopy = useCallback(async () => {
    const text = outputRef.current?.textContent || output
    if (text) {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    }
  }, [output])

  const handleDownload = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeFeature}-output.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [output, activeFeature])

  const handleClear = useCallback(() => {
    setInput("")
    setOutput("")
    setOutputHtml(undefined)
  }, [])

  const cancelQueued = useCallback((id: string) => {
    cancelRequest(id)
  }, [])

  return (
    <WorkspaceContext.Provider value={{
      input, setInput, output, setOutput, outputHtml, setOutputHtml,
      processing, activeFeature, setActiveFeature,
      featureSettings, remaining, settingsDefs, registerSettings, updateSetting,
      wordCount, charCount, handleProcess, handleCopy, handleDownload, handleClear,
      outputRef, queueItems, cancelQueued,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
