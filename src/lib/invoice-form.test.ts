import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { outstanding, received } from './calculations'
import {
  deleteInvoice,
  draftFromInvoice,
  emptyDraft,
  invoicePath,
  NEW_CLIENT,
  parseAmountInput,
  saveInvoice,
  validateInvoiceDraft,
  type InvoiceDraft,
} from './invoice-form'

const TODAY = '2026-10-19'
const ledger = loadSampleLedger()
const lumen = ledger.clients.find((c) => c.name === 'Lumen Coffee')!
const find = (l: typeof ledger, n: string) => l.invoices.find((i) => i.invoiceNumber === n)!
const april = { months: ['2026-04'], start: '2026-04-01', end: '2026-04-30' }

const valid: InvoiceDraft = {
  ...emptyDraft(TODAY),
  clientId: lumen.id,
  invoiceNumber: 'INV-042',
  amount: '1200.50',
  dueDate: '2026-11-02',
  description: 'Seasonal menu',
}

let n = 0
const ids = () => `id-${++n}`

describe('parseAmountInput', () => {
  it('accepts a dot or comma decimal', () => {
    expect(parseAmountInput('1200')).toBe(120000)
    expect(parseAmountInput('1200.5')).toBe(120050)
    expect(parseAmountInput(' 1200,50 ')).toBe(120050)
  })

  it('rejects anything else', () => {
    for (const bad of ['', 'abc', '1,200.00', '-5', '12.345']) expect(parseAmountInput(bad)).toBeNull()
  })
})

describe('validateInvoiceDraft', () => {
  it('accepts a complete draft and converts the amount to cents', () => {
    const { errors, value } = validateInvoiceDraft(valid, ledger)
    expect(errors).toEqual({})
    expect(value).toMatchObject({ client: { id: lumen.id }, invoiceNumber: 'INV-042', amount: 120050 })
  })

  it('reports every missing required field', () => {
    const { errors, value } = validateInvoiceDraft({ ...emptyDraft(''), issueDate: '' }, ledger)
    expect(value).toBeUndefined()
    expect(Object.keys(errors).sort()).toEqual(['amount', 'clientId', 'dueDate', 'invoiceNumber', 'issueDate'])
  })

  it('does not allow a due date before the issue date', () => {
    const { errors } = validateInvoiceDraft({ ...valid, dueDate: '2026-10-18' }, ledger)
    expect(errors.dueDate).toBe('Due date cannot be before the issue date.')
  })

  it('requires a unique invoice number, ignoring case and spaces', () => {
    const { errors } = validateInvoiceDraft({ ...valid, invoiceNumber: ' inv-002 ' }, ledger)
    expect(errors.invoiceNumber).toBe('inv-002 is already used by another invoice.')
  })

  it('lets an invoice keep its own number when editing', () => {
    const inv002 = find(ledger, 'INV-002')
    expect(validateInvoiceDraft(draftFromInvoice(inv002), ledger, { editing: inv002 }).errors).toEqual({})
  })

  it('rejects a zero amount and text', () => {
    expect(validateInvoiceDraft({ ...valid, amount: '0' }, ledger).errors.amount).toBe('Amount must be greater than 0.')
    expect(validateInvoiceDraft({ ...valid, amount: 'ten' }, ledger).errors.amount).toMatch(/as a number/)
  })

  it('limits the description to 200 characters', () => {
    expect(validateInvoiceDraft({ ...valid, description: 'x'.repeat(200) }, ledger).errors).toEqual({})
    expect(validateInvoiceDraft({ ...valid, description: 'x'.repeat(201) }, ledger).errors.description).toBeDefined()
  })

  it('needs a name for a new client and refuses one that already exists', () => {
    const asNew = { ...valid, clientId: NEW_CLIENT }
    expect(validateInvoiceDraft(asNew, ledger).errors.newClientName).toBe("Enter the client's name.")
    expect(validateInvoiceDraft({ ...asNew, newClientName: 'lumen coffee' }, ledger).errors.newClientName).toBe(
      'Lumen Coffee already exists. Choose it from the client list.',
    )
    expect(validateInvoiceDraft({ ...asNew, newClientName: ' Kestrel Type ' }, ledger).value?.client).toEqual({
      newName: 'Kestrel Type',
    })
  })

  it('checks the paid date only when editing a paid invoice', () => {
    const inv001 = find(ledger, 'INV-001') // paid 2026-04-14, issued 2026-04-02
    const draft = { ...draftFromInvoice(inv001), issueDate: '2026-04-20' }
    expect(validateInvoiceDraft(draft, ledger, { editing: inv001 }).errors.paidDate).toBe(
      'Paid date cannot be before the issue date.',
    )
    const inv002 = find(ledger, 'INV-002')
    expect(validateInvoiceDraft({ ...draftFromInvoice(inv002), paidDate: 'x' }, ledger, { editing: inv002 }).errors).toEqual({})
  })
})

