import { PlusIcon } from 'lucide-react'
import { useMemo, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { CardList, CardListItem, CardListLine } from '@/components/card-list'
import { ClientSheet } from '@/components/clients/client-sheet'
import { FirstUse } from '@/components/first-use'
import { ListPagination } from '@/components/list-pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePageParam } from '@/hooks/use-page-param'
import { clientSummaries } from '@/lib/clients'
import { todayLocal } from '@/lib/dates'
import { plural } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import { paginate } from '@/lib/pagination'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

const clientPath = (id: string) => `/clients/${encodeURIComponent(id)}`

export function ClientsPage() {
  const currency = useCurrency()
  const phone = useIsMobile()
  const pageParam = usePageParam()
  const { ledger } = useLedger()
  const { clientId: openId } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const today = todayLocal()

  const summaries = useMemo(() => clientSummaries(ledger, today), [ledger, today])
  const shown = paginate(summaries, pageParam.page)
  const open = summaries.find((s) => s.client.id === openId)

  // The open client lives in the path, like invoices, so links and Back work.
  const openPanel = (id: string) => navigate(clientPath(id) + search)
  const closePanel = () => navigate('/clients' + search)

  function handleRowClick(event: MouseEvent<HTMLElement>, id: string) {
    // The row's own link handles keyboard users; ignore clicks from inside dialogs.
    const target = event.target as HTMLElement
    if (!event.currentTarget.contains(target) || target.closest('a, button')) return
    openPanel(id)
  }

  const nameLink = (id: string, name: string, className = '') => (
    <Link
      to={clientPath(id) + search}
      className={`rounded-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${className}`}
    >
      {name}
    </Link>
  )

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>

      {summaries.length === 0 ? (
        <Card>
          <CardContent>
            <FirstUse title="No clients yet">
              <Button asChild>
                <Link to="/invoices?add=1">
                  <PlusIcon /> Add invoice
                </Link>
              </Button>
            </FirstUse>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            {phone ? (
              // On phones each client is two lines: name and Received, then invoices and Outstanding.
              <CardList aria-label="Clients">
                {shown.items.map((s) => (
                  <CardListItem
                    key={s.client.id}
                    selected={s.client.id === openId}
                    onClick={(e) => handleRowClick(e, s.client.id)}
                  >
                    <CardListLine>
                      {nameLink(s.client.id, s.client.name, 'min-w-0 truncate')}
                      <span className="shrink-0 tabular-nums">
                        {formatMoney(s.received, currency)} <span className="text-muted-foreground">received</span>
                      </span>
                    </CardListLine>
                    <CardListLine className="text-muted-foreground">
                      <span>{plural(s.invoiceCount, 'invoice')}</span>
                      <span className="shrink-0 tabular-nums">
                        {formatMoney(s.outstanding, currency)} outstanding
                      </span>
                    </CardListLine>
                  </CardListItem>
                ))}
              </CardList>
            ) : (
              <Table className="min-w-[40rem] table-fixed">
                <colgroup>
                  <col />
                  <col className="w-40" />
                  <col className="w-40" />
                  <col className="w-28" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Received</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shown.items.map((s) => (
                    <TableRow
                      key={s.client.id}
                      className="cursor-pointer"
                      data-state={s.client.id === openId ? 'selected' : undefined}
                      onClick={(e) => handleRowClick(e, s.client.id)}
                    >
                      <TableCell className="truncate">{nameLink(s.client.id, s.client.name)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(s.received, currency)}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(s.outstanding, currency)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{s.invoiceCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <ListPagination page={shown} noun="clients" hrefFor={pageParam.hrefFor} onPageChange={pageParam.setPage} />
          </CardContent>
        </Card>
      )}

      <ClientSheet summary={open} clientId={openId} onClose={closePanel} />
    </div>
  )
}
