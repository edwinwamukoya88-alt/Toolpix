"use client"

import { useState } from "react"
import {
  Sparkles, FileText, Search, List, MessageSquare, Lightbulb,
  FileEdit, Hash, BookOpen, Code, ArrowRight,
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs"

interface AITool {
  id: string
  name: string
  description: string
  icon: typeof Sparkles
  iconColor: string
}

const aiTools: AITool[] = [
  { id: "blog-generator", name: "Blog Post Generator", description: "Generate a complete SEO-optimized blog post from a title", icon: FileText, iconColor: "text-blue-400" },
  { id: "seo-optimizer", name: "SEO Optimizer", description: "Optimize your content for search engines", icon: Search, iconColor: "text-emerald-400" },
  { id: "meta-generator", name: "Meta Description Generator", description: "Generate compelling meta descriptions", icon: List, iconColor: "text-amber-400" },
  { id: "faq-generator", name: "FAQ Generator", description: "Generate FAQ sections from your content", icon: MessageSquare, iconColor: "text-purple-400" },
  { id: "headline-generator", name: "Headline Generator", description: "Generate engaging headlines for your articles", icon: Lightbulb, iconColor: "text-rose-400" },
  { id: "content-improver", name: "Content Improver", description: "Rewrite and improve existing content", icon: FileEdit, iconColor: "text-cyan-400" },
  { id: "keyword-density", name: "Keyword Density Checker", description: "Analyze keyword usage in your content", icon: Hash, iconColor: "text-orange-400" },
  { id: "readability", name: "Readability Score", description: "Check the readability score of your content", icon: BookOpen, iconColor: "text-indigo-400" },
  { id: "schema-generator", name: "Schema Generator", description: "Generate structured data markup", icon: Code, iconColor: "text-teal-400" },
]

export default function AdminAIPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [generating, setGenerating] = useState(false)

  async function handleGenerate() {
    if (!input.trim()) return
    setGenerating(true)
    // Simulated AI generation for now
    await new Promise((r) => setTimeout(r, 1500))
    const toolName = aiTools.find((t) => t.id === selectedTool)?.name ?? "AI Tool"
    setOutput(`# ${toolName} Output\n\nThis is a simulated response for: "${input}".\n\nThe AI Content Studio will generate real content once connected to an AI provider (e.g., OpenAI, Anthropic).\n\n## Features coming:\n- Real-time AI generation\n- Content templates\n- Batch processing\n- Export to MDX\n- SEO analysis`)
    setGenerating(false)
  }

  return (
    <div className="container py-6 md:py-8">
      <AdminBreadcrumbs />

      <PageHeader
        title="AI Content Studio"
        description="AI-powered tools for content creation and optimization"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tools</h2>
          {aiTools.map((tool) => {
            const Icon = tool.icon
            const isSelected = selectedTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool.id); setOutput("") }}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card hover:bg-muted/50"
                }`}
              >
                <div className={`h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center ${tool.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{tool.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedTool ? (
            <>
              <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">
                  {aiTools.find((t) => t.id === selectedTool)?.name}
                </h3>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedTool === "blog-generator" ? "Enter blog post title..." : "Enter your content or prompt..."}
                  rows={6}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{input.length} characters</span>
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !input.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {generating ? (
                      <>Generating...</>
                    ) : (
                      <>
                        Generate
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {output && (
                <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Output</h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(output)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="rounded-lg bg-background p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {output}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card p-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold">Select an AI Tool</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Choose a tool from the left sidebar to start generating content. Each tool is designed for a specific content creation task.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
