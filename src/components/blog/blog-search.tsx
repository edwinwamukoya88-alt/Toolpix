"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
}

export default function BlogSearch({ value, onChange }: BlogSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles..."
        className="pl-9 h-11"
      />
    </div>
  )
}
