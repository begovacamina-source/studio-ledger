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
    expect(screen.getByRole('combobox', { name: 'Field for paid_date' })).toHaveTextContent('Paid date')
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
    // The Overview's Outstanding list stops at the 10 most urgent and points to the rest.
    const outstanding = screen.getByText('Outstanding', { selector: '[data-slot=card-title]' }).closest('[data-slot=card]') as HTMLElement
    expect(within(outstanding).getAllByRole('row').slice(1)).toHaveLength(10)
    expect(within(outstanding).getByText(/The 10 most urgent of 12\./)).toBeInTheDocument()
    expect(within(outstanding).getByRole('link', { name: 'See all in Invoices' })).toHaveAttribute('href', '/invoices')
  })

  it('previews every row of the file, 10 per page', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.click(screen.getByRole('radio', { name: /Expenses/ }))
    const lines = Array.from({ length: 12 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')},${i + 1}.00,Office,Item ${i + 1}`)
    await user.upload(fileInput(), csv(['date,amount,category,description', ...lines].join('\n')))
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))

    expect(screen.getByRole('heading', { name: '12 rows in your file' })).toBeInTheDocument()
    const previewRows = () => within(screen.getAllByRole('table')[0]).getAllByRole('row').slice(1)
    expect(previewRows()).toHaveLength(10)
    expect(screen.getByText('Showing 1–10 of 12 rows')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Go to next page' }))
    expect(previewRows()).toHaveLength(2)
    expect(previewRows()[1]).toHaveTextContent('Item 12')
    expect(screen.getByRole('button', { name: 'Import 12 valid rows' })).toBeInTheDocument()
  })

  it('refuses a file that is not a CSV', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderApp('/import')
    await user.upload(fileInput(), new File(['x'], 'records.xlsx'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a .csv file.')
  })

  it('blocks the next step until required fields are matched', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.click(screen.getByRole('radio', { name: /Expenses/ }))
    await user.upload(fileInput(), csv('When,Cost,Kind\n2026-10-01,5.00,Office\n'))

    expect(await screen.findByText('Choose a column for Date.')).toBeInTheDocument()
    expect(screen.getByText('Choose a column for Amount.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    expect(screen.getByRole('button', { name: 'Preview records' })).toBeInTheDocument()

    // Unknown columns start switched off; switching one on asks for its field.
    expect(screen.getByRole('switch', { name: 'Import When' })).not.toBeChecked()
    expect(screen.getByRole('combobox', { name: 'Field for When' })).toHaveTextContent('Not imported')
    await user.click(screen.getByRole('switch', { name: 'Import When' }))
    expect(screen.getByText('Choose a field for When, or switch it off.')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Field for When' }))
    await user.click(await screen.findByRole('option', { name: 'Date' }))
    for (const [column, field] of [['Cost', 'Amount'], ['Kind', 'Category']]) {
      await user.click(screen.getByRole('switch', { name: `Import ${column}` }))
      await user.click(screen.getByRole('combobox', { name: `Field for ${column}` }))
      await user.click(await screen.findByRole('option', { name: field }))
    }
    expect(screen.queryByText(/Choose a (column|field) for/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Preview records' }))
    expect(screen.getByRole('button', { name: 'Import 1 valid row' })).toBeInTheDocument()
  })

  it('swaps two fields instead of matching one twice', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    await user.click(await screen.findByRole('combobox', { name: 'Field for issue_date' }))

    // Fields still on their automatic column carry no label.
    await user.click(await screen.findByRole('option', { name: 'Due date' }))
    expect(screen.getByRole('combobox', { name: 'Field for issue_date' })).toHaveTextContent('Due date')
    expect(screen.getByRole('combobox', { name: 'Field for due_date' })).toHaveTextContent('Issue date')
    expect(screen.queryByText('Before you continue:')).not.toBeInTheDocument()

    // A moved field says where it is now; picking it again swaps them back.
    await user.click(screen.getByRole('combobox', { name: 'Field for issue_date' }))
    await user.click(await screen.findByRole('option', { name: /^Issue date.*due_date$/ }))
    expect(screen.getByRole('combobox', { name: 'Field for issue_date' })).toHaveTextContent('Issue date')
    expect(screen.getByRole('combobox', { name: 'Field for due_date' })).toHaveTextContent('Due date')
  })

  it('the Import switch leaves a column out and brings its field back', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    const toggle = await screen.findByRole('switch', { name: 'Import paid_date' })
    expect(toggle).toBeChecked()

    await user.click(toggle)
    expect(screen.getByRole('combobox', { name: 'Field for paid_date' })).toHaveTextContent('Not imported')
    expect(screen.getByRole('combobox', { name: 'Field for paid_date' })).toBeDisabled()

    await user.click(toggle)
    expect(screen.getByRole('combobox', { name: 'Field for paid_date' })).toHaveTextContent('Paid date')
  })

  it('keeps required fields switched on, with a tooltip saying why', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    const locked = await screen.findByRole('switch', { name: 'Import invoice_number' })
    expect(locked).toBeChecked()
    expect(locked).toHaveAttribute('aria-disabled', 'true')

    // Hover before clicking: after a click Radix closes the tooltip, and hovering the
    // element the pointer is already on doesn't reliably open it again.
    await user.hover(locked)
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      "Invoice number is required for invoices. To import it from another column, choose Invoice number in that column's menu.",
    )
    await user.click(locked)
    expect(locked).toBeChecked()
    expect(screen.queryByText(/Choose a column for/)).not.toBeInTheDocument()
    // Optional fields can still be switched off.
    expect(screen.getByRole('switch', { name: 'Import paid_date' })).not.toHaveAttribute('aria-disabled')
  })

  it('resets the matching to what was matched automatically', async () => {
    const user = userEvent.setup()
    renderApp('/import')
    await user.upload(fileInput(), csv(invoicesSample))
    const reset = await screen.findByRole('button', { name: 'Reset matching' })
    expect(reset).toHaveAttribute('aria-disabled', 'true')

    await user.hover(reset)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Nothing to reset.')

    await user.click(screen.getByRole('switch', { name: 'Import description' }))
    await user.click(screen.getByRole('combobox', { name: 'Field for issue_date' }))
    await user.click(await screen.findByRole('option', { name: 'Due date' }))
    expect(reset).toHaveAttribute('aria-disabled', 'false')

    await user.hover(reset)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Undo your changes')
    await user.click(reset)

    expect(screen.getByRole('combobox', { name: 'Field for issue_date' })).toHaveTextContent('Issue date')
    expect(screen.getByRole('combobox', { name: 'Field for due_date' })).toHaveTextContent('Due date')
    expect(screen.getByRole('combobox', { name: 'Field for description' })).toHaveTextContent('Description')
    expect(screen.getByRole('switch', { name: 'Import description' })).toBeChecked()
    expect(reset).toHaveAttribute('aria-disabled', 'true')
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
