# Definition of Done: Studio Ledger MVP

The release checklist for the MVP, based on [`docs/PRD.md`](PRD.md). Check an item only when working code, a passing test or a reviewed preview supports it, and record that evidence in [`docs/verification-log.md`](verification-log.md) under the item's ID. This file holds the checklist only.

**Must** = required for release. **Nice** = do it if time allows; never blocks release. Items under **Future work** are out of this release; they are kept here so they aren't lost.

## Product behavior

### Calculations

- [x] **PB-1** Must · Received sums only Paid invoices whose paid date is in the selected period; an Unpaid invoice never adds to Received.
- [x] **PB-2** Must · Outstanding sums only Unpaid invoices, ignores the selected period, and a Paid invoice never adds to it.
- [x] **PB-3** Must · Marking an invoice as paid moves it from Outstanding to Received for its paid date; setting it back clears the paid date and moves it back. It is never counted in both.
- [x] **PB-4** Must · An Unpaid invoice due yesterday shows Overdue, one due today shows Pending, and a Paid invoice shows Paid whatever its due date ("today" is the user's local date).
- [x] **PB-5** Must · Expenses follow the selected period by expense date; Net income = Received − Expenses and shows a minus sign when negative.
- [x] **PB-6** Must · The change vs the previous period compares an equal number of whole months, and shows "—" when the previous value is 0 (or, for Net income, 0 or less).
- [x] **PB-7** Must · A month with no records shows 0 in the chart and its table, not a gap.
- [x] **PB-8** Must · Editing a paid invoice's amount or paid date changes past totals immediately.

### CSV import

- [x] **PB-9** Must · The downloadable sample invoice file imports with every row valid, creates missing clients, and the records show on the Overview straight away.
- [x] **PB-10** Must · All four date formats and both decimal separators import correctly once the user confirms them.
- [x] **PB-11** Must · Each bad row is reported as "Row N: field problem" (N is the line in the file, the header is line 1), and only valid rows are imported.
- [x] **PB-12** Must · Importing the same file twice adds nothing the second time: every row is reported as a duplicate (invoices by number, expenses by identical date, amount and description).
- [x] **PB-13** Must · A file whose columns don't cover the required fields cannot pass column matching, and a message says what is missing.
- [x] **PB-14** Must · Empty, header-only and non-CSV files, and files over 5 MB or 5,000 rows, are refused with a message and nothing is imported.
- [x] **PB-15** Must · Cancelling at the preview leaves every record unchanged.

### Sample data

- [x] **PB-16** Must · A first visit (nothing saved in this browser) opens on the sample: 6 clients, 41 invoices and 120 expenses, with no banner.
- [x] **PB-17** Must · "Clear all data" asks first, names what will be deleted, and leaves a true empty state: Overview, Invoices and Expenses show their empty states, and a reload stays empty.
- [x] **PB-18** Must · After clearing, each empty state offers Add, Import CSV and Load sample data, and loading the sample fills the dashboard straight away.
- [x] **PB-19** Must · "Load sample data" over existing records asks first, then replaces them: loading it twice still gives 6 clients, 41 invoices and 120 expenses.

### Currency

- [x] **PB-20** Must · USD, EUR and BAM format as $1,250.00, €1,250.00 and 1.250,00 KM.
- [x] **PB-21** Must · Amounts are relabelled, never converted: switching keeps the same digits (for example $47,160.00 → €47,160.00 → 47.160,00 KM).
- [x] **PB-22** Must · After a switch, no amount on the Overview (cards, chart axis, chart table, Outstanding), Invoices (list, panel) or Expenses (list, total) shows another currency, and the choice survives a reload.
- [x] **PB-23** Must · Chart tooltips, forms, dialogs and import screens also show amounts in the chosen currency.
- [x] **PB-24** Must · Chart axis labels fit on one line in every currency, BAM included.

### Charts

- [x] **PB-25** Must · The numbers behind the Received and Expenses chart are in a table for screen readers (month, Received, Expenses, Net income), and its totals match the summary cards.
- [x] **PB-26** Must · Hovering or tapping a month shows its exact Received, Expenses and Net income.

### Stories

- [x] **PB-28** Must · Every Must story in the PRD meets all of its acceptance criteria and its GitHub issue is closed.

## UX/UI and responsive

- [x] **UX-1** Must · Status is never shown by colour alone: every badge reads Paid, Pending or "Overdue · N days".
- [x] **UX-2** Must · A search or filter that matches nothing shows an empty state with a way to clear it, on Invoices and Expenses.
- [x] **UX-3** Must · Data views appear straight away with no empty or loading flash: records are read from browser storage before the first render, so no skeletons are needed. If loading ever becomes asynchronous, data views show skeleton rows and cards instead.
- [x] **UX-4** Must · Saving, marking as paid and importing each confirm with a toast, with undo where the PRD asks for it.
- [x] **UX-5** Must · The UI uses only glossary terms: no screen shows "Unpaid", "revenue", "billed" or accounting jargon.
- [x] **UX-6** Must · Settings is opened from the gear icon at the far right of the top bar, not from a main tab.
- [x] **UX-7** Must · Every screen is fully usable at 1280, 768 and 375 px wide with no sideways page scrolling.
- [x] **UX-8** Must · On mobile, summary cards stack and tables become card lists.
- [x] **UX-9** Must · Each screen has at most one primary action.
- [x] **UX-10** Must · The Phase 3 design review is passed: type, spacing, component states, charts and responsive layouts are portfolio quality.

## Accessibility

- [x] **A11Y-1** Must · Form fields have visible labels; each error is linked to its field, and submitting with errors moves focus to the first one (invoice and expense forms).
- [x] **A11Y-2** Must · Every flow works by keyboard alone, with visible focus and no focus traps.
- [x] **A11Y-3** Must · Text contrast is at least 4.5:1, and UI and chart elements at least 3:1. Field borders (inputs, selects, textareas) follow shadcn's default and rely on visible labels and the focus ring.
- [x] **A11Y-4** Must · A screen-reader spot check of each new screen passes: labels, statuses and form errors are announced.
- [ ] **A11Y-7** Nice · At 200% zoom every action is reachable without clipping.

## Data and persistence

- [x] **DATA-1** Must · Records and the currency are kept in browser storage and survive a reload.
- [x] **DATA-2** Must · If saved data can't be read, the app starts empty with a message instead of breaking.
- [x] **DATA-3** Must · If the browser refuses to save (for example, storage is full), a message says changes will be lost.
- [x] **DATA-4** Must · Settings says records live in this browser only.
- [x] **DATA-7** Must · "Clear all data" keeps the chosen currency.
- [x] **DATA-5** Must · Every amount is stored and summed as integer cents.
- [x] **DATA-6** Must · The app makes no network calls apart from loading its own files.

## Code quality

- [x] **CODE-1** Must · `npm run build` passes with no TypeScript errors (strict mode).
- [x] **CODE-2** Must · `npm run lint` reports no warnings or errors.
- [x] **CODE-3** Must · Calculation, form, import and storage logic lives in pure functions in `src/lib/`, covered by unit tests.
- [x] **CODE-4** Must · Components use theme colour tokens from `src/index.css`; no hard-coded colours.
- [x] **CODE-5** Must · No arbitrary pixel or rem values in the app's components (shadcn's generated files in `src/components/ui/` excepted): spacing and sizes come from Tailwind's scale or tokens in `src/index.css`.
- [x] **CODE-6** Must · Nothing from the out-of-scope list in `AGENTS.md` is in the app.
- [ ] **CODE-7** Nice · The production JavaScript bundle is under 500 kB, with no size warning on build.

