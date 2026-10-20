import { InvoiceForm } from '@/components/invoices/invoice-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Invoice } from '@/lib/types'

/** The add and edit invoice form in a modal. */
export function InvoiceFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Invoice
  onSaved: (invoiceNumber: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-(--dialog-max-height) overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${editing.invoiceNumber}` : 'Add invoice'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Changes update every total right away.' : 'New invoices start as Pending.'}
          </DialogDescription>
        </DialogHeader>
        {/* Keyed so the form starts fresh each time it opens. */}
        {open && (
          <InvoiceForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onSaved={(invoiceNumber) => {
              onOpenChange(false)
              onSaved(invoiceNumber)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
