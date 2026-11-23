/**
 * Homepage copy. The definition wording is approved: do not rewrite it.
 */
export const brand = {
  name: 'Scintillart',
  domain: 'scintillart.com',
  line: 'Where a spark becomes art.',
  pronunciation: '/sɪnˈtɪl.ɑːrt/',
  partOfSpeech: 'noun',
  senses: [
    {
      lead: 'A creative spark made tangible through art.',
      body: 'The initial flash of an idea, feeling, image, or encounter — given form, shared, and allowed to travel.',
    },
    {
      lead: 'A place or practice where small creative impulses become lasting work.',
      body: 'A studio, retreat, gathering, or collaboration in which people make space for curiosity, craft, and connection.',
    },
    {
      lead: 'The visible trace of an artistic exchange.',
      body: 'Not only the artwork itself, but the atmosphere, conversation, relationship, and momentum it leaves behind.',
    },
  ],
  /**
   * What Scintillart does, shown on the right of the homepage. One pillar per sense above:
   * the first definition shows Art, the second Culture, the third Events (Philine, November 2026).
   */
  pillars: [
    {
      name: 'Art',
      lead: 'Artist-led creation, collaboration, and content.',
      body: 'We connect the right artists with the right places and brands.',
    },
    {
      name: 'Culture',
      lead: 'Retreats, gatherings, and creative experiences.',
      body: 'We make room for curiosity, craft, and meaningful connection.',
    },
    {
      name: 'Events',
      lead: 'Exhibitions, vernissages, and artistic encounters.',
      body: 'We create moments that leave a lasting trace.',
    },
  ],
  primaryAction: 'Our retreats',
  /** Shown on the landing page in place of the retreats link (launch version). */
  contact: { label: 'Contact', email: 'hello@scintillart.com' },
  /** Accessible name for the portal artwork. Describes the actual handmade collage. */
  artworkAlt:
    'Handmade paper collage shaped like a small house: a silver-foil roof with a geometric star and a cut-out owl, a field of pink and apricot roses, a holographic panel framing a vaulted cathedral doorway, and an amethyst crystal resting on silver coils.',
} as const
