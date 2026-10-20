import { plural } from './format'
import type { Currency, Ledger } from './types'

// Versioned keys, so a future change to the stored shape can migrate or start fresh.
export const LEDGER_KEY = 'studio-ledger:ledger:v1'
export const SETTINGS_KEY = 'studio-ledger:settings:v1'

export const EMPTY_LEDGER: Ledger = { clients: [], invoices: [], expenses: [] }

export interface Settings {
  currency: Currency
}

export const DEFAULT_SETTINGS: Settings = { currency: 'USD' }
const CURRENCIES: Currency[] = ['USD', 'EUR', 'BAM']

/** Browser storage can be missing or throw (private mode, blocked site data). */
function getStorage(): Storage | undefined {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

function isLedger(value: unknown): value is Ledger {
  const v = value as Ledger | null
  return Boolean(v && Array.isArray(v.clients) && Array.isArray(v.invoices) && Array.isArray(v.expenses))
}

/** The saved records, or an empty ledger on first use. `error` is set when saved data couldn't be read. */
export function readLedger(): { ledger: Ledger; error?: string } {
  try {
    const raw = getStorage()?.getItem(LEDGER_KEY)
    if (!raw) return { ledger: EMPTY_LEDGER }
    const parsed: unknown = JSON.parse(raw)
    if (!isLedger(parsed)) throw new Error('unexpected shape')
    return { ledger: parsed }
  } catch {
    return { ledger: EMPTY_LEDGER, error: 'Your saved records could not be read, so Studio Ledger started empty.' }
  }
}

/** Saves the records. Returns an error message when the browser refuses (e.g. storage is full). */
export function writeLedger(ledger: Ledger): string | null {
  try {
    getStorage()?.setItem(LEDGER_KEY, JSON.stringify(ledger))
    return null
  } catch {
    return "Your changes couldn't be saved in this browser. They'll be lost when you close the page."
  }
}

export function readSettings(): Settings {
  try {
    const parsed = JSON.parse(getStorage()?.getItem(SETTINGS_KEY) ?? 'null') as Partial<Settings> | null
    const currency = CURRENCIES.find((c) => c === parsed?.currency)
    return currency ? { currency } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeSettings(settings: Settings): void {
  try {
    getStorage()?.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // The currency still applies for this visit; it just won't survive a reload.
  }
}

/** "6 clients, 41 invoices and 120 expenses", leaving out empty kinds. */
export function describeRecords(ledger: Ledger): string {
  const parts = [
    [ledger.clients.length, 'client'],
    [ledger.invoices.length, 'invoice'],
    [ledger.expenses.length, 'expense'],
  ] as const
  const named = parts
    .filter(([count]) => count > 0)
    .map(([count, word]) => plural(count, word))
  if (named.length <= 1) return named[0] ?? 'no records'
  return `${named.slice(0, -1).join(', ')} and ${named.at(-1)}`
}

export const hasRecords = (ledger: Ledger) =>
  ledger.clients.length + ledger.invoices.length + ledger.expenses.length > 0
