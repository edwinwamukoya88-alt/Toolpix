import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ProductAnalyticsCardProps {
  icon: LucideIcon
  label: string
  value: string
  subtext?: string
  trend?: { direction: "up" | "down"; value: string }
  highlight?: boolean
}

export default function ProductAnalyticsCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
  highlight,
}: ProductAnalyticsCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 space-y-2 transition-all ${
        highlight
          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
          : "bg-background/40"
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && (
        <div className="text-xs text-muted-foreground">{subtext}</div>
      )}
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={
              trend.direction === "up" ? "text-green-500" : "text-red-500"
            }
          >
            {trend.value}
          </span>
        </div>
      )}
    </div>
  )
}
