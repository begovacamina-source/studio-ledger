import { PlusIcon } from 'lucide-react'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useSearchParams } from 'react-router'
import { CardList, CardListItem, CardListLine } from '@/components/card-list'
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog'
import { ExpenseSheet } from '@/components/expenses/expense-sheet'
import { FirstUse } from '@/components/first-use'
import { ListPagination } from '@/components/list-pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePageParam } from '@/hooks/use-page-param'
import { formatDate, todayLocal } from '@/lib/dates'
import { ALL_CATEGORIES, expenseTitle, filterExpenses, type ExpensePeriod } from '@/lib/expense-form'
import { plural } from '@/lib/format'
import { formatMoney } from '@/lib/money'
import { paginate } from '@/lib/pagination'
import { PERIOD_OPTIONS } from '@/lib/periods'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/lib/types'
import { useLedger } from '@/state/use-ledger'
import { useCurrency } from '@/state/use-settings'

type CategoryFilter = ExpenseCategory | typeof ALL_CATEGORIES

const parsePeriod = (value: string | null): ExpensePeriod =>
  PERIOD_OPTIONS.find((p) => p.id === value)?.id ?? 'all'
const parseCategory = (value: string | null): CategoryFilter =>
  EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === value) ?? ALL_CATEGORIES

export function ExpensesPage() {
  const currency = useCurrency()
  const phone = useIsMobile()
  const pageParam = usePageParam()
  const { ledger } = useLedger()
  const [params, setParams] = useSearchParams()
  // ?add=1 (from the dashboard's first-use state) opens the add form straight away.
  const [adding, setAdding] = useState(() => params.has('add'))
  useEffect(() => {
    if (!params.has('add')) return
    const rest = new URLSearchParams(params)
    rest.delete('add')
    setParams(rest, { replace: true })
  }, [params, setParams])
  const [openId, setOpenId] = useState<string | undefined>()
  const period = parsePeriod(params.get('period'))
  const category = parseCategory(params.get('category'))
  const today = todayLocal()
  const filtered = period !== 'all' || category !== ALL_CATEGORIES

  const expenses = useMemo(
    () => filterExpenses(ledger.expenses, { period, category }, today),
    [ledger.expenses, period, category, today],
  )
  // The count and total cover every matching expense; the list shows one page of them.
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const shown = paginate(expenses, pageParam.page)

  // Filters live in the URL so they survive Back and can be bookmarked.
  function update(next: { period?: ExpensePeriod; category?: CategoryFilter }) {
    const p = next.period ?? period
    const c = next.category ?? category
    const query = new URLSearchParams()
    if (p !== 'all') query.set('period', p)
    if (c !== ALL_CATEGORIES) query.set('category', c.toLowerCase())
    setParams(query, { replace: true })
  }

  function handleRowClick(event: MouseEvent<HTMLElement>, id: string) {
    // The row's own button handles keyboard users; ignore clicks from inside dialogs.
    const target = event.target as HTMLElement
    if (!event.currentTarget.contains(target) || target.closest('button')) return
    setOpenId(id)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <Button onClick={() => setAdding(true)}>
          <PlusIcon /> Add expense
        </Button>
      </div>

      {ledger.expenses.length === 0 ? (
        <Card>
          <CardContent>
            <FirstUse title="No expenses yet">
              <Button onClick={() => setAdding(true)}>
                <PlusIcon /> Add expense
              </Button>
            </FirstUse>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={period} onValueChange={(v) => update({ period: v as ExpensePeriod })}>
              <SelectTrigger className="w-full md:w-44" aria-label="Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectSeparator />
                {PERIOD_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => update({ category: v as CategoryFilter })}>
              <SelectTrigger className="w-full md:w-44" aria-label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
                <SelectSeparator />
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Announced when a filter changes, so the count and total aren't only visual. */}
            <p aria-live="polite" className="w-full text-sm text-muted-foreground tabular-nums md:ml-auto md:w-auto">
              {plural(expenses.length, 'expense')} · {formatMoney(total, currency)}
            </p>
          </div>

          <Card>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    {filtered ? 'No expenses match these filters.' : 'No expenses yet.'}
                  </p>
                  {filtered ? (
                    <Button variant="outline" onClick={() => setParams({}, { replace: true })}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => setAdding(true)}>
                      <PlusIcon /> Add expense
                    </Button>
                  )}
                </div>
              ) : phone ? (
                // On phones each expense is two lines: what and how much, then when and its category.
                <CardList aria-label="Expenses">
                  {shown.items.map((expense) => (
                    <CardListItem
                      key={expense.id}
                      selected={expense.id === openId}
                      onClick={(e) => handleRowClick(e, expense.id)}
                    >
                      <CardListLine>
                        <button
                          type="button"
                          className="min-w-0 truncate rounded-sm text-left font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                          aria-label={`Open ${expenseTitle(expense)}, ${formatDate(expense.date)}`}
                          onClick={() => setOpenId(expense.id)}
                        >
                          {expense.description ?? expense.category}
                        </button>
                        <span className="shrink-0 tabular-nums">{formatMoney(expense.amount, currency)}</span>
                      </CardListLine>
                      <div className="truncate text-muted-foreground">
                        {formatDate(expense.date)} · {expense.category}
                      </div>
                    </CardListItem>
                  ))}
                </CardList>
              ) : (
                <Table className="min-w-[40rem] table-fixed">
                  <colgroup>
                    <col className="w-36" />
                    <col className="w-36" />
                    <col />
                    <col className="w-32" />
                  </colgroup>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shown.items.map((expense) => (
                      <TableRow
                        key={expense.id}
                        className="cursor-pointer"
                        data-state={expense.id === openId ? 'selected' : undefined}
                        onClick={(e) => handleRowClick(e, expense.id)}
                      >
                        <TableCell>
                          <button
                            type="button"
                            className="rounded-sm font-medium underline-offset-4 hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                            aria-label={`Open ${expenseTitle(expense)}, ${formatDate(expense.date)}`}
                            onClick={() => setOpenId(expense.id)}
                          >
                            {formatDate(expense.date)}
                          </button>
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="truncate" title={expense.description}>
                          {expense.description ?? <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatMoney(expense.amount, currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <ListPagination page={shown} noun="expenses" hrefFor={pageParam.hrefFor} onPageChange={pageParam.setPage} />
            </CardContent>
          </Card>
        </>
      )}

      <ExpenseSheet expenseId={openId} onClose={() => setOpenId(undefined)} />
      <ExpenseFormDialog open={adding} onOpenChange={setAdding} />
    </div>
  )
}
