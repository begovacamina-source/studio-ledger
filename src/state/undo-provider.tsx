import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { UNDO_WINDOW_MS } from '@/lib/invoices'
import { UndoContext, type UndoOffer } from './undo-context'

/**
 * One undo at a time, offered for 5 seconds both in a toast and, through
 * `pending`, in whatever panel made the change. The panel's own button
 * matters for keyboard users, because a modal panel keeps focus inside it and
 * the toast can't be reached.
 */
type Entry = UndoOffer & { toastId: string | number; used: boolean }

export function UndoProvider({ children }: { children: ReactNode }) {
  // The latest offer lives in a ref so an undo runs exactly once; state only drives rendering.
  const latest = useRef<Entry | undefined>(undefined)
  const [shown, setShown] = useState<{ key: string; message: string }>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  // Ends the panel's Undo; the toast keeps its own (Sonner may hold it longer while hovered).
  const expire = useCallback(() => {
    clearTimeout(timer.current)
    setShown(undefined)
  }, [])

  const run = useCallback(
    (entry: Entry | undefined) => {
      // Only the latest offer, and only once: a newer change replaces an older Undo.
      if (!entry || entry.used || latest.current !== entry) return
      entry.used = true
      expire()
      toast.dismiss(entry.toastId)
      entry.run()
      toast.success(entry.undone)
    },
    [expire],
  )

  const undo = useCallback(() => run(latest.current), [run])

  const offerUndo = useCallback(
    (offer: UndoOffer) => {
      clearTimeout(timer.current)
      if (latest.current) toast.dismiss(latest.current.toastId)
      const entry: Entry = { ...offer, toastId: 0, used: false }
      entry.toastId = toast.success(offer.message, {
        duration: UNDO_WINDOW_MS,
        action: { label: 'Undo', onClick: () => run(entry) },
      })
      latest.current = entry
      setShown({ key: offer.key, message: offer.message })
      timer.current = setTimeout(expire, UNDO_WINDOW_MS)
    },
    [run, expire],
  )

  const value = useMemo(() => ({ offerUndo, pending: shown, undo }), [offerUndo, shown, undo])
  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>
}
