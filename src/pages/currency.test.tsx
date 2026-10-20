import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import { MonthTooltip } from '@/components/dashboard/income-expenses-chart'
import { renderApp } from '@/test/render-app'

// PB-23: chart tooltips, forms, dialogs and import screens show the chosen currency.
// PB-26: the tooltip shows a month's exact Received, Expenses and Net income.
describe('Amounts in the chosen currency (PB-23) and the chart tooltip (PB-26)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  const september = { month: '2026-09', received: 1323000, expenses: 208456, netIncome: 1114544 }
  const august = { month: '2026-08', received: 0, expenses: 258487, netIncome: -258487 }

  it("the chart tooltip shows the month's exact figures, in each currency", () => {
    const { rerender, container } = render(<MonthTooltip active payload={[{ payload: september }]} currency="USD" />)
    expect(container).toHaveTextContent('September 2026Received$13,230.00Expenses$2,084.56Net income$11,145.44')

    rerender(<MonthTooltip active payload={[{ payload: september }]} currency="EUR" />)
    expect(container).toHaveTextContent('Received€13,230.00Expenses€2,084.56Net income€11,145.44')

    rerender(<MonthTooltip active payload={[{ payload: august }]} currency="BAM" />)
    expect(container).toHaveTextContent('August 2026Received0,00 KMExpenses2.584,87 KMNet income-2.584,87 KM')

    rerender(<MonthTooltip active={false} payload={[{ payload: september }]} currency="USD" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('forms label the amount with the currency', async () => {
    const user = userEvent.setup()
    renderApp('/invoices', { currency: 'EUR' })
    await user.click(screen.getByRole('button', { name: 'Add invoice' }))
    expect(within(screen.getByRole('dialog', { name: 'Add invoice' })).getByLabelText('Amount (EUR)')).toBeInTheDocument()
  })

  it('the expense form and its delete dialog use BAM', async () => {
    const user = userEvent.setup()
    renderApp('/expenses', { currency: 'BAM' })
    await user.click(screen.getByRole('button', { name: 'Add expense' }))
    expect(within(screen.getByRole('dialog', { name: 'Add expense' })).getByLabelText('Amount (BAM)')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Open Meeting room rental, Sep 30, 2026' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('40,00 KM for Meeting room rental on Sep 30, 2026')
  })

  it('the invoice dialogs use the currency', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002', { currency: 'EUR' })
    await user.click(screen.getByRole('button', { name: 'Mark as paid' }))
    expect(screen.getByRole('dialog', { name: 'Mark INV-002 as paid' })).toHaveTextContent(
      '€850.00 counts as Received on the paid date.',
    )
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('€850.00 for Lumen Coffee is removed from every total.')
  })

  it('the client panel uses the currency', async () => {
    const user = userEvent.setup()
    renderApp('/clients', { currency: 'BAM' })
    await user.click(screen.getByRole('link', { name: 'Lumen Coffee' }))
    const panel = screen.getByRole('dialog', { name: 'Lumen Coffee' })
    expect(panel).toHaveTextContent('Received2.380,00 KM')
    expect(panel).toHaveTextContent('Outstanding2.050,00 KM')
    expect(panel).toHaveTextContent('INV-002850,00 KM')
  })

  it('the import preview shows read amounts in the currency', async () => {
    const user = userEvent.setup()
    renderApp('/import', { currency: 'BAM' })
    await user.upload(screen.getByLabelText(/Drop a CSV file here/), new File([invoicesSample], 'october.csv', { type: 'text/csv' }))
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))
    const first = within(screen.getByRole('table')).getAllByRole('row')[1]
    expect(first).toHaveTextContent('1.450,00 KM')
  })
})
