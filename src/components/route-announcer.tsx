import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { pageName } from '@/lib/pages'

/**
 * Names the page in the window title, and tells screen readers when the page changes:
 * moving between pages keeps focus on the link that was used, so nothing else would say so.
 */
export function RouteAnnouncer() {
  const name = pageName(useLocation().pathname)
  const first = useRef(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = `${name} · Studio Ledger`
    // The first page is announced by the browser itself, from the title.
    if (first.current) {
      first.current = false
      return
    }
    setMessage(`${name} page`)
  }, [name])

  return (
    <p className="sr-only" aria-live="polite" aria-atomic>
      {message}
    </p>
  )
}
