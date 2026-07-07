"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  q: string
  a: string
}

export default function FaqSection({ items, title = "Frequently Asked Questions" }: { items: FaqItem[]; title?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => {
          const isOpen = openIndex === i
          return (
            <div key={i} className="rounded-lg border bg-card">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left hover:bg-muted/50 transition-colors rounded-lg"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed border-t pt-3">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
