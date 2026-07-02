export default function ToolsLoading() {
  return (
    <div className="container py-8 space-y-8">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3 animate-pulse">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
