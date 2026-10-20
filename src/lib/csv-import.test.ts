import { describe, expect, it } from 'vitest'
import invoicesSample from '../../public/samples/studio-ledger-invoices-sample.csv?raw'
import expensesSample from '../../public/samples/studio-ledger-expenses-sample.csv?raw'
import { loadSampleLedger } from '@/data/sample'
import { expensesTotal, outstanding, received } from './calculations'
import {
  applyImport,
  autoMatch,
  checkFile,
  DONT_IMPORT,
  mappingProblems,
  parseCsv,
  parseDate,
  parseImportAmount,
  suggestDateFormat,
  suggestDecimalSeparator,
  validateRows,
  type ImportSettings,
  type ParsedFile,
} from './csv-import'

const ledger = loadSampleLedger()
const october = { months: ['2026-10'], start: '2026-10-01', end: '2026-10-31' }
let n = 0
const ids = () => `id-${++n}`

const parse = (text: string) => parseCsv(text).file as ParsedFile
const settingsFor = (file: ParsedFile, type: ImportSettings['type']): ImportSettings => {
  const mapping = autoMatch(file.headers, type)
  return {
    type,
    mapping,
    dateFormat: suggestDateFormat(file, mapping, type),
    decimal: suggestDecimalSeparator(file, mapping, type),
  }
}

describe('upload', () => {
  it('accepts .csv files up to 5 MB', () => {
    expect(checkFile({ name: 'invoices.CSV', size: 1000 })).toBeNull()
    expect(checkFile({ name: 'invoices.xlsx', size: 1000 })).toBe('Choose a .csv file.')
    expect(checkFile({ name: 'big.csv', size: 5 * 1024 * 1024 + 1 })).toBe('The file is larger than 5 MB.')
  })

  it('reads headers and rows, ignoring a BOM and blank lines', () => {
    const file = parse('﻿date,amount\n2026-10-01,5.00\n\n2026-10-02,6.00\n')
    expect(file.headers).toEqual(['date', 'amount'])
    expect(file.rows).toEqual([['2026-10-01', '5.00'], ['2026-10-02', '6.00']])
  })

  it('rejects empty files and more than 5,000 rows', () => {
    expect(parseCsv('').error).toBe('The file is empty.')
    expect(parseCsv('date,amount\n').error).toBe('The file has a header row but no records.')
    const big = 'date,amount\n' + '2026-10-01,5.00\n'.repeat(5001)
    expect(parseCsv(big).error).toBe('The file has 5,001 rows; the limit is 5,000.')
    expect(parseCsv('date,amount\n' + '2026-10-01,5.00\n'.repeat(5000)).file?.rows).toHaveLength(5000)
  })
})

describe('autoMatch', () => {
  it('matches the import format exactly', () => {
    const file = parse(invoicesSample)
    expect(autoMatch(file.headers, 'invoices')).toEqual([
      'invoiceNumber', 'client', 'amount', 'issueDate', 'dueDate', 'paidDate', 'description',
    ])
  })

  it('matches other header names and leaves unknown columns out', () => {
    expect(autoMatch(['Date', 'Due Date', 'Customer', 'Invoice #', 'Total', 'VAT'], 'invoices')).toEqual([
      'issueDate', 'dueDate', 'client', 'invoiceNumber', 'amount', DONT_IMPORT,
    ])
  })

  it('never uses a field twice', () => {
    expect(autoMatch(['Amount', 'Total'], 'expenses')).toEqual(['amount', DONT_IMPORT])
  })
})

describe('mappingProblems', () => {
  it('blocks the next step for unmatched required fields or a field used twice', () => {
    expect(mappingProblems(['date', 'amount', 'category', 'description'], 'expenses')).toEqual([])
    expect(mappingProblems(['date', DONT_IMPORT, 'category'], 'expenses')).toEqual(['Choose a column for Amount.'])
    expect(mappingProblems(['date', 'amount', 'amount', 'category'], 'expenses')).toEqual([
      'Amount is matched to 2 columns. Choose one.',
    ])
  })
})

describe('dates and decimals', () => {
  it('reads each date format and rejects impossible dates', () => {
    expect(parseDate('2026-10-05', 'YYYY-MM-DD')).toBe('2026-10-05')
    expect(parseDate('5.10.2026', 'DD.MM.YYYY')).toBe('2026-10-05')
    expect(parseDate('05/10/2026', 'DD/MM/YYYY')).toBe('2026-10-05')
    expect(parseDate('10/05/2026', 'MM/DD/YYYY')).toBe('2026-10-05')
    expect(parseDate('31/02/2026', 'DD/MM/YYYY')).toBeNull()
    expect(parseDate('2026-10-05', 'DD/MM/YYYY')).toBeNull()
  })

  it('suggests the date format from the first rows', () => {
    const suggest = (dates: string[]) => {
      const file = parse('date,amount,category\n' + dates.map((d) => `${d},5,Office`).join('\n'))
      return suggestDateFormat(file, autoMatch(file.headers, 'expenses'), 'expenses')
    }
    expect(suggest(['2026-10-05'])).toBe('YYYY-MM-DD')
    expect(suggest(['05.10.2026'])).toBe('DD.MM.YYYY')
    expect(suggest(['25/10/2026', '05/10/2026'])).toBe('DD/MM/YYYY')
    expect(suggest(['10/25/2026', '10/05/2026'])).toBe('MM/DD/YYYY')
  })

  it('suggests the decimal separator', () => {
    const suggest = (amounts: string[]) => {
      const file = parse('date,amount,category\n' + amounts.map((a) => `2026-10-01,"${a}",Office`).join('\n'))
      return suggestDecimalSeparator(file, autoMatch(file.headers, 'expenses'), 'expenses')
    }
    expect(suggest(['54.99', '1200'])).toBe('dot')
    expect(suggest(['54,99', '1.200,00'])).toBe('comma')
    expect(suggest(['1,200'])).toBe('dot')
  })

  it('parses amounts with the confirmed separator and thousands grouping', () => {
    expect(parseImportAmount('1,250.00', 'dot')).toBe(125000)
    expect(parseImportAmount('1250.5', 'dot')).toBe(125050)
    expect(parseImportAmount('1.250,00', 'comma')).toBe(125000)
    expect(parseImportAmount('54,99', 'comma')).toBe(5499)
    expect(parseImportAmount('54,99', 'dot')).toBeNull()
    expect(parseImportAmount('$12', 'dot')).toBeNull()
    expect(parseImportAmount('12,5,0', 'dot')).toBeNull()
  })
})

