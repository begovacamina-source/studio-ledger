import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { outstanding, received } from './calculations'
import {
  invoiceRows,
  markPaid,
  markUnpaid,
  matchesSearch,
  sortByNewest,
  statusCounts,
  validatePaidDate,
} from './invoices'
import { getPeriod } from './periods'

const TODAY = '2026-10-19'
const ledger = loadSampleLedger()
const rows = invoiceRows(ledger.invoices, ledger.clients, TODAY)
const find = (n: string) => ledger.invoices.find((i) => i.invoiceNumber === n)!

describe('status counts', () => {
  it('matches the sample dataset on 2026-10-19', () => {
    expect(statusCounts(rows)).toEqual({ All: 41, Paid: 32, Pending: 4, Overdue: 5 })
  })
})

describe('search', () => {
  it('matches invoice number and client name, ignoring case', () => {
    expect(rows.filter((r) => matchesSearch(r, 'inv-002')).map((r) => r.invoice.invoiceNumber)).toEqual(['INV-002'])
    expect(rows.filter((r) => matchesSearch(r, 'fernhill'))).toHaveLength(7)
    expect(rows.filter((r) => matchesSearch(r, '  '))).toHaveLength(41)
    expect(rows.filter((r) => matchesSearch(r, 'menu design'))).toHaveLength(0)
  })
})

describe('sortByNewest', () => {
  it('puts the latest issue date first', () => {
    const sorted = sortByNewest(rows)
    expect(sorted[0].invoice.issueDate >= sorted[1].invoice.issueDate).toBe(true)
    expect(sorted.at(-1)!.invoice.invoiceNumber).toBe('INV-001')
  })
})

describe('validatePaidDate', () => {
  const invoice = find('INV-002') // issued 2026-04-10

  it('accepts the issue date or later', () => {
    expect(validatePaidDate(invoice, '2026-04-10')).toBeNull()
    expect(validatePaidDate(invoice, TODAY)).toBeNull()
  })

  it('rejects a date before the issue date or a missing date', () => {
    expect(validatePaidDate(invoice, '2026-04-09')).toBe('Paid date cannot be before the issue date.')
    expect(validatePaidDate(invoice, '')).toBe('Enter the date the invoice was paid.')
  })
})

describe('markPaid and markUnpaid', () => {
  it('moves an invoice into Received for its paid date and out of Outstanding', () => {
    const paid = markPaid(find('INV-002'), TODAY)
    const invoices = ledger.invoices.map((i) => (i.id === paid.id ? paid : i))
    const october = getPeriod('this-month', TODAY)

    expect(paid).toMatchObject({ status: 'paid', paidDate: TODAY })
    expect(received(invoices, october)).toBe(received(ledger.invoices, october) + 85000)
    expect(outstanding(invoices, TODAY)).toMatchObject({ amount: 1462000 - 85000, count: 8, overdueCount: 4 })
  })

  it('refuses an invalid paid date', () => {
    expect(() => markPaid(find('INV-002'), '2026-01-01')).toThrow()
  })

  it('setting back to Unpaid clears the paid date and removes it from Received', () => {
    const inv001 = find('INV-001') // paid 2026-04-14, $1,200.00
    const unpaid = markUnpaid(inv001)
    const invoices = ledger.invoices.map((i) => (i.id === unpaid.id ? unpaid : i))
    const april = { months: ['2026-04'], start: '2026-04-01', end: '2026-04-30' }

    expect(unpaid.status).toBe('unpaid')
    expect(unpaid.paidDate).toBeUndefined()
    expect(received(invoices, april)).toBe(265000 - 120000)
  })
})
