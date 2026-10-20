import { DESCRIPTION_MAX, parseAmountInput } from './invoice-form'
import { getPeriod, isInPeriod, type PeriodId } from './periods'
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, type ISODate, type Ledger } from './types'

/** What the expense form holds: raw text, exactly as typed. */
export interface ExpenseDraft {
  date: string
  amount: string
  category: string
  description: string
}

export type ExpenseField = keyof ExpenseDraft
export type ExpenseErrors = Partial<Record<ExpenseField, string>>

/** A draft that passed validation, with the amount in cents. */
export interface ValidExpense {
  date: ISODate
  amount: number
  category: ExpenseCategory
  description?: string
}

/** How an expense is named in the panel and dialogs: its description, or its category. */
export const expenseTitle = (expense: Pick<Expense, 'description' | 'category'>) =>
  expense.description ?? `${expense.category} expense`

export function emptyExpenseDraft(today: ISODate): ExpenseDraft {
  return { date: today, amount: '', category: '', description: '' }
}

export function draftFromExpense(expense: Expense): ExpenseDraft {
  const cents = String(expense.amount % 100).padStart(2, '0')
  return {
    date: expense.date,
    amount: `${Math.floor(expense.amount / 100)}.${cents}`,
    category: expense.category,
    description: expense.description ?? '',
  }
}

const isCategory = (value: string): value is ExpenseCategory =>
  (EXPENSE_CATEGORIES as readonly string[]).includes(value)

export function validateExpenseDraft(draft: ExpenseDraft): { errors: ExpenseErrors; value?: ValidExpense } {
  const errors: ExpenseErrors = {}

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) errors.date = 'Enter the date of the expense.'

  const amount = parseAmountInput(draft.amount)
  if (!draft.amount.trim()) errors.amount = 'Enter the amount.'
  else if (amount === null) errors.amount = 'Enter the amount as a number, for example 54.99.'
  else if (amount <= 0) errors.amount = 'Amount must be greater than 0. Refunds are not supported.'

  if (!isCategory(draft.category)) errors.category = 'Choose a category.'

  const description = draft.description.trim()
  if (description.length > DESCRIPTION_MAX)
    errors.description = `Description can be at most ${DESCRIPTION_MAX} characters.`

  if (Object.keys(errors).length > 0 || amount === null || !isCategory(draft.category)) return { errors }
  return {
    errors,
    value: { date: draft.date, amount, category: draft.category, description: description || undefined },
  }
}

/** Adds a new expense, or updates `editingId`. */
export function saveExpense(
  ledger: Ledger,
  value: ValidExpense,
  editingId?: string,
  newId: () => string = () => crypto.randomUUID(),
): Ledger {
  const expenses = editingId
    ? ledger.expenses.map((e) => (e.id === editingId ? { ...e, ...value } : e))
    : [...ledger.expenses, { id: newId(), ...value, source: 'manual' as const }]
  return { ...ledger, expenses }
}

export function deleteExpense(ledger: Ledger, expenseId: string): Ledger {
  return { ...ledger, expenses: ledger.expenses.filter((e) => e.id !== expenseId) }
}

/** "All time" plus the dashboard periods. */
export type ExpensePeriod = PeriodId | 'all'
export const ALL_CATEGORIES = 'all'

/** Expenses in the period and category, newest first. */
export function filterExpenses(
  expenses: Expense[],
  filters: { period: ExpensePeriod; category: ExpenseCategory | typeof ALL_CATEGORIES },
  today: ISODate,
): Expense[] {
  const period = filters.period === 'all' ? undefined : getPeriod(filters.period, today)
  return expenses
    .filter((e) => !period || isInPeriod(e.date, period))
    .filter((e) => filters.category === ALL_CATEGORIES || e.category === filters.category)
    .sort((a, b) => b.date.localeCompare(a.date) || (a.description ?? '').localeCompare(b.description ?? ''))
}
