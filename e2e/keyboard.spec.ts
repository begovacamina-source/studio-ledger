import path from 'node:path'
import { expect, keyFigures, test } from './fixtures.ts'
import { arrow, focusProblem, noTransitions, pick, tabTo } from './keyboard.ts'

// A11Y-2: every flow works by keyboard alone, with visible focus and no focus traps.
// No clicks here: only Tab, Shift+Tab, Enter, Space, arrows and Escape. Every Tab stop is
// checked for a focus indicator of at least 3:1 (see keyboard.ts).

const invoicesSample = path.join(import.meta.dirname, '../public/samples/studio-ledger-invoices-sample.csv')

test.beforeEach(async ({ page }) => noTransitions(page))

for (const route of ['/', '/invoices', '/clients', '/expenses', '/import', '/settings']) {
  test(`${route}: Tab goes through the whole page and out, with visible focus`, async ({ page }) => {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 }).or(keyFigures(page)).first()).toBeVisible()
    const seen: string[] = []
    for (let i = 0; i < 200; i++) {
      await page.keyboard.press('Tab')
      const id = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return null
        // Name each stop by its place in the page, so a repeat means Tab came round again.
        const at = [...document.querySelectorAll('*')].indexOf(el)
        return `${at}`
      })
      // Back at the start (or out to the browser): no trap.
      if (id === null || id === seen[0]) return
      expect(await focusProblem(page)).toBeNull()
      seen.push(id)
    }
    throw new Error(`Tab never left the page after ${seen.length} stops`)
  })
}

test('top bar: every page opens from the tabs and the Settings icon', async ({ page }) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Main' })
  for (const [tab, heading] of [
    ['Invoices', 'Invoices'],
    ['Clients', 'Clients'],
    ['Expenses', 'Expenses'],
    ['Import', 'Import CSV'],
    ['Overview', 'Overview'],
  ]) {
    await tabTo(page, nav.getByRole('link', { name: tab }), { back: tab === 'Overview' })
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
  }
  await tabTo(page, page.getByRole('link', { name: 'Settings' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible()
})

test('phone menu: opens, moves with arrows, and goes to a page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await tabTo(page, page.getByRole('button', { name: 'Open menu' }))
  await page.keyboard.press('Enter')
  const menu = page.getByRole('menu')
  await expect(menu.getByRole('menuitem', { name: 'Overview' })).toBeFocused()
  for (let i = 0; i < 3; i++) await arrow(page, 'ArrowDown')
  await expect(menu.getByRole('menuitem', { name: 'Expenses' })).toBeFocused()
  expect(await focusProblem(page)).toBeNull()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Expenses' })).toBeVisible()

  // Escape closes it without going anywhere.
  await tabTo(page, page.getByRole('button', { name: 'Open menu' }), { back: true })
  await page.keyboard.press('Enter')
  await expect(menu).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused()
})

test('Overview: change the period, then mark an Outstanding invoice paid and undo it', async ({ page }) => {
  await page.goto('/')
  await pick(page, page.getByRole('combobox', { name: 'Period' }), 'Last month')
  await expect(page.getByRole('combobox', { name: 'Period' })).toHaveText('Last month')
  await expect(keyFigures(page)).toContainText('Received$13,230.00')

  const opener = page.getByRole('button', { name: 'Lumen Coffee' }).first()
  await tabTo(page, opener)
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: /INV-002/ })
  await expect(panel).toContainText('Overdue · 179 days')

  await tabTo(page, panel.getByRole('button', { name: 'Mark as paid' }))
  await page.keyboard.press('Enter')
  const confirm = page.getByRole('dialog', { name: 'Mark INV-002 as paid' })
  await tabTo(page, confirm.getByRole('button', { name: 'Mark as paid' }))
  await page.keyboard.press('Enter')
  await expect(confirm).toHaveCount(0)
  await expect(panel).toContainText('Paid')

  // Undo is in the panel, since the panel keeps focus inside it.
  await tabTo(page, panel.getByRole('button', { name: 'Undo' }))
  await page.keyboard.press('Enter')
  await expect(panel).toContainText('Overdue · 179 days')

  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('Invoices: pages, status tabs, search, and open, edit and delete from the panel', async ({ page }) => {
  await page.goto('/invoices')
  const pages = page.getByRole('navigation', { name: 'Pages of invoices' })
  await tabTo(page, pages.getByRole('link', { name: '2' }))
  await page.keyboard.press('Enter')
  await expect(page.getByText('Showing 11–20 of 41 invoices')).toBeVisible()

  await tabTo(page, page.getByRole('tab', { selected: true }), { back: true })
  await arrow(page, 'ArrowRight')
  // Arrows move to the next status and show it straight away.
  const next = page.getByRole('tab', { selected: true })
  await expect(next).not.toHaveAccessibleName(/^All/)
  await expect(next).toBeFocused()
  await arrow(page, 'ArrowLeft')
  await expect(page.getByRole('tab', { name: /^All/ })).toHaveAttribute('aria-selected', 'true')

  await tabTo(page, page.getByRole('searchbox', { name: 'Search invoices' }))
  await page.keyboard.type('Lumen')
  const link = page.getByRole('link', { name: 'INV-002' })
  await tabTo(page, link)
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: /INV-002/ })
  await expect(panel).toBeVisible()

  await tabTo(page, panel.getByRole('button', { name: 'Edit' }))
  await page.keyboard.press('Enter')
  await tabTo(page, panel.getByRole('button', { name: 'Cancel' }))
  await page.keyboard.press('Enter')

  await tabTo(page, panel.getByRole('button', { name: 'Delete' }))
  await page.keyboard.press('Enter')
  const alert = page.getByRole('alertdialog')
  // Focus moves into the confirmation, on its safe choice.
  await expect(alert.getByRole('button', { name: 'Cancel' })).toBeFocused()
  // Once it has faded in (Radix ignores an Escape in its first ~50 ms, faster than anyone can press).
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
  // Escape cancels, and focus goes back to Delete.
  await page.keyboard.press('Escape')
  await expect(alert).toHaveCount(0)
  await expect(panel.getByRole('button', { name: 'Delete' })).toBeFocused()

  await page.keyboard.press('Enter')
  await tabTo(page, alert.getByRole('button', { name: 'Delete invoice' }))
  await page.keyboard.press('Enter')
  await expect(panel).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'INV-002' })).toHaveCount(0)
})

