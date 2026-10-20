import { addMonths, lastDayOfMonth, monthKey, type MonthKey } from './dates'
import type { ISODate } from './types'

export const PERIOD_OPTIONS = [
  { id: 'this-month', label: 'This month' },
  { id: 'last-month', label: 'Last month' },
  { id: 'last-3-months', label: 'Last 3 months' },
  { id: 'last-6-months', label: 'Last 6 months' },
  { id: 'this-year', label: 'This year' },
] as const

export type PeriodId = (typeof PERIOD_OPTIONS)[number]['id']

export interface Period {
  /** Calendar months in the period, oldest first. */
  months: MonthKey[]
  start: ISODate
  end: ISODate
}

function fromMonths(first: MonthKey, count: number): Period {
  const months = Array.from({ length: count }, (_, i) => addMonths(first, i))
  return {
    months,
    start: `${months[0]}-01`,
    end: lastDayOfMonth(months[months.length - 1]),
  }
}

/**
 * Periods are whole calendar months. "Last 3 months" and "Last 6 months"
 * include the current month.
 */
export function getPeriod(id: PeriodId, today: ISODate): Period {
  const current = monthKey(today)
  switch (id) {
    case 'this-month':
      return fromMonths(current, 1)
    case 'last-month':
      return fromMonths(addMonths(current, -1), 1)
    case 'last-3-months':
      return fromMonths(addMonths(current, -2), 3)
    case 'last-6-months':
      return fromMonths(addMonths(current, -5), 6)
    case 'this-year':
      return fromMonths(`${today.slice(0, 4)}-01`, 12)
  }
}

/** The period of equal length that ends right before `period` starts. */
export function previousPeriod(period: Period): Period {
  const count = period.months.length
  return fromMonths(addMonths(period.months[0], -count), count)
}

export function isInPeriod(date: ISODate, period: Period): boolean {
  return date >= period.start && date <= period.end
}
