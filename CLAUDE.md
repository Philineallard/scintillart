# Scintillart website — project brief for Claude Code

Repo: this folder (React + TypeScript + Vite, GSAP, React Three Fiber for the portal only, React Router, Cloudflare Pages).
Work locally. Dev server: http://localhost:5173

## Hard rules
- No deploys, DNS changes, pushes or force-pushes without Igor's explicit approval.
- Do not invent content. Anything unconfirmed is shown as **TBA**. Keep all copy and facts in one content file (e.g. `src/content/thespark.ts`) so confirming a detail is a one-line change.
- No links to BookRetreats anywhere on the site. The only call to action is **Register your interest**.
- British English. Calls to action and headings in sentence case ("Register your interest"). No exclamation marks, superlatives or unsupported claims.

## Design system (Brand Guidelines v2.0)
Source of truth: the brand pack in `brand/` (BRAND-BRIEF.md, guidelines, tokens.css/json, fonts, logos, symbol, texture), shared by everyone who works on this repo, and the Scintillart design system artifact on claude.ai (https://claude.ai/artifact/KNzHQmcfgraru5mafpHy4f). Change brand rules in `brand/` first, then mirror them in `src/styles/brand.css`.
- Light background exception (Igor): `/thespark` light theme uses the homepage's original, brighter cinematic white (the live `Atmosphere` in white mode, with its grain and vignette), not gallery-ivory: `--bg` is #F9F8F5 (`cinematic-white` in the pack). Dark theme: carbon with the brand grain.
- Light/dark switch: sun and moon icons, not words.
- v2.0 is confined to `/thespark` for now (`src/styles/brand.css`, opted in by `[data-brand-root]`). The rest of the site keeps the provisional palette in `src/styles/tokens.css`.
- Light/dark: a visible Light / Dark toggle in the header (follows the system until chosen; remembered).
- Seven colours only: cinematic-white (#F9F8F5, main bright background; gallery-ivory #F5F1E9 stays only as light ink on dark, label on accent fills and panels), carbon, parchment, aubergine, warm-grey, oxide, antique-brass. No tints or gradients. Use the semantic tokens (bg, bg-alt, text, text-muted, accent, on-accent, hairline, focus-ring...) so light and dark themes both work. Antique-brass is decorative only, never text.
- Playfair Display for headlines (regular, sentence case; italic only as an occasional accent). No mixed fonts in any heading, including headings that contain the name Scintillart; the double-font lettering exists only in the wordmark logo. Poppins for body, navigation, labels and buttons (Regular/Medium/SemiBold; no Light).
- Square corners, flat colour, 1px hairlines. No shadows, no ornamental framing.
- Film grain on background surfaces only, never over photos, text, logos or controls.
- Motion: restrained. No compulsory intro, no scroll hijacking, nothing over forms, respect prefers-reduced-motion. Exception (Igor's decision): Lenis smooth scrolling stays on for everyone, reduced motion included.
- Wordmark: the animated `Logotype.tsx` (hover split) is the site's wordmark and stays unchanged (Igor's decision). Use the supplied SVGs (`brand/logos/`) wherever the name must appear as the logo and the Logotype can't be used or the double lettering can't be typed; in ordinary sentences write Scintillart as plain text. Slogan "Where a spark becomes art." is fixed (a spark, never the spark). The retreat is called "The Spark": always with the capital "The", a name separate from the slogan.
- Visual direction for this build: artist agency, gallery, editorial. Award-level layout and transitions, within the rules above. Igor will supply layout/effect references later.

## The Spark page — structure
Title: "The Spark — Creative Retreat, Aljezur, Portugal" (optionally "| Scintillart").
Single immersive scroll page at `/thespark`, eight chapters in this order, each an anchor (#overview ...):
1. Overview
2. The Experience
3. Workshops & Facilitators
4. A Day at The Spark
5. The Venue & Location
6. Food & Wellbeing
7. Accommodation & Pricing
8. FAQ
Then the register form. Old `/retreats` redirects to `/thespark`. A separate `/thespark-artists` page comes later. `/thespark-venue` exists only if it carries unique content; otherwise it folds into the main page (avoid duplicate content).
- Done: `/retreats` → `/thespark` and `/venue` → `/thespark#venue` (301 in `public/_redirects`, `<Navigate>` in the app). The former `/venue` page lives at `/thespark-venue`, noindex and out of the sitemap, until it becomes the bigger venue gallery.
- The homepage's "Our retreats" link (approved wording) goes to `/thespark` through the portal animation; the contact address stays beneath it. The animation itself is left as it is for now.
- All copy and TBA values: `src/content/thespark.ts`.
- Closing banner (Igor, November 2026): Igor's photo of a wax-sealed envelope (`public/thespark/envelope*.webp`) replaces the hero photo in the closing #interest section. Clicking the envelope or its button plays a short sequence (`src/components/thespark/EnvelopeGate.tsx`, engine in `src/envelope/`, plain three.js in a lazy chunk, no extra dependencies): push into the seal, 3D envelope, seal breaks, letter comes out, then the register panel opens. Skippable (click, Escape); reduced motion or no WebGL opens the panel directly; nothing animates over the form. The header and hero buttons still open the panel directly.
- `/thespark-artists` (built November 2026): `src/pages/ArtistsPage.tsx`, text in `src/content/artists.ts`, workshops shared with /thespark (`workshops` in thespark.ts). Layout and motion inspired by an editorial portfolio (Readymag "Simantic"): row of portraits revealed one by one, hover lift 1.4× with number and caption, photos fading in from a flat block. Portraits in `public/artists/` (3:4 WebP) for all seven, supplied by Philine (November 2026): Philine, Igor, Erika Prib and Bruno Palma confirmed; André, Willpower and Manu still to confirm they agree to publication. Their bios are TBA.
Existing sketch at `/retreats` already follows the brand: keep its tone (practices list, participant quotes, key facts).

## Register your interest (popup form)
- Opens as a full-height editorial panel (ivory, or carbon in dark theme); full-screen on mobile. Close with Escape and a close button; return focus to the opener; focus trap; reduced-motion safe. Deep link: `/thespark#register`.
- Fields: name, email, phone (country code + number, required; Philine, November 2026), room preference (preselected from the room clicked), travelling alone or with someone, short message, consent checkbox with privacy policy link, optional newsletter checkbox ("I would love to receive further information about Scintillart.", unticked by default), hidden honeypot field. The privacy policy covers phone and newsletter.
- Sends to hello@scintillart.com via a Cloudflare Pages Function plus a mail service (e.g. Resend; needs API key and a sender verified on scintillart.com). Build and test locally with sending stubbed; do not enable real sending or deploy without approval.
- Do not expose the address in page source if avoidable.
- Privacy policy: `/privacy`, text in `src/content/privacy.ts`. Kept short and general on purpose (Igor): question-style sections, providers by role not by name, retention by purpose; structure modelled on common retreat-site practice (e.g. bookretreats.com), facts true to this site. Controller: "Scintillart is operated by Philine Allard, a sole trader in Portugal"; contact hello@scintillart.com only. Never show her address or tax number (NIF/VAT) on the site. Inbox: hello@scintillart.com is on Zoho Mail (EU) (MX mx.zoho.eu, SPF include:zohomail.eu); DNS is on Cloudflare. Never change the Zoho MX/SPF records; Resend's records go on send.scintillart.com and resend._domainkey. Update it whenever the site starts collecting anything new (analytics, embeds, another form). Not yet reviewed by a lawyer.
- Built (November 2026): `src/components/thespark/RegisterPanel.tsx` (native modal `<dialog>`), buttons in `register.tsx` (mailto fallback without JavaScript), shared validation `src/lib/register.ts`, Pages Function `functions/api/register.ts`. Local dev: Vite stub in `vite.config.ts` logs the payload; email `error@example.com` simulates a failure.
- Sending is OFF: the Function answers 503 until `MAIL_ENABLED=true` with `RESEND_API_KEY` and `MAIL_FROM` set in Cloudflare (see the comment at the top of the Function). Enabling needs Igor's approval.
- Panel intro: Philine's wording (November 2026). Thank-you and error texts are Claude's drafts, marked DRAFT (TBA) in `thespark.ts`, awaiting approval.

## Confirmed facts (from Igor)
- Venue: Quinta Javali, near Aljezur, Costa Vicentina, Portugal.
- Format: 7 days / 6 nights, Monday afternoon to Sunday morning. Dates confirmed by Philine (November 2026): Monday 1 to Sunday 7 February 2027.
- Practices: Photography, Natural Creations, Tea Ceremony, Ceramics, Performance, Life drawing, Arkana Within, Archetype Photoshoot, Morning Routine.
- Hosts: Philine Allard (host, morning practice, Qi Gong); Igor Świeczak (photography, co-founder).
- Prices are in EURO and must match the BookRetreats listing exactly (first figure = regular, second = early bird; confirmed by Igor). The couples room price is per room for two people; all others are per person. Early-bird deadline: 6 December 2026 (Philine, November 2026). Booking and cancellation terms (Philine, November 2026): full text in `src/content/terms.ts`, shown at `/booking-terms` and summarised in a box in chapter 7. 50% deposit on booking (non-refundable); balance 30 days before; within 30 days of arrival full payment; cancellation 15–30 days: 50% of the total, 14 days or less: 100%; place transferable to a replacement; full refund if the organiser cancels.
  - Shared Room: €2,800 / €2,600 (twin room, two single beds 90 × 190 cm, private en-suite, countryside and mountain surroundings, A/C, Wi-Fi, terrace)
  - Private Room: €3,100 / €2,900 (single occupancy, double bed 180 × 200 cm, A/C, bathroom outside the bedroom)
  - Private Deluxe En-Suite Room: €3,500 / €3,300 (single occupancy, double bed, private en-suite, A/C, garden views or private terrace depending on room)
  - Private Deluxe En-Suite Room for couples / friends: €6,200 / €6,000 (looks like per room for two guests; the others per person; state this clearly. King-size/double 180 × 200 cm, en-suite, A/C, fireplace in selected rooms)
  Each room card: photo gallery counter, short tagline ("A welcoming space to share." / "Your own space to unwind." / "A little more comfort and privacy." / "Share the experience, enjoy the comfort."), description, amenity tags (A/C, Wi-Fi, terrace, en-suite), "Show more", and **Register your interest** (opens form with the room preselected).
- Remove the old €1,900–2,200 range and the mailto link from the sketch.

## Confirmed with the website copy (Igor, November 2026)
Source: `the-spark-website-copy.md`, written into `src/content/thespark.ts` with a light brand edit.
- Group size 6–14 guests.
- Facilitators and workshops as named: Igor (In search of beauty), Erika (Natural Creations), Bruno (Life drawing), André (Ceramics), Willpower (Performance), Manu (Arkana Within), Igor and Manu (Archetype Photoshoot), Philine (Tea Ceremony, morning practice).
- Daily rhythm 08:00–21:30 as in the copy.
- Food and extras: chef-made vegan and vegetarian meals (breakfast, lunch, dinner, snacks), opening dinner, cooking workshop, one open dinner (not included), optional treatments, integration call 7–14 days after, final open-house exhibition.
- Sauna: mention in passing only, as an addition, never a headline point.
- The copy's "Reserve your place", BookRetreats and US$ prices were NOT adopted: hard rules above stand.
- Booking terms: confirmed by Philine (November 2026), see above.

## Still TBA / to confirm
- Final dates, group size (sketch says 8–16; previous listing said 6–14, venue sleeps up to 16).
- Which facilitators lead sessions in the February 2027 edition (previous listing named Erika, André, Willpower, Bruno, Manu; no bios).
- Daily rhythm (previous listing: 08:00 morning practice, 09:00 breakfast, 10:30–13:30 workshop, 13:30 lunch, 14:30–18:30 free time or extra workshop, 18:30 dinner, 20:00 evening session) — confirm for 2027.
- Food details, optional treatments, integration call, final-evening exhibition: not confirmed; show as TBA or leave out.
- Privacy policy (legal review), social links.
- Retreat name "The Spark" is in use; slogan stays "Where a spark becomes art."

## Photography
- Venue photos: `../../RETREATS/quinta-javali` (use "Small photos"; web-optimised copies already in `public/venue`).
- Previous retreat (Art Space Residency, Alentejo) photos by Igor Świeczak: `E:\_PHOTO\2026\10. Art Residency\EXPORTS` — usable for content, but NOT the swimming pool area or anything identifying that venue.
- The people shown in the practice photos (`public/practices/`) have agreed to their use (Igor, November 2026).
- Before publishing any other identifiable portrait, confirm the person agreed to its use. Same for participant quotes (add first names or descriptors only with permission).
- Optimise images (WebP/AVIF, responsive sizes); never ship originals.

## SEO
- One H1 per page. Each chapter has a real heading. Unique meta title and description, canonical URL, Open Graph image, FAQ structured data (JSON-LD), sitemap and robots updated. Existing build produces per-route static HTML (`dist/*.html`); keep it so crawlers see content.
- The per-route files only carry the `<head>`; `/thespark`'s body is also pre-rendered at build (`src/entry-server.tsx` + `scripts/prerender.mjs`, then hydrated). Keep the page free of browser APIs during render.

## Working agreement
- Small, reviewable steps; show the page in the browser after each. Run the type-check and build before reporting done.
- Ask before adding dependencies. Keep the portal's R3F code isolated from the rest of the site.
