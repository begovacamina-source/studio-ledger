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

/**
 * The saved records. `firstVisit` is true when nothing was ever saved (a
 * cleared ledger is saved as empty, so it isn't a first visit). `error` is set
 * when saved data couldn't be read.
 */
export function readLedger(): { ledger: Ledger; firstVisit?: boolean; error?: string } {
  try {
    const raw = getStorage()?.getItem(LEDGER_KEY)
    if (!raw) return { ledger: EMPTY_LEDGER, firstVisit: true }
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

/** True while any sample invoice or expense is in the ledger. */
export const usesSampleData = (ledger: Ledger) =>
  ledger.invoices.some((i) => i.source === 'sample') || ledger.expenses.some((e) => e.source === 'sample')

/**
 * Removes the sample invoices and expenses, and the clients left with no
 * invoices because of it. Records the user added or imported stay.
 */
export function clearSampleData(ledger: Ledger): Ledger {
  const invoices = ledger.invoices.filter((i) => i.source !== 'sample')
  const sampleClients = new Set(ledger.invoices.filter((i) => i.source === 'sample').map((i) => i.clientId))
  const stillUsed = new Set(invoices.map((i) => i.clientId))
  return {
    clients: ledger.clients.filter((c) => !sampleClients.has(c.id) || stillUsed.has(c.id)),
    invoices,
    expenses: ledger.expenses.filter((e) => e.source !== 'sample'),
  }
}

/** What clearing the sample would remove, for the confirmation. */
export function sampleRecords(ledger: Ledger): Ledger {
  const kept = clearSampleData(ledger)
  const keptClients = new Set(kept.clients.map((c) => c.id))
  return {
    clients: ledger.clients.filter((c) => !keptClients.has(c.id)),
    invoices: ledger.invoices.filter((i) => i.source === 'sample'),
    expenses: ledger.expenses.filter((e) => e.source === 'sample'),
  }
}

export const hasRecords = (ledger: Ledger) =>
  ledger.clients.length + ledger.invoices.length + ledger.expenses.length > 0
