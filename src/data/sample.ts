import Papa from 'papaparse'
import expensesCsv from '../../data/sample-expenses.csv?raw'
import invoicesCsv from '../../data/sample-invoices.csv?raw'
import { parseAmountToCents } from '@/lib/money'
import {
  EXPENSE_CATEGORIES,
  type Client,
  type Expense,
  type ExpenseCategory,
  type Invoice,
  type Ledger,
} from '@/lib/types'

interface InvoiceRow {
  invoice_number: string
  client: string
  amount: string
  issue_date: string
  due_date: string
  paid_date: string
  description: string
}

interface ExpenseRow {
  date: string
  amount: string
  category: string
  description: string
}

function parseCsv<T>(csv: string): T[] {
  const result = Papa.parse<T>(csv, { header: true, skipEmptyLines: true })
  if (result.errors.length > 0) {
    throw new Error(`Sample data could not be read: ${result.errors[0].message}`)
  }
  return result.data
}

function isCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value)
}

/** Builds the fictional sample dataset from the CSV files in `data/`. */
export function loadSampleLedger(): Ledger {
  const createdAt = new Date().toISOString()
  const clientsByName = new Map<string, Client>()

  const invoices = parseCsv<InvoiceRow>(invoicesCsv).map((row): Invoice => {
    let client = clientsByName.get(row.client)
    if (!client) {
      client = { id: crypto.randomUUID(), name: row.client, createdAt }
      clientsByName.set(row.client, client)
    }
    return {
      id: crypto.randomUUID(),
      invoiceNumber: row.invoice_number,
      clientId: client.id,
      amount: parseAmountToCents(row.amount),
      issueDate: row.issue_date,
      dueDate: row.due_date,
      paidDate: row.paid_date || undefined,
      status: row.paid_date ? 'paid' : 'unpaid',
      description: row.description || undefined,
      source: 'sample',
    }
  })

  const expenses = parseCsv<ExpenseRow>(expensesCsv).map((row): Expense => {
    if (!isCategory(row.category)) throw new Error(`Unknown category: ${row.category}`)
    return {
      id: crypto.randomUUID(),
      date: row.date,
      amount: parseAmountToCents(row.amount),
      category: row.category,
      description: row.description || undefined,
      source: 'sample',
    }
  })

  return { clients: [...clientsByName.values()], invoices, expenses }
}
