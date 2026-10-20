# Verification log

Evidence for the items checked in [`docs/definition-of-done.md`](definition-of-done.md). Newest first. Each entry gives the date, the pull request or commit that was checked, the checklist items it supports, and what was actually verified. Record only what was run or seen, and say what was not covered.

## 2026-10-20 · Phase 3 design polish: fonts, chart colours, phone top bar, design pass

**Pull request:** the Phase 3 design polish PR (branch `design/phase-3-polish`, four commits: fonts, chart colours, phone top bar, design pass).

**Run on this branch:** `npx vitest run --dir src` (14 files, 148 tests passed, including the new phone menu test), `npm run lint` (no warnings or errors), `npm run build` (passed; same bundle size warning, now 916 kB), and the dev server reviewed in the browser on the sample data at 1280, 768 and 375 px. Before and after screenshots: `docs/screenshots/before/` and `docs/screenshots/after/` (full page, 1280 and 375 px wide, plus `after/menu-phone.png` with the phone menu open).

**No checklist items checked.** This PR affects the items below, but none is fully covered yet.

| Items | What was verified | Why it stays open |
| --- | --- | --- |
| UX-7 | At 375, 768 and 1280 px, the page's `scrollWidth` equals the viewport width on Overview, Invoices, Expenses, Import and Settings (before: 459 px at 375, caused by the top bar). The phone captures are 375 px wide; the before set was 457–459 px. | Dialogs, panels and import steps 2–4 were not measured at every width, and tables still scroll sideways inside their card on phones (see UX-8). |
| UX-10 | The design pass ran on every page (spacing, borders, corners, type), and every page was compared with its before screenshot. | The design review itself is a person's call on the Vercel preview. |
| A11Y-3 | Contrast worked out from the new tokens: Received blue 4.9:1 and Expenses grey 9.2:1 on white (chart elements need 3:1); Paid 4.8:1, Pending 5.0:1 and Overdue 5.3:1 as text on their 10% badge tint. | Only the chart and status colours were checked, not every text and UI element. |
| A11Y-2 | Phone menu in the browser (a shadcn dropdown opened by a menu button on the left of the top bar): Escape closes it and focus goes back to the button, and choosing an item navigates and closes it. `settings.test.tsx` "on phones, a menu button opens the tabs and Settings, and picking one closes it" checks the items (Overview, Invoices, Expenses, Import, a divider, then Settings as text with no icon), `aria-current` on the current page, and that choosing Settings opens it. | Only the new menu was checked, not every flow. |
| UX-6 | From md up, Settings is still the gear at the far right of the top bar. On phones the gear is hidden, and Settings is the last menu item, below a divider (asked for in the PR review). | The item's wording only describes the gear; whether the phone menu meets it is for the reviewer. Left as checked. |
| UX-1, CODE-4 | Still true after the change: badges still read Paid, Pending or "Overdue · N days"; new colours are tokens in `src/index.css` (`--chart-received`, `--chart-expenses`, status tokens). | Already checked. |
| DATA-6 | Inter and Inter Tight are self-hosted from `@fontsource-variable` and bundled by Vite, so the fonts need no request to a font service. | The whole app's network use was not audited. |

**Review changes (same day, verified in Chromium at 375 and 1280 px):**

| Change | What was verified |
| --- | --- |
| Primary buttons in the Received blue (`--action`, `--action-hover`) | "Add invoice" and the panel's "Mark as paid" compute to `oklch(0.55 0.15 255)`, hover to `oklch(0.49 0.14 255)`; white text 4.9:1 and 6.3:1. Outline buttons stay white and "Clear all data" keeps its destructive tint. |
| Checked radios in the same blue | The checked Import type radio computes to the blue at both widths; the selected tile's border is blue too (Import, Settings). |
| White fill for dropdowns and text fields | Select triggers, Input and Textarea were `bg-transparent` in shadcn, so they showed the tinted page; they compute to white now (Expenses filters, Overview period, Invoices search). |
| Import stepper on one line on phones | At 375 px the stepper is one 24 px line and only the current step's label shows; the others keep theirs for screen readers. All four labels show at 1280 px. |
| Form dialog buttons stacked on phones | Add invoice at 375 px: "Add invoice" above "Cancel", both 311 px wide. The confirm dialogs already stacked (shadcn footers). |
| Sample CSV link no longer looks disabled | Its text computes to the foreground colour instead of muted grey. |
| No hover underline | `text-decoration-line` on a hovered invoice number is `none`; the Button and Badge link variants dropped `hover:underline`. |
| Panel actions at the bottom; panels full width on phones | Chromium, invoice INV-038 (unpaid), INV-037 (paid), INV-002 from the Overview, and an expense: the footer sits at the bottom of the panel, with Mark as paid or Mark as not paid at full width, then Edit and Delete side by side, then Go to Invoices on the Overview. The panel is 375 px wide at 375 px (was ¾ of the screen, so buttons wrapped) and 448 px at 1280 px. |
| Required-field tooltip test | Made reliable by hovering before clicking (Radix closes a tooltip on click). Eight full `npx vitest run --dir src` runs passed in a row. |

