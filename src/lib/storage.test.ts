import { afterEach, describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import {
  describeRecords,
  EMPTY_LEDGER,
  hasRecords,
  LEDGER_KEY,
  readLedger,
  readSettings,
  SETTINGS_KEY,
  writeLedger,
  writeSettings,
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

