"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CtaSection() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="container">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Large radial glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-500/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Ready to work smarter?
              </h2>
            </motion.div>

            <motion.p
              className="text-muted-foreground max-w-lg mx-auto text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Join thousands of users who trust Zilita for their daily productivity, teaching, and development needs.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/tools">
                <Button variant="primary-gradient" size="lg" className="gap-2 h-12 px-8 text-base rounded-xl">
                  Start Using Zilita
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="glass" size="lg" className="h-12 px-8 text-base rounded-xl">
                  Browse All Tools
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-400" />
                No login needed
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-400" />
                Your data stays on your device
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary" />
                Always free
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
