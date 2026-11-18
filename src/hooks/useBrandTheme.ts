import { useCallback, useEffect, useState } from 'react'

export type BrandTheme = 'light' | 'dark'

/** Same key as public/theme-init.js, which applies a stored choice before first paint. */
const KEY = 'scintillart-theme'

function stored(): BrandTheme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/**
 * Light/dark theme for brand v2.0 pages. Follows the system until the visitor picks one;
 * the choice is remembered (localStorage) and written to <html data-theme>.
 * Returns null until mounted, so the server render and hydration agree.
 */
export function useBrandTheme(enabled = true) {
  const [theme, setThemeState] = useState<BrandTheme | null>(null)

  useEffect(() => {
    if (!enabled) return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const sync = () => {
      const t = stored() ?? (media.matches ? 'dark' : 'light')
      document.documentElement.dataset.theme = t
      setThemeState(t)
    }
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [enabled])

  const setTheme = useCallback((t: BrandTheme) => {
    try {
      localStorage.setItem(KEY, t)
    } catch {
      // Private mode or blocked storage: the choice still applies for this visit.
    }
    document.documentElement.dataset.theme = t
    setThemeState(t)
  }, [])

  return { theme, setTheme }
}
