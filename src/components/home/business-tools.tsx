"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileText, Briefcase, Sparkles, Calculator, StickyNote, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  { icon: FileText, label: "Invoice Generator", desc: "Create professional invoices", href: "/tools/invoice-generator" },
  { icon: Briefcase, label: "Business Planner", desc: "Plan and strategize growth", href: "/tools/planner" },
  { icon: Sparkles, label: "Proposal Writer", desc: "AI-powered proposals", href: "/tools/ai-workspace" },
  { icon: Sparkles, label: "Marketing AI", desc: "Campaign copywriting", href: "/tools/ai-workspace" },
  { icon: Calculator, label: "Business Calculator", desc: "Profit, loan, investment", href: "/tools?category=Essential+Calculators" },
  { icon: StickyNote, label: "Meeting Notes", desc: "Organize meeting notes", href: "/tools/notes" },
  { icon: Mail, label: "Email Assistant", desc: "Professional emails", href: "/tools/ai-workspace" },
]

export default function BusinessToolsSection() {
  return (
    <section className="relative py-24 md:py-28 bg-grid">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {tools.map((tool, i) => {
                const Icon = tool.icon
                return (
                  <motion.div
                    key={tool.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <Link
                      href={tool.href}
                      className="group flex flex-col gap-2 rounded-xl border border-white/[0.04] bg-card/40 p-4 hover:bg-card/60 hover:border-amber-500/20 transition-all duration-300"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/10 group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-amber-400 transition-colors">{tool.label}</p>
                        <p className="text-xs text-muted-foreground">{tool.desc}</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Business Tools
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              From invoicing to AI-powered proposals, run your business smarter with tools designed for entrepreneurs and teams.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/tools?category=Essential+Calculators">
                <Button variant="primary-gradient" size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
                  Explore Business Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "10+", label: "Business Tools" },
                { value: "100%", label: "Free to Use" },
                { value: "0", label: "Accounts Needed" },
              ].map((stat) => (
                <div key={stat.label} className="text-center rounded-xl border border-white/[0.04] bg-card/30 p-4">
                  <div className="text-xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
