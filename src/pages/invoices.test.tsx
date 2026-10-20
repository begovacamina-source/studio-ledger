import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render-app'

describe('Invoices', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
  })
  afterEach(() => vi.useRealTimers())

  const rowsIn = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)

  it('shows status tabs with counts and filters by status', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    // 41 invoices, 10 per page.
    expect(rowsIn()).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 41 invoices')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Overdue 5' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Overdue 5' }))
    expect(rowsIn()).toHaveLength(5)
  })

  it('changing the status tab or the search goes back to page 1 (US-2.3)', async () => {
    const user = userEvent.setup()
    renderApp('/invoices?page=3')
    expect(screen.getByText('Showing 21–30 of 41 invoices')).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: 'Paid 32' }))
    expect(screen.getByText('Showing 1–10 of 32 invoices')).toBeInTheDocument()

    await user.click(within(screen.getByRole('navigation', { name: 'Pages of invoices' })).getByRole('link', { name: '2' }))
    expect(screen.getByText('Showing 11–20 of 32 invoices')).toBeInTheDocument()
    // Every invoice number starts with INV-0, so the search keeps all 32 and only the page changes.
    await user.type(screen.getByRole('searchbox', { name: 'Search invoices' }), 'INV-0')
    expect(screen.getByText('Showing 1–10 of 32 invoices')).toBeInTheDocument()
  })

  it('searches invoice number and client name, with an empty state', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    await user.type(screen.getByRole('searchbox', { name: 'Search invoices' }), 'fernhill')
    expect(rowsIn()).toHaveLength(7)

    await user.click(screen.getByRole('tab', { name: 'Overdue 0' }))
    expect(screen.getByText('No overdue invoices match "fernhill".')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(rowsIn()).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 41 invoices')).toBeInTheDocument()
  })

  it('marks an invoice as paid from the list, and the dashboard updates', async () => {
    const user = userEvent.setup()
    renderApp('/invoices?status=overdue')
    await user.click(screen.getByRole('button', { name: 'Mark INV-002 as paid' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText('Paid date')).toHaveValue('2026-10-19')
    await user.click(within(dialog).getByRole('button', { name: 'Mark as paid' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(rowsIn()).toHaveLength(4)
    expect(screen.getByRole('tab', { name: 'Paid 33' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Overview' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    expect(within(cards).getByText('$13,770.00')).toBeInTheDocument()
    expect(within(cards).getByText('8 invoices · 4 overdue')).toBeInTheDocument()
  })

  it('rejects a paid date before the issue date', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Mark as paid' }))
    const dialog = screen.getByRole('dialog', { name: 'Mark INV-002 as paid' })
    const input = within(dialog).getByLabelText('Paid date')
    await user.clear(input)
    await user.type(input, '2026-04-01')
    await user.click(within(dialog).getByRole('button', { name: 'Mark as paid' }))

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Paid date cannot be before the issue date.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('opens a row in the side panel and sets a paid invoice back', async () => {
    const user = userEvent.setup()
    // INV-001 is the oldest, on the last page.
    renderApp('/invoices?page=5')
    await user.click(within(screen.getByRole('table')).getByRole('link', { name: 'INV-001' }))
    const panel = screen.getByRole('dialog', { name: 'INV-001' })
    expect(within(panel).getByText('Apr 14, 2026')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Mark as not paid' }))
    expect(within(panel).getByText('Overdue · 186 days')).toBeInTheDocument()
    expect(within(panel).getByRole('button', { name: 'Mark as paid' })).toBeInTheDocument()
  })

  it('opens the panel when the row itself is clicked, keeping the filter', async () => {
    const user = userEvent.setup()
    renderApp('/invoices?status=overdue')
    const row = within(screen.getByRole('table')).getByText('Paper Kite Publishing').closest('tr')!
    await user.click(row)
    expect(screen.getByRole('dialog', { name: 'INV-016' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'INV-016' })).not.toBeInTheDocument()
    expect(rowsIn()).toHaveLength(5)
  })

  it('shows a not-found state for an unknown invoice', () => {
    renderApp('/invoices/INV-999')
    expect(screen.getByRole('dialog', { name: 'Invoice INV-999 was not found' })).toBeInTheDocument()
  })

  it('opens an invoice from the dashboard Outstanding list in a panel on the Overview', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const row = screen.getAllByRole('button', { name: 'Lumen Coffee' })[0].closest('tr')!
    await user.click(within(row).getByText('INV-002'))
    const panel = screen.getByRole('dialog', { name: 'INV-002' })
    expect(screen.getByRole('heading', { name: 'Overview', hidden: true })).toBeInTheDocument()

    await user.click(within(panel).getByRole('link', { name: 'Go to Invoices' }))
    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
  })
})
