import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { InvoiceStatusBadge } from '@/components/invoice-status-badge'
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
import { displayStatus } from '@/lib/calculations'
import { clientInvoices, deleteBlockedReason, type ClientSummary } from '@/lib/clients'
import { daysBetween, formatDate, todayLocal } from '@/lib/dates'
import { plural } from '@/lib/format'
import { invoicePath } from '@/lib/invoice-form'
import { formatMoney } from '@/lib/money'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

function ClientDetails({ summary, onDeleted }: { summary: ClientSummary; onDeleted: () => void }) {
  const currency = useCurrency()
  const { ledger, deleteClient } = useLedger()
  const { client } = summary
  const today = todayLocal()
  const invoices = clientInvoices(ledger, client.id)
  const blocked = deleteBlockedReason(ledger, client.id)
  const figures: [string, string][] = [
    ['Received', formatMoney(summary.received, currency)],
    ['Outstanding', formatMoney(summary.outstanding, currency)],
  ]

  return (
    <>
      <SheetHeader className="gap-2 p-6 pr-12">
        <SheetTitle className="text-xl">{client.name}</SheetTitle>
        <SheetDescription>
          {plural(summary.invoiceCount, 'invoice')}
          {summary.overdueCount > 0 && ` · ${summary.overdueCount} overdue`}
        </SheetDescription>
        <dl className="grid grid-cols-2 gap-4 pt-2">
          {figures.map(([term, value]) => (
            <div key={term} className="grid gap-1">
              <dt className="text-sm text-muted-foreground">{term}</dt>
              <dd className="text-xl font-semibold text-foreground tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </SheetHeader>

      <section aria-labelledby="client-invoices" className="min-h-0 flex-1 overflow-y-auto px-6">
        <h3 id="client-invoices" className="mb-2 text-sm font-medium">
          Invoices
        </h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices for this client.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {invoices.map((invoice) => {
              const status = displayStatus(invoice, today)
              return (
                <li key={invoice.id} className="grid gap-1 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    {/* Opens the invoice in its own panel on the Invoices page. */}
                    <Link
                      to={invoicePath(invoice.invoiceNumber)}
                      className="rounded-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                    <span className="tabular-nums">{formatMoney(invoice.amount, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-muted-foreground">
                    <span>Due {formatDate(invoice.dueDate)}</span>
                    <InvoiceStatusBadge
                      status={status}
                      daysOverdue={status === 'Overdue' ? daysBetween(invoice.dueDate, today) : undefined}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Actions sit at the bottom, as in the invoice and expense panels. */}
      <SheetFooter className="p-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Trash2Icon /> Delete client
            </Button>
          </AlertDialogTrigger>
          {blocked ? (
            // A client with invoices can't be deleted: say why and how many, instead of asking.
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{client.name} can't be deleted yet</AlertDialogTitle>
                <AlertDialogDescription>{blocked}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Link to={`/invoices?q=${encodeURIComponent(client.name)}`}>Show their invoices</Link>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          ) : (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {client.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  {client.name} has no invoices, so no totals change. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    deleteClient(client.id)
                    toast.success(`${client.name} deleted`)
                    onDeleted()
                  }}
                >
                  Delete client
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </SheetFooter>
    </>
  )
}

/** A client's totals and invoices in a side panel over the client list. */
export function ClientSheet({
  summary,
  clientId,
  onClose,
}: {
  summary: ClientSummary | undefined
  clientId: string | undefined
  onClose: () => void
}) {
  // Keep showing the last client while the panel animates closed (also after a delete).
  const [lastShown, setLastShown] = useState(summary)
  if (summary && summary !== lastShown) setLastShown(summary)
  const shown = summary ?? (clientId === undefined ? lastShown : undefined)

  return (
    <Sheet open={clientId !== undefined} onOpenChange={(open) => !open && onClose()}>
      {/* Full width on phones, as the other panels. */}
      <SheetContent className="gap-4 data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        {shown ? (
          <ClientDetails summary={shown} onDeleted={onClose} />
        ) : (
          <SheetHeader className="p-6 pr-12">
            <SheetTitle>This client was not found</SheetTitle>
            <SheetDescription>It may have been deleted.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}
