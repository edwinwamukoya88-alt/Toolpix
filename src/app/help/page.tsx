"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, Wrench, Shield, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  icon: typeof HelpCircle
  title: string
  items: FaqItem[]
}

const sections: FaqSection[] = [
  {
    icon: HelpCircle,
    title: "General",
    items: [
      {
        q: "What is ToolForge?",
        a: "ToolForge is a privacy-first browser utility suite offering 38+ tools for everyday tasks — QR codes, file conversion, image editing, planners, calculators, and more. Everything runs entirely in your browser with no server uploads.",
      },
      {
        q: "Is my data stored?",
        a: "Only on your device. Some tools (like Notes or Todo List) save data locally using your browser's localStorage. This data never leaves your computer and can be cleared at any time via your browser settings.",
      },
      {
        q: "Do I need an account?",
        a: "No. ToolForge requires zero sign-up, no email, and no account. Every tool is fully functional without any authentication.",
      },
    ],
  },
  {
    icon: Wrench,
    title: "Tools Usage",
    items: [
      {
        q: "How do I use the tools?",
        a: "Simply navigate to the tool you need from the All Tools page or browse by category. Each tool has a clean interface — just upload a file, enter text, or adjust settings and the tool works immediately.",
      },
      {
        q: "Why is my file not processing?",
        a: "Most tools have browser compatibility limits. For best results, use the latest version of Chrome, Firefox, or Edge. Large files may take a moment — check that your file format is supported by the specific tool (listed on each tool page).",
      },
      {
        q: "Are the tools free?",
        a: "Yes, all 33+ tools are completely free to use. There are no hidden charges, premium tiers, or usage limits. Some tools with download limits reset daily.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Privacy",
    items: [
      {
        q: "Is my data uploaded?",
        a: "No. ToolForge processes everything entirely in your browser using client-side JavaScript. No files, text, or data you input is ever sent to any server.",
      },
      {
        q: "Is anything stored online?",
        a: "Nothing. We do not have databases, user accounts, or cloud storage. Any data persistence happens only in your browser's local storage and is fully under your control.",
      },
    ],
  },
]

function AccordionItem({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-foreground/80"
      >
        <span className="text-sm font-medium leading-snug">{item.q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<Record<string, number | null>>({})
  const [searchQuery, setSearchQuery] = useState("")

  const toggleItem = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`
    setOpenIndex((prev) => {
      const current = prev[key] ?? -1
      return { ...prev, [key]: current === itemIdx ? null : itemIdx }
    })
  }

  const isOpen = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`
    return openIndex[key] === itemIdx
  }

  const allItems = sections.flatMap((s, si) => s.items.map((item, ii) => ({ ...item, sectionTitle: s.title, si, ii })))

  const filtered = searchQuery.trim()
    ? allItems.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : null

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-12 md:py-16 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground max-w-md mx-auto">Find answers about using ToolForge tools</p>
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {filtered ? (
            filtered.length > 0 ? (
              <div className="rounded-xl border bg-background p-6 space-y-1">
                <p className="text-xs text-muted-foreground mb-3">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                </p>
                {filtered.map((item, i) => (
                  <AccordionItem
                    key={`search-${i}`}
                    item={{ q: item.q, a: item.a }}
                    open={isOpen(-1, i)}
                    onToggle={() => toggleItem(-1, i)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{searchQuery}&rdquo;. Try a different search term.
              </div>
            )
          ) : (
            sections.map((section, si) => {
              const Icon = section.icon
              return (
                <div key={section.title}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                  </div>
                  <div className="rounded-xl border bg-background p-6">
                    {section.items.map((item, ii) => (
                      <AccordionItem
                        key={ii}
                        item={item}
                        open={isOpen(si, ii)}
                        onToggle={() => toggleItem(si, ii)}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          )}

          <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-2">
            <p className="text-sm font-medium">Still have questions?</p>
            <p className="text-sm text-muted-foreground">
              Try searching above or explore the{" "}
              <Link href="/tools" className="text-primary underline-offset-4 hover:underline">
                tools directory
              </Link>{" "}
              for specific tool guides.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
