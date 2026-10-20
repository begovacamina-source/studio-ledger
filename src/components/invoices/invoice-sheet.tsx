import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { usePaidActions } from '@/hooks/use-paid-actions'
import { displayStatus } from '@/lib/calculations'
import { daysBetween, formatDate, todayLocal } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import type { Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'
import { useUndo } from '@/state/use-undo'

function InvoiceDetails({
  invoice,
  onNumberChange,
  onDeleted,
  footer,
}: {
  invoice: Invoice
  onNumberChange: (invoiceNumber: string) => void
  onDeleted: () => void
  footer?: ReactNode
}) {
  const currency = useCurrency()
  const { ledger, deleteInvoice } = useLedger()
  const { markNotPaid } = usePaidActions()
  const { pending, undo } = useUndo()
  const offered = pending?.key === invoice.id
  const undoRef = useRef<HTMLButtonElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  // Keyboard users keep their place: focus goes to Undo while it's offered, then back
  // to the status button once it's used or expires (unless focus has moved on).
  useEffect(() => {
    if (offered) undoRef.current?.focus()
    else if (document.activeElement === document.body) statusRef.current?.querySelector('button')?.focus()
  }, [offered])
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
      <SheetHeader className="gap-2 p-6 pr-12">
        <div className="flex items-center gap-2">
          <SheetTitle className="text-xl">{invoice.invoiceNumber}</SheetTitle>
          <InvoiceStatusBadge
            status={status}
            daysOverdue={status === 'Overdue' ? daysBetween(invoice.dueDate, today) : undefined}
          />
        </div>
        <SheetDescription className="sr-only">Invoice details</SheetDescription>
        <p className="text-2xl font-semibold text-foreground tabular-nums">
          {formatMoney(invoice.amount, currency)}
        </p>
      </SheetHeader>

      <dl className="grid grid-cols-(--details-columns) gap-x-4 gap-y-3 px-6">
        {details.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Actions sit at the bottom: the status change on top, then Edit and Delete. */}
      <SheetFooter className="p-6">
        {/* The same Undo as the toast, inside the panel so keyboard users can reach it. */}
        {offered && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-md bg-muted px-3 py-2 text-sm"
          >
            <span>{pending.message}</span>
            <Button ref={undoRef} variant="outline" size="sm" onClick={undo}>
              Undo
            </Button>
          </div>
        )}
        <div ref={statusRef} className="contents">
          {status === 'Paid' ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => markNotPaid(invoice)}
            >
              Mark as not paid
            </Button>
          ) : (
            <MarkPaidDialog invoice={invoice} trigger={<Button className="w-full">Mark as paid</Button>} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilIcon /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Trash2Icon /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {invoice.invoiceNumber}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {formatMoney(invoice.amount, currency)} for {client?.name ?? 'Unknown client'}{' '}
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
        {footer}
      </SheetFooter>

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
  footer,
}: {
  /** The open invoice, or undefined when the panel is closed. */
  invoiceNumber: string | undefined
  onClose: () => void
  onNumberChange: (invoiceNumber: string) => void
  /** Shown at the bottom of the panel, e.g. a link to the invoice list. */
  footer?: ReactNode
}) {
  const { ledger } = useLedger()
  const invoice = ledger.invoices.find((i) => i.invoiceNumber === invoiceNumber)
  // Keep showing the last invoice while the panel animates closed (also after a delete).
  const [lastShown, setLastShown] = useState(invoice)
  if (invoice && invoice !== lastShown) setLastShown(invoice)
  const shown = invoice ?? (invoiceNumber === undefined ? lastShown : undefined)
  // What had focus when the panel opened, so closing can return to it (A11Y-2).
  const opener = useRef<Element | null>(null)

  return (
    <Sheet open={invoiceNumber !== undefined} onOpenChange={(open) => !open && onClose()}>
      {/* Full width on phones. The side-scoped classes replace shadcn's ¾ width and narrower cap. */}
      <SheetContent
        className="gap-4 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        onOpenAutoFocus={() => {
          opener.current = document.activeElement
        }}
        onCloseAutoFocus={(event) => {
          // Marking paid and undoing redraws an Outstanding row, so its button is a new one.
          if (opener.current?.isConnected || !shown) return
          const replacement = document.querySelector<HTMLElement>(
            `[data-invoice-opener="${CSS.escape(shown.invoiceNumber)}"]`,
          )
          if (replacement) {
            event.preventDefault()
            replacement.focus()
          }
        }}
      >
        {shown ? (
          <InvoiceDetails invoice={shown} onNumberChange={onNumberChange} onDeleted={onClose} footer={footer} />
        ) : (
          <>
            <SheetHeader className="p-6 pr-12">
              <SheetTitle>Invoice {invoiceNumber} was not found</SheetTitle>
              <SheetDescription>It may have been deleted.</SheetDescription>
            </SheetHeader>
            {footer && <SheetFooter className="p-6">{footer}</SheetFooter>}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
