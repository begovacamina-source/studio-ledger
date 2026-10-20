import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { applyImport, type RecordType, type ValidationResult } from '@/lib/csv-import'
import { deleteExpense, saveExpense, type ValidExpense } from '@/lib/expense-form'
import { deleteInvoice, saveInvoice, type ValidInvoice } from '@/lib/invoice-form'
import { markPaid, markUnpaid } from '@/lib/invoices'
import type { ISODate, Invoice, Ledger } from '@/lib/types'
import { LedgerContext } from './ledger-context'

/**
 * Holds the ledger in memory. Changes are lost on reload until browser
 * storage arrives with US-5.1.
 */
export function LedgerProvider({ initial, children }: { initial: Ledger; children: ReactNode }) {
  const [ledger, setLedger] = useState(initial)

  const updateInvoice = useCallback((invoiceId: string, update: (invoice: Invoice) => Invoice) => {
    setLedger((current) => ({
      ...current,
      invoices: current.invoices.map((i) => (i.id === invoiceId ? update(i) : i)),
    }))
  }, [])

  const value = useMemo(
    () => ({
      ledger,
      markInvoicePaid: (invoiceId: string, paidDate: ISODate) =>
        updateInvoice(invoiceId, (i) => markPaid(i, paidDate)),
      markInvoiceNotPaid: (invoiceId: string) => updateInvoice(invoiceId, markUnpaid),
      saveInvoice: (value: ValidInvoice, editingId?: string) =>
        setLedger((current) => saveInvoice(current, value, editingId)),
      deleteInvoice: (invoiceId: string) => setLedger((current) => deleteInvoice(current, invoiceId)),
      saveExpense: (value: ValidExpense, editingId?: string) =>
        setLedger((current) => saveExpense(current, value, editingId)),
      deleteExpense: (expenseId: string) => setLedger((current) => deleteExpense(current, expenseId)),
      importRecords: (type: RecordType, result: ValidationResult) => {
        const { ledger: next, outcome } = applyImport(ledger, type, result)
        setLedger(next)
        return outcome
      },
    }),
    [ledger, updateInvoice],
  )

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}
