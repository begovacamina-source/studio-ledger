import Papa from 'papaparse'
import { DESCRIPTION_MAX } from './invoice-form'
import {
  EXPENSE_CATEGORIES,
  type Client,
  type Currency,
  type Expense,
  type ExpenseCategory,
  type ISODate,
  type Invoice,
  type Ledger,
} from './types'

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_ROWS = 5000
export const PREVIEW_ROWS = 20

export type RecordType = 'invoices' | 'expenses'

export const DATE_FORMATS = ['YYYY-MM-DD', 'DD.MM.YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'] as const
export type DateFormat = (typeof DATE_FORMATS)[number]
export type DecimalSeparator = 'dot' | 'comma'

/** Value in a column mapping for a column that is left out. */
export const DONT_IMPORT = '__skip__'

interface FieldSpec {
  key: string
  label: string
  required: boolean
  kind: 'text' | 'amount' | 'date' | 'category'
  /** Header names that auto-match this field, compared without case, spaces or punctuation. */
  aliases: string[]
}

export const FIELDS: Record<RecordType, FieldSpec[]> = {
  invoices: [
    { key: 'invoiceNumber', label: 'Invoice number', required: true, kind: 'text', aliases: ['invoicenumber', 'invoiceno', 'invoice', 'number', 'no'] },
    { key: 'client', label: 'Client', required: true, kind: 'text', aliases: ['client', 'clientname', 'customer', 'customername'] },
    { key: 'amount', label: 'Amount', required: true, kind: 'amount', aliases: ['amount', 'total', 'value', 'sum'] },
    { key: 'issueDate', label: 'Issue date', required: true, kind: 'date', aliases: ['issuedate', 'issued', 'invoicedate', 'date'] },
    { key: 'dueDate', label: 'Due date', required: true, kind: 'date', aliases: ['duedate', 'due'] },
    { key: 'paidDate', label: 'Paid date', required: false, kind: 'date', aliases: ['paiddate', 'paid', 'datepaid', 'paymentdate'] },
    { key: 'description', label: 'Description', required: false, kind: 'text', aliases: ['description', 'desc', 'details', 'notes', 'note', 'memo'] },
  ],
  expenses: [
    { key: 'date', label: 'Date', required: true, kind: 'date', aliases: ['date', 'expensedate', 'spent', 'spentdate'] },
    { key: 'amount', label: 'Amount', required: true, kind: 'amount', aliases: ['amount', 'total', 'value', 'sum'] },
    { key: 'category', label: 'Category', required: true, kind: 'category', aliases: ['category', 'type'] },
    { key: 'description', label: 'Description', required: false, kind: 'text', aliases: ['description', 'desc', 'details', 'notes', 'note', 'memo'] },
  ],
}

// ---------- 1. Upload ----------

export interface ParsedFile {
  headers: string[]
  /** Data rows, each aligned with `headers`. */
  rows: string[][]
}

/** Checks the file itself before reading it. Returns an error message or null. */
export function checkFile(file: { name: string; size: number }): string | null {
  if (!file.name.toLowerCase().endsWith('.csv')) return 'Choose a .csv file.'
  if (file.size > MAX_FILE_BYTES) return 'The file is larger than 5 MB.'
  return null
}

export function parseCsv(text: string): { file?: ParsedFile; error?: string } {
  const result = Papa.parse<string[]>(text.replace(/^﻿/, ''), { skipEmptyLines: 'greedy' })
  // Short rows and an undetected delimiter (it falls back to commas) are not fatal.
  const fatal = result.errors.find((e) => e.type !== 'FieldMismatch' && e.type !== 'Delimiter')
  if (fatal) return { error: `The file could not be read: ${fatal.message}.` }

  const [headerRow, ...rows] = result.data
  const headers = (headerRow ?? []).map((h) => h.trim())
  if (headers.length === 0 || headers.every((h) => !h)) return { error: 'The file is empty.' }
  if (rows.length === 0) return { error: 'The file has a header row but no records.' }
  if (rows.length > MAX_ROWS)
    return { error: `The file has ${rows.length.toLocaleString('en-US')} rows; the limit is 5,000.` }

  return {
    file: { headers, rows: rows.map((r) => headers.map((_, i) => (r[i] ?? '').trim())) },
  }
}

