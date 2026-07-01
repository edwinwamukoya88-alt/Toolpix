"use client"

import { useState, useRef, useCallback, useEffect, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, Headphones, Music, Radio, Waves, CloudRain, Trees, Coffee, AudioLines } from "lucide-react"
import { cn } from "@/lib/utils"

interface SoundOption {
  id: string
  label: string
  icon: any
  color: string
  bgGradient: string
}

const SOUNDS: SoundOption[] = [
  { id: "rain", label: "Rain", icon: CloudRain, color: "text-blue-300", bgGradient: "from-blue-500/20 to-blue-600/5" },
  { id: "forest", label: "Forest", icon: Trees, color: "text-emerald-300", bgGradient: "from-emerald-500/20 to-emerald-600/5" },
  { id: "cafe", label: "Café", icon: Coffee, color: "text-amber-300", bgGradient: "from-amber-500/20 to-amber-600/5" },
  { id: "ocean", label: "Ocean", icon: Waves, color: "text-cyan-300", bgGradient: "from-cyan-500/20 to-cyan-600/5" },
  { id: "whitenoise", label: "White Noise", icon: Radio, color: "text-slate-300", bgGradient: "from-slate-500/20 to-slate-600/5" },
]

function EqualizerBars({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => {
    if (!active) return
    const tid = setInterval(() => setPhase(p => (p + 1) % 8), 120)
    return () => clearInterval(tid)
  }, [active])

  const heights = [
    4 + Math.sin(phase * 1.1) * 5 + 4,
    4 + Math.sin(phase * 0.9 + 1) * 6 + 4,
    4 + Math.sin(phase * 1.3 + 2) * 7 + 4,
    4 + Math.sin(phase * 0.7 + 3) * 5 + 4,
    4 + Math.sin(phase * 1.4 + 4) * 6 + 4,
    4 + Math.sin(phase * 0.8 + 5) * 7 + 4,
    4 + Math.sin(phase * 1.2 + 6) * 5 + 4,
    4 + Math.sin(phase * 0.6 + 7) * 6 + 4,
    4 + Math.sin(phase * 1.5 + 0) * 5 + 4,
    4 + Math.sin(phase * 0.5 + 2) * 6 + 4,
    4 + Math.sin(phase * 1.1 + 4) * 5 + 4,
    4 + Math.sin(phase * 0.9 + 6) * 6 + 4,
  ]

  return (
    <div className="flex items-end gap-[2px] h-8" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-full transition-all duration-150"
          style={{
            height: active ? `${h * 2}px` : "2px",
            background: active
              ? `linear-gradient(to top, hsl(238, 90%, 60%, ${0.3 + (h / 14) * 0.5}), hsl(238, 90%, 70%, ${0.5 + (h / 14) * 0.3}))`
              : "hsl(238, 90%, 60%, 0.1)",
            opacity: active ? 0.5 + (h / 14) * 0.5 : 0.1,
          }}
        />
      ))}
    </div>
  )
}

function WaveformVisualizer({ active, color }: { active: boolean; color: string }) {
  return (
    <svg viewBox="0 0 200 40" className="w-full h-8" aria-hidden="true">
      <defs>
        <linearGradient id="waveform-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(238, 90%, 60%, 0.2)" />
          <stop offset="50%" stopColor="hsl(238, 90%, 70%, 0.6)" />
          <stop offset="100%" stopColor="hsl(238, 90%, 60%, 0.2)" />
        </linearGradient>
      </defs>
      {Array.from({ length: 40 }).map((_, i) => {
        const h = active ? 8 + Math.sin(i * 0.4 + Date.now() * 0.001) * 12 + Math.sin(i * 0.8) * 4 : 2
        return (
          <motion.rect
            key={i}
            x={i * 5}
            y={20 - h / 2}
            width="3"
            height={h}
            rx="1.5"
            animate={active ? {
              height: [h, h + Math.sin(i * 0.3) * 8, h],
              opacity: [0.4, 0.8, 0.4],
            } : { height: 2, opacity: 0.08 }}
            transition={{
              duration: 0.8 + Math.sin(i * 0.5) * 0.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.03,
            }}
            fill="url(#waveform-grad)"
          />
        )
      })}
    </svg>
  )
}

