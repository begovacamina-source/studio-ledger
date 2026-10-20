import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import type { MonthTotals } from '@/lib/calculations'
import { formatMonthLong, formatMonthShort } from '@/lib/dates'
import { formatAxisMoney, formatMoney } from '@/lib/money'
import type { Currency } from '@/lib/types'
import { cn } from '@/lib/utils'

const chartConfig = {
  received: { label: 'Received', color: 'var(--chart-received)' },
  expenses: { label: 'Expenses', color: 'var(--chart-expenses)' },
} satisfies ChartConfig

function MonthTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean
  payload?: { payload: MonthTotals }[]
  currency: Currency
}) {
  const totals = payload?.[0]?.payload
  if (!active || !totals) return null
  // The swatch matches each series' bar; Net income has no bar.
  const rows: [string, number, string?][] = [
    ['Received', totals.received, 'bg-chart-received'],
    ['Expenses', totals.expenses, 'bg-chart-expenses'],
    ['Net income', totals.netIncome],
  ]
  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{formatMonthLong(totals.month)}</div>
      {rows.map(([label, value, swatch]) => (
        <div key={label} className="flex justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className={cn('size-2.5 rounded-xs', swatch)} aria-hidden />
            {label}
          </span>
          <span className="font-mono font-medium tabular-nums">{formatMoney(value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

export function IncomeExpensesChart({
  data,
  currency,
}: {
  data: MonthTotals[]
  currency: Currency
}) {
  const hasData = data.some((d) => d.received > 0 || d.expenses > 0)
  const chartData = data.map((d) => ({ ...d, label: formatMonthShort(d.month) }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Received and Expenses</CardTitle>
        <CardDescription>Per month for the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full" aria-hidden>
          <BarChart data={chartData} accessibilityLayer={false}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              // Sized to the longest tick, so "14.000 KM" fits as well as "$14,000".
              width="auto"
              allowDecimals={false}
              // An empty period gets a $100 scale instead of cent ticks.
              domain={hasData ? [0, 'auto'] : [0, 10_000]}
              tickFormatter={(cents: number) => formatAxisMoney(cents, currency)}
            />
            <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<MonthTooltip currency={currency} />} />
            {/* Unsorted, so the legend follows the bars: Received, then Expenses. */}
            <ChartLegend content={<ChartLegendContent />} itemSorter={null} />
            <Bar dataKey="received" fill="var(--color-received)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>

        <table className="sr-only">
          <caption>Received, Expenses and Net income per month</caption>
          <thead>
            <tr>
              <th scope="col">Month</th>
              <th scope="col">Received</th>
              <th scope="col">Expenses</th>
              <th scope="col">Net income</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month}>
                <th scope="row">{formatMonthLong(d.month)}</th>
                <td>{formatMoney(d.received, currency)}</td>
                <td>{formatMoney(d.expenses, currency)}</td>
                <td>{formatMoney(d.netIncome, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
