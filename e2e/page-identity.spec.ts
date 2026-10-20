import { expect, test } from './fixtures.ts'

// DEP-4: the page title, description and icons identify Studio Ledger.
test('title, description and icons identify Studio Ledger', async ({ page, request }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Studio Ledger')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^Studio Ledger is a finance dashboard/)

  for (const [selector, type] of [
    ['link[rel="icon"][type="image/svg+xml"]', 'image/svg+xml'],
    ['link[rel="icon"][type="image/png"]', 'image/png'],
    ['link[rel="apple-touch-icon"]', 'image/png'],
  ]) {
    const href = await page.locator(selector).getAttribute('href')
    const response = await request.get(href!)
    expect(response.ok(), `${href} loads`).toBe(true)
    expect(response.headers()['content-type']).toContain(type)
  }
  // The SVG is Studio Ledger's own icon, not Vite's.
  const svg = await (await request.get('/favicon.svg')).text()
  expect(svg).toContain('<title>Studio Ledger</title>')
})
