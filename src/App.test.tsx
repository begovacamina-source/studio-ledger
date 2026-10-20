import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('never shows banned terms', () => {
    const { container } = renderApp()
    expect(container.textContent).not.toMatch(/unpaid|revenue|billed/i)
  })
})
