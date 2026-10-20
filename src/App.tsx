import { useMemo, useState } from 'react'
import { IncomeExpensesChart } from '@/components/dashboard/income-expenses-chart'
import { OutstandingList } from '@/components/dashboard/outstanding-list'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { loadSampleLedger } from '@/data/sample'
import { monthlyTotals, outstanding, outstandingList, periodFigures } from '@/lib/calculations'
import { todayLocal } from '@/lib/dates'
import { getPeriod, PERIOD_OPTIONS, type PeriodId } from '@/lib/periods'
import type { Currency, Ledger } from '@/lib/types'

// Settings (US-5.2) is not built yet, so the app uses the default currency.
const CURRENCY: Currency = 'USD'

function loadLedger(): { ledger: Ledger } | { error: string } {
  try {
    return { ledger: loadSampleLedger() }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function Dashboard({ ledger }: { ledger: Ledger }) {
  const [periodId, setPeriodId] = useState<PeriodId>('this-month')
  const today = todayLocal()
  const period = useMemo(() => getPeriod(periodId, today), [periodId, today])

  const figures = useMemo(() => periodFigures(ledger, period), [ledger, period])
  const snapshot = useMemo(() => outstanding(ledger.invoices, today), [ledger, today])
  const months = useMemo(() => monthlyTotals(ledger, period), [ledger, period])
  const owed = useMemo(() => outstandingList(ledger, today), [ledger, today])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <Select value={periodId} onValueChange={(value) => setPeriodId(value as PeriodId)}>
          <SelectTrigger className="w-44" aria-label="Period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SummaryCards figures={figures} outstanding={snapshot} currency={CURRENCY} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <IncomeExpensesChart data={months} currency={CURRENCY} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <OutstandingList rows={owed} currency={CURRENCY} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const result = useMemo(() => loadLedger(), [])
  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          <span className="font-semibold">Studio Ledger</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {'error' in result ? (
          <div role="alert" className="rounded-lg border bg-background p-6 text-sm">
            <p className="font-medium">The sample data could not be loaded.</p>
            <p className="mt-1 text-muted-foreground">{result.error}</p>
          </div>
        ) : (
          <Dashboard ledger={result.ledger} />
        )}
      </main>
    </div>
  )
}
