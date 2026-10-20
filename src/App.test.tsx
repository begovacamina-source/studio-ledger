import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { renderApp } from '@/test/render-app'

describe('Overview dashboard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
  })
  afterEach(() => vi.useRealTimers())

  it('shows the four summary cards with the Outstanding snapshot', () => {
    renderApp()
    const cards = screen.getByRole('region', { name: 'Key figures' })
    for (const title of ['Received', 'Outstanding', 'Expenses', 'Net income']) {
      expect(within(cards).getByText(title)).toBeInTheDocument()
    }
    expect(within(cards).getByText('$14,620.00')).toBeInTheDocument()
    expect(within(cards).getByText('9 invoices · 5 overdue')).toBeInTheDocument()
    expect(within(cards).getAllByText('vs previous period')).toHaveLength(3)
  })

  it('lists who owes money with a text status, Overdue first', () => {
    renderApp()
    const badges = screen.getAllByText(/^(Overdue · \d+ days?|Pending)$/)
    expect(badges).toHaveLength(9)
    expect(badges[0]).toHaveTextContent(/^Overdue/)
    expect(badges[4]).toHaveTextContent('Overdue · 1 day')
    expect(badges[5]).toHaveTextContent('Pending')
  })

  it('opens on Last 6 months', () => {
    renderApp()
    expect(screen.getByRole('combobox', { name: 'Period' })).toHaveTextContent('Last 6 months')
    // May–October 2026 on 2026-10-19.
    expect(screen.getByText('$47,160.00')).toBeInTheDocument()
  })

  it('the period selector offers the five periods (US-1.1)', async () => {
    const user = userEvent.setup()
    renderApp()
    await user.click(screen.getByRole('combobox', { name: 'Period' }))
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'This month',
      'Last month',
      'Last 3 months',
      'Last 6 months',
      'This year',
    ])
  })

  it('with more than 10 owed, Outstanding shows the 10 most urgent, says how many, and links to Invoices (US-1.3)', () => {
    // Set the 5 newest paid invoices back to not paid: 9 + 5 = 14 owed.
    const ledger = loadSampleLedger()
    const paid = ledger.invoices.filter((i) => i.paidDate).sort((a, b) => b.issueDate.localeCompare(a.issueDate))
    const reopened = new Set(paid.slice(0, 5).map((i) => i.id))
    ledger.invoices = ledger.invoices.map((i) => (reopened.has(i.id) ? { ...i, status: 'unpaid' as const, paidDate: undefined } : i))
    renderApp('/', { ledger })

    expect(screen.getAllByText(/^(Overdue · \d+ days?|Pending)$/)).toHaveLength(10)
    expect(screen.getByText(/The 10 most urgent of 14\./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'See all in Invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('never shows banned terms', () => {
    const { container } = renderApp()
    expect(container.textContent).not.toMatch(/unpaid|revenue|billed/i)
  })
})