**Found and fixed in this PR:** the import preview's counts (Valid rows, Rows with errors, Duplicates) had shrunk to small text, because the design pass gave their tiles the `sm` card size, whose title style overrides `text-3xl`. They use the default size again; checked in the browser at 1280 px (30 px figures).

**Found, not fixed:**

- On phones the Outstanding table and the Invoices and Expenses tables still scroll sideways inside their card, so Outstanding's due date and status are cut off until you scroll. Card lists on mobile are UX-8.
- On this machine, `npm test` also runs the tests in a stale Claude worktree (`.claude/worktrees/objective-brattain-ce353b`, at ad8c55d): 28 files, 19 failures, all in that copy. The branch's own suite passes with `npx vitest run --dir src`. Removing that worktree, or excluding `.claude/**` in the Vitest config, would fix it.

**Not verified:** the Vercel preview (checked after the PR opened), dark mode (out of scope), widths other than 375, 768 and 1280 px, and the chart tooltip on touch.

## 2026-10-20 · Chart axis labels on one line (PB-24)

**Pull request:** the one that fixes the BAM axis labels (stacked on the Definition of Done PR).

**Run on this branch:** `npm test` (14 files, 147 tests passed), `npm run lint` (exit 0, no warnings), `npm run build` (passed; same 914 kB bundle warning), and the dev server reviewed in the browser on the sample data, "Last 6 months".

| Items | What was verified |
| --- | --- |
| PB-24 | The Y axis of "Received and Expenses" now sizes itself to its longest tick (`width="auto"` instead of 64), and BAM ticks use a non-breaking space before "KM". `money.test.ts` "formatAxisMoney" checks `$14,000`, `€14,000`, `14.000 KM` and `0 KM` with no breaking space. Preview at 1280 px and 375 px in USD, EUR and BAM: every tick ($0 to $14,000, €0 to €14,000, 0 KM to 14.000 KM) renders as one line (one `tspan` each), and none starts left of the chart's edge. Screenshots: `docs/screenshots/bam-axis-1280.jpg`, `docs/screenshots/bam-axis-375.jpg`. |

**Found, not fixed:** at 375 px the top bar (tabs and the Settings gear) is wider than the screen (459 px), so the page scrolls sideways. This was already there and is not caused by the chart.

**Not verified:** widths other than 1280 and 375 px; periods with much larger amounts (for example six-digit ticks); the Vercel preview.

## 2026-10-20 · Baseline at `main` 96d7b23 (after #31)

**Pull request:** the one that adds the Definition of Done (docs only; no app code changed).

**Run on this commit:** `npm test` (14 files, 144 tests passed, none skipped), `npm run lint` (exit 0, no warnings), `npm run build` (`tsc -b` and `vite build` passed; one warning that the JavaScript bundle is 914 kB), and the dev server reviewed in the browser with fresh browser storage.

