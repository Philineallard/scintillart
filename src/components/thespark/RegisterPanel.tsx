import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { rooms, thespark, type RoomId } from '../../content/thespark'
import { LIMITS, normalise, validate, type Field, type FieldErrors, type Travelling } from '../../lib/register'
import pageStyles from '../../pages/TheSparkPage.module.css'
import styles from './RegisterPanel.module.css'

type Status = 'idle' | 'sending' | 'success' | 'error'

type Props = {
  open: boolean
  /** Room to preselect each time the panel opens. */
  room: RoomId | undefined
  onClose: () => void
}

type FormState = {
  name: string
  email: string
  room: RoomId | ''
  travelling: Travelling
  message: string
  consent: boolean
  website: string
}

const EMPTY: FormState = { name: '', email: '', room: '', travelling: '', message: '', consent: false, website: '' }
const FIELD_ORDER: Field[] = ['name', 'email', 'room', 'travelling', 'message', 'consent']

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The "Register your interest" panel: a full-height editorial panel (full screen on
 * phones) built on the native modal <dialog>, which makes the rest of the page inert.
 * Focus moves in on open, is kept inside, and returns to the opener on close (the page
 * handles that, see TheSparkPage). Escape closes. Sends JSON to /api/register.
 */
export function RegisterPanel({ open, room, onClose }: Props) {
  const t = thespark.register
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const id = useId()
  const fid = (name: string) => `${id}-${name}`

  // Open / close the native dialog in step with the page state.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      // A fresh form after a successful send; otherwise keep what was typed.
      // A room card always sets its room; other buttons keep the visitor's choice.
      const fresh = status === 'success'
      setStatus('idle')
      setForm((f) => (fresh ? { ...EMPTY, room: room ?? '' } : { ...f, room: room ?? f.room }))
      if (fresh) {
        setErrors({})
        setSubmitted(false)
      }
      dialog.showModal()
      // Start at the top of the panel and give the heading focus (it names the dialog).
      dialog.querySelector('[data-scroll]')?.scrollTo(0, 0)
      headingRef.current?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, room])

  // Already open and a different room is asked for (e.g. the URL hash changed): follow it.
  useEffect(() => {
    if (open && room) setForm((f) => (f.room === room ? f : { ...f, room }))
  }, [open, room])

  // After sending, move focus to the result so it's read out.
  useEffect(() => {
    if (status === 'success' || status === 'error') resultRef.current?.focus()
  }, [status])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value }
    setForm(next)
    // Once the visitor has tried to send, keep the messages up to date as they correct things.
    if (submitted) setErrors(validate(normalise(next)))
  }

  // Keep Tab and Shift+Tab inside the panel.
  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return
    const items = [...(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === headingRef.current || active === resultRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const focusFirstError = (errs: FieldErrors) => {
    const field = FIELD_ORDER.find((f) => errs[f])
    if (!field) return
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)
    el?.focus()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    const payload = normalise(form)
    const errs = validate(payload)
    setErrors(errs)
    if (Object.keys(errs).length) {
      focusFirstError(errs)
      return
    }
    setStatus('sending')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const body = (await res.json().catch(() => null)) as { ok?: boolean; errors?: FieldErrors } | null
      if (res.ok && body?.ok) {
        setStatus('success')
      } else if (res.status === 400 && body?.errors && Object.keys(body.errors).length) {
        // The server found something the form didn't: show it on the fields.
        setErrors(body.errors)
        setStatus('idle')
        focusFirstError(body.errors)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const errorCount = Object.keys(errors).length
  const describe = (field: Field, hint?: string) =>
    [errors[field] ? fid(`${field}-error`) : null, hint ? fid(`${field}-hint`) : null].filter(Boolean).join(' ') || undefined

  const errorText = (field: Field) =>
    errors[field] ? (
      <p id={fid(`${field}-error`)} className={styles.error}>
        {errors[field]}
      </p>
    ) : null

  const showForm = status === 'idle' || status === 'sending'

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={fid('title')}
      aria-describedby={fid('intro')}
      onCancel={(e) => {
        // Escape: close through the page, so the URL and focus are handled in one place.
        e.preventDefault()
        onClose()
      }}
      onClose={() => {
        // The browser may close the dialog itself (e.g. a second Escape): keep the page in step.
        if (open) onClose()
      }}
      onKeyDown={onKeyDown}
    >
      <div className={styles.scroll} data-scroll="" data-lenis-prevent="">
        <div className={styles.top}>
          <button type="button" className={styles.close} onClick={onClose}>
            {t.close}
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M2 2 14 14M14 2 2 14" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <h2 id={fid('title')} ref={headingRef} className={styles.title} tabIndex={-1}>
            {t.title}
          </h2>
          <p id={fid('intro')} className={styles.intro}>
            {t.intro}
          </p>

          {status === 'success' && (
            <div className={styles.result} role="status">
              <h3 ref={resultRef} className={styles.resultTitle} tabIndex={-1}>
                {t.success.title}
              </h3>
              <p className={styles.resultText}>{t.success.body}</p>
              <button type="button" className={`${pageStyles.button} ${styles.button}`} onClick={onClose}>
                {t.close}
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className={styles.result} role="alert">
              <h3 ref={resultRef} className={styles.resultTitle} tabIndex={-1}>
                {t.failure.title}
              </h3>
              <p className={styles.resultText}>
                {t.failure.body}{' '}
                <a className={styles.link} href={`mailto:${t.fallbackEmail}?subject=${encodeURIComponent(t.mailSubject)}`}>
                  {t.fallbackEmail}
                </a>
              </p>
              <button type="button" className={`${pageStyles.button} ${styles.button}`} onClick={() => setStatus('idle')}>
                {t.submit}
              </button>
            </div>
          )}

          {showForm && (
            <form ref={formRef} className={styles.form} noValidate onSubmit={onSubmit} aria-busy={status === 'sending'}>
              <p className={styles.summary} role="alert">
                {submitted && errorCount
                  ? errorCount === 1
                    ? t.errors.summaryOne
                    : t.errors.summaryMany.replace('{count}', String(errorCount))
                  : ''}
              </p>

              <div className={styles.field}>
                <label htmlFor={fid('name')} className={styles.label}>
                  {t.fields.name}
                </label>
                <input
                  id={fid('name')}
                  name="name"
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  required
                  maxLength={LIMITS.name}
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describe('name')}
                />
                {errorText('name')}
              </div>

              <div className={styles.field}>
                <label htmlFor={fid('email')} className={styles.label}>
                  {t.fields.email}
                </label>
                <input
                  id={fid('email')}
                  name="email"
                  className={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  maxLength={LIMITS.email}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={describe('email')}
                />
                {errorText('email')}
              </div>

              <div className={styles.field}>
                <label htmlFor={fid('room')} className={styles.label}>
                  {t.fields.room}
                </label>
                <div className={styles.selectWrap}>
                  <select
                    id={fid('room')}
                    name="room"
                    className={styles.input}
                    value={form.room}
                    onChange={(e) => set('room', e.target.value as RoomId | '')}
                    aria-invalid={errors.room ? true : undefined}
                    aria-describedby={describe('room')}
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                    <option value="">{t.fields.roomNotSure}</option>
                  </select>
                  <svg className={styles.chevron} viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                    <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </div>
                {errorText('room')}
              </div>

              <fieldset className={styles.fieldset} aria-describedby={describe('travelling')}>
                <legend className={styles.label}>
                  {t.fields.travelling} <span className={styles.optional}>({t.fields.optional})</span>
                </legend>
                <div className={styles.choices}>
                  {(
                    [
                      ['alone', t.fields.alone],
                      ['together', t.fields.together],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className={styles.choice}>
                      <input
                        type="radio"
                        name="travelling"
                        value={value}
                        checked={form.travelling === value}
                        onChange={() => set('travelling', value)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errorText('travelling')}
              </fieldset>

              <div className={styles.field}>
                <label htmlFor={fid('message')} className={styles.label}>
                  {t.fields.message} <span className={styles.optional}>({t.fields.optional})</span>
                </label>
                <p id={fid('message-hint')} className={styles.hint}>
                  {t.fields.messageHint}
                </p>
                <textarea
                  id={fid('message')}
                  name="message"
                  className={`${styles.input} ${styles.textarea}`}
                  rows={5}
                  maxLength={LIMITS.message}
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={describe('message', 'hint')}
                />
                {errorText('message')}
              </div>

              {/* Honeypot: off-screen and skipped by keyboard and screen readers; bots fill it in. */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor={fid('website')}>{t.fields.honeypot}</label>
                <input
                  id={fid('website')}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.consent}>
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    checked={form.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={describe('consent')}
                  />
                  <span>
                    {t.fields.consent}{' '}
                    <a className={styles.link} href={t.fields.privacyHref} target="_blank" rel="noopener">
                      {t.fields.privacy}
                      <span className="visually-hidden"> {t.fields.privacyNewTab}</span>
                    </a>
                  </span>
                </label>
                {errorText('consent')}
              </div>

              <button type="submit" className={`${pageStyles.button} ${styles.button}`} disabled={status === 'sending'}>
                {status === 'sending' ? t.sending : t.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </dialog>
  )
}
