import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { todayLocal } from '@/lib/dates'
import { validatePaidDate } from '@/lib/invoices'
import { formatMoney } from '@/lib/money'
import type { Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

export function MarkPaidDialog({ invoice, trigger }: { invoice: Invoice; trigger: ReactNode }) {
  const currency = useCurrency()
  const { markInvoicePaid } = useLedger()
  const [open, setOpen] = useState(false)
  const [paidDate, setPaidDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const errorId = useId()

  function handleOpenChange(next: boolean) {
    if (next) {
      setPaidDate(todayLocal())
      setError(null)
    }
    setOpen(next)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const message = validatePaidDate(invoice, paidDate)
    if (message) {
      setError(message)
      return
    }
    markInvoicePaid(invoice.id, paidDate)
    setOpen(false)
    toast.success(`${invoice.invoiceNumber} marked as Paid`)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Mark {invoice.invoiceNumber} as paid</DialogTitle>
            <DialogDescription>
              {formatMoney(invoice.amount, currency)} counts as Received on the paid date.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={inputId}>Paid date</Label>
            <Input
              id={inputId}
              type="date"
              value={paidDate}
              min={invoice.issueDate}
              onChange={(e) => {
                setPaidDate(e.target.value)
                setError(null)
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error && (
              <p id={errorId} role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Mark as paid</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
