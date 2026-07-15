"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sparkles, GraduationCap, Brain, Terminal, Palette, LayoutGrid, FileSymlink, Shield, Wifi, Calculator, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  { icon: Sparkles, title: "AI Workspace", desc: "Write, create, design, and code with AI — all in your browser with zero data leaving your device.", href: "/tools/ai-workspace", gradient: "from-indigo-500/20 via-purple-500/10 to-transparent", iconColor: "from-indigo-400 to-purple-400" },
  { icon: GraduationCap, title: "CBC Education", desc: "Lesson plans, assessments, report cards, rubrics, and schemes of work aligned to KICD standards.", href: "/tools?category=Education+%26+CBC+Tools", gradient: "from-emerald-500/20 via-teal-500/10 to-transparent", iconColor: "from-emerald-400 to-teal-400" },
  { icon: Brain, title: "Productivity", desc: "Pomodoro, Kanban, notes, habit tracker, day planner — everything to organize your workflow.", href: "/tools?category=Productivity", gradient: "from-blue-500/20 via-cyan-500/10 to-transparent", iconColor: "from-blue-400 to-cyan-400" },
  { icon: Terminal, title: "Developer Tools", desc: "JSON formatter, regex tester, Base64 encoder, markdown preview, and more for developers.", href: "/tools?category=Developer+Tools", gradient: "from-sky-500/20 via-indigo-500/10 to-transparent", iconColor: "from-sky-400 to-indigo-400" },
  { icon: Palette, title: "Design Studio", desc: "Color picker, favicon generator, design cards, image placeholders, and creative utilities.", href: "/tools?category=Design+%26+Creative", gradient: "from-rose-500/20 via-pink-500/10 to-transparent", iconColor: "from-rose-400 to-pink-400" },
  { icon: LayoutGrid, title: "Business Tools", desc: "Invoices, proposals, calculators, and planning tools for entrepreneurs and teams.", href: "/tools?category=Essential+Calculators", gradient: "from-amber-500/20 via-orange-500/10 to-transparent", iconColor: "from-amber-400 to-orange-400" },
  { icon: FileSymlink, title: "File Conversion", desc: "Convert, merge, split, compress, and protect PDFs, images, audio, and documents.", href: "/tools?category=File+Conversion", gradient: "from-indigo-500/20 via-blue-500/10 to-transparent", iconColor: "from-indigo-400 to-blue-400" },
  { icon: Shield, title: "Security", desc: "Password generator, text cleaner, URL encoder, and random generators for secure workflows.", href: "/tools?category=Security+%26+Text", gradient: "from-purple-500/20 via-pink-500/10 to-transparent", iconColor: "from-purple-400 to-pink-400" },
  { icon: Wifi, title: "Networking", desc: "DNS lookup, IP lookup, speed test, ping — network diagnostics at your fingertips.", href: "/tools?category=Network+Monitoring", gradient: "from-cyan-500/20 via-blue-500/10 to-transparent", iconColor: "from-cyan-400 to-blue-400" },
  { icon: Calculator, title: "Calculators", desc: "Loan, mortgage, investment, BMI, currency conversion, and essential daily calculators.", href: "/tools?category=Essential+Calculators", gradient: "from-green-500/20 via-emerald-500/10 to-transparent", iconColor: "from-green-400 to-emerald-400" },
  { icon: Layers, title: "Multimedia", desc: "Video compressor, converter, trimmer, screen recorder, audio extractor, and GIF maker.", href: "/tools?category=Multimedia", gradient: "from-violet-500/20 via-purple-500/10 to-transparent", iconColor: "from-violet-400 to-purple-400" },
]

export default function FeatureGrid() {
  return (
    <section className="relative py-24 md:py-28 bg-grid">
      <div className="container">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need in one workspace
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From lesson planning to AI writing, network diagnostics to design — all running securely in your browser.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={feature.href}
                  className={cn(
                    "group relative flex flex-col gap-4 rounded-2xl p-6 transition-all duration-500 overflow-hidden",
                    "border border-white/[0.06] bg-gradient-to-b from-card/80 to-card/40",
                    "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl",
                    feature.gradient
                  )} />

                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ padding: 1, background: "linear-gradient(135deg, rgba(79,70,229,0.3), rgba(6,182,212,0.1))", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
                  />

                  <div className="relative">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      "bg-gradient-to-br from-primary/20 to-primary/5",
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="relative space-y-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
