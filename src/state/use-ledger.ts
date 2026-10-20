import { useContext } from 'react'
import { LedgerContext } from './ledger-context'

export function useLedger() {
  const value = useContext(LedgerContext)
  if (!value) throw new Error('useLedger must be used inside LedgerProvider')
  return value
}
