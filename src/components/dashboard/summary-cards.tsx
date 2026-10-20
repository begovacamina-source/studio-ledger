import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { OutstandingSummary, PeriodFigures } from '@/lib/calculations'
import { formatChange } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import type { Currency } from '@/lib/types'

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string
  value: string
  detail: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
    </Card>
  )
}

export function SummaryCards({
  figures,
  outstanding,
  currency,
}: {
  figures: PeriodFigures
  outstanding: OutstandingSummary
  currency: Currency
}) {
  const vsPrevious = (change: number | null) => `${formatChange(change)} vs previous period`
  return (
    <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Received"
        value={formatMoney(figures.received.value, currency)}
        detail={vsPrevious(figures.received.change)}
      />
      <SummaryCard
        title="Outstanding"
        value={formatMoney(outstanding.amount, currency)}
        detail={`${plural(outstanding.count, 'invoice')} · ${outstanding.overdueCount} overdue`}
      />
      <SummaryCard
        title="Expenses"
        value={formatMoney(figures.expenses.value, currency)}
        detail={vsPrevious(figures.expenses.change)}
      />
      <SummaryCard
        title="Net income"
        value={formatMoney(figures.netIncome.value, currency)}
        detail={vsPrevious(figures.netIncome.change)}
      />
    </section>
  )
}
