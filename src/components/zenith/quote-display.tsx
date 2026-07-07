"use client"

import { useState, useEffect, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The ability to concentrate and to use your time well is everything.", author: "Lee Iacocca" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Work expands so as to fill the time available for its completion.", author: "Parkinson's Law" },
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
  { text: "The most important thing is to keep the most important thing the most important thing.", author: "Stephen Covey" },
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "Concentration is the secret of strength.", author: "Ralph Waldo Emerson" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "It is those who concentrate on but one thing at a time who advance in this world.", author: "Og Mandino" },
]

interface QuoteDisplayProps {
  className?: string
  sessionCount?: number
}

function QuoteDisplay({ className = "", sessionCount = 0 }: QuoteDisplayProps) {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => {
    if (sessionCount > 0) {
      const id = requestAnimationFrame(() => {
        setQuoteIndex((sessionCount + Math.floor(Date.now() / 86400000)) % QUOTES.length)
      })
      return () => cancelAnimationFrame(id)
    }
  }, [sessionCount])

  const quote = QUOTES[quoteIndex % QUOTES.length]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={cn("rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/30 to-slate-950/30 p-5", className)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3"
        >
          <Quote className="h-5 w-5 text-indigo-400/40 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-indigo-200/80 leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-xs text-indigo-300/50 mt-2">&mdash; {quote.author}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default memo(QuoteDisplay)
