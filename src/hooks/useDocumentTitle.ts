import { useEffect } from 'react'

export function useDocumentTitle(title: string, enabled = true) {
  useEffect(() => {
    if (enabled) document.title = title
  }, [title, enabled])
}
