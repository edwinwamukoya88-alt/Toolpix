import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export function formatDate(dateString: string, style: "short" | "long" = "short"): string {
  const d = new Date(dateString)
  const month = style === "long" ? MONTHS_FULL[d.getUTCMonth()] : MONTHS[d.getUTCMonth()]
  const day = d.getUTCDate()
  const year = d.getUTCFullYear()
  return style === "long" ? `${month} ${day}, ${year}` : `${month} ${day}, ${year}`
}
