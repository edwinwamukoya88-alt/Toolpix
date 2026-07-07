interface StatusBadgeProps {
  status: string
  variant?: "default" | "success" | "warning" | "danger" | "info"
}

const variantStyles: Record<string, string> = {
  default: "bg-muted text-muted-foreground border-border/50",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        variantStyles[variant] ?? variantStyles.default
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        variant === "success" ? "bg-emerald-400" :
        variant === "warning" ? "bg-amber-400" :
        variant === "danger" ? "bg-red-400" :
        variant === "info" ? "bg-blue-400" :
        "bg-muted-foreground"
      }`} />
      {status}
    </span>
  )
}
