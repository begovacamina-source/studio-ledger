import type { MouseEvent } from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { pageNumbers, type Page } from '@/lib/pagination'
import { cn } from '@/lib/utils'

/**
 * Below a long list: which rows are showing, and shadcn's pagination. Each page
 * is a real link (hrefFor), but clicks are handled in the app (onPageChange),
 * so the URL or in-memory page changes without reloading. Hidden on one page.
 */
export function ListPagination({
  page,
  noun,
  hrefFor,
  onPageChange,
}: {
  page: Page<unknown>
  /** Plural, for the label: "invoices", "expenses", "rows". */
  noun: string
  hrefFor: (page: number) => string
  onPageChange: (page: number) => void
}) {
  if (page.pageCount <= 1) return null
  const go = (to: number) => (event: MouseEvent) => {
    event.preventDefault()
    if (to >= 1 && to <= page.pageCount && to !== page.page) onPageChange(to)
  }
  const isFirst = page.page === 1
  const isLast = page.page === page.pageCount
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p className="text-sm text-muted-foreground tabular-nums">
        Showing {page.first}–{page.last} of {page.total} {noun}
      </p>
      <Pagination aria-label={`Pages of ${noun}`} className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={hrefFor(Math.max(1, page.page - 1))}
              aria-disabled={isFirst || undefined}
              className={cn(isFirst && 'pointer-events-none opacity-50')}
              onClick={go(page.page - 1)}
            />
          </PaginationItem>
          {pageNumbers(page.page, page.pageCount).map((p, i) => (
            <PaginationItem key={p === 'gap' ? `gap-${i}` : p}>
              {p === 'gap' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={hrefFor(p)}
                  isActive={p === page.page}
                  className="tabular-nums"
                  onClick={go(p)}
                >
                  {p}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href={hrefFor(Math.min(page.pageCount, page.page + 1))}
              aria-disabled={isLast || undefined}
              className={cn(isLast && 'pointer-events-none opacity-50')}
              onClick={go(page.page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
