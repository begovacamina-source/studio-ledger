import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { IncomeExpensesChart } from '@/components/dashboard/income-expenses-chart'
import { OutstandingList } from '@/components/dashboard/outstanding-list'
import { SummaryCards } from '@/components/dashboard/summary-cards'
import { InvoiceSheet } from '@/components/invoices/invoice-sheet'
import { Button } from '@/components/ui/button'
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
  // The invoice panel opens over the Overview; "Go to Invoices" leads to the full list.
  const [openInvoice, setOpenInvoice] = useState<string>()
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

      {/* Same gap as the summary cards, so each half lines up with two cards above. */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          <IncomeExpensesChart data={months} currency={APP_CURRENCY} />
        </div>
        <div className="min-w-0">
          <OutstandingList
            rows={owed}
            currency={APP_CURRENCY}
            openInvoice={openInvoice}
            onOpen={setOpenInvoice}
          />
        </div>
      </div>

      <InvoiceSheet
        invoiceNumber={openInvoice}
        onClose={() => setOpenInvoice(undefined)}
        onNumberChange={setOpenInvoice}
        footer={
          <Button variant="outline" asChild>
            <Link to="/invoices">Go to Invoices</Link>
          </Button>
        }
      />
    </div>
  )
}
