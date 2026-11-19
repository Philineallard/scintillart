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
  updated: 'Last updated 19 November 2026',
  intro: 'These terms apply to bookings for The Spark.',

  /** The short version, shown in a box on /thespark with a link to this page. */
  summary: {
    heading: 'Deposit and cancellation',
    items: [
      { term: 'Deposit', text: '50% of the total retreat price, on booking. Your place is confirmed once it is received.' },
      { term: 'Balance', text: 'The remaining 50%, no later than 30 days before the retreat starts.' },
      { term: 'Cancellation', text: 'The deposit is non-refundable. From 15 to 30 days before arrival, 50% of the total price; from 14 days, 100%.' },
      { term: 'Can’t come?', text: 'You can pass your place to someone else.' },
    ],
    link: 'Full booking and cancellation terms',
  },

  sections: [
    {
      id: 'booking',
      heading: 'Booking and payment',
      paragraphs: [
        'To secure your retreat reservation, a 50% deposit of the total retreat price is required upon booking.',
        'The remaining 50% balance is due no later than 30 days before the retreat start date.',
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
        { term: 'More than 30 days before arrival', text: 'The 50% deposit is non-refundable.' },
        { term: 'Between 15 and 30 days before arrival', text: '50% of the total retreat price is non-refundable.' },
        { term: '14 days or less before arrival', text: '100% of the total retreat price is non-refundable.' },
      ],
    },
    {
      id: 'replacement',
      heading: 'Finding a replacement participant',
      paragraphs: [
        'If you are unable to attend, you have the option to find another person to take your place.',
        'You may transfer your reservation to a replacement participant, subject to our approval and any relevant accommodation requirements.',
        'Once the replacement participant has confirmed their booking and completed the payment, your original payment will be fully transferred or refunded.',
        'This means you won’t lose your investment if you find someone else to enjoy the retreat in your place.',
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
