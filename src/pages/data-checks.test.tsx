import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { loadSampleLedger } from '@/data/sample'
import { SETTINGS_KEY, writeLedger } from '@/lib/storage'
import { renderApp } from '@/test/render-app'

const SAVE_ERROR = "Your changes couldn't be saved in this browser. They'll be lost when you close the page."

describe('Saving, clearing and first render (DATA-3, DATA-7, UX-3)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const quotaFull = () =>
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })

  it('DATA-3: writeLedger reports when the browser refuses to save', () => {
    quotaFull()
    expect(writeLedger(loadSampleLedger())).toBe(SAVE_ERROR)
  })

  it('DATA-3: a change that cannot be saved shows the message once, and the app keeps working', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    quotaFull()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete invoice' }))
    const toasts = screen.getByRole('region', { name: /Notifications/ })
    expect(await within(toasts).findByText(SAVE_ERROR)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 40' })).toBeInTheDocument()

    // A second failed save doesn't repeat the warning.
    await user.click(screen.getByRole('link', { name: 'INV-041' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete invoice' }))
    expect(screen.getByRole('tab', { name: 'All 39' })).toBeInTheDocument()
    expect(within(toasts).getAllByText(SAVE_ERROR)).toHaveLength(1)
  })

  it('DATA-7: "Clear all data" keeps the chosen currency, also after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderApp('/settings', { currency: 'BAM' })
    await user.click(screen.getByRole('button', { name: 'Clear all data' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Your currency setting stays.')
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete everything' }))

    expect(screen.getByRole('radio', { name: /Convertible mark/ })).toBeChecked()
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY)!)).toEqual({ currency: 'BAM' })

    unmount()
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('radio', { name: /Convertible mark/ })).toBeChecked()
  })

  // Records are read from browser storage before the first render, so each view has its
  // data in that first render: no await, no waiting for anything to load.
  it.each([
    ['/', () => expect(within(screen.getByRole('region', { name: 'Key figures' })).getByText('$47,160.00')).toBeInTheDocument()],
    ['/invoices', () => expect(screen.getByRole('tab', { name: 'All 41' })).toBeInTheDocument()],
    ['/clients', () => expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(7)],
    ['/expenses', () => expect(screen.getByText('120 expenses · $11,770.14')).toBeInTheDocument()],
  ])('UX-3: %s shows its data in the first render', (path, check) => {
    renderApp(path)
    check()
    expect(screen.queryByRole('heading', { name: /No .* yet/ })).not.toBeInTheDocument()
  })
})
