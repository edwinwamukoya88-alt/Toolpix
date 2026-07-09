"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Shield, Lock, Zap, GraduationCap, Users, LayoutGrid, Terminal, Sparkles, Palette, Briefcase, Heart } from "lucide-react"

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1500
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

const stats = [
  { value: 70, suffix: "+", label: "Browser Tools", icon: Zap, gradient: "from-blue-500/20 to-cyan-500/20" },
  { value: 100, suffix: "%", label: "Privacy First", icon: Shield, gradient: "from-emerald-500/20 to-teal-500/20" },
  { value: 0, label: "Accounts Required", icon: Lock, gradient: "from-amber-500/20 to-orange-500/20" },
  { value: 100, suffix: "%", label: "Browser Processing", icon: Zap, gradient: "from-purple-500/20 to-pink-500/20" },
]

const audiences = [
  { icon: GraduationCap, label: "Teachers", desc: "CBC lesson planning & assessment" },
  { icon: Users, label: "Students", desc: "Study tools & revision planners" },
  { icon: Briefcase, label: "Businesses", desc: "Invoicing & proposals" },
  { icon: Terminal, label: "Developers", desc: "Code utilities & network tools" },
  { icon: Palette, label: "Designers", desc: "Creative studio & color tools" },
  { icon: Heart, label: "Privacy-First", desc: "Zero tracking, zero login" },
  { icon: LayoutGrid, label: "Creators", desc: "Content & productivity tools" },
  { icon: Sparkles, label: "Everyone", desc: "Free browser tools for all" },
]

export default function TrustStatsSection() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      <div className="container relative">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-card/80 to-card/40 p-6 text-center overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="flex justify-center mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix || ""} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Built For strip */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-card/40 px-4 py-1.5 text-xs font-medium text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            Built For
          </span>
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {audiences.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-card/40 px-4 py-2 text-sm hover:bg-card/60 hover:border-primary/20 hover:text-foreground transition-all duration-300"
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <span className="hidden sm:inline text-xs text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors">— {item.desc}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
