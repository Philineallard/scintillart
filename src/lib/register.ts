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
  room: RoomChoice
  travelling: Travelling
  message: string
  consent: boolean
  /** Honeypot: hidden from people, filled in by bots. Must be empty. */
  website: string
}

export type Field = 'name' | 'email' | 'room' | 'travelling' | 'message' | 'consent'
export type FieldErrors = Partial<Record<Field, string>>

export const LIMITS = { name: 120, email: 254, message: 2000 } as const

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
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
    room: str(o.room) as RoomChoice,
    travelling: (travelling === 'alone' || travelling === 'together' ? travelling : travelling ? 'invalid' : '') as Travelling,
    message: str(o.message),
    consent: o.consent === true,
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
      `${f.room}: ${room}`,
      `${f.travelling}: ${travelling}`,
      `Consent to be contacted: yes`,
      '',
      `${f.message}:`,
      p.message || '—',
    ].join('\n'),
  }
}
