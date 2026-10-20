import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import {
  displayStatus,
  monthlyTotals,
  netIncome,
  outstanding,
  outstandingList,
  percentChange,
  periodFigures,
  received,
  expensesTotal,
} from './calculations'
import { getPeriod, previousPeriod, type Period } from './periods'

// Expected totals come from data/README.md, which fixes today at 2026-10-19.
const TODAY = '2026-10-19'
const ledger = loadSampleLedger()

const month = (key: string): Period => ({
  months: [key],
  start: `${key}-01`,
  end: getPeriod('this-month', `${key}-01`).end,
})

const MONTHS = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']
const RECEIVED = [265000, 1039000, 1173000, 1181000, 0, 1323000]
const EXPENSES = [161547, 236921, 173957, 137646, 258487, 208456]

describe('sample dataset', () => {
  it('loads every row', () => {
    expect(ledger.invoices).toHaveLength(41)
    expect(ledger.expenses).toHaveLength(120)
    expect(ledger.clients).toHaveLength(6)
  })
})

describe('Received, Expenses and Net income per month', () => {
  MONTHS.forEach((key, i) => {
    it(key, () => {
      expect(received(ledger.invoices, month(key))).toBe(RECEIVED[i])
      expect(expensesTotal(ledger.expenses, month(key))).toBe(EXPENSES[i])
      expect(netIncome(ledger, month(key))).toBe(RECEIVED[i] - EXPENSES[i])
    })
  })

  it('counts late payments in the month they were paid (INV-027 to INV-029)', () => {
    const july = ledger.invoices.filter((i) =>
      ['INV-027', 'INV-028', 'INV-029'].includes(i.invoiceNumber),
    )
    expect(july).toHaveLength(3)
    expect(received(july, month('2026-07'))).toBe(0)
    expect(received(july, month('2026-09'))).toBeGreaterThan(0)
  })

  it('totals April to September', () => {
    const range: Period = { months: MONTHS, start: '2026-04-01', end: '2026-09-30' }
    expect(received(ledger.invoices, range)).toBe(4981000)
    expect(expensesTotal(ledger.expenses, range)).toBe(1177014)
    expect(netIncome(ledger, range)).toBe(3803986)
  })

  it('shows 0 for a month with no records, not a gap', () => {
    const totals = monthlyTotals(ledger, getPeriod('last-6-months', '2026-09-15'))
    expect(totals.map((t) => t.month)).toEqual(MONTHS)
    expect(totals.map((t) => t.received)).toEqual(RECEIVED)
    expect(totals.map((t) => t.expenses)).toEqual(EXPENSES)
    expect(totals[4].netIncome).toBe(-258487)
  })
})

describe('Outstanding snapshot', () => {
  it('matches the expected totals on 2026-10-19', () => {
    expect(outstanding(ledger.invoices, TODAY)).toEqual({
      amount: 1462000,
      count: 9,
      overdueAmount: 884000,
      overdueCount: 5,
    })
  })


  it('treats yesterday as Overdue and today as Pending', () => {
    const byNumber = (n: string) => ledger.invoices.find((i) => i.invoiceNumber === n)!
    expect(displayStatus(byNumber('INV-036'), TODAY)).toBe('Overdue')
    expect(displayStatus(byNumber('INV-038'), TODAY)).toBe('Pending')
    expect(displayStatus(byNumber('INV-001'), TODAY)).toBe('Paid')
  })
})

describe('Outstanding list', () => {
  const rows = outstandingList(ledger, TODAY)

  it('lists Overdue first, then Pending, each by due date', () => {
    expect(rows.map((r) => r.invoice.invoiceNumber)).toEqual([
      'INV-002',
      'INV-016',
      'INV-025',
      'INV-032',
      'INV-036',
      'INV-038',
      'INV-039',
      'INV-040',
      'INV-041',
    ])
    expect(rows.slice(0, 5).every((r) => r.status === 'Overdue')).toBe(true)
  })

  it('counts days overdue', () => {
    const inv036 = rows.find((r) => r.invoice.invoiceNumber === 'INV-036')!
    expect(inv036.daysOverdue).toBe(1)
    expect(rows.find((r) => r.invoice.invoiceNumber === 'INV-038')!.daysOverdue).toBe(0)
  })

  it('matches the owed-by-client totals', () => {
    const byClient = new Map<string, number>()
    rows.forEach((r) =>
      byClient.set(r.client!.name, (byClient.get(r.client!.name) ?? 0) + r.invoice.amount),
    )
    expect(Object.fromEntries(byClient)).toEqual({
      'Atlas & Oak Architects': 470000,
      'Brightwater Film Co.': 425000,
      'Paper Kite Publishing': 268000,
      'Lumen Coffee': 205000,
      'Northwind Studio': 94000,
    })
  })
})

describe('change vs previous period', () => {
  it('shows "—" (null) when the previous value is 0', () => {
    expect(percentChange(1323000, 0)).toBeNull()
    const september = periodFigures(ledger, month('2026-09'))
    expect(september.received.change).toBeNull()
  })

  it('compares with the previous period of equal length', () => {
    const july = periodFigures(ledger, month('2026-07'))
    expect(july.received.change).toBeCloseTo(((1181000 - 1173000) / 1173000) * 100)
    expect(july.expenses.change).toBeCloseTo(((137646 - 173957) / 173957) * 100)
  })
})

describe('periods', () => {
  it('builds whole calendar months that include the current month', () => {
    expect(getPeriod('this-month', TODAY).months).toEqual(['2026-10'])
    expect(getPeriod('last-month', TODAY).months).toEqual(['2026-09'])
    expect(getPeriod('last-3-months', TODAY).months).toEqual(['2026-08', '2026-09', '2026-10'])
    expect(getPeriod('last-6-months', TODAY)).toMatchObject({ start: '2026-05-01', end: '2026-10-31' })
    expect(getPeriod('this-year', TODAY)).toMatchObject({ start: '2026-01-01', end: '2026-12-31' })
  })

  it('crosses year boundaries', () => {
    expect(getPeriod('last-month', '2026-01-10').months).toEqual(['2025-12'])
    expect(previousPeriod(getPeriod('last-3-months', '2026-02-01')).months).toEqual([
      '2025-09',
      '2025-10',
      '2025-11',
    ])
  })
})
