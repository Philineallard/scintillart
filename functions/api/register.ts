/**
 * POST /api/register: "Register your interest" on /thespark (Cloudflare Pages Function).
 *
 * Validates the form with the same rules as the page (src/lib/register.ts), drops spam
 * caught by the honeypot, and emails the registration to Scintillart.
 *
 * SENDING IS DISABLED until MAIL_ENABLED is "true". While disabled, the function answers
 * 503 so the visitor sees the error state with the email fallback: nobody's details are
 * accepted and then silently lost.
 *
 * To enable sending with Resend (https://resend.com), in the Pages project
 * (Settings → Variables and secrets, Production):
 *   RESEND_API_KEY  secret: an API key with "sending access" only. Never in the client or the repo.
 *   MAIL_FROM       a sender on a domain verified in Resend, e.g. "The Spark <register@scintillart.com>"
 *                   (verifying scintillart.com adds SPF/DKIM DNS records in Cloudflare).
 *   MAIL_TO         optional; defaults to hello@scintillart.com.
 *   MAIL_ENABLED    "true".
 * Then redeploy. Igor's approval is required before enabling (CLAUDE.md).
 *
 * Later, if spam gets through: Cloudflare Turnstile on the form, or a WAF rate-limit rule
 * on /api/register.
 */
import { formatConfirmationEmail, formatRegistrationEmail, isHoneypotHit, validateRegistration } from '../../src/lib/register.ts'

interface Env {
  MAIL_ENABLED?: string
  RESEND_API_KEY?: string
  MAIL_FROM?: string
  MAIL_TO?: string
}

type Context = { request: Request; env: Env }

/** Kept server-side: the address never appears in the page's scripts. */
const DEFAULT_TO = 'hello@scintillart.com'
const MAX_BYTES = 16 * 1024

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

export async function onRequestPost({ request, env }: Context): Promise<Response> {
  // Same-origin requests only (the form on scintillart.com).
  const origin = request.headers.get('origin')
  if (origin && new URL(origin).host !== new URL(request.url).host) return json({ ok: false }, 403)

  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false }, 415)
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) return json({ ok: false }, 413)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ ok: false }, 400)
  }

  // Spam: answer as if it worked, so the bot learns nothing.
  if (isHoneypotHit(body)) return json({ ok: true })

  const result = validateRegistration(body)
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400)

  if (env.MAIL_ENABLED !== 'true' || !env.RESEND_API_KEY || !env.MAIL_FROM) {
    // No personal data in the logs.
    console.log('register: valid registration received, but sending is disabled (MAIL_ENABLED)')
    // Names only (never values), so a missing setting is easy to spot after a deploy.
    const missing = (['MAIL_ENABLED', 'RESEND_API_KEY', 'MAIL_FROM'] as const).filter((k) =>
      k === 'MAIL_ENABLED' ? env.MAIL_ENABLED !== 'true' : !env[k],
    )
    return json({ ok: false, reason: 'sending-disabled', missing }, 503)
  }

  const { subject, text } = formatRegistrationEmail(result.data)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.MAIL_TO || DEFAULT_TO],
      // Replying in the inbox goes straight to the visitor.
      reply_to: result.data.email,
      subject,
      text,
    }),
  })

  if (!res.ok) {
    console.log(`register: mail service answered ${res.status}`)
    return json({ ok: false, reason: 'send-failed' }, 502)
  }

  // Confirmation to the visitor. Their registration has already reached the inbox, so a
  // failure here is logged but does not turn the visitor's success into an error.
  const confirmation = formatConfirmationEmail(result.data)
  const confirm = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [result.data.email],
      // Replies to the confirmation reach the Scintillart inbox.
      reply_to: env.MAIL_TO || DEFAULT_TO,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
    }),
  }).catch(() => null)
  if (!confirm?.ok) console.log(`register: confirmation answered ${confirm?.status ?? 'network error'}`)

  return json({ ok: true })
}
