import type { Locator, Page } from '@playwright/test'
import { expect } from './fixtures.ts'

/**
 * What's wrong with the focus indicator on the focused element, or null if it's fine.
 * Fine means an outline or ring, on the element or a wrapper around it (a label that
 * shows its hidden input's focus), at least 3:1 against the background next to it.
 */
export function focusProblem(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null
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
    const backgroundOf = (node: Element) => {
      for (let n: Element | null = node.parentElement; n; n = n.parentElement) {
        const bg = getComputedStyle(n).backgroundColor
        if (bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg)) return bg
      }
      return 'rgb(255, 255, 255)'
    }
    const ratio = (color: string, bg: string) => {
      const a = luminance(paint('#fff', bg, color))
      const b = luminance(paint('#fff', bg))
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }
    const name = (n: Element) =>
      `<${n.tagName.toLowerCase()}${n.id ? `#${n.id}` : ''}> "${(n.getAttribute('aria-label') ?? n.textContent ?? '').trim().slice(0, 40)}"`
    let best = 0
    for (let n: Element | null = el, depth = 0; n && depth < 3; n = n.parentElement, depth++) {
      const css = getComputedStyle(n)
      const colors: string[] = []
      if (css.outlineStyle !== 'none' && parseFloat(css.outlineWidth) > 0) colors.push(css.outlineColor)
      if (css.boxShadow !== 'none') colors.push(...(css.boxShadow.match(/(rgba?|oklch|oklab|lab|color)\([^)]*\)/g) ?? []))
      for (const c of colors) best = Math.max(best, ratio(c, backgroundOf(n)))
    }
    return best >= 3 ? null : `${name(el)} has no focus indicator of 3:1 (best ${best.toFixed(2)}:1)`
  })
}

/** Presses Tab (or Shift+Tab) until `target` has focus, checking the focus indicator at every stop. */
export async function tabTo(page: Page, target: Locator, { back = false, max = 80 } = {}) {
  await expect(target).toBeVisible()
  for (let i = 0; i <= max; i++) {
    if (await target.evaluate((n) => n === document.activeElement)) return
    if (i === max) break
    await page.keyboard.press(back ? 'Shift+Tab' : 'Tab')
    expect(await focusProblem(page)).toBeNull()
  }
  throw new Error(`Tab didn't reach ${target} in ${max} presses`)
}

/**
 * Presses an arrow key the way a person does, holding it for a moment. Radix moves focus
 * (and checks a radio) a tick after keydown, which an instant press releases too early for.
 */
export const arrow = (page: Page, key: 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight') =>
  page.keyboard.press(key, { delay: 50 })

/** Opens a select with the keyboard and picks `option` with the arrow keys. */
export async function pick(page: Page, select: Locator, option: string | RegExp) {
  await tabTo(page, select)
  await page.keyboard.press('Enter')
  const wanted = page.getByRole('option', { name: option, exact: typeof option === 'string' })
  const focused = page.locator('[role="option"]:focus')
  const focusedText = () => focused.textContent()
  // Radix moves focus to the chosen option a moment after opening; wait for that before moving.
  const chosen = page.getByRole('option', { selected: true })
  await expect(await chosen.count() ? chosen : focused).toBeFocused()
  await page.keyboard.press('Home')
  await expect(page.getByRole('option').first()).toBeFocused()
  for (let i = 0; i < 30 && !(await wanted.evaluate((n) => n === document.activeElement)); i++) {
    const before = await focusedText()
    await arrow(page, 'ArrowDown')
    await expect.poll(focusedText).not.toBe(before)
  }
  await expect(wanted).toBeFocused()
  expect(await focusProblem(page)).toBeNull()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox')).toHaveCount(0)
}

/** Turns off CSS transitions, so focus rings are measured at their final colour. */
export const noTransitions = (page: Page) =>
  page.addInitScript(() => {
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style')
      style.textContent = '*, *::before, *::after { transition-duration: 0s !important; }'
      document.head.append(style)
    })
  })
