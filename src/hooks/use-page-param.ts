import { useLocation, useSearchParams } from 'react-router'
import { parsePage } from '@/lib/pagination'

/**
 * The list page kept in the URL (?page=2), next to the filters. A new page is a
 * new history entry, so Back returns to the page before; page 1 has no param.
 */
export function usePageParam() {
  const [params, setParams] = useSearchParams()
  const { pathname } = useLocation()
  const withPage = (page: number) => {
    const next = new URLSearchParams(params)
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    return next
  }
  return {
    page: parsePage(params.get('page')),
    setPage: (page: number) => setParams(withPage(page)),
    hrefFor: (page: number) => {
      const query = withPage(page).toString()
      return query ? `${pathname}?${query}` : pathname
    },
  }
}