// ---------- 2. Match columns ----------

/** For each file column: the field key it fills, or DONT_IMPORT. */
export type ColumnMapping = string[]

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * Matches columns by header name; each field is used at most once. Exact field
 * names go first, so a generic alias ("date") can't take a column meant for
 * another field.
 */
export function autoMatch(headers: string[], type: RecordType): ColumnMapping {
  const mapping: ColumnMapping = headers.map(() => DONT_IMPORT)
  const used = new Set<string>()
  const pass = (matches: (field: FieldSpec, name: string) => boolean) =>
    headers.forEach((header, i) => {
      if (mapping[i] !== DONT_IMPORT) return
      const field = FIELDS[type].find((f) => !used.has(f.key) && matches(f, normalize(header)))
      if (field) {
        mapping[i] = field.key
        used.add(field.key)
      }
    })
  pass((field, name) => field.aliases[0] === name)
  pass((field, name) => field.aliases.includes(name))
  return mapping
}

/** Messages that block the next step: missing required fields, or a field used twice. */
export function mappingProblems(mapping: ColumnMapping, type: RecordType): string[] {
  const problems: string[] = []
  for (const field of FIELDS[type]) {
    const count = mapping.filter((m) => m === field.key).length
    if (field.required && count === 0) problems.push(`Choose a column for ${field.label}.`)
    if (count > 1) problems.push(`${field.label} is matched to ${count} columns. Choose one.`)
  }
  return problems
}

const DATE_PATTERNS: Record<DateFormat, RegExp> = {
  'YYYY-MM-DD': /^(?<y>\d{4})-(?<m>\d{1,2})-(?<d>\d{1,2})$/,
  'DD.MM.YYYY': /^(?<d>\d{1,2})\.(?<m>\d{1,2})\.(?<y>\d{4})$/,
  'DD/MM/YYYY': /^(?<d>\d{1,2})\/(?<m>\d{1,2})\/(?<y>\d{4})$/,
  'MM/DD/YYYY': /^(?<m>\d{1,2})\/(?<d>\d{1,2})\/(?<y>\d{4})$/,
}

