import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import { renderApp } from '@/test/render-app'

describe('Card lists on phones (UX-8)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
    // Below the md breakpoint; setup.ts restores the desktop width after each test.
    window.innerWidth = 375
  })
  afterEach(() => vi.useRealTimers())

  it('lists Outstanding as rows with a text status, and a row opens the invoice', async () => {
    const user = userEvent.setup()
    renderApp('/')
    // The only table left is the chart's one for screen readers.
    expect(screen.getByRole('table')).toHaveAccessibleName('Received, Expenses and Net income per month')
    const rows = within(screen.getByRole('list', { name: 'Outstanding invoices' })).getAllByRole('listitem')
    expect(rows).toHaveLength(9)
    expect(rows[0]).toHaveTextContent('Lumen Coffee')
    expect(rows[0]).toHaveTextContent('$850.00')
    expect(rows[0]).toHaveTextContent('INV-002 · Due Apr 24, 2026')
    expect(rows[0]).toHaveTextContent(/Overdue · \d+ days/)

    await user.click(within(rows[0]).getByRole('button', { name: 'Lumen Coffee' }))
    expect(screen.getByRole('dialog', { name: /INV-002/ })).toBeInTheDocument()
  })

  it('lists invoices as rows with Mark as paid on unpaid ones, and the number opens the panel', async () => {
    const user = userEvent.setup()
    renderApp('/invoices')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Invoices' })
    const rows = within(list).getAllByRole('listitem')
    // 10 per page on phones too.
    expect(rows).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 41 invoices')).toBeInTheDocument()
    expect(within(screen.getByRole('navigation', { name: 'Pages of invoices' })).getByRole('link', { name: '5' })).toBeInTheDocument()
    expect(rows[0]).toHaveTextContent('INV-041')
    expect(rows[0]).toHaveTextContent('Paper Kite Publishing')
    expect(rows[0]).toHaveTextContent('Pending')
    // The first page (INV-041 to INV-032) has 4 Pending and 2 Overdue: one Mark as paid each, none on Paid ones.
    expect(within(list).getAllByRole('button', { name: /^Mark INV-\d+ as paid$/ })).toHaveLength(6)

    await user.click(within(list).getByRole('link', { name: 'INV-041' }))
    expect(screen.getByRole('dialog', { name: /INV-041/ })).toBeInTheDocument()
  })

  it('lists expenses as rows, and a row opens the expense', async () => {
    const user = userEvent.setup()
    renderApp('/expenses')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    const rows = within(screen.getByRole('list', { name: 'Expenses' })).getAllByRole('listitem')
    expect(rows).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 120 expenses')).toBeInTheDocument()
    expect(rows[0]).toHaveTextContent('Meeting room rental')
    expect(rows[0]).toHaveTextContent('Sep 30, 2026 · Office')

    await user.click(within(rows[0]).getByRole('button', { name: /^Open Meeting room rental/ }))
    expect(screen.getByRole('dialog', { name: 'Meeting room rental' })).toBeInTheDocument()
  })

  it('lists import columns and preview rows, with the same field menus and switches', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(
      screen.getByLabelText(/Drop a CSV file here/),
      new File([invoicesSample], 'october.csv', { type: 'text/csv' }),
    )
    const columns = within(await screen.findByRole('list', { name: 'Columns in your file' })).getAllByRole(
      'listitem',
    )
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(columns[0]).toHaveTextContent('invoice_number')
    expect(within(columns[0]).getByRole('combobox', { name: 'Field for invoice_number' })).toHaveTextContent(
      'Invoice number',
    )
    expect(within(columns[0]).getByRole('switch', { name: 'Import invoice_number' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Reset matching' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    const rows = within(screen.getByRole('list', { name: 'Preview rows' })).getAllByRole('listitem')
    expect(rows).toHaveLength(4)
    expect(rows[0]).toHaveTextContent('Row 2')
    expect(rows[0]).toHaveTextContent('Valid')
  })
})

describe('Invoices on tablets (UX-7)', () => {
  it.each([
    [768, 'card list'],
    [1023, 'card list'],
    [1024, 'table'],
  ])('at %i px the invoice list is a %s', (width, layout) => {
    window.innerWidth = width
    renderApp('/invoices')
    if (layout === 'table') {
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.queryByRole('list', { name: 'Invoices' })).not.toBeInTheDocument()
    } else {
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(within(screen.getByRole('list', { name: 'Invoices' })).getAllByRole('listitem')).toHaveLength(10)
    }
  })

  it('other lists keep the table from 768 px', () => {
    window.innerWidth = 768
    renderApp('/expenses')
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
