/**
 * "Register your interest": the payload and its validation, shared by the form
 * (src/components/thespark/RegisterPanel.tsx), the local dev stub (vite.config.ts) and
 * the Cloudflare Pages Function (functions/api/register.ts), so the rules never drift.
 * Plain TypeScript: no browser or Node APIs.
 */
import { rooms, thespark, type RoomId } from '../content/thespark.ts'

export type Travelling = '' | 'alone' | 'together'
/** '' = "Not sure yet". */
export type RoomChoice = RoomId | ''

export type RegisterPayload = {
  name: string
  email: string
  /** Country calling code with a leading +, e.g. "+351". */
  phoneCode: string
  /** The phone number without the country code. */
  phone: string
  room: RoomChoice
  travelling: Travelling
  message: string
  consent: boolean
  /** Optional: would like to receive further information (newsletter). */
  newsletter: boolean
  /** Honeypot: hidden from people, filled in by bots. Must be empty. */
  website: string
}

export type Field = 'name' | 'email' | 'phoneCode' | 'phone' | 'room' | 'travelling' | 'message' | 'consent'
export type FieldErrors = Partial<Record<Field, string>>

export const LIMITS = { name: 120, email: 254, message: 2000 } as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** + then 1 to 4 digits (spaces or a dash allowed, as in "+1 268"). */
const PHONE_CODE = /^\+\d{1,4}([ -]?\d{1,4})?$/
/** Digits with optional spaces, dots, dashes or brackets; 4 to 15 digits in all. */
const PHONE = /^[\d\s().-]+$/
const digits = (s: string) => s.replace(/\D/g, '').length
const ROOM_IDS = new Set<string>(rooms.map((r) => r.id))

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** True when the honeypot field was filled in: treat as spam, silently. */
export function isHoneypotHit(input: unknown): boolean {
  return typeof input === 'object' && input !== null && str((input as Record<string, unknown>).website) !== ''
}

/** Reads untrusted input (form state or a request body) into a clean payload. */
export function normalise(input: unknown): RegisterPayload {
  const o = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>
  const travelling = str(o.travelling)
  return {
    name: str(o.name),
    email: str(o.email),
    phoneCode: (() => {
      const c = str(o.phoneCode)
      return c && !c.startsWith('+') ? `+${c}` : c
    })(),
    phone: str(o.phone),
    room: str(o.room) as RoomChoice,
    travelling: (travelling === 'alone' || travelling === 'together' ? travelling : travelling ? 'invalid' : '') as Travelling,
    message: str(o.message),
    consent: o.consent === true,
    newsletter: o.newsletter === true,
    website: str(o.website),
  }
}

export function validate(p: RegisterPayload): FieldErrors {
  const e = thespark.register.errors
  const errors: FieldErrors = {}
  if (!p.name) errors.name = e.name
  else if (p.name.length > LIMITS.name) errors.name = e.tooLong

  if (!p.email) errors.email = e.email
  else if (p.email.length > LIMITS.email || !EMAIL.test(p.email)) errors.email = e.emailFormat

  if (!p.phoneCode) errors.phoneCode = e.phoneCode
  else if (!PHONE_CODE.test(p.phoneCode)) errors.phoneCode = e.phoneCodeFormat
  if (!p.phone) errors.phone = e.phone
  else if (!PHONE.test(p.phone) || digits(p.phone) < 4 || digits(p.phone) > 15) errors.phone = e.phoneFormat

  if (p.room && !ROOM_IDS.has(p.room)) errors.room = e.room
  if (p.travelling && p.travelling !== 'alone' && p.travelling !== 'together') errors.travelling = e.travelling
  if (p.message.length > LIMITS.message) errors.message = e.tooLong
  if (!p.consent) errors.consent = e.consent
  return errors
}

