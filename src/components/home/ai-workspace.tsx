"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, BookOpen, Briefcase, Palette, Code, ArrowRight, CheckCircle2, StickyNote, LayoutGrid, User, FileText, Languages, Search, FileSymlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "writing", label: "Writing", icon: BookOpen },
  { id: "education", label: "Education", icon: Sparkles },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "design", label: "Design", icon: Palette },
  { id: "developers", label: "Developers", icon: Code },
]

const tabFeatures: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[]> = {
  writing: [
    { icon: User, label: "Humanizer", desc: "Make AI text sound natural" },
    { icon: CheckCircle2, label: "Grammar", desc: "Fix grammar and style" },
    { icon: FileSymlink, label: "Summarizer", desc: "Condense long content" },
    { icon: Languages, label: "Translator", desc: "Translate between languages" },
    { icon: FileText, label: "Resume Writer", desc: "Build professional resumes" },
    { icon: StickyNote, label: "Email Writer", desc: "Compose emails fast" },
  ],
  education: [
    { icon: BookOpen, label: "Lesson Planner", desc: "KICD-compliant plans" },
    { icon: FileText, label: "Teacher Comments", desc: "CBC feedback generator" },
    { icon: LayoutGrid, label: "Assessment", desc: "Generate exams & rubrics" },
    { icon: FileText, label: "Report Cards", desc: "Competency report cards" },
    { icon: Search, label: "Scheme of Work", desc: "Termly scheme planning" },
    { icon: CheckCircle2, label: "Grade Calculator", desc: "CBC grade computation" },
  ],
  business: [
    { icon: FileText, label: "Proposal Writer", desc: "Business proposals" },
    { icon: LayoutGrid, label: "Invoice", desc: "Generate invoices" },
    { icon: Briefcase, label: "Business Planner", desc: "Plan & strategize" },
    { icon: Sparkles, label: "Marketing AI", desc: "Campaign copywriting" },
    { icon: FileSymlink, label: "Meeting Notes", desc: "Auto-summarize meetings" },
    { icon: CheckCircle2, label: "Email Assistant", desc: "Professional emails" },
  ],
  design: [
    { icon: Palette, label: "AI Cards", desc: "Design cards with AI" },
    { icon: LayoutGrid, label: "Logo Generator", desc: "AI logo creation" },
    { icon: Sparkles, label: "Brand Kit", desc: "Brand identity tools" },
    { icon: BookOpen, label: "Color Palette", desc: "Smart color schemes" },
    { icon: FileText, label: "Social Graphics", desc: "Social media designs" },
    { icon: StickyNote, label: "Mockups", desc: "Product mockups" },
  ],
  developers: [
    { icon: Code, label: "Code Assistant", desc: "AI code generation" },
    { icon: FileSymlink, label: "JSON Tools", desc: "Format & validate" },
    { icon: Search, label: "Regex Tester", desc: "Test expressions" },
    { icon: Languages, label: "Base64", desc: "Encode & decode" },
    { icon: CheckCircle2, label: "Markdown", desc: "Preview markdown" },
    { icon: FileText, label: "Snippet Manager", desc: "Save code snippets" },
  ],
}

export default function AiWorkspaceSection() {
  const [activeTab, setActiveTab] = useState("writing")

  return (
    <section className="relative py-24 md:py-28 overflow-hidden bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-primary/[0.01] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/[0.05] to-transparent blur-3xl pointer-events-none" />

      <div className="container relative">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            The AI-Powered Workspace
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Your AI Assistant, always ready
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Write, teach, design, code, and create — all powered by AI that runs with your privacy intact.
          </p>
        </motion.div>

        {/* Unified workspace preview card */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/[0.06] bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-primary/5">
          {/* Preview header */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500/60" />
              <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
              <span className="h-2 w-2 rounded-full bg-green-500/60" />
            </div>
            <div className="ml-3 flex-1 rounded-md bg-white/[0.04] px-3 py-1.5">
              <span className="text-[10px] text-muted-foreground/50">AI Workspace — {activeTab}</span>
            </div>
          </div>

          {/* Tab bar inside preview */}
          <div className="flex flex-wrap items-center gap-1 px-4 pt-4 pb-2 border-b border-white/[0.04]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Preview body */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tabFeatures[activeTab]?.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div
                        key={feature.label}
                        className="group rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 mb-2 group-hover:scale-110 transition-transform">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-sm font-medium mb-0.5">{feature.label}</p>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/tools/ai-workspace">
            <Button variant="primary-gradient" size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
              Open AI Workspace
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
