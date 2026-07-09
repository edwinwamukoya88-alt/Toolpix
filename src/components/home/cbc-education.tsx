"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, ClipboardList, FileSpreadsheet, FileText, CalendarDays, Percent, Target, Heart, ShieldCheck, ArrowRight, CheckCircle2, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tools = [
  { icon: BookOpen, label: "Lesson Planner", desc: "KICD-compliant lesson plans", href: "/tools/lesson-plan-generator" },
  { icon: ClipboardList, label: "Assessment", desc: "Performance-based assessments", href: "/tools/exam-generator" },
  { icon: FileSpreadsheet, label: "Report Cards", desc: "Competency-based report cards", href: "/tools/exam-generator" },
  { icon: FileText, label: "CBC Comments", desc: "CBC aligned teacher comments", href: "/tools/teacher-comment-generator" },
  { icon: FileText, label: "Rubrics", desc: "Skill-based rubrics & scoring guides", href: "/tools/teacher-comment-generator" },
  { icon: CalendarDays, label: "Schemes of Work", desc: "Termly scheme planning", href: "/tools/scheme-of-work-generator" },
  { icon: Percent, label: "Grade Calculator", desc: "CBC grade computation", href: "/tools/grade-calculator" },
  { icon: Target, label: "Learning Outcomes", desc: "Outcome-based planning", href: "/tools/lesson-plan-generator" },
  { icon: Heart, label: "PCIs", desc: "Pertinent issues integration", href: "/tools/lesson-plan-generator" },
  { icon: Award, label: "Competencies", desc: "Core competency mapping", href: "/tools/exam-generator" },
]

export default function CbcEducationSection() {
  return (
    <section className="relative py-24 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-transparent" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <motion.div
            className="lg:col-span-2 lg:sticky lg:top-28"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-1.5 text-xs font-medium text-emerald-400 mb-6">
              <GraduationCap className="h-3.5 w-3.5" />
              For Teachers & Schools
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              CBC Education Toolkit
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Everything Kenyan teachers need for Competency-Based Curriculum planning, assessment, and reporting — fully aligned to KICD standards.
            </p>

            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-2.5 mb-8">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">KICD Aligned</span>
            </div>

            <div className="space-y-3 mb-8">
              {[
                "Generate complete lesson plans with competencies and PCIs",
                "Create performance-based assessments (projects, tasks, observations)",
                "Produce competency report cards with detailed teacher comments",
                "Plan termly schemes of work with inquiry-based learning",
                "Calculate CBC grades with EE/ME/AE/BE competency levels",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <Link href="/tools?category=Education+%26+CBC+Tools">
              <Button size="lg" className="gap-2 h-12 px-8 text-base rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                Explore CBC Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tools.map((tool, i) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  >
                    <Link
                      href={tool.href}
                      className="group flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-card/40 p-4 hover:bg-card/60 hover:border-emerald-500/20 transition-all duration-300"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-emerald-400 transition-colors">{tool.label}</p>
                        <p className="text-xs text-muted-foreground">{tool.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function GraduationCap(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
    </svg>
  )
}
