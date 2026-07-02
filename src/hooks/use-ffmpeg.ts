"use client"

import { useState, useRef, useCallback } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"

export interface FFmpegLoadState {
  loaded: boolean
  loading: boolean
  progress: number
  error: string | null
}

export function useFFmpeg() {
  const [state, setState] = useState<FFmpegLoadState>({
    loaded: false,
    loading: false,
    progress: 0,
    error: null,
  })
  const ffmpegRef = useRef<FFmpeg | null>(null)

  const load = useCallback(async () => {
    if (state.loaded || state.loading) return
    setState((s) => ({ ...s, loading: true, progress: 0, error: null }))

    try {
      const ffmpeg = new FFmpeg()
      ffmpeg.on("progress", ({ progress: p }) => {
        setState((s) => ({ ...s, progress: Math.round(p * 100) }))
      })
      ffmpegRef.current = ffmpeg

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      })

      setState({ loaded: true, loading: false, progress: 100, error: null })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setState({ loaded: false, loading: false, progress: 0, error: msg })
    }
  }, [state.loaded, state.loading])

  const getFFmpeg = useCallback((): FFmpeg => {
    if (!ffmpegRef.current) throw new Error("FFmpeg not loaded")
    return ffmpegRef.current
  }, [])

  return { ...state, load, getFFmpeg }
}
