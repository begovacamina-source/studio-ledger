import { describe, expect, it } from 'vitest'
import { pageName } from './pages'

describe('pageName', () => {
  it('names each page, and a panel by the page it opens on', () => {
    expect(pageName('/')).toBe('Overview')
    expect(pageName('/invoices')).toBe('Invoices')
    expect(pageName('/invoices/INV-002')).toBe('Invoices')
    expect(pageName('/clients/abc')).toBe('Clients')
    expect(pageName('/import')).toBe('Import CSV')
    expect(pageName('/settings')).toBe('Settings')
    expect(pageName('/nowhere')).toBe('Page not found')
  })
})