/** Parses a date in the given format into YYYY-MM-DD, or null if it isn't a real date. */
export function parseDate(value: string, format: DateFormat): ISODate | null {
  const match = DATE_PATTERNS[format].exec(value.trim())
  if (!match?.groups) return null
  const y = Number(match.groups.y)
  const m = Number(match.groups.m)
  const d = Number(match.groups.d)
  const date = new Date(Date.UTC(y, m - 1, d))
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const SAMPLE_SIZE = 20

function columnValues(file: ParsedFile, mapping: ColumnMapping, kind: FieldSpec['kind'], type: RecordType) {
  const keys = new Set(FIELDS[type].filter((f) => f.kind === kind).map((f) => f.key))
  return file.rows
    .slice(0, SAMPLE_SIZE)
    .flatMap((row) => row.filter((_, i) => keys.has(mapping[i])))
    .filter(Boolean)
}

/**
 * The first format that reads every date in the first rows; YYYY-MM-DD when
 * there is nothing to go on. When dates like 05/10/2026 fit both slash formats,
 * USD suggests MM/DD/YYYY and EUR or BAM suggest DD/MM/YYYY.
 */
export function suggestDateFormat(
  file: ParsedFile,
  mapping: ColumnMapping,
  type: RecordType,
  currency: Currency,
): DateFormat {
  const values = columnValues(file, mapping, 'date', type)
  const fits = DATE_FORMATS.filter((f) => values.length > 0 && values.every((v) => parseDate(v, f)))
  if (fits.includes('DD/MM/YYYY') && fits.includes('MM/DD/YYYY'))
    return currency === 'USD' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'
  return fits[0] ?? 'YYYY-MM-DD'
}

/** Comma when amounts in the first rows end in a comma and one or two digits, otherwise dot. */
export function suggestDecimalSeparator(file: ParsedFile, mapping: ColumnMapping, type: RecordType): DecimalSeparator {
  const values = columnValues(file, mapping, 'amount', type)
  return values.some((v) => /,\d{1,2}$/.test(v)) && !values.some((v) => /\.\d{1,2}$/.test(v)) ? 'comma' : 'dot'
}

/**
 * Amount text to integer cents with the confirmed decimal separator. Allows the
 * other separator as thousands grouping ("1,250.00" or "1.250,00"). Null if it isn't a number.
 */
export function parseImportAmount(value: string, separator: DecimalSeparator): number | null {
  const [decimal, group] = separator === 'dot' ? ['.', ','] : [',', '.']
  const text = value.trim().replace(/\s/g, '')
  const grouped = new RegExp(`^\\d{1,3}(\\${group}\\d{3})+(\\${decimal}\\d{1,2})?$`)
  const plain = new RegExp(`^\\d+(\\${decimal}\\d{1,2})?$`)
  if (!plain.test(text) && !grouped.test(text)) return null
  const [whole, fraction = ''] = text.split(group).join('').split(decimal)
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

// ---------- 3. Preview and validate ----------

export interface ImportSettings {
  type: RecordType
  mapping: ColumnMapping
  dateFormat: DateFormat
  decimal: DecimalSeparator
}

export interface RowError {
  /** The row's line number in the file; the header is line 1. */
  row: number
  field: string
  message: string
}

export type InvoiceRecord = Omit<Invoice, 'id' | 'clientId' | 'source'> & { clientName: string }
export type ExpenseRecord = Omit<Expense, 'id' | 'source'>

export interface ValidatedRow {
  row: number
  /** Raw cell values for the mapped fields, keyed by field. */
  values: Record<string, string>
  status: 'valid' | 'error' | 'duplicate'
  errors: RowError[]
  record?: InvoiceRecord | ExpenseRecord
}

export interface ValidationResult {
  rows: ValidatedRow[]
  valid: number
  withErrors: number
  duplicates: number
  errors: RowError[]
}

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
const expenseKey = (e: { date: string; amount: number; description?: string }) =>
  `${e.date}|${e.amount}|${(e.description ?? '').trim().toLowerCase()}`

export function validateRows(file: ParsedFile, settings: ImportSettings, ledger: Ledger): ValidationResult {
  const { type, mapping, dateFormat, decimal } = settings
  const fields = FIELDS[type]
  const seenNumbers = new Set(ledger.invoices.map((i) => i.invoiceNumber.trim().toLowerCase()))
  const seenExpenses = new Set(ledger.expenses.map(expenseKey))

  const rows = file.rows.map((cells, index): ValidatedRow => {
    const row = index + 2
    const values: Record<string, string> = {}
    mapping.forEach((key, i) => {
      if (key !== DONT_IMPORT) values[key] = cells[i] ?? ''
    })
    const errors: RowError[] = []
    const fail = (field: FieldSpec, problem: string) =>
      errors.push({ row, field: field.label, message: `Row ${row}: ${field.label.toLowerCase()} ${problem}` })

    const parsed: Record<string, string | number | undefined> = {}
    for (const field of fields) {
      const raw = values[field.key] ?? ''
      if (!raw) {
        if (field.required) fail(field, 'is missing.')
        continue
      }
      if (field.kind === 'amount') {
        const cents = parseImportAmount(raw, decimal)
        if (cents === null) fail(field, 'is not a number.')
        else if (cents <= 0) fail(field, 'must be greater than 0.')
        else parsed[field.key] = cents
      } else if (field.kind === 'date') {
        const date = parseDate(raw, dateFormat)
        if (!date) fail(field, `is not a date in ${dateFormat} format.`)
        else parsed[field.key] = date
      } else if (field.kind === 'category') {
        const category = EXPENSE_CATEGORIES.find((c) => sameText(c, raw))
        if (!category) fail(field, `"${raw}" is not one of ${EXPENSE_CATEGORIES.join(', ')}.`)
        else parsed[field.key] = category
      } else if (field.key === 'description' && raw.length > DESCRIPTION_MAX) {
        fail(field, `is longer than ${DESCRIPTION_MAX} characters.`)
      } else {
        parsed[field.key] = raw
      }
    }

    const field = (key: string) => fields.find((f) => f.key === key)!
    if (type === 'invoices') {
      const { issueDate, dueDate, paidDate } = parsed as Record<string, string | undefined>
      if (issueDate && dueDate && dueDate < issueDate) fail(field('dueDate'), 'is before the issue date.')
      if (issueDate && paidDate && paidDate < issueDate) fail(field('paidDate'), 'is before the issue date.')
    }

    if (errors.length > 0) return { row, values, status: 'error', errors }

    if (type === 'invoices') {
      const p = parsed as Record<string, string> & { amount: number }
      const record: InvoiceRecord = {
        invoiceNumber: p.invoiceNumber,
        clientName: p.client,
        amount: p.amount,
        issueDate: p.issueDate,
        dueDate: p.dueDate,
        paidDate: p.paidDate,
        status: p.paidDate ? 'paid' : 'unpaid',
        description: p.description,
      }
      const key = record.invoiceNumber.toLowerCase()
      if (seenNumbers.has(key)) return { row, values, status: 'duplicate', errors, record }
      seenNumbers.add(key)
      return { row, values, status: 'valid', errors, record }
    }

    const p = parsed as Record<string, string> & { amount: number }
    const record: ExpenseRecord = {
      date: p.date,
      amount: p.amount,
      category: p.category as ExpenseCategory,
      description: p.description,
    }
    const key = expenseKey(record)
    if (seenExpenses.has(key)) return { row, values, status: 'duplicate', errors, record }
    seenExpenses.add(key)
    return { row, values, status: 'valid', errors, record }
  })

  return {
    rows,
    valid: rows.filter((r) => r.status === 'valid').length,
    withErrors: rows.filter((r) => r.status === 'error').length,
    duplicates: rows.filter((r) => r.status === 'duplicate').length,
    errors: rows.flatMap((r) => r.errors),
  }
}

// ---------- 4. Import ----------

export interface ImportOutcome {
  imported: number
  skipped: number
  clientsCreated: string[]
}

/** Adds the valid rows, creating clients named in invoices that don't exist yet. */
export function applyImport(
  ledger: Ledger,
  type: RecordType,
  result: ValidationResult,
  newId: () => string = () => crypto.randomUUID(),
  now: Date = new Date(),
): { ledger: Ledger; outcome: ImportOutcome } {
  const valid = result.rows.filter((r) => r.status === 'valid').map((r) => r.record!)
  const outcome = (clientsCreated: string[]) => ({
    imported: valid.length,
    skipped: result.rows.length - valid.length,
    clientsCreated,
  })

  if (type === 'expenses') {
    const expenses = (valid as ExpenseRecord[]).map((e): Expense => ({ id: newId(), ...e, source: 'import' }))
    return { ledger: { ...ledger, expenses: [...ledger.expenses, ...expenses] }, outcome: outcome([]) }
  }

  const clients = [...ledger.clients]
  const created: string[] = []
  const clientId = (name: string) => {
    const existing = clients.find((c) => sameText(c.name, name))
    if (existing) return existing.id
    const client: Client = { id: newId(), name: name.trim(), createdAt: now.toISOString() }
    clients.push(client)
    created.push(client.name)
    return client.id
  }
  const invoices = (valid as InvoiceRecord[]).map(({ clientName, ...invoice }): Invoice => ({
    id: newId(),
    ...invoice,
    clientId: clientId(clientName),
    source: 'import',
  }))
  return {
    ledger: { ...ledger, clients, invoices: [...ledger.invoices, ...invoices] },
    outcome: outcome(created),
  }
}
