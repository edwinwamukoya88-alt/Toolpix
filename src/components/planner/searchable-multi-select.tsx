"use client"

import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Check, X, Plus } from "lucide-react"

interface SearchableMultiSelectProps {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  allowCustom?: boolean
  customPlaceholder?: string
  description?: string
}

export function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = "Type to search...",
  allowCustom = false,
  customPlaceholder = "Add custom item...",
  description,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [customValue, setCustomValue] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, search])

  const toggleOption = useCallback((option: string) => {
    const next = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option]
    onChange(next)
  }, [selected, onChange])

  const addCustom = useCallback(() => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    if (!selected.includes(trimmed)) {
      onChange([...selected, trimmed])
    }
    setCustomValue("")
    setSearch("")
  }, [customValue, selected, onChange])

  const removeChip = useCallback((item: string) => {
    onChange(selected.filter((s) => s !== item))
  }, [selected, onChange])

  return (
    <div className="space-y-1.5" ref={ref}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {description && <p className="text-[9px] text-muted-foreground/60 -mt-0.5">{description}</p>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-1.5 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm text-left min-h-11 transition-all hover:bg-muted/30 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-xs">Select {label.toLowerCase()}...</span>
            ) : (
              selected.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-medium max-w-[150px]"
                >
                  <span className="truncate">{item}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${item}`}
                    onClick={(e) => { e.stopPropagation(); removeChip(item) }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); removeChip(item) } }}
                    className="shrink-0 hover:text-primary/60 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/60 bg-popover shadow-xl overflow-hidden"
            >
              <div className="p-2.5 border-b border-border/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/50"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5">
                {filtered.length === 0 && !allowCustom && (
                  <p className="px-2 py-3 text-xs text-muted-foreground text-center">No options found</p>
                )}
                {filtered.map((option, i) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.15 }}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs hover:bg-accent/50 transition-colors text-left"
                  >
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
                      selected.includes(option)
                        ? "bg-primary border-primary text-primary-foreground scale-110"
                        : "border-border"
                    }`}>
                      {selected.includes(option) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <Check className="h-2.5 w-2.5" />
                        </motion.span>
                      )}
                    </span>
                    <span className="truncate">{option}</span>
                  </motion.button>
                ))}
                {allowCustom && search && (
                  <div className="border-t border-border/40 mt-1.5 pt-1.5">
                    <div className="flex items-center gap-1.5 px-2">
                      <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder={customPlaceholder}
                        className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs outline-none focus:border-ring"
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
                      />
                      <button
                        type="button"
                        onClick={addCustom}
                        className="shrink-0 rounded-lg p-1.5 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
