"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import {
  Upload, Download, ImageIcon, RotateCcw, RefreshCw,
  ZoomIn, ZoomOut, Maximize2, Grid3X3, Clipboard,
  Undo2, Redo2, Crop, FlipHorizontal, FlipVertical,
  Sun, Contrast, Droplets, Eye, EyeOff, SlidersHorizontal,
  MousePointer2, Eraser, Sparkles, ArrowLeft, Check,
  Palette, Move, Square, Scissors, AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { trackToolUse, trackDownload } from "@/lib/analytics"

// ─── Types ───────────────────────────────────────────────────────────────
type AppState = "idle" | "dragging" | "loaded"
type ToolTab = "resize" | "filters" | "bgremove" | "crop" | "presets" | "adjust"
type FlipType = "none" | "horizontal" | "vertical" | "both"

interface FilterValues {
  brightness: number
  contrast: number
  saturation: number
  exposure: number
  hueShift: number
  blur: number
  sharpen: number
  grayscale: number
  sepia: number
  vignette: number
  noise: number
}

interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

interface BgRemoveState {
  active: boolean
  tolerance: number
  feather: number
  color: [number, number, number]
  mode: "auto" | "manual"
}

interface Preset {
  name: string
  label: string
  description: string
  width?: number
  height?: number
  aspectRatio?: string
  filterPresets?: Partial<FilterValues>
  bgRemove?: boolean
  format?: string
}

interface HistoryEntry {
  dataUrl: string
  filters: FilterValues
  width: number
  height: number
  rotation: number
  flip: FlipType
  crop: CropRect | null
}

const FORMAT_OPTIONS: { value: string; label: string; ext: string }[] = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WEBP", ext: "webp" },
  { value: "image/avif", label: "AVIF", ext: "avif" },
]

const DEFAULT_FILTERS: FilterValues = {
  brightness: 100, contrast: 100, saturation: 100, exposure: 0,
  hueShift: 0, blur: 0, sharpen: 0, grayscale: 0, sepia: 0,
  vignette: 0, noise: 0,
}

const CROP_PRESETS = [
  { label: "Free", ratio: null },
  { label: "1:1 Square", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "9:16", ratio: 9 / 16 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "2:3", ratio: 2 / 3 },
]

const PRESETS: Preset[] = [
  { name: "social", label: "Social Media Post", description: "1200×630px — optimized for social feeds", width: 1200, height: 630, aspectRatio: "1.91:1", filterPresets: { contrast: 110, saturation: 110, sharpen: 15 }, format: "image/webp" },
  { name: "instagram", label: "Instagram Story", description: "1080×1920px — full story format", width: 1080, height: 1920, aspectRatio: "9:16", filterPresets: { brightness: 105, contrast: 115, saturation: 120 }, format: "image/png" },
  { name: "youtube", label: "YouTube Thumbnail", description: "1280×720px — high-impact thumbnail", width: 1280, height: 720, aspectRatio: "16:9", filterPresets: { contrast: 120, saturation: 115, sharpen: 20, brightness: 105 }, format: "image/jpeg" },
  { name: "passport", label: "Passport Photo", description: "600×600px — white background suggested", width: 600, height: 600, aspectRatio: "1:1", bgRemove: true, format: "image/png" },
  { name: "product", label: "Product Image", description: "800×800px — e-commerce ready", width: 800, height: 800, aspectRatio: "1:1", filterPresets: { brightness: 105, contrast: 110, saturation: 105 }, bgRemove: true, format: "image/png" },
  { name: "blog", label: "Blog Featured Image", description: "1200×630px — standard blog cover", width: 1200, height: 630, aspectRatio: "1.91:1", filterPresets: { contrast: 105, sharpen: 10 }, format: "image/webp" },
]

const COMPRESSION_MODES = [
  { name: "web", label: "Web Optimized", q: 0.8, desc: "Best balance of quality & size" },
  { name: "high", label: "High Quality", q: 0.95, desc: "Maximum visual fidelity" },
  { name: "ultra", label: "Ultra Compressed", q: 0.3, desc: "Smallest file size" },
]

// ─── Canvas Utilities ────────────────────────────────────────────────────

function dataURLToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  const n = bstr.length
  const u8arr = new Uint8Array(n)
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i)
  return new Blob([u8arr], { type: mime })
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function applyCanvasFilters(
  sourceCanvas: HTMLCanvasElement,
  filters: FilterValues,
  bgColor: string | null
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = sourceCanvas.width
  canvas.height = sourceCanvas.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const h = canvas.height
  const w = canvas.width

  // Normalize filter values
  const b = (filters.brightness - 100) / 100
  const c = filters.contrast / 100
  const s = filters.saturation / 100
  const e = filters.exposure / 100
  const hueDeg = (filters.hueShift / 360) * Math.PI * 2
  const gs = filters.grayscale / 100
  const sp = filters.sepia / 100
  const vg = filters.vignette / 100
  const ns = filters.noise / 100
  const sh = filters.sharpen / 100

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b_ = data[i + 2]
    let a = data[i + 3]
    if (a === 0) continue

    // Exposure
    if (e !== 0) {
      const factor = Math.pow(2, e)
      r = clamp(r * factor, 0, 255)
      g = clamp(g * factor, 0, 255)
      b_ = clamp(b_ * factor, 0, 255)
    }

    // Brightness
    if (b !== 0) {
      r = clamp(r + b * 255, 0, 255)
      g = clamp(g + b * 255, 0, 255)
      b_ = clamp(b_ + b * 255, 0, 255)
    }

    // Contrast
    if (c !== 1) {
      r = clamp((r - 128) * c + 128, 0, 255)
      g = clamp((g - 128) * c + 128, 0, 255)
      b_ = clamp((b_ - 128) * c + 128, 0, 255)
    }

    // Saturation + Hue
    if (s !== 1 || hueDeg !== 0 || gs > 0 || sp > 0) {
      const rr = r / 255, gg = g / 255, bb = b_ / 255
      const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
      let hue = 0, sat = 0, light = (max + min) / 2
      if (max !== min) {
        const d = max - min
        sat = light > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case rr: hue = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break
          case gg: hue = ((bb - rr) / d + 2) / 6; break
          case bb: hue = ((rr - gg) / d + 4) / 6; break
        }
      }
      // Apply saturation
      sat *= s
      // Apply hue shift
      hue = (hue + hueDeg / (Math.PI * 2)) % 1
      // Apply grayscale
      if (gs > 0) {
        const gray = rr * 0.299 + gg * 0.587 + bb * 0.114
        r = clamp(r * (1 - gs) + gray * 255 * gs, 0, 255)
        g = clamp(g * (1 - gs) + gray * 255 * gs, 0, 255)
        b_ = clamp(b_ * (1 - gs) + gray * 255 * gs, 0, 255)
        // Convert back
        const nrr = r / 255, ngg = g / 255, nbb = b_ / 255
        const nmax = Math.max(nrr, ngg, nbb), nmin = Math.min(nrr, ngg, nbb)
        if (nmax !== nmin) {
          const nd = nmax - nmin
          sat = light > 0.5 ? nd / (2 - nmax - nmin) : nd / (nmax + nmin)
          switch (nmax) {
            case nrr: hue = ((ngg - nbb) / nd + (ngg < nbb ? 6 : 0)) / 6; break
            case ngg: hue = ((nbb - nrr) / nd + 2) / 6; break
            case nbb: hue = ((nrr - ngg) / nd + 4) / 6; break
          }
        }
        continue
      }
      // Convert HSL back to RGB
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
      }
      const q2 = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
      const p2 = 2 * light - q2
      r = clamp(hue2rgb(p2, q2, hue + 1 / 3) * 255, 0, 255)
      g = clamp(hue2rgb(p2, q2, hue) * 255, 0, 255)
      b_ = clamp(hue2rgb(p2, q2, hue - 1 / 3) * 255, 0, 255)
    }

    // Sepia
    if (sp > 0) {
      const sr = r * (1 - sp) + (r * 0.393 + g * 0.769 + b_ * 0.189) * sp
      const sg = g * (1 - sp) + (r * 0.349 + g * 0.686 + b_ * 0.168) * sp
      const sb = b_ * (1 - sp) + (r * 0.272 + g * 0.534 + b_ * 0.131) * sp
      r = clamp(sr, 0, 255)
      g = clamp(sg, 0, 255)
      b_ = clamp(sb, 0, 255)
    }

    data[i] = r
    data[i + 1] = g
    data[i + 2] = b_
  }

  ctx.putImageData(imageData, 0, 0)

  // Blur (box blur approximation)
  if (filters.blur > 0) {
    const radius = Math.max(1, Math.round(filters.blur / 10))
    const blurData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const bd = blurData.data
    const temp = new Uint8ClampedArray(bd)
    for (let pass = 0; pass < radius; pass++) {
      // Horizontal
      for (let y = 0; y < h; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4
          bd[idx] = (temp[idx - 4] + temp[idx] + temp[idx + 4]) / 3
          bd[idx + 1] = (temp[idx - 4 + 1] + temp[idx + 1] + temp[idx + 4 + 1]) / 3
          bd[idx + 2] = (temp[idx - 4 + 2] + temp[idx + 2] + temp[idx + 4 + 2]) / 3
        }
      }
      temp.set(bd)
      // Vertical
      for (let x = 0; x < w; x++) {
        for (let y = 1; y < h - 1; y++) {
          const idx = (y * w + x) * 4
          bd[idx] = (temp[((y - 1) * w + x) * 4] + temp[idx] + temp[((y + 1) * w + x) * 4]) / 3
          bd[idx + 1] = (temp[((y - 1) * w + x) * 4 + 1] + temp[idx + 1] + temp[((y + 1) * w + x) * 4 + 1]) / 3
          bd[idx + 2] = (temp[((y - 1) * w + x) * 4 + 2] + temp[idx + 2] + temp[((y + 1) * w + x) * 4 + 2]) / 3
        }
      }
      temp.set(bd)
    }
    ctx.putImageData(blurData, 0, 0)
  }

  // Sharpen
  if (sh > 0) {
    const sharpData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const sd = sharpData.data
    const temp = new Uint8ClampedArray(sd)
    const factor = sh * 0.5
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4
        for (let c = 0; c < 3; c++) {
          const sum =
            5 * temp[idx + c] -
            temp[((y - 1) * w + x) * 4 + c] -
            temp[((y + 1) * w + x) * 4 + c] -
            temp[(y * w + x - 1) * 4 + c] -
            temp[(y * w + x + 1) * 4 + c]
          sd[idx + c] = clamp(temp[idx + c] + factor * (sum - temp[idx + c]), 0, 255)
        }
      }
    }
    ctx.putImageData(sharpData, 0, 0)
  }

  // Vignette
  if (vg > 0) {
    const vgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const vd = vgData.data
    const cx = w / 2, cy = h / 2
    const maxDist = Math.sqrt(cx * cx + cy * cy)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4
        if (vd[idx + 3] === 0) continue
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxDist
        const darken = 1 - vg * Math.pow(dist, 2) * 0.7
        vd[idx] = clamp(vd[idx] * darken, 0, 255)
        vd[idx + 1] = clamp(vd[idx + 1] * darken, 0, 255)
        vd[idx + 2] = clamp(vd[idx + 2] * darken, 0, 255)
      }
    }
    ctx.putImageData(vgData, 0, 0)
  }

  // Noise
  if (ns > 0) {
    const nData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const nd = nData.data
    for (let i = 0; i < nd.length; i += 4) {
      if (nd[i + 3] === 0) continue
      const noise = (Math.random() - 0.5) * ns * 255
      nd[i] = clamp(nd[i] + noise, 0, 255)
      nd[i + 1] = clamp(nd[i + 1] + noise, 0, 255)
      nd[i + 2] = clamp(nd[i + 2] + noise, 0, 255)
    }
    ctx.putImageData(nData, 0, 0)
  }

  return canvas
}