export function validateRegistration(input: unknown): { ok: true; data: RegisterPayload } | { ok: false; errors: FieldErrors } {
  const data = normalise(input)
  const errors = validate(data)
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The confirmation the visitor receives: plain text plus a simple HTML version (tables and
 * inline styles only, so it holds up in Gmail, Outlook and Apple Mail). Copy lives in
 * thespark.register.confirmation.
 */
export function formatConfirmationEmail(p: RegisterPayload): { subject: string; text: string; html: string } {
  const c = thespark.register.confirmation
  const s = c.signature
  const firstName = p.name.trim().split(/\s+/)[0] || p.name.trim()
  const greeting = c.greeting.replace('{firstName}', firstName)

  const text = [
    greeting,
    '',
    ...c.paragraphs.flatMap((para) => [para, '']),
    ...c.closing,
    '',
    '--',
    s.names,
    s.role,
    s.company,
    s.website,
    s.email,
    s.phone,
    '',
    s.definitionTerm,
    s.definitionClass,
    ...s.definition,
  ].join('\n')

  const font = "font-family:Georgia,'Times New Roman',serif;"
  const sans = 'font-family:Helvetica,Arial,sans-serif;'
  const p_ = (t: string, extra = '') =>
    `<p style="margin:0 0 16px;${font}font-size:16px;line-height:1.6;color:#232323;${extra}">${t}</p>`
  const small = (t: string, extra = '') =>
    `<div style="${sans}font-size:13px;line-height:1.6;color:#4a4744;${extra}">${t}</div>`
  const link = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:#4a4744;text-decoration:underline;">${escapeHtml(label)}</a>`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#F9F8F5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F9F8F5;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td style="padding:0;">
${p_(escapeHtml(greeting))}
${c.paragraphs.map((t) => p_(escapeHtml(t))).join('\n')}
${p_(c.closing.map(escapeHtml).join('<br>'), 'margin-bottom:28px;')}
<div style="border-top:1px solid #d9d4ca;padding-top:20px;">
${small(`<strong style="color:#232323;font-weight:600;">${escapeHtml(s.names)}</strong><br>${escapeHtml(s.role)}<br>${escapeHtml(s.company)}`)}
${small(
  `${link(s.websiteHref, s.website)}<br>${link(`mailto:${s.email}`, s.email)}<br>${link(`tel:${s.phone.replace(/\s/g, '')}`, s.phone)}`,
  'margin-top:10px;',
)}
${small(
  `<span style="${font}font-style:italic;font-size:14px;color:#232323;">${escapeHtml(s.definitionTerm)}</span><br><em>${escapeHtml(s.definitionClass)}</em><br>${s.definition.map(escapeHtml).join('<br>')}`,
  'margin-top:16px;',
)}
<img src="${escapeHtml(s.image)}" width="300" height="125" alt="${escapeHtml(s.imageAlt)}" style="display:block;margin-top:20px;border:0;width:300px;max-width:100%;height:auto;">
</div>
</td></tr></table>
</td></tr></table>
</body></html>`

  return { subject: c.subject, text, html }
}

/** The email Scintillart receives: plain text, one field per line. */
export function formatRegistrationEmail(p: RegisterPayload): { subject: string; text: string } {
  const f = thespark.register.fields
  const room = rooms.find((r) => r.id === p.room)?.name ?? f.roomNotSure
  const travelling = p.travelling === 'alone' ? f.alone : p.travelling === 'together' ? f.together : '—'
  return {
    subject: `The Spark: registration of interest from ${p.name}`,
    text: [
      `${f.name}: ${p.name}`,
      `${f.email}: ${p.email}`,
      `${f.phone}: ${p.phoneCode} ${p.phone}`,
      `${f.room}: ${room}`,
      `${f.travelling}: ${travelling}`,
      `Consent to be contacted: yes`,
      `Newsletter: ${p.newsletter ? 'yes' : 'no'}`,
      '',
      `${f.message}:`,
      p.message || '—',
    ].join('\n'),
  }
}
