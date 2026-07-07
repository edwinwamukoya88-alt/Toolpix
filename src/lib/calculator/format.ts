export function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B"
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M"
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K"
  return fmt(n)
}

export function fmtPercent(n: number): string {
  return n.toFixed(1) + "%"
}

export function fmtCurrency(n: number): string {
  if (n >= 0) return "$" + fmtCompact(n)
  return "-$" + fmtCompact(Math.abs(n))
}

export function parseNum(val: string): number {
  return Math.max(0, Number(val) || 0)
}