test('Add an invoice for a new client', async ({ page }) => {
  await page.goto('/invoices')
  await tabTo(page, page.getByRole('button', { name: 'Add invoice' }))
  await page.keyboard.press('Enter')
  const form = page.getByRole('dialog', { name: 'Add invoice' })
  await pick(page, form.getByRole('combobox', { name: 'Client' }), 'New client…')
  await tabTo(page, form.getByLabel('New client name'))
  await page.keyboard.type('Keyboard Studio')
  await tabTo(page, form.getByLabel('Invoice number'))
  await page.keyboard.type('INV-042')
  await tabTo(page, form.getByLabel(/^Amount/))
  await page.keyboard.type('500')
  // A date field's parts change with the arrow keys (their order depends on the browser's language).
  const due = form.getByLabel('Due date')
  // Up once on each part gives 1 January of the computer's real year (the fixed clock doesn't
  // reach the date field); once more on the year (last in both orders) makes it the next one,
  // after the issue date.
  await expect(due).toHaveValue('')
  await tabTo(page, due)
  for (const key of ['ArrowUp', 'ArrowRight', 'ArrowUp', 'ArrowRight', 'ArrowUp', 'ArrowUp'] as const) {
    await arrow(page, key)
  }
  await expect(due).toHaveValue(/^\d{4}-01-01$/)
  await tabTo(page, form.getByRole('button', { name: 'Add invoice' }))
  await page.keyboard.press('Enter')

  await expect(form).toHaveCount(0)
  const panel = page.getByRole('dialog', { name: /INV-042/ })
  await expect(panel).toContainText('Keyboard Studio')
  await expect(panel).toContainText('$500.00')
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
})

