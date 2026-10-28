# Verification log

Evidence for the items checked in [`docs/definition-of-done.md`](definition-of-done.md). Newest first. Each entry gives the date, the pull request or commit that was checked, the checklist items it supports, and what was actually verified. Record only what was run or seen, and say what was not covered.

## 2026-10-28 · Release v1.0.0 (GIT-4)

**Pull request:** the GIT-4 PR (branch `docs/git-4-release`), after #61.

| Items | What was verified |
| --- | --- |
| GIT-4 (newly checked) | **The tag:** `v1.0.0` is an annotated tag on 40bde3b, the merge commit of #61, the last pull request before the release. Before tagging, CI on that commit (run 40766883120, `push` to `main`) concluded **success**. `git ls-remote` shows `refs/tags/v1.0.0^{}` at 40bde3bb4ad44aad2cc33c218fa79059390f82e8. **The note:** the tag message and the GitHub release (https://github.com/begovacamina-source/studio-ledger/releases/tag/v1.0.0, published, not a draft or pre-release, and the repository's latest release) list every delivered story with its issue and pull requests: US-1.1–US-1.3, US-2.1–US-2.5, US-3.1, US-3.2, US-4.1–US-4.4, US-5.1 and US-5.2. Each story's pull requests come from the GitHub issues and the pull request titles. They also list what isn't in the release: US-1.4, table sorting (#41), the usability test (CASE-3) and the PRD's out-of-scope list. With GIT-4 checked, every Must item in `docs/definition-of-done.md` is checked. |

**Not verified:** this log entry and the GIT-4 tick land after the tag, so `v1.0.0` itself shows GIT-4 unchecked; the release notes say so. The production deployment of 40bde3b wasn't checked again; that commit changed only docs.

**Found, not fixed:** none.

## 2026-10-28 · Case study (CASE-1, CASE-2, CASE-4, CASE-5, CASE-6)

**Pull request:** the case study checks PR (branch `docs/case-study-checks`), after #60.

