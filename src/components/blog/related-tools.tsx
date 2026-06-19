import Link from "next/link"
import { tools } from "@/lib/tools-data"
import { ArrowRight } from "lucide-react"

interface RelatedToolsProps {
  toolSlugs: string[]
}

const iconMap: Record<string, string> = {
  "grade-calculator": "Percent",
  "exam-generator": "FileSpreadsheet",
  "teacher-comment-generator": "MessageSquare",
  "lesson-plan-generator": "BookOpen",
  "scheme-of-work-generator": "ClipboardList",
  "revision-planner": "CalendarDays",
  "pomodoro": "Timer",
  "password-generator": "Key",
  "qr-scanner": "Scan",
  "kanban": "Columns3",
  "day-planner": "Calendar",
  "todo": "CheckSquare",
  "notes": "StickyNote",
}

export default function RelatedTools({ toolSlugs }: RelatedToolsProps) {
  const relatedTools = tools.filter((t) => toolSlugs.includes(t.slug))

  if (relatedTools.length === 0) return null

  return (
    <section className="rounded-xl border bg-background/40 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold">Related Tools</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Try these ToolForge tools mentioned in this article</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {relatedTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="text-xs font-bold">{tool.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium group-hover:text-primary transition-colors truncate">{tool.name}</div>
              <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  )
}
