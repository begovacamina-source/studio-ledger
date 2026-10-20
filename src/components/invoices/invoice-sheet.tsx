import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { InvoiceStatusBadge } from '@/components/invoice-status-badge'
import { InvoiceFormDialog } from '@/components/invoices/invoice-form-dialog'
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { displayStatus } from '@/lib/calculations'
import { daysBetween, formatDate, todayLocal } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { APP_CURRENCY } from '@/lib/settings'
import type { Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'

function InvoiceDetails({
  invoice,
  onNumberChange,
  onDeleted,
}: {
  invoice: Invoice
  onNumberChange: (invoiceNumber: string) => void
  onDeleted: () => void
}) {
  const { ledger, markInvoiceNotPaid, deleteInvoice } = useLedger()
  const [editing, setEditing] = useState(false)
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
    <>
      <SheetHeader className="gap-3 border-b pr-12">
        <SheetTitle className="text-xl">{invoice.invoiceNumber}</SheetTitle>
        <SheetDescription className="sr-only">Invoice details</SheetDescription>
        <div className="flex items-center justify-between gap-4">
          <InvoiceStatusBadge
            status={status}
            daysOverdue={status === 'Overdue' ? daysBetween(invoice.dueDate, today) : undefined}
          />
          <p className="text-2xl font-semibold tabular-nums">
            {formatMoney(invoice.amount, APP_CURRENCY)}
          </p>
        </div>
      </SheetHeader>

      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 px-4">
        {details.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-wrap gap-3 border-t p-4">
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
        <Button variant="outline" onClick={() => setEditing(true)}>
          <PencilIcon /> Edit
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
                {formatMoney(invoice.amount, APP_CURRENCY)} for {client?.name ?? 'Unknown client'}{' '}
                is removed from every total. This can't be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  deleteInvoice(invoice.id)
                  toast.success(`${invoice.invoiceNumber} deleted`)
                  onDeleted()
                }}
              >
                Delete invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <InvoiceFormDialog
        open={editing}
        onOpenChange={setEditing}
        editing={invoice}
        onSaved={(invoiceNumber) => {
          if (invoiceNumber !== invoice.invoiceNumber) onNumberChange(invoiceNumber)
        }}
      />
    </>
  )
}

/** Invoice details in a side panel over the invoice table. */
export function InvoiceSheet({
  invoiceNumber,
  onClose,
  onNumberChange,
}: {
  /** The open invoice, or undefined when the panel is closed. */
  invoiceNumber: string | undefined
  onClose: () => void
  onNumberChange: (invoiceNumber: string) => void
}) {
  const { ledger } = useLedger()
  const invoice = ledger.invoices.find((i) => i.invoiceNumber === invoiceNumber)
  // Keep showing the last invoice while the panel animates closed (also after a delete).
  const [lastShown, setLastShown] = useState(invoice)
  if (invoice && invoice !== lastShown) setLastShown(invoice)
  const shown = invoice ?? (invoiceNumber === undefined ? lastShown : undefined)

  return (
    <Sheet open={invoiceNumber !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-6 sm:max-w-md">
        {shown ? (
          <InvoiceDetails invoice={shown} onNumberChange={onNumberChange} onDeleted={onClose} />
        ) : (
          <SheetHeader>
            <SheetTitle>Invoice {invoiceNumber} was not found</SheetTitle>
            <SheetDescription>It may have been deleted.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}
