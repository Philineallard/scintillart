/**
 * "An arrival in Lisbon": the collaboration proposal for boutique hotels.
 * Single source of truth for /arrival-in-lisbon (mirrors the printed booklet).
 * Images live in public/arrival (max 1600px, webp).
 */
export type ArrivalImage = {
  slug: string
  w: number
  h: number
  alt: string
  /** CSS object-position, for crops that need to keep the subject in frame. */
  focus?: string
}

export type ArrivalItem = { title: string; detail?: string }

const img = (slug: string, w: number, h: number, alt: string, focus?: string): ArrivalImage => ({ slug, w, h, alt, focus })

export const arrival = {
  eyebrow: 'A collaboration proposal',
  title: 'An arrival in Lisbon',
  line: 'Where a spark becomes art.',
  intro: 'A cinematic story for boutique hotels, told through photography and film.',
  disciplines: 'Photography / Film / Editorial storytelling',
  heroImage: img('car', 1480, 988, 'A woman sitting on the bonnet of a classic car on a tree-lined avenue', '72% 50%'),

  about: {
    label: 'About',
    title: 'Images that feel lived in, not staged.',
    body: [
      'Scintillart is a creative studio working across photography, film and editorial storytelling. We are drawn to the quiet details that give a place its soul: light moving across a wall, a table after dinner, the hush of a room just before evening.',
      'For a hotel, that means imagery with atmosphere and intent. Pictures that let a future guest feel the stay before they book it.',
    ],
    image: img('reading', 1068, 1600, 'A woman reading in a chair under a warm spotlight'),
  },

  idea: {
    label: 'The idea',
    title: 'Arrival in Lisbon',
    body: 'Next week we are producing a Lisbon vintage-car editorial, and we would love your hotel to be where the story arrives.',
    moments: [
      { title: 'The arrival', detail: 'A beautifully restored classic car draws up at your door.' },
      { title: 'The neighbourhood', detail: 'A guest steps out and into the streets around the hotel.' },
      { title: 'The stay', detail: 'Quiet, atmospheric moments in your spaces: the lobby, bar, restaurant, courtyard, rooftop or a suite.' },
    ] satisfies ArrivalItem[],
    image: img('fire', 1600, 1068, 'Sparks rising from a fire bowl beside a pool under a full moon', '33% 50%'),
  },

  interiors: [
    img('armchair', 1068, 1600, 'Velvet armchairs by a snowy window in a cosy bar'),
    img('rooftop', 1068, 1600, 'A rooftop terrace with woven lamps and snow-capped mountains beyond'),
  ],

  create: {
    label: 'For the hotel',
    title: 'What we create for you',
    items: [
      { title: '10 to 20 photographs', detail: 'Professionally edited, for your website, social media, booking platforms and other web use.' },
      { title: 'One vertical reel', detail: 'Around 20 to 35 seconds, designed for Instagram and TikTok.' },
      { title: 'Delivered within 7 to 10 days', detail: 'After the shoot, ready to publish.' },
    ] satisfies ArrivalItem[],
    note: 'Print usage and paid campaign usage are available separately, by agreement.',
    image: img('records', 1068, 1600, 'A record player and stools in a lounge hung with framed polaroids'),
  },

  daylight: {
    images: [
      img('van', 1500, 1000, 'A woman in a black hat leaning against a vintage van, looking up at the sky', '44% 50%'),
      img('meadow', 1000, 1500, 'A smiling woman in a black hat and long kimono in a meadow'),
    ],
    credit: 'Model: Philine Allard',
  },

  cafe: img('cafe', 1600, 1068, 'A woman drinking coffee at a café window'),

  part: {
    label: 'The exchange',
    title: 'Your part of the story',
    items: [
      { title: 'A two-night stay for two' },
      { title: 'Access to selected public spaces' },
      { title: 'Dinner during our stay', detail: 'To capture the food and the dining experience.' },
      { title: 'Permission to photograph', detail: 'The agreed areas, and to use the resulting content for the deliverables above.' },
    ] satisfies ArrivalItem[],
    image: img('table', 1068, 1600, 'Coffee, water and flowers on a café table'),
  },

  night: {
    images: [
      img('smoke', 1067, 1600, 'A woman framing a heart with her hands in coloured smoke', '50% 40%'),
      img('curtain', 1067, 1600, 'A woman in a hat and patterned dress stepping through red curtains', '50% 40%'),
    ],
    credit: 'Model: Philine Allard',
  },

  review: {
    label: 'Additional exposure',
    title: 'In Review',
    body: 'We can also write a considered editorial review of our stay for Igor Swieczak’s In Review series: a personal, experience-led perspective on the accommodation, food, service and atmosphere, with a link to your hotel.',
    items: [
      { title: 'A lasting backlink', detail: 'A permanent link from an independent editorial site, supporting your hotel’s search visibility and domain authority.' },
      { title: 'Evergreen, searchable content', detail: 'An in-depth review indexed by search engines, found by travellers researching where to stay long after the shoot.' },
      { title: 'A trusted third-party voice', detail: 'Genuine, experience-led coverage that builds credibility with guests and search engines alike.' },
    ] satisfies ArrivalItem[],
    link: { label: 'Read an example from the series', href: 'https://igorswieczak.com/8-in-review-stay-golden-arugambay-sri-lanka/' },
    image: img('steel', 1068, 1600, 'Mirrored spheres in front of a curved steel facade'),
  },

  bottles: img('bottles', 1600, 1068, 'Two vintage bottles resting in a softly lit wooden case'),

  closing: {
    label: 'Looking ahead',
    title: 'A first collaboration',
    body: [
      'We see this as the beginning of a conversation. If the visual direction resonates with your team, we would be glad to discuss a paid content partnership in the future.',
      'On request, we can share a short moodboard, shot list and collaboration outline.',
    ],
    names: 'Igor Swieczak & Philine Allard',
    signature: { src: 'arrival/igor-swieczak-signature.png', w: 500, h: 142, alt: 'Igor Swieczak photography' },
  },
}
