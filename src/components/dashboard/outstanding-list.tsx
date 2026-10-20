import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

function StatusBadge({ row }: { row: OutstandingRow }) {
  const overdue = row.status === 'Overdue'
  return (
    <Badge
      variant="outline"
      className={cn(
        overdue
          ? 'border-status-overdue/30 bg-status-overdue/10 text-status-overdue'
          : 'border-status-pending/30 bg-status-pending/10 text-status-pending',
      )}
    >
      {overdue
        ? `Overdue · ${row.daysOverdue} ${row.daysOverdue === 1 ? 'day' : 'days'}`
        : 'Pending'}
    </Badge>
  )
}

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
          <Table>
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
                  <TableCell>
                    <div className="font-medium">{row.client?.name ?? 'Unknown client'}</div>
                    <div className="text-xs text-muted-foreground">{row.invoice.invoiceNumber}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(row.invoice.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="mb-1">{formatDate(row.invoice.dueDate)}</div>
                    <StatusBadge row={row} />
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
