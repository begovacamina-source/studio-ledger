import { ExpenseForm } from '@/components/expenses/expense-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Expense } from '@/lib/types'

/** The add and edit expense form in a modal. */
export function ExpenseFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Expense
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-(--dialog-max-height) overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit expense' : 'Add expense'}</DialogTitle>
          <DialogDescription>Expenses count in the month of their date.</DialogDescription>
        </DialogHeader>
        {/* Keyed so the form starts fresh each time it opens. */}
        {open && (
          <ExpenseForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onSaved={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
