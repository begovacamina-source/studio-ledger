# Glossary, calculations and behavior rules

Extracted from the PRD. If this file and the PRD disagree, the PRD wins and this file must be updated.

## The golden rule

Income counts only when cash is received: a paid invoice counts in the period of its **paid date**, never its issue date. Billed revenue is never shown as income.

## Glossary

| Term | Meaning |
| --- | --- |
| Received | Money from invoices marked Paid |
| Outstanding | Money from all invoices not yet paid |
| Pending | An unpaid invoice whose due date has not passed |
| Overdue | An unpaid invoice whose due date has passed |
| Unpaid | Stored status covering Pending and Overdue; never shown in the UI |
| Expenses | Money spent, recorded as expense entries |
| Net income | Received minus Expenses for the period |

## Calculations

| Metric | Definition | Period rule |
| --- | --- | --- |
| Received | Sum of Paid invoice amounts | `paidDate` within the selected period |
| Outstanding | Sum of all Unpaid invoice amounts | Current snapshot, ignores period |
| Overdue | Sum of Unpaid invoices where `dueDate` < today | Current snapshot, ignores period |
| Expenses | Sum of expense amounts | `date` within the selected period |
| Net income | Received − Expenses | Selected period |
| Change vs previous | (Current − Previous) ÷ Previous × 100 | Previous period of equal length; Received, Expenses and Net income only |

The Outstanding card shows a count instead of a change, e.g. "3 invoices · 1 overdue".

## Periods

Periods are whole calendar months, and "Last 3 months" and "Last 6 months" include the current month. The dashboard opens on Last 6 months. The Expenses list also offers All time and opens on it.

| Period | Months covered | Example on 2026-10-20 |
| --- | --- | --- |
| This month | The current calendar month | October 2026 |
| Last month | The previous calendar month | September 2026 |
| Last 3 months | The current month and the 2 before it | August–October 2026 |
| Last 6 months | The current month and the 5 before it | May–October 2026 |
| This year | January to December of the current year | January–December 2026 |

The previous period for a change is the same number of whole months right before it: Last 6 months on 2026-10-20 is compared with November 2025–April 2026.

## Displayed invoice status

- **Paid:** status is Paid (`paidDate` is set).
- **Overdue:** status is Unpaid and `dueDate` is before today.
- **Pending:** status is Unpaid and `dueDate` is today or later.

## Edge cases

- Previous period value of 0 → change shown as "—".
- Previous Net income of 0 or less → Net income change shown as "—" (a percentage of a negative value gives a misleading sign).
- Net income can be negative; show a minus sign, not only red.
- A month with no records shows 0 in the chart, not a gap.
- All sums are calculated in cents and formatted only for display.
- "Today" is the user's local date.

## Behavior rules

- Setting a paid invoice back to Unpaid clears its paid date and removes it from Received.
- Editing a paid invoice's amount or paid date changes past totals immediately.
- A client with invoices cannot be deleted until those invoices are deleted or moved.
- Expense amounts must be greater than 0; refunds are out of scope.
- An invoice is either Paid or Unpaid; partial payments are not supported.

## Currency

One currency per app, chosen in Settings: USD (default), EUR or BAM. Switching changes formatting only; amounts are never converted.

| Currency | Format |
| --- | --- |
| USD | $1,250.00 |
| EUR | €1,250.00 |
| BAM | 1.250,00 KM |
