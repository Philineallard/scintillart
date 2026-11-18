/**
 * Venue content: the single source of truth for /venue.
 *
 * Source: floor plans and a written description supplied by Quinta Javali
 * (reservations contact, October 2026), plus a curated set of their own
 * photographs. Photo captions describe only what is visible; they are not
 * claimed to show a specific named room, since the room-to-photo mapping
 * was not supplied.
 *
 * If retreat/scintillart-retreat-description.md is added to the repository,
 * reconcile this file against it.
 */
export type VenueImage = { slug: string; w: number; h: number; alt: string; focus?: string }
export type VenueItem = { title: string; detail?: string }
export type FloorPlan = { slug: string; w: number; h: number; alt: string; title: string; caption: string }

const img = (slug: string, w: number, h: number, alt: string, focus?: string): VenueImage => ({ slug, w, h, alt, focus })

export const venue = {
  eyebrow: 'The venue',
  title: 'Quinta Javali',
  line: 'Two houses, a natural pool, and the hills above Aljezur.',
  intro:
    'Our retreats are held at Quinta Javali, at Corte do Sobro, on the south-west coast of Portugal near Aljezur — two houses on shared grounds, set among cork oaks and open countryside.',

  heroImage: img(
    'hero-aerial-estate',
    1600,
    900,
    'Aerial view of the two whitewashed, terracotta-roofed houses at Quinta Javali, surrounded by gardens, stone terracing and a dark natural pool with a wooden deck, hills beyond',
  ),

  arrival: {
    label: '01 Arrival',
    title: 'Cork oaks, stone terraces, and two houses',
    body: 'The road climbs through pine and cork oak before opening onto the grounds: stone-walled terraces stepping down toward the pool, and the two houses set among old trees and bougainvillea.',
    image: img('arrival-entrance', 1052, 1600, 'Stone steps leading up to a covered entrance with a wooden pergola, dining table and bougainvillea in bloom'),
  },

  arrivalPair: [
    img('terrace-doorway', 1066, 1600, 'An open wooden door looking onto a covered terrace with armchairs and a view of pine-covered hills'),
    img('outdoor-kitchen-nook', 1066, 1600, 'An outdoor kitchen with a built-in barbecue grill, set into a whitewashed wall beside oleander flowers'),
  ],

  arrivalWide: img('aerial-wide-estate', 1600, 900, 'A second aerial view of the estate: both houses among trees, stone-terraced gardens, and the natural pool below'),

  houses: {
    label: '02 The two houses',
    title: 'Room for sixteen, across two houses',
    body: 'The Main House (340 sqm) and the Second House (280 sqm) sit on the same grounds, each with its own open-plan kitchen, dining and living area. Together they sleep sixteen guests across eight bedrooms, all but one en suite.',
    image: img('bedroom-main-seascape', 1066, 1600, 'A bed with linen bedding beneath a seascape painting, beside a carved lamp'),
    houseList: [
      {
        title: 'Main House — 340 sqm',
        detail:
          'Open-plan kitchen, dining and living area with a working fireplace and seating for eight. Four bedrooms: three with garden views and one studio with its own exterior entrance and private terrace. All with air conditioning; three en suite.',
      },
      {
        title: 'Second House — 280 sqm',
        detail:
          'Open-plan living, dining and kitchen with garden and mountain views. Four bedrooms, two with separate exterior entrances; three with a working fireplace. All with air conditioning; three en suite.',
      },
    ] satisfies VenueItem[],
  },

  bedroomsPair: [
    img('bedroom-main-colourweave', 1600, 962, 'A bed beneath a brightly coloured woven artwork, with a carved wooden cabinet beside it'),
    img('bedroom-ensuite-teal', 1600, 1200, 'A bedroom opening onto a bathroom with a dark teal door and round mirror'),
  ],

  bathsPair: [
    img('bath-freestanding-teal', 1600, 1200, 'A freestanding bathtub in a room with a dark teal door and round mirror, basin shelf beside it'),
    img('bath-tub-teal', 1001, 1600, 'A deep soaking tub beneath a framed botanical print, with a tiled shower stall beyond'),
  ],

  gathering: {
    label: '03 Shared spaces',
    title: 'Kitchens, fires and long tables',
    body: 'Both houses open onto shared living spaces built for a group: dining tables that seat eight or more, working fireplaces, and kitchens equipped for cooking together. Outside, a covered terrace holds a ten-seater table and a gas barbecue with built-in bench seating.',
    image: img('kitchen-shelving', 1066, 1600, 'Open kitchen shelving holding glassware and ceramic bowls, beside a window with garden views'),
  },

  gatheringPair: [
    img('living-room-sofa', 1066, 1600, 'A slipcovered sofa and armchair beneath framed artwork, glass doors open to the garden'),
    img('pergola-terrace', 1066, 1600, 'A covered outdoor dining terrace with a long wooden table, overlooking wooded hills'),
  ],

  gatheringWide: img('dining-mountain-view', 1600, 1166, 'A wooden dining table set with wine glasses, open doors framing a view of forested mountains'),

  grounds: {
    label: '04 Grounds & natural pool',
    title: 'A natural pool, and the hills beyond',
    body: 'An 8 x 6 metre natural swimming pool — carbon-filtered and chemical-free — crosses a small bridge and is set with six sun loungers, parasols and an outdoor shower. Beyond the gardens, the land opens onto cork oaks and the hills around Aljezur.',
    image: img('pool-waterline-hills', 1066, 1600, 'The water surface of the natural pool at eye level, reflecting wooded hills beyond the planted far bank'),
  },

  groundsPair: [
    img('pool-deck-loungers', 1066, 1600, 'The wooden deck crossing the natural pool, sun loungers and parasols on the stone-terraced lawn beyond'),
    img('pool-umbrellas-view', 900, 1600, 'Sun loungers and parasols beside the natural pool, with hills in the distance'),
  ],

  groundsWide: img('pool-deck-wide', 1600, 1066, 'Two armchairs on the wooden deck over the natural pool, hills reflected in the still water'),

  floorplans: {
    label: '05 On the ground',
    title: 'How the houses sit on the land',
    body: 'The property’s own architectural plans, supplied by Quinta Javali and drawn by Arqª Bárbara Miranda — shown as drawn, with an English summary alongside each.',
    plans: [
      {
        slug: 'floorplan-site',
        w: 1150,
        h: 1140,
        alt: 'Site plan showing the main house wing (Tipologia T2) and two guest studios (Tipologia T0), with entrances marked',
        title: 'Site plan — main house wing and guest studios',
        caption:
          'T2 unit: 117 m² gross floor area. Two T0 studios: 36 m² each. Dotted arrows mark entrances. Combined with the Second House: 8 bedrooms, 16 guests.',
      },
      {
        slug: 'floorplan-main-house',
        w: 1150,
        h: 964,
        alt: 'Illustrative plan of the Main House showing Suite 1, Room 1, Studio 1 and Studio 2, plus a separate reception and parking building',
        title: 'Illustrative plan — Main House',
        caption: 'Suite 1, Room 1, Studio 1 and Studio 2 around the central living space, plus a separate reception/office building with parking for two cars.',
      },
      {
        slug: 'floorplan-access',
        w: 1150,
        h: 830,
        alt: 'Accessibility plan of the Main House marking pedestrian access routes and mobility-adapted spaces',
        title: 'Accessibility plan',
        caption: 'Pedestrian access routes and the spaces designed for reduced mobility within the Main House.',
      },
    ] satisfies FloorPlan[],
  },

  closing: {
    label: 'Join us there',
    title: 'See the full retreat details',
    body: 'Dates, practices and how to register your interest are on the retreat page.',
    cta: 'Back to the retreat',
  },
} as const
