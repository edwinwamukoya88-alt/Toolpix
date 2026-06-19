import { deserializeCover } from "@/lib/blog-types"
import { cn } from "@/lib/utils"

const legacyGradients: Record<string, string> = {
  "gradient-1": "from-blue-600/20 via-purple-600/10 to-cyan-600/20",
  "gradient-2": "from-emerald-600/20 via-teal-600/10 to-green-600/20",
  "gradient-3": "from-orange-600/20 via-amber-600/10 to-yellow-600/20",
  "gradient-4": "from-pink-600/20 via-rose-600/10 to-red-600/20",
  "gradient-5": "from-indigo-600/20 via-violet-600/10 to-blue-600/20",
  "gradient-6": "from-slate-600/20 via-gray-600/10 to-zinc-600/20",
}

const legacyIcons: Record<string, string> = {
  "gradient-1": "📘",
  "gradient-2": "⚡",
  "gradient-3": "🔐",
  "gradient-4": "🎨",
  "gradient-5": "📄",
  "gradient-6": "📁",
}

const legacyLabels: Record<string, string> = {
  "gradient-1": "CBC Education",
  "gradient-2": "Productivity",
  "gradient-3": "Security",
  "gradient-4": "Design",
  "gradient-5": "Guide",
  "gradient-6": "File Tools",
}

const styleGradients: Record<string, string> = {
  "green-500,blue-600": "from-green-500/30 to-blue-600/30",
  "purple-500,orange-500": "from-purple-500/30 to-orange-500/30",
  "blue-800,black": "from-blue-800/30 to-black/30",
  "gray-700,blue-600": "from-gray-700/30 to-blue-600/30",
  "green-600,yellow-600": "from-green-600/30 to-yellow-600/30",
  "pink-500,purple-500": "from-pink-500/30 to-purple-500/30",
  "teal-500,indigo-600": "from-teal-500/30 to-indigo-600/30",
  "gray-500,blue-500": "from-gray-500/30 to-blue-500/30",
}

interface BlogCoverImageProps {
  coverImage: string
  title?: string
  className?: string
  size?: "card" | "featured" | "article"
}

export default function BlogCoverImage({ coverImage, title, className, size = "card" }: BlogCoverImageProps) {
  const parsed = deserializeCover(coverImage)

  if (parsed) {
    const gradientKey = `${parsed.gradient[0]},${parsed.gradient[1]}`
    const gradientClass = styleGradients[gradientKey] || styleGradients["gray-500,blue-500"]

    const heightClass = size === "article" ? "h-48 md:h-64 rounded-2xl" :
      size === "featured" ? "h-56 md:h-auto rounded-2xl" :
      "h-48 rounded-xl"

    return (
      <div className={cn("relative flex items-center justify-center overflow-hidden", heightClass, className)}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradientClass)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="relative flex flex-col items-center gap-3 z-10">
          <span className="text-5xl md:text-6xl">{parsed.icon}</span>
          {title && (
            <span className={cn(
              "text-center px-4 leading-tight",
              size === "article" ? "text-lg md:text-xl font-bold max-w-lg" :
              size === "featured" ? "text-base font-semibold max-w-sm" :
              "text-xs text-muted-foreground max-w-[90%] truncate"
            )}>
              {title}
            </span>
          )}
        </div>
        <div className={cn("absolute", size === "article" ? "top-4 left-4" : "bottom-4 left-4")}>
          <span className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {parsed.label}
          </span>
        </div>
      </div>
    )
  }

  const gradient = legacyGradients[coverImage]
  if (gradient) {
    const heightClass = size === "article" ? "h-48 md:h-64 rounded-2xl" :
      size === "featured" ? "h-56 md:h-auto rounded-2xl" :
      "h-48 rounded-xl"

    return (
      <div className={cn("relative flex items-center justify-center overflow-hidden", heightClass, className)}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        <div className="relative flex flex-col items-center gap-2 z-10">
          <span className="text-4xl md:text-5xl">{legacyIcons[coverImage] || "📄"}</span>
          {size !== "card" && title && (
            <span className="text-xs text-muted-foreground max-w-[80%] text-center truncate">{title}</span>
          )}
        </div>
        <div className={cn("absolute", size === "article" ? "top-4 left-4" : "bottom-4 left-4")}>
          <span className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {legacyLabels[coverImage] || "Guide"}
          </span>
        </div>
      </div>
    )
  }

  return null
}
