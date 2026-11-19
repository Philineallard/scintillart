/**
 * The Spark: the single source of truth for every word, fact and price on /thespark.
 *
 * Source: "the-spark-website-copy.md" (November 2026), with a light brand edit
 * (Brand Guidelines v2.0: sentence case, British spelling, no outcome promises)
 * and the facts confirmed by Igor in CLAUDE.md.
 *
 * Rules (CLAUDE.md):
 * - Only confirmed facts. Anything unconfirmed is the TBA constant, so confirming a
 *   detail is a one-line change here.
 * - British English, sentence-case headings and actions, no exclamation marks,
 *   superlatives or unsupported claims.
 * - The only call to action is "Register your interest". No BookRetreats links.
 *   Prices in euros, matching the listing exactly.
 *
 * This file is also read by vite.config.ts (page <head>, FAQ structured data), so it
 * must stay plain data: no imports from the browser or React.
 */

/** Marker for anything not yet confirmed. Rendered by <Tba />. */
export const TBA = 'TBA' as const
export type Maybe<T> = T | typeof TBA

export type Fact = {
  term: string
  detail: Maybe<string>
  /** Short qualifier shown after the detail, e.g. "To be confirmed". */
  note?: string
}

export type RoomId = 'shared' | 'private' | 'deluxe' | 'deluxe-two'
export type Room = {
  /** Stable id: used in /thespark#register?room=<id> and sent with the form. */
  id: RoomId
  name: string
  tagline: string
  bestFor: string
  details: string
  /** Euro prices exactly as on the listing: regular, then early bird. */
  price: { regular: string; earlyBird: string; basis: string }
  /** Photos in public/thespark/rooms/ (<name>.webp 900w, <name>-sm.webp 540w, 4:5), shown as a gallery in the card. */
  photos?: { name: string; alt: string }[]
}

// Room photos chosen by Philine, November 2026 (Quinta Javali). Both deluxe rooms share the en-suite set.
const ensuitePhotos = [
  { name: 'ensuite-01', alt: 'An en-suite bedroom with a freestanding bath beyond the bed' },
  { name: 'ensuite-02', alt: 'A freestanding bath and basin beside a green wooden door' },
  { name: 'ensuite-03', alt: 'The bath and a wall niche in an en-suite room' },
  { name: 'ensuite-04', alt: 'A double bed with linen bedding under a large artwork' },
  { name: 'ensuite-05', alt: 'A double bed beside a bedside lamp and a green-tiled wall' },
  { name: 'ensuite-06', alt: 'A freestanding bath under a framed drawing' },
  { name: 'ensuite-07', alt: 'A double bed under a wooden ceiling fan' },
  { name: 'ensuite-08', alt: 'A bedroom with a double bed, a wooden wardrobe and a ceiling fan' },
  { name: 'ensuite-09', alt: 'A bright en-suite bedroom with a bath and doors to the garden' },
  { name: 'ensuite-10', alt: 'A double bed with white linen under a colourful painting' },
]

/** The four room types and prices (CLAUDE.md, confirmed by Igor). Order = order on the page. */
export const rooms: Room[] = [
  {
    id: 'shared',
    name: 'Shared room',
    tagline: 'A welcoming space to share.',
    bestFor: 'Guests who enjoy connection and shared experience',
    details:
      'Twin room with two single beds (90 × 190 cm), private en-suite bathroom, air conditioning, Wi-Fi and terrace access, with countryside and mountain surroundings.',
    price: { regular: '€2,800', earlyBird: '€2,600', basis: 'per person' },
    photos: [
      { name: 'shared-01', alt: 'A round mirror above a stone basin in the shared room’s bathroom' },
      { name: 'shared-02', alt: 'The shared room’s bathroom with a walk-in shower and a small window' },
      { name: 'shared-03', alt: 'The shared room with a bed, a sofa and wooden shutters' },
      { name: 'shared-04', alt: 'The shared room under a sloping white ceiling' },
      { name: 'shared-05', alt: 'Two beds in the shared room, with the bathroom door open beyond' },
    ],
  },
  {
    id: 'private',
    name: 'Private room',
    tagline: 'Your own space to unwind.',
    bestFor: 'Solo guests seeking privacy',
    details: 'Single occupancy, double bed (180 × 200 cm) and air conditioning, with a bathroom outside the bedroom.',
    price: { regular: '€3,100', earlyBird: '€2,900', basis: 'per person' },
    photos: [
      { name: 'private-01', alt: 'A private room with a double bed, a ceiling fan and a bright window' },
      { name: 'private-02', alt: 'A double bed and an armchair in a private room with wooden shutters' },
      { name: 'private-03', alt: 'A double bed with white linen under a framed artwork' },
      { name: 'private-04', alt: 'A double bed between two bedside lamps in a private room' },
    ],
  },
  {
    id: 'deluxe',
    name: 'Private deluxe en-suite room',
    tagline: 'A little more comfort and privacy.',
    bestFor: 'Guests seeking additional comfort',
    details:
      'Single occupancy, double bed, private en-suite bathroom and air conditioning, with garden views or a private terrace depending on the room.',
    price: { regular: '€3,500', earlyBird: '€3,300', basis: 'per person' },
    photos: ensuitePhotos,
  },
  {
    id: 'deluxe-two',
    name: 'Private deluxe en-suite room for couples / friends',
    tagline: 'Share the experience, enjoy the comfort.',
    bestFor: 'Couples, friends or travel companions',
    details:
      'For two guests: king-size or double bed (180 × 200 cm), en-suite bathroom and air conditioning, with a fireplace in selected rooms.',
    price: { regular: '€6,200', earlyBird: '€6,000', basis: 'per room, for two guests' },
    photos: ensuitePhotos,
  },
]

