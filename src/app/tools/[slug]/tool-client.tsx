"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Tool } from "@/lib/tools-data"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import AdBanner from "@/components/ads/ad-banner"
import { trackToolOpen } from "@/lib/analytics"

const toolComponents: Record<string, React.ComponentType> = {
  "color-picker": dynamic(() => import("@/tools/color-picker")),
  "lorem-ipsum": dynamic(() => import("@/tools/lorem-ipsum")),
  "favicon-generator": dynamic(() => import("@/tools/favicon-generator")),
  "image-placeholder": dynamic(() => import("@/tools/image-placeholder")),
  "design-cards-studio": dynamic(() => import("@/tools/design-cards-studio/DesignCardsStudio")),
  "qr-generator": dynamic(() => import("@/tools/qr-generator")),
  "qr-scanner": dynamic(() => import("@/tools/qr-scanner")),
  "qr-extractor": dynamic(() => import("@/tools/qr-extractor")),
  "url-shortener": dynamic(() => import("@/tools/url-shortener")),
  notes: dynamic(() => import("@/tools/notes-app")),
  planner: dynamic(() => import("@/tools/todo-list")),
  todo: dynamic(() => import("@/tools/todo-list")),
  pomodoro: dynamic(() => import("@/tools/pomodoro")),
  "day-planner": dynamic(() => import("@/tools/day-planner")),
  kanban: dynamic(() => import("@/tools/kanban-board")),
  stopwatch: dynamic(() => import("@/tools/stopwatch")),
  "habit-tracker": dynamic(() => import("@/tools/habit-tracker")),
  "password-generator": dynamic(() => import("@/tools/password-generator")),
  "text-cleaner": dynamic(() => import("@/tools/text-cleaner")),
  base64: dynamic(() => import("@/tools/base64")),
  "url-encoder": dynamic(() => import("@/tools/url-encoder")),
  "random-generator": dynamic(() => import("@/tools/random-generator")),
  "json-formatter": dynamic(() => import("@/tools/json-formatter")),
  "regex-tester": dynamic(() => import("@/tools/regex-tester")),
  "unit-converter": dynamic(() => import("@/tools/unit-converter")),
  "markdown-preview": dynamic(() => import("@/tools/markdown-preview")),
  "pdf-merger": dynamic(() => import("@/tools/pdf-toolkit")),
  "pdf-splitter": dynamic(() => import("@/tools/pdf-toolkit")),
  "pdf-rotator": dynamic(() => import("@/tools/pdf-toolkit")),
  "pdf-compressor": dynamic(() => import("@/tools/pdf-toolkit")),
  "protect-pdf": dynamic(() => import("@/tools/pdf-toolkit")),
  "unlock-pdf": dynamic(() => import("@/tools/pdf-toolkit")),
  "sign-pdf": dynamic(() => import("@/tools/pdf-toolkit")),
  "pdf-converter": dynamic(() => import("@/tools/pdf-converter")),
  "image-converter": dynamic(() => import("@/tools/image-converter")),
  "document-converter": dynamic(() => import("@/tools/document-converter")),
  "file-compressor": dynamic(() => import("@/tools/file-compressor")),
  "audio-converter": dynamic(() => import("@/tools/audio-converter")),
  "currency-converter": dynamic(() => import("@/tools/currency-converter")),
  "profit-calculator": dynamic(() => import("@/tools/profit-calculator")),
  "loan-calculator": dynamic(() => import("@/tools/loan-calculator")),
  "compound-interest": dynamic(() => import("@/tools/compound-interest")),
  "mortgage-calculator": dynamic(() => import("@/tools/mortgage-calculator")),
  "investment-calculator": dynamic(() => import("@/tools/investment-calculator")),
  "income-tax-calculator": dynamic(() => import("@/tools/income-tax-calculator")),
  "savings-goal-calculator": dynamic(() => import("@/tools/savings-goal-calculator")),
  "retirement-calculator": dynamic(() => import("@/tools/retirement-calculator")),
  "bmi-calculator": dynamic(() => import("@/tools/bmi-calculator")),
  "grade-calculator": dynamic(() => import("@/tools/grade-calculator")),
  "lesson-plan-generator": dynamic(() => import("@/tools/lesson-plan-generator")),
  "scheme-of-work-generator": dynamic(() => import("@/tools/scheme-of-work-generator")),
  "teacher-comment-generator": dynamic(() => import("@/tools/teacher-comment-generator")),
  "revision-planner": dynamic(() => import("@/tools/revision-planner")),
  "exam-generator": dynamic(() => import("@/tools/exam-generator")),
  "blog-generator": dynamic(() => import("@/tools/blog-generator")),
  "ai-workspace": dynamic(() => import("@/tools/ai-workspace")),

  // Network Monitoring Tools
  "speed-test": dynamic(() => import("@/tools/speed-test")),
  "whats-my-ip": dynamic(() => import("@/tools/whats-my-ip")),
  "ip-location": dynamic(() => import("@/tools/ip-location")),
  "ping-test": dynamic(() => import("@/tools/ping-test")),
  "dns-lookup": dynamic(() => import("@/tools/dns-lookup")),

  // Multimedia Tools
  "video-compressor": dynamic(() => import("@/tools/video-compressor")),
  "video-converter": dynamic(() => import("@/tools/video-converter")),
  "video-trimmer": dynamic(() => import("@/tools/video-trimmer")),
  "extract-audio": dynamic(() => import("@/tools/extract-audio")),
  "video-to-gif": dynamic(() => import("@/tools/video-to-gif")),
  "screen-recorder": dynamic(() => import("@/tools/screen-recorder")),
  "merge-videos": dynamic(() => import("@/tools/merge-videos")),
  "video-resizer": dynamic(() => import("@/tools/video-resizer")),
  "subtitle-burner": dynamic(() => import("@/tools/subtitle-burner")),
  "video-thumbnail-generator": dynamic(() => import("@/tools/video-thumbnail-generator")),
}

export default function ToolPageClient({ slug, tool }: { slug: string; tool: Tool }) {
  const router = useRouter()
  const Component = toolComponents[slug]

  useEffect(() => {
    trackToolOpen(tool.slug, tool.category)
  }, [tool])

  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/tools")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </div>
          </div>

          <AdBanner slot="4567890123" format="horizontal" className="mx-auto" />

          <Suspense fallback={<ToolPageSkeleton />}>
            {Component ? <Component /> : <ToolPageSkeleton />}
          </Suspense>

          <AdBanner slot="5678901234" format="responsive" />
        </div>

        <aside className="hidden lg:block w-[160px] flex-shrink-0">
          <div className="sticky top-20">
            <AdBanner slot="6789012345" format="vertical" />
          </div>
        </aside>
      </div>
    </div>
  )
}

function ToolPageSkeleton() {
  return (
    <div className="container py-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-96 bg-muted rounded" />
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  )
}
