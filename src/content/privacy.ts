/**
 * Privacy policy for scintillart.com: the single source for /privacy.
 *
 * Plain, short and deliberately general (Igor, November 2026): providers by role, not by
 * name; retention by purpose, not by date. Structure follows common practice in retreat
 * booking sites (e.g. bookretreats.com: question-style headings, a consent section, a
 * security section, a note on minors), kept to what scintillart.com actually does:
 * - the "Register your interest" form on /thespark (Cloudflare Pages Function → Resend →
 *   the Zoho Mail inbox hello@scintillart.com);
 * - no cookies, no analytics, no advertising; self-hosted fonts;
 * - the light/dark choice stays in the visitor's browser (localStorage).
 * Keep it true: a new form, analytics tool or embed means an update here.
 *
 * Never show the operator's address or tax number (CLAUDE.md). Not legal advice.
 * Plain data only (also read by vite.config.ts).
 */

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
    description: 'How Scintillart handles your personal data on scintillart.com.',
  },
  title: 'Privacy policy',
  updated: 'Last updated 19 November 2026',
  intro: 'We collect as little personal data as we can, use it only to stay in touch with you, and never sell it.',
  contactEmail: 'hello@scintillart.com',

  sections: [
    {
      id: 'who',
      heading: 'Who we are',
      paragraphs: [
        'Scintillart is operated by Philine Allard, a sole trader in Portugal, who is responsible for your data. Questions about it: hello@scintillart.com.',
      ],
    },
    {
      id: 'collect',
      heading: 'What we collect',
      paragraphs: [
        'When you register your interest in a retreat: your name and email address, and anything else you choose to tell us, such as a room preference or a message.',
        'When you email us: your message and email address.',
        'When you visit the site: basic technical data, such as your IP address, which our hosting provider needs to show you the site and keep it secure.',
      ],
    },
    {
      id: 'use',
      heading: 'How we use it',
      paragraphs: [
        'To answer you, to keep you informed about the retreat you asked about, and to keep the site running safely. We do not sell your data, use it for advertising or share it with other businesses for their own use.',
      ],
    },
    {
      id: 'consent',
      heading: 'Your consent',
      paragraphs: [
        'By ticking the box on the registration form, you agree that we may contact you about that retreat. You can change your mind at any time by emailing hello@scintillart.com, and we will stop.',
      ],
    },
    {
      id: 'sharing',
      heading: 'Who we share it with',
      paragraphs: [
        'Only the trusted service providers that run the site and our email (hosting, email delivery and our inbox), and only so they can provide those services. Some of them may process data outside the EU; when they do, it is protected by the safeguards the law requires.',
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies',
      paragraphs: [
        'We use no cookies and no tracking or advertising tools. If you choose the light or dark look of the site, that choice is saved in your own browser and never sent to us.',
      ],
    },
    {
      id: 'retention',
      heading: 'How long we keep it',
      paragraphs: [
        'Only as long as we need it to stay in touch with you about our retreats. You can ask us to delete it at any time.',
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      paragraphs: ['The site uses encrypted connections, we work with established providers, and only we can read what you send us.'],
    },
    {
      id: 'minors',
      heading: 'Under 18',
      paragraphs: ['Our retreats are for adults. We do not knowingly collect data from anyone under 18.'],
    },
    {
      id: 'rights',
      heading: 'Your rights',
      paragraphs: [
        'You can ask to see, correct or delete your data, or object to how we use it. Email hello@scintillart.com and we will reply within a month.',
        'If you are not happy with our answer, you can complain to the Portuguese data protection authority (CNPD, www.cnpd.pt) or to the one where you live.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: ['If this policy changes, we will update this page and the date above.'],
    },
  ] as PrivacySection[],
}
