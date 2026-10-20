import { ArrowLeftIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  invoicePath,
  NEW_CLIENT,
  validateInvoiceDraft,
  type InvoiceDraft,
  type InvoiceField,
} from '@/lib/invoice-form'
import { APP_CURRENCY } from '@/lib/settings'
import type { Invoice } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'

function Field({
  id,
  label,
  error,
  optional,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  optional?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <div className="grid gap-2">
        <Label htmlFor={id}>
          {label}
          {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
        </Label>
        {children}
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

function InvoiceForm({ editing }: { editing?: Invoice }) {
  const { ledger, saveInvoice } = useLedger()
  const navigate = useNavigate()
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
    navigate(invoicePath(value.invoiceNumber), { replace: Boolean(editing) })
  }

  const cancelTo = editing ? invoicePath(editing.invoiceNumber) : '/invoices'

  return (
    <div className="max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to={cancelTo}>
          <ArrowLeftIcon /> {editing ? editing.invoiceNumber : 'Invoices'}
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <h1>{editing ? `Edit ${editing.invoiceNumber}` : 'Add invoice'}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
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

            <Field id="amount" label={`Amount (${APP_CURRENCY})`} error={shown('amount')}>
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

            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit">{editing ? 'Save changes' : 'Add invoice'}</Button>
              <Button type="button" variant="outline" asChild>
                <Link to={cancelTo}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function NewInvoicePage() {
  return <InvoiceForm />
}

export function EditInvoicePage() {
  const { invoiceNumber } = useParams()
  const { ledger } = useLedger()
  const invoice = ledger.invoices.find((i) => i.invoiceNumber === invoiceNumber)
  if (!invoice) {
    return (
      <div role="alert" className="max-w-2xl rounded-lg border bg-background p-6">
        <p className="font-medium">Invoice {invoiceNumber} was not found.</p>
        <p className="mt-1 text-sm text-muted-foreground">It may have been deleted.</p>
      </div>
    )
  }
  // Keyed so the form starts fresh if another invoice is opened.
  return <InvoiceForm key={invoice.id} editing={invoice} />
}
