import path from 'node:path'
import { expect, keyFigures, test } from './fixtures.ts'

// The three core journeys from docs/PRD.md, end to end in a real browser.

test('1. Import records: the sample invoice file shows up on the Overview', async ({ page }) => {
  await page.goto('/import')
  await page
    .getByLabel(/Drop a CSV file here/)
    .setInputFiles(path.join(import.meta.dirname, '../public/samples/studio-ledger-invoices-sample.csv'))

  // Every column matched automatically.
  await expect(page.getByRole('combobox', { name: 'Field for amount' })).toHaveText('Amount')
  await page.getByRole('button', { name: 'Preview records' }).click()

  const summary = page.getByRole('region', { name: 'Summary' })
  await expect(summary).toContainText('Valid rows4')
  await expect(summary).toContainText('Rows with errors0')
  await expect(summary).toContainText('Duplicates0')
  await page.getByRole('button', { name: 'Import 4 valid rows' }).click()

  await expect(page.getByRole('heading', { name: '4 invoices imported' })).toBeVisible()
  await expect(page.getByText('New client: Harbour Light Theatre')).toBeVisible()
  await page.getByRole('link', { name: 'Go to Overview' }).click()

  // 3 unpaid invoices worth $3,800.00 join Outstanding; INV-102 (due 10-19) is overdue.
  await expect(keyFigures(page)).toContainText('$18,420.00')
  await expect(keyFigures(page)).toContainText('12 invoices · 7 overdue')
  // INV-101 was paid on 2026-10-12, inside Last 6 months.
  await expect(keyFigures(page)).toContainText('$48,610.00')

  // Importing the same file again adds nothing: every row is a duplicate.
  await page.goto('/import')
  await page
    .getByLabel(/Drop a CSV file here/)
    .setInputFiles(path.join(import.meta.dirname, '../public/samples/studio-ledger-invoices-sample.csv'))
  await page.getByRole('button', { name: 'Preview records' }).click()
  await expect(page.getByRole('region', { name: 'Summary' })).toContainText('Duplicates4')
  await expect(page.getByRole('button', { name: /^Import \d+ valid rows?$/ })).toHaveCount(0)
})

test('2. Understand the month: figures by period, and the chart', async ({ page }) => {
  await page.goto('/')

  // Opens on Last 6 months (May–October 2026).
  await expect(page.getByRole('combobox', { name: 'Period' })).toHaveText('Last 6 months')
  const cards = keyFigures(page)
  await expect(cards).toContainText('Received$47,160.00')
  await expect(cards).toContainText('Outstanding$14,620.00')
  await expect(cards).toContainText('9 invoices · 6 overdue')
  await expect(cards).toContainText('Expenses$10,154.67')
  await expect(cards).toContainText('Net income$37,005.33')

  // Last month is September: no income in August, so both changes are "—".
  await page.getByRole('combobox', { name: 'Period' }).click()
  await page.getByRole('option', { name: 'Last month' }).click()
  await expect(cards).toContainText('Received$13,230.00')
  await expect(cards).toContainText('Expenses$2,084.56')
  await expect(cards).toContainText('Net income$11,145.44')
  // Outstanding is a snapshot and doesn't follow the period.
  await expect(cards).toContainText('Outstanding$14,620.00')

  // Hovering the month shows its exact figures.
  await page.locator('.recharts-bar-rectangle').first().hover()
  const tooltip = page.locator('.recharts-tooltip-wrapper')
  await expect(tooltip).toContainText('September 2026')
  await expect(tooltip).toContainText('Received$13,230.00')
  await expect(tooltip).toContainText('Expenses$2,084.56')
  await expect(tooltip).toContainText('Net income$11,145.44')

  // The same numbers are in the chart's table for screen readers.
  const table = page.getByRole('table', { name: 'Received, Expenses and Net income per month' })
  await expect(table.getByRole('row', { name: /September 2026/ })).toContainText('$13,230.00$2,084.56$11,145.44')
})

test('3. Collect an unpaid invoice: mark it paid from Outstanding, undo, and redo', async ({ page }) => {
  await page.goto('/')
  const cards = keyFigures(page)
  await expect(cards).toContainText('$14,620.00')

  // The oldest overdue invoice, INV-002 for Lumen Coffee, leads the Outstanding list.
  await page.getByRole('button', { name: 'Lumen Coffee' }).first().click()
  const panel = page.getByRole('dialog', { name: /INV-002/ })
  await expect(panel).toContainText('Overdue · 179 days')

  await panel.getByRole('button', { name: 'Mark as paid' }).click()
  const dialog = page.getByRole('dialog', { name: 'Mark INV-002 as paid' })
  await expect(dialog.getByLabel('Paid date')).toHaveValue('2026-10-20')
  await dialog.getByRole('button', { name: 'Mark as paid' }).click()
  await expect(panel).toContainText('Paid')

  // Undo from the toast puts it back.
  const toasts = page.getByRole('region', { name: /Notifications/ })
  await toasts.getByRole('button', { name: 'Undo' }).click()
  await expect(panel).toContainText('Overdue · 179 days')

  // Mark it paid again and let it stand.
  await panel.getByRole('button', { name: 'Mark as paid' }).click()
  await page.getByRole('dialog', { name: 'Mark INV-002 as paid' }).getByRole('button', { name: 'Mark as paid' }).click()
  await page.keyboard.press('Escape')

  await expect(cards).toContainText('Outstanding$13,770.00')
  await expect(cards).toContainText('8 invoices · 5 overdue')
  // Paid today, so it counts in Received for October, inside Last 6 months.
  await expect(cards).toContainText('Received$48,010.00')

  // It's saved in the browser: still Paid after a reload.
  await page.reload()
  await expect(cards).toContainText('Outstanding$13,770.00')
})
