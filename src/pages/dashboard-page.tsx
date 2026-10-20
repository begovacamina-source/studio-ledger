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
import { monthlyTotals, outstanding, outstandingList, periodFigures } from '@/lib/calculations'
import { todayLocal } from '@/lib/dates'
import { getPeriod, PERIOD_OPTIONS, type PeriodId } from '@/lib/periods'
import { APP_CURRENCY } from '@/lib/settings'
import { useLedger } from '@/state/use-ledger'

export function DashboardPage() {
  const { ledger } = useLedger()
  const [periodId, setPeriodId] = useState<PeriodId>('last-6-months')
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

      <SummaryCards figures={figures} outstanding={snapshot} currency={APP_CURRENCY} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <IncomeExpensesChart data={months} currency={APP_CURRENCY} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <OutstandingList rows={owed} currency={APP_CURRENCY} />
        </div>
      </div>
    </div>
  )
}
