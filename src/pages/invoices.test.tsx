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
    expect(rowsIn()).toHaveLength(41)
    expect(screen.getByRole('tab', { name: 'Overdue 5' })).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Overdue 5' }))
    expect(rowsIn()).toHaveLength(5)
  })

  it('searches invoice number and client name, with an empty state', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    await user.type(screen.getByRole('searchbox', { name: 'Search invoices' }), 'fernhill')
    expect(rowsIn()).toHaveLength(7)

    await user.click(screen.getByRole('tab', { name: 'Overdue 0' }))
    expect(screen.getByText('No overdue invoices match "fernhill".')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(rowsIn()).toHaveLength(41)
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
    const input = within(screen.getByRole('dialog')).getByLabelText('Paid date')
    await user.clear(input)
    await user.type(input, '2026-04-01')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Mark as paid' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Paid date cannot be before the issue date.')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('sets a paid invoice back from its detail page', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-001')
    expect(screen.getByRole('heading', { name: 'INV-001' })).toBeInTheDocument()
    expect(screen.getByText('Apr 14, 2026')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mark as not paid' }))
    expect(screen.getByText('Overdue · 186 days')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark as paid' })).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown invoice', () => {
    renderApp('/invoices/INV-999')
    expect(screen.getByRole('alert')).toHaveTextContent('Invoice INV-999 was not found.')
  })

  it('opens an invoice from the dashboard Outstanding list', async () => {
    const user = userEvent.setup()
    renderApp('/')
    await user.click(screen.getAllByRole('link', { name: 'Lumen Coffee' })[0])
    expect(screen.getByRole('heading', { name: 'INV-002' })).toBeInTheDocument()
  })
})
