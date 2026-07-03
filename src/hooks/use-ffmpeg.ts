"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"

export interface FFmpegLoadState {
  loaded: boolean
  loading: boolean
  progress: number
  error: string | null
}

let ffmpegSingleton: FFmpeg | null = null
let ffmpegLoadPromise: Promise<FFmpeg> | null = null

function patchWorker() {
  const OrigWorker = globalThis.Worker
  if ((OrigWorker as any).__patched) return
  ;(globalThis.Worker as any) = class PatchedWorker extends OrigWorker {
    constructor(url: string | URL, opts?: WorkerOptions) {
      console.log("[ffmpeg-worker] new Worker:", String(url), opts)
      super(url, opts)
      this.addEventListener("error", (e) => {
        console.error("[ffmpeg-worker] error event:", e.message, e.filename, e.lineno)
      })
      this.addEventListener("messageerror", (e) => {
        console.error("[ffmpeg-worker] messageerror:", e)
      })
    }
  }
  ;(globalThis.Worker as any).__patched = true
  console.log("[ffmpeg] Worker constructor patched")
}

async function initFFmpeg(
  onProgress: (p: number) => void,
): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton
  if (ffmpegLoadPromise) return await ffmpegLoadPromise

  ffmpegLoadPromise = (async () => {
    console.log("[ffmpeg] === START ===")

    // Patch Worker to catch errors
    patchWorker()

    // ---- Step 1: Create instance ----
    console.log("[ffmpeg] new FFmpeg()")
    const ffmpeg = new FFmpeg()

    ffmpeg.on("log", ({ type, message }) => console.log(`[ffmpeg:${type}]`, message))
    ffmpeg.on("progress", ({ progress: p }) => {
      console.log("[ffmpeg] progress", p)
      onProgress(Math.round(p * 100))
    })

    // ---- Step 2: Try blob URL strategy, fallback to direct ----
    let coreURL: string
    let wasmURL: string
    try {
      console.log("[ffmpeg] toBlobURL(ffmpeg-core.js)")
      const t0 = performance.now()
      coreURL = await toBlobURL("/ffmpeg/ffmpeg-core.js", "text/javascript")
      console.log("[ffmpeg] core blob OK", (performance.now() - t0).toFixed(0) + "ms")
    } catch (e) {
      console.warn("[ffmpeg] toBlobURL core failed, using direct:", e)
      coreURL = "/ffmpeg/ffmpeg-core.js"
    }
    try {
      console.log("[ffmpeg] toBlobURL(ffmpeg-core.wasm)")
      const t1 = performance.now()
      wasmURL = await toBlobURL("/ffmpeg/ffmpeg-core.wasm", "application/wasm")
      console.log("[ffmpeg] wasm blob OK", (performance.now() - t1).toFixed(0) + "ms")
    } catch (e) {
      console.warn("[ffmpeg] toBlobURL wasm failed, using direct:", e)
      wasmURL = "/ffmpeg/ffmpeg-core.wasm"
    }

    // ---- Step 3: Call load ----
    // Strategy A: try with classWorkerURL first
    console.log("[ffmpeg] ffmpeg.load() A: classWorkerURL=/ffmpeg/worker.js")
    console.log("[ffmpeg]   coreURL:", coreURL.substring(0, 60))
    console.log("[ffmpeg]   wasmURL:", wasmURL.substring(0, 60))

    const t0 = performance.now()
    try {
      await ffmpeg.load({
        coreURL,
        wasmURL,
        classWorkerURL: `${window.location.origin}/ffmpeg/worker.js`,
      })
      console.log("[ffmpeg] load() A resolved in", (performance.now() - t0).toFixed(0) + "ms")
    } catch (e1) {
      console.warn("[ffmpeg] load() A failed:", e1)
      console.log("[ffmpeg] ffmpeg.load() B: trying without classWorkerURL")
      // Strategy B: without classWorkerURL (let bundler handle worker.js)
      const t1 = performance.now()
      try {
        await ffmpeg.load({
          coreURL,
          wasmURL,
        })
        console.log("[ffmpeg] load() B resolved in", (performance.now() - t1).toFixed(0) + "ms")
      } catch (e2) {
        console.error("[ffmpeg] load() B also failed:", e2)
        throw e2
      }
    }

    console.log("[ffmpeg] loaded:", ffmpeg.loaded)
    console.log("[ffmpeg] === DONE ===")
    ffmpegSingleton = ffmpeg
    return ffmpeg
  })()

  try { return await ffmpegLoadPromise } finally { ffmpegLoadPromise = null }
}

export function useFFmpeg() {
  const [state, setState] = useState<FFmpegLoadState>({
    loaded: false, loading: false, progress: 0, error: null,
  })
  const ref = useRef<FFmpeg | null>(null)

  const load = useCallback(async () => {
    if (state.loaded || state.loading) return
    if (ffmpegSingleton?.loaded) {
      ref.current = ffmpegSingleton
      setState({ loaded: true, loading: false, progress: 100, error: null })
      return
    }
    setState((s) => ({ ...s, loading: true }))
    try {
      ref.current = await initFFmpeg((p) => setState((s) => ({ ...s, progress: p })))
      setState({ loaded: true, loading: false, progress: 100, error: null })
    } catch (e) {
      console.error("[ffmpeg] init failed:", e)
      setState({ loaded: false, loading: false, progress: 0, error: e instanceof Error ? e.message : String(e) })
    }
  }, [state.loaded, state.loading])

  const getFFmpeg = useCallback(() => {
    if (!ref.current) throw new Error("FFmpeg not loaded")
    return ref.current
  }, [])

  return { ...state, load, getFFmpeg }
}
