import path from 'node:path'
import { expect, test } from './fixtures.ts'

// DATA-6: the app makes no network calls apart from loading its own files. Every request
// made while using each part of the app is recorded, and each must be to the app's origin.

test('every request goes to the app itself', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin
  const requests: string[] = []
  page.on('request', (request) => {
    // data: and blob: URLs never leave the browser.
    if (!/^(data|blob):/.test(request.url())) requests.push(request.url())
  })
  // WebSockets don't show up as requests.
  const sockets: string[] = []
  page.on('websocket', (socket) => sockets.push(socket.url()))

  await page.goto('/')
  await page.getByRole('combobox', { name: 'Period' }).click()
  await page.getByRole('option', { name: 'Last month' }).click()
  await page.locator('.recharts-bar-rectangle').first().hover()
  await page.getByRole('button', { name: 'Lumen Coffee' }).first().click()
  await page.getByRole('dialog', { name: /INV-002/ }).getByRole('button', { name: 'Mark as paid' }).click()
  await page.getByRole('dialog', { name: 'Mark INV-002 as paid' }).getByRole('button', { name: 'Mark as paid' }).click()
  await page.keyboard.press('Escape')

  for (const route of ['/invoices', '/invoices/INV-039', '/clients', '/expenses', '/settings']) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 }).or(page.getByRole('dialog')).first()).toBeVisible()
  }
  await page.getByRole('radio', { name: /Euro/ }).click()

  await page.goto('/invoices')
  await page.getByRole('button', { name: 'Add invoice' }).click()
  await page.getByRole('dialog', { name: 'Add invoice' }).getByRole('button', { name: 'Add invoice' }).click()
  await page.keyboard.press('Escape')

  await page.goto('/import')
  await page
    .getByLabel(/Drop a CSV file here/)
    .setInputFiles(path.join(import.meta.dirname, '../public/samples/studio-ledger-invoices-sample.csv'))
  await page.getByRole('button', { name: 'Preview records' }).click()
  await page.getByRole('button', { name: /^Import \d+ valid rows?$/ }).click()
  await expect(page.getByRole('heading', { name: /imported$/ })).toBeVisible()

  await page.goto('/settings')
  await page.getByRole('button', { name: 'Clear all data' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Delete everything' }).click()
  await page.getByRole('button', { name: 'Load sample data' }).click()
  await page.waitForLoadState('networkidle')

  const elsewhere = requests.filter((url) => new URL(url).origin !== origin)
  expect(elsewhere, 'requests to other hosts').toEqual([])
  expect(sockets).toEqual([])
  // The check saw real traffic: pages, scripts, styles and fonts.
  expect(requests.length).toBeGreaterThan(5)
  expect(requests.some((url) => /\.woff2(\?|$)/.test(url))).toBe(true)
})