export type Workshop = {
  id: string
  practice: string
  title?: string
  by: string
  text: string
  /** A photo from a previous edition, in public/practices (people shown have agreed to its use). */
  photo: { slug: string; w: number; h: number; alt: string }
}

/** The workshops of The Spark: shown in chapter 3 here and on /thespark-artists (src/content/artists.ts). */
export const workshops: Workshop[] = [
  {
    id: 'photography',
    practice: 'Photography',
    title: 'In search of beauty',
    by: 'Igor Świeczak',
    text: 'See yourself and the world through a more attentive, generous lens.',
    photo: { slug: 'photography', w: 542, h: 720, alt: 'Igor photographing the hills at sunset' },
  },
  {
    id: 'natural-creations',
    practice: 'Natural Creations',
    by: 'Erika',
    text: 'Work with the textures, forms and materials of the surrounding landscape.',
    photo: { slug: 'natural-creations', w: 542, h: 720, alt: 'Erika’s sculptures of dried leaves hanging against a curtain' },
  },
  {
    id: 'life-drawing',
    practice: 'Life drawing',
    by: 'Bruno',
    text: 'Slow down, observe deeply, and discover the pleasure of drawing without needing to be “good at it”.',
    photo: { slug: 'life-drawing', w: 405, h: 720, alt: 'A life drawing on an easel in Bruno’s workshop' },
  },
  {
    id: 'ceramics',
    practice: 'Ceramics',
    by: 'André',
    text: 'Shape, touch and create with clay in a grounded, hands-on practice.',
    photo: { slug: 'ceramics', w: 479, h: 720, alt: 'André shaping clay at a ceramics workshop' },
  },
  {
    id: 'performance',
    practice: 'Performance',
    by: 'Willpower',
    text: 'Explore presence, expression and the freedom to take up space.',
    photo: { slug: 'performance', w: 540, h: 720, alt: 'A performance by Willpower, lit in pink and violet' },
  },
  {
    id: 'arkana-within',
    practice: 'Arkana Within',
    title: 'Archetypes',
    by: 'Manu',
    text: 'Explore the inner patterns and stories that shape how you see yourself.',
    photo: { slug: 'arkana-within', w: 571, h: 720, alt: 'Three tarot cards, the Ace of Cups, the Star and the King of Wands, upright on a cream cloth' },
  },
  {
    id: 'archetype-photoshoot',
    practice: 'Archetype Photoshoot',
    by: 'Igor and Manu',
    text: 'Step into a new visual narrative and see yourself from a fresh perspective.',
    photo: { slug: 'archetype-photoshoot', w: 542, h: 720, alt: 'A costumed portrait shoot in warm red light, a photographer at work' },
  },
  {
    id: 'tea-ceremony',
    practice: 'Tea Ceremony',
    by: 'Philine',
    text: 'Pause, arrive and share a ritual of presence and connection.',
    photo: { slug: 'tea-ceremony', w: 720, h: 720, alt: 'A bowl of tea with unfurled leaves, resting on dry leaves' },
  },
  {
    id: 'morning-practice',
    practice: 'Morning practice',
    by: 'Philine',
    text: 'Breathwork, meditation and Qi Gong to begin each day.',
    photo: { slug: 'morning-routine', w: 556, h: 557, alt: 'Philine leading a Qi Gong session in an open wooden pavilion' },
  },
]
export type Person = { name: string; role?: string; text: string }
export type Faq = { q: string; a: string }

