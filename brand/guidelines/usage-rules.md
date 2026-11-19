Scintillart is an artist agency and creative production partner. These rules apply to websites, social media, print and presentations; the sections that follow carry the full Brand Guidelines v2.0 (November 2026). Where this README and a section differ, the section wins.

## Use first

- Master slogan: "Where a spark becomes art." Use "a spark" in the slogan, never "the spark". Do not rewrite or rotate it, and use one headline or slogan per composition.
- The retreat is called "The Spark". Always write it with the capital "The". It is a name, separate from the slogan's wording: never use it as the slogan or for the brand as a whole.
- Functional descriptor: "Artist-led experiences & creative services." Use it where the audience needs to know what the business is.
- Art first, clarity always, quality in the details. Check every piece against the Final approval checklist section before it is published.

## Colour

- Seven colours only: cinematic-white (#F9F8F5, main bright background; Gallery Ivory #F5F1E9 stays only as light ink on dark, label on accent and panels), carbon, parchment, aubergine, warm-grey, oxide, antique-brass. Add no others, and never tint or gradient them.
- Paint with the semantic tokens so one layout works in both themes: `bg`, `bg-alt`, `text`, `text-muted`, `accent`, `on-accent`, `accent-edge`, `accent-editorial`, `hairline`, `control-border`, `focus-ring`.
- Neutral colours dominate. Use one dominant accent per layout: `accent` (aubergine). `accent-editorial` (oxide) is optional, never a second compulsory accent.
- Antique-brass is decorative (`hairline` rules, print finishing) and never a text colour.
- Preferred text pairings: carbon on cinematic-white, carbon on parchment, ivory on aubergine, ivory on carbon. Use `text-muted` (warm grey) on cinematic-white only.
- Light theme: `bg` cinematic-white, `bg-alt` parchment, `text` carbon. Dark theme: `bg` carbon, `bg-alt` aubergine, `text` ivory.
- Artwork keeps its original colour; do not recolour photographs to match the palette.
- HEX values define digital colour. Approve print conversions with the printer against a physical proof.

## Typography

- Two families only. Headlines, artist names, editorial statements and selected quotations: Playfair Display regular, sentence case, one family per headline (`display`, `h1`–`h3`). Italic (`quote`) is an occasional accent, never a whole headline.
- Body copy, navigation, practical information, captions and buttons: Poppins. Regular (`body`, `lead`) for reading, Medium (`label`, `button`) for labels and navigation, Semibold (`body-strong`) only where hierarchy requires it. Do not use Light or ExtraLight.
- Digital scale: hero 48–88px (`display`), section 34–52px (`h1`, `h2`), subheading 24–30px (`h3`), body 16–18px, caption 13–14px (`body-sm`, `caption`).
- Keep body leading between 1.5 and 1.7. Do not stretch, distort or widely track body copy. Use uppercase sparingly, for short labels.
- The Scintillart wordmark is the only place where lettering mixes (italic Playfair Display letters with two heavy bars for the "ll"). Every other heading, including a heading that contains the name, is Playfair Display only: no mixed fonts. Where the name has to appear as the logo, or the double lettering cannot be produced in text, place the SVG wordmark (`logos/scintillart-wordmark-dark.svg` on light surfaces, `scintillart-wordmark-light.svg` on dark) instead of typing it. In ordinary sentences, write Scintillart as plain text.
- Both families are supplied as self-hosted woff2 files in `fonts/` (SIL Open Font License); `tokens/tokens.css` already declares them.

## Logo

- Use the approved artwork in `logos/`, preferably the SVG (`scintillart-wordmark-dark.svg` on light surfaces, `scintillart-wordmark-light.svg` on dark). Never retype the name in a similar font.
- Clear space at least the height of the capital S. Preserve proportions; no shadows, outlines, glow or texture; no arbitrary badge; do not animate individual letters.
- S symbol (`symbol/`), taken from the website icon: use it where the full name is hard to read (avatars, favicons, small corners), never beside the full wordmark.
- The star motif (not included in this pack) is very optional and not approved; do not build layouts around it. It has no connection to the retreat The Spark.

## Shape, texture and motion

- Square corners (`radius-none`), flat colour fields and 1px `hairline` rules; no shadows, no metallic gradients, no ornamental framing.
- The website's film grain is the approved texture: a grain layer (and soft vignette) on background surfaces only, never over artwork, photographs, logos, text or controls. See `texture/README.md` for the recipe. Keep it still in print, social images and PDFs; the web jitter is optional and off under reduced motion.
- Motion is restrained: no compulsory intro, no scroll hijacking, no flashing, nothing over forms; respect reduced-motion preferences.
- Spacing: use the `space-*` scale and the `gutter-min`/`gutter-max` page padding; margins and hierarchy organise information.

## Writing

- Clear international English, British spelling. Short paragraphs, active verbs, specific nouns; name the artist, discipline, place and format. Calls to action in sentence case, such as "Discuss a project".
- Pair expressive headlines with concrete information; avoid unsupported claims, superlatives and exclamation marks.
