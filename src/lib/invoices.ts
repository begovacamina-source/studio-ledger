import { displayStatus, type DisplayStatus } from './calculations'
import type { Client, ISODate, Invoice } from './types'

export const STATUS_FILTERS = ['All', 'Paid', 'Pending', 'Overdue'] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]

export interface InvoiceRow {
  invoice: Invoice
  client: Client | undefined
  status: DisplayStatus
}

export function invoiceRows(invoices: Invoice[], clients: Client[], today: ISODate): InvoiceRow[] {
  const byId = new Map(clients.map((c) => [c.id, c]))
  return invoices.map((invoice) => ({
    invoice,
    client: byId.get(invoice.clientId),
    status: displayStatus(invoice, today),
  }))
}

/** Matches invoice number or client name, ignoring case. */
export function matchesSearch(row: InvoiceRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    row.invoice.invoiceNumber.toLowerCase().includes(q) ||
    (row.client?.name.toLowerCase().includes(q) ?? false)
  )
}

export function statusCounts(rows: InvoiceRow[]): Record<StatusFilter, number> {
  const counts: Record<StatusFilter, number> = { All: rows.length, Paid: 0, Pending: 0, Overdue: 0 }
  rows.forEach((r) => counts[r.status]++)
  return counts
}

/** Newest issue date first; invoice number breaks ties. */
export function sortByNewest(rows: InvoiceRow[]): InvoiceRow[] {
  return [...rows].sort(
    (a, b) =>
      b.invoice.issueDate.localeCompare(a.invoice.issueDate) ||
      b.invoice.invoiceNumber.localeCompare(a.invoice.invoiceNumber),
  )
}

/** Returns an error message, or null when the paid date is valid. */
export function validatePaidDate(
  invoice: Pick<Invoice, 'issueDate'>,
  paidDate: string,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(paidDate)) return 'Enter the date the invoice was paid.'
  if (paidDate < invoice.issueDate) return 'Paid date cannot be before the issue date.'
  return null
}

export function markPaid(invoice: Invoice, paidDate: ISODate): Invoice {
  const error = validatePaidDate(invoice, paidDate)
  if (error) throw new Error(error)
  return { ...invoice, status: 'paid', paidDate }
}

/** Setting a paid invoice back to Unpaid clears its paid date, so it leaves Received. */
export function markUnpaid(invoice: Invoice): Invoice {
  return { ...invoice, status: 'unpaid', paidDate: undefined }
}