## Testing

- [x] **TEST-1** Must · `npm test` passes with no failures or skipped tests.
- [x] **TEST-2** Must · Every calculation and behavior rule in the PRD has a unit test against the sample dataset.
- [x] **TEST-3** Must · Playwright tests cover the three core journeys: import records, understand the month, collect an unpaid invoice.
- [x] **TEST-4** Must · Tests, lint, the build and the Playwright journeys run in CI on every pull request, and a pull request is merged only once its CI run is green. This is checked by hand before merging, because branch protection isn't available on GitHub's free plan for private repositories.

## Git/GitHub workflow

- [x] **GIT-1** Must · Changes land on `main` only through pull requests from feature branches.
- [x] **GIT-2** Must · Each pull request gets a Vercel preview whose build succeeds before merging.
- [x] **GIT-3** Must · From #32 on (when this checklist and the verification log were added), each feature pull request links its story, includes a screenshot, checks off the Definition of Done items it completes and adds an entry to `docs/verification-log.md`.
- [x] **GIT-4** Must · The release commit is tagged `v1.0.0` with a note listing the delivered stories.

## Documentation

- [x] **DOC-1** Must · `docs/rules.md` and `docs/data-model.md` match the PRD.
- [x] **DOC-2** Must · `HANDOFF.md` says what is done and where to pick up next.
- [x] **DOC-3** Must · Scope and process decisions are logged in `docs/decisions.md`.
- [x] **DOC-4** Must · The README states the current status and links to the deployed app.
- [x] **DOC-5** Must · From a clean clone, `npm ci`, `npm run dev`, `npm test`, `npm run lint` and `npm run build` work as the README says.

## Deployment

- [x] **DEP-1** Must · `main` deploys to Vercel production and the deployment succeeds.
- [x] **DEP-2** Must · The production URL opens without a Vercel login, and the three core journeys pass a smoke test there.
- [x] **DEP-3** Must · Direct links such as `/settings` and `/invoices/INV-002` load on production.
- [x] **DEP-4** Must · Page title, description and favicon identify Studio Ledger.

## Portfolio/case study

- [x] **CASE-1** Must · The case study explains the problem, the user, the MVP scope and the non-goals, matching the PRD.
- [x] **CASE-2** Must · It shows the process (PRD, rough screens, design polish in code with no Figma, build, validation) with concrete decisions and tradeoffs.
- [x] **CASE-4** Must · It says plainly what was validated and what was assumed, including that discovery interviews were skipped.
- [x] **CASE-5** Must · Real desktop and mobile screenshots show the released app.
- [x] **CASE-6** Must · It links to the live demo and to the public repository.

## Future work

Not part of the MVP release (decided 2026-10-20, see `docs/decisions.md`). Former Nice items keep their IDs.

- [ ] **US-2.3 sorting** · Sort the invoice table by due date, amount and client (the Should item of US-2.3, now #41).
- [ ] **PB-27** · The chart's table can also be shown on screen, not only to screen readers.
- [ ] **A11Y-5** · A full screen-reader review of the three core journeys is done and its findings recorded.
- [ ] **A11Y-6** · Automated accessibility scans (axe) report no violations on every screen.
- [ ] **TEST-5** · The core journeys pass in Chromium, Firefox and WebKit.
- [ ] **DEP-5** · Production Lighthouse scores are 90+ for performance and 95+ for accessibility, with the test conditions recorded.
- [ ] **CASE-7** · A short walkthrough video shows the three core journeys.
- [ ] **CASE-3** · A usability test with 2–3 participants is run against the PRD success metrics, and the results are reported, including whether people preferred CSV import over typing records. Moved here on 2026-10-21: it couldn't be run before the release. The plan is in `docs/case-study.md`, section 8.
