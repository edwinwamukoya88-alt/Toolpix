export default function ToolLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted" />
            <div>
              <div className="h-7 w-48 bg-muted rounded" />
              <div className="h-4 w-96 bg-muted rounded mt-2" />
            </div>
          </div>
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
        <aside className="hidden lg:block w-[160px] flex-shrink-0">
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </aside>
      </div>
    </div>
  )
}
