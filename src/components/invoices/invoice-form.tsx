import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Field } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayLocal } from '@/lib/dates'
import {
  DESCRIPTION_MAX,
  draftFromInvoice,
  emptyDraft,
  NEW_CLIENT,
  validateInvoiceDraft,
  type InvoiceDraft,
  type InvoiceField,
} from '@/lib/invoice-form'
import type { Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

export function InvoiceForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing?: Invoice
  /** Called with the saved invoice number. */
  onSaved: (invoiceNumber: string) => void
  onCancel: () => void
}) {
  const currency = useCurrency()
  const { ledger, saveInvoice } = useLedger()
  const formRef = useRef<HTMLFormElement>(null)
  const [draft, setDraft] = useState<InvoiceDraft>(() =>
    editing ? draftFromInvoice(editing) : emptyDraft(todayLocal()),
  )
  const [touched, setTouched] = useState<Partial<Record<InvoiceField, boolean>>>({})
  const [submitCount, setSubmitCount] = useState(0)

  const { errors, value } = useMemo(
    () => validateInvoiceDraft(draft, ledger, { editing }),
    [draft, ledger, editing],
  )
  const clients = useMemo(
    () => [...ledger.clients].sort((a, b) => a.name.localeCompare(b.name)),
    [ledger.clients],
  )

  // After a failed submit, move focus to the first field with an error.
  useEffect(() => {
    if (submitCount > 0) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [submitCount])

  const shown = (field: InvoiceField) => (touched[field] || submitCount > 0 ? errors[field] : undefined)
  const set = (field: InvoiceField) => (next: string) => setDraft((d) => ({ ...d, [field]: next }))
  const props = (field: InvoiceField) => ({
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
    saveInvoice(value, editing?.id)
    toast.success(`${value.invoiceNumber} ${editing ? 'saved' : 'added'}`)
    onSaved(value.invoiceNumber)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <Field id="clientId" label="Client" error={shown('clientId')} className="sm:col-span-2">
        <Select
          value={draft.clientId}
          onValueChange={(next) => {
            set('clientId')(next)
            setTouched((t) => ({ ...t, clientId: true }))
          }}
        >
          <SelectTrigger
            id="clientId"
            className="w-full"
            aria-invalid={shown('clientId') ? true : undefined}
            aria-describedby={shown('clientId') ? 'clientId-error' : undefined}
          >
            <SelectValue placeholder="Choose a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value={NEW_CLIENT}>New client…</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {draft.clientId === NEW_CLIENT && (
        <Field
          id="newClientName"
          label="New client name"
          error={shown('newClientName')}
          className="sm:col-span-2"
        >
          <Input {...props('newClientName')} autoComplete="organization" />
        </Field>
      )}

      <Field id="invoiceNumber" label="Invoice number" error={shown('invoiceNumber')}>
        <Input {...props('invoiceNumber')} placeholder="e.g. INV-042" />
      </Field>

      <Field id="amount" label={`Amount (${currency})`} error={shown('amount')}>
        <Input {...props('amount')} inputMode="decimal" placeholder="0.00" />
      </Field>

      <Field id="issueDate" label="Issue date" error={shown('issueDate')}>
        <Input {...props('issueDate')} type="date" />
      </Field>

      <Field id="dueDate" label="Due date" error={shown('dueDate')}>
        <Input {...props('dueDate')} type="date" min={draft.issueDate || undefined} />
      </Field>

      {editing?.status === 'paid' && (
        <Field id="paidDate" label="Paid date" error={shown('paidDate')}>
          <Input {...props('paidDate')} type="date" min={draft.issueDate || undefined} />
        </Field>
      )}

      <Field
        id="description"
        label="Description"
        optional
        error={shown('description')}
        className="sm:col-span-2"
      >
        <Textarea {...props('description')} rows={3} />
        <p className="text-xs text-muted-foreground tabular-nums">
          {draft.description.trim().length} / {DESCRIPTION_MAX}
        </p>
      </Field>

      <div className="flex justify-end gap-3 sm:col-span-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{editing ? 'Save changes' : 'Add invoice'}</Button>
      </div>
    </form>
  )
}