describe('validateRows', () => {
  it('passes every row of the invoice sample file', () => {
    const file = parse(invoicesSample)
    const result = validateRows(file, settingsFor(file, 'invoices'), ledger)
    expect(result).toMatchObject({ valid: 4, withErrors: 0, duplicates: 0 })
  })

  it('names the row, field and problem for each error', () => {
    const file = parse(
      'date,amount,category,description\n' +
        '2026-10-01,ten,Office,Paper\n' +
        '2026-13-01,5.00,Snacks,Biscuits\n' +
        ',0,Office,Pens\n',
    )
    const result = validateRows(file, settingsFor(file, 'expenses'), ledger)
    expect(result.errors.map((e) => e.message)).toEqual([
      'Row 2: amount is not a number.',
      'Row 3: date is not a date in YYYY-MM-DD format.',
      'Row 3: category "Snacks" is not one of Software, Equipment, Office, Travel, Marketing, Education, Fees, Other.',
      'Row 4: date is missing.',
      'Row 4: amount must be greater than 0.',
    ])
    expect(result).toMatchObject({ valid: 0, withErrors: 3 })
  })

  it('checks invoice due and paid dates against the issue date', () => {
    const file = parse(
      'invoice_number,client,amount,issue_date,due_date,paid_date\nINV-201,Kestrel,100,2026-10-10,2026-10-01,2026-10-02\n',
    )
    expect(validateRows(file, settingsFor(file, 'invoices'), ledger).errors.map((e) => e.message)).toEqual([
      'Row 2: due date is before the issue date.',
      'Row 2: paid date is before the issue date.',
    ])
  })

  it('skips duplicates: invoices by number, in the ledger or earlier in the file', () => {
    const file = parse(
      'invoice_number,client,amount,issue_date,due_date\n' +
        'inv-002,Lumen Coffee,850,2026-04-10,2026-04-24\n' +
        'INV-201,Kestrel,100,2026-10-01,2026-10-15\n' +
        'INV-201,Kestrel,100,2026-10-01,2026-10-15\n',
    )
    const result = validateRows(file, settingsFor(file, 'invoices'), ledger)
    expect(result.rows.map((r) => r.status)).toEqual(['duplicate', 'valid', 'duplicate'])
    expect(result).toMatchObject({ valid: 1, duplicates: 2 })
  })

  it('skips duplicate expenses by identical date, amount and description', () => {
    const file = parse(
      'date,amount,category,description\n' +
        '2026-04-01,54.99,Software,Figma subscription\n' + // already in the sample data
        '2026-04-01,54.99,Software,Figma seat\n',
    )
    expect(validateRows(file, settingsFor(file, 'expenses'), ledger).rows.map((r) => r.status)).toEqual([
      'duplicate',
      'valid',
    ])
  })

  it('reads European files once the format is confirmed', () => {
    const file = parse('Datum,Iznos,Kategorija\n05.10.2026,"1.250,00",office\n')
    const settings: ImportSettings = {
      type: 'expenses',
      mapping: ['date', 'amount', 'category'],
      dateFormat: 'DD.MM.YYYY',
      decimal: 'comma',
    }
    const [row] = validateRows(file, settings, ledger).rows
    expect(row.record).toEqual({ date: '2026-10-05', amount: 125000, category: 'Office', description: undefined })
  })
})

describe('applyImport', () => {
  it('imports invoices, creates missing clients and updates the dashboard figures', () => {
    const file = parse(invoicesSample)
    const result = validateRows(file, settingsFor(file, 'invoices'), ledger)
    const { ledger: next, outcome } = applyImport(ledger, 'invoices', result, ids)

    expect(outcome).toEqual({ imported: 4, skipped: 0, clientsCreated: ['Harbour Light Theatre'] })
    expect(next.clients).toHaveLength(7)
    expect(next.invoices.filter((i) => i.source === 'import')).toHaveLength(4)
    expect(received(next.invoices, october)).toBe(145000)
    expect(outstanding(next.invoices, '2026-10-20').amount).toBe(1462000 + 62000 + 220000 + 98000)
  })

  it('imports valid expenses only and counts the rest as skipped', () => {
    const file = parse(expensesSample + '2026-10-20,abc,Office,Bad row\n2026-04-01,54.99,Software,Figma subscription\n')
    const result = validateRows(file, settingsFor(file, 'expenses'), ledger)
    const { ledger: next, outcome } = applyImport(ledger, 'expenses', result, ids)

    expect(outcome).toEqual({ imported: 4, skipped: 2, clientsCreated: [] })
    expect(expensesTotal(next.expenses, october)).toBe(5499 + 1850 + 24000 + 8900)
  })
})

describe('delimiters', () => {
  it('reads semicolon-separated files, common with comma decimals', () => {
    const file = parse('date;amount;category\n05.10.2026;12,50;Office\n')
    expect(file.headers).toEqual(['date', 'amount', 'category'])
    expect(file.rows).toEqual([['05.10.2026', '12,50', 'Office']])
  })
})
