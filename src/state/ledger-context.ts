import { createContext } from 'react'
import type { ISODate, Ledger } from '@/lib/types'

export interface LedgerContextValue {
  ledger: Ledger
  markInvoicePaid: (invoiceId: string, paidDate: ISODate) => void
  markInvoiceNotPaid: (invoiceId: string) => void
}

export const LedgerContext = createContext<LedgerContextValue | null>(null)
