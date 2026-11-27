/**
 * Booking and cancellation terms for The Spark: the single source for /booking-terms and
 * for the short summary box in chapter 7 of /thespark. Philine's wording, November 2026; payment terms updated 25 November 2026 (Igor).
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
  updated: 'Last updated 25 November 2026',
  intro: 'These terms apply to bookings for The Spark.',

  /** The short version, shown in a box on /thespark with a link to this page. */
  summary: {
    heading: 'Deposit and cancellation',
    items: [
      { term: 'Deposit', text: '50% of the total retreat price, on booking. It is non-refundable and confirms your place.' },
      { term: 'Balance', text: 'The remaining 50%, 45 days before the retreat starts. If you book within 45 days of arrival, the full amount is due on booking.' },
      { term: 'Cancellation', text: 'Payments are non-refundable. If we are able to fill your place, we will offer you a credit towards a future retreat.' },
      { term: 'Can’t come?', text: 'You can transfer your reservation to someone else, subject to our approval.' },
    ],
    link: 'Full booking and cancellation terms',
  },

  sections: [
    {
      id: 'booking',
      heading: 'Booking and payment',
      paragraphs: [
        'To secure your retreat reservation, a 50% deposit of the total retreat price is required upon booking. The deposit is non-refundable.',
        'The remaining 50% balance is due 45 days before the retreat start date.',
        'For bookings made within 45 days of arrival, full payment is required upon reservation.',
        'Your booking is confirmed once the initial deposit has been received.',
      ],
    },
    {
      id: 'cancellation',
      heading: 'Cancellation policy',
      paragraphs: [
        'The group is small, and we commit to the venue, the chef and the facilitators well in advance. For this reason, all payments are non-refundable once made.',
        'If you cannot attend and we are able to fill your place, we will offer you a credit towards a future retreat.',
      ],
    },
    {
      id: 'replacement',
      heading: 'Finding a replacement participant',
      paragraphs: [
        'If you are unable to attend, you may transfer your reservation to another person, subject to approval by the organisers and availability of the accommodation.',
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
      paragraphs: ['We strongly recommend arranging personal travel and cancellation insurance to cover unforeseen circumstances that may affect your ability to attend the retreat.'],
    },
  ] as PrivacySection[],
}
