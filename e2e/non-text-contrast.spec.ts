import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures.ts'

// A11Y-3, non-text: what identifies a control or its state, and the chart bars, is at
// least 3:1 against what's next to it. Field borders are left out: they follow shadcn's
// default, and fields are found by their visible labels and the focus ring. Colours are
// resolved in the browser (oklch and transparency included) by painting them on a canvas
// over their real background.

/** Contrast ratio between `color` painted over `background`, and `background` itself. */
async function ratio(page: Page, color: string, background: string) {
  return page.evaluate(
    ([fg, bg]) => {
      const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d')!
      const paint = (...colors: string[]) => {
        ctx.clearRect(0, 0, 1, 1)
        for (const c of colors) {
          ctx.fillStyle = c
          ctx.fillRect(0, 0, 1, 1)
        }
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      }
      const luminance = (rgb: number[]) => {
        const [r, g, b] = rgb.map((v) => {
          const c = v / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
      }
      const a = luminance(paint('#fff', bg, fg))
      const b = luminance(paint('#fff', bg))
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    },
    [color, background],
  )
}

/** The first non-transparent background behind an element. */
const backgroundOf = (el: Locator) =>
  el.evaluate((node) => {
    for (let n: Element | null = node.parentElement; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor
      if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg
    }
    return 'rgb(255, 255, 255)'
  })
const style = (el: Locator, prop: string) => el.evaluate((n, p) => getComputedStyle(n).getPropertyValue(p), prop)
/** The colour of a focus indicator: the outline if there is one, else the first coloured layer of box-shadow. */
const ringColor = (el: Locator) =>
  el.evaluate((n) => {
    const css = getComputedStyle(n)
    if (css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0) return css.outlineColor
    const shadow = css.boxShadow
    const colors = shadow.match(/(rgba?|oklch|oklab|color)\([^)]*\)/g) ?? []
    return colors.find((c) => !/,\s*0\)$|\/\s*0\)$/.test(c)) ?? 'transparent'
  })

async function expectAtLeast3(page: Page, label: string, color: string, background: string) {
  const r = await ratio(page, color, background)
  expect(r, `${label}: ${color} on ${background} is ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
}

test('radio buttons and switches, on and off', async ({ page }) => {
  await page.goto('/settings')
  for (const name of [/US dollar/, /Euro/]) {
    const radio = page.getByRole('radio', { name })
    await expectAtLeast3(page, `radio ${name} border`, await style(radio, 'border-top-color'), await backgroundOf(radio))
  }

  await page.goto('/import')
  const csv = 'invoice_number,client,amount,issue_date,due_date,paid_date,VAT\nINV-101,Northwind,1450.00,2026-10-01,2026-10-15,,20%\n'
  await page.getByLabel(/Drop a CSV file here/).setInputFiles({ name: 'x.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) })
  const off = page.getByRole('switch', { name: 'Import VAT' })
  const on = page.getByRole('switch', { name: 'Import paid_date' })
  await expect(off).not.toBeChecked()
  await expectAtLeast3(page, 'switch off', await style(off, 'background-color'), await backgroundOf(off))
  await expectAtLeast3(page, 'switch on', await style(on, 'background-color'), await backgroundOf(on))
})

test('focus rings on a button, a field and a link', async ({ page }) => {
  await page.goto('/invoices')
  // Keyboard focus, so :focus-visible applies.
  for (const target of [
    page.getByRole('button', { name: 'Add invoice' }),
    page.getByRole('searchbox', { name: 'Search invoices' }),
    page.getByRole('link', { name: 'INV-041' }),
  ]) {
    await target.focus()
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Tab')
    await expect(target).toBeFocused()
    // The ring fades in; measure it once it's fully shown.
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))
    await expectAtLeast3(page, `focus ring on ${await target.textContent() || 'search'}`, await ringColor(target), await backgroundOf(target))
  }
})

test('chart bars', async ({ page }) => {
  await page.goto('/')
  const bars = page.locator('.recharts-bar-rectangle path')
  // Bars are drawn after the chart measures itself.
  await expect(bars).not.toHaveCount(0)
  // Fills are CSS variables set on the chart. Resolve them on the chart itself, once Recharts
  // has drawn both series (it draws in animation frames).
  const resolveFills = () =>
    bars.evaluateAll((paths) => {
      const vars = new Set(paths.map((p) => p.getAttribute('fill')?.match(/var\((--[^)]+)\)/)?.[1]).filter(Boolean))
      const chart = paths[0]?.closest('[data-slot="chart"]')
      return chart ? [...vars].map((v) => getComputedStyle(chart).getPropertyValue(v!).trim()).filter(Boolean) : []
    })
  await expect.poll(resolveFills).toHaveLength(2)
  const fills = await resolveFills()
  for (const fill of fills) await expectAtLeast3(page, 'chart bar', fill, 'rgb(255, 255, 255)')
})

test('the selected status tab and the current page stand out from the others by 3:1', async ({ page }) => {
  await page.goto('/invoices')
  const selected = page.getByRole('tab', { selected: true })
  const other = page.getByRole('tab', { name: /^Paid/ })
  // The selected tab is marked by its darker text (its white fill on grey is a light extra).
  await expectAtLeast3(page, 'selected tab text vs another tab', await style(selected, 'color'), await style(other, 'color'))

  const nav = page.getByRole('navigation', { name: 'Main' })
  const current = nav.getByRole('link', { name: 'Invoices' })
  await expect(current).toHaveAttribute('aria-current', 'page')
  const notCurrent = nav.getByRole('link', { name: 'Clients' })
  await expectAtLeast3(page, 'current page link vs another link', await style(current, 'color'), await style(notCurrent, 'color'))
})