| Items | What was verified |
| --- | --- |
| CASE-1 (newly checked) | `docs/case-study.md` sections 1–3 compared with `docs/PRD.md`. The problem's three consequences and the primary user goal match the PRD's Problem statement. The persona Maja, her table and the four jobs to be done match Target users, and the persona is marked as an assumption. The MVP table covers the five feature areas and the three core journeys. The Non-goals table covers all ten rows of the PRD's "Out of scope for MVP", with the same reasons. |
| CASE-2 (newly checked) | Section 4 covers each stage in a table with dates and pull requests: PRD and foundation (#18–#21), rough screens as working features (#22–#31), design polish in code with no Figma (#33, #36, #37, #49), build (#39, #40), quality (#45–#51), and validation moved to after v1.0. It says plainly that the phases overlapped instead of following the planned gates. Section 5 gives the decisions and trade-offs (cash received, integer cents, one currency, no partial payments, browser-only storage, first-visit sample, import matching, undo in the panel, card breakpoints, field borders, scope cuts). |
| CASE-4 (newly checked) | Section 7 opens with "Discovery interviews were skipped" (decided 2026-10-19), and its table marks two claims validated, with how they were checked, and five as assumed. Section 8 says the app hasn't been tested with users and that the usability test (CASE-3) moved to after v1.0. |
| CASE-5 (newly checked) | Section 9 shows 8 screens at 1280 px and at 375 px, plus two full-page Overviews. All 18 files in `docs/screenshots/release/` exist, and every image the case study references is there. They were taken on production for #53 (see the UX-10 entry). Since the screenshot commit (afc352e), the only commits on `main` outside `docs/` change `src/test/setup.ts` and the case-study PDF script and its dev dependencies. No app code changed, so they still show the released app. |
| CASE-6 (newly checked) | The header and "Seeing the code" link to https://studio-ledger-rho.vercel.app and https://github.com/begovacamina-source/studio-ledger. Both returned HTTP 200 to an unauthenticated request on 2026-10-28, the live page's title is "Studio Ledger", and `gh repo view` reports the repository's visibility as PUBLIC. |
| All five | The project owner reviewed the final case study (with #59 and #60 merged) and reported being happy with it. |

**Not verified:** the links inside `docs/case-study.pdf` weren't clicked; the PDF was checked only by extracting its text in #59 and #60. The screenshots weren't retaken. The case study doesn't list two of the PRD's goal-level non-goals ("processing payments" and "serving teams and agencies"), though it does say it isn't accounting software. The owner's review notes weren't recorded.

**Found, not fixed:** none left. Section 4's stage table said "The design review (UX-10) comes before the release", which was out of date because UX-10 was done on 2026-10-21. Fixed after the release on branch `docs/case-study-ux-10-line`, which removes the sentence and rebuilds `docs/case-study.pdf`; the `v1.0.0` tag still has the old wording.

## 2026-10-21 · Design review (UX-10)

**Pull request:** the UX-10 and repository access PR (branch `docs/ux-10-and-repo-access`).

| Items | What was verified |
| --- | --- |
| UX-10 (newly checked) | The project owner did the Phase 3 design review on production (https://studio-ledger-rho.vercel.app), with #54 merged, and reported being happy with it: type, spacing, component states, charts and responsive layouts are portfolio quality. The release screenshots in `docs/screenshots/release/` (1280 and 375 px, taken on production for #53) show the reviewed design; nothing changed in the app after them. |

**Not verified:** the owner's review notes weren't recorded, so the log doesn't say which screens or widths were looked at.

**Found, not fixed:** none. Separately, CI on `main` after #54 failed with an uncaught `window is not defined` from Sonner's toast timer after `src/pages/undo-paid.test.tsx` finished (all 223 tests passed). #54 had been merged while its own CI run was still in progress. `src/test/setup.ts` now waits out Sonner's 200 ms unmount delay at the end of each test file. The failure didn't reproduce locally (three runs passed before and after the change), so this PR's CI run is the check.

## 2026-10-21 · VoiceOver pass (A11Y-4)

**Pull request:** the A11Y-4 docs PR (branch `docs/a11y-4-voiceover`), after #51.

| Items | What was verified |
| --- | --- |
| A11Y-4 (newly checked) | **Listening:** the 18-step VoiceOver pass in `docs/screen-reader-check.md` was done by the project owner in Safari, on the preview for #51, with the sample data. Reported: all 18 steps passed. That covers page titles and the page-change announcement, headings on the Overview and Settings, the Period menu, the key figures, Outstanding rows and the invoice panel with statuses in words, Mark as paid with its announcement and Undo, Escape returning focus, the invoice search count, status tabs, the add-invoice form's errors read with each field, the expenses count and total, the import steps and file field, and the currency radios. **In code:** `e2e/screen-reader.spec.ts` (merged in #51) checks the same on every page, and passes in CI. |

**Not verified:** NVDA or JAWS on Windows, and VoiceOver on iOS. The macOS and Safari versions weren't recorded. The result is the owner's report; there's no recording of the session.

**Found, not fixed:** none.

## 2026-10-21 · Screen-reader check, automated half (A11Y-4 not yet checked)

**Pull request:** the screen-reader PR (branch `a11y/screen-reader-check`).

**Run on this branch:** `npm run test:e2e` (60 passed, twice), `npm test` (26 files, 223 passed), `npm run lint` (no warnings or errors), `npm run build`.

| Items | What was verified |
| --- | --- |
| A11Y-4 (not checked) | **Read through:** the accessibility tree (what a screen reader reads) of every page, the invoice and client panels, both forms with errors, Mark as paid, and the import's upload, match and preview steps. **Found and fixed:** every page had the title "Studio Ledger" and moving to another page announced nothing; the section titles (Received and Expenses, Outstanding, Currency, Sample data, Your data) weren't headings; the Outstanding, Invoices, Clients and Expenses tables had no names; the import steps list had no name; and a search or status tab on Invoices gave no feedback. **Now tested** in `e2e/screen-reader.spec.ts`: each page's title and level-1 heading, its section headings, a name on every table, and axe's naming and ARIA rules (button, link, field, select, switch and command names, valid ARIA, lists, title, language, one main landmark, one level-1 heading) with no violations on all six pages; "Invoices page" is announced after moving there; statuses read as words in Outstanding, Invoices and the panel; form errors make the field invalid and describe it, with focus on the first one, and Mark as paid's error is an alert; and live updates for the invoice count ("41 invoices" → "6 invoices"), "INV-002 marked as Paid" in the panel and the toasts, and the current import step. `src/lib/pages.test.ts` covers page names. **Still to do:** the VoiceOver pass in `docs/screen-reader-check.md`, which needs a person; A11Y-4 is checked only after it. |
| DEP-4 (already checked) | The title now names the page first ("Overview · Studio Ledger"), so it still identifies Studio Ledger; `e2e/page-identity.spec.ts` is updated to match. |

**Not verified:** a real screen reader (VoiceOver or NVDA); the accessibility tree is what they read, but not how they say it.

**Found, not fixed:** none.

## 2026-10-20 · No network calls (DATA-6), every Must story (PB-28), and the PR audit (GIT-3)

**Pull request:** the release checks PR (branch `release/data-6-pb-28-git-3`).

**Run on this branch:** `npm run test:e2e` (50 passed), `npm test` (25 files, 222 passed), `npm run lint` (no warnings or errors), `npm run build`.

| Items | What was verified |
| --- | --- |
| DATA-6 (newly checked) | `e2e/network.spec.ts` records every request while it uses each part of the app: the Overview (period, chart hover, Outstanding panel, mark paid), every page and an invoice panel, the currency switch, the add-invoice form's errors, a CSV import, Clear all data and Load sample data. Every request goes to the app's own origin, there are no WebSockets, and the run saw real traffic (page, scripts, styles, fonts). A copy that adds one `fetch` to another host failed, showing that URL. The source has no `fetch` and no outside URLs; fonts are bundled through `@fontsource-variable`. **Production:** https://studio-ledger-rho.vercel.app loaded only its page, one script, one stylesheet and two fonts, all from its own origin, with no Vercel analytics script. This browser's saved production data was removed afterwards. |
| PB-28 (newly checked) | All 14 Must issues are closed (#1–#3, #5–#8, #10–#15, #17, #19); only #4 (US-1.4, Should) and #41 (future work) are open. Each Must criterion in `docs/PRD.md` matched to a passing test: **US-1.1:** four cards and the Outstanding snapshot (`App.test.tsx`), the five periods (new test), figures by period with Outstanding unchanged (core journey 2), "N invoices · N overdue" (journey 2), changes versus the previous period and the calculation rules (`calculations.test.ts`, `format.test.ts`). **US-1.2:** bars per month, the hover tooltip and the screen-reader table (journey 2). **US-1.3:** Overdue first then by due date (`calculations.test.ts`, `App.test.tsx`); at most 10, saying how many and linking to Invoices (new test, with 14 owed); client, amount, due date and status (`phone-lists.test.tsx`); a row opens the invoice (`invoices.test.tsx`). **US-2.1:** fields, a new client, inline validation, due date not before issue date, unique number (`invoice-form.test.ts`, `invoice-form.test.tsx`). **US-2.2:** Mark as paid from the list and the panel, paid date defaults to today and can't be before the issue date, the dashboard updates, back to not paid clears the paid date, and Undo for 5 seconds (`invoices.test.tsx`, `invoices.test.ts`, `undo-paid.test.tsx`, journey 3). **US-2.3:** tabs with counts and search (`invoices.test.tsx`); 10 per page, kept in the URL, on desktop and phones (`invoices.test.tsx`, `phone-lists.test.tsx`); a tab or search goes back to page 1 (new test). **US-2.4:** delete after confirmation, and editing a paid invoice changes past totals (`invoice-form.test.tsx`, `invoice-form.test.ts`). **US-3.1:** fields, the fixed categories, amount above 0 (`expense-form.test.ts`, `expenses.test.tsx`). **US-3.2:** period (All time first) and category filters, count and total, 10 per page in the URL, delete after confirmation (`expenses.test.tsx`). **US-4.1:** .csv up to 5 MB and 5,000 rows, the record type, and a sample CSV that downloads for each type (`csv-import.test.ts`, new `e2e/sample-downloads.spec.ts`, which compares each download with the file in the repo). **US-4.2:** auto-matching, blocked until required fields are matched, switching a column off, date format and decimal separator suggested and confirmed (`csv-import.test.ts`, `import.test.tsx`). **US-4.3:** every row 10 per page with the summary, "Row N: field problem", import valid rows only or cancel, duplicates skipped (`import.test.tsx`, `csv-import.test.ts`). **US-4.4:** the success screen counts and links to the Overview, and new clients are created (`import.test.tsx`, journey 1). **US-5.1:** the sample's 6 clients, 41 invoices and 120 expenses from `data/`, all marked as sample (new assertion), on a first visit, replace after confirmation, clear after a confirmation that names what goes, stays empty later, and the dashboard updates (`settings.test.tsx`, `storage.test.ts`, `calculations.test.ts`). **US-5.2:** USD, EUR or BAM, formatting only, the three formats, kept after a reload (`settings.test.tsx`, `money.test.ts`, `currency.test.tsx`). |
| GIT-3 (newly checked, reworded) | Reworded to cover pull requests from #32 on, when the checklist and the log were added (decided on #50; see `docs/decisions.md`). Every merged pull request was read (#18–#49). Every feature pull request from #32 on links its story or says it has none, has a screenshot, fills in the Definition of Done table and adds a log entry: #33, #36, #37, #39, #40, #43, #47, #49. The earlier feature pull requests, #24–#31, have no log entry (the log didn't exist yet), and #29 and #30 have no Definition of Done table; their stories' evidence is the PB-28 audit above. |

**Not verified:** the US-1.4 Should story is still open (#4), as planned. US-4.2's "Don't import" is the Import switch per column, decided on #27.

**Found, not fixed:** none.

## 2026-10-20 · shadcn field borders and 36 px controls (A11Y-3 reworded)

**Pull request:** the borders and sizes PR (branch `design/shadcn-borders-and-sizes`).

**Run on this branch:** `npm run test:e2e` (47 passed, twice), `npx playwright test e2e/keyboard.spec.ts --repeat-each=3` (45 passed), `npm test` (25 files, 219 passed), `npm run lint` (no warnings or errors), `npm run build`. Screenshots: `docs/screenshots/sizes/` (before and after).

| Items | What was verified |
| --- | --- |
| A11Y-3 (stays checked, reworded) | Reworded because field borders now follow shadcn's default, as decided on this PR (see `docs/decisions.md`). `--input` is back to `oklch(0.922 0 0)`, so an empty field's edge is about 1.2:1; the field-border check is removed from `e2e/non-text-contrast.spec.ts`. Still checked, and passing: text contrast with axe on every page and panel at 1280 and 375 px (24 tests), radios (now `border-muted-foreground`, since they shared the field colour and fell to 1.26:1), switches, focus rings, chart bars, the selected tab and the current page. Every Tab stop in the keyboard suite still has a focus indicator of at least 3:1. |
| A11Y-1, A11Y-2 (already checked) | Every field still has a visible label. The keyboard suite passes with the 36 px controls. |
| UX-7 (already checked) | At 1280, 768 and 375 px, on `/`, `/invoices`, `/invoices/INV-002`, `/clients`, `/expenses`, `/import` and `/settings`: no page scrolls sideways and no button, field or link sticks out past the window. Buttons, inputs, selects and the tab bar measure 36 px; the explicit `sm` buttons stay 28 px. |

**Not verified:** Firefox and Safari; the Vercel preview (check it before merging).

**Found, not fixed:** the chart-bar contrast check sometimes read a bar colour as empty while Recharts was still drawing; it now waits until both colours resolve (10 of 10 runs passed). One keyboard run of 3 had 2 failures while the whole run took 1.4 minutes instead of about 26 seconds; a rerun passed 45 of 45, so it looks like a slow machine, not the app.

## 2026-10-20 · Page identity (DEP-4), README (DOC-4) and a clean clone (DOC-5)

**Pull request:** the release docs PR (branch `release/dep-4-doc-4-doc-5`).

| Items | What was verified |
| --- | --- |
| DEP-4 (newly checked) | The favicon was still Vite's logo. It is now a Studio Ledger icon (`public/favicon.svg`: ledger rows on the app's blue, with the title "Studio Ledger"), with `favicon-32.png` and `apple-touch-icon.png` rendered from it. `index.html` has the title "Studio Ledger" and a description (plus `og:title` and `og:description`). `e2e/page-identity.spec.ts`: the title and description are there, and all three icons load with the right type. The 32 px icon was checked by eye. |
| DOC-4 (newly checked) | The README starts with the live app link (https://studio-ledger-rho.vercel.app, answered 200) and a status line that matches HANDOFF: Phase 3, every MVP screen built, and what's left before v1.0.0. The scope table now has the Clients page and Settings. |
| DOC-5 (newly checked) | A fresh `git clone` of commit 3d34956 into an empty folder (no `node_modules`), Node 24.21.0, running the README's commands in order: `npm ci` (exit 0), `npm test` (25 files, 219 passed), `npm run lint` (exit 0, no warnings), `npm run build` (built, `dist/` has the page, icons and samples), and `npm run dev` (served the page; in a new browser tab with no saved data it opened on the sample, Received $47,160.00 and Outstanding $14,620.00). The README now says `npm ci` instead of `npm install`, and that the dev server uses the next free port when 5173 is taken, which happened here. |

**Not verified:** the README commands on Windows or Linux (macOS only), or on Node 22 (the stated minimum); the new icon on the production site until this is merged.

**Found, not fixed:** the build warns that the main JavaScript chunk is 948 kB (289 kB gzipped), which is over 500 kB; that's CODE-7 (Nice). `npm ci` notes that `fsevents` has install scripts that weren't approved; it's an optional macOS file watcher, and nothing failed. One full Playwright run had the `/clients` text-contrast test fail once at 1280 px. It didn't come back in 4 repeats of the contrast file and 2 full runs, and its message wasn't kept, so the cause is unknown. The keyboard test's select helper also failed 2 times in 5 (it pressed Home before Radix had moved focus to the chosen option); it now waits for each focus move, and passed 5 out of 5.

## 2026-10-20 · Keyboard (A11Y-2), contrast (A11Y-3) and sizes (CODE-5)

**Pull request:** the accessibility PR (branch `a11y/keyboard-contrast-and-sizes`).

**Run on this branch:** `npm run test:e2e` (47 passed: 3 journeys, 24 text contrast, 5 non-text contrast, 15 keyboard; the keyboard file also passed twice in a row with `--repeat-each=2`), `npm test` (25 files, 219 passed), `npm run lint` (no warnings or errors), `npm run build`. Screenshots: `docs/screenshots/a11y/`.

| Items | What was verified |
| --- | --- |
| A11Y-2 (newly checked) | `e2e/keyboard.spec.ts`, with no clicks, only Tab, Shift+Tab, Enter, Space, arrows and Escape. **Every page** (`/`, `/invoices`, `/clients`, `/expenses`, `/import`, `/settings`): Tab goes through the whole page and out (no trap), and every stop has an outline or ring of at least 3:1 against what's next to it. **Flows:** the top-bar tabs and Settings icon; the phone menu (arrows, Enter, Escape returns focus to the button); the Overview period select, then an Outstanding invoice opened, marked paid, undone from the panel, and closed with Escape with focus back on its row; Invoices pagination, status tabs by arrows, search, panel Edit and Cancel, Delete with Escape (focus back on Delete) and then confirmed; Add invoice with a new client, typed number and amount, and a due date set by arrows; Expenses category filter, Add expense, opening it and deleting it; Clients panel and its delete confirmation closed with Escape; Import type radios by arrows, the file field (reachable with visible focus), a field menu opened and closed, a switch toggled with Space, Preview, Import and Go to Overview; Settings currency by arrows, Clear all data and Load sample data. **Fixed on the way:** fast typing in invoice search dropped letters ("Lumen" became "Lun"), because the field read its text back from the URL; closing the panel after mark paid and undo lost focus, because the Outstanding row is redrawn; no visible focus on tab panels, menu items, select options, toasts, destructive buttons, and a date field's calendar button. |
| A11Y-3 (newly checked) | **Text:** `e2e/contrast.spec.ts` runs axe's `color-contrast` rule at 1280 and 375 px on all six pages, `/invoices?status=overdue`, invoice panels INV-001 (paid) and INV-039 (pending), a client and an expense panel, form errors with a toast and a delete confirmation, the import match and preview steps with a CSV holding an error and a duplicate, and the empty state after clearing: no violations, after darkening muted text (4.34 → over 4.5 on grey), red (4.0 on its tint), Paid (4.47) and Pending (4.36 on a selected row). **UI and charts (3:1):** `e2e/non-text-contrast.spec.ts` measured field borders 4.08–4.29, radios 4.29–4.92, switch off 3.59 and on 17.93, focus rings 4.50–4.74, chart bars 4.92 (Received) and 8.48 (Expenses), the selected status tab's text against another tab 3.77, and the current page link against another link 3.61. Every Tab stop in the keyboard suite is also checked at 3:1. |
| CODE-5 (newly checked, reworded) | Reworded to leave out shadcn's generated files in `src/components/ui/` (decided on this PR), which keep their own values, for example `h-[calc(100%-1px)]` in tabs. The 19 arbitrary values in app components are gone: `ring-[3px]` → `ring-3`, `min-w-[52rem]` and the other table widths → Tailwind's scale (`min-w-208`, `min-w-192`, `min-w-160`, `min-w-144`, `min-w-104`), and the panel grid and dialog height → tokens `--details-columns` and `--dialog-max-height` in `src/index.css`. A search of `src/` outside `src/components/ui/` for bracketed px, rem, em, vh, svh or % values, and for inline `style` sizes, finds none. |

**Not verified:** Firefox and Safari (only Chrome); a screen reader (A11Y-4); the system file picker, which isn't part of the page (the file field's focus is checked, and the file is set directly); keyboard flows on the phone card lists beyond the menu; contrast at 200% zoom (A11Y-7).

**Found, not fixed:** Escape pressed in the first ~50 ms after a confirmation opens closes the panel behind it too (a Radix timing window, faster than anyone can press; the test waits for the fade-in).

## 2026-10-20 · Playwright core journeys (TEST-3) and CI (TEST-4)

**Pull request:** the CI and Playwright PR (branch `test/ci-and-e2e`).

**Run on this branch:** `npm run test:e2e` (3 journeys passed against `vite preview`, Chrome, 1280 × 800, clock fixed at 2026-10-20 12:00), `npm test` (25 files, 219 tests passed; Vitest now skips `e2e/`), `npm run lint` (no warnings or errors), `npx tsc -b` (now also checks `playwright.config.ts` and `e2e/`).

| Items | What was verified |
| --- | --- |
| TEST-3 (newly checked) | `e2e/core-journeys.spec.ts`, each test in a fresh browser profile on the sample data. **Import records:** the sample invoice file auto-matches, previews 4 valid / 0 errors / 0 duplicates, imports ("4 invoices imported", new client Harbour Light Theatre), and the Overview shows Outstanding $18,420.00, "12 invoices · 7 overdue" and Received $48,610.00; importing it again shows 4 duplicates and no import button. **Understand the month:** opens on Last 6 months with the five sample figures; Last month shows $13,230.00, $2,084.56 and $11,145.44 with Outstanding unchanged; hovering the chart shows September's exact figures, and the screen-reader table has the same row. **Collect an unpaid invoice:** INV-002 opens from the Outstanding list ("Overdue · 179 days"), Mark as paid defaults to 2026-10-20, Undo in the toast puts it back, marking it again leaves Outstanding $13,770.00, "8 invoices · 5 overdue" and Received $48,010.00, and a reload keeps it. A deliberately wrong expectation ($13,771.00) made the journey fail with the real value shown, then was restored. |
| TEST-4 (newly checked, reworded) | Reworded because branch protection isn't available on GitHub's free plan for private repositories: CI runs on every pull request, and merging waits for a green run, checked by hand (the PR template now has "CI is green on the latest commit"). Evidence: GitHub Actions run 39491141775 for this pull request (`pull_request` event, commit a97b6cf) concluded **success** in 1m42s, with every step green: install, lint, unit and component tests (25 files, 219 passed), type-check and build, Chromium install, core journeys (3 passed), report upload. |

**Not verified:** Firefox and WebKit (TEST-5, future work); phone widths in Playwright.

## 2026-10-20 · UX-7 and UX-9 after the review decisions

**Pull request:** the checklist checks PR (#43), after the decisions on it: the invoice list becomes a card list below 1024 px, and UX-9 is reworded to "at most one primary action".

**Run on this branch:** `npx vitest run --dir src` (25 files, 219 tests passed), `npm run lint` (no warnings or errors), and the dev server on the sample data at 1280, 1024, 768 and 375 px. Screenshot: `docs/screenshots/ux-7/invoices-768.png`.

| Items | What was verified |
| --- | --- |
| UX-7 (newly checked) | At 1280, 1024, 768 and 375 px, each of `/`, `/invoices`, `/invoices/INV-002` (panel), `/clients`, `/expenses`, `/import` and `/settings`, loaded at that width: the page doesn't scroll sideways (scrollWidth equals the window), no element sticks out past the edge, and no visible table is wider than its card. `/invoices` is now a card list at 768 px (and below 1024 px) with every status and "Mark as paid" in view, and a table from 1024 px. `phone-lists.test.tsx` "Invoices on tablets": card list at 768 and 1023 px, table at 1024 px, Expenses still a table at 768 px. `use-mobile.test.tsx`: the layout hooks read the width on the first render and follow width changes. |
| UX-9 (newly checked, reworded) | No screen shows more than one filled primary button (counted at 1280 px): Invoices "Add invoice", Expenses "Add expense", the invoice panel "Mark as paid", import "Preview records" and "Import 4 valid rows" (the Done step's single primary, "Go to Overview", was read from `result-step.tsx`, not counted in the browser); the Overview, Clients, Settings and the import's upload step have none. |

**Note on the browser check:** the browser pane's size emulation doesn't fire `matchMedia` change events (a listener on `(max-width: 767px)` recorded none across 1280 → 375 px), so a page already open before an emulated resize keeps its old layout. Each page was therefore measured after loading at its width. Real window resizes are covered by `use-mobile.test.tsx`.

## 2026-10-20 · Checklist checks: PB-23, PB-26, DATA-3, DATA-7, UX-3, UX-5, UX-7, UX-9, CODE-6, TEST-2, DEP-2, DEP-3

**Pull request:** the checklist checks PR (branch `chore/dod-checks`, stacked on the scope decisions PR #42).

**Run on this branch:** `npx vitest run --dir src` (24 files, 214 tests passed), `npm run lint` (no warnings or errors), `npm run build` (passed; same bundle-size warning, 948 kB). Dev server on the sample data at 1280, 768 and 375 px. Production (`https://studio-ledger-rho.vercel.app`, `main` at 42881ed) for DEP-2 and DEP-3.

| Items | What was verified |
| --- | --- |
| PB-23 (newly checked) | Every `formatMoney`/`formatAxisMoney` call in the app passes the app currency (41 calls; no hard-coded symbols). `currency.test.tsx` in EUR or BAM: the chart tooltip (`€13,230.00`, `-2.584,87 KM`), the invoice form label "Amount (EUR)", the expense form "Amount (BAM)", the Mark as paid dialog ("€850.00 counts as Received…"), the invoice and expense delete dialogs ("€850.00 for Lumen Coffee…", "40,00 KM for Meeting room rental…"), the client panel ("2.380,00 KM"), and the import preview. **Fixed:** the import preview showed amounts as typed in the file ("1450.00"); it now shows read amounts in the app currency ("1.450,00 KM"), and the raw text only where the amount couldn't be read. |
| PB-26 (newly checked) | `currency.test.tsx` "the chart tooltip shows the month's exact figures": month, Received, Expenses and Net income, and nothing when inactive. Browser: hovering September on production showed "September 2026 · Received $13,230.00 · Expenses $2,084.56 · Net income $11,145.44"; at 375 px locally, a click on September and touch events (`touchstart`, `touchmove`) over May showed May's exact figures ($10,390.00, $2,369.21, $8,020.79). Not tried on a physical phone. |
| DATA-3 (newly checked) | `data-checks.test.tsx`: with `localStorage.setItem` throwing `QuotaExceededError`, `writeLedger` returns "Your changes couldn't be saved in this browser. They'll be lost when you close the page."; deleting an invoice shows that toast once, the app keeps working (All 40, then All 39), and a second failed save doesn't repeat it. |
| DATA-7 (newly checked) | `data-checks.test.tsx`: with BAM chosen, "Clear all data" (its dialog says "Your currency setting stays.") leaves BAM checked and `studio-ledger:settings:v1` as `{"currency":"BAM"}`, also after a reload. |
| UX-3 (newly checked, reworded in #42) | `data-checks.test.tsx`: `/`, `/invoices`, `/clients` and `/expenses` each have their data in the first synchronous render ($47,160.00; All 41; 6 clients; "120 expenses · $11,770.14") with no empty state, because the ledger is read from storage in the provider's state initializer. |
| UX-5 (newly checked) | `glossary.test.tsx`: no match for unpaid, revenue, billed, receivable, payable, accrual, debit, credit, bookkeeping, profit, gross or fiscal in the visible text, aria-labels, titles or placeholders of `/`, `/invoices` (list and two panels), `/clients`, `/expenses`, `/import`, `/settings`, the empty state, the edit and Mark as paid dialogs, the Undo toast, and each import step. In code the words appear only in stored values and names (`'unpaid'`, `markUnpaid`). |
| CODE-6 (newly checked) | Searched `src/` for every out-of-scope item in `AGENTS.md` (tax, reminders, alerts, email, PDFs, bank or payment sync, Google Sheets, accounts or login, conversion, data export, recurring, budgets, forecasts, dark mode). Matches were only false positives: "tax" inside `formatAxisMoney`, "convert" in "Convertible mark" and "nothing is converted", "download" for the sample CSV (US-4.1). **Fixed:** removed shadcn's unused `.dark` colour theme from `src/index.css`; nothing could turn it on, and the class-based `dark` variant stays so the `dark:` utilities in shadcn components stay inert instead of following the system setting. Light screens checked after: unchanged. |
| TEST-2 (newly checked) | Each rule in the PRD's "Financial definitions and calculation rules" has a unit test against the sample dataset: Received by paid date incl. late payments, Outstanding and Overdue snapshot ($14,620.00, $8,840.00), Expenses by date, Net income, change vs previous incl. "—" for 0 and for Net income ≤ 0 (`calculations.test.ts`); periods and previous periods (`calculations.test.ts` "periods"); Paid/Overdue/Pending incl. yesterday and today (`calculations.test.ts`); minus sign and cents (`money.test.ts`); 0 for an empty month (`calculations.test.ts`); setting back to Unpaid (`invoices.test.ts`); editing a paid invoice (`invoice-form.test.ts`); client with invoices can't be deleted (`clients.test.ts`); expense amount above 0 (`expense-form.test.ts`); currency formats (`money.test.ts`). **Added:** `dates.test.ts` for "Today uses the user's local date" (23:30 and 00:30 local), and `calculations.test.ts` "Paid or Unpaid, never partly paid". |
| DEP-2 (newly checked) | The user opened production in a private window: no Vercel login. Also from a terminal with no cookies: `/`, `/settings`, `/invoices/INV-002`, `/clients`, `/expenses` and `/import` each returned 200 with the app's own page (title "Studio Ledger"), no redirect. Smoke test of the three core journeys on production, starting from a first visit (6 clients, 41 invoices, 120 expenses): **import records** (sample invoice file: 4 valid rows, "4 invoices imported", new client Harbour Light Theatre; Overview then 45 invoices, Outstanding $17,570.00, Received $49,460.00); **understand the month** (Last month: Received $13,230.00, Expenses $2,084.56, Net income $11,145.44, "—" for both changes; the September tooltip matched); **collect an unpaid invoice** (opened INV-002 by its link, marked it paid by keyboard; toast with Undo; Outstanding $14,620.00 → $13,770.00, "8 invoices · 5 overdue"). That browser's production data was reset afterwards. |
| DEP-3 (newly checked) | The user loaded `/settings` directly on production. Also: `/invoices/INV-002` opened the INV-002 panel ("Overdue · 179 days") when loaded directly on production, and the terminal check above returned 200 for each direct link. |

**Checked, not ticked:**

- **UX-7:** no page scrolls sideways at 1280, 768 or 375 px (`/`, `/invoices`, an invoice panel, `/clients`, `/expenses`, `/import`, `/settings`; no element sticks out past the page edge). But at 768 px the Invoices table is 160 px wider than its card, so it scrolls inside the card and Status and "Mark as paid" start off-screen. Needs a design decision: a card list below 1024 px for Invoices, or hiding Issue date at tablet width.
- **UX-9:** no screen has more than one primary (filled) button: Invoices "Add invoice", Expenses "Add expense", the invoice panel "Mark as paid", import "Preview records" and "Import N valid rows". But the Overview, Clients, Settings and the import's upload step have none, and the item says "one". Needs a decision: reword to "at most one", or give those screens a primary action.

**Not verified:** a physical phone (PB-26 tap was checked with touch events in the browser); a screen reader.

## 2026-10-20 · Undo for marking paid (US-2.2) and confirmation toasts (UX-4)

**Pull request:** the US-2.2 undo PR (branch `feature/us-2-2-undo-mark-paid`).

**Run on this branch:** `npx vitest run --dir src` (20 files, 186 tests passed), `npm run lint` (no warnings or errors), `npm run build` (passed; same bundle-size warning, now 948 kB), and the dev server on the sample data at 1280 px. Screenshot: `docs/screenshots/us-2-2-undo/undo-toast-and-panel.jpg`.

| Items | What was verified |
| --- | --- |
| UX-4 (newly checked) | Toasts for saving, marking as paid and importing, with Undo where the PRD asks for it (US-2.2, the only undo the PRD asks for). `toasts.test.tsx`: "INV-002 saved" after editing an invoice, "$12.00 expense added", "4 invoices imported". `undo-paid.test.tsx`: Mark as paid from the list, then the toast's Undo puts INV-041 back to Pending and the Overview back to $14,620.00 and "9 invoices · 5 overdue"; Mark as not paid from the panel, then the panel's Undo brings back INV-001's paid date (Apr 14, 2026); after 5 seconds both Undo buttons are gone and nothing is undone. `invoices.test.ts`: `restorePaidStatus` restores status and paid date and keeps an edit made in between. Browser: marking INV-001 and INV-002 paid or not paid showed the toast with Undo and the same Undo in the panel; clicking the toast's Undo with the panel open undid the change and kept the panel open (the toaster now has `pointer-events: auto` while Radix sets `none` on the body); waiting past 5 seconds removed both Undo buttons and kept the change. |

**Also verified (no checklist item, supports A11Y-2):** by keyboard in the browser, Mark as paid from the panel moved focus to the panel's Undo (role="status" with the toast text), Enter undid it and focus returned to "Mark as paid". Before this fix, focus fell to the page body after marking paid. Covered by `undo-paid.test.tsx` "keyboard users keep their place".

**Found, not fixed:** the toast's own Undo can't be reached by keyboard while a modal panel is open (Radix keeps focus inside the panel), which is why the panel has its own Undo; from the invoice list, with no panel open, the toast is reachable. Sonner pauses a toast's timer on hover, so a hovered toast can stay past 5 seconds; its Undo still works then (each toast's Undo is tied to its own change, and a newer change dismisses the older toast), while the panel's Undo ends after exactly 5 seconds.

**Not verified:** 375 and 768 px; a screen reader; the Vercel preview; Undo from the dashboard's Outstanding panel (same component as the invoice panel).

## 2026-10-20 · Clients page (US-2.5)

**Pull request:** the US-2.5 Clients PR (branch `feature/us-2-5-clients`).

**Run on this branch:** `npx vitest run --dir src` (18 files, 174 tests passed), `npm run lint` (no warnings or errors), `npm run build` (passed; same bundle-size warning, now 946 kB), and the dev server on the sample data at 1280 and 375 px. Screenshots: `docs/screenshots/us-2-5/`.

No checklist item is newly checked: US-2.5 is a Should story, so PB-28 does not cover it. These already-checked items were re-verified for the new page:

| Items | What was verified |
| --- | --- |
| UX-1 | The client panel lists each invoice with a text badge (Paid, Pending, "Overdue · 179 days"); `clients.test.tsx` "opens a client's invoices in a side panel" checks Pending and "Overdue · 178 days" on 2026-10-19. |
| UX-8 | At 375 px `/clients` renders a card list (6 items, no table) and the page does not scroll sideways (scrollWidth 375). `clients.test.tsx` "lists clients as rows on phones". |
| CODE-3 | Client totals, the client's invoices and the delete rule are pure functions in `src/lib/clients.ts`; `clients.test.ts` checks them against the owed-by-client table in `data/README.md` (invoice counts, Outstanding, overdue counts) and that Received over all clients is $49,810.00. |
| TEST-1 | 174 tests pass, none skipped. |

**Also verified (no checklist item):** US-2.5's three criteria. The list shows name, total Received, total Outstanding and invoice count; the panel lists the client's invoices and each links to its invoice panel; "Delete client" on a client with invoices explains instead of deleting ("Lumen Coffee has 6 invoices. Delete them or move them to another client first, then delete the client.", focus on Close, "Show their invoices" opens Invoices searched by the client's name), and a client with no invoices is deleted after a confirmation. Keyboard: the client name opened the panel with Enter and Enter on "Delete client" opened the message.

**Not verified:** 768 px; a screen reader; the Vercel preview; deleting a client in the browser (covered by `clients.test.tsx` only).

## 2026-10-20 · Card lists on phones (UX-8) and pagination

**Pull request:** the UX-8 PR (branch `feature/ux-8-mobile-card-lists`, stacked on the Phase 3 design polish PR).

**Run on this branch:** `npx vitest run --dir src` (16 files, 160 tests passed, run four times in a row), `npm run lint` (no warnings or errors), `npm run build` (passed; bundle warning, now 938 kB), and Chromium (Playwright, headless) on the sample data at 375, 767, 768 and 1280 px. Screenshots: `docs/screenshots/ux-8/`.

| Items | What was verified |
| --- | --- |
| UX-8 | **Summary cards stack:** at 375 px the four cards are one column (`ux-8/overview-phone.png`). **Tables become card lists:** at 375 and 767 px, Overview Outstanding, Invoices and Expenses render a card list and no data table (the Overview keeps only the chart's screen-reader table); at 768 and 1280 px they render tables again. Import match and preview steps render lists at 375 px (`ux-8/import-match-phone.png`, `ux-8/import-preview-phone.png`). Every page's `scrollWidth` is 375 at 375 px. `phone-lists.test.tsx` checks each list's rows and actions: Outstanding opens the invoice, Invoices has Mark as paid only on unpaid invoices and the number opens the panel, Expenses opens the expense, the import columns keep their field menu and switch, and preview rows show their status. |
| PB-28 (affected, stays open) | New acceptance criteria in `docs/PRD.md`: US-1.3 (at most 10 in Outstanding), US-2.3 and US-3.2 (10 per page, page in the URL), US-4.3 (every row, 10 per page, instead of the first 20). Verified: `pagination.test.ts` (page from the URL, pages of the sample, short last page, out-of-range page, page buttons with gaps); `invoices.test.tsx` and `expenses.test.tsx` (10 rows, "Showing 1–10 of 41 invoices", `?page=5` and `?page=3` open on that page, Next, page links with real `href`s, a filter goes back to page 1, the count and total cover every expense); `import.test.tsx` (12-row file previews 10 then 2; Outstanding shows 10 of 12 with a link to Invoices). Chromium: page links change the URL without reloading, Back returns to the previous page, the Paid tab goes back to page 1, and the pagination is 308 px wide on Expenses page 6 at 375 px. |
| UX-7 (affected, stays open) | No page scrolls sideways at 375, 767, 768 or 1280 px. Dialogs and panels were checked at 375 px only. |

**Found, not fixed:**

- At 768–1023 px (tablets), the Invoices table (52 rem wide) still scrolls sideways inside its card; card lists only apply below 768 px.
- The stale worktree `npm test` issue from the entry below is still there.

**Fixed since, on the design polish PR:** the side panels were ¾ of the screen wide on phones, so their buttons wrapped (now full width, with the actions at the bottom). The required-field tooltip test failed now and then in full runs; the cause was hovering right after a click, not a tooltip delay as first noted here (shadcn sets the delay to 0).

**Not verified:** the Vercel preview (checked after the PR opened), a screen reader on the card lists, widths between 375 and 767 px other than those listed.

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
