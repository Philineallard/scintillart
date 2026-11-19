/** Make sure the brand fonts are ready before text is painted onto canvases. */
export function fontsReady(timeoutMs = 2500) {
  const faces = ['400 100px "Playfair Display"', 'italic 400 100px "Playfair Display"', '500 30px Poppins', '400 30px Poppins'];
  return Promise.race([
    Promise.all(faces.map((f) => document.fonts.load(f))).then(() => undefined),
    new Promise<void>((r) => setTimeout(r, timeoutMs)),
  ]).catch(() => undefined);
}
