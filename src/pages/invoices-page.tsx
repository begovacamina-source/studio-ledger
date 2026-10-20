import { PlusIcon, SearchIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { InvoiceStatusBadge } from '@/components/invoice-status-badge'
import { InvoiceFormDialog } from '@/components/invoices/invoice-form-dialog'
import { InvoiceSheet } from '@/components/invoices/invoice-sheet'
import { MarkPaidDialog } from '@/components/invoices/mark-paid-dialog'
import { FirstUse } from '@/components/first-use'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate, todayLocal } from '@/lib/dates'
import {
  invoiceRows,
  matchesSearch,
  sortByNewest,
  STATUS_FILTERS,
  statusCounts,
  type StatusFilter,
} from '@/lib/invoices'
import { invoicePath } from '@/lib/invoice-form'
import { formatMoney } from '@/lib/money'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

function parseStatus(value: string | null): StatusFilter {
  const match = STATUS_FILTERS.find((s) => s.toLowerCase() === value)
  return match ?? 'All'
}

export function InvoicesPage() {
  const currency = useCurrency()
  const { ledger } = useLedger()
  const { invoiceNumber: openInvoice } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  // ?add=1 (from the dashboard's first-use state) opens the add form straight away.
  const [adding, setAdding] = useState(() => params.has('add'))
  useEffect(() => {
    if (!params.has('add')) return
    const rest = new URLSearchParams(params)
    rest.delete('add')
    setParams(rest, { replace: true })
  }, [params, setParams])
  const status = parseStatus(params.get('status'))
  const query = params.get('q') ?? ''
  const today = todayLocal()

  const searched = useMemo(
    () =>
      sortByNewest(invoiceRows(ledger.invoices, ledger.clients, today)).filter((r) =>
        matchesSearch(r, query),
      ),
    [ledger, today, query],
  )
  const counts = statusCounts(searched)
  const visible = status === 'All' ? searched : searched.filter((r) => r.status === status)

  // The open invoice lives in the path, so links and Back work; filters stay in the query.
  const openPanel = (invoiceNumber: string) => navigate(invoicePath(invoiceNumber) + search)
  const closePanel = () => navigate('/invoices' + search)

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, invoiceNumber: string) {
    // Ignore clicks on the row's own links and buttons, and clicks inside dialogs opened from it.
    const target = event.target as HTMLElement
    if (!event.currentTarget.contains(target) || target.closest('a, button')) return
    openPanel(invoiceNumber)
  }

  function update(next: { status?: StatusFilter; q?: string }) {
    const s = next.status ?? status
    const q = next.q ?? query
    const p = new URLSearchParams()
    if (s !== 'All') p.set('status', s.toLowerCase())
    if (q) p.set('q', q)
    setParams(p, { replace: true })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Button onClick={() => setAdding(true)}>
          <PlusIcon /> Add invoice
        </Button>
      </div>

      {ledger.invoices.length === 0 ? (
        <Card>
          <CardContent>
            <FirstUse title="No invoices yet">
              <Button onClick={() => setAdding(true)}>
                <PlusIcon /> Add invoice
              </Button>
            </FirstUse>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={status} onValueChange={(value) => update({ status: value as StatusFilter })}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList>
                {STATUS_FILTERS.map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {s} <span className="text-muted-foreground tabular-nums">{counts[s]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="relative w-full sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  aria-label="Search invoices"
                  placeholder="Search invoice number or client"
                  className="pl-8"
                  value={query}
                  onChange={(e) => update({ q: e.target.value })}
                />
              </div>
            </div>

            <TabsContent value={status} className="mt-4">
              <Card>
                <CardContent>
                  {visible.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        {status === 'All' ? 'No invoices' : `No ${status.toLowerCase()} invoices`}
                        {query && ` match "${query}"`}.
                      </p>
                      <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <Table className="min-w-[52rem] table-fixed">
                      {/* Fixed column widths keep every column in the same place on every tab. */}
                      <colgroup>
                        <col className="w-28" />
                        <col />
                        <col className="w-32" />
                        <col className="w-32" />
                        <col className="w-32" />
                        <col className="w-28" />
                        <col className="w-36" />
                      </colgroup>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Issue date</TableHead>
                          <TableHead>Due date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visible.map((row) => (
                          <TableRow
                            key={row.invoice.id}
                            className="cursor-pointer"
                            data-state={row.invoice.invoiceNumber === openInvoice ? 'selected' : undefined}
                            onClick={(e) => handleRowClick(e, row.invoice.invoiceNumber)}
                          >
                            <TableCell>
                              <Link
                                to={invoicePath(row.invoice.invoiceNumber) + search}
                                className="font-medium underline-offset-4 hover:underline"
                              >
                                {row.invoice.invoiceNumber}
                              </Link>
                            </TableCell>
                            <TableCell className="truncate">{row.client?.name ?? 'Unknown client'}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatMoney(row.invoice.amount, currency)}
                            </TableCell>
                            <TableCell>{formatDate(row.invoice.issueDate)}</TableCell>
                            <TableCell>{formatDate(row.invoice.dueDate)}</TableCell>
                            <TableCell>
                              <InvoiceStatusBadge status={row.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              {row.status !== 'Paid' && (
                                <MarkPaidDialog
                                  invoice={row.invoice}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      aria-label={`Mark ${row.invoice.invoiceNumber} as paid`}
                                    >
                                      Mark as paid
                                    </Button>
                                  }
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <InvoiceSheet
        invoiceNumber={openInvoice}
        onClose={closePanel}
        onNumberChange={(invoiceNumber) =>
          navigate(invoicePath(invoiceNumber) + search, { replace: true })
        }
      />
      <InvoiceFormDialog open={adding} onOpenChange={setAdding} onSaved={openPanel} />
    </div>
  )
}
