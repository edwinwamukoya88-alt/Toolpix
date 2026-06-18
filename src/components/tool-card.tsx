import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Palette, TextQuote, Image, Frame, QrCode, Scan, ImageDown, Link as LinkIcon, StickyNote, CheckSquare, Timer, Calendar, Columns3, Clock, Target, Key, Mail, Eraser, FileCode, Link2, Shuffle, Braces, Regex, Ruler, FileText, File, ImagePlus, FileArchive, Music, DollarSign, TrendingUp, Landmark, Percent, BookOpen, ClipboardList, MessageSquare, CalendarDays, FileSpreadsheet, GraduationCap, Box } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, TextQuote, Image, Frame, QrCode, Scan, ImageDown, Link: LinkIcon,
  StickyNote, CheckSquare, Timer, Calendar, Columns3, Clock, Target,
  Key, Mail, Eraser, FileCode, Link2, Shuffle, Braces, Regex, Ruler, FileText,
  File, ImagePlus, FileArchive, Music, DollarSign, TrendingUp, Landmark,
  Percent, BookOpen, ClipboardList, MessageSquare, CalendarDays, FileSpreadsheet,
}

interface ToolCardProps {
  slug: string
  name: string
  description: string
  icon: string
  badge: string
}

const badgeColors: Record<string, string> = {
  Free: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Fast: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Secure: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
}

export default function ToolCard({ slug, name, description, icon, badge }: ToolCardProps) {
  const Icon = iconMap[icon] || Box

  return (
    <Link
      href={`/tools/${slug}`}
      className="group relative flex flex-col gap-3 rounded-xl border p-5 transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="secondary" className={cn("text-[10px] font-medium", badgeColors[badge])}>
          {badge}
        </Badge>
      </div>
      <div>
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      </div>
    </Link>
  )
}
