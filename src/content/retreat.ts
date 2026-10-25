/**
 * Retreat content: the single source of truth for /retreats.
 *
 * Only confirmed information belongs here. Price, exact dates and the guest house
 * are still being confirmed: keep them marked as such until they are final.
 * Do not add testimonials, availability claims or outcome promises.
 *
 * If retreat/scintillart-retreat-description.md is added to the repository,
 * reconcile this file against it.
 */
export type RetreatFact = { term: string; detail: string; note?: string }
export type Practice = {
  name: string
  /** Shown as the card's heading when it differs from the practice name. */
  title?: string
  /** The artist who guides it. */
  by?: string
  /** One or two short sentences, shown under the photo. */
  description?: string
  image?: { slug: string; w: number; h: number; alt: string }
}

export const retreat = {
  eyebrow: 'Our retreats',
  title: 'An artist-led retreat near Aljezur, Algarve',
  line: 'Where a spark becomes art.',
  facts: [
    { term: 'When', detail: '1–7 February 2027' },
    { term: 'Rhythm', detail: 'Monday afternoon to Sunday morning' },
    { term: 'Group', detail: '8–16 participants' },
    { term: 'Where', detail: 'Near Aljezur, Algarve, Portugal', note: 'Guest house being confirmed.' },
    { term: 'Price', detail: '€1,900 – €2,200' },
  ] satisfies RetreatFact[],
  /** Words from previous participants, shown one at a time on the page. */
  takeaways: {
    title: 'What people take home',
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
  /**
   * Practices, each with the artist who guides it and a photo (public/practices, max 720px).
   * The photo rises from the bottom of the page when the practice is hovered, focused or tapped.
   */
  practices: [
    {
      name: 'Photography',
      title: 'In search of beauty',
      by: 'Igor',
      description:
        'Slow down and learn to see again. Wander the hills and the changing light around the venue, and capture the quiet moments that move you.',
      image: { slug: 'photography', w: 542, h: 720, alt: 'Igor photographing the hills at sunset' },
    },
    {
      name: 'Natural Creations',
      by: 'Erika',
      description:
        'Connect with the nature surrounding the venue, gather its materials, and shape them into something with meaning.',
      image: { slug: 'natural-creations', w: 542, h: 720, alt: 'Erika’s sculptures of dried leaves hanging against a curtain' },
    },
    {
      name: 'Tea Ceremony',
      by: 'Philine',
      description: 'Open your senses and experience something different: an unhurried, in-depth ritual of tea.',
      image: { slug: 'tea-ceremony', w: 720, h: 720, alt: 'A bowl of tea with unfurled leaves, resting on dry leaves' },
    },
    {
      name: 'Ceramics',
      by: 'André',
      description:
        'Connect with the earth and work with your hands. Move from head to body and arrive in the present moment, with a creation of your own.',
      image: { slug: 'ceramics', w: 479, h: 720, alt: 'André shaping clay at a ceramics workshop' },
    },
    {
      name: 'Performance',
      by: 'Willpower',
      description:
        'Be surprised by what we humans are able to create, and how, once it becomes tangible, it shows us how extraordinary we are.',
      image: { slug: 'performance', w: 540, h: 720, alt: 'A performance by Willpower, lit in pink and violet' },
    },
    {
      name: 'Life drawing',
      by: 'Bruno',
      description:
        'The art of seeing and observing. Train the conversation between eye and hand, and step into a slower, more attentive way of looking at the living figure.',
      image: { slug: 'life-drawing', w: 405, h: 720, alt: 'A life drawing on an easel in Bruno’s workshop' },
    },
    {
      name: 'Arkana Within',
      by: 'Manu',
      description:
        'Learn about the archetypes and how they show up in your life, and invite the one that most wants to show up, in a balanced way.',
      image: { slug: 'arkana-within', w: 571, h: 720, alt: 'Three tarot cards, the Ace of Cups, the Star and the King of Wands, upright on a cream cloth' },
    },
    {
      name: 'Archetype Photoshoot',
      description: 'Step into your archetype: an embodied, empowering and fabulous experience in front of the camera.',
      image: { slug: 'archetype-photoshoot', w: 542, h: 720, alt: 'A costumed portrait shoot in warm red light, a photographer at work' },
    },
    {
      name: 'Morning Routine',
      by: 'Philine',
      description:
        'Breathwork, meditation and energy work to empower yourself, start the day in your full potential and invite your life force to awaken.',
      image: { slug: 'morning-routine', w: 556, h: 557, alt: 'Philine leading a Qi Gong session in an open wooden pavilion' },
    },
  ] as Practice[],
  interest: {
    label: 'Register your interest',
    /**
     * There is no registration backend yet. The action opens the visitor's email
     * app with a prefilled subject: honest, and nothing is "submitted" on the site.
     * TODO(owner): confirm this address, or replace with a form endpoint.
     */
    email: 'philine@naturalhealinghearts.com',
    subject: 'Scintillart retreat near Aljezur: registering my interest',
    note: 'Opens a new email in your mail app.',
  },
} as const

export function interestHref(): string {
  const { email, subject } = retreat.interest
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`
}
