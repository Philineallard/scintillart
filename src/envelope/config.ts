/** Envelope dimensions in scene units. */
export const ENV = {
  W: 2.2, // envelope width
  H: 1.4, // envelope height
  T: 0.004, // paper thickness
  LW: 2.2 * 0.9, // letter width
  LH: 1.4 * 0.86, // letter height
  LZ: 0.008, // letter depth inside the envelope
  SR: 0.13, // wax seal radius
} as const;

/**
 * Where things are in the banner photograph (pixels of the 2048px export).
 * If you swap the photo, update these three points and the object-position focus.
 */
export const PHOTO = {
  width: 2048,
  height: 1102,
  focusX: 0.46, // must match object-position in EnvelopeGate.module.css
  focusY: 0.62,
  envelope: { x: 850, y: 690 }, // centre of the envelope pile (hit area)
  seal: { x: 940, y: 655, size: 70 }, // wax seal centre and diameter
} as const;

/** Colours sampled from the photograph (artwork keeps its own colour). */
export const MATERIAL_COLOURS = {
  kraft: '#A8957F',
  kraftInside: '#9d9283',
  wax: '#4a1014',
  waxGlow: '#ff5a26',
  scene: '#1d1a18',
} as const;

/** Brand colours used inside the 3D scene (Scintillart tokens). */
export const BRAND = {
  carbon: '#24211F',
  parchment: '#E5DDD0',
  antiqueBrass: '#B59661',
  galleryIvory: '#F5F1E9',
} as const;

/** Seconds into the 3D timeline when the letter fills the screen and the form takes over. */
export const LETTER_HANDOFF = 5.95;
/** Seconds of photo push-in before the 3D scene fades in. */
export const PHOTO_TO_3D = 1.15;
