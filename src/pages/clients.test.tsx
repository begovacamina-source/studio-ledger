import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { renderApp } from '@/test/render-app'

describe('Clients (US-2.5)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
  })
  afterEach(() => vi.useRealTimers())

  const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)
  const row = (name: string) => rows().find((r) => r.textContent?.includes(name))!

  it('lists each client with total Received, total Outstanding and number of invoices', () => {
    renderApp('/clients')
    expect(screen.getByRole('link', { name: 'Clients' })).toHaveAttribute('aria-current', 'page')
    expect(rows()).toHaveLength(6)
    expect(within(row('Atlas & Oak Architects')).getAllByRole('cell').slice(2).map((c) => c.textContent)).toEqual([
      '$4,700.00',
      '7',
    ])
    expect(within(row('Fernhill Records')).getAllByRole('cell')[2]).toHaveTextContent('$0.00')
  })

  it("opens a client's invoices in a side panel, and an invoice opens its own panel", async () => {
    const user = userEvent.setup()
    renderApp('/clients')
    await user.click(within(row('Lumen Coffee')).getAllByRole('cell')[1])

    const panel = screen.getByRole('dialog', { name: 'Lumen Coffee' })
    expect(panel).toHaveTextContent('6 invoices · 1 overdue')
    const items = within(panel).getAllByRole('listitem')
    expect(items).toHaveLength(6)
    // INV-038 is due today, so it's Pending; INV-002 is the overdue one.
    expect(within(items[0]).getByText('Pending')).toBeInTheDocument()
    expect(within(items[5]).getByText('Overdue · 178 days')).toBeInTheDocument()

    await user.click(within(panel).getByRole('link', { name: 'INV-002' }))
    expect(screen.getByRole('dialog', { name: /INV-002/ })).toBeInTheDocument()
  })

  it('refuses to delete a client with invoices and says how many must go first', async () => {
    const user = userEvent.setup()
    renderApp('/clients')
    await user.click(within(row('Fernhill Records')).getByRole('link', { name: 'Fernhill Records' }))
    await user.click(screen.getByRole('button', { name: 'Delete client' }))

    const notice = screen.getByRole('alertdialog')
    expect(notice).toHaveTextContent("Fernhill Records can't be deleted yet")
    expect(notice).toHaveTextContent(
      'Fernhill Records has 7 invoices. Delete them or move them to another client first, then delete the client.',
    )
    expect(within(notice).queryByRole('button', { name: 'Delete client' })).not.toBeInTheDocument()

    await user.click(within(notice).getByRole('link', { name: 'Show their invoices' }))
    expect(screen.getByRole('searchbox', { name: 'Search invoices' })).toHaveValue('Fernhill Records')
  })

  it('deletes a client with no invoices after confirmation', async () => {
    const user = userEvent.setup()
    const sample = loadSampleLedger()
    renderApp('/clients', {
      ledger: { ...sample, clients: [...sample.clients, { id: 'kestrel', name: 'Kestrel Type', createdAt: '' }] },
    })
    expect(rows()).toHaveLength(7)
    await user.click(within(row('Kestrel Type')).getByRole('link', { name: 'Kestrel Type' }))
    expect(screen.getByRole('dialog', { name: 'Kestrel Type' })).toHaveTextContent('No invoices for this client.')

    await user.click(screen.getByRole('button', { name: 'Delete client' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete client' }))
    expect(rows()).toHaveLength(6)
    expect(screen.queryByText('Kestrel Type')).not.toBeInTheDocument()
  })

  it('shows an empty state with no clients', () => {
    renderApp('/clients', { empty: true })
    expect(screen.getByRole('heading', { name: 'No clients yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add invoice' })).toHaveAttribute('href', '/invoices?add=1')
  })

  it('lists clients as rows on phones', () => {
    window.innerWidth = 375
    renderApp('/clients')
    const items = within(screen.getByRole('list', { name: 'Clients' })).getAllByRole('listitem')
    expect(items).toHaveLength(6)
    expect(items.find((i) => i.textContent?.includes('Atlas & Oak'))).toHaveTextContent('$11,050.00 received7 invoices$4,700.00 outstanding')
  })
})
