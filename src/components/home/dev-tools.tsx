"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Braces, Regex, FileCode, Hash, Server, Gauge, Activity, Globe, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const tools = [
  { icon: Braces, label: "JSON Formatter", desc: "Format, validate, and beautify JSON", href: "/tools/json-formatter" },
  { icon: Regex, label: "Regex Tester", desc: "Test regular expressions live", href: "/tools/regex-tester" },
  { icon: FileCode, label: "Base64", desc: "Encode and decode Base64", href: "/tools/base64" },
  { icon: Hash, label: "Hash Generator", desc: "Generate secure hashes", href: "/tools/password-generator" },
  { icon: Server, label: "DNS Lookup", desc: "Look up DNS records", href: "/tools/dns-lookup" },
  { icon: Gauge, label: "Speed Test", desc: "Test internet speed", href: "/tools/speed-test" },
  { icon: Activity, label: "Ping", desc: "Measure network latency", href: "/tools/ping-test" },
  { icon: Globe, label: "IP Lookup", desc: "Find your public IP info", href: "/tools/whats-my-ip" },
]

export default function DevToolsSection() {
  return (
    <section className="relative py-24 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500/[0.03] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/[0.06] px-4 py-1.5 text-xs font-medium text-sky-400 mb-6">
              <Code className="h-3.5 w-3.5" />
              For Developers
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Developer Power Tools
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Format code, test regex, debug networks, encode data — all the utilities developers reach for daily, now in one place.
            </p>
            <p className="text-sm text-muted-foreground/70 leading-relaxed mb-6">
              Validate JSON payloads, test regular expressions with live matching, encode and decode Base64 strings, look up DNS records, measure network latency, and test internet speed. Every tool runs instantly without sign-up, so you can debug and develop without context switching.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/tools?category=Developer+Tools">
                <Button size="lg" className="gap-2 h-12 px-8 text-base rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                  Developer Tools
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools?category=Network+Monitoring">
                <Button variant="glass" size="lg" className="h-12 px-8 text-base rounded-xl gap-2">
                  Network Tools
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  >
                    <Link
                      href={tool.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-card/40 p-4 hover:bg-card/60 hover:border-sky-500/20 transition-all duration-300"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/10 group-hover:scale-110 transition-transform">
                        <Icon className="h-4 w-4 text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:text-sky-400 transition-colors">{tool.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{tool.desc}</p>
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

function Code(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
