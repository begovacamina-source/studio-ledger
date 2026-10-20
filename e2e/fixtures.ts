import { test as base, expect } from '@playwright/test'

/**
 * Every journey runs on 2026-10-20 at noon, local time, so Pending and Overdue
 * (and the sample's "9 invoices · 6 overdue") stay the same whenever CI runs.
 */
export const test = base.extend({
  // Named `provide`, not Playwright's usual `use`, so the linter doesn't take it for a React hook.
  page: async ({ page }, provide) => {
    await page.clock.setFixedTime(new Date('2026-10-20T12:00:00'))
    await provide(page)
  },
})

export { expect }

/** The four summary cards on the Overview, as one string. */
export const keyFigures = (page: import('@playwright/test').Page) =>
  page.getByRole('region', { name: 'Key figures' })
