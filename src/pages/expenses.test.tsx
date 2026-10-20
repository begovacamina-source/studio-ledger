import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render-app'

describe('Expenses', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  const rows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1)

  async function choose(user: ReturnType<typeof userEvent.setup>, combobox: string, option: string) {
    await user.click(screen.getByRole('combobox', { name: combobox }))
    await user.click(await screen.findByRole('option', { name: option }))
  }

  it('lists every expense, newest first, and filters by period and category', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    // 120 expenses, 10 per page.
    expect(rows()).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 120 expenses')).toBeInTheDocument()
    expect(within(rows()[0]).getByRole('button')).toHaveTextContent('Sep 30, 2026')

    await choose(user, 'Category', 'Software')
    expect(screen.getByText('Showing 1–10 of 33 expenses')).toBeInTheDocument()
    expect(rows().every((r) => r.textContent?.includes('Software'))).toBe(true)
    await choose(user, 'Period', 'Last month')
    expect(rows().every((r) => r.textContent?.includes('Sep') && r.textContent.includes('Software'))).toBe(true)

    await choose(user, 'Period', 'This month')
    expect(screen.getByText('No expenses match these filters.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('Showing 1–10 of 120 expenses')).toBeInTheDocument()
  })

  it('pages through expenses 10 at a time, kept in the URL, and a filter goes back to page 1', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    const pages = screen.getByRole('navigation', { name: 'Pages of expenses' })
    expect(within(pages).getByRole('link', { name: 'Go to previous page' })).toHaveAttribute('aria-disabled', 'true')

    await user.click(within(pages).getByRole('link', { name: 'Go to next page' }))
    expect(screen.getByText('Showing 11–20 of 120 expenses')).toBeInTheDocument()
    expect(within(pages).getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(within(pages).getByRole('link', { name: '3' })).toHaveAttribute('href', '/expenses?page=3')
    // The count and total still cover every expense, not just the page.
    expect(screen.getByText('120 expenses · $11,770.14')).toBeInTheDocument()

    await user.click(within(pages).getByRole('link', { name: '12' }))
    expect(rows()).toHaveLength(10)
    expect(screen.getByText('Showing 111–120 of 120 expenses')).toBeInTheDocument()
    expect(within(pages).getByRole('link', { name: 'Go to next page' })).toHaveAttribute('aria-disabled', 'true')

    await choose(user, 'Category', 'Software')
    expect(screen.getByText('Showing 1–10 of 33 expenses')).toBeInTheDocument()
    expect(
      within(screen.getByRole('navigation', { name: 'Pages of expenses' })).getByRole('link', { name: '1' }),
    ).toHaveAttribute('aria-current', 'page')
  })

  it('opens on the page in the URL', () => {
    renderApp('/expenses?page=3')
    expect(screen.getByText('Showing 21–30 of 120 expenses')).toBeInTheDocument()
  })

  it('shows how many expenses match and their total', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    // All time is the default: every sample expense, April to September.
    expect(screen.getByText('120 expenses · $11,770.14')).toBeInTheDocument()

    await choose(user, 'Period', 'Last month')
    // The count is every matching expense; the pager shows the same number.
    const count = screen.getByText(/^\d+ expenses · \$2,084\.56$/).textContent!.split(' ')[0]
    expect(screen.getByText(`Showing 1–10 of ${count} expenses`)).toBeInTheDocument()

    await choose(user, 'Period', 'This month')
    expect(screen.getByText('0 expenses · $0.00')).toBeInTheDocument()
  })

  it('adds an expense in a modal and the dashboard Expenses update', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))
    const dialog = screen.getByRole('dialog', { name: 'Add expense' })
    expect(within(dialog).getByLabelText('Date')).toHaveValue('2026-10-20')

    await user.type(within(dialog).getByLabelText('Amount (USD)'), '18,50')
    await user.click(within(dialog).getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Office' }))
    await user.type(within(dialog).getByLabelText(/Description/), 'Printer paper')
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }))

    expect(screen.queryByRole('dialog', { name: 'Add expense' })).not.toBeInTheDocument()
    expect(within(rows()[0]).getByText('Printer paper')).toBeInTheDocument()
    expect(within(rows()[0]).getByText('$18.50')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Overview' }))
    await user.click(screen.getByRole('combobox', { name: 'Period' }))
    await user.click(await screen.findByRole('option', { name: 'This month' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    expect(within(cards).getAllByText('$18.50')).not.toHaveLength(0)
    expect(within(cards).getByText('-$18.50')).toBeInTheDocument()
  })

  it('validates inline, refusing a zero amount and a missing category', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))
    const dialog = screen.getByRole('dialog', { name: 'Add expense' })
    await user.type(within(dialog).getByLabelText('Amount (USD)'), '0')
    await user.click(within(dialog).getByRole('button', { name: 'Add expense' }))

    expect(within(dialog).getByText('Amount must be greater than 0. Refunds are not supported.')).toBeInTheDocument()
    expect(within(dialog).getByText('Choose a category.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Amount (USD)')).toHaveFocus()
  })

  it('opens a row in the side panel, edits it, and deletes it after confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    // Clicking anywhere on the row opens it, here the description cell.
    const description = within(rows()[0]).getAllByRole('cell')[2]
    const title = description.textContent!
    await user.click(description)
    const panel = await screen.findByRole('dialog', { name: title })
    expect(within(panel).getByRole('button', { name: 'Edit' })).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Edit' }))
    const form = screen.getByRole('dialog', { name: 'Edit expense' })
    const amount = within(form).getByLabelText('Amount (USD)')
    await user.clear(amount)
    await user.type(amount, '999')
    await user.click(within(form).getByRole('button', { name: 'Save changes' }))
    expect(within(panel).getByText('$999.00')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Delete' }))
    const confirm = screen.getByRole('alertdialog')
    expect(confirm).toHaveTextContent('$999.00')
    await user.click(within(confirm).getByRole('button', { name: 'Delete expense' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1–10 of 119 expenses')).toBeInTheDocument()
  })

  it('opens the panel from the keyboard', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    within(rows()[0]).getByRole('button').focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })
})