describe('saveInvoice', () => {
  it('adds an Unpaid, manual invoice for an existing client', () => {
    const next = saveInvoice(ledger, validateInvoiceDraft(valid, ledger).value!, undefined, ids)
    const added = find(next, 'INV-042')
    expect(next.invoices).toHaveLength(42)
    expect(added).toMatchObject({ clientId: lumen.id, amount: 120050, status: 'unpaid', source: 'manual' })
    expect(added.paidDate).toBeUndefined()
    expect(outstanding(next.invoices, TODAY).amount).toBe(1462000 + 120050)
  })

  it('creates the client when it is new', () => {
    const draft = { ...valid, clientId: NEW_CLIENT, newClientName: 'Kestrel Type' }
    const next = saveInvoice(ledger, validateInvoiceDraft(draft, ledger).value!, undefined, ids)
    const client = next.clients.find((c) => c.name === 'Kestrel Type')!
    expect(next.clients).toHaveLength(7)
    expect(find(next, 'INV-042').clientId).toBe(client.id)
  })

  it('editing a paid invoice amount and paid date changes past totals immediately', () => {
    const inv001 = find(ledger, 'INV-001') // $1,200.00 paid in April
    const draft = { ...draftFromInvoice(inv001), amount: '1500', paidDate: '2026-05-02' }
    const next = saveInvoice(ledger, validateInvoiceDraft(draft, ledger, { editing: inv001 }).value!, inv001.id, ids)
    const may = { months: ['2026-05'], start: '2026-05-01', end: '2026-05-31' }

    expect(find(next, 'INV-001')).toMatchObject({ status: 'paid', amount: 150000, paidDate: '2026-05-02' })
    expect(received(next.invoices, april)).toBe(265000 - 120000)
    expect(received(next.invoices, may)).toBe(1039000 + 150000)
  })

  it('keeps an Unpaid invoice Unpaid when edited', () => {
    const inv002 = find(ledger, 'INV-002')
    const draft = { ...draftFromInvoice(inv002), invoiceNumber: 'INV-002A' }
    const next = saveInvoice(ledger, validateInvoiceDraft(draft, ledger, { editing: inv002 }).value!, inv002.id, ids)
    expect(find(next, 'INV-002A')).toMatchObject({ id: inv002.id, status: 'unpaid', paidDate: undefined })
    expect(next.invoices).toHaveLength(41)
  })
})

describe('deleteInvoice', () => {
  it('removes the invoice from every total', () => {
    const inv001 = find(ledger, 'INV-001')
    const next = deleteInvoice(ledger, inv001.id)
    expect(next.invoices).toHaveLength(40)
    expect(received(next.invoices, april)).toBe(265000 - 120000)
  })
})

describe('invoicePath', () => {
  it('encodes the invoice number', () => {
    expect(invoicePath('INV-002')).toBe('/invoices/INV-002')
    expect(invoicePath('2026/14')).toBe('/invoices/2026%2F14')
  })
})
