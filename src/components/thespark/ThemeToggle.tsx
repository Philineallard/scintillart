import type { JSX } from 'react'
import type { BrandTheme } from '../../hooks/useBrandTheme'
import styles from './ThemeToggle.module.css'

type Props = {
  theme: BrandTheme | null
  onChange: (theme: BrandTheme) => void
  label: string
  lightLabel: string
  darkLabel: string
  tabIndex?: number
}

/** A sun: a circle and eight short rays, 1px-feel strokes to match the hairlines. */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.75 1.75M16.95 16.95l1.75 1.75M5.3 18.7l1.75-1.75M16.95 7.05l1.75-1.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="square"
      />
    </svg>
  )
}

/** A crescent moon. */
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M19.5 14.6A7.75 7.75 0 0 1 9.4 4.5a7.75 7.75 0 1 0 10.1 10.1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/** Light / dark as two icon buttons; the current theme is full strength and underlined. */
export function ThemeToggle({ theme, onChange, label, lightLabel, darkLabel, tabIndex }: Props) {
  const options: [BrandTheme, string, () => JSX.Element][] = [
    ['light', lightLabel, SunIcon],
    ['dark', darkLabel, MoonIcon],
  ]
  return (
    <div className={styles.toggle} role="group" aria-label={label}>
      {options.map(([value, text, Icon]) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          aria-label={text}
          title={text}
          aria-pressed={theme === value}
          onClick={() => onChange(value)}
          tabIndex={tabIndex}
        >
          <Icon />
        </button>
      ))}
    </div>
  )
}
