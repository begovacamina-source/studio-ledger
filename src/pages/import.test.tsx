import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import { renderApp } from '@/test/render-app'

const csv = (text: string, name = 'records.csv') => new File([text], name, { type: 'text/csv' })

describe('CSV import', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  const fileInput = () => screen.getByLabelText(/Drop a CSV file here/)

  it('imports the invoice sample end to end and the dashboard shows it', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    expect(screen.getByRole('link', { name: /Download a sample invoices CSV/ })).toHaveAttribute(
      'href',
      '/samples/studio-ledger-invoices-sample.csv',
    )

    await user.upload(fileInput(), csv(invoicesSample, 'october.csv'))
    expect(await screen.findByText('october.csv · 4 rows · Invoices')).toBeInTheDocument()
    // Every column is switched on and matched, and no required field is missing.
    expect(screen.getByRole('switch', { name: 'Import paid_date' })).toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Field for paid_date' })).toHaveTextContent('Paid date')
    expect(screen.queryByText(/missing/)).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Date format' })).toHaveTextContent('YYYY-MM-DD')

    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    const summary = screen.getByRole('region', { name: 'Summary' })
    expect(within(summary).getByText('Valid rows').nextSibling).toHaveTextContent('4')

    await user.click(screen.getByRole('button', { name: 'Import 4 valid rows' }))
    expect(screen.getByRole('heading', { name: '4 invoices imported' })).toBeInTheDocument()
    expect(screen.getByText('No rows were skipped.')).toBeInTheDocument()
    expect(screen.getByText('New client: Harbour Light Theatre')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Go to Overview' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    // Outstanding was $14,620.00 (9 invoices, 6 overdue); the sample adds 3 unpaid invoices worth $3,800.00, and INV-102 (due 10-19) is overdue.
    expect(within(cards).getByText('$18,420.00')).toBeInTheDocument()
    expect(within(cards).getByText('12 invoices · 7 overdue')).toBeInTheDocument()
  })

  it('refuses a file that is not a CSV', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderApp('/import')
    await user.upload(fileInput(), new File(['x'], 'records.xlsx'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a .csv file.')
  })

  it('shows missing required fields above the table and fixes them row by row', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.click(screen.getByRole('radio', { name: /Expenses/ }))
    await user.upload(fileInput(), csv('When,Cost,Kind\n2026-10-01,5.00,Office\n'))

    // Nothing matched: every column is off and each required field is marked missing.
    expect(await screen.findByRole('switch', { name: 'Import When' })).not.toBeChecked()
    expect(screen.getAllByText('· missing')).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    expect(screen.getByRole('button', { name: 'Preview records' })).toBeInTheDocument()

    // Switching a column on asks for its field right there.
    await user.click(screen.getByRole('switch', { name: 'Import When' }))
    expect(screen.getByText('Choose a field, or turn this column off.')).toBeInTheDocument()
    await user.click(screen.getByRole('combobox', { name: 'Field for When' }))
    await user.click(await screen.findByRole('option', { name: 'Date' }))
    expect(screen.queryByText('Choose a field, or turn this column off.')).not.toBeInTheDocument()

    for (const [column, field] of [['Cost', 'Amount'], ['Kind', 'Category']]) {
      await user.click(screen.getByRole('switch', { name: `Import ${column}` }))
      await user.click(screen.getByRole('combobox', { name: `Field for ${column}` }))
      await user.click(await screen.findByRole('option', { name: field }))
    }
    expect(screen.queryByText('· missing')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    expect(screen.getByRole('button', { name: 'Import 1 valid row' })).toBeInTheDocument()
  })

  it('picking a field another column uses moves it and turns that column off', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    await user.click(await screen.findByRole('combobox', { name: 'Field for description' }))
    await user.click(await screen.findByRole('option', { name: 'Client' }))

    expect(screen.getByRole('switch', { name: 'Import client' })).not.toBeChecked()
    expect(screen.queryByText(/missing|Choose a field/)).not.toBeInTheDocument()
  })

  it('leaves unknown columns off', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    // An extra header with no values in the rows.
    await user.upload(fileInput(), csv(invoicesSample.replace('description', 'description,VAT')))
    expect(await screen.findByRole('switch', { name: 'Import VAT' })).not.toBeChecked()
    expect(screen.getByText('Not imported')).toBeInTheDocument()
  })

  it('reports errors and duplicates, and imports only the valid rows', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.click(screen.getByRole('radio', { name: /Expenses/ }))
    await user.upload(
      fileInput(),
      csv(
        'date,amount,category,description\n' +
          '2026-10-01,12.00,Office,Notebooks\n' +
          '2026-10-02,ten,Office,Pens\n' +
          '2026-04-01,54.99,Software,Figma subscription\n',
      ),
    )
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))

    expect(screen.getByText('Row 3: amount is not a number.')).toBeInTheDocument()
    expect(screen.getByText(/1 duplicate will be skipped/)).toBeInTheDocument()
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map((r) => within(r).getAllByRole('cell').at(-1)!.textContent)).toEqual([
      'Valid',
      'Error',
      'Duplicate',
    ])

    await user.click(screen.getByRole('button', { name: 'Import 1 valid row' }))
    expect(screen.getByRole('heading', { name: '1 expense imported' })).toBeInTheDocument()
    expect(screen.getByText('2 rows skipped (errors or duplicates).')).toBeInTheDocument()
  })

  it('cancel goes back to upload without importing', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))
    await user.click(screen.getByRole('button', { name: 'Cancel and fix the file' }))
    expect(fileInput()).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Invoices' }))
    expect(screen.getByRole('tab', { name: 'All 41' })).toBeInTheDocument()
  })
})