/** The building blocks of a chapter, rendered in order by <ChapterBlocks />. */
export type Block =
  | { type: 'text'; heading?: string; paragraphs: string[] }
  | { type: 'list'; heading?: string; items: string[] }
  | { type: 'pillars'; heading: string; items: { title: string; text: string }[] }
  | { type: 'workshops'; heading: string; items: Workshop[]; more?: { label: string; href: string } }
  | { type: 'people'; heading: string; items: Person[] }
  | { type: 'schedule'; heading: string; rows: { time: string; activity: string }[] }
  | { type: 'facts'; heading?: string; facts: Fact[] }
  | { type: 'included'; included: { heading: string; items: string[] }; excluded: { heading: string; items: string[] } }
  | { type: 'faq'; items: Faq[] }
  | { type: 'rooms'; heading: string; items: Room[] }
  /**
   * A row of photos, three in view, that slides left and right (public/thespark/venue/:
   * <name>.webp 900w and <name>-sm.webp 540w, 4:5). label names it for screen readers.
   */
  | { type: 'gallery'; label: string; folder: string; drift?: boolean; zoom?: boolean; items: { name: string; alt: string }[] }

export type ChapterId = 'overview' | 'experience' | 'workshops' | 'day' | 'venue' | 'food' | 'accommodation' | 'faq'

/**
 * A photo or a silent video in a chapter's spread (files in public/thespark/), all shown
 * at the same size, 4:5. Photos: <name>.webp (900w) and <name>-sm.webp (540w).
 * Videos: <name>.mp4 and <name>-poster.webp, 600×750, no sound; they play while the
 * cursor is on them (tap on phones).
 */
export type Figure = { kind: 'image' | 'video'; name: string; alt: string }

export type Chapter = {
  /** Anchor: /thespark#<id>. Keep stable, links depend on it. */
  id: ChapterId
  /** Short label in the chapter navigation and above the heading. */
  nav: string
  /** The chapter's <h2>. */
  title: string
  /** Standfirst under the heading. */
  lead?: Maybe<string>
  /** Three figures side by side under the heading, laid out like a newspaper page. */
  spread?: Figure[]
  /**
   * A full-width photo behind the chapter's heading. Files in public/thespark/:
   * <name>.webp (full size, `width` wide), <name>-md.webp (1100w), <name>-sm.webp (720w).
   * focus: the point kept in view when the photo is cropped. textAt: where the heading sits
   * on the photo (default bottom), chosen to keep the photo's subject clear.
   */
  cover?: { name: string; alt: string; width: number; height: number; focus: string; textAt?: 'top' | 'bottom' }
  blocks: Block[]
  /** A closing line at the end of the chapter. */
  closing?: string
}

const faq: Faq[] = [
  {
    q: 'Do I need artistic experience?',
    a: 'No. The retreat is open to everyone, whatever their experience or background. You do not need to be “creative” or good at art, only curious and willing to try. The workshops are invitations to explore and play, not tests of skill.',
  },
  {
    q: 'Is this an art retreat or a wellness retreat?',
    a: 'It is an art retreat first, supported by wellbeing. Artist-led workshops sit alongside breathwork, meditation, Qi Gong, nourishing food, nature and time to rest.',
  },
  {
    q: 'Who is The Spark for?',
    a: 'Anyone who wants to reconnect with creativity, slow down and try something new. Many guests are business owners, creatives, professionals or people in a period of change, but no particular background is needed.',
  },
  {
    q: 'How many people attend?',
    a: 'The group is intentionally small: between 6 and 14 guests. This allows for personal attention, real conversation and a strong sense of community.',
  },
  {
    q: 'Will I have time alone?',
    a: 'Yes. There is a gentle daily rhythm, but also time to rest, walk in nature, swim in the natural pool, journal or simply be. You are invited, never pressured, to take part.',
  },
  {
    q: 'What food is provided?',
    a: 'Our chef prepares fresh, seasonal, homemade vegan and vegetarian meals. Breakfast, lunch, dinner and snacks are included. Please tell us about any allergies or dietary needs when you book.',
  },
  {
    q: 'What will I take home?',
    a: 'Your own artworks, new connections and ideas to keep creating at home. A complimentary integration call is included 7–14 days after the retreat.',
  },
  {
    q: 'How do I get there?',
    a: 'The retreat is near Aljezur, about 1 hour 15 minutes by car from Faro Airport and 3 hours from Lisbon Airport. Transfers are not included; we create a WhatsApp group before arrival so guests can share cars, taxis or transfers.',
  },
  {
    q: 'Is it suitable for introverts?',
    a: 'Yes. The week offers both connection and space for solitude. You can take part in the group experience and still take the quiet time you need.',
  },
  {
    q: 'Can I come with a partner or friend?',
    a: 'Yes. Solo travellers, couples, friends, family members and colleagues are all welcome.',
  },
]

