export type ISODate = string // YYYY-MM-DD

export type Source = 'manual' | 'import' | 'sample'

export interface Client {
  id: string
  name: string
  email?: string
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  /** Integer cents. */
  amount: number
  issueDate: ISODate
  dueDate: ISODate
  paidDate?: ISODate
  status: 'paid' | 'unpaid'
  description?: string
  source: Source
}

export const EXPENSE_CATEGORIES = [
  'Software',
  'Equipment',
  'Office',
  'Travel',
  'Marketing',
  'Education',
  'Fees',
  'Other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export interface Expense {
  id: string
  date: ISODate
  /** Integer cents. */
  amount: number
  category: ExpenseCategory
  description?: string
  source: Source
}

export type Currency = 'USD' | 'EUR' | 'BAM'

export interface Ledger {
  clients: Client[]
  invoices: Invoice[]
  expenses: Expense[]
}
