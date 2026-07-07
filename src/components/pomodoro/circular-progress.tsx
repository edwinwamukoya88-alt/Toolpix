"use client"

import { useState, useEffect, useRef } from "react"

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  className?: string
  showLabel?: boolean
  label?: string
  children?: React.ReactNode
}

export default function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  trackColor = "hsl(var(--muted))",
  className = "",
  showLabel = true,
  label,
  children,
}: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const frameRef = useRef<number>(0)
  const prefersReduced = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
  }, [])

  useEffect(() => {
    if (prefersReduced.current) {
      setAnimatedValue(value)
      return
    }
    const startTime = performance.now()
    const duration = 800

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedValue(value * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedValue / 100) * circumference
  const center = size / 2

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${Math.round(value)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children ?? (
            <span className="text-lg font-bold tabular-nums">
              {Math.round(animatedValue)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}
