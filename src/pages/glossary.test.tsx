import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import { renderApp } from '@/test/render-app'

// UX-5: only glossary terms. The stored status "unpaid" and code names may use the word;
// nothing a person can read or hear may.
const BANNED = /\b(unpaid|revenue|billed|receivables?|payables?|accruals?|debits?|credits?|bookkeeping|profit|gross|fiscal)\b/i

/** Visible text plus what assistive tech reads: aria-labels, titles and placeholders. */
function everythingShown() {
  const attributes = [...document.querySelectorAll('[aria-label], [title], [placeholder], [alt]')].flatMap((el) =>
    ['aria-label', 'title', 'placeholder', 'alt'].map((a) => el.getAttribute(a) ?? ''),
  )
  return [document.body.textContent ?? '', ...attributes].join(' \n ')
}

describe('Glossary terms only (UX-5)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 20, 12))
  })
  afterEach(() => vi.useRealTimers())

  it.each(['/', '/invoices', '/invoices/INV-002', '/invoices/INV-001', '/clients', '/expenses', '/import', '/settings'])(
    '%s',
    (path) => {
      renderApp(path)
      expect(everythingShown()).not.toMatch(BANNED)
    },
  )

  it('empty states', () => {
    renderApp('/', { empty: true })
    expect(everythingShown()).not.toMatch(BANNED)
  })

  it('forms, confirmations, toasts and the import steps', async () => {
    const user = userEvent.setup()
    const invoices = renderApp('/invoices/INV-001')
    await user.click(screen.getByRole('button', { name: 'Mark as not paid' }))
    expect(everythingShown()).not.toMatch(BANNED)
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(everythingShown()).not.toMatch(BANNED)
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Mark as paid' }))
    expect(everythingShown()).not.toMatch(BANNED)

    invoices.unmount()
    const page = renderApp('/import')
    await user.upload(screen.getByLabelText(/Drop a CSV file here/), new File([invoicesSample], 'october.csv', { type: 'text/csv' }))
    expect(everythingShown()).not.toMatch(BANNED)
    await user.click(await screen.findByRole('button', { name: 'Preview records' }))
    expect(everythingShown()).not.toMatch(BANNED)
    await user.click(screen.getByRole('button', { name: 'Import 4 valid rows' }))
    expect(everythingShown()).not.toMatch(BANNED)
    page.unmount()
  })
})
