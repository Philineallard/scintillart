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
export type Practice = { name: string }

export const retreat = {
  eyebrow: 'Our retreats',
  title: 'An artist-led retreat near Aljezur, Algarve',
  line: 'Where a spark becomes art.',
  facts: [
    { term: 'When', detail: 'End of January to early February 2027', note: 'Exact dates to be announced.' },
    { term: 'Rhythm', detail: 'Monday afternoon to Sunday morning' },
    { term: 'Group', detail: '8–16 participants' },
    { term: 'Where', detail: 'Near Aljezur, Algarve, Portugal', note: 'Guest house being confirmed.' },
    { term: 'Price', detail: 'Being confirmed' },
  ] satisfies RetreatFact[],
  /** Philine's own words, from past retreats. Shown one at a time on the page. */
  takeaways: {
    title: 'What people take home',
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
  practices: [{ name: 'Art' }, { name: 'Photography' }, { name: 'Collage' }, { name: 'Ceramics' }, { name: 'Performance' }, { name: 'Life drawing' }, { name: 'Qi Gong' }, { name: 'Breathwork' }, { name: 'Meditation' }, { name: 'Tea ceremony' }] as Practice[],
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
