/**
 * Self-hosted fonts (SIL Open Font License, see /licenses).
 * Only the Latin + Latin Extended subsets and the weights in use are bundled.
 *
 * Display: Playfair Display Italic 400 (wordmark, headings)
 * Text:    Poppins 400 (reading copy) and 700 (labels, actions, definition leads)
 *
 * To swap a typeface, change the imports here and the --font-display /
 * --font-text tokens in tokens.css.
 */
import '@fontsource/playfair-display/latin-400-italic.css'
import '@fontsource/playfair-display/latin-ext-400-italic.css'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-ext-400.css'
import '@fontsource/poppins/latin-700.css'
import '@fontsource/poppins/latin-ext-700.css'

/** Fonts the entrance reveal waits for (briefly) so the wordmark doesn't reflow mid-animation. */
export const CRITICAL_FONTS = ['italic 400 1em "Playfair Display"', '400 1em Poppins', '700 1em Poppins']

export function loadCriticalFonts(timeoutMs = 1500): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return Promise.resolve()
  const loads = Promise.all(CRITICAL_FONTS.map((f) => document.fonts.load(f))).then(() => undefined)
  const timeout = new Promise<void>((r) => setTimeout(r, timeoutMs))
  return Promise.race([loads, timeout]).catch(() => undefined)
}
