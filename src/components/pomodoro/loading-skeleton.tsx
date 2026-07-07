export function InsightCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-center justify-between mb-3">
        <div className="h-9 w-9 rounded-xl bg-muted" />
        <div className="h-4 w-12 rounded bg-muted" />
      </div>
      <div className="h-8 w-24 rounded bg-muted mb-2" />
      <div className="h-3 w-20 rounded bg-muted mb-3" />
      <div className="h-1 w-full rounded-full bg-muted" />
    </div>
  )
}

export function DashboardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6" aria-label="Loading analytics" role="status">
      <div className="h-8 w-48 rounded bg-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
