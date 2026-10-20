import type { ISODate } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Today's date in the user's local time zone. */
export function todayLocal(now: Date = new Date()): ISODate {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** A calendar month as "YYYY-MM". */
export type MonthKey = string

export function monthKey(date: ISODate): MonthKey {
  return date.slice(0, 7)
}

export function addMonths(key: MonthKey, delta: number): MonthKey {
  const [year, month] = key.split('-').map(Number)
  const index = year * 12 + (month - 1) + delta
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`
}

export function lastDayOfMonth(key: MonthKey): ISODate {
  const [year, month] = key.split('-').map(Number)
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return `${key}-${pad(day)}`
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: ISODate, to: ISODate): number {
  const toUTC = (d: ISODate) => {
    const [y, m, day] = d.split('-').map(Number)
    return Date.UTC(y, m - 1, day)
  }
  return Math.round((toUTC(to) - toUTC(from)) / 86_400_000)
}

export function formatMonthShort(key: MonthKey): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  })
}

export function formatMonthLong(key: MonthKey): string {
  const [year, month] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDate(date: ISODate): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