interface AmbientSoundsProps {
  className?: string
}

function AmbientSounds({ className = "" }: AmbientSoundsProps) {
  const [activeSound, setActiveSound] = useState<string | null>(null)
  const [volume, setVolume] = useState(65)
  const [prevSound, setPrevSound] = useState<string | null>(null)
  const [prevVolume, setPrevVolume] = useState(65)

  const activeConfig = activeSound ? SOUNDS.find(s => s.id === activeSound) : null
  const ActiveIcon = activeConfig?.icon || Headphones

  const toggleSound = useCallback((id: string) => {
    setActiveSound((prev) => {
      if (prev && prev !== id) {
        setPrevSound(prev)
        setPrevVolume(volume)
      }
      return prev === id ? null : id
    })
  }, [volume])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative overflow-hidden rounded-3xl border border-indigo-500/10 bg-gradient-to-b from-indigo-950/40 to-slate-950/40 p-5 sm:p-6 noise", className)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(238_90%_60%/0.03),transparent_60%)]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/10">
              <Headphones className="h-4 w-4 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-indigo-200">Soundscapes</h2>
              <p className="text-[10px] text-indigo-300/40">Focus-enhancing audio</p>
            </div>
          </div>
          {activeSound && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-300 font-medium">Live</span>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {activeSound && activeConfig && (
            <motion.div
              key={activeSound}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mb-4"
            >
              <div className={cn(
                "rounded-2xl border border-indigo-500/10 bg-gradient-to-br p-4",
                activeConfig.bgGradient
              )}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/10">
                      <ActiveIcon className={cn("h-5 w-5", activeConfig.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-100">Now Playing</p>
                      <p className={cn("text-[11px] font-medium", activeConfig.color)}>
                        {activeConfig.label} • {volume}%
                      </p>
                    </div>
                  </div>
                  <EqualizerBars active={true} />
                </div>

                <WaveformVisualizer active={true} color={activeConfig.color} />

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setVolume(0)}
                    className="shrink-0 p-1 rounded-lg hover:bg-indigo-500/10 text-indigo-300/40 hover:text-indigo-200 transition-colors"
                    aria-label="Mute"
                  >
                    {volume === 0 ? (
                      <VolumeX className="h-3.5 w-3.5" />
                    ) : (
                      <Volume2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <div className="relative flex-1 group/volume">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-indigo-950/60 accent-indigo-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsla(238,90%,60%,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-110"
                      style={{
                        background: `linear-gradient(to right, hsl(238, 90%, 60%) 0%, hsl(262, 83%, 65%) ${volume}%, hsl(238, 90%, 60%, 0.15) ${volume}%, hsl(238, 90%, 60%, 0.15) 100%)`,
                      }}
                      aria-label="Volume"
                    />
                  </div>
                  <span className="text-[10px] text-indigo-300/40 w-8 text-right font-mono tabular-nums">{volume}%</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-5 gap-2">
          {SOUNDS.map((sound) => {
            const SoundIcon = sound.icon
            const isActive = activeSound === sound.id
            return (
              <motion.button
                key={sound.id}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleSound(sound.id)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition-all duration-300 overflow-hidden",
                  isActive
                    ? "border-indigo-500/30 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                    : "border-indigo-500/5 bg-indigo-950/20 hover:border-indigo-500/15 hover:bg-indigo-950/30"
                )}
                aria-pressed={isActive}
                aria-label={`${sound.label}${isActive ? " (active)" : ""}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sound-active-bg"
                    className={cn("absolute inset-0 bg-gradient-to-br opacity-30", sound.bgGradient)}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative z-10 flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-300",
                  isActive ? "bg-indigo-500/20" : "bg-indigo-950/40"
                )}>
                  <SoundIcon className={cn("h-4 w-4", isActive ? sound.color : "text-indigo-300/40")} />
                </div>
                <span className={cn(
                  "relative z-10 text-[9px] font-medium truncate max-w-full",
                  isActive ? sound.color : "text-indigo-300/40"
                )}>
                  {sound.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default memo(AmbientSounds)