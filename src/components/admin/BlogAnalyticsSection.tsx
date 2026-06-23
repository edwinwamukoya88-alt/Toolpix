import { FileText } from "lucide-react"
import type { BlogAnalyticsData } from "@/lib/ga4-mock"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function engagementBadge(bounceRate: number) {
  if (bounceRate < 30) return { label: "Excellent", color: "text-green-500", dot: "bg-green-500" }
  if (bounceRate < 40) return { label: "Good", color: "text-yellow-500", dot: "bg-yellow-500" }
  return { label: "Needs Work", color: "text-red-500", dot: "bg-red-500" }
}

export default function BlogAnalyticsSection({
  data,
}: {
  data: BlogAnalyticsData[]
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-background/40 p-6 text-center text-sm text-muted-foreground">
        No blog analytics data available yet.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-background/40 p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Blog SEO Analytics</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Top blog posts by page views and engagement
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="text-left font-medium pb-2 pl-0">Post</th>
              <th className="text-right font-medium pb-2 pr-0">Views</th>
              <th className="text-right font-medium pb-2 pr-0">Avg Time</th>
              <th className="text-right font-medium pb-2 pr-0">Bounce</th>
              <th className="text-right font-medium pb-2 pr-0">Engagement</th>
            </tr>
          </thead>
          <tbody>
            {data.map((post) => {
              const badge = engagementBadge(post.bounceRate)
              return (
                <tr
                  key={post.slug}
                  className="border-b border-muted/50 last:border-0"
                >
                  <td className="py-3 pl-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate max-w-[200px] font-medium">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums pr-0">
                    {post.views.toLocaleString()}
                  </td>
                  <td className="py-3 text-right tabular-nums text-muted-foreground pr-0">
                    {formatTime(post.avgTimeOnPage)}
                  </td>
                  <td className="py-3 text-right tabular-nums pr-0">
                    {post.bounceRate}%
                  </td>
                  <td className="py-3 text-right pr-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${badge.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
