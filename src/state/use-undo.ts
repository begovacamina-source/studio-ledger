import { useContext } from 'react'
import { UndoContext } from './undo-context'

export function useUndo() {
  const value = useContext(UndoContext)
  if (!value) throw new Error('useUndo must be used inside UndoProvider')
  return value
}
