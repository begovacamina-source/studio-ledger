import { PencilIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatDate } from '@/lib/dates'
import { expenseTitle } from '@/lib/expense-form'
import { formatMoney } from '@/lib/money'
import type { Expense } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

function ExpenseDetails({ expense, onDeleted }: { expense: Expense; onDeleted: () => void }) {
  const currency = useCurrency()
  const { deleteExpense } = useLedger()
  const [editing, setEditing] = useState(false)
  const amount = formatMoney(expense.amount, currency)
  const details: [string, string][] = [
    ['Date', formatDate(expense.date)],
    ['Category', expense.category],
    ['Description', expense.description ?? '—'],
  ]

  return (
    <>
      <SheetHeader className="gap-2 p-6 pr-12">
        <div className="flex items-center gap-2">
          <SheetTitle className="text-xl">{expenseTitle(expense)}</SheetTitle>
          <Badge variant="secondary">{expense.category}</Badge>
        </div>
        <SheetDescription className="sr-only">Expense details</SheetDescription>
        <p className="text-2xl font-semibold text-foreground tabular-nums">{amount}</p>
        <div className="flex flex-wrap gap-2 pt-2">
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
                <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
                <AlertDialogDescription>
                  {amount} for {expenseTitle(expense)} on {formatDate(expense.date)} is removed from
                  every total. This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    deleteExpense(expense.id)
                    toast.success(`${amount} expense deleted`)
                    onDeleted()
                  }}
                >
                  Delete expense
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetHeader>

      <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 px-6">
        {details.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="break-words">{value}</dd>
          </div>
        ))}
      </dl>

      <ExpenseFormDialog open={editing} onOpenChange={setEditing} editing={expense} />
    </>
  )
}

/** Expense details in a side panel over the expense table. */
export function ExpenseSheet({ expenseId, onClose }: { expenseId: string | undefined; onClose: () => void }) {
  const { ledger } = useLedger()
  const expense = ledger.expenses.find((e) => e.id === expenseId)
  // Keep showing the last expense while the panel animates closed (also after a delete).
  const [lastShown, setLastShown] = useState(expense)
  if (expense && expense !== lastShown) setLastShown(expense)
  const shown = expense ?? (expenseId === undefined ? lastShown : undefined)

  return (
    <Sheet open={expenseId !== undefined} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-4 sm:max-w-md">
        {shown ? (
          <ExpenseDetails expense={shown} onDeleted={onClose} />
        ) : (
          <SheetHeader>
            <SheetTitle>This expense was not found</SheetTitle>
            <SheetDescription>It may have been deleted.</SheetDescription>
          </SheetHeader>
        )}
      </SheetContent>
    </Sheet>
  )
}