| Items | What was verified |
| --- | --- |
| PB-1, PB-2, PB-3 | `calculations.test.ts`: Received per month by paid date, Outstanding snapshot (9 invoices, $14,620.00) on 2026-10-19. `invoices.test.ts`: "moves an invoice into Received for its paid date and out of Outstanding" and "setting back to Unpaid clears the paid date and removes it from Received". |
| PB-4 | `calculations.test.ts` "treats yesterday as Overdue and today as Pending": INV-036 Overdue, INV-038 (due today) Pending, INV-001 Paid. |
| PB-5, PB-6, PB-7 | `calculations.test.ts`: monthly Received, Expenses and Net income, "—" when the previous value is 0 or Net income was 0 or negative, equal-length previous period, 0 for an empty month. `money.test.ts`: minus sign for negative amounts. Preview: the chart table shows August 2026 Net income as -$2,584.87 and October 2026 as $0.00. |
| PB-8 | `invoice-form.test.ts` "editing a paid invoice amount and paid date changes past totals immediately"; `invoice-form.test.tsx` checks the same through the panel and the dashboard. |
| PB-9, PB-10 | `import.test.tsx` "imports the invoice sample end to end and the dashboard shows it". `csv-import.test.ts`: all four date formats, dot and comma decimals, European file, creating missing clients. Preview: `public/samples/studio-ledger-invoices-sample.csv` gave 4 valid rows, "4 invoices imported", new client Harbour Light Theatre, ledger went from 41 to 45 invoices. |
| PB-11 | `csv-import.test.ts` "names the row, field and problem for each error"; `import.test.tsx` "reports errors and duplicates, and imports only the valid rows". |
| PB-12 | `csv-import.test.ts`: duplicates in the ledger and earlier in the file, for invoices and expenses. Preview: imported the same sample file a second time; the preview showed 0 valid, 0 errors, 4 duplicates, every row "Duplicate", and no import button. Expense re-import was checked by unit test only. |
| PB-13 | `csv-import.test.ts` "blocks the next step for unmatched required fields or a field used twice"; `import.test.tsx` "blocks the next step until required fields are matched". |
| PB-14 | `csv-import.test.ts`: "accepts .csv files up to 5 MB", "rejects empty files and more than 5,000 rows" (empty, header-only, 5,001 rows). `import.test.tsx` "refuses a file that is not a CSV". |
| PB-15 | `import.test.tsx` "cancel goes back to upload without importing". |
| PB-16 | `settings.test.tsx` "a first visit opens on the sample data, with no banner". Preview with empty storage: Overview opened on the sample, no banner, Received $47,160.00. |
| PB-17, PB-18 | `settings.test.tsx`: "clears all data after a confirmation that names what goes", "after clearing all data, a later visit stays empty", "after clearing, the empty state offers Load sample data and the dashboard fills straight away", "shows first-use states on Invoices and Expenses". |
| PB-19 | `settings.test.tsx` "asks before replacing existing records with the sample" (confirmation only). Preview: with the sample already loaded, Settings → Load sample data → Replace with sample data left storage with exactly 6 clients, 41 invoices and 120 expenses. |
| PB-20, PB-21 | `money.test.ts` "formats each currency without converting"; `settings.test.tsx` EUR and BAM on the Overview. |
| PB-22 | Preview in EUR: 0 "$" on the Overview (cards, Outstanding, axis ticks €0 to €14,000, chart table), Invoices with the INV-002 panel open, and Expenses ("120 expenses · €11,770.14"). In BAM: 0 "$" or "€" on the Overview (Received "47.160,00 KM") and Expenses ("120 expenses · 11.770,14 KM"). Reload kept the choice (`settings.test.tsx` covers it too). |
| PB-25 | Preview: the screen-reader table "Received, Expenses and Net income per month" has 6 rows (May to October 2026). Received sums to $47,160.00 and Expenses to $10,154.67, matching the cards. |
| UX-1 | `App.test.tsx` "lists who owes money with a text status, Overdue first" (badges read "Overdue · N days" or "Pending"). |
| UX-2 | `invoices.test.tsx` "searches invoice number and client name, with an empty state"; `expenses.test.tsx` checks "No expenses match these filters." and Clear filters. |
| UX-6 | `settings.test.tsx` "Settings is an icon on the right of the top bar, not a main tab". |
| A11Y-1 | `invoice-form.test.tsx` "shows inline errors and moves focus to the first one" (error is the field's accessible description); `expenses.test.tsx` "validates inline…" (focus on Amount). |
| DATA-1, DATA-2 | `storage.test.ts`: read back what was saved, unreadable data starts empty with a message, currency default and saved value. `settings.test.tsx`: "records survive a reload", currency survives a reload. |
| DATA-4 | Preview: Settings reads "Records are kept in this browser only, so clearing site data or using another browser won't show them." |
| DATA-5 | `money.test.ts` "parses dot-decimal amounts into integer cents"; calculation tests assert exact cent totals. |
| CODE-1, CODE-2, TEST-1 | The commands listed above. |
| CODE-3 | Logic in `src/lib/` (calculations, csv-import, expense-form, invoice-form, invoices, money, format, storage), each with a test file. |
| CODE-4 | Searched `src` outside `components/ui` for hex colours: none. |
| GIT-1, GIT-2 | PRs #27 to #31 merged into `main` from feature branches. PR #31's Vercel preview status: success. |
| DEP-1 | Vercel status on `main` 96d7b23: "Deployment has completed". The production URL itself was not opened. |
| DOC-1 | Read `docs/rules.md` and `docs/data-model.md` against the PRD: glossary, calculations, periods, edge cases, currency formats and CSV formats match. |
| DOC-2, DOC-3 | `HANDOFF.md` describes the current state after #31 and is updated in this PR; `docs/decisions.md` has today's entry for this checklist. |

**Found, not fixed (items left open):**

- PB-24: in BAM the chart's axis ticks wrap onto two lines ("14.000" over "KM") at the default desktop width. The amounts are correct; the layout breaks. (Fixed later; see the PB-24 entry above.)
- CODE-5: components use arbitrary values such as `ring-[3px]` and `min-w-[26rem]` to `min-w-[52rem]` on tables.
- CODE-7: the bundle is 914 kB.
- TEST-2: the rule "a client with invoices cannot be deleted" has no test (client management, US-2.5, is not built).
- UX-3: no screen uses skeletons yet. UX-8: mobile card lists are not built yet (see `HANDOFF.md`).
- UX-5: the banned-terms test covers the Overview only.

**Not verified:** chart tooltips, form and dialog amounts, and import screens in other currencies (PB-23); clearing keeps the currency (DATA-7); the storage-full message (DATA-3); keyboard-only use of every flow, contrast, screen readers; mobile and tablet widths; no network calls; the production URL; a clean `npm ci`.
