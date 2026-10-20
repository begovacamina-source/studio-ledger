import { readFileSync } from 'node:fs'
import path from 'node:path'
import { expect, test } from './fixtures.ts'

// US-4.1: a downloadable sample CSV is provided for each record type.
for (const [type, file] of [
  ['Invoices', 'studio-ledger-invoices-sample.csv'],
  ['Expenses', 'studio-ledger-expenses-sample.csv'],
] as const) {
  test(`the ${type} sample CSV downloads`, async ({ page }) => {
    await page.goto('/import')
    await page.getByRole('radio', { name: new RegExp(type) }).click()
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('link', { name: new RegExp(`Download a sample ${type.toLowerCase()} CSV`) }).click(),
    ])
    expect(download.suggestedFilename()).toBe(file)
    const saved = readFileSync(await download.path(), 'utf8')
    expect(saved).toBe(readFileSync(path.join(import.meta.dirname, '../public/samples', file), 'utf8'))
  })
}
