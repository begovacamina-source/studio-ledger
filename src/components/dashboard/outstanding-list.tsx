import { Link } from 'react-router'
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
import { invoicePath } from '@/lib/invoice-form'
import { formatMoney } from '@/lib/money'
import type { Currency } from '@/lib/types'

export function OutstandingList({
  rows,
  currency,
}: {
  rows: OutstandingRow[]
  currency: Currency
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding</CardTitle>
        <CardDescription>Who still owes you money, Overdue first</CardDescription>
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
                <TableRow key={row.invoice.id}>
                  <TableCell className="truncate">
                    <Link
                      to={invoicePath(row.invoice.invoiceNumber)}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {row.client?.name ?? 'Unknown client'}
                    </Link>
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
