import Link from "next/link"
import { ArrowRight, Target, Sparkles, ShieldCheck, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

const bullets = [
  { icon: Target, label: "High-Intent Audience" },
  { icon: Sparkles, label: "Premium Brand Placement" },
  { icon: ShieldCheck, label: "Privacy-First Platform" },
  { icon: LayoutGrid, label: "Fast-Growing Tool Collection" },
]

export default function AdvertiseCTA() {
  return (
    <section className="container py-8">
      <div className="relative rounded-3xl border border-white/[0.06] bg-gradient-to-br from-primary/[0.04] via-card/60 to-purple-500/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_0_1px_hsl(var(--border)/0.2),0_8px_32px_hsl(var(--primary)/0.04)] overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Advertise on{" "}
              <span className="text-primary">ToolForge</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              Reach teachers, students, developers, creators, and businesses
              through privacy-first browser tools designed for productivity and
              learning.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              {bullets.map((b) => {
                const Icon = b.icon
                return (
                  <div key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{b.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-center lg:items-stretch gap-3 shrink-0">
            <Link href="/advertise">
              <Button
                size="lg"
                className="gap-2 h-11 px-6 text-sm rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97] transition-all duration-300 whitespace-nowrap"
              >
                Advertise With Us
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 h-11 px-6 text-sm rounded-xl border-white/10 hover:bg-white/[0.04] hover:border-primary/30 active:scale-[0.97] transition-all duration-300 whitespace-nowrap"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
