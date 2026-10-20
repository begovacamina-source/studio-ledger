import { createContext } from 'react'
import type { ImportOutcome, RecordType, ValidationResult } from '@/lib/csv-import'
import type { ValidExpense } from '@/lib/expense-form'
import type { ValidInvoice } from '@/lib/invoice-form'
import type { ISODate, Ledger } from '@/lib/types'

export interface LedgerContextValue {
  ledger: Ledger
  markInvoicePaid: (invoiceId: string, paidDate: ISODate) => void
  markInvoiceNotPaid: (invoiceId: string) => void
  /** Adds a new invoice, or updates `editingId`. */
  saveInvoice: (value: ValidInvoice, editingId?: string) => void
  deleteInvoice: (invoiceId: string) => void
  /** Adds a new expense, or updates `editingId`. */
  saveExpense: (value: ValidExpense, editingId?: string) => void
  deleteExpense: (expenseId: string) => void
  /** Removes a client with no invoices. */
  deleteClient: (clientId: string) => void
  /** Adds the valid rows of a checked CSV file and reports what happened. */
  importRecords: (type: RecordType, result: ValidationResult) => ImportOutcome
  /** Replaces every record with the sample dataset. Returns an error message if it couldn't be read. */
  loadSampleData: () => string | null
  /** Removes every client, invoice and expense. Settings stay. */
  clearAllData: () => void
}

export const LedgerContext = createContext<LedgerContextValue | null>(null)
