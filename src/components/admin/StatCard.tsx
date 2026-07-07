import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; positive: boolean }
  subtitle?: string
  loading?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, subtitle, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5 space-y-3">
        <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
        <div className="h-8 w-32 rounded bg-muted/30 animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <span className={`inline-flex items-center gap-0.5 font-medium ${
            trend.positive ? "text-emerald-500" : "text-red-500"
          }`}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
        {subtitle && <span className="text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  )
}
