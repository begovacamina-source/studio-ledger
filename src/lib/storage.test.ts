import { afterEach, describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import {
  clearSampleData,
  describeRecords,
  EMPTY_LEDGER,
  hasRecords,
  LEDGER_KEY,
  readLedger,
  readSettings,
  sampleRecords,
  SETTINGS_KEY,
  writeLedger,
  writeSettings,
  usesSampleData,
} from './storage'

afterEach(() => localStorage.clear())

describe('ledger storage', () => {
  it('reports a first visit when nothing was ever saved', () => {
    expect(readLedger()).toEqual({ ledger: EMPTY_LEDGER, firstVisit: true })
  })

  it('a cleared ledger is saved, so a later visit stays empty', () => {
    writeLedger(EMPTY_LEDGER)
    expect(readLedger()).toEqual({ ledger: EMPTY_LEDGER })
  })

  it('reads back what was saved', () => {
    const ledger = loadSampleLedger()
    expect(writeLedger(ledger)).toBeNull()
    expect(readLedger().ledger).toEqual(ledger)
  })

  it('starts empty with a message when saved data is unreadable', () => {
    localStorage.setItem(LEDGER_KEY, '{not json')
    expect(readLedger()).toEqual({
      ledger: EMPTY_LEDGER,
      error: 'Your saved records could not be read, so Studio Ledger started empty.',
    })
    localStorage.setItem(LEDGER_KEY, JSON.stringify({ invoices: [] }))
    expect(readLedger().error).toBeDefined()
  })
})

describe('settings storage', () => {
  it('defaults to USD and keeps a chosen currency', () => {
    expect(readSettings()).toEqual({ currency: 'USD' })
    writeSettings({ currency: 'BAM' })
    expect(readSettings()).toEqual({ currency: 'BAM' })
  })

  it('ignores an unknown currency', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currency: 'GBP' }))
    expect(readSettings()).toEqual({ currency: 'USD' })
  })
})

describe('describeRecords', () => {
  it('names what is stored', () => {
    expect(describeRecords(loadSampleLedger())).toBe('6 clients, 41 invoices and 120 expenses')
    expect(describeRecords({ ...EMPTY_LEDGER, expenses: loadSampleLedger().expenses.slice(0, 1) })).toBe('1 expense')
    expect(describeRecords(EMPTY_LEDGER)).toBe('no records')
    expect(hasRecords(EMPTY_LEDGER)).toBe(false)
  })
})

describe('sample data', () => {
  const sample = loadSampleLedger()
  const lumen = sample.clients.find((c) => c.name === 'Lumen Coffee')!
  const own = {
    ...sample,
    clients: [...sample.clients, { id: 'own-client', name: 'Kestrel Type', createdAt: '' }],
    invoices: [
      ...sample.invoices,
      { ...sample.invoices[0], id: 'own-1', invoiceNumber: 'INV-900', clientId: lumen.id, source: 'manual' as const },
      { ...sample.invoices[0], id: 'own-2', invoiceNumber: 'INV-901', clientId: 'own-client', source: 'import' as const },
    ],
    expenses: [...sample.expenses, { ...sample.expenses[0], id: 'own-e', source: 'manual' as const }],
  }

  it('knows when sample records are in use', () => {
    expect(usesSampleData(sample)).toBe(true)
    expect(usesSampleData(EMPTY_LEDGER)).toBe(false)
    expect(usesSampleData(clearSampleData(own))).toBe(false)
  })

  it('clears only the sample, keeping own records and the clients they use', () => {
    const left = clearSampleData(own)
    expect(left.invoices.map((i) => i.invoiceNumber)).toEqual(['INV-900', 'INV-901'])
    expect(left.expenses.map((e) => e.id)).toEqual(['own-e'])
    expect(left.clients.map((c) => c.name).sort()).toEqual(['Kestrel Type', 'Lumen Coffee'])
  })

  it('names what clearing the sample removes', () => {
    expect(describeRecords(sampleRecords(sample))).toBe('6 clients, 41 invoices and 120 expenses')
    expect(describeRecords(sampleRecords(own))).toBe('5 clients, 41 invoices and 120 expenses')
  })
})
