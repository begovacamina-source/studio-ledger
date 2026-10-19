# Instructions for coding agents (Codex)

Read this file before every task. The product documents in `docs/` are the source of truth.

## Scope rules

- Implement exactly one user story per task, as described in its GitHub issue and in `docs/PRD.md`.
- Do not add features, screens, charts or settings that are not in the PRD. If something seems missing, stop and ask in the pull request instead of inventing it.
- These are explicitly out of scope: tax estimates, reminder emails or alerts, invoice PDFs, bank or payment sync, Google Sheets sync, user accounts, mixed currencies or conversion, data export, recurring invoices, budgets, forecasts, dark mode.

## Stack

- React + TypeScript (strict mode), built with Vite.
- Charts: Recharts. CSV parsing: Papa Parse.
- Storage: browser storage only (IndexedDB or localStorage). No backend, no network calls.
- Tests: Vitest for logic, Testing Library for components, Playwright for the three core journeys.

## Money and calculations

- Store every amount as an integer number of cents. Never use floating point for money.
- Follow `docs/rules.md` exactly. Key rules:
  - Received = sum of Paid invoices whose `paidDate` is in the selected period.
  - Outstanding = sum of all Unpaid invoices, regardless of period.
  - Overdue = Unpaid and `dueDate` before today (user's local date).
  - Net income = Received − Expenses for the period.
  - Period change applies to Received, Expenses and Net income only. If the previous value is 0, show "—".
- Every calculation rule needs a unit test against the sample dataset.

## Currency

- One currency for the whole app, chosen in Settings: USD (default), EUR or BAM.
- Switching currency only changes formatting. Never convert amounts.
- Formats: `$1,250.00` (USD), `€1,250.00` (EUR), `1.250,00 KM` (BAM).

## UI language

Use only the glossary terms in `docs/rules.md`: Received, Outstanding, Pending, Overdue, Paid, Expenses, Net income. Never show "Unpaid", "revenue", "billed" or accounting jargon in the UI.

## Definition of Done

- Meets every acceptance criterion of the story.
- Matches the Figma design and uses design tokens (CSS variables), no hard-coded values.
- Handles empty, loading and error states.
- Unit tests for any logic; all tests pass.
- Keyboard accessible with visible focus; status never shown by colour alone.
- No TypeScript errors or lint warnings.
- PR description links the issue and includes a screenshot.
