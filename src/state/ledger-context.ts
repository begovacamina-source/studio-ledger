import { createContext } from 'react'
import type { ValidInvoice } from '@/lib/invoice-form'
import type { ISODate, Ledger } from '@/lib/types'

export interface LedgerContextValue {
  ledger: Ledger
  markInvoicePaid: (invoiceId: string, paidDate: ISODate) => void
  markInvoiceNotPaid: (invoiceId: string) => void
  /** Adds a new invoice, or updates `editingId`. */
  saveInvoice: (value: ValidInvoice, editingId?: string) => void
  deleteInvoice: (invoiceId: string) => void
}

export const LedgerContext = createContext<LedgerContextValue | null>(null)
