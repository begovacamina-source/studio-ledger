import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Field } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayLocal } from '@/lib/dates'
import {
  draftFromExpense,
  emptyExpenseDraft,
  validateExpenseDraft,
  type ExpenseDraft,
  type ExpenseField,
} from '@/lib/expense-form'
import { DESCRIPTION_MAX } from '@/lib/invoice-form'
import { formatMoney } from '@/lib/money'
import { EXPENSE_CATEGORIES, type Expense } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

export function ExpenseForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing?: Expense
  onSaved: () => void
  onCancel: () => void
}) {
  const currency = useCurrency()
  const { saveExpense } = useLedger()
  const formRef = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState<ExpenseDraft>(() =>
    editing ? draftFromExpense(editing) : emptyExpenseDraft(todayLocal()),
  )
  const [touched, setTouched] = useState<Partial<Record<ExpenseField, boolean>>>({})
  const [submitCount, setSubmitCount] = useState(0)
  const { errors, value } = useMemo(() => validateExpenseDraft(draft), [draft])

  // After a failed submit, move focus to the first field with an error.
  useEffect(() => {
    if (submitCount > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [submitCount])

  const shown = (field: ExpenseField) => (touched[field] || submitCount > 0 ? errors[field] : undefined)
  const set = (field: ExpenseField) => (next: string) => setDraft((d) => ({ ...d, [field]: next }))
  const props = (field: ExpenseField) => ({
    id: field,
    value: draft[field],
    onChange: (e: { target: { value: string } }) => set(field)(e.target.value),
    onBlur: () => setTouched((t) => ({ ...t, [field]: true })),
    'aria-invalid': shown(field) ? true : undefined,
    'aria-describedby': shown(field) ? `${field}-error` : undefined,
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!value) {
      setSubmitCount((n) => n + 1)
      return
    }
    saveExpense(value, editing?.id)
    toast.success(`${formatMoney(value.amount, currency)} expense ${editing ? 'saved' : 'added'}`)
    onSaved()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="date" label="Date" error={shown('date')}>
        <Input {...props('date')} type="date" />
      </Field>

      <Field id="amount" label={`Amount (${currency})`} error={shown('amount')}>
        <Input {...props('amount')} inputMode="decimal" placeholder="0.00" />
      </Field>

      <Field id="category" label="Category" error={shown('category')} className="sm:col-span-2">
        <Select
          value={draft.category}
          onValueChange={(next) => {
            set('category')(next)
            setTouched((t) => ({ ...t, category: true }))
          }}
        >
          <SelectTrigger
            id="category"
            className="w-full"
            aria-invalid={shown('category') ? true : undefined}
            aria-describedby={shown('category') ? 'category-error' : undefined}
          >
            <SelectValue placeholder="Choose a category" />
          </SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field id="description" label="Description" optional error={shown('description')} className="sm:col-span-2">
        <Textarea {...props('description')} rows={3} />
        <p className="text-xs text-muted-foreground tabular-nums">
          {draft.description.trim().length} / {DESCRIPTION_MAX}
        </p>
      </Field>

      <div className="flex justify-end gap-3 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{editing ? 'Save changes' : 'Add expense'}</Button>
      </div>
    </form>
  )
}
