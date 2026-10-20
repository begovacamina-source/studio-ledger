/** Long lists (invoices, expenses, import preview) show this many rows per page. */
export const PAGE_SIZE = 10

/** A page number from the URL: a whole number from 1 up, else page 1. */
export function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export interface Page<T> {
  items: T[]
  /** The page shown, moved back into range if the list got shorter. */
  page: number
  pageCount: number
  /** 1-based positions of the first and last row shown (0 and 0 for an empty list). */
  first: number
  last: number
  total: number
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(1, page), pageCount)
  const start = (current - 1) * size
  const shown = items.slice(start, start + size)
  return {
    items: shown,
    page: current,
    pageCount,
    first: shown.length ? start + 1 : 0,
    last: start + shown.length,
    total: items.length,
  }
}

/**
 * The page buttons to show: every page when there are 7 or fewer, otherwise
 * the first, the last and the current page with its neighbours, with gaps.
 */
export function pageNumbers(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const near = [page - 1, page, page + 1].filter((p) => p > 1 && p < pageCount)
  // Near the ends, show a few more pages instead of a gap of one.
  if (page <= 3) near.push(...[2, 3, 4].filter((p) => !near.includes(p)))
  if (page >= pageCount - 2) near.unshift(...[pageCount - 3, pageCount - 2, pageCount - 1].filter((p) => !near.includes(p)))
  const pages = [1, ...[...new Set(near)].sort((a, b) => a - b), pageCount]
  const result: (number | 'gap')[] = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) result.push('gap')
    result.push(p)
  })
  return result
}
