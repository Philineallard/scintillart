/**
 * Privacy policy for scintillart.com: the single source for /privacy.
 *
 * Adapted (November 2026) from the Natural Healing Hearts policy
 * (naturalhealinghearts.com/privacy, last updated 5 November 2026), same data controller,
 * rewritten for what scintillart.com actually does (checked in the code):
 * - The only personal data it collects is the "Register your interest" form on /thespark,
 *   sent through a Cloudflare Pages Function and emailed with Resend.
 * - No cookies, no analytics, no advertising; fonts are self-hosted.
 * - The theme choice is kept in the visitor's own browser (localStorage "scintillart-theme").
 * Keep this file in step with the site: a new form, analytics tool or embed means an update here.
 *
 * Not legal advice: have it reviewed before relying on it.
 * Plain data only (also read by vite.config.ts).
 */
import { TBA } from './thespark.ts'

export type PrivacySection = {
  id: string
  heading: string
  paragraphs?: string[]
  items?: { term: string; text: string }[]
}

export const privacy = {
  path: '/privacy',
  meta: {
    title: 'Privacy policy | Scintillart',
    description: 'How Scintillart handles personal data on scintillart.com, including the Register your interest form for The Spark.',
  },
  title: 'Privacy policy',
  updated: 'Last updated 19 November 2026',
  intro:
    'This policy explains what personal data scintillart.com collects, why, who helps us process it, how long we keep it, and the rights you have. We collect as little as we can.',
  contactEmail: 'hello@scintillart.com',

  sections: [
    {
      id: 'controller',
      heading: 'Who is responsible',
      paragraphs: [
        // Igor's decision: name and email only. No address or tax number on the site.
        'Scintillart is operated by Philine Allard, a sole trader in Portugal, who is the data controller for scintillart.com.',
        'For anything about your personal data, email hello@scintillart.com.',
      ],
    },
    {
      id: 'collect',
      heading: 'What we collect and why',
      items: [
        {
          term: 'Register your interest (The Spark)',
          text: 'Your name and email address, and, if you choose to give them, your room preference, whether you are travelling alone or with someone, and your message. We use them only to contact you about The Spark: dates, rooms, booking and any questions you asked. Legal basis: your consent, given with the checkbox on the form. You can withdraw it at any time by emailing us; this does not affect anything we did before.',
        },
        {
          term: 'Emails you send us',
          text: 'The content of your email and your address, used to reply to you. Legal basis: steps you ask us to take, and our legitimate interest in answering enquiries.',
        },
        {
          term: 'Technical data',
          text: 'When you visit, our hosting provider processes your IP address and basic request data (such as browser type and the page requested) to deliver the site and protect it against abuse. We do not use this to identify you. Legal basis: our legitimate interest in a secure, working website.',
        },
        {
          term: 'Spam protection',
          text: 'The form contains a hidden field that people do not see. Submissions that fill it in are treated as spam and discarded without being stored or sent.',
        },
      ],
      paragraphs: ['We do not sell your data, share it for advertising, or use it for profiling or automated decision-making.'],
    },
    {
      id: 'processors',
      heading: 'Who processes it for us',
      paragraphs: ['We use a small number of service providers, under their data processing terms and only for the purposes below.'],
      items: [
        { term: 'Cloudflare', text: 'Hosting, security and the server code that receives the form.' },
        { term: 'Resend', text: 'Delivers the form to our inbox as an email.' },
        { term: 'Email inbox provider', text: TBA },
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      items: [
        {
          term: 'Registrations and emails',
          text: 'As long as needed to answer you and keep you informed about The Spark, and no longer than two years after our last contact. Sooner if you ask us to delete them.',
        },
        { term: 'Technical data', text: 'Kept by Cloudflare for a short period under its own policy, for security and operations.' },
      ],
    },
    {
      id: 'transfers',
      heading: 'International transfers',
      paragraphs: [
        'Cloudflare and Resend are based in the United States or use servers there. Transfers rely on the EU–US Data Privacy Framework or the European Commission’s standard contractual clauses.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies and your device',
      paragraphs: [
        'scintillart.com sets no cookies and uses no analytics, tracking or advertising tools. Our fonts are served from our own site.',
        'If you choose the light or dark theme, your choice is stored in your browser’s local storage (“scintillart-theme”) so the site remembers it. It stays on your device and is never sent to us. You can clear it at any time in your browser settings.',
      ],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'You can ask for access to your data, correction, deletion, restriction of processing and a copy in a portable format; you can object to processing based on legitimate interest; and you can withdraw consent at any time. Email hello@scintillart.com. We reply within one month.',
      ],
    },
    {
      id: 'complaints',
      heading: 'Complaints',
      paragraphs: [
        'If you are unhappy with how we handle your data, please tell us first. You also have the right to complain to the Portuguese supervisory authority, the Comissão Nacional de Proteção de Dados (CNPD, www.cnpd.pt), or to the authority in the country where you live.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes to this policy',
      paragraphs: ['If we make material changes, we will update this page and the date at the top.'],
    },
  ] satisfies PrivacySection[],
}
