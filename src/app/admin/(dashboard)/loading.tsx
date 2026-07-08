export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
            <div className="h-8 w-24 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-1 w-full rounded-full bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  )
}
