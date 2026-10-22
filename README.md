# Scintillart

Website for **Scintillart** (scintillart.com): an immersive entry page where Philine's handmade collage becomes a portal, leading into the retreats page.

> Where a spark becomes art.

Stack: React 19 + TypeScript + Vite, React Router, GSAP (free core only), and three.js with React Three Fiber for the portal scene only. Everything else is plain HTML and CSS Modules. Static output, deployed on Cloudflare Pages.

## Local development

Requires Node 20.19+ (22 recommended, see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally (http://localhost:4173)
```

Append `?portal-debug` to the URL to expose `window.__scintillart` (`gsap`, `controller`) for tuning timelines in the console. It's always on with `npm run dev`.

## Shareable preview

`npm run build:preview` builds into `dist-preview/` with relative paths, an in-memory router (no URL changes) and the fonts embedded in the CSS, so the site can run inside a sandboxed preview frame such as a Claude artifact. Use the normal `npm run build` for the real site.

## Routes

| Path        | Page                                                    |
| ----------- | ------------------------------------------------------- |
| `/`         | Entry: wordmark, collage portal, definition, CTA        |
| `/retreats` | The retreat near Aljezur (direct visits work, see below) |
| anything else | Not-found view                                        |

## Deployment (Cloudflare Pages)

| Setting                | Value           |
| ---------------------- | --------------- |
| Framework preset       | None (or Vite)  |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Node version           | 22 (`NODE_VERSION=22` env var if needed) |

Routing: the build writes `dist/retreats.html` (a copy of `index.html`, see `vite.config.ts`), so Pages serves `/retreats` as a real file, with no rewrite rule and no trailing-slash redirect. Any other unknown path falls back to `index.html` (Pages' default single-page behaviour when there is no `404.html`) and the client router shows the not-found view. `public/_headers` sets long caching for hashed assets.

Nothing has been deployed and no DNS has been changed. Connecting the repo to a Pages project and pointing scintillart.com at it are still to do, by someone with access to the Cloudflare account.

## Project structure

```
src/
  main.tsx, App.tsx            router, scroll + focus management on route change
  content/brand.ts             homepage copy (approved wording: don't rewrite)
  content/retreat.ts           retreat content: single source of truth for /retreats
  styles/tokens.css            brand tokens: colours, fonts, spacing
  styles/fonts.ts              self-hosted font imports (change typefaces here)
  components/                  ScintillartWordmark, BrandDefinition, ActionLink
  pages/EntryPage.tsx          entry layout, wires up the portal
  pages/RetreatPage.tsx        retreats page (also pre-rendered inside the transition)
  portal/
    timing.ts                  ALL animation timings and visual controls
    usePortalMachine.ts        state machine + GSAP timelines
    PortalScene.tsx            WebGL depth scene (lazy chunk with three.js)
    layerMaterial.ts           shader for fragments + restrained foil highlight
    PortalTransition.tsx       hidden destination layer revealed through the arch
    archPath.ts                pointed-arch clip path
    capabilities.ts            reduced motion, WebGL and quality detection
    manifest.ts                types/loader for public/portal/manifest.json
scripts/prepare_portal_layers.py   builds the portal layers from the photograph
art-source/                    original photo + masks (not served)
public/portal/                 generated layer images + manifest (served)
licenses/                      font licences (SIL OFL 1.1)
```

## How the entry works

State machine: `loading → revealing → idle → entering → entered`.

- **loading**: critical fonts (max 1.5s) and the portal textures load. No fake progress. If the art isn't ready after 1.2s, the text is revealed on its own and the art follows when it arrives. The "Our retreats" link is a real `<a href="/retreats">` and works throughout, even without JavaScript.
- **revealing** (about 2s): wordmark settles, the collage fades in flat, its paper layers part in depth, one light sweep crosses the foil, the definition and CTA fade in. A "Skip animation" button is visible.
- **scroll**: the cover is one screen (`position: sticky`). The page has a short scroll track whose only job is to step through the three definitions, one at a time; the 1 2 3 marks jump between them. The scrollbar is hidden on the entry page.
- **idle**: pointer-driven tilt and parallax (fine pointers only, damped), foil highlight follows the pointer, the crystal and owl breathe very slightly. Text is still. Rendering pauses when the tab is hidden or the portal is off screen.
- **entering** (about 1.6s, plus a short scroll back to the top on phones): copy fades, the wordmark lifts away, the roof lifts and the base drops, the camera travels into the doorway, and the pre-rendered retreat page appears inside the projected pointed arch and expands with it. Repeat clicks are ignored; "Skip animation" jumps to the end.
- **entered**: route changes to `/retreats`; the identical page replaces the overlay with no jump, and focus moves to its heading.

Fallbacks:

- `prefers-reduced-motion`: still image, no reveal, a 0.3s dissolve to the retreats page.
- No WebGL, a lost context, a texture failure or timeout, or any rendering error: the static collage image, with the same arch-shaped transition done as a CSS zoom.
- If even the image fails, the page still has the wordmark, definition and a working link.

Tuning: change values in `src/portal/timing.ts` (durations, tilt, breathing, lift, camera stop, shadow strength, DPR caps).

## Background

`src/components/Atmosphere.tsx` (every page), in layers: light stone base colour; a light and shadow field (a small WebGL shader of domain-warped noise, drawn at about a fifth of screen resolution so it is soft by nature, drifting very slowly at 24 fps) with cement mottling, in stone tones from the collage (kraft, rose-clay, a faint sage); a static cement tile (`--cement-image`, strength `--cement-opacity`); film grain that flickers gently (`--grain-image`, `--grain-opacity`); a faint vignette. The pointer does not affect the background. It pauses when the tab is hidden, holds still for reduced motion, and falls back to a static CSS version without WebGL.

## Cursor

Retreats page: the cursor is Philine's faceted teardrop crystal (`public/cursor/gem@2x.webp`, cut out and polished from `art-source/cursor/gem-photo-original.jpg`). It hangs from the pointer tip, swings with movement, catches a sweep of light every few seconds and on quick moves, and shifts its colour slightly. Background there is the cloud photograph `public/backgrounds/retreat-sky.webp` under a light bone wash, film grain and vignette.


`src/components/ScintillaCursor.tsx` (all pages): an ink point with a trailing ring that opens over links, scattering small four-point sparks and soft ripples as it moves; a click sends a larger ripple. Colours are sampled from the prismatic foil around the collage's doorway (rose-clay, peach, blush champagne, pale gold, mint and sage glints). Mouse only, off for reduced motion; tuning values at the top of the file.

## Retreats page

One screen on desktop and standard phones (it scrolls only on very short screens). "What people take home" (`retreat.ts` → `takeaways`) rotates one line at a time with a light sweep and sparks, pausing on hover, focus, the pause button, or reduced motion; all lines stay in the page for screen readers.

## Artwork assets

The collage exists only as one flattened phone photograph (`art-source/collage-photo-original.jpg`). `scripts/prepare_portal_layers.py`:

1. corrects the perspective of the kraft sheet,
2. cuts seven fragments with the masks in `art-source/masks/` (floral field, foil roof and star, holographic panel, owl, doorway, silver coils, crystal), plus the kraft ground,
3. fills the part of each layer that is covered by a higher fragment with a dark, very blurred tone, so that when layers separate you see a shadowed recess rather than the same cut-out twice,
4. exports transparent WebPs at two sizes, soft shadows, and `public/portal/manifest.json`.

Honest limits: the masks are machine-assisted (hand-traced outlines refined with OpenCV GrabCut), not true cut-outs. Edges are good at viewing size but not perfect, and the recesses are a stand-in for image detail that doesn't exist in the photo. Depth motion is kept small for that reason.

To refine: edit a mask in any image editor (white = keep), then `pip install opencv-python-headless numpy pillow && npm run portal:layers`.

For production quality, the ideal source material is a high-resolution, evenly lit, straight-on scan or photo of the collage, plus each element photographed or scanned separately on a neutral background before gluing (or carefully retouched cut-outs), delivered as transparent PNG/WebP at about 2000px collage height:

- `paper` (kraft ground, complete, with nothing on it)
- `flowers` (house-shaped floral field, complete behind the panel)
- `roof` (foil triangle + kraft triangle + star)
- `foil` (holographic panel, complete behind the doorway)
- `owl`, `doorway`, `coils`, `crystal`

With complete layers the recess fill becomes unnecessary and the depth can be increased.

## Typography

- Wordmark and headings: **Playfair Display Italic 400**
- Text: **Poppins 400 and 700** (bold for leads, labels and actions)

Both are self-hosted from `@fontsource` (Latin + Latin Extended subsets only) under the SIL Open Font License 1.1; licence texts are in `licenses/`. To swap a typeface, edit `src/styles/fonts.ts` and the `--font-display` / `--font-text` tokens in `src/styles/tokens.css`. The wordmark is fitted to the viewport using `--wordmark-em-width` (the measured advance width of "Scintillart" in the display face), so re-measure it if the face changes.

For reference, the unseen.co site uses **Saol Display** (Schick Toikka) and **Neue Montreal** (Pangram Pangram). Both are commercial fonts that need a paid web licence from their foundries; they are not used here.

## Content rules

`src/content/retreat.ts` holds only confirmed information. Price, exact dates and the guest house are marked as being confirmed. Don't add prices, dates, accommodation details, testimonials, availability or outcome promises until they're real. `retreat/scintillart-retreat-description.md` didn't exist when this was built; if it's added, reconcile `retreat.ts` with it.

"Register your interest" opens the visitor's email app (`mailto:`) with a prefilled subject. There is no form backend; nothing is submitted on the site. Confirm the address in `retreat.ts` (`interest.email`) or replace it with a form endpoint.

## Open items

- Confirm the interest email address, or add a registration form/service.
- Cloudflare Pages project + DNS for scintillart.com (not done).
- Better source photography / separate layers for the portal (see Artwork assets).
- Final retreat details (dates, price, guest house) when confirmed.
- Social sharing image (`og:image`) once there's an approved one.
