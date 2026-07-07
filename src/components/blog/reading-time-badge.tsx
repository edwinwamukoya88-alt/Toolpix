import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReadingTimeBadgeProps {
  minutes: number
  className?: string
}

export default function ReadingTimeBadge({ minutes, className }: ReadingTimeBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <Clock className="h-3 w-3" />
      {minutes} min read
    </span>
  )
}
