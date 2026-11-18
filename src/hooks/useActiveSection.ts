import { useEffect, useState } from 'react'

/**
 * The id of the section currently crossing a line just under the sticky header
 * (about 35% down the viewport), for the chapter navigation. null above the first one.
 */
export function useActiveSection(ids: readonly string[], enabled = true) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const sections = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        // The last section in document order that touches the line wins.
        const current = [...ids].reverse().find((id) => visible.has(id)) ?? null
        setActive(current)
      },
      { rootMargin: '-35% 0px -64% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [ids, enabled])

  return active
}
