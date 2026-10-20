import { ArrowLeftIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { InvoiceStatusBadge } from '@/components/invoice-status-badge'
import { MarkPaidDialog } from '@/components/invoices/mark-paid-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { displayStatus } from '@/lib/calculations'
import { daysBetween, formatDate, todayLocal } from '@/lib/dates'
import { invoicePath } from '@/lib/invoice-form'
import { formatMoney } from '@/lib/money'
import { APP_CURRENCY } from '@/lib/settings'
import { useLedger } from '@/state/use-ledger'

function BackLink() {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2">
      <Link to="/invoices">
        <ArrowLeftIcon /> Invoices
      </Link>
    </Button>
  )
}

export function InvoiceDetailPage() {
  const { invoiceNumber } = useParams()
  const { ledger, markInvoiceNotPaid, deleteInvoice } = useLedger()
  const navigate = useNavigate()
  const invoice = ledger.invoices.find((i) => i.invoiceNumber === invoiceNumber)

  if (!invoice) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div role="alert" className="rounded-lg border bg-background p-6">
          <p className="font-medium">Invoice {invoiceNumber} was not found.</p>
          <p className="mt-1 text-sm text-muted-foreground">It may have been deleted.</p>
        </div>
      </div>
    )
  }

  const today = todayLocal()
  const status = displayStatus(invoice, today)
  const client = ledger.clients.find((c) => c.id === invoice.clientId)
  const details: [string, string][] = [
    ['Client', client?.name ?? 'Unknown client'],
    ['Issue date', formatDate(invoice.issueDate)],
    ['Due date', formatDate(invoice.dueDate)],
    ['Paid date', invoice.paidDate ? formatDate(invoice.paidDate) : '—'],
    ['Description', invoice.description ?? '—'],
  ]

  return (
    <div className="max-w-2xl space-y-4">
      <BackLink />
      <Card>
        <CardHeader className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl">
              <h1>{invoice.invoiceNumber}</h1>
            </CardTitle>
            <InvoiceStatusBadge
              status={status}
              daysOverdue={status === 'Overdue' ? daysBetween(invoice.dueDate, today) : undefined}
            />
          </div>
          <p className="text-3xl font-semibold tabular-nums">
            {formatMoney(invoice.amount, APP_CURRENCY)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[8rem_1fr]">
            {details.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-sm text-muted-foreground">{term}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3">
            {status === 'Paid' ? (
              <Button
                variant="outline"
                onClick={() => {
                  markInvoiceNotPaid(invoice.id)
                  toast.success(`${invoice.invoiceNumber} is no longer Paid`)
                }}
              >
                Mark as not paid
              </Button>
            ) : (
              <MarkPaidDialog invoice={invoice} trigger={<Button>Mark as paid</Button>} />
            )}
            <Button variant="outline" asChild>
              <Link to={`${invoicePath(invoice.invoiceNumber)}/edit`}>
                <PencilIcon /> Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2Icon /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {invoice.invoiceNumber}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {formatMoney(invoice.amount, APP_CURRENCY)} for{' '}
                    {client?.name ?? 'Unknown client'} is removed from every total. This can't be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => {
                      deleteInvoice(invoice.id)
                      toast.success(`${invoice.invoiceNumber} deleted`)
                      navigate('/invoices', { replace: true })
                    }}
                  >
                    Delete invoice
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
