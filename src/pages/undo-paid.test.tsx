import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderApp } from '@/test/render-app'

describe('Undo for marking paid (US-2.2)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
  })
  afterEach(() => vi.useRealTimers())

  const panel = (number: string) => screen.getByRole('dialog', { name: new RegExp(`^${number}`) })
  const toasts = () => screen.getByRole('region', { name: /Notifications/ })
  const row = (number: string) =>
    within(screen.getByRole('table')).getByRole('link', { name: number }).closest('tr')!

  it('undoes Mark as paid from the toast on the invoice list', async () => {
    // jsdom has no stylesheet, so the toaster's pointer-events-auto class can't apply here;
    // the browser check covers that.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderApp('/invoices')
    // INV-041 (Pending) is on the first page of the list.
    await user.click(within(row('INV-041')).getByRole('button', { name: 'Mark INV-041 as paid' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Mark INV-041 as paid' })).getByRole('button', { name: 'Mark as paid' }))
    expect(within(row('INV-041')).getByText('Paid')).toBeInTheDocument()

    await user.click(await within(toasts()).findByRole('button', { name: 'Undo' }))
    expect(await within(toasts()).findByText('INV-041 is no longer Paid')).toBeInTheDocument()
    expect(within(row('INV-041')).getByText('Pending')).toBeInTheDocument()
    // Back where it was, so the dashboard figures are too.
    await user.click(screen.getByRole('link', { name: 'Overview' }))
    const cards = screen.getByRole('region', { name: 'Key figures' })
    expect(within(cards).getByText('$14,620.00')).toBeInTheDocument()
    expect(within(cards).getByText('9 invoices · 5 overdue')).toBeInTheDocument()
  })

  it('undoes Mark as not paid from inside the panel, bringing back the paid date', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-001')
    await user.click(within(panel('INV-001')).getByRole('button', { name: 'Mark as not paid' }))
    expect(within(panel('INV-001')).getByText(/^Overdue/)).toBeInTheDocument()

    // The panel has its own Undo, reachable without leaving the panel.
    const status = within(panel('INV-001')).getByRole('status')
    expect(status).toHaveTextContent('INV-001 is no longer Paid')
    await user.click(within(status).getByRole('button', { name: 'Undo' }))

    expect(within(panel('INV-001')).getByText('Paid')).toBeInTheDocument()
    expect(within(panel('INV-001')).getByText('Apr 14, 2026')).toBeInTheDocument()
    expect(within(panel('INV-001')).queryByRole('status')).not.toBeInTheDocument()
    expect(await within(toasts()).findByText('INV-001 is Paid again')).toBeInTheDocument()
  })

  it('keyboard users keep their place: focus goes to Undo, then back to the status button', async () => {
    const user = userEvent.setup()
    renderApp('/invoices/INV-002')
    within(panel('INV-002')).getByRole('button', { name: 'Mark as paid' }).focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}') // submits with today's date

    const undo = within(within(panel('INV-002')).getByRole('status')).getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).toHaveFocus())
    await user.keyboard('{Enter}')
    await waitFor(() =>
      expect(within(panel('INV-002')).getByRole('button', { name: 'Mark as paid' })).toHaveFocus(),
    )
  })

  it("clicking the toast's Undo while a panel is open keeps the panel open", async () => {
    // See above: pointer-events on the toaster is checked in the browser.
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderApp('/invoices/INV-001')
    await user.click(within(panel('INV-001')).getByRole('button', { name: 'Mark as not paid' }))
    await user.click(await within(toasts()).findByRole('button', { name: 'Undo' }))
    expect(panel('INV-001')).toBeInTheDocument()
    expect(within(panel('INV-001')).getByText('Paid')).toBeInTheDocument()
  })

  it('a newer change replaces the older Undo', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    renderApp('/invoices/INV-001')
    await user.click(within(panel('INV-001')).getByRole('button', { name: 'Mark as not paid' }))
    await user.click(within(panel('INV-001')).getByRole('button', { name: 'Mark as paid' }))
    await user.click(within(screen.getByRole('dialog', { name: 'Mark INV-001 as paid' })).getByRole('button', { name: 'Mark as paid' }))

    // Only the latest toast offers Undo, and it undoes only the latest change.
    await waitFor(() => expect(within(toasts()).getAllByRole('button', { name: 'Undo' })).toHaveLength(1))
    await user.click(within(toasts()).getByRole('button', { name: 'Undo' }))
    expect(within(panel('INV-001')).getByText(/^Overdue/)).toBeInTheDocument()
  })

  it('offers Undo for 5 seconds, then both the toast and the panel button go', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    })
    vi.setSystemTime(new Date(2026, 9, 19, 12))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderApp('/invoices/INV-001')
    await user.click(within(panel('INV-001')).getByRole('button', { name: 'Mark as not paid' }))
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(2)

    await act(() => vi.advanceTimersByTimeAsync(4500))
    expect(screen.getAllByRole('button', { name: 'Undo' })).toHaveLength(2)
    await act(() => vi.advanceTimersByTimeAsync(1500))
    expect(screen.queryAllByRole('button', { name: 'Undo' })).toHaveLength(0)
    // Nothing was undone.
    expect(within(panel('INV-001')).getByText(/^Overdue/)).toBeInTheDocument()
  })
})
