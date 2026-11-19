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
