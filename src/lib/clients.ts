import { displayStatus } from './calculations'
import type { Client, ISODate, Invoice, Ledger } from './types'

export interface ClientSummary {
  client: Client
  /** All Paid invoices for this client, in cents, whatever the period. */
  received: number
  /** All Unpaid invoices for this client, in cents. */
  outstanding: number
  overdueCount: number
  invoiceCount: number
}

/**
 * One row per client with what they have paid and still owe, all time.
 * Highest Received first, so key clients lead; ties by name.
 */
export function clientSummaries(ledger: Ledger, today: ISODate): ClientSummary[] {
  const byClient = new Map<string, Invoice[]>()
  for (const invoice of ledger.invoices) {
    byClient.set(invoice.clientId, [...(byClient.get(invoice.clientId) ?? []), invoice])
  }
  return ledger.clients
    .map((client): ClientSummary => {
      const invoices = byClient.get(client.id) ?? []
      const sum = (list: Invoice[]) => list.reduce((total, i) => total + i.amount, 0)
      const unpaid = invoices.filter((i) => i.status === 'unpaid')
      return {
        client,
        received: sum(invoices.filter((i) => i.status === 'paid')),
        outstanding: sum(unpaid),
        overdueCount: unpaid.filter((i) => displayStatus(i, today) === 'Overdue').length,
        invoiceCount: invoices.length,
      }
    })
    .sort((a, b) => b.received - a.received || a.client.name.localeCompare(b.client.name))
}

/** A client's invoices, newest issue date first. */
export function clientInvoices(ledger: Ledger, clientId: string): Invoice[] {
  return ledger.invoices
    .filter((i) => i.clientId === clientId)
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.invoiceNumber.localeCompare(a.invoiceNumber))
}

/**
 * Why a client can't be deleted yet, or null when it can. A client with
 * invoices stays until they are deleted or moved to another client.
 */
export function deleteBlockedReason(ledger: Ledger, clientId: string): string | null {
  const client = ledger.clients.find((c) => c.id === clientId)
  const count = ledger.invoices.filter((i) => i.clientId === clientId).length
  if (!client || count === 0) return null
  const invoices = count === 1 ? '1 invoice' : `${count} invoices`
  return `${client.name} has ${invoices}. Delete ${count === 1 ? 'it' : 'them'} or move ${count === 1 ? 'it' : 'them'} to another client first, then delete the client.`
}

/** Removes a client that has no invoices. Throws if it still has some. */
export function deleteClient(ledger: Ledger, clientId: string): Ledger {
  const blocked = deleteBlockedReason(ledger, clientId)
  if (blocked) throw new Error(blocked)
  return { ...ledger, clients: ledger.clients.filter((c) => c.id !== clientId) }
}
