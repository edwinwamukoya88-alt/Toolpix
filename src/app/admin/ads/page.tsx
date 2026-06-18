"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "toolforge_sponsored_ads"
const SLOTS = ["hero", "mid", "footer"] as const

interface SponsoredAd {
  id: string
  title: string
  description: string
  image?: string
  link: string
  slot: "hero" | "mid" | "footer"
  active: boolean
  clicks: number
  impressions: number
  createdAt: number
}

function loadAds(): SponsoredAd[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAds(ads: SponsoredAd[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ads))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<SponsoredAd[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [link, setLink] = useState("")
  const [slot, setSlot] = useState<"hero" | "mid" | "footer">("hero")
  const [active, setActive] = useState(true)

  useEffect(() => {
    setAds(loadAds())
  }, [])

  function refresh() {
    setAds(loadAds())
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !link.trim()) return
    const newAd: SponsoredAd = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || undefined,
      link: link.trim(),
      slot,
      active,
      clicks: 0,
      impressions: 0,
      createdAt: Date.now(),
    }
    const updated = [...loadAds(), newAd]
    saveAds(updated)
    setTitle("")
    setDescription("")
    setImage("")
    setLink("")
    setSlot("hero")
    setActive(true)
    refresh()
  }

  function toggleAd(id: string) {
    const updated = loadAds().map((a) =>
      a.id === id ? { ...a, active: !a.active } : a,
    )
    saveAds(updated)
    refresh()
  }

  function deleteAd(id: string) {
    const updated = loadAds().filter((a) => a.id !== id)
    saveAds(updated)
    refresh()
  }

  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-12 md:py-16 text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sponsored Ads Manager</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Create and manage sponsored ad placements for ToolForge
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-background/40 p-4 text-center space-y-1">
              <div className="text-2xl font-bold tabular-nums">{ads.length}</div>
              <div className="text-xs text-muted-foreground">Total Ads</div>
            </div>
            <div className="rounded-xl border bg-background/40 p-4 text-center space-y-1">
              <div className="text-2xl font-bold tabular-nums">{ads.filter((a) => a.active).length}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="rounded-xl border bg-background/40 p-4 text-center space-y-1">
              <div className="text-2xl font-bold tabular-nums">{totalImpressions}</div>
              <div className="text-xs text-muted-foreground">Impressions</div>
            </div>
            <div className="rounded-xl border bg-background/40 p-4 text-center space-y-1">
              <div className="text-2xl font-bold tabular-nums">{totalClicks}</div>
              <div className="text-xs text-muted-foreground">Clicks</div>
            </div>
          </div>

          {/* Create Form */}
          <div className="rounded-xl border bg-background p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Create Sponsored Ad
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Streamline Your Business"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Link *</label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="All-in-one project management platform for modern teams."
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Image URL (optional)</label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Placement Slot</label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value as "hero" | "mid" | "footer")}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  >
                    {SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-xs font-medium text-muted-foreground">Active</label>
                  <div className="flex items-center gap-2 h-[38px]">
                    <button
                      type="button"
                      onClick={() => setActive(!active)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                          : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-gray-900"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Ad
              </button>
            </form>
          </div>

          {/* Ads Table */}
          <div className="rounded-xl border bg-background overflow-hidden">
            {ads.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No sponsored ads yet. Create one above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Ad</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Slot</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Impressions</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Clicks</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr key={ad.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {ad.image && (
                              <div className="h-8 w-8 shrink-0 rounded-md overflow-hidden bg-muted">
                                <img src={ad.image} alt="" className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[200px]">{ad.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{ad.link}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium capitalize">{ad.slot}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              ad.active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {ad.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-sm">{ad.impressions}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-sm">{ad.clicks}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleAd(ad.id)}
                              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                              title={ad.active ? "Deactivate" : "Activate"}
                            >
                              {ad.active ? (
                                <ToggleRight className="h-4 w-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteAd(ad.id)}
                              className="rounded-lg p-1.5 hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
