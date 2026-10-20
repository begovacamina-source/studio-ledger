import { createContext } from 'react'

export interface UndoOffer {
  /** What the undo is about, e.g. an invoice id, so a panel can show its own Undo button. */
  key: string
  /** The toast text, e.g. "INV-002 marked as Paid". */
  message: string
  /** The toast after undoing, e.g. "INV-002 is no longer Paid". */
  undone: string
  run: () => void
}

export interface UndoContextValue {
  /** Shows a toast with Undo for 5 seconds; a newer offer replaces an older one. */
  offerUndo: (offer: UndoOffer) => void
  /** The offer still open, if any: its key and toast text. */
  pending: { key: string; message: string } | undefined
  undo: () => void
}

export const UndoContext = createContext<UndoContextValue | null>(null)