function removeBackgroundColor(
  sourceCanvas: HTMLCanvasElement,
  targetColor: [number, number, number],
  tolerance: number,
  feather: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width = sourceCanvas.width
  canvas.height = sourceCanvas.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const t = tolerance / 100 * 255
  const f = Math.max(0, Math.min(1, feather / 100))

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - targetColor[0]
    const dg = data[i + 1] - targetColor[1]
    const db = data[i + 2] - targetColor[2]
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)

    if (dist < t) {
      if (dist > t * (1 - f)) {
        const alpha = 1 - (dist - t * (1 - f)) / (t * f)
        data[i + 3] = Math.round(data[i + 3] * (1 - alpha))
      } else {
        data[i + 3] = 0
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas
}

function estimateFileSize(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] || ""
  return Math.round(base64.length * 0.75)
}

// ─── Component ───────────────────────────────────────────────────────────

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null)
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [state, setState] = useState<AppState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Tabs
  const [activeTab, setActiveTab] = useState<ToolTab>("adjust")

  // Resize
  const [targetWidth, setTargetWidth] = useState(0)
  const [targetHeight, setTargetHeight] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [canvasPadding, setCanvasPadding] = useState(0)

  // Crop
  const [cropRect, setCropRect] = useState<CropRect | null>(null)
  const [cropPreset, setCropPreset] = useState<number | null>(null)
  const [isCropping, setIsCropping] = useState(false)

  // Rotate / Flip
  const [rotation, setRotation] = useState(0)
  const [flip, setFlip] = useState<FlipType>("none")

  // Filters
  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS })

  // Background removal
  const [bgRemove, setBgRemove] = useState<BgRemoveState>({
    active: false, tolerance: 40, feather: 30,
    color: [0, 255, 0], mode: "auto",
  })
  const [bgColor, setBgColor] = useState("#00ff00")
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)

  // Preview
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Compression / Export
  const [selectedFormat, setSelectedFormat] = useState("image/png")
  const [quality, setQuality] = useState(0.9)
  const [compressionMode, setCompressionMode] = useState("web")
  const [estimatedSize, setEstimatedSize] = useState(0)

  // Refs
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const formatRef = useRef("image/png")
  const originalImageRef = useRef<HTMLImageElement | null>(null)
  const processedCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cropStartRef = useRef<{ x: number; y: number } | null>(null)
  const cropPreviewRef = useRef<HTMLDivElement>(null)

  const cleanOutput = useCallback(() => {
    if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null) }
  }, [outputUrl])

  useEffect(() => cleanOutput, [cleanOutput])

  const pushHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, entry]
    })
    setHistoryIndex((prev) => prev + 1)
  }, [historyIndex])

  const aspectRatio = useMemo(() => {
    if (targetWidth > 0 && targetHeight > 0) return targetWidth / targetHeight
    return null
  }, [targetWidth, targetHeight])

  // ─── Processing Pipeline ───────────────────────────────────────────────

  const processImage = useCallback((img: HTMLImageElement, applyFilters: boolean = true) => {
    let canvas = document.createElement("canvas")
    let w = img.naturalWidth
    let h = img.naturalHeight
    canvas.width = w
    canvas.height = h
    let ctx = canvas.getContext("2d")!
    ctx.drawImage(img, 0, 0)

    // Apply flip
    if (flip !== "none") {
      const flipCanvas = document.createElement("canvas")
      flipCanvas.width = w
      flipCanvas.height = h
      const fctx = flipCanvas.getContext("2d")!
      fctx.translate(flip === "horizontal" || flip === "both" ? w : 0, flip === "vertical" || flip === "both" ? h : 0)
      fctx.scale(flip === "horizontal" || flip === "both" ? -1 : 1, flip === "vertical" || flip === "both" ? -1 : 1)
      fctx.drawImage(canvas, 0, 0)
      canvas = flipCanvas
    }

    // Apply rotation
    if (rotation !== 0) {
      const rotCanvas = document.createElement("canvas")
      const rad = (rotation * Math.PI) / 180
      const cos = Math.abs(Math.cos(rad))
      const sin = Math.abs(Math.sin(rad))
      const nw = Math.ceil(w * cos + h * sin)
      const nh = Math.ceil(w * sin + h * cos)
      rotCanvas.width = nw
      rotCanvas.height = nh
      const rctx = rotCanvas.getContext("2d")!
      rctx.translate(nw / 2, nh / 2)
      rctx.rotate(rad)
      rctx.drawImage(canvas, -w / 2, -h / 2)
      canvas = rotCanvas
      w = nw
      h = nh
    }

    // Apply canvas padding
    if (canvasPadding > 0) {
      const padCanvas = document.createElement("canvas")
      const pad = canvasPadding
      padCanvas.width = w + pad * 2
      padCanvas.height = h + pad * 2
      const pctx = padCanvas.getContext("2d")!
      pctx.fillStyle = "#ffffff"
      pctx.fillRect(0, 0, padCanvas.width, padCanvas.height)
      pctx.drawImage(canvas, pad, pad)
      canvas = padCanvas
      w = padCanvas.width
      h = padCanvas.height
    }

    // Apply resize
    if (targetWidth > 0 && targetHeight > 0) {
      const resizeCanvas = document.createElement("canvas")
      resizeCanvas.width = targetWidth
      resizeCanvas.height = targetHeight
      const rsCtx = resizeCanvas.getContext("2d")!
      rsCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight)
      canvas = resizeCanvas
      w = targetWidth
      h = targetHeight
    }

    // Apply crop
    if (cropRect && cropRect.w > 0 && cropRect.h > 0) {
      const cropCanvas = document.createElement("canvas")
      cropCanvas.width = cropRect.w
      cropCanvas.height = cropRect.h
      const cCtx = cropCanvas.getContext("2d")!
      cCtx.drawImage(canvas, cropRect.x, cropRect.y, cropRect.w, cropRect.h, 0, 0, cropRect.w, cropRect.h)
      canvas = cropCanvas
      w = cropRect.w
      h = cropRect.h
    }

    // Apply filters
    if (applyFilters) {
      const filterKeys = Object.keys(DEFAULT_FILTERS) as (keyof FilterValues)[]
      const hasFilters = filterKeys.some((k) => filters[k] !== DEFAULT_FILTERS[k])
      if (hasFilters) {
        canvas = applyCanvasFilters(canvas, filters, null)
      }
    }

    // Apply background removal
    if (bgRemove.active) {
      canvas = removeBackgroundColor(canvas, bgRemove.color, bgRemove.tolerance, bgRemove.feather)
    }

    processedCanvasRef.current = canvas

    const dataUrl = canvas.toDataURL("image/png")
    setPreviewDataUrl(dataUrl)
    setEstimatedSize(estimateFileSize(dataUrl))

    if (targetWidth === 0) setTargetWidth(img.naturalWidth)
    if (targetHeight === 0) setTargetHeight(img.naturalHeight)
  }, [flip, rotation, canvasPadding, targetWidth, targetHeight, cropRect, filters, bgRemove])

  const queueProcess = useRef<number>(0)

  const triggerProcess = useCallback(() => {
    queueProcess.current++
    const id = queueProcess.current
    requestAnimationFrame(() => {
      if (id !== queueProcess.current) return
      if (originalImageRef.current) {
        processImage(originalImageRef.current)
      }
    })
  }, [processImage])

  useEffect(() => { if (originalImageRef.current) triggerProcess() }, [
    flip, rotation, canvasPadding, targetWidth, targetHeight, cropRect, filters, bgRemove, triggerProcess,
  ])

  // ─── File Loading ──────────────────────────────────────────────────────

  const loadFile = useCallback((f: File) => {
    setError(null)
    if (!f.type.startsWith("image/")) { setError("Please select a valid image file."); return }
    cleanOutput()
    setFile(f)
    setState("loaded")

    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setOriginalDataUrl(url)

      const img = new Image()
      img.onload = () => {
        originalImageRef.current = img
        setTargetWidth(img.naturalWidth)
        setTargetHeight(img.naturalHeight)
        processImage(img)
        pushHistory({
          dataUrl: url, filters: { ...DEFAULT_FILTERS },
          width: img.naturalWidth, height: img.naturalHeight,
          rotation: 0, flip: "none", crop: null,
        })
      }
      img.src = url
    }
    reader.onerror = () => { setError("Failed to read image file."); toast.error("Failed to read image file.") }
    reader.readAsDataURL(f)
    toast.success(`Loaded: ${f.name}`)
  }, [cleanOutput, processImage, pushHistory])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
    if (e.target) e.target.value = ""
  }

  const dragHandlers = {
    onDragEnter(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); setState("dragging") },
    onDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation() },
    onDragLeave(e: React.DragEvent) {
      e.preventDefault(); e.stopPropagation()
      setState(file ? "loaded" : "idle")
    },
    onDrop(e: React.DragEvent) {
      e.preventDefault(); e.stopPropagation()
      const f = e.dataTransfer.files?.[0]
      if (f) loadFile(f)
      else setState(file ? "loaded" : "idle")
    },
  }

  // ─── Edit Handlers ─────────────────────────────────────────────────────

  function handleFormatChange(newFormat: string) {
    formatRef.current = newFormat
    setSelectedFormat(newFormat)
  }

  function handleQualityChange(newQ: number) {
    setQuality(newQ)
  }

  function handleWidthChange(v: number) {
    setTargetWidth(v)
    if (lockAspect && targetHeight > 0) {
      setTargetHeight(Math.round(v / aspectRatio!))
    }
  }

  function handleHeightChange(v: number) {
    setTargetHeight(v)
    if (lockAspect && targetWidth > 0) {
      setTargetWidth(Math.round(v * aspectRatio!))
    }
  }

  function handleFlip(dir: FlipType) {
    setFlip(flip === dir ? "none" : dir)
  }

  function applyPreset(preset: Preset) {
    if (preset.width) setTargetWidth(preset.width)
    if (preset.height) setTargetHeight(preset.height)
    setLockAspect(true)
    if (preset.filterPresets) {
      setFilters((prev) => ({ ...prev, ...preset.filterPresets }))
    }
    if (preset.bgRemove) {
      setBgRemove((prev) => ({ ...prev, active: true }))
    }
    if (preset.format) {
      handleFormatChange(preset.format)
    }
    setActiveTab("adjust")
    toast.success(`Applied "${preset.label}" preset`)
  }

  function resetFilters() {
    setFilters({ ...DEFAULT_FILTERS })
    setRotation(0)
    setFlip("none")
    setCropRect(null)
    setBgRemove((prev) => ({ ...prev, active: false }))
    setCanvasPadding(0)
    if (originalImageRef.current) {
      setTargetWidth(originalImageRef.current.naturalWidth)
      setTargetHeight(originalImageRef.current.naturalHeight)
    }
    setShowBeforeAfter(false)
    setZoom(1)
    toast.success("Reset to original")
  }

  function undo() {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1
      setHistoryIndex(newIdx)
      const entry = history[newIdx]
      setFilters(entry.filters)
      setTargetWidth(entry.width)
      setTargetHeight(entry.height)
      setRotation(entry.rotation)
      setFlip(entry.flip)
      setCropRect(entry.crop)
      const img = new Image()
      img.onload = () => {
        originalImageRef.current = img
        processImage(img)
      }
      img.src = entry.dataUrl
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1
      setHistoryIndex(newIdx)
      const entry = history[newIdx]
      setFilters(entry.filters)
      setTargetWidth(entry.width)
      setTargetHeight(entry.height)
      setRotation(entry.rotation)
      setFlip(entry.flip)
      setCropRect(entry.crop)
      const img = new Image()
      img.onload = () => {
        originalImageRef.current = img
        processImage(img)
      }
      img.src = entry.dataUrl
    }
  }

  // ─── Convert & Export ──────────────────────────────────────────────────

  function convert() {
    if (!previewDataUrl) return
    setIsProcessing(true)
    setError(null)

    const img = new Image()
    img.onload = () => {
      try {
        const fmt = formatRef.current
        const q = quality

        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")!
        if (fmt === "image/jpeg" || fmt === "image/avif") {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0)
        const qualityArg = fmt === "image/png" ? undefined : q
        const dataUrl = canvas.toDataURL(fmt, qualityArg)
        const blob = dataURLToBlob(dataUrl)
        cleanOutput()
        const url = URL.createObjectURL(blob)
        setOutputUrl(url)
        setIsProcessing(false)
        toast.success("Image processed!")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Processing error")
        setIsProcessing(false)
      }
    }
    img.onerror = () => { setError("Failed to decode image"); setIsProcessing(false) }
    img.src = previewDataUrl
  }

  function download() {
    if (!outputUrl || !file) return
    const fmt = formatRef.current
    const opt = FORMAT_OPTIONS.find((o) => o.value === fmt)
    if (!opt) { setError(`Unknown format: ${fmt}`); return }
    const base = file.name.replace(/\.[^.]+$/, "")
    const link = document.createElement("a")
    link.href = outputUrl
    link.download = `${base}-edited.${opt.ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Downloaded!")
    trackDownload("image-converter", "download")
  }

  async function copyToClipboard() {
    if (!outputUrl) return
    try {
      const blob = dataURLToBlob(outputUrl)
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      toast.success("Copied to clipboard!")
    } catch {
      toast.error("Failed to copy. Try downloading instead.")
    }
  }

  function reset() {
    setFile(null)
    setOriginalDataUrl(null)
    setPreviewDataUrl(null)
    cleanOutput()
    setError(null)
    setState("idle")
    setFilters({ ...DEFAULT_FILTERS })
    setRotation(0)
    setFlip("none")
    setCropRect(null)
    setCropPreset(null)
    setTargetWidth(0)
    setTargetHeight(0)
    setCanvasPadding(0)
    setBgRemove((prev) => ({ ...prev, active: false }))
    setZoom(1)
    setShowGrid(false)
    setShowBeforeAfter(false)
    setHistory([])
    setHistoryIndex(-1)
    setQuality(0.9)
    originalImageRef.current = null
    processedCanvasRef.current = null
    trackToolUse("image-converter", "reset")
  }

  function applyCompressionMode(mode: string) {
    const m = COMPRESSION_MODES.find((c) => c.name === mode)
    if (m) {
      setCompressionMode(mode)
      handleQualityChange(m.q)
    }
  }

  // ─── Crop mouse handlers ───────────────────────────────────────────────

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!isCropping || !cropPreviewRef.current) return
    const rect = cropPreviewRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom
    cropStartRef.current = { x, y }
    setCropRect({ x, y, w: 0, h: 0 })
  }

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!cropStartRef.current || !cropPreviewRef.current) return
    const rect = cropPreviewRef.current.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / zoom
    const my = (e.clientY - rect.top) / zoom
    let w = mx - cropStartRef.current.x
    let h = my - cropStartRef.current.y
    if (cropPreset && cropPreset > 0) {
      h = w / cropPreset
    }
    setCropRect({
      x: w < 0 ? mx : cropStartRef.current.x,
      y: h < 0 ? my : cropStartRef.current.y,
      w: Math.abs(w), h: Math.abs(h),
    })
  }

  const handleCropMouseUp = () => {
    cropStartRef.current = null
  }

  // ─── Render helpers ────────────────────────────────────────────────────

  function filterSlider(
    label: string, icon: React.ReactNode,
    value: number, min: number, max: number, step: number,
    onChange: (v: number) => void, display?: string
  ) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">{icon}{label}</span>
          <span className="text-[10px] text-muted-foreground">{display ?? value}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>
    )
  }

  // ─── Render ────────────────────────────────────────────────────────────

  const sectionClass = "space-y-4 p-5 rounded-xl border bg-card"
  const labelClass = "text-xs font-medium text-muted-foreground"

  if (state === "idle" || state === "dragging") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-1">
            <Sparkles className="size-3.5" /> Professional Image Processing Studio
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Image Processing Studio</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Edit, convert, filter, and remove backgrounds — all in your browser. 100% private, no uploads.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div ref={dropRef}
              {...dragHandlers}
              data-dragging={state === "dragging" || undefined}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                state === "dragging" ? "border-primary bg-primary/5" : "hover:border-primary/50"
              )}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Upload an image</p>
              <p className="text-xs text-muted-foreground mb-4">PNG, JPG, WEBP, AVIF supported</p>
              <Button variant="outline" className="relative" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                Choose Image
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Toolbar */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-[9px] gap-1">
                <ImageIcon className="size-3" /> {file?.name || "Image"}
              </Badge>
              <Badge variant="outline" className="text-[9px]">
                {(aspectRatio && aspectRatio > 0) ? `${targetWidth}×${targetHeight}` : "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="xs" onClick={undo} disabled={historyIndex <= 0} className="h-7 w-7 p-0">
                <Undo2 className="size-3.5" />
              </Button>
              <Button variant="ghost" size="xs" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-7 w-7 p-0">
                <Redo2 className="size-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button variant="ghost" size="xs" onClick={() => setShowBeforeAfter(!showBeforeAfter)} className={cn("h-7 gap-1 text-[10px]", showBeforeAfter && "text-primary")}>
                {showBeforeAfter ? <EyeOff className="size-3" /> : <Eye className="size-3" />} {showBeforeAfter ? "After" : "Before"}
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setShowGrid(!showGrid)} className={cn("h-7 gap-1 text-[10px]", showGrid && "text-primary")}>
                <Grid3X3 className="size-3" /> Grid
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button variant="ghost" size="xs" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} className="h-7 w-7 p-0">
                <ZoomOut className="size-3.5" />
              </Button>
              <span className="text-[10px] text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="xs" onClick={() => setZoom(Math.min(4, zoom + 0.25))} className="h-7 w-7 p-0">
                <ZoomIn className="size-3.5" />
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setZoom(1)} className="h-7 text-[10px] gap-1">
                <Maximize2 className="size-3" /> Fit
              </Button>
              <Separator orientation="vertical" className="h-5 mx-1" />
              <Button variant="ghost" size="xs" onClick={resetFilters} className="h-7 gap-1 text-[10px]">
                <RotateCcw className="size-3" /> Reset
              </Button>
              <Button variant="ghost" size="xs" onClick={reset} className="h-7 gap-1 text-[10px] text-destructive">
                <RefreshCw className="size-3" /> New
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        {/* ── Left Panel: Tools ── */}
        <div className="space-y-3">
          {/* Tool Tabs */}
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: "adjust" as ToolTab, label: "Adjust", icon: SlidersHorizontal },
                  { id: "resize" as ToolTab, label: "Resize", icon: Move },
                  { id: "crop" as ToolTab, label: "Crop", icon: Crop },
                  { id: "filters" as ToolTab, label: "Filters", icon: Palette },
                  { id: "bgremove" as ToolTab, label: "BG Rem.", icon: Eraser },
                  { id: "presets" as ToolTab, label: "Presets", icon: Sparkles },
                ].map((tab) => (
                  <button key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all",
                      activeTab === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <tab.icon className="size-3" /> {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <Card>
            <CardContent className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {/* Adjust Tab */}
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Basic Adjustments</h4>
                  {filterSlider("Rotate", <RotateCcw className="size-3" />, rotation, 0, 360, 1, setRotation, `${rotation}°`)}
                  <div className="flex gap-2">
                    <Button variant={flip === "horizontal" || flip === "both" ? "default" : "outline"} size="xs" onClick={() => handleFlip("horizontal")} className="flex-1 gap-1 text-[10px] h-7">
                      <FlipHorizontal className="size-3" /> H-Flip
                    </Button>
                    <Button variant={flip === "vertical" || flip === "both" ? "default" : "outline"} size="xs" onClick={() => handleFlip("vertical")} className="flex-1 gap-1 text-[10px] h-7">
                      <FlipVertical className="size-3" /> V-Flip
                    </Button>
                  </div>
                  {filterSlider("Canvas Padding", <Square className="size-3" />, canvasPadding, 0, 200, 1, setCanvasPadding, `${canvasPadding}px`)}
                </div>
              )}

              {/* Resize Tab */}
              {activeTab === "resize" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resize</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Width (px)</label>
                      <input type="number" value={targetWidth} onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring" min={1} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground">Height (px)</label>
                      <input type="number" value={targetHeight} onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-xs outline-none focus-visible:border-ring" min={1} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setLockAspect(!lockAspect)}
                      className={cn("px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all",
                        lockAspect ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                      )}>
                      <Move className="size-3 inline mr-1" /> {lockAspect ? "Aspect Locked" : "Aspect Free"}
                    </button>
                  </div>
                  <Separator />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Compression</h4>
                  <div className="flex flex-wrap gap-1">
                    {COMPRESSION_MODES.map((m) => (
                      <button key={m.name} onClick={() => applyCompressionMode(m.name)}
                        className={cn("px-2 py-1 rounded-md text-[9px] font-medium border transition-all flex-1 text-center",
                          compressionMode === m.name ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                        )}>
                        <div>{m.label}</div>
                        <div className="text-[7px] opacity-60">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                  {filterSlider("Quality", <Sun className="size-3" />, quality * 100, 10, 100, 1, (v) => handleQualityChange(v / 100), `${Math.round(quality * 100)}%`)}
                  <p className="text-[9px] text-muted-foreground">Est. size: {estimatedSize > 1024 * 1024 ? `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB` : `${(estimatedSize / 1024).toFixed(0)} KB`}</p>
                </div>
              )}

              {/* Crop Tab */}
              {activeTab === "crop" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Crop</h4>
                  <div className="flex flex-wrap gap-1">
                    {CROP_PRESETS.map((p) => (
                      <button key={p.label} onClick={() => { setCropPreset(p.ratio); setIsCropping(true) }}
                        className={cn("px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all",
                          cropPreset === p.ratio && isCropping ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                        )}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="default" size="xs" onClick={() => setIsCropping(!isCropping)} className="flex-1 text-[10px] h-7 gap-1">
                      <Crop className="size-3" /> {isCropping ? "Crop Active" : "Start Crop"}
                    </Button>
                    <Button variant="outline" size="xs" onClick={() => { setCropRect(null); setIsCropping(false) }} className="text-[10px] h-7">
                      Clear
                    </Button>
                  </div>
                  {cropRect && cropRect.w > 0 && (
                    <p className="text-[9px] text-muted-foreground">Selection: {Math.round(cropRect.w)}×{Math.round(cropRect.h)}px</p>
                  )}
                  {CROP_PRESETS.filter(p => p.ratio).map(p => (
                    <button key={p.label}
                      onClick={() => {
                        setCropPreset(p.ratio)
                        if (previewDataUrl && originalImageRef.current) {
                          const iw = originalImageRef.current.naturalWidth
                          const ih = originalImageRef.current.naturalHeight
                          let cw = iw, ch = iw / p.ratio!
                          if (ch > ih) { ch = ih; cw = ih * p.ratio! }
                          setCropRect({ x: (iw - cw) / 2, y: (ih - ch) / 2, w: cw, h: ch })
                        }
                      }}
                      className="text-[9px] text-muted-foreground underline cursor-pointer hover:text-foreground"
                    >
                      Auto {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === "filters" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filters</h4>
                    <Button variant="ghost" size="xs" onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="text-[9px] h-6 gap-1">
                      <RotateCcw className="size-2.5" /> Reset All
                    </Button>
                  </div>
                  {filterSlider("Brightness", <Sun className="size-3" />, filters.brightness, 0, 200, 1, (v) => setFilters((p) => ({ ...p, brightness: v })))}
                  {filterSlider("Contrast", <Contrast className="size-3" />, filters.contrast, 0, 200, 1, (v) => setFilters((p) => ({ ...p, contrast: v })))}
                  {filterSlider("Saturation", <Droplets className="size-3" />, filters.saturation, 0, 200, 1, (v) => setFilters((p) => ({ ...p, saturation: v })))}
                  {filterSlider("Exposure", <Sun className="size-3" />, filters.exposure, -100, 100, 1, (v) => setFilters((p) => ({ ...p, exposure: v })))}
                  {filterSlider("Hue Shift", <Palette className="size-3" />, filters.hueShift, 0, 360, 1, (v) => setFilters((p) => ({ ...p, hueShift: v })), `${filters.hueShift}°`)}
                  {filterSlider("Blur", <Eye className="size-3" />, filters.blur, 0, 100, 1, (v) => setFilters((p) => ({ ...p, blur: v })))}
                  {filterSlider("Sharpen", <Crop className="size-3" />, filters.sharpen, 0, 100, 1, (v) => setFilters((p) => ({ ...p, sharpen: v })))}
                  {filterSlider("Grayscale", <Contrast className="size-3" />, filters.grayscale, 0, 100, 1, (v) => setFilters((p) => ({ ...p, grayscale: v })), `${filters.grayscale}%`)}
                  {filterSlider("Sepia", <Palette className="size-3" />, filters.sepia, 0, 100, 1, (v) => setFilters((p) => ({ ...p, sepia: v })), `${filters.sepia}%`)}
                  {filterSlider("Vignette", <Sun className="size-3" />, filters.vignette, 0, 100, 1, (v) => setFilters((p) => ({ ...p, vignette: v })), `${filters.vignette}%`)}
                  {filterSlider("Noise/Grain", <Droplets className="size-3" />, filters.noise, 0, 100, 1, (v) => setFilters((p) => ({ ...p, noise: v })), `${filters.noise}%`)}
                </div>
              )}

              {/* Background Removal Tab */}
              {activeTab === "bgremove" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Removal</h4>
                  <div className="flex items-center gap-2">
                    <Button variant={bgRemove.active ? "default" : "outline"} size="xs" onClick={() => setBgRemove((p) => ({ ...p, active: !p.active }))} className="flex-1 gap-1 text-[10px] h-7">
                      <Eraser className="size-3" /> {bgRemove.active ? "BG Remove Active" : "Remove Background"}
                    </Button>
                  </div>
                  {bgRemove.active && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={bgColor}
                            onChange={(e) => {
                              setBgColor(e.target.value)
                              const hex = e.target.value.replace("#", "")
                              setBgRemove((p) => ({
                                ...p,
                                color: [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)],
                              }))
                            }}
                            className="h-8 w-12 rounded border border-input cursor-pointer bg-transparent"
                          />
                          <span className="text-[10px] text-muted-foreground">{bgColor}</span>
                          <Button variant="ghost" size="xs" className="text-[9px] h-6 ml-auto"
                            onClick={() => {
                              toast.success("Click on the preview to pick a color (auto-detect)")
                              setBgRemove((p) => ({ ...p, mode: "auto" }))
                            }}>
                            <MousePointer2 className="size-2.5" /> Auto Detect
                          </Button>
                        </div>
                      </div>
                      {filterSlider("Tolerance", <SlidersHorizontal className="size-3" />, bgRemove.tolerance, 0, 100, 1, (v) => setBgRemove((p) => ({ ...p, tolerance: v })), `${bgRemove.tolerance}%`)}
                      {filterSlider("Edge Feather", <Scissors className="size-3" />, bgRemove.feather, 0, 100, 1, (v) => setBgRemove((p) => ({ ...p, feather: v })), `${bgRemove.feather}%`)}
                      <div className="p-3 rounded-lg bg-muted/20 border border-dashed">
                        <p className="text-[9px] text-muted-foreground">
                          {bgRemove.active ? "Background removal active in preview. Adjust tolerance for better results. Lower tolerance = stricter color matching." : "Enable background removal to see the transparent preview."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Presets Tab */}
              {activeTab === "presets" && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">One-Click Presets</h4>
                  <p className="text-[9px] text-muted-foreground">Apply resize, filters, and optional background removal</p>
                  <div className="space-y-2">
                    {PRESETS.map((preset) => (
                      <button key={preset.name} onClick={() => applyPreset(preset)}
                        className="w-full text-left p-3 rounded-lg border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">{preset.label}</span>
                          <Badge variant="outline" className="text-[8px]">{preset.width}×{preset.height}</Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">{preset.description}</p>
                        <div className="flex gap-1 mt-1.5">
                          {preset.filterPresets && <Badge variant="secondary" className="text-[7px] px-1 py-0">Filters</Badge>}
                          {preset.bgRemove && <Badge variant="secondary" className="text-[7px] px-1 py-0">BG Remove</Badge>}
                          <Badge variant="secondary" className="text-[7px] px-1 py-0">{preset.format?.split("/")[1]?.toUpperCase() || "PNG"}</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right Panel: Preview ── */}
        <div className="space-y-3">
          <Card className="flex-1">
            <CardContent className="p-0 relative">
              {/* Preview Canvas */}
              <div
                ref={cropPreviewRef}
                className={cn(
                  "relative flex items-center justify-center overflow-auto",
                  "min-h-[400px] max-h-[600px] bg-[image:repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] dark:bg-[image:repeating-conic-gradient(#374151_0%_25%,transparent_0%_50%)]",
                  isCropping && "cursor-crosshair"
                )}
                onMouseDown={isCropping ? handleCropMouseDown : undefined}
                onMouseMove={isCropping ? handleCropMouseMove : undefined}
                onMouseUp={isCropping ? handleCropMouseUp : undefined}
                onMouseLeave={isCropping ? handleCropMouseUp : undefined}
              >
                {showBeforeAfter && originalDataUrl ? (
                  <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={originalDataUrl} alt="Original" className="max-w-full max-h-[500px] object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80"
                      style={{ clipPath: "inset(0 50% 0 0)" }}>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-background/80 text-[9px] font-medium">Original</div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-background/80 text-[9px] font-medium">Edited</div>
                  </div>
                ) : (
                  <>
                    {previewDataUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={showBeforeAfter && originalDataUrl ? originalDataUrl : previewDataUrl}
                          alt="Preview"
                          className="max-w-full max-h-[500px] object-contain transition-all"
                          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                        />
                      </>
                    )}
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundImage: "linear-gradient(rgba(128,128,128,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.15) 1px, transparent 1px)",
                          backgroundSize: `${50 * zoom}px ${50 * zoom}px`,
                        }}
                      />
                    )}
                    {isCropping && cropRect && cropRect.w > 0 && (
                      <div className="absolute border-2 border-primary/70 bg-primary/5 pointer-events-none"
                        style={{
                          left: cropRect.x * zoom,
                          top: cropRect.y * zoom,
                          width: cropRect.w * zoom,
                          height: cropRect.h * zoom,
                        }}
                      />
                    )}
                    {bgRemove.active && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-[8px] font-medium text-green-600 dark:text-green-400 backdrop-blur-sm">
                        BG Removal Active
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Export Bar ── */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-medium text-muted-foreground">Format</label>
                    <select value={selectedFormat} onChange={(e) => handleFormatChange(e.target.value)}
                      className="h-7 rounded-lg border border-input bg-transparent px-2 text-[10px] outline-none focus-visible:border-ring">
                      {FORMAT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-medium text-muted-foreground">Quality</label>
                    <select value={compressionMode} onChange={(e) => applyCompressionMode(e.target.value)}
                      className="h-7 rounded-lg border border-input bg-transparent px-2 text-[10px] outline-none focus-visible:border-ring">
                      {COMPRESSION_MODES.map((m) => (
                        <option key={m.name} value={m.name}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-4 whitespace-nowrap">
                    Est: {estimatedSize > 1024 * 1024 ? `${(estimatedSize / (1024 * 1024)).toFixed(1)} MB` : `${(estimatedSize / 1024).toFixed(0)} KB`}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="default" size="xs" onClick={convert} disabled={isProcessing || !previewDataUrl} className="gap-1 text-[10px] h-7">
                    {isProcessing ? "Processing…" : "Apply"}
                    <Check className="size-3" />
                  </Button>
                  {outputUrl && (
                    <>
                      <Button variant="outline" size="xs" onClick={download} className="gap-1 text-[10px] h-7">
                        <Download className="size-3" /> Download
                      </Button>
                      <Button variant="outline" size="xs" onClick={copyToClipboard} className="gap-1 text-[10px] h-7">
                        <Clipboard className="size-3" /> Copy
                      </Button>
                    </>
                  )}
                  {outputUrl && (
                    <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-border/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={outputUrl} alt="Output preview" className="h-8 w-8 rounded object-cover border" />
                      <span className="text-[9px] text-muted-foreground">Output</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
