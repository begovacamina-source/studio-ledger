import type { ISODate, Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useUndo } from '@/state/use-undo'

/**
 * Marking an invoice Paid or not paid, each confirmed by a toast that offers
 * Undo for 5 seconds (US-2.2). Undo puts back the earlier status and paid date.
 */
export function usePaidActions() {
  const { markInvoicePaid, markInvoiceNotPaid, restoreInvoicePaidStatus } = useLedger()
  const { offerUndo } = useUndo()

  function offer(invoice: Invoice, message: string, undone: string) {
    const previous = { status: invoice.status, paidDate: invoice.paidDate }
    offerUndo({ key: invoice.id, message, undone, run: () => restoreInvoicePaidStatus(invoice.id, previous) })
  }

  return {
    markPaid: (invoice: Invoice, paidDate: ISODate) => {
      markInvoicePaid(invoice.id, paidDate)
      offer(invoice, `${invoice.invoiceNumber} marked as Paid`, `${invoice.invoiceNumber} is no longer Paid`)
    },
    markNotPaid: (invoice: Invoice) => {
      markInvoiceNotPaid(invoice.id)
      offer(invoice, `${invoice.invoiceNumber} is no longer Paid`, `${invoice.invoiceNumber} is Paid again`)
    },
  }
}
