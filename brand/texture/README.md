The website's film grain, which is the approved texture effect for Scintillart backgrounds.

- Recipe (light surfaces): a full-bleed layer over `bg` with `background-image: url(assets/Backgrounds/grain-film-dark-speckle.svg)`, tile 220 × 220px, `mix-blend-mode: multiply`, opacity 1. The tile is SVG fractal noise (baseFrequency 1.25, two octaves, seamless) in warm brown with an alpha factor of 0.27. Add a soft vignette: `radial-gradient(130% 120% at 50% 45%, rgba(36,33,31,0) 55%, rgba(36,33,31,.075) 100%)`.
- Dark surfaces: `grain-film-light-speckle.svg` (baseFrequency 1.05, desaturated, alpha table 0.42/0/0.42), normal blending, opacity 1.
- On the website the layer is oversized by 20% and jumps between a few offsets every 0.8 seconds, which gives the film flicker. Do this on screen only, and switch it off under `prefers-reduced-motion`. For print, social images, PDFs and any static use, keep the grain still.
- Grain sits behind content: text, controls and forms stay crisp above it (give content a higher z-index) and `pointer-events: none` on the layer.
- Never apply grain or a vignette to artwork, photographs or the logo. Grain can read as an analogue or film origin, which would misrepresent a photograph or a work, so it belongs to the background only.
- The effect is stronger than the 2–4% opacity in the written guidelines (its alpha factor is 0.27). Treat the site as the reference and review the guideline wording; reduce the layer's opacity where text is small or the surface is large.
- The consumer provides the surface colour and decides whether the jitter runs.
