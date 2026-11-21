/**
 * Booking and cancellation terms for The Spark: the single source for /booking-terms and
 * for the short summary box in chapter 7 of /thespark. Philine's wording, November 2026.
 * Same shape as privacy.ts, so both pages share one layout. Not legal advice; not yet
 * reviewed by a lawyer. Plain data only (also read by vite.config.ts).
 */
import type { PrivacySection } from './privacy.ts'

export const terms = {
  path: '/booking-terms',
  meta: {
    title: 'Booking and cancellation terms | The Spark | Scintillart',
    description: 'Deposit, payment, cancellation and replacement terms for The Spark, the creative retreat by Scintillart.',
  },
  title: 'Booking and cancellation terms',
  updated: 'Last updated 21 November 2026',
  intro: 'These terms apply to bookings for The Spark.',

  /** The short version, shown in a box on /thespark with a link to this page. */
  summary: {
    heading: 'Deposit and cancellation',
    items: [
      { term: 'Deposit', text: '50% of the total retreat price, on booking. Your place is confirmed once it is received.' },
      { term: 'Balance', text: 'The remaining 50%, 30 days before the retreat starts.' },
      { term: 'Cancellation', text: 'The deposit is non-refundable. More than 30 days before arrival, any further payments are refunded; from 15 to 30 days, 50% of the total price is non-refundable; from 14 days, 100%.' },
      { term: 'Can’t come?', text: 'You can transfer your reservation to someone else, subject to our approval.' },
    ],
    link: 'Full booking and cancellation terms',
  },

  sections: [
    {
      id: 'booking',
      heading: 'Booking and payment',
      paragraphs: [
        'To secure your retreat reservation, a 50% deposit of the total retreat price is required upon booking.',
        'The remaining 50% balance is due 30 days before the retreat start date.',
        'For bookings made within 30 days of arrival, full payment is required upon reservation.',
        'Your booking is confirmed once the initial deposit has been received.',
      ],
    },
    {
      id: 'cancellation',
      heading: 'Cancellation policy',
      paragraphs: [
        'We understand that circumstances can change. However, as retreats involve advance accommodation bookings, preparation and financial commitments, the following cancellation terms apply:',
      ],
      items: [
        // Philine, 21 November 2026.
        { term: 'Upon booking', text: 'A 50% deposit of the total retreat price is required to secure your reservation. This deposit is non-refundable.' },
        { term: 'More than 30 days before arrival', text: 'If you cancel, the deposit will be retained. Any additional payments made will be refunded.' },
        { term: '15–30 days before arrival', text: '50% of the total retreat price is non-refundable.' },
        { term: '14 days or less before arrival', text: '100% of the total retreat price is non-refundable.' },
      ],
    },
    {
      id: 'replacement',
      heading: 'Finding a replacement participant',
      paragraphs: [
        // Philine, 21 November 2026.
        'If you are unable to attend, you may transfer your reservation to another person, subject to approval by the organisers and availability of the accommodation. This allows you to recover your investment without losing your booking payment.',
      ],
    },
    {
      id: 'organiser',
      heading: 'Cancellation by the organiser',
      paragraphs: ['In the unlikely event that we need to cancel the retreat, all payments received will be refunded in full.'],
    },
    {
      id: 'insurance',
      heading: 'Travel insurance',
      paragraphs: ['We recommend arranging personal travel insurance to cover unforeseen circumstances that may affect your ability to attend the retreat.'],
    },
  ] as PrivacySection[],
}
