"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

const testimonials = [
  {
    quote: "The CBC Lesson Planner saves me hours every week. I can generate complete lesson plans with competencies and PCIs in minutes. Game-changer for Kenyan teachers.",
    name: "Grace Wanjiku",
    role: "Primary School Teacher",
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    quote: "I use the Pomodoro timer and Kanban board daily for my revision schedule. Having everything in one place without creating accounts is amazing.",
    name: "Kevin Otieno",
    role: "University Student",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
  },
  {
    quote: "The JSON formatter, regex tester, and Base64 encoder are always open in my tabs. Fast, private, and no sign-up. Exactly what developers need.",
    name: "Sarah Kimani",
    role: "Software Developer",
    gradient: "from-sky-500/20 to-indigo-500/10",
    border: "border-sky-500/20",
  },
  {
    quote: "From invoice generation to AI-powered proposals — Zilita helps me run my freelance business without costly subscriptions. The privacy-first approach sealed it.",
    name: "James Mwangi",
    role: "Freelance Business Consultant",
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-28 bg-grid-sm">
      <div className="container">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Trusted by users worldwide
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            From classrooms to boardrooms — see what our community says about Zilita.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div
                className={cn(
                  "group relative rounded-2xl border bg-card/40 p-6 md:p-8",
                  "transition-all duration-500 hover:-translate-y-1 hover:shadow-xl",
                  t.border
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl",
                  t.gradient
                )} />
                <div className="relative">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                      t.gradient
                    )}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