test('Expenses: filter, add, open and delete', async ({ page }) => {
  await page.goto('/expenses')
  await pick(page, page.getByRole('combobox', { name: 'Category' }), 'Software')
  await expect(page.getByRole('combobox', { name: 'Category' })).toHaveText('Software')

  await tabTo(page, page.getByRole('button', { name: 'Add expense' }).first(), { back: true })
  await page.keyboard.press('Enter')
  const form = page.getByRole('dialog', { name: 'Add expense' })
  await tabTo(page, form.getByLabel(/^Amount/))
  await page.keyboard.type('42.50')
  await pick(page, form.getByRole('combobox', { name: 'Category' }), 'Software')
  await tabTo(page, form.getByLabel(/^Description/))
  await page.keyboard.type('Keyboard test licence')
  await tabTo(page, form.getByRole('button', { name: 'Add expense' }))
  await page.keyboard.press('Enter')
  await expect(form).toHaveCount(0)

  await tabTo(page, page.getByRole('button', { name: /^Open Keyboard test licence/ }))
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: 'Keyboard test licence' })
  await expect(panel).toContainText('$42.50')
  await tabTo(page, panel.getByRole('button', { name: 'Delete' }))
  await page.keyboard.press('Enter')
  const alert = page.getByRole('alertdialog')
  await tabTo(page, alert.getByRole('button', { name: /^Delete/ }))
  await page.keyboard.press('Enter')
  await expect(panel).toHaveCount(0)
  await expect(page.getByText('Keyboard test licence')).toHaveCount(0)
})

test('Clients: open a client and its invoice, and back out with Escape', async ({ page }) => {
  await page.goto('/clients')
  await tabTo(page, page.getByRole('link', { name: 'Lumen Coffee' }))
  await page.keyboard.press('Enter')
  const panel = page.getByRole('dialog', { name: 'Lumen Coffee' })
  await expect(panel).toBeVisible()
  await tabTo(page, panel.getByRole('button', { name: /^Delete/ }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('alertdialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('alertdialog')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
})

test('Import: type, file, matching, switch, preview and import', async ({ page }) => {
  await page.goto('/import')
  // Tab lands on the chosen type; arrows change it.
  await tabTo(page, page.getByRole('radio', { name: /Invoices/ }))
  await arrow(page, 'ArrowDown')
  await expect(page.getByRole('radio', { name: /Expenses/ })).toBeChecked()
  await arrow(page, 'ArrowUp')
  await expect(page.getByRole('radio', { name: /Invoices/ })).toBeChecked()
  // The file field is reachable and shows focus; the system file picker it opens isn't
  // part of the page, so the file itself is set directly.
  const file = page.getByLabel(/Drop a CSV file here/)
  await tabTo(page, file)
  await file.setInputFiles(invoicesSample)

  const amount = page.getByRole('combobox', { name: 'Field for amount' })
  await expect(amount).toHaveText('Amount')
  await tabTo(page, amount)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('listbox')).toHaveCount(0)
  await expect(amount).toBeFocused()

  const description = page.getByRole('switch', { name: 'Import description' })
  await tabTo(page, description)
  await page.keyboard.press('Space')
  await expect(description).not.toBeChecked()
  await page.keyboard.press('Space')
  await expect(description).toBeChecked()

  await tabTo(page, page.getByRole('button', { name: 'Preview records' }))
  await page.keyboard.press('Enter')
  await tabTo(page, page.getByRole('button', { name: 'Import 4 valid rows' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: '4 invoices imported' })).toBeVisible()
  await tabTo(page, page.getByRole('link', { name: 'Go to Overview' }))
  await page.keyboard.press('Enter')
  await expect(keyFigures(page)).toContainText('$18,420.00')
})

test('Settings: currency with arrows, clear all data, and load the sample', async ({ page }) => {
  await page.goto('/settings')
  await tabTo(page, page.getByRole('radio', { name: /US dollar/ }))
  await arrow(page, 'ArrowDown')
  await expect(page.getByRole('radio', { name: /Euro/ })).toBeChecked()

  await tabTo(page, page.getByRole('button', { name: 'Clear all data' }))
  await page.keyboard.press('Enter')
  const alert = page.getByRole('alertdialog')
  await tabTo(page, alert.getByRole('button', { name: 'Delete everything' }))
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Clear all data' })).toBeDisabled()

  await tabTo(page, page.getByRole('button', { name: 'Load sample data' }), { back: true })
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Clear all data' })).toBeEnabled()
})
