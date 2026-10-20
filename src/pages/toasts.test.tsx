import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import { renderApp } from '@/test/render-app'

// UX-4: saving, marking as paid and importing each confirm with a toast.
// Marking as paid, with its Undo, is covered in undo-paid.test.tsx.
describe('Confirmation toasts (UX-4)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  const toasts = () => screen.getByRole('region', { name: /Notifications/ })

  it('saving an edited invoice confirms with a toast', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Edit INV-002' })).getByRole('button', { name: 'Save changes' }))
    expect(await within(toasts()).findByText('INV-002 saved')).toBeInTheDocument()
  })

  it('adding an expense confirms with a toast', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    await user.click(screen.getByRole('button', { name: 'Add expense' }))
    const form = screen.getByRole('dialog', { name: 'Add expense' })
    await user.type(within(form).getByLabelText('Amount (USD)'), '12')
    await user.click(within(form).getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Office' }))
    await user.click(within(form).getByRole('button', { name: 'Add expense' }))
    expect(await within(toasts()).findByText('$12.00 expense added')).toBeInTheDocument()
  })

  it('importing confirms with a toast', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(screen.getByLabelText(/Drop a CSV file here/), new File([invoicesSample], 'october.csv', { type: 'text/csv' }))
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))
    await user.click(screen.getByRole('button', { name: 'Import 4 valid rows' }))
    expect(await within(toasts()).findByText('4 invoices imported')).toBeInTheDocument()
  })
})
