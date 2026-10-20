import { validatePaidDate } from './invoices'
import type { Client, ISODate, Invoice, Ledger } from './types'

/** Select value for "add a new client" in the client field. */
export const NEW_CLIENT = '__new__'

export const DESCRIPTION_MAX = 200

/** What the form holds: raw text, exactly as typed. */
export interface InvoiceDraft {
  clientId: string
  newClientName: string
  invoiceNumber: string
  amount: string
  issueDate: string
  dueDate: string
  /** Only shown and checked when editing a paid invoice. */
  paidDate: string
  description: string
}

export type InvoiceField = keyof InvoiceDraft
export type InvoiceErrors = Partial<Record<InvoiceField, string>>

/** A draft that passed validation, with amounts in cents. */
export interface ValidInvoice {
  client: { id: string } | { newName: string }
  invoiceNumber: string
  amount: number
  issueDate: ISODate
  dueDate: ISODate
  paidDate?: ISODate
  description?: string
}

export function emptyDraft(today: ISODate): InvoiceDraft {
  return {
    clientId: '',
    newClientName: '',
    invoiceNumber: '',
    amount: '',
    issueDate: today,
    dueDate: '',
    paidDate: '',
    description: '',
  }
}

export function draftFromInvoice(invoice: Invoice): InvoiceDraft {
  const cents = String(invoice.amount % 100).padStart(2, '0')
  return {
    clientId: invoice.clientId,
    newClientName: '',
    invoiceNumber: invoice.invoiceNumber,
    amount: `${Math.floor(invoice.amount / 100)}.${cents}`,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    paidDate: invoice.paidDate ?? '',
    description: invoice.description ?? '',
  }
}

/** Typed amount to cents: "1200", "1200.5" or "1200,50". Null if it isn't a plain amount. */
export function parseAmountInput(value: string): number | null {
  const match = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(value.trim())
  if (!match) return null
  const [, whole, fraction = ''] = match
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

export function validateInvoiceDraft(
  draft: InvoiceDraft,
  ledger: Ledger,
  options: { editing?: Invoice } = {},
): { errors: InvoiceErrors; value?: ValidInvoice } {
  const errors: InvoiceErrors = {}
  const { editing } = options
  const isPaid = editing?.status === 'paid'

  let client: ValidInvoice['client'] | undefined
  if (draft.clientId === NEW_CLIENT) {
    const name = draft.newClientName.trim()
    const existing = ledger.clients.find((c) => sameText(c.name, name))
    if (!name) errors.newClientName = "Enter the client's name."
    else if (existing)
      errors.newClientName = `${existing.name} already exists. Choose it from the client list.`
    else client = { newName: name }
  } else if (ledger.clients.some((c) => c.id === draft.clientId)) {
    client = { id: draft.clientId }
  } else {
    errors.clientId = 'Choose a client or add a new one.'
  }

  const invoiceNumber = draft.invoiceNumber.trim()
  if (!invoiceNumber) errors.invoiceNumber = 'Enter an invoice number.'
  else if (
    ledger.invoices.some((i) => i.id !== editing?.id && sameText(i.invoiceNumber, invoiceNumber))
  )
    errors.invoiceNumber = `${invoiceNumber} is already used by another invoice.`

  const amount = parseAmountInput(draft.amount)
  if (!draft.amount.trim()) errors.amount = 'Enter the amount.'
  else if (amount === null) errors.amount = 'Enter the amount as a number, for example 1200.00.'
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0.'

  if (!isDate(draft.issueDate)) errors.issueDate = 'Enter the issue date.'

  if (!isDate(draft.dueDate)) errors.dueDate = 'Enter the due date.'
  else if (isDate(draft.issueDate) && draft.dueDate < draft.issueDate)
    errors.dueDate = 'Due date cannot be before the issue date.'

  if (isPaid) {
    const paidError = validatePaidDate({ issueDate: draft.issueDate }, draft.paidDate)
    if (paidError) errors.paidDate = paidError
  }

  const description = draft.description.trim()
  if (description.length > DESCRIPTION_MAX)
    errors.description = `Description can be at most ${DESCRIPTION_MAX} characters.`

  if (Object.keys(errors).length > 0 || !client || amount === null) return { errors }
  return {
    errors,
    value: {
      client,
      invoiceNumber,
      amount,
      issueDate: draft.issueDate,
      dueDate: draft.dueDate,
      paidDate: isPaid ? draft.paidDate : undefined,
      description: description || undefined,
    },
  }
}

/**
 * Adds a new invoice, or updates `editingId`, creating the client first when
 * it is new. A paid invoice keeps its status; its amount and paid date change
 * past totals immediately.
 */
export function saveInvoice(
  ledger: Ledger,
  value: ValidInvoice,
  editingId?: string,
  newId: () => string = () => crypto.randomUUID(),
  now: Date = new Date(),
): Ledger {
  let clients = ledger.clients
  let clientId: string
  if ('id' in value.client) {
    clientId = value.client.id
  } else {
    const client: Client = { id: newId(), name: value.client.newName, createdAt: now.toISOString() }
    clients = [...clients, client]
    clientId = client.id
  }

  const fields = {
    invoiceNumber: value.invoiceNumber,
    clientId,
    amount: value.amount,
    issueDate: value.issueDate,
    dueDate: value.dueDate,
    description: value.description,
  }

  const invoices = editingId
    ? ledger.invoices.map((i) =>
        i.id === editingId
          ? { ...i, ...fields, paidDate: i.status === 'paid' ? value.paidDate : undefined }
          : i,
      )
    : [...ledger.invoices, { id: newId(), ...fields, status: 'unpaid' as const, source: 'manual' as const }]

  return { ...ledger, clients, invoices }
}

export function deleteInvoice(ledger: Ledger, invoiceId: string): Ledger {
  return { ...ledger, invoices: ledger.invoices.filter((i) => i.id !== invoiceId) }
}

export function invoicePath(invoiceNumber: string): string {
  return `/invoices/${encodeURIComponent(invoiceNumber)}`
}
