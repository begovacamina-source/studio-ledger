import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { clientInvoices, clientSummaries, deleteBlockedReason, deleteClient } from './clients'
import { deleteInvoice } from './invoice-form'

// Owed-by-client totals come from data/README.md, which fixes today at 2026-10-19.
const TODAY = '2026-10-19'
const ledger = loadSampleLedger()
const byName = (name: string) => ledger.clients.find((c) => c.name === name)!

describe('clientSummaries', () => {
  const rows = clientSummaries(ledger, TODAY)
  const row = (name: string) => rows.find((r) => r.client.name === name)!

  it('matches the owed-by-client table in data/README.md', () => {
    expect(
      Object.fromEntries(rows.map((r) => [r.client.name, [r.invoiceCount, r.outstanding, r.overdueCount]])),
    ).toEqual({
      'Atlas & Oak Architects': [7, 470000, 1],
      'Brightwater Film Co.': [6, 425000, 1],
      'Paper Kite Publishing': [7, 268000, 1],
      'Lumen Coffee': [6, 205000, 1],
      'Northwind Studio': [8, 94000, 1],
      'Fernhill Records': [7, 0, 0],
    })
  })

  it('counts Received over all time, so the clients add up to the sample total', () => {
    expect(rows.reduce((sum, r) => sum + r.received, 0)).toBe(4981000)
    expect(rows.reduce((sum, r) => sum + r.invoiceCount, 0)).toBe(41)
    expect(row('Fernhill Records').received).toBeGreaterThan(0)
  })

  it('lists the highest Received first', () => {
    const received = rows.map((r) => r.received)
    expect(received).toEqual([...received].sort((a, b) => b - a))
  })

  it('includes a client with no invoices, at zero', () => {
    const withNew = { ...ledger, clients: [...ledger.clients, { id: 'new', name: 'Kestrel Type', createdAt: '' }] }
    expect(clientSummaries(withNew, TODAY).at(-1)).toMatchObject({
      client: { name: 'Kestrel Type' },
      received: 0,
      outstanding: 0,
      invoiceCount: 0,
    })
  })
})

describe('clientInvoices', () => {
  it("returns only that client's invoices, newest first", () => {
    const invoices = clientInvoices(ledger, byName('Lumen Coffee').id)
    expect(invoices).toHaveLength(6)
    expect(invoices.every((i) => i.clientId === byName('Lumen Coffee').id)).toBe(true)
    expect(invoices[0].issueDate >= invoices[1].issueDate).toBe(true)
  })
})

describe('deleting a client', () => {
  it('is blocked while the client has invoices, saying how many', () => {
    expect(deleteBlockedReason(ledger, byName('Lumen Coffee').id)).toBe(
      'Lumen Coffee has 6 invoices. Delete them or move them to another client first, then delete the client.',
    )
    expect(() => deleteClient(ledger, byName('Lumen Coffee').id)).toThrow()
  })

  it('names a single invoice in the singular', () => {
    const lumen = byName('Lumen Coffee').id
    const keepOne = clientInvoices(ledger, lumen).slice(1)
    const oneLeft = keepOne.reduce((l, i) => deleteInvoice(l, i.id), ledger)
    expect(deleteBlockedReason(oneLeft, lumen)).toBe(
      'Lumen Coffee has 1 invoice. Delete it or move it to another client first, then delete the client.',
    )
  })

  it('removes a client once it has no invoices', () => {
    const lumen = byName('Lumen Coffee').id
    const none = clientInvoices(ledger, lumen).reduce((l, i) => deleteInvoice(l, i.id), ledger)
    expect(deleteBlockedReason(none, lumen)).toBeNull()
    expect(deleteClient(none, lumen).clients).toHaveLength(5)
  })
})
