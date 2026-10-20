import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { loadSampleLedger } from '@/data/sample'
import { deleteClient } from '@/lib/clients'
import { applyImport, type RecordType, type ValidationResult } from '@/lib/csv-import'
import { deleteExpense, saveExpense, type ValidExpense } from '@/lib/expense-form'
import { deleteInvoice, saveInvoice, type ValidInvoice } from '@/lib/invoice-form'
import { markPaid, markUnpaid } from '@/lib/invoices'
import { EMPTY_LEDGER, readLedger, writeLedger } from '@/lib/storage'
import type { ISODate, Invoice } from '@/lib/types'
import { LedgerContext } from './ledger-context'

/**
 * Holds the records and keeps them in browser storage, so they survive a
 * reload. A first visit starts with the sample data.
 */
export function LedgerProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readLedger)
  // A first visit opens on the sample data, so the dashboard is never empty at first.
  const [ledger, setLedger] = useState(() => {
    if (!initial.firstVisit) return initial.ledger
    try {
      return loadSampleLedger()
    } catch {
      return EMPTY_LEDGER
    }
  })

  // Tell the user once if saved data couldn't be read.
  useEffect(() => {
    if (initial.error) toast.error(initial.error)
  }, [initial.error])

  // Save every change; warn once if the browser refuses.
  const warned = useRef(false)
  useEffect(() => {
    const error = writeLedger(ledger)
    if (error && !warned.current) {
      warned.current = true
      toast.error(error)
    }
  }, [ledger])

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
      deleteClient: (clientId: string) => setLedger((current) => deleteClient(current, clientId)),
      loadSampleData: () => {
        try {
          setLedger(loadSampleLedger())
          return null
        } catch (error) {
          return error instanceof Error ? error.message : 'The sample data could not be loaded.'
        }
      },
      clearAllData: () => setLedger(EMPTY_LEDGER),
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