export const thespark = {
  path: '/thespark',

  /** <head>: also used by vite.config.ts for the static HTML. */
  meta: {
    title: 'The Spark — Creative Retreat, Aljezur, Portugal | Scintillart',
    description:
      'Join The Spark, a 7-day artist-led creative retreat near Aljezur on Portugal’s Costa Vicentina. Explore photography, ceramics, drawing, performance, nature and connection. No artistic experience needed.',
  },

  hero: {
    kicker: 'Scintillart presents',
    title: 'The Spark',
    descriptor: 'A 7-day artist-led creative retreat in Aljezur, Portugal',
    lead: 'Seven days to step away from routine, reconnect with your creativity and discover what wants to emerge.',
    /** In-page link to chapter 2 (navigation, not a second call to action). */
    explore: { label: 'Explore the experience', href: '#experience' },
    note: 'No artistic experience needed. Just curiosity, openness and a willingness to explore.',
    /**
     * Full-bleed photo behind the hero (Philine, November 2026: "star", sun through a fig tree).
     * Files in public/thespark/: <name>-sm (720w), <name>-md (1100w), <name> (full size).
     * focus: the point kept in view when the photo is cropped (the sun's spark).
     */
    image: {
      name: 'hero-star',
      width: 1367,
      height: 2048,
      focus: '61% 36%',
      alt: 'Low sun shining through the branches of a fig tree over hills at dusk',
    },
  },

  chapters: [
    {
      id: 'overview',
      nav: 'Overview',
      title: 'More than a holiday. A return to your creative self.',
      // Chosen by Philine, November 2026: three silent videos of the same size, no lines, no captions.
      spread: [
        {
          kind: 'video',
          name: 'mural-wall',
          alt: 'Artists painting a large mural on a white wall while others watch',
        },
        {
          kind: 'video',
          name: 'photoshoot',
          alt: 'Two people in costume posing for a camera on a tripod in front of red curtains',
        },
        {
          kind: 'video',
          name: 'quinta-javali-walk',
          alt: 'A walk through the garden at Quinta Javali towards the pool and the hills',
        },
      ],
      blocks: [
        {
          type: 'text',
          paragraphs: [
            'Something shifts when you leave the familiar behind.',
            'A new landscape. New faces. New materials. New ways of seeing, making and expressing yourself.',
            'For seven days, Quinta Javali, in the hills near Aljezur, becomes your creative studio, your place to rest and your shared table. Guided by working artists, you will draw, photograph, shape clay, work with natural materials, move, perform, and find that creativity is not something you either have or do not have.',
            'It is something you can return to.',
          ],
        },
        {
          type: 'facts',
          heading: 'Key facts',
          facts: [
            { term: 'Dates', detail: '1–7 February 2027', note: 'To be confirmed' },
            { term: 'Duration', detail: '7 days, 6 nights, Monday afternoon to Sunday morning' },
            { term: 'Location', detail: 'Quinta Javali, near Aljezur, Costa Vicentina, Portugal' },
            { term: 'Group size', detail: '6–14 guests' },
            { term: 'Hosts', detail: 'Philine Allard and Igor Świeczak' },
            { term: 'Experience', detail: 'No artistic experience required' },
            { term: 'Includes', detail: 'Workshops, wellbeing practices, accommodation, meals, materials and the final exhibition' },
            { term: 'Final evening', detail: 'An open-house exhibition created by the group' },
            { term: 'Price', detail: 'From €2,800 per person; early bird from €2,600', note: 'Early-bird deadline: TBA' },
          ],
        },
        {
          type: 'list',
          heading: 'A week designed to awaken curiosity',
          items: [
            'Begin each day with breathwork, meditation and Qi Gong',
            'Explore a different creative practice with a new artist each day',
            'Work with photography, drawing, ceramics, natural materials, movement and performance',
            'Share seasonal vegan and vegetarian meals around a long table',
            'Rest in nature and swim in the natural pool',
            'Close the week by creating and presenting your own open-house exhibition',
          ],
        },
        {
          type: 'text',
          heading: 'For anyone ready to make space for creativity',
          paragraphs: [
            'The Spark is for thoughtful, open-minded people who may be capable and successful in many areas of life, yet feel that something essential has gone quiet: curiosity, play, self-expression or connection.',
            'You may be a business owner, a creative professional, a parent, or simply someone in a period of change. You do not need to identify as an artist. You only need to arrive curious, try something new and see what happens.',
          ],
        },
        {
          type: 'text',
          heading: 'You arrive with curiosity. You leave with something made by you.',
          paragraphs: [
            'By the end of the week you will have made work with your own hands, tried new ways of seeing, and allowed yourself to make without needing to be perfect.',
            'You leave with your artwork, new connections and fresh inspiration to take home.',
          ],
        },
      ],
    },

    {
      id: 'experience',
      nav: 'The experience',
      title: 'An immersive week of making, being and belonging',
      lead: 'Creative exploration, wellbeing, nature and human connection, held in a considered rhythm.',
      // Chosen by Philine, November 2026: paints lined up along a sunlit wall (photo: Igor Świeczak).
      cover: {
        name: 'experience-paints',
        alt: 'Tubes and bottles of paint lined up along a sunlit white wall under the leaves of a fig tree',
        width: 2048,
        height: 1367,
        focus: '55% 62%',
        textAt: 'top',
      },
      blocks: [
        {
          type: 'text',
          heading: 'Step into the unknown. Discover what you can create.',
          paragraphs: [
            'The Spark is not a course with a fixed outcome. It is an invitation to experiment, play and listen to what wants to come through you.',
            'Each day brings a new artist, a new material and a new way of seeing. Some sessions ask you to be still and observant. Others invite movement, expression and a little healthy discomfort. Between them there is time to rest, walk, swim, reflect and let the experience settle.',
          ],
        },
        {
          type: 'pillars',
          heading: 'Creativity. Nature. Connection.',
          items: [
            {
              title: 'Creativity',
              text: 'Artist-led workshops invite you to explore photography, drawing, ceramics, natural materials, performance and self-expression.',
            },
            {
              title: 'Nature',
              text: 'The landscape becomes part of the practice: light, texture, silence, wind, ocean air and space to wander.',
            },
            {
              title: 'Connection',
              text: 'Shared meals, conversations, creative experiments and a final exhibition turn a group of strangers into a temporary creative community.',
            },
          ],
        },
        {
          type: 'text',
          heading: 'Not a result. A relationship with creativity.',
          paragraphs: [
            'You may discover that you enjoy making things with your hands. You may find a new way of looking through a camera. You may feel more comfortable being seen, expressing emotion or taking up space.',
            'You may simply remember what it feels like to play.',
            'There is no right way to take part. You are invited to engage fully, but never pressured. Solitude, rest and quiet integration are as much a part of the retreat as the workshops.',
          ],
        },
        {
          type: 'text',
          heading: 'Your week, made visible',
          paragraphs: [
            'On the final evening, the retreat becomes an exhibition.',
            'You will create, prepare and share the work that emerged during the week, whether it is a photograph, a sculpture, a drawing, a performance or something less easy to name.',
            'It is not about producing a masterpiece. It is about honouring what you discovered, expressed and allowed yourself to make.',
          ],
        },
      ],
      closing: 'Give yourself permission to begin.',
    },

    {
      id: 'workshops',
      nav: 'Workshops & facilitators',
      title: 'Learn from artists. Create with your hands.',
      lead: 'A different artist, practice and creative energy each day.',
      blocks: [
        {
          type: 'text',
          heading: 'Every day, a new invitation',
          paragraphs: [
            'The workshops are not designed to make you a professional artist in a week. They are designed to give you new tools, new perspectives and the experience of creating in a supportive environment.',
            'Each facilitator brings their own craft, presence and way of working. Together they make a week that moves between observation, expression, material, movement and reflection.',
          ],
        },
        {
          type: 'workshops',
          heading: 'Creative practices, guided by artists',
          items: workshops,
          more: { label: 'Meet the artists', href: '/thespark-artists' },
        },
        {
          type: 'people',
          heading: 'The people holding the space',
          items: [
            {
              name: 'Philine Allard',
              role: 'Founder, host and facilitator',
              text: 'Philine is a certified Mind-Body-Soul Mentor and Reiki Master. At The Spark she hosts the retreat, leads the morning practices and guides the inner Qi Gong journey. Her work invites people into presence, creativity and a deeper connection with themselves.',
            },
            {
              name: 'Igor Świeczak',
              role: 'Photographer, creative director and co-founder of Scintillart',
              text: 'Igor leads In search of beauty, helping people feel confident and real in front of the camera while seeing themselves and their surroundings through a more beautiful lens.',
            },
            {
              name: 'Guest artists',
              text: 'Each edition brings together artists and practitioners chosen for it. Their workshops are invitations to explore, play and discover, not to achieve a particular result.',
            },
          ],
        },
      ],
      closing: 'Come curious. Leave with something made by you.',
    },

    {
      id: 'day',
      nav: 'A day at The Spark',
      title: 'A rhythm that balances inspiration and rest',
      lead: 'Enough structure to feel held. Enough freedom to explore, integrate and simply be.',
      blocks: [
        {
          type: 'text',
          heading: 'Your days unfold gently',
          paragraphs: [
            'There is a rhythm to The Spark, but it is not rigid. Some days invite deeper creative exploration; others leave more space to rest, wander, connect or do nothing at all.',
            'The intention is simple: to create the conditions in which inspiration, insight and connection can emerge naturally.',
          ],
        },
        {
          type: 'schedule',
          heading: 'A day in the life',
          rows: [
            { time: '08:00–08:45', activity: 'Morning practice: breathwork, meditation and Qi Gong' },
            { time: '09:00–10:00', activity: 'Breakfast' },
            { time: '10:00–10:30', activity: 'Break' },
            { time: '10:30–13:30', activity: 'Creative workshop' },
            { time: '13:30–14:30', activity: 'Lunch' },
            { time: '14:30–18:30', activity: 'Free time or an additional workshop' },
            { time: '18:30–20:00', activity: 'Dinner' },
            { time: '20:00–21:30', activity: 'Performance, workshop or a free evening' },
          ],
        },
        {
          type: 'text',
          heading: 'Space to integrate',
          paragraphs: [
            'In the afternoons you might walk through the gardens, swim in the natural pool, journal, rest in your room or have an unhurried conversation with another guest.',
            'Free time is not empty time. It is where the experiences of the day can settle, and where your own ideas often begin to surface.',
          ],
        },
        {
          type: 'text',
          heading: 'The final evening',
          paragraphs: ['On the last evening the week becomes an open-house exhibition of the work that emerged during the retreat.'],
        },
      ],
      closing: 'Come for the workshops. Stay for what unfolds.',
    },

    {
      id: 'venue',
      nav: 'Venue & location',
      title: 'A private estate in the hills of Aljezur',
      lead: 'Wild landscapes, quiet space and the Atlantic coast.',
      // Chosen by Philine, November 2026: the main house behind the heading, levelled.
      cover: {
        name: 'venue-house',
        alt: 'The whitewashed main house at Quinta Javali, with a wooden pergola, a long dining table and a stepping-stone path',
        width: 1600,
        height: 2149,
        focus: '50% 33%',
      },
      blocks: [
        {
          type: 'text',
          heading: 'Space to slow down, create and breathe',
          paragraphs: [
            'The Spark takes place at Quinta Javali, a private estate near Aljezur on the Costa Vicentina. Set among rolling hills, gardens, cork oaks and walking trails, it offers privacy, comfort and a rare sense of space.',
            'With two houses, open-air spaces, a natural swimming pool and gardens, it suits groups who want to slow down and reconnect with something quieter.',
          ],
        },
        // Chosen by Philine, November 2026: the estate, the houses and the kitchen.
        {
          type: 'gallery',
          label: 'Photos of Quinta Javali',
          folder: 'venue',
          drift: true,
          items: [
            { name: 'pool-deck', alt: 'The natural swimming pool and wooden deck, with the houses and terraced gardens behind' },
            { name: 'garden-doors', alt: 'Through glass doors, an outdoor dining table under a large tree and wooded hills' },
            { name: 'kitchen-island', alt: 'A kitchen island under woven pendant lights, with glass doors open to the hills' },
            { name: 'kitchen-shelves', alt: 'Wooden shelves with glasses and bowls above a plastered kitchen counter' },
            { name: 'stairs-painting', alt: 'A white staircase beside a large painted portrait and a wooden dining table' },
            { name: 'terrace-chairs', alt: 'Two woven armchairs on a shaded terrace looking out over green hills' },
            { name: 'kitchen', alt: 'A long kitchen with plastered counters, open shelves and woven lamps' },
            { name: 'living-room', alt: 'A bright living room with white sofas, a wood stove and a beamed ceiling' },
            { name: 'pool-view', alt: 'The pool among wild planting, with the houses and a tall tree under a blue sky' },
          ],
        },
        {
          type: 'text',
          heading: 'The Costa Vicentina as your creative backdrop',
          paragraphs: [
            'Aljezur lies within the Southwest Alentejo and Vicentine Coast Natural Park: a protected landscape of hills, river valleys, dunes, cliffs and Atlantic beaches. Nearby beaches include Praia da Amoreira and Praia da Arrifana, both known for their dramatic coastline and wide-open skies.',
            'This is not a polished resort town. It is a wilder, more elemental part of Portugal, well suited to stepping out of routine and letting the landscape become part of the creative process.',
          ],
        },
        {
          type: 'list',
          heading: 'Getting there',
          items: [
            'Faro Airport: about 108 km, around 1 hour 15 minutes by car',
            'Lisbon Airport: about 238 km, around 3 hours by car',
            'Transfers are not included. A WhatsApp group is created before arrival so guests can share cars, taxis or private transfers.',
          ],
        },
      ],
      closing: 'A place designed for presence.',
    },

    {
      id: 'food',
      nav: 'Food & wellbeing',
      title: 'Nourishment for body, mind and imagination',
      lead: 'Food, rest and wellbeing practices that support a week of creative exploration.',
      blocks: [
        {
          type: 'text',
          heading: 'Food as part of the creative experience',
          paragraphs: [
            'At Scintillart, food is not an afterthought. It is part of the rhythm of the week: colourful, seasonal, homemade and made with care.',
            'Our chef prepares fresh vegan and vegetarian meals. Breakfast, lunch, dinner and snacks are included, with an emphasis on fresh ingredients, shared meals and time around the table.',
          ],
        },
        // Chosen by Philine, November 2026: dishes from the retreat kitchen. Still, zooms on hover.
        {
          type: 'gallery',
          label: 'Photos of the food',
          folder: 'food',
          zoom: true,
          items: [
            { name: 'food-01', alt: 'Golden fried tofu with carrots, broccoli and fresh coriander in a dark bowl' },
            { name: 'food-02', alt: 'Roasted red pepper, aubergine and nuts over salad leaves' },
            { name: 'food-03', alt: 'Pasta with mushrooms and crushed pistachios' },
            { name: 'food-04', alt: 'Rice with broccoli and crispy tofu on a speckled plate' },
            { name: 'food-05', alt: 'A folded flatbread with mushrooms, tomatoes and basil on a wooden board' },
          ],
        },
        {
          type: 'text',
          heading: 'Meals that bring people together',
          paragraphs: [
            'The first evening begins with a guided opening dinner, designed to awaken the senses and gently bring you into the week. Later, a collaborative cooking workshop invites you into the kitchen, turning food into another form of creative expression.',
            'One dinner is intentionally left open, so you can explore a local restaurant and taste the region on your own or with fellow guests.',
          ],
        },
        {
          type: 'text',
          heading: 'Room to rest, integrate and return to yourself',
          paragraphs: [
            'Each morning begins with breathwork, meditation and Qi Gong, making space in body and mind before a day of creative exploration.',
            'Between sessions, enjoy the natural swimming pool, the gardens and quiet outdoor areas; there is also a sauna. You are invited to take part fully, but never pressured: solitude, rest, journaling, walking and quiet time are part of the experience.',
          ],
        },
        {
          type: 'text',
          heading: 'Optional treatments',
          paragraphs: [
            'Optional treatments may include intuitive massage, Reiki, and one-to-one inner-balance or navigation sessions, available as additions for guests who wish to deepen their personal restoration.',
          ],
        },
      ],
      closing: 'Nourish the part of you that creates.',
    },

    {
      id: 'accommodation',
      nav: 'Accommodation & pricing',
      title: 'Choose the space that feels right for you',
      lead: 'Comfortable rooms in a private natural setting, for rest, reflection and retreat.',
      // Chosen by Philine, November 2026: an en-suite bathroom at Quinta Javali.
      cover: {
        name: 'accommodation-bath',
        alt: 'An en-suite bathroom with a freestanding bath, a basin and an old green door',
        width: 2048,
        height: 1536,
        focus: '50% 45%',
      },
      blocks: [
        {
          type: 'text',
          heading: 'A home for the week',
          paragraphs: [
            'The Spark is intentionally small. The rooms feel personal rather than institutional: quiet spaces with views, where you can return to yourself between workshops and shared meals.',
            'Choose a shared room if you enjoy the communal rhythm of retreat life, or a private room if you value solitude and quiet.',
          ],
        },
        // Step 2 adds photo galleries, amenity tags and "Show more" to these cards.
        { type: 'rooms', heading: 'Rooms designed for rest', items: rooms },
        {
          type: 'included',
          included: {
            heading: 'What your retreat includes',
            items: [
              'Six nights’ accommodation',
              'All guided creative workshops and materials',
              'Daily breathwork, meditation and Qi Gong',
              'Breakfast, lunch, dinner and snacks',
              'Access to the natural pool, gardens, communal spaces and sauna',
              'Evening performances, shared experiences and the final exhibition',
              'Your own artworks to take home',
            ],
          },
          excluded: {
            heading: 'Not included',
            items: ['Flights', 'Airport transfers', 'Travel insurance', 'Visa fees', 'One open dinner at a local restaurant', 'Optional treatments'],
          },
        },
        {
          type: 'facts',
          heading: 'Booking and cancellation',
          facts: [
            { term: 'Early-bird deadline', detail: TBA },
            { term: 'Deposit', detail: TBA },
            { term: 'Balance', detail: TBA },
            { term: 'Cancellation', detail: TBA },
          ],
        },
      ],
    },

    {
      id: 'faq',
      nav: 'FAQ',
      title: 'Everything you need to know',
      lead: 'We want you to arrive feeling informed, welcome and free of expectations. Here are the questions guests most often ask before joining The Spark.',
      blocks: [{ type: 'faq', items: faq }],
    },
  ] satisfies Chapter[],

  interest: {
    /** The only call to action on the page. */
    label: 'Register your interest',
    kicker: 'Register your interest',
    title: 'One week. One spark. A new way of seeing.',
    body: 'Join a small group for an artist-led creative retreat in Portugal’s wild south-west. Still have a question? Write it in the message field when you register.',
    /** Room cards: price line labels. */
    earlyBird: 'Early bird',
    bestFor: 'Best for',
  },

  /**
   * The "Register your interest" panel. Lines marked DRAFT were written by Claude and
   * await Igor's approval (TBA): replace or confirm, then remove the marker.
   */
  register: {
    title: 'Register your interest',
    /** DRAFT (TBA: awaiting approval). */
    intro:
      'Leave your details and we will contact you about dates, rooms and booking for The Spark. Registering does not commit you to anything.',
    fields: {
      name: 'Name',
      email: 'Email',
      room: 'Room preference',
      roomNotSure: 'Not sure yet',
      travelling: 'Travelling',
      alone: 'Alone',
      together: 'With a partner or friend',
      message: 'Message',
      optional: 'optional',
      messageHint: 'Questions are welcome.',
      consent: 'I agree to Scintillart contacting me about The Spark.',
      privacy: 'Privacy policy',
      /** Opens in a new tab, so nothing typed in the form is lost. */
      privacyHref: '/privacy',
      privacyNewTab: '(opens in a new tab)',
      honeypot: 'Leave this field empty',
    },
    submit: 'Register your interest',
    sending: 'Sending…',
    close: 'Close',
    errors: {
      name: 'Please enter your name.',
      email: 'Please enter your email address.',
      emailFormat: 'Please check your email address. It should look like name@example.com.',
      room: 'Please choose a room from the list.',
      travelling: 'Please choose one of the options.',
      consent: 'Please tick the box so we can contact you about The Spark.',
      tooLong: 'This is a little long. Please shorten it.',
      summaryOne: 'Please check the field marked below.',
      summaryMany: 'Please check the {count} fields marked below.',
    },
    /** DRAFT (TBA: awaiting approval). */
    success: {
      title: 'Thank you',
      body: 'We have received your details and will be in touch about The Spark.',
    },
    /** DRAFT (TBA: awaiting approval). */
    failure: {
      title: 'Your details could not be sent',
      body: 'Please try again in a moment, or email us directly:',
    },
    /** Without JavaScript, and when sending fails: a plain email instead. */
    fallbackEmail: 'hello@scintillart.com',
    mailSubject: 'The Spark: registering my interest',
  },

  ui: {
    skip: 'Skip to content',
    chaptersLabel: 'Chapters',
    themeLabel: 'Colour theme',
    light: 'Light',
    dark: 'Dark',
    home: 'Scintillart, home',
    next: 'Next',
    galleryPrev: 'Previous photos',
    galleryNext: 'Next photos',
  },
}

/** mailto: fallback for "Register your interest" (no JavaScript, or sending failed). */
export function registerMailto(roomId?: RoomId): string {
  const { fallbackEmail, mailSubject } = thespark.register
  const room = rooms.find((r) => r.id === roomId)
  const subject = room ? `${mailSubject} (${room.name})` : mailSubject
  return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}`
}

/** FAQ structured data (schema.org FAQPage), written into the page <head> at build. */
export function faqJsonLd(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  })
}
