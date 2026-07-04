import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Palette, TextQuote, Image, Frame, QrCode, Scan, ImageDown, Link as LinkIcon, StickyNote, CheckSquare, Timer, Calendar, Columns3, Clock, Target, Key, Mail, Eraser, FileCode, Link2, Shuffle, Braces, Regex, Ruler, FileText, File, ImagePlus, FileArchive, Music, DollarSign, TrendingUp, Landmark, Percent, BookOpen, ClipboardList, MessageSquare, CalendarDays, FileSpreadsheet, GraduationCap, Film, Clapperboard, Scissors, Camera, Layers, Crop, Subtitles, Box, Gauge, Globe, MapPin, Activity, Server } from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette, TextQuote, Image, Frame, QrCode, Scan, ImageDown, Link: LinkIcon,
  StickyNote, CheckSquare, Timer, Calendar, Columns3, Clock, Target,
  Key, Mail, Eraser, FileCode, Link2, Shuffle, Braces, Regex, Ruler, FileText,
  File, ImagePlus, FileArchive, Music, DollarSign, TrendingUp, Landmark,
  Percent, BookOpen, ClipboardList, MessageSquare, CalendarDays, FileSpreadsheet,
  Film, Clapperboard, Scissors, Camera, Layers, Crop, Subtitles,
  Gauge, Globe, MapPin, Activity, Server,
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

const gradientMap: Record<string, string> = {
  Productivity: "from-blue-500/20 to-cyan-500/20",
  "Education & CBC Tools": "from-emerald-500/20 to-teal-500/20",
  "Security & Text": "from-purple-500/20 to-pink-500/20",
  "QR & Connectivity": "from-orange-500/20 to-amber-500/20",
  "File Conversion": "from-indigo-500/20 to-blue-500/20",
  "Developer Tools": "from-sky-500/20 to-indigo-500/20",
  "Design & Creative": "from-rose-500/20 to-pink-500/20",
  "Essential Calculators": "from-green-500/20 to-emerald-500/20",
  "Network Monitoring": "from-cyan-500/20 to-blue-500/20",
  Multimedia: "from-violet-500/20 to-purple-500/20",
}

const iconColorMap: Record<string, string> = {
  Productivity: "text-blue-400",
  "Education & CBC Tools": "text-emerald-400",
  "Security & Text": "text-purple-400",
  "QR & Connectivity": "text-orange-400",
  "File Conversion": "text-indigo-400",
  "Developer Tools": "text-sky-400",
  "Design & Creative": "text-rose-400",
  "Essential Calculators": "text-green-400",
  "Network Monitoring": "text-cyan-400",
  Multimedia: "text-violet-400",
}

export default function ToolCard({ slug, name, description, icon, badge }: ToolCardProps) {
  const Icon = iconMap[icon] || Box

  return (
    <Link
      href={`/tools/${slug}`}
      className="group relative flex flex-col gap-3 rounded-2xl border bg-card/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
          "bg-gradient-to-br from-primary/20 to-primary/5",
        )}>
          <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
        <Badge variant="secondary" className={cn("text-[10px] font-medium", badgeColors[badge])}>
          {badge}
        </Badge>
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}
