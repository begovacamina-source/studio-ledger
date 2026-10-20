import { describe, expect, it } from 'vitest'
import { loadSampleLedger } from '@/data/sample'
import { expensesTotal, netIncome } from './calculations'
import {
  deleteExpense,
  draftFromExpense,
  emptyExpenseDraft,
  filterExpenses,
  saveExpense,
  validateExpenseDraft,
  type ExpenseDraft,
} from './expense-form'

const TODAY = '2026-10-20'
const ledger = loadSampleLedger()
const october = { months: ['2026-10'], start: '2026-10-01', end: '2026-10-31' }
const september = { months: ['2026-09'], start: '2026-09-01', end: '2026-09-30' }
const valid: ExpenseDraft = { date: TODAY, amount: '54,99', category: 'Software', description: ' Figma ' }
let n = 0
const ids = () => `id-${++n}`

describe('validateExpenseDraft', () => {
  it('accepts a complete draft and converts the amount to cents', () => {
    expect(validateExpenseDraft(valid)).toEqual({
      errors: {},
      value: { date: TODAY, amount: 5499, category: 'Software', description: 'Figma' },
    })
  })

  it('reports each missing field', () => {
    const { errors, value } = validateExpenseDraft({ date: '', amount: '', category: '', description: '' })
    expect(value).toBeUndefined()
    expect(errors).toEqual({
      date: 'Enter the date of the expense.',
      amount: 'Enter the amount.',
      category: 'Choose a category.',
    })
  })

  it('allows only amounts above 0 and the fixed categories', () => {
    expect(validateExpenseDraft({ ...valid, amount: '0' }).errors.amount).toBe(
      'Amount must be greater than 0. Refunds are not supported.',
    )
    expect(validateExpenseDraft({ ...valid, amount: '-5' }).errors.amount).toMatch(/as a number/)
    expect(validateExpenseDraft({ ...valid, category: 'Snacks' }).errors.category).toBe('Choose a category.')
  })

  it('limits the description to 200 characters', () => {
    expect(validateExpenseDraft({ ...valid, description: 'x'.repeat(201) }).errors.description).toBeDefined()
  })

  it('starts a new expense on today with nothing else filled in', () => {
    expect(emptyExpenseDraft(TODAY)).toEqual({ date: TODAY, amount: '', category: '', description: '' })
  })
})

describe('saveExpense and deleteExpense', () => {
  it('adds a manual expense, and Expenses and Net income change', () => {
    const next = saveExpense(ledger, validateExpenseDraft(valid).value!, undefined, ids)
    expect(next.expenses).toHaveLength(121)
    expect(next.expenses.at(-1)).toMatchObject({ amount: 5499, category: 'Software', source: 'manual' })
    expect(expensesTotal(next.expenses, october)).toBe(5499)
    expect(netIncome(next, october)).toBe(-5499)
  })

  it('edits an expense in place, moving it to another month', () => {
    const first = ledger.expenses.find((e) => e.date.startsWith('2026-09'))!
    const draft = { ...draftFromExpense(first), date: '2026-10-02', amount: '100' }
    const next = saveExpense(ledger, validateExpenseDraft(draft).value!, first.id, ids)
    expect(next.expenses).toHaveLength(120)
    expect(next.expenses.find((e) => e.id === first.id)).toMatchObject({ date: '2026-10-02', amount: 10000 })
    expect(expensesTotal(next.expenses, september)).toBe(208456 - first.amount)
    expect(expensesTotal(next.expenses, october)).toBe(10000)
  })

  it('deletes an expense from every total', () => {
    const first = ledger.expenses.find((e) => e.date.startsWith('2026-09'))!
    const next = deleteExpense(ledger, first.id)
    expect(next.expenses).toHaveLength(119)
    expect(expensesTotal(next.expenses, september)).toBe(208456 - first.amount)
  })
})

describe('filterExpenses', () => {
  it('filters by period and category, newest first', () => {
    const all = filterExpenses(ledger.expenses, { period: 'all', category: 'all' }, TODAY)
    expect(all).toHaveLength(120)
    expect(all[0].date >= all[1].date).toBe(true)

    const lastMonth = filterExpenses(ledger.expenses, { period: 'last-month', category: 'all' }, TODAY)
    expect(lastMonth.every((e) => e.date.startsWith('2026-09'))).toBe(true)
    expect(lastMonth.reduce((sum, e) => sum + e.amount, 0)).toBe(208456)

    const software = filterExpenses(ledger.expenses, { period: 'all', category: 'Software' }, TODAY)
    expect(software).toHaveLength(33)
    expect(filterExpenses(ledger.expenses, { period: 'this-month', category: 'all' }, TODAY)).toHaveLength(0)
  })
})
