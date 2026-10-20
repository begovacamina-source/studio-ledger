import { Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { LoadSampleButton } from '@/components/load-sample-button'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { formatMoney } from '@/lib/money'
import { describeRecords, hasRecords } from '@/lib/storage'
import type { Currency } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useSettings } from '@/state/use-settings'

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'US dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'BAM', label: 'Convertible mark (BAM)' },
]

export function SettingsPage() {
  const { settings, setCurrency } = useSettings()
  const { ledger, clearAllData } = useLedger()
  const empty = !hasRecords(ledger)

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
          Currency
        </CardTitle>
          <CardDescription>
            One currency for the whole app. Switching only changes how amounts look; nothing is
            converted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.currency}
            onValueChange={(value) => {
              setCurrency(value as Currency)
              toast.success(`Amounts now show in ${value}`)
            }}
            aria-label="Currency"
            className="grid gap-3 sm:grid-cols-3"
          >
            {CURRENCIES.map((c) => (
              <Label
                key={c.value}
                htmlFor={`currency-${c.value}`}
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal has-data-[state=checked]:border-action"
              >
                <RadioGroupItem id={`currency-${c.value}`} value={c.value} className="mt-0.5" />
                <span className="grid gap-1">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatMoney(125000, c.value)}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
          Sample data
        </CardTitle>
          <CardDescription>
            Fictional records for trying Studio Ledger: 6 clients, 41 invoices and 120 expenses from
            April to September 2026, including overdue invoices and a month with no income.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadSampleButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
          Your data
        </CardTitle>
          <CardDescription>
            Records are kept in this browser only, so clearing site data or using another browser
            won't show them. You have {describeRecords(ledger)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={empty}>
                <Trash2Icon /> Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all your records?</AlertDialogTitle>
                <AlertDialogDescription>
                  This deletes {describeRecords(ledger)} from this browser. Your currency setting stays.
                  This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    clearAllData()
                    toast.success('All records deleted')
                  }}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
