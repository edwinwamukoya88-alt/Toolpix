"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface BiblicalThemeContextType {
  biblicalMode: boolean
  toggleBiblicalMode: () => void
  biblicalPerspective: boolean
  toggleBiblicalPerspective: () => void
  calmMode: boolean
  toggleCalmMode: () => void
}

const BiblicalThemeContext = createContext<BiblicalThemeContextType>({
  biblicalMode: false,
  toggleBiblicalMode: () => {},
  biblicalPerspective: false,
  toggleBiblicalPerspective: () => {},
  calmMode: false,
  toggleCalmMode: () => {},
})

export function BiblicalThemeProvider({ children }: { children: ReactNode }) {
  const [biblicalMode, setBiblicalMode] = useState(false)
  const [biblicalPerspective, setBiblicalPerspective] = useState(false)
  const [calmMode, setCalmMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("biblical-theme", biblicalMode)
  }, [biblicalMode])

  useEffect(() => {
    document.documentElement.classList.toggle("calm-mode", calmMode)
  }, [calmMode])

  const toggleBiblicalMode = useCallback(() => setBiblicalMode((p) => !p), [])
  const toggleBiblicalPerspective = useCallback(() => setBiblicalPerspective((p) => !p), [])
  const toggleCalmMode = useCallback(() => setCalmMode((p) => !p), [])

  return (
    <BiblicalThemeContext.Provider
      value={{ biblicalMode, toggleBiblicalMode, biblicalPerspective, toggleBiblicalPerspective, calmMode, toggleCalmMode }}
    >
      {children}
    </BiblicalThemeContext.Provider>
  )
}

export function useBiblicalTheme() {
  return useContext(BiblicalThemeContext)
}
