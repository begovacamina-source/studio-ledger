# Screen-reader spot check (A11Y-4)

A short VoiceOver pass over each screen, to confirm what `e2e/screen-reader.spec.ts` checks in code: labels, statuses and form errors are announced. About 15 minutes. Record the result in `docs/verification-log.md`.

## Setup

- Safari (VoiceOver works best there), on the Vercel preview or `npm run dev`, with the sample data.
- Turn VoiceOver on and off with **Cmd + F5**. "VO" below means **Control + Option**.
- **Tab** moves between controls. **VO + Right arrow** reads the next item. **VO + U** opens the rotor; Left and Right arrows switch between Headings, Landmarks and Form controls.
- Wording can differ a little between macOS versions. What matters is that the information is there.

## What you should hear

| # | Do this | You should hear |
| --- | --- | --- |
| 1 | Open the Overview. | "Overview · Studio Ledger". |
| 2 | VO + U, then Headings. | Overview (level 1), Received and Expenses, and Outstanding (level 2). |
| 3 | Tab to the Period menu. | "Period, Last 6 months, pop-up button" (or "combo box"). |
| 4 | VO + Right arrow through Key figures. | Each figure with its label, e.g. "Outstanding $14,620.00, 9 invoices · 6 overdue". |
| 5 | Move into the Outstanding table and read a row. | Client, invoice number, amount, due date and a status in words, e.g. "Overdue · 179 days". |
| 6 | Tab to "Lumen Coffee" and press Enter. | A dialog named "INV-002", then its contents. The status is read as "Overdue · 179 days". |
| 7 | Tab to Mark as paid, press Enter; in the dialog, press Enter on Mark as paid. | "INV-002 marked as Paid", with an Undo button next. |
| 8 | Press Escape. | Back on the Lumen Coffee button. |
| 9 | Tab to Invoices in the top bar, press Enter. | "Invoices page". |
| 10 | Tab to the search field and type "lumen". | "6 invoices" a moment after typing. |
| 11 | Tab to the status tabs; move with the arrow keys. | Each tab with its count and position, e.g. "Pending 3, tab 3 of 4". |
| 12 | Tab to Add invoice, press Enter, then Tab to the form's Add invoice button and press Enter with nothing filled in. | Focus goes to Client, read as invalid, with "Choose a client or add a new one." |
| 13 | Tab through the rest of the form. | Each field's label, and its error with it: "Enter an invoice number.", "Enter the amount.", "Enter the due date." |
| 14 | Escape, then go to Expenses and change the Category filter. | The new count and total, e.g. "8 expenses · $…". |
| 15 | Go to Import. | "Import CSV page". Reading the steps list gives "Import steps", and "Upload" is the current step. |
| 16 | Tab to the file field. | Its label: "Drop a CSV file here, or choose one…". |
| 17 | Go to Settings, VO + U, Headings. | Settings (level 1), Currency, Sample data, Your data (level 2). |
| 18 | Tab to the currency choices; use the arrow keys. | "US dollar (USD), $1,250.00, radio button, selected, 1 of 3", then the next choice. |

## If something is missing or wrong

Note the step number and what you heard. Each one becomes a fix, or a "Found, not fixed" entry in the log.
