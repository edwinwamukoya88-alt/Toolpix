"use client"

import { useMemo } from "react"

interface SparklineChartProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
  showArea?: boolean
  ariaLabel?: string
}

export default function SparklineChart({
  data,
  color = "hsl(var(--primary))",
  width = 80,
  height = 32,
  className = "",
  showArea = false,
  ariaLabel = "Trend sparkline",
}: SparklineChartProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return ""
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: height - ((v - min) / range) * height,
    }))
    const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")

    if (showArea && points.length > 0) {
      const bottom = `L${points[points.length - 1].x.toFixed(1)},${height} L${points[0].x.toFixed(1)},${height} Z`
      return { line, area: `${line} ${bottom}` }
    }

    return { line, area: null }
  }, [data, width, height, showArea])

  if (!pathData || data.length < 2) {
    return <div className={`w-${width} h-${height} ${className}`} aria-hidden="true" />
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`${className}`}
      style={{ width, height }}
      aria-label={ariaLabel}
      role="img"
    >
      {showArea && pathData.area && (
        <path d={pathData.area} fill={`${color}15`} />
      )}
      <path
        d={pathData.line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
