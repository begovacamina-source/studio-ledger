import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render-app'

describe('Add, edit and delete invoices', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
  })
  afterEach(() => vi.useRealTimers())

  async function chooseClient(user: ReturnType<typeof userEvent.setup>, name: string) {
    await user.click(screen.getByRole('combobox', { name: 'Client' }))
    await user.click(await screen.findByRole('option', { name }))
  }

  it('adds an invoice for a new client from the Invoices list', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    await user.click(screen.getByRole('link', { name: 'Add invoice' }))
    expect(screen.getByRole('heading', { name: 'Add invoice' })).toBeInTheDocument()

    await chooseClient(user, 'New client…')
    await user.type(screen.getByLabelText('New client name'), 'Kestrel Type')
    await user.type(screen.getByLabelText('Invoice number'), 'INV-042')
    await user.type(screen.getByLabelText('Amount (USD)'), '1200,50')
    await user.type(screen.getByLabelText('Due date'), '2026-11-02')
    await user.click(screen.getByRole('button', { name: 'Add invoice' }))

    expect(screen.getByRole('heading', { name: 'INV-042' })).toBeInTheDocument()
    expect(screen.getByText('Kestrel Type')).toBeInTheDocument()
    expect(screen.getByText('$1,200.50')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows inline errors and moves focus to the first one', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/new')
    await user.click(screen.getByRole('button', { name: 'Add invoice' }))

    expect(screen.getByRole('combobox', { name: 'Client' })).toHaveFocus()
    expect(screen.getByText('Choose a client or add a new one.')).toBeInTheDocument()
    expect(screen.getByText('Enter an invoice number.')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount (USD)')).toHaveAccessibleDescription('Enter the amount.')

    await user.type(screen.getByLabelText('Invoice number'), 'INV-002')
    expect(screen.getByText('INV-002 is already used by another invoice.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Due date'), '2026-10-01')
    expect(screen.getByText('Due date cannot be before the issue date.')).toBeInTheDocument()
  })

  it('shows an error only after leaving a field', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/new')
    await user.click(screen.getByLabelText('Invoice number'))
    expect(screen.queryByText('Enter an invoice number.')).not.toBeInTheDocument()
    await user.tab()
    expect(screen.getByText('Enter an invoice number.')).toBeInTheDocument()
  })

  it('edits a paid invoice and the dashboard totals change immediately', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-037') // $1,650.00, paid 2026-09-30
    await user.click(screen.getByRole('link', { name: 'Edit' }))
    expect(screen.getByRole('heading', { name: 'Edit INV-037' })).toBeInTheDocument()
    expect(screen.getByLabelText('Paid date')).toBeInTheDocument()

    const amount = screen.getByLabelText('Amount (USD)')
    await user.clear(amount)
    await user.type(amount, '2000')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(screen.getByRole('heading', { name: 'INV-037' })).toBeInTheDocument()
    expect(screen.getByText('$2,000.00')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Overview' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    // Last 6 months Received was $47,160.00; INV-037 grew by $350.00.
    expect(within(cards).getByText('$47,510.00')).toBeInTheDocument()
  })

  it('deletes an invoice after confirmation', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveTextContent('Delete INV-002?')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('heading', { name: 'INV-002' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete invoice' }))

    expect(screen.getByRole('heading', { name: 'Invoices' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 40' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'INV-002' })).not.toBeInTheDocument()
  })
})
