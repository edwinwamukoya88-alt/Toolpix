"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [local, setLocal] = useState(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => { onChangeRef.current = onChange })
  useEffect(() => {
    const timer = setTimeout(() => onChangeRef.current(local), 200)
    return () => clearTimeout(timer)
  }, [local])

  useEffect(() => {
    if (value !== local) {
      const id = requestAnimationFrame(() => setLocal(value))
      return () => cancelAnimationFrame(id)
    }
  }, [value, local])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder || "Search tools..."}
        className="pl-9 h-11"
        aria-label={placeholder || "Search tools"}
      />
    </div>
  )
}
