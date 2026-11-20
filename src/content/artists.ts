/**
 * The artists of The Spark: the single source for /thespark-artists.
 *
 * Bios rewritten in Scintillart's voice (British English, specific nouns, no superlatives)
 * from the artists' pages on naturalhealinghearts.com (Art Space residency, 2026), keeping
 * their facts. Workshops come from `workshops` in thespark.ts, so both pages stay in step.
 *
 * Portraits (public/artists, 3:4 WebP): all seven supplied by Philine, November 2026.
 * Igor, Philine, Erika and Bruno confirmed; André, Willpower and Manu: confirm they agree
 * to their portrait being published before this goes live. Their bios are still TBA.
 *
 * Plain data only (also read by vite.config.ts).
 */
import { TBA, workshops, type Maybe, type Workshop } from './thespark.ts'

export type Artist = {
  /** Anchor on the page: /thespark-artists#<id>. */
  id: string
  name: string
  /** One line under the name: what they do. */
  role: string
  bio: Maybe<string>[]
  quote?: string
  /** Slug in public/artists (<slug>.webp 720×960, <slug>-sm.webp 360×480); absent = portrait to follow. */
  portrait?: { slug: string; alt: string }
  /** Ids from `workshops` in thespark.ts. */
  workshopIds: string[]
}

export const artists: Artist[] = [
  {
    id: 'philine-allard',
    name: 'Philine Allard',
    role: 'Co-founder, host and facilitator of Scintillart',
    bio: [
      // Philine's bio, November 2026.
      'Philine hosts The Spark and leads its morning practice. She is an artist, energy guide, Qi Gong teacher, certified Mind-Body-Soul Mentor, and Reiki Master.',
      'She lives on an off-grid farm in the Alentejo countryside with three rescue horses and two dogs, where she offers 1:1 retreats, energy work, and creative experiences. Her work supports people in coming home to themselves, releasing what no longer serves them, and living with greater clarity, freedom, and joy.',
      'Since a road trip in 2022 she has gathered shells, feathers and driftwood, and turns them into handmade totems: pieces made with intention, each holding something of the person who made it.',
    ],
    quote: 'Nature already holds the beauty. We simply listen, create, and allow it to take form.',
    portrait: { slug: 'philine-allard', alt: 'Philine Allard holding a totem of cork bark, cord and shells against a white wall' },
    workshopIds: ['morning-practice', 'tea-ceremony'],
  },
  {
    id: 'igor-swieczak',
    name: 'Igor Świeczak',
    role: 'Photographer and creative director, co-founder of Scintillart',
    bio: [
      'Igor works in the space between instinct and form: light, gesture and atmosphere, and the moments where beauty is found rather than staged. For him, photography is about feeling, attention and “the courage to look differently”.',
      'His workshop treats photography as something that begins before the shutter: a way of training the eye to notice small details, passing gestures and changing light. No technical knowledge is needed; any camera will do, a phone included.',
    ],
    portrait: { slug: 'igor-swieczak', alt: 'Igor Świeczak, smiling, looking through the viewfinder of a vintage folding camera' },
    workshopIds: ['photography', 'archetype-photoshoot'],
  },
  {
    id: 'erika-prib',
    name: 'Erika Prib',
    role: 'Interdisciplinary artist',
    bio: [
      'Erika trained in fashion, graphic design and illustration. Her work now joins that training with a wellbeing and spiritual practice.',
      'Working with symbolic imagery, natural materials, collage, painting and sculptural objects, she makes pieces meant to bring stillness and presence into a space, and to move the viewer from noise towards quiet.',
    ],
    portrait: { slug: 'erika-prib', alt: 'Erika Prib, smiling under an olive tree, holding a framed artwork in yellow and gold' },
    workshopIds: ['natural-creations'],
  },
  {
    id: 'bruno-palma',
    name: 'Bruno Palma',
    role: 'Animation concept artist and life drawing facilitator',
    bio: [
      'Bruno grew up in Benafim, in the Algarve, where a neighbour’s book on Van Gogh started him drawing. In 2004 he moved to Ireland and graduated in animation.',
      'He then spent fifteen years as an art director, production designer and background artist on projects for RTÉ, the BBC and Disney XD. Gesture drawing from the live model is part of his daily practice, and he paints the Algarve landscapes around him.',
    ],
    quote: 'Working from the live model continues to be the core of my artistic process.',
    portrait: { slug: 'bruno-palma', alt: 'Bruno Palma in a flat cap and white T-shirt, chin in hand, looking aside' },
    workshopIds: ['life-drawing'],
  },
  {
    id: 'andre',
    name: 'André',
    role: 'Ceramics',
    // Philine, November 2026.
    bio: [
      'André guides intimate ceramics workshops centred on touch, presence and personal expression. Working with Andorinha, a handmade wheel with a family story, he welcomes beginners, families, couples and groups to explore clay at their own pace, whether in the studio, in nature or at a special venue. His practice values traditional making, locally sourced materials and the unique creative fingerprint each participant brings to the wheel.',
    ],
    portrait: { slug: 'andre', alt: 'André, smiling, at a potter’s wheel with freshly thrown pots in front of him' },
    workshopIds: ['ceramics'],
  },
  {
    id: 'willpower',
    name: 'Willpower',
    role: 'Performance',
    bio: [TBA],
    // Philine, November 2026.
    quote: 'People are going to walk out of the room and ask themselves: what just happened here?',
    portrait: { slug: 'willpower', alt: 'Willpower against a white wall, wearing performance gloves with lights and turquoise rings' },
    workshopIds: ['performance'],
  },
  {
    id: 'manu',
    name: 'Manu',
    role: 'Arkana Within and archetypes',
    // Philine, November 2026.
    bio: [
      'Manu is a tarot reader, maker and facilitator who explores self-discovery through craft, symbolism and personal mythology. With a background in jewellery, metals conservation, textiles, yoga and dance, they create welcoming spaces for people to connect with tarot, their creativity and their own inner knowledge. Manu’s Inner Deck Workshops invite participants to discover a personal archetype and make their first card, turning reflection into a lasting, handmade object.',
    ],
    portrait: { slug: 'manu', alt: 'Manu, smiling, with dark curly hair and a blue shirt' },
    workshopIds: ['arkana-within', 'archetype-photoshoot'],
  },
]

export const artistWorkshops = (a: Artist): Workshop[] =>
  a.workshopIds.map((id) => workshops.find((w) => w.id === id)).filter((w): w is Workshop => Boolean(w))

/** The artists who lead a workshop, in page order (for links from /thespark). */
export const workshopArtists = (workshopId: string): Artist[] => artists.filter((a) => a.workshopIds.includes(workshopId))

export const artistsPage = {
  path: '/thespark-artists',
  meta: {
    title: 'The artists of The Spark | Scintillart',
    description:
      'Meet the artists of The Spark, an artist-led creative retreat near Aljezur, Portugal: photography, natural creations, life drawing, ceramics, performance, archetypes and Qi Gong.',
  },
  bar: {
    retreat: 'The Spark',
    current: 'Artists',
    workshops: 'Workshops',
  },
  title: 'The artists of The Spark',
  lead: 'Each day of the retreat belongs to one artist and one practice.',
  portraitToFollow: 'Portrait to follow',
  workshopsHeading: 'Workshops',
  workshopsLead: 'Photographs from earlier editions.',
  back: 'Back to the artists',
  next: 'Next artist',
  closingTitle: 'Come curious. Leave with something made by you.',
  register: 'Register your interest',
}
