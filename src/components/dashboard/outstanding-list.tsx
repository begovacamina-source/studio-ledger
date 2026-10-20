import { InvoiceStatusBadge } from '@/components/invoice-status-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OutstandingRow } from '@/lib/calculations'
import { formatDate } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import type { Currency } from '@/lib/types'

export function OutstandingList({
  rows,
  currency,
  openInvoice,
  onOpen,
}: {
  rows: OutstandingRow[]
  currency: Currency
  /** The invoice open in the side panel, if any. */
  openInvoice: string | undefined
  onOpen: (invoiceNumber: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding</CardTitle>
        <CardDescription>Who still owes you money</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing outstanding. Every invoice is Paid.
          </p>
        ) : (
          <Table className="min-w-[26rem] table-fixed">
            <colgroup>
              <col />
              <col className="w-24" />
              <col className="w-36" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Due date and status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.invoice.id}
                  className="cursor-pointer"
                  data-state={row.invoice.invoiceNumber === openInvoice ? 'selected' : undefined}
                  onClick={() => onOpen(row.invoice.invoiceNumber)}
                >
                  <TableCell className="truncate">
                    {/* The whole row opens the invoice; this button makes it reachable by keyboard. */}
                    <button
                      type="button"
                      className="max-w-full truncate rounded-sm text-left font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {row.client?.name ?? 'Unknown client'}
                    </button>
                    <div className="text-xs text-muted-foreground">{row.invoice.invoiceNumber}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.invoice.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="mb-1">{formatDate(row.invoice.dueDate)}</div>
                    <InvoiceStatusBadge status={row.status} daysOverdue={row.daysOverdue} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
