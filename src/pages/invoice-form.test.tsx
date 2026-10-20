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

  async function openAddDialog(user: ReturnType<typeof userEvent.setup>) {
    renderApp('/invoices')
    await user.click(screen.getByRole('button', { name: 'Add invoice' }))
    return screen.getByRole('dialog', { name: 'Add invoice' })
  }

  it('adds an invoice in a modal, then shows it in the side panel', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)

    await user.click(within(dialog).getByRole('combobox', { name: 'Client' }))
    await user.click(await screen.findByRole('option', { name: 'New client…' }))
    await user.type(within(dialog).getByLabelText('New client name'), 'Kestrel Type')
    await user.type(within(dialog).getByLabelText('Invoice number'), 'INV-042')
    await user.type(within(dialog).getByLabelText('Amount (USD)'), '1200,50')
    await user.type(within(dialog).getByLabelText('Due date'), '2026-11-02')
    await user.click(within(dialog).getByRole('button', { name: 'Add invoice' }))

    expect(screen.queryByRole('dialog', { name: 'Add invoice' })).not.toBeInTheDocument()
    const panel = screen.getByRole('dialog', { name: 'INV-042' })
    expect(within(panel).getByText('Kestrel Type')).toBeInTheDocument()
    expect(within(panel).getByText('$1,200.50')).toBeInTheDocument()
    expect(within(panel).getByText('Pending')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 42', hidden: true })).toBeInTheDocument()
  })

  it('shows inline errors and moves focus to the first one', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)
    await user.click(within(dialog).getByRole('button', { name: 'Add invoice' }))

    expect(within(dialog).getByRole('combobox', { name: 'Client' })).toHaveFocus()
    expect(within(dialog).getByText('Choose a client or add a new one.')).toBeInTheDocument()
    expect(within(dialog).getByText('Enter an invoice number.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Amount (USD)')).toHaveAccessibleDescription('Enter the amount.')

    await user.type(within(dialog).getByLabelText('Invoice number'), 'INV-002')
    expect(within(dialog).getByText('INV-002 is already used by another invoice.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Due date'), '2026-10-01')
    expect(within(dialog).getByText('Due date cannot be before the issue date.')).toBeInTheDocument()
  })

  it('shows an error only after leaving a field', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)
    await user.click(within(dialog).getByLabelText('Invoice number'))
    expect(within(dialog).queryByText('Enter an invoice number.')).not.toBeInTheDocument()
    await user.tab()
    expect(within(dialog).getByText('Enter an invoice number.')).toBeInTheDocument()
  })

  it('cancel closes the modal without adding anything', async () => {
    const user = userEvent.setup()
    const dialog = await openAddDialog(user)
    await user.type(within(dialog).getByLabelText('Invoice number'), 'INV-042')
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 41' })).toBeInTheDocument()
  })

  it('edits a paid invoice from the panel and the dashboard totals change immediately', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-037') // $1,650.00, paid 2026-09-30
    await user.click(within(screen.getByRole('dialog', { name: 'INV-037' })).getByRole('button', { name: 'Edit' }))

    const form = screen.getByRole('dialog', { name: 'Edit INV-037' })
    expect(within(form).getByLabelText('Paid date')).toHaveValue('2026-09-30')
    const amount = within(form).getByLabelText('Amount (USD)')
    await user.clear(amount)
    await user.type(amount, '2000')
    await user.click(within(form).getByRole('button', { name: 'Save changes' }))

    expect(screen.queryByRole('dialog', { name: 'Edit INV-037' })).not.toBeInTheDocument()
    expect(within(screen.getByRole('dialog', { name: 'INV-037' })).getByText('$2,000.00')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    // Last 6 months Received was $47,160.00; INV-037 grew by $350.00.
    expect(within(cards).getByText('$47,510.00')).toBeInTheDocument()
  })

  it('renaming an invoice keeps the panel open on the new number', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const number = within(screen.getByRole('dialog', { name: 'Edit INV-002' })).getByLabelText('Invoice number')
    await user.clear(number)
    await user.type(number, 'INV-002A')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(screen.getByRole('dialog', { name: 'INV-002A' })).toBeInTheDocument()
  })

  it('deletes an invoice after confirmation and closes the panel', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    const confirm = screen.getByRole('alertdialog')
    expect(confirm).toHaveTextContent('Delete INV-002?')
    await user.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(screen.getByRole('dialog', { name: 'INV-002' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete invoice' }))

    expect(screen.queryByRole('dialog', { name: 'INV-002' })).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 40' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'INV-002' })).not.toBeInTheDocument()
  })
})
