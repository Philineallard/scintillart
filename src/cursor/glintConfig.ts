/**
 * Refraction glints (content pages): central controls.
 * Start low. If it ever reads as glitter, confetti or a glowing trail, turn it down.
 */
export const GLINT = {
  /** Overall strength of the light (0–1). 0.6 is about the lowest that reads on the ivory ground. */
  intensity: 0.6,
  /** Size multiplier for each sliver of light. */
  highlightSize: 1,
  /** Chromatic separation at the edges, in CSS px (rose on one side, mint on the other). */
  colourSeparation: 1.4,
  /** Average pointer travel (px) between glints. Higher = rarer. */
  frequency: 170,
  /** How long a glint takes to dissolve (ms). */
  fadeDuration: 750,
}
