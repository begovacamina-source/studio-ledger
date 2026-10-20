import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { renderApp } from '@/test/render-app'

describe('Settings and first use', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  const keyFigures = () => screen.getByRole('region', { name: 'Key figures' })

  it('a first visit opens on the sample data, with no banner', () => {
    renderApp('/', { firstVisit: true })
    expect(within(keyFigures()).getByText('$47,160.00')).toBeInTheDocument()
    expect(screen.queryByText(/sample data/i)).not.toBeInTheDocument()
  })

  it('Settings is an icon on the right of the top bar, not a main tab', async () => {
    const user = userEvent.setup()
    renderApp('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()

    const settings = screen.getByRole('link', { name: 'Settings' })
    await user.hover(settings)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Settings')
    await user.click(settings)
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(settings).toHaveAttribute('aria-current', 'page')
  })

  it('after clearing all data, a later visit stays empty', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/settings')
    await user.click(screen.getByRole('button', { name: 'Clear all data' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete everything' }))

    unmount()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'No records yet' })).toBeInTheDocument()
  })

  it('after clearing, the empty state offers Load sample data and the dashboard fills straight away', async () => {
    const user = userEvent.setup()
    renderApp('/', { empty: true })
    expect(screen.getByRole('heading', { name: 'No records yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Add invoice' })).toHaveAttribute('href', '/invoices?add=1')
    expect(screen.getByRole('link', { name: 'Import CSV' })).toBeInTheDocument()

    // Nothing to replace, so no confirmation.
    await user.click(screen.getByRole('button', { name: 'Load sample data' }))
    expect(within(keyFigures()).getByText('$47,160.00')).toBeInTheDocument()
  })

  it('shows first-use states on Invoices and Expenses', () => {
    renderApp('/invoices', { empty: true })
    expect(screen.getByRole('heading', { name: 'No invoices yet' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Load sample data' })).toHaveLength(1)
  })

  it('"Add invoice" from the empty dashboard opens the add form', async () => {
    const user = userEvent.setup()
    renderApp('/', { empty: true })
    await user.click(screen.getByRole('link', { name: 'Add invoice' }))
    expect(screen.getByRole('dialog', { name: 'Add invoice' })).toBeInTheDocument()
  })

  it('switching currency changes formatting only, and survives a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/settings')
    await user.click(screen.getByRole('radio', { name: /Euro/ }))
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(within(keyFigures()).getByText('€47,160.00')).toBeInTheDocument()

    // A "reload": render the app again from what's in browser storage.
    unmount()
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(within(keyFigures()).getByText('€47,160.00')).toBeInTheDocument()
  })

  it('formats BAM as 1.250,00 KM, with no conversion', () => {
    renderApp('/', { currency: 'BAM' })
    expect(within(keyFigures()).getByText('47.160,00 KM')).toBeInTheDocument()
  })

  it('records survive a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/invoices/INV-002')
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete invoice' }))

    unmount()
    render(
      <MemoryRouter initialEntries={['/invoices']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('tab', { name: 'All 40' })).toBeInTheDocument()
  })

  it('asks before replacing existing records with the sample', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    await user.click(screen.getByRole('button', { name: 'Load sample data' }))
    const confirm = screen.getByRole('alertdialog')
    expect(confirm).toHaveTextContent(
      'Your 6 clients, 41 invoices and 120 expenses will be replaced by the fictional sample',
    )
    await user.click(within(confirm).getByRole('button', { name: 'Replace with sample data' }))
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  it('clears all data after a confirmation that names what goes', async () => {
    const user = userEvent.setup()
    renderApp('/settings')
    await user.click(screen.getByRole('button', { name: 'Clear all data' }))
    const confirm = screen.getByRole('alertdialog')
    expect(confirm).toHaveTextContent('This deletes 6 clients, 41 invoices and 120 expenses from this browser.')
    await user.click(within(confirm).getByRole('button', { name: 'Delete everything' }))

    expect(screen.getByText(/You have no records\./)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear all data' })).toBeDisabled()
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    expect(screen.getByRole('heading', { name: 'No records yet' })).toBeInTheDocument()
  })
})
