import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { pageNumbers, paginate, parsePage } from '@/lib/pagination'

describe('pagination', () => {
  const SAMPLE = loadSampleLedger()

  it('reads the page from the URL, falling back to page 1', () => {
    expect(parsePage('3')).toBe(3)
    for (const value of [null, '', '0', '-2', '1.5', 'two']) expect(parsePage(value)).toBe(1)
  })

  it('splits the sample expenses into pages of 10', () => {
    const third = paginate(SAMPLE.expenses, 3)
    expect(third.pageCount).toBe(12)
    expect(third.items).toEqual(SAMPLE.expenses.slice(20, 30))
    expect([third.first, third.last, third.total]).toEqual([21, 30, 120])
  })

  it('shows a short last page, and moves a page past the end back to the last one', () => {
    const last = paginate(SAMPLE.invoices, 9)
    expect(last.page).toBe(5)
    expect(last.items).toHaveLength(1)
    expect([last.first, last.last, last.total]).toEqual([41, 41, 41])
  })

  it('gives an empty list one empty page', () => {
    expect(paginate([], 2)).toEqual({ items: [], page: 1, pageCount: 1, first: 0, last: 0, total: 0 })
  })

  it('lists every page up to 7, then the ends and the current page with gaps', () => {
    expect(pageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageNumbers(1, 12)).toEqual([1, 2, 3, 4, 'gap', 12])
    expect(pageNumbers(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    expect(pageNumbers(12, 12)).toEqual([1, 'gap', 9, 10, 11, 12])
  })
})
