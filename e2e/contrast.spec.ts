import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures.ts'

// A11Y-3, text: every text on every screen and state is at least 4.5:1 (3:1 for large text),
// checked with axe's color-contrast rule. Non-text contrast is in non-text-contrast.spec.ts.

async function textContrast(page: Page) {
  // Panels, dialogs and toasts fade in; measure once they're fully shown.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
  const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()
  return violations.flatMap((v) =>
    v.nodes.map((n) => `${n.target.join(' ')}: ${n.any.map((a) => a.message).join('; ')}`),
  )
}

const pages = ['/', '/invoices', '/invoices?status=overdue', '/clients', '/expenses', '/import', '/settings']

for (const width of [1280, 375]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } })

    for (const path of pages) {
      test(`page ${path}`, async ({ page }) => {
        await page.goto(path)
        await page.waitForLoadState('networkidle')
        expect(await textContrast(page)).toEqual([])
      })
    }

    test('invoice panels, Paid and Overdue', async ({ page }) => {
      await page.goto('/invoices/INV-001')
      await expect(page.getByRole('dialog', { name: /INV-001/ })).toBeVisible()
      expect(await textContrast(page)).toEqual([])
      await page.goto('/invoices/INV-039')
      await expect(page.getByRole('dialog', { name: /INV-039/ })).toBeVisible()
      expect(await textContrast(page)).toEqual([])
    })

    test('client and expense panels', async ({ page }) => {
      await page.goto('/clients')
      await page.getByRole('link', { name: 'Lumen Coffee' }).first().click()
      await expect(page.getByRole('dialog', { name: 'Lumen Coffee' })).toBeVisible()
      expect(await textContrast(page)).toEqual([])
      await page.goto('/expenses')
      await page.getByRole('button', { name: /^Open Meeting room rental/ }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      expect(await textContrast(page)).toEqual([])
    })

    test('form errors, confirmation dialog and toast', async ({ page }) => {
      await page.goto('/invoices')
      await page.getByRole('button', { name: 'Add invoice' }).click()
      await page.getByRole('dialog', { name: 'Add invoice' }).getByRole('button', { name: 'Add invoice' }).click()
      await expect(page.getByText('Enter an invoice number.')).toBeVisible()
      expect(await textContrast(page)).toEqual([])

      await page.goto('/invoices/INV-001')
      await page.getByRole('button', { name: 'Mark as not paid' }).click()
      await expect(page.getByRole('region', { name: /Notifications/ }).getByText('INV-001 is no longer Paid')).toBeVisible()
      expect(await textContrast(page)).toEqual([])
      await page.getByRole('dialog', { name: /INV-001/ }).getByRole('button', { name: 'Delete' }).click()
      await expect(page.getByRole('alertdialog')).toBeVisible()
      expect(await textContrast(page)).toEqual([])
    })

    test('import match and preview steps, with an error and a duplicate', async ({ page }) => {
      await page.goto('/import')
      const csv =
        'invoice_number,client,amount,issue_date,due_date,paid_date,description,VAT\n' +
        'INV-101,Northwind Studio,1450.00,2026-10-01,2026-10-15,2026-10-12,Autumn campaign,20%\n' +
        'INV-002,Lumen Coffee,850.00,2026-04-10,2026-04-24,,Menu design,20%\n' +
        'INV-105,Kestrel Type,abc,2026-10-15,2026-10-29,,Logo refresh,20%\n'
      await page.getByLabel(/Drop a CSV file here/).setInputFiles({ name: 'mixed.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
      await expect(page.getByRole('button', { name: 'Preview records' })).toBeVisible()
      expect(await textContrast(page)).toEqual([])
      await page.getByRole('button', { name: 'Preview records' }).click()
      await expect(page.getByText('Row 4: amount is not a number.')).toBeVisible()
      expect(await textContrast(page)).toEqual([])
    })

    test('empty state after clearing', async ({ page }) => {
      await page.goto('/settings')
      await page.getByRole('button', { name: 'Clear all data' }).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Delete everything' }).click()
      await page.goto('/')
      await expect(page.getByRole('heading', { name: 'No records yet' })).toBeVisible()
      expect(await textContrast(page)).toEqual([])
    })
  })
}
