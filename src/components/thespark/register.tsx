import { createContext, useContext, type MouseEvent, type ReactNode } from 'react'
import { registerMailto, type RoomId } from '../../content/thespark'

/** Opens the "Register your interest" panel, optionally with a room preselected. */
export type OpenRegister = (room: RoomId | undefined, opener: HTMLElement | null) => void

export const RegisterContext = createContext<OpenRegister | null>(null)

type Props = {
  room?: RoomId
  className?: string
  tabIndex?: number
  children: ReactNode
}

/**
 * Every "Register your interest" action on the page. A real mailto: link, so it still
 * works without JavaScript; with JavaScript a plain click opens the panel instead.
 * Modified clicks (new tab, etc.) keep the browser's behaviour.
 */
export function RegisterButton({ room, className, tabIndex, children }: Props) {
  const open = useContext(RegisterContext)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!open || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    open(room, e.currentTarget)
  }
  return (
    <a href={registerMailto(room)} className={className} tabIndex={tabIndex} onClick={onClick} aria-haspopup="dialog">
      {children}
    </a>
  )
}

/** #register or #register?room=<id> → { room } ; anything else → null. */
export function parseRegisterHash(hash: string): { room: RoomId | undefined } | null {
  const m = /^#register(?:\?(.*))?$/.exec(hash)
  if (!m) return null
  const room = new URLSearchParams(m[1] ?? '').get('room') ?? undefined
  return { room: (room || undefined) as RoomId | undefined }
}

export function registerHash(room?: RoomId) {
  return room ? `#register?room=${room}` : '#register'
}
