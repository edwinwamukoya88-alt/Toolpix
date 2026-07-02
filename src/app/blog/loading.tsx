export default function BlogLoading() {
  return (
    <div className="container py-8 space-y-8">
      <div className="h-10 w-64 bg-muted rounded animate-pulse mx-auto" />
      <div className="h-5 w-96 bg-muted rounded animate-pulse mx-auto" />
      <div className="h-64 bg-muted rounded-xl animate-pulse mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-5 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
