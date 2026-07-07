import { cn } from "@/lib/utils"
import { getBlogCategoryStyle } from "@/lib/blog-og-config"

interface CategoryBadgeProps {
  category: string
  className?: string
  showIcon?: boolean
}

export default function CategoryBadge({ category, className, showIcon = false }: CategoryBadgeProps) {
  const style = getBlogCategoryStyle(category)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] md:text-xs font-medium backdrop-blur-sm",
        className,
      )}
      style={{
        backgroundColor: `${style.bg}20`,
        borderColor: `${style.accent}40`,
        color: style.accent,
      }}
    >
      {showIcon && <span>{style.icon}</span>}
      {category}
    </span>
  )
}
