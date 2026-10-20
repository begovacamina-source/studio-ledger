import { daysBetween, monthKey, type MonthKey } from './dates'
import { isInPeriod, previousPeriod, type Period } from './periods'
import type { Client, Expense, ISODate, Invoice, Ledger } from './types'

export type DisplayStatus = 'Paid' | 'Pending' | 'Overdue'

export function displayStatus(invoice: Invoice, today: ISODate): DisplayStatus {
  if (invoice.status === 'paid') return 'Paid'
  return invoice.dueDate < today ? 'Overdue' : 'Pending'
}

const sum = (amounts: number[]) => amounts.reduce((total, amount) => total + amount, 0)

/** Paid invoices counted by paid date, never issue date. */
export function received(invoices: Invoice[], period: Period): number {
  return sum(
    invoices
      .filter((i) => i.status === 'paid' && i.paidDate && isInPeriod(i.paidDate, period))
      .map((i) => i.amount),
  )
}

export function expensesTotal(expenses: Expense[], period: Period): number {
  return sum(expenses.filter((e) => isInPeriod(e.date, period)).map((e) => e.amount))
}

export function netIncome(ledger: Ledger, period: Period): number {
  return received(ledger.invoices, period) - expensesTotal(ledger.expenses, period)
}

export interface OutstandingSummary {
  amount: number
  count: number
  overdueAmount: number
  overdueCount: number
}

/** Current snapshot of all Unpaid invoices; ignores the period. */
export function outstanding(invoices: Invoice[], today: ISODate): OutstandingSummary {
  const unpaid = invoices.filter((i) => i.status === 'unpaid')
  const overdue = unpaid.filter((i) => displayStatus(i, today) === 'Overdue')
  return {
    amount: sum(unpaid.map((i) => i.amount)),
    count: unpaid.length,
    overdueAmount: sum(overdue.map((i) => i.amount)),
    overdueCount: overdue.length,
  }
}

/** (Current − Previous) ÷ Previous × 100, or null ("—") when Previous is 0. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}

export interface Figure {
  value: number
  change: number | null
}

export interface PeriodFigures {
  received: Figure
  expenses: Figure
  netIncome: Figure
}

export function periodFigures(ledger: Ledger, period: Period): PeriodFigures {
  const previous = previousPeriod(period)
  const figure = (calc: (p: Period) => number): Figure => {
    const value = calc(period)
    return { value, change: percentChange(value, calc(previous)) }
  }
  return {
    received: figure((p) => received(ledger.invoices, p)),
    expenses: figure((p) => expensesTotal(ledger.expenses, p)),
    netIncome: figure((p) => netIncome(ledger, p)),
  }
}

export interface MonthTotals {
  month: MonthKey
  received: number
  expenses: number
  netIncome: number
}

/** One entry per month in the period; months with no records are 0, not missing. */
export function monthlyTotals(ledger: Ledger, period: Period): MonthTotals[] {
  return period.months.map((month) => {
    const receivedCents = sum(
      ledger.invoices
        .filter((i) => i.status === 'paid' && i.paidDate && monthKey(i.paidDate) === month)
        .map((i) => i.amount),
    )
    const expenseCents = sum(
      ledger.expenses.filter((e) => monthKey(e.date) === month).map((e) => e.amount),
    )
    return {
      month,
      received: receivedCents,
      expenses: expenseCents,
      netIncome: receivedCents - expenseCents,
    }
  })
}

export interface OutstandingRow {
  invoice: Invoice
  client: Client | undefined
  status: Exclude<DisplayStatus, 'Paid'>
  daysOverdue: number
}

/** Unpaid invoices, Overdue first, then by due date. */
export function outstandingList(ledger: Ledger, today: ISODate): OutstandingRow[] {
  const clients = new Map(ledger.clients.map((c) => [c.id, c]))
  return ledger.invoices
    .filter((i) => i.status === 'unpaid')
    .map((invoice): OutstandingRow => {
      const status = displayStatus(invoice, today) as OutstandingRow['status']
      return {
        invoice,
        client: clients.get(invoice.clientId),
        status,
        daysOverdue: status === 'Overdue' ? daysBetween(invoice.dueDate, today) : 0,
      }
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'Overdue' ? -1 : 1
      return a.invoice.dueDate.localeCompare(b.invoice.dueDate)
    })
}
