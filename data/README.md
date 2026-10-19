# Sample dataset (F5)

Fictional data for demos, tests and the CSV import sample. Every client, invoice and expense is made up. Amounts are USD.

| File | Rows | Format |
| --- | --- | --- |
| `sample-invoices.csv` | 41 invoices | Invoice import format in `docs/data-model.md` |
| `sample-expenses.csv` | 120 expenses | Expense import format in `docs/data-model.md` |

Dates are `YYYY-MM-DD`, the decimal separator is a dot, and an empty `paid_date` means the invoice is Unpaid. There are no duplicate invoice numbers and no duplicate expenses (same date, amount and description), so a full import adds every row.

## What the data covers

- **Period:** April–September 2026 (six months).
- **Clients (6):** Northwind Studio, Lumen Coffee, Fernhill Records, Atlas & Oak Architects, Paper Kite Publishing, Brightwater Film Co.
- **Invoices:** 32 Paid, 4 Pending, 5 Overdue (as of 2026-10-19).
- **Empty month:** August 2026 has no invoices issued and none paid, so Received is $0.00 and Net income is negative. Expenses still occur in August.
- **Client with nothing owed:** Fernhill Records has 7 invoices, all Paid.
- **Late payments:** INV-027, INV-028 and INV-029 were issued in July and paid in September, so their income counts in September, not July.
- **Expense categories:** all 8 are used (Software 33, Office 21, Other 16, Fees 14, Travel 11, Equipment 9, Education 8, Marketing 8).

## Expected totals

Calculated by the rules in `docs/rules.md`: Received counts Paid invoices by `paid_date`; Expenses count by `date`; Net income = Received − Expenses. Totals were computed in integer cents by two independent scripts that agreed exactly.

### Per month

| Month | Received | Expenses | Net income |
| --- | ---: | ---: | ---: |
| April 2026 | $2,650.00 | $1,615.47 | $1,034.53 |
| May 2026 | $10,390.00 | $2,369.21 | $8,020.79 |
| June 2026 | $11,730.00 | $1,739.57 | $9,990.43 |
| July 2026 | $11,810.00 | $1,376.46 | $10,433.54 |
| August 2026 | $0.00 | $2,584.87 | -$2,584.87 |
| September 2026 | $13,230.00 | $2,084.56 | $11,145.44 |
| **April–September** | **$49,810.00** | **$11,770.14** | **$38,039.86** |

In cents: Received `265000, 1039000, 1173000, 1181000, 0, 1323000`; Expenses `161547, 236921, 173957, 137646, 258487, 208456`.

Change vs previous for September Received shows "—", because August Received is 0.

### Snapshot (today = 2026-10-19)

Outstanding and Overdue ignore the period but depend on today's date, so tests must fix today at **2026-10-19**.

| Metric | Amount | Invoices |
| --- | ---: | --- |
| Outstanding | $14,620.00 | 9 invoices · 5 overdue |
| Overdue | $8,840.00 | INV-002, INV-016, INV-025, INV-032, INV-036 |
| Pending | $5,780.00 | INV-038, INV-039, INV-040, INV-041 |

Boundary cases on 2026-10-19:

- INV-036 is due 2026-10-18 (yesterday), so it is **Overdue**.
- INV-038 is due 2026-10-19 (today), so it is **Pending**.

### Owed by client

| Client | Invoices | Outstanding | Overdue invoices |
| --- | ---: | ---: | ---: |
| Atlas & Oak Architects | 7 | $4,700.00 | 1 |
| Brightwater Film Co. | 6 | $4,250.00 | 1 |
| Paper Kite Publishing | 7 | $2,680.00 | 1 |
| Lumen Coffee | 6 | $2,050.00 | 1 |
| Northwind Studio | 8 | $940.00 | 1 |
| Fernhill Records | 7 | $0.00 | 0 |
