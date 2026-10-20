import { useCallback, useMemo, useState, type ReactNode } from 'react'
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
    }),
    [ledger, updateInvoice],
  )

  return <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
}
