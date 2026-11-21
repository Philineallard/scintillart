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

export type RoomId = 'shared' | 'private' | 'private-two' | 'deluxe' | 'deluxe-two'
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

// Room photos chosen by Philine, November 2026 (Quinta Javali). Both deluxe rooms share the en-suite set;
// the couples room starts on the 6th photo (Philine's choice of thumbnail).
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
const ensuitePhotosCouples = [...ensuitePhotos.slice(5), ...ensuitePhotos.slice(0, 5)]

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
      { name: 'shared-05', alt: 'Two beds in the shared room, with the bathroom door open beyond' },
      { name: 'shared-01', alt: 'A round mirror above a stone basin in the shared room’s bathroom' },
      { name: 'shared-02', alt: 'The shared room’s bathroom with a walk-in shower and a small window' },
      { name: 'shared-03', alt: 'The shared room with a bed, a sofa and wooden shutters' },
      { name: 'shared-04', alt: 'The shared room under a sloping white ceiling' },
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
      { name: 'private-04', alt: 'A double bed between two bedside lamps in a private room' },
      { name: 'private-01', alt: 'A private room with a double bed, a ceiling fan and a bright window' },
      { name: 'private-02', alt: 'A double bed and an armchair in a private room with wooden shutters' },
      { name: 'private-03', alt: 'A double bed with white linen under a framed artwork' },
    ],
  },
  {
    // Added by Philine, November 2026: the private room shared by a couple (same room and photos).
    id: 'private-two',
    name: 'Private room for couples',
    tagline: 'Together, simply.',
    bestFor: 'Couples sharing a double bed',
    details: 'For two guests sharing a double bed (180 × 200 cm), with air conditioning and a bathroom outside the bedroom.',
    // €2,700 / €2,500 per person (Philine), shown per room like the deluxe couples room.
    price: { regular: '€5,400', earlyBird: '€5,000', basis: 'per room, for two guests' },
    // Starts on the 3rd photo (Philine's choice of thumbnail), so it differs from the private room.
    photos: [
      { name: 'private-02', alt: 'A double bed and an armchair in a private room with wooden shutters' },
      { name: 'private-03', alt: 'A double bed with white linen under a framed artwork' },
      { name: 'private-04', alt: 'A double bed between two bedside lamps in a private room' },
      { name: 'private-01', alt: 'A private room with a double bed, a ceiling fan and a bright window' },
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
    photos: ensuitePhotosCouples,
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
  | { type: 'list'; heading?: string; caption?: string; items: string[] }
  | { type: 'pillars'; heading: string; items: { title: string; text: string }[] }
  | { type: 'workshops'; heading: string; items: Workshop[]; more?: { label: string; href: string } }
  | { type: 'people'; heading: string; items: Person[] }
  | { type: 'schedule'; heading: string; rows: { time: string; activity: string }[] }
  | { type: 'facts'; heading?: string; facts: Fact[] }
  | { type: 'included'; included: { heading: string; items: string[] }; excluded: { heading: string; items: string[] } }
  | { type: 'faq'; items: Faq[] }
  | { type: 'rooms'; heading: string; items: Room[] }
  /** The short deposit and cancellation box, from src/content/terms.ts. */
  | { type: 'terms' }
  /** Three photos or silent videos side by side, the same size (see Figure). */
  | { type: 'figures'; items: Figure[] }
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

/**
 * A chapter photo in public/thespark/: <name>.webp (full size, `width` wide),
 * <name>-md.webp (1100w), <name>-sm.webp (720w). focus: the point kept in view when cropped.
 */
export type ChapterPhoto = {
  name: string
  alt: string
  width: number
  height: number
  focus: string
  /**
   * Wide screens only: zoom the photo from its left edge by this factor (e.g. 1.4), which
   * moves its subject towards the right of a full-width band. For tall photos, whose
   * subject can't otherwise move sideways in a wide band.
   */
  pushRight?: number
}

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
   * A full-width photo band at the top of the chapter, with the heading on it. It scrolls
   * away normally.
   */
  band?: ChapterPhoto & { plain?: boolean }
  /** Show the heading on its own, plain, at the very top of the chapter (above the spread). */
  headingAbove?: boolean
  /**
   * Repeat the heading, pinned on the side, beside later runs of text: true = beside every
   * one; 'afterRows' = only beside text that follows a full-width row (gallery, rooms).
   */
  repeatHeading?: boolean | 'afterRows'
  /** Text with no heading beside it sits in the left column instead of the right (wide screens). */
  textLeft?: boolean
  /**
   * A photo panel beside the text, with the heading on it, pinned while the text scrolls
   * (wide screens; a band above the text on phones). side: which half it takes.
   * fromBlock: the block it starts beside (default 0); blocks before it use the usual layout.
   */
  panel?: ChapterPhoto & { side?: 'left' | 'right'; fromBlock?: number; textAt?: 'top' | 'bottom' }
  blocks: Block[]
  /** A closing line at the end of the chapter. */
  closing?: string
  /** Words after the closing line that open the Register your interest form. */
  closingRegister?: string
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
      // Chosen by Philine, November 2026: the heading plain above the videos, then the pool and
      // houses (drone photo) pinned on the left beside "Something shifts…".
      headingAbove: true,
      panel: {
        side: 'left',
        name: 'overview-pool',
        alt: 'The natural swimming pool and wooden deck at Quinta Javali, with terraced gardens and the houses behind',
        width: 2400,
        height: 1350,
        focus: '42% 50%',
      },
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
            { term: 'Dates', detail: 'Monday 1 to Sunday 7 February 2027' },
            { term: 'Duration', detail: '7 days, 6 nights, Monday afternoon to Sunday morning' },
            { term: 'Location', detail: 'Quinta Javali, near Aljezur, Costa Vicentina, Portugal' },
            { term: 'Group size', detail: '6–14 guests' },
            { term: 'Includes', detail: 'Workshops, wellbeing practices, accommodation, meals, materials and the final exhibition' },
            { term: 'Price', detail: 'From €2,800 per person; early bird from €2,600', note: 'Early bird until 6 December 2026' },
          ],
        },
        {
          type: 'list',
          heading: 'A week designed to awaken your creativity',
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
          heading: 'Who is The Spark for?',
          paragraphs: [
            'The Spark is for thoughtful, open-minded people who may be capable and successful in many areas of life, yet feel that something essential has gone quiet: curiosity, play, self-expression or connection.',
            'You may be a business owner, a creative professional, a parent, or simply someone in a period of change. You do not need to identify as an artist. You only need to arrive curious, try something new and see what happens.',
            'The Spark is for people who want to fill their free time with something more meaningful than an ordinary holiday.',
            'It is for those craving a supportive, creative environment where they can connect with others, experience something new, and share joyful moments with like-minded people.',
            'Come to make, explore, laugh, and be inspired, and leave with memories, ideas, and connections that stay with you.',
          ],
        },
        // From the first retreats page (October 2026): what previous participants said they
        // took home, written as what you get from joining. Anonymous, as there.
        {
          type: 'list',
          heading: 'What people take home',
          caption: 'Words from previous participants',
          items: [
            'A wonderful, nourishing creative time',
            'A community that feels like a family, even in a short time',
            'Less isolation and new perspectives',
            'Exchanging ideas, skills and motivating talks',
            'Permission to show your emotions and be vulnerable',
            'Seeing how your inner world can express itself through creativity',
            'Stepping out of your comfort zone and the usual grooves of everyday life',
            'Reconnecting with your playfulness and innate creative capacity',
            'Discovering you’re creative once you drop the idea that you’re not',
            'Feeling good enough about yourself and daring to show your true self',
            'More self-assurance and the wish to keep expanding your creativity',
            'Moving, heartfelt moments that stay with you',
            'Rich memories to take home',
          ],
        },
        {
          type: 'text',
          heading: 'You arrive with curiosity. You leave with something made by you.',
          paragraphs: [
            'By the end of the week you will have made work with your own hands, tried new ways of seeing, and allowed yourself to make without needing to be perfect.',
            'You leave with your artwork, new connections, new insights about yourself and fresh inspiration to take home.',
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
      panel: {
        side: 'right',
        name: 'experience-paints',
        alt: 'Tubes and bottles of paint lined up along a sunlit white wall under the leaves of a fig tree',
        width: 2048,
        height: 1367,
        focus: '55% 62%',
        textAt: 'top',
      },
      blocks: [
        // Philine's text, November 2026.
        {
          type: 'text',
          heading: 'Step into the unknown. Discover what you can create.',
          paragraphs: [
            'A week-long retreat in a shared two-house villa in the Algarve, with 6–11 strangers.',
            'We arrive as strangers and gather around the table from the very first night. Through shared meals, conversations, life stories, creative projects, dreams, and the unexpected topics that arise, we begin to see one another more deeply.',
            'Each morning, we dive into powerful mind–body–soul practices. During the day, creative practices invite us to explore, experiment, and express ourselves, with delicious breaks in between to rest, connect, and let inspiration settle.',
            'Slowly, step by step, strangers become friends. The creative energy opens a different way of being: one of creation, play, and free expression. We loosen the grip of limitations and move into lightness, joy, and moments of genuine connection.',
            'By the end of the week, we become a team of artists, working toward a shared purpose: the final exhibition. We open our doors to the local community and celebrate what we have created, together.',
          ],
        },
      ],
      closing: 'Experience something different.',
      closingRegister: 'Join The Spark.',
    },

    {
      id: 'workshops',
      nav: 'Workshops & facilitators',
      // Philine, November 2026 (line breaks are kept on the page).
      title: 'Be guided by artists.\nYou make the art.\nMake it & bring\u00a0it\u00a0home.',
      lead: 'A different artist, practice and creative energy each day.',
      // Chosen by Philine, November 2026: a shell and driftwood hanging by ALL ARD (photo: Igor Świeczak).
      // A full-width band (Philine, November 2026); the heading also sits beside the text below.
      repeatHeading: true,
      band: {
        name: 'workshops-shells',
        alt: 'A hanging made of driftwood, jute, shells and feathers beside small painted canvases',
        width: 1367,
        height: 2048,
        focus: '45% 30%',
        pushRight: 1.45,
      },
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
      ],
      closing: 'Become a creator.',
      closingRegister: 'Join The Spark.',
    },

    {
      id: 'day',
      nav: 'A day at The Spark',
      title: 'A rhythm that balances inspiration and rest',
      lead: 'Enough structure to feel held. Enough freedom to explore, integrate and simply be.',
      // Chosen by Philine, November 2026: Igor Świeczak's exhibition, set up for an evening.
      panel: {
        side: 'right',
        name: 'day-exhibition',
        alt: 'An evening exhibition of photographs on a wall and a red curtain, with a table of prints and studio lights',
        width: 1367,
        height: 2048,
        focus: '50% 50%',
      },
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
        // Chosen by Philine, November 2026: exhibitions from a previous edition.
        {
          type: 'figures',
          items: [
            { kind: 'image', name: 'final-exhibition-igor', alt: 'Photographs pinned to a red curtain under string lights, with prints and a photo book on a table' },
            { kind: 'image', name: 'final-drawings', alt: 'Small framed ink drawings in a row above a charcoal figure drawing' },
            { kind: 'image', name: 'final-house', alt: 'A house set up as an exhibition, with artworks on the walls and paper lanterns overhead' },
          ],
        },
      ],
      closing: 'Step out of routine.',
      closingRegister: 'Ignite your creative spark.',
    },

    {
      id: 'venue',
      nav: 'Venue & location',
      title: 'A private estate in the hills of Aljezur',
      lead: 'Wild landscapes, quiet space and the Atlantic coast.',
      // Chosen by Philine, November 2026: the main house (levelled). A full-width band first;
      // after the gallery the same photo becomes the pinned panel beside the text.
      band: {
        name: 'venue-house',
        alt: 'The whitewashed main house at Quinta Javali, with a wooden pergola, a long dining table and a stepping-stone path',
        width: 1600,
        height: 2149,
        focus: '50% 40%',
      },
      panel: {
        side: 'left',
        fromBlock: 2,
        name: 'venue-house',
        alt: 'The whitewashed main house at Quinta Javali, with a wooden pergola, a long dining table and a stepping-stone path',
        width: 1600,
        height: 2149,
        focus: '50% 40%',
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
      closing: 'Designed for presence, creativity, and connection.',
      closingRegister: 'Join The Spark.',
    },

    {
      id: 'food',
      nav: 'Food & wellbeing',
      title: 'Nourishment for body, mind and imagination',
      lead: 'Food, rest and wellbeing practices that support a week of creative exploration.',
      // Chosen by Philine, November 2026: the title alone at the top; from "Meals that bring
      // people together" the group at dinner around the candlelit table
      // is pinned beside the text.
      panel: {
        side: 'left',
        fromBlock: 2,
        name: 'food-gathering',
        alt: 'Guests around a candlelit dinner table with a painted tablecloth, in a warm living room',
        width: 1320,
        height: 1069,
        focus: '45% 35%',
      },
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
      closing: 'Nourish what wants to be created through you.',
      closingRegister: 'Join The Spark.',
    },

    {
      id: 'accommodation',
      nav: 'Accommodation & pricing',
      title: 'Choose the space that feels right for you',
      lead: 'Comfortable rooms in a private natural setting, for rest, reflection and retreat.',
      // Chosen by Philine, November 2026: an en-suite bathroom at Quinta Javali, as a photo band
      // with the heading on it. After the rooms (full width), the same photo and heading are
      // pinned on the left beside the rest of the chapter.
      // "A home for the week" sits on the left (Philine, November 2026).
      textLeft: true,
      panel: {
        side: 'left',
        fromBlock: 2,
        name: 'accommodation-bath',
        alt: 'An en-suite bathroom with a freestanding bath, a basin and an old green door',
        width: 2048,
        height: 1536,
        focus: '50% 50%',
      },
      band: {
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
          heading: 'Booking',
          facts: [{ term: 'Early-bird deadline', detail: '6 December 2026' }],
        },
        // Deposit and cancellation in short, linking to /booking-terms (Philine, November 2026).
        { type: 'terms' },
        // Moved here (Philine, November 2026): just above the FAQ.
        {
          type: 'people',
          heading: 'The people holding the space',
          items: [
            {
              name: 'Philine Allard',
              role: 'Co-founder, host and facilitator of Scintillart',
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
   * The closing banner: Igor's photograph of a wax-sealed envelope (Igor, November 2026).
   * Clicking the envelope or the button opens the register panel through a short 3D
   * sequence (src/envelope): the seal breaks and the letter comes out. Lines marked DRAFT
   * were written by Claude and await approval (TBA).
   */
  envelope: {
    image: {
      name: 'envelope',
      width: 2048,
      height: 1102,
      alt: 'Dried gypsophila in a green-glazed vase beside a stack of kraft envelopes, one sealed with red wax, on a rough wooden shelf.',
    },
    credit: 'Photograph: Igor Świeczak',
    /** DRAFT (TBA): label shown over the seal on hover. */
    hint: 'Break the seal',
    /** DRAFT (TBA): shown while the sequence plays. */
    skip: 'Click or press Escape to skip',
    /** Accessible name of the envelope link. */
    openLabel: 'Register your interest: open the letter',
    /** Written on the letter that comes out of the envelope. */
    letterKicker: 'The Spark',
  },

  /**
   * The "Register your interest" panel. Lines marked DRAFT were written by Claude and
   * await Igor's approval (TBA): replace or confirm, then remove the marker.
   */
  register: {
    title: 'Register your interest',
    /** Philine, November 2026. */
    intro:
      'Leave your details and we will contact you about questions you might have, the next steps, and booking your spot for The Spark. Registering does not commit you to anything.',
    fields: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      phoneCode: 'Country code',
      phoneNumber: 'Phone number',
      room: 'Room preference',
      roomNotSure: 'Not sure yet',
      travelling: 'Travelling',
      alone: 'Alone',
      together: 'With a partner or friend',
      message: 'Message',
      optional: 'optional',
      messageHint: 'Questions are welcome.',
      consent: 'I agree to Scintillart contacting me about The Spark.',
      newsletter: 'I would love to receive further information about Scintillart.',
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
      phoneCode: 'Please enter your country code.',
      phoneCodeFormat: 'Please check the country code. It should look like +351.',
      phone: 'Please enter your phone number.',
      phoneFormat: 'Please check your phone number. Use digits only, without the country code.',
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
    /**
     * The confirmation email sent to the person who registers (Philine, November 2026).
     * {firstName} is the first word of the name they typed. Replies go to hello@scintillart.com.
     */
    confirmation: {
      subject: 'Scintillart Retreat · The Spark · We received your spark of interest',
      greeting: 'Dear {firstName},',
      paragraphs: [
        'Thank you so much for registering your interest in The Spark, our creative retreat at Quinta Javali near Aljezur, from 1 to 7 February 2027.',
        'We are delighted that you would like to find out more. We will be in touch shortly to arrange a phone call, so we can speak personally about The Spark, answer any questions you may have, and explore whether it feels like the right fit for you.',
        'In the meantime, please feel free to reply to this email with anything you would like to know.',
      ],
      closing: ['All the best,', 'Creative sparks,'],
      signature: {
        names: 'Philine & Igor',
        role: 'Founders',
        company: 'Scintillart',
        website: 'www.scintillart.com',
        websiteHref: 'https://www.scintillart.com',
        email: 'hello@scintillart.com',
        phone: '+32 494 619 059',
        definitionTerm: 'Scintillart /sɪnˈtɪl.ɑːrt/',
        definitionClass: 'noun',
        definition: [
          'A creative spark made tangible through art.',
          'The initial flash of an idea, feeling, image, or encounter, given form, shared, and allowed to travel.',
        ],
        /** Absolute URL: email clients load it from the live site. */
        image: 'https://scintillart.com/email/scintillart-signature.jpg',
        imageAlt: 'Scintillart. Where a spark becomes art.',
      },
    },
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
