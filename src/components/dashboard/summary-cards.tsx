import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { OutstandingSummary, PeriodFigures } from '@/lib/calculations'
import { formatChange, plural } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import type { Currency } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Period change in a tag: green when up, red when down. The sign carries the meaning too. */
function ChangeTag({ change }: { change: number | null }) {
  const text = formatChange(change)
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge
        variant="secondary"
        className={cn(
          'tabular-nums',
          text.startsWith('+') && 'bg-status-paid/10 text-status-paid',
          text.startsWith('-') && 'bg-status-overdue/10 text-status-overdue',
        )}
      >
        {text}
      </Badge>
      vs previous period
    </span>
  )
}

function SummaryCard({
  title,
  value,
  detail,
}: {
  title: string
  value: string
  detail: ReactNode
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
  const vsPrevious = (change: number | null) => <ChangeTag change={change} />
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
