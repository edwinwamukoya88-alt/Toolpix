"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"

interface CustomFieldInputProps {
  label: string
  onAdd: (value: string) => void
  placeholder?: string
  align?: "left" | "center"
}

export function CustomFieldInput({ label, onAdd, placeholder, align = "left" }: CustomFieldInputProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue("")
    setOpen(false)
  }

  return (
    <div className={`${align === "center" ? "text-center" : ""}`}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Custom {label}
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-1.5"
          >
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder || `Enter custom ${label.toLowerCase()}...`}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd() } }}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!value.trim()}
              className="shrink-0 rounded-lg px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); setValue("") }}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
