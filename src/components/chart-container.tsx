"use client"

import { useState, useEffect, useRef } from "react"
import { ResponsiveContainer } from "recharts"

interface ChartContainerProps {
  children: React.ReactElement
  height?: number
  width?: number
}

export default function ChartContainer({
  children,
  height = 300,
  width,
}: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const check = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        setReady(true)
      }
    }

    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        width: width ?? "100%",
        height,
        minHeight: height,
        minWidth: 0,
        position: "relative",
        flex: "1 1 auto",
      }}
    >
      {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : (
        <div
          className="rounded-xl bg-muted/50 animate-pulse"
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  )
}
