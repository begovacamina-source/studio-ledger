import { createContext } from 'react'
import type { ImportOutcome, RecordType, ValidationResult } from '@/lib/csv-import'
import type { ValidInvoice } from '@/lib/invoice-form'
import type { ISODate, Ledger } from '@/lib/types'

export interface LedgerContextValue {
  ledger: Ledger
  markInvoicePaid: (invoiceId: string, paidDate: ISODate) => void
  markInvoiceNotPaid: (invoiceId: string) => void
  /** Adds a new invoice, or updates `editingId`. */
  saveInvoice: (value: ValidInvoice, editingId?: string) => void
  deleteInvoice: (invoiceId: string) => void
  /** Adds the valid rows of a checked CSV file and reports what happened. */
  importRecords: (type: RecordType, result: ValidationResult) => ImportOutcome
}

export const LedgerContext = createContext<LedgerContextValue | null>(null)
