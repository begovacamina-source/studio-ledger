import AxeBuilder from '@axe-core/playwright'
import { expect, keyFigures, test } from './fixtures.ts'

// A11Y-4, the automated half: what a screen reader reads on each screen. The other half,
// listening with VoiceOver, is in docs/screen-reader-check.md.

const PAGES = [
  ['/', 'Overview', ['Received and Expenses', 'Outstanding']],
  ['/invoices', 'Invoices', []],
  ['/clients', 'Clients', []],
  ['/expenses', 'Expenses', []],
  ['/import', 'Import CSV', []],
  ['/settings', 'Settings', ['Currency', 'Sample data', 'Your data']],
] as const

for (const [route, name, sections] of PAGES) {
  test(`${route}: named page, headings, and every control and table named`, async ({ page }) => {
    await page.goto(route)
    await expect(page).toHaveTitle(`${name} · Studio Ledger`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name)
    for (const section of sections) await expect(page.getByRole('heading', { level: 2, name: section })).toBeVisible()
    // Every table has a name (an aria-label, or the chart table's caption).
    for (const table of await page.getByRole('table').all()) await expect(table).toHaveAccessibleName(/\S/)
    // Names, labels and valid ARIA, the parts of axe a screen reader depends on.
    const { violations } = await new AxeBuilder({ page })
      .withRules([
        'button-name', 'link-name', 'label', 'select-name', 'input-button-name', 'aria-input-field-name',
        'aria-toggle-field-name', 'aria-command-name', 'aria-valid-attr', 'aria-valid-attr-value',
        'aria-allowed-attr', 'aria-required-attr', 'aria-required-children', 'aria-required-parent',
        'list', 'listitem', 'document-title', 'html-has-lang', 'landmark-one-main', 'page-has-heading-one',
      ])
      .analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([])
  })
}

test('moving to another page is announced', async ({ page }) => {
  await page.goto('/')
  const announcer = page.locator('[aria-live="polite"][aria-atomic="true"]')
  await expect(announcer).toHaveText('')
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Invoices' }).click()
  await expect(announcer).toHaveText('Invoices page')
  await expect(page).toHaveTitle('Invoices · Studio Ledger')
  // Opening a panel stays on the page, so it isn't announced as a new one (the panel takes focus).
  await page.getByRole('link', { name: 'INV-041' }).click()
  await expect(page.getByRole('dialog', { name: 'INV-041' })).toBeVisible()
  await expect(page).toHaveTitle('Invoices · Studio Ledger')
})

test('statuses are words, not colour: Outstanding, invoices, clients and the panel', async ({ page }) => {
  await page.goto('/')
  const outstanding = page.getByRole('table', { name: 'Outstanding invoices' })
  await expect(outstanding.getByRole('row', { name: /INV-002/ })).toContainText('Overdue · 179 days')
  await expect(keyFigures(page)).toContainText('9 invoices · 6 overdue')
  await page.goto('/invoices')
  const invoices = page.getByRole('table', { name: 'Invoices' })
  await expect(invoices.getByRole('row', { name: /^INV-041/ })).toContainText('Pending')
  await expect(invoices.getByRole('row', { name: /^INV-037/ })).toContainText('Paid')
  await page.goto('/invoices/INV-002')
  await expect(page.getByRole('dialog', { name: 'INV-002' })).toContainText('Overdue · 179 days')
})

test('form errors are on the field: invalid, described by the message, and focus moves to the first', async ({ page }) => {
  await page.goto('/invoices')
  await page.getByRole('button', { name: 'Add invoice' }).click()
  const form = page.getByRole('dialog', { name: 'Add invoice' })
  await form.getByRole('button', { name: 'Add invoice' }).click()
  const client = form.getByRole('combobox', { name: 'Client' })
  await expect(client).toBeFocused()
  await expect(client).toHaveAttribute('aria-invalid', 'true')
  await expect(client).toHaveAccessibleDescription('Choose a client or add a new one.')
  await expect(form.getByRole('textbox', { name: 'Amount (USD)' })).toHaveAccessibleDescription('Enter the amount.')

  await page.goto('/invoices/INV-002')
  await page.getByRole('dialog').getByRole('button', { name: 'Mark as paid' }).click()
  const markPaid = page.getByRole('dialog', { name: 'Mark INV-002 as paid' })
  await markPaid.getByLabel('Paid date').fill('2026-04-01')
  await markPaid.getByRole('button', { name: 'Mark as paid' }).click()
  // An alert is read out as soon as it appears.
  await expect(markPaid.getByRole('alert')).toHaveText('Paid date cannot be before the issue date.')
  await expect(markPaid.getByLabel('Paid date')).toHaveAccessibleDescription('Paid date cannot be before the issue date.')
})

test('changes are announced: search results, Mark as paid, the current import step', async ({ page }) => {
  await page.goto('/invoices')
  const count = page.locator('p[aria-live="polite"]', { hasText: /invoices?$/ })
  await expect(count).toHaveText('41 invoices')
  await page.getByRole('searchbox', { name: 'Search invoices' }).fill('lumen')
  await expect(count).toHaveText('6 invoices')

  await page.goto('/invoices/INV-002')
  const panel = page.getByRole('dialog', { name: 'INV-002' })
  await panel.getByRole('button', { name: 'Mark as paid' }).click()
  await page.getByRole('dialog', { name: 'Mark INV-002 as paid' }).getByRole('button', { name: 'Mark as paid' }).click()
  await expect(panel.getByRole('status')).toContainText('INV-002 marked as Paid')
  await expect(page.getByRole('region', { name: /Notifications/ })).toContainText('INV-002 marked as Paid')

  await page.goto('/import')
  await expect(page.getByRole('list', { name: 'Import steps' }).locator('[aria-current="step"]')).toContainText('Upload')
})
