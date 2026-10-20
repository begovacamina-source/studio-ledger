# Studio Ledger: a finance dashboard for freelance creatives

> **Draft.** Facts here come from `docs/PRD.md`, `docs/decisions.md`, `docs/verification-log.md` and the pull requests. Sections marked **✍️ To fill in** need the usability test results or your own words; nothing in them has been made up. Remove this note when the case study is final.

**Role:** design engineer: product definition, UX, design system, front-end build, testing and validation.
**Live demo:** [studio-ledger-rho.vercel.app](https://studio-ledger-rho.vercel.app). It opens on a fictional sample, and nothing you enter leaves your browser.
**Code:** a private GitHub repository. See [Seeing the code](#seeing-the-code).
**Stack:** Vite, React, TypeScript (strict), Tailwind CSS v4, shadcn/ui and shadcn charts, Papa Parse, browser storage, Vitest, Testing Library, Playwright with axe-core, GitHub Actions, Vercel.

![The Overview on desktop: four key figures, a monthly Received and Expenses chart, and the Outstanding list](screenshots/release/overview-desktop.png)

---

## 1. The problem

Freelancers spread invoices, clients, income and expenses across spreadsheets, banking apps and notes. Answering "how am I doing?" takes manual calculation, and three things go wrong:

- **Late payments go unnoticed,** so follow-ups happen late or not at all.
- **Billed work is confused with money received,** which overstates income.
- **Spending is hard to see** by month or category.

The user's goal, as written in the PRD:

> *"I want to understand how much money I've received, how much I've spent, and which clients still owe me money."*

Studio Ledger answers exactly those three questions and nothing else. It competes with the spreadsheet, not with accounting software.

## 2. The user

The primary audience is independent designers and other creative freelancers who manage several clients and track money themselves.

**Proto-persona: Maja, freelance brand designer.** This is an assumption, not research; see [What was validated, and what was assumed](#7-what-was-validated-and-what-was-assumed).

| | |
| --- | --- |
| Work | 4–8 active clients, project and retainer work |
| Volume | 5–15 invoices and 20–40 expenses a month |
| Tools today | A spreadsheet for invoices, a banking app, notes for expenses |
| Main frustration | Not knowing at a glance who has paid and who is late |
| Comfort with finance | Low to medium; avoids accounting software as too complex |

**Jobs to be done:**
1. See what I earned and spent this month.
2. Spot a late client quickly.
3. Update an invoice in seconds when I'm paid.
4. Bring in my existing records without retyping them.

## 3. Scope

### The MVP

| Area | What it does |
| --- | --- |
| Overview | Received, Outstanding, Expenses and Net income for a chosen period, each with its change against the previous period; a monthly chart; the 10 most urgent unpaid invoices |
| Invoices and clients | Add, edit and delete invoices linked to clients; filter by Paid, Pending and Overdue; search; mark paid or not paid, with a 5-second undo; a Clients page with totals per client |
| Expenses | Record, filter, edit and delete expenses in eight fixed categories |
| CSV import | Upload, match columns, preview and validate every row, then import the valid ones |
| Sample data and settings | A fictional six-month dataset that loads on a first visit; one app currency (USD, EUR or BAM); clear all data |

Three journeys define it, and each has an end-to-end test:
1. **Import records.**
2. **Understand the month.**
3. **Collect an unpaid invoice.**

### Non-goals

Studio Ledger is not accounting software. The PRD made this list binding, and every task was reviewed against it:

| Left out | Why |
| --- | --- |
| Estimated taxes | Rules vary by country; a wrong number is worse than none |
| Reminder emails, invoice PDFs | They need a backend, and they turn the product into invoicing software |
| Bank sync, Google Sheets sync | APIs, security review and consent; CSV proves the data workflow first |
| Accounts and cloud storage | Backend and authentication work; data stays in the browser |
| Mixed currencies, conversion | Exchange-rate rules |
| Export, recurring invoices, budgets, forecasts, dark mode | Not needed for the three questions |

## 4. Process

Five phases, each with a gate:

| Phase | What happened | Gate |
| --- | --- | --- |
| 1. Foundation | PRD, glossary and calculation rules, data model, journeys, a fictional dataset, GitHub issues per story | PRD approved |
| 2. Rough screens | Every screen built in React with shadcn/ui on the sample data, layout and flow first | Reviewed on the Vercel preview |
| 3. Design polish | Type, colour, spacing, component states, chart, phone and tablet layouts, accessibility | Design review (UX-10) |
| 4. Build | Remaining stories, calculations, import, storage, tests and CI | Every Must story meets the Definition of Done |
| 5. Validate | Usability test with 2–3 people | This case study |

**Designed in code, with no Figma.** The design system is shadcn/ui's components and theme tokens, kept in one file (`src/index.css`). Every pull request got a Vercel preview, and each screen was reviewed there, in the browser, at real sizes and with real data. Where a design decision changed, it was made in the code that ships, and recorded in `docs/decisions.md`.

**Working method.** The code was written with an AI coding agent (Claude Code), one user story per branch and pull request. I acted as product owner, designer and reviewer. The PRD was the single source of truth. A release checklist (`docs/definition-of-done.md`) was ticked only with evidence: a passing test, a reviewed preview, or a check in the browser. A dated verification log records what was checked and what wasn't.

**In numbers:**
- 33 merged pull requests, each with CI.
- 223 unit and component tests.
- 60 Playwright tests: the three core journeys, keyboard-only flows, text and non-text contrast, the screen-reader checks, and a check that the app makes no network calls.

> **✍️ To fill in: working with an AI agent.** What it was like to direct the build: where it helped, where you had to correct it, and what you'd change in how you briefed it. Examples you might use from the pull requests:
> - The stacked-PR mistake that led to the "never stack pull requests" rule.
> - Pushing to an already-merged pull request.
> - Its suggestion to reword checklist items when evidence couldn't exist (TEST-4, GIT-3).

![The Overview on a phone: the key figures stacked, with the menu button in the top bar](screenshots/release/overview-phone.png)

## 5. Decisions and trade-offs

The decisions that shaped the product, from `docs/decisions.md` and the pull requests:

**Income is cash received, not billed.** Received counts an invoice in the month it was *paid*, never the month it was issued. It answers "what came in?" honestly. A late payment shows up in the month the money arrived, so a month with no income (August in the sample) really shows $0.00. The UI never says "revenue", "billed" or "unpaid"; a glossary test fails the build if those words appear.

**Money is stored in integer cents.** All maths uses whole numbers, and formatting happens only for display. Calculation tests check every figure against a hand-worked dataset.

**One currency, no conversion.** USD by default, with EUR or BAM in Settings. Switching changes only how amounts look ($1,250.00, €1,250.00, 1.250,00 KM). Exchange rates would have doubled the rules for little gain.

**Paid or not paid, nothing in between.** No partial payments, which keeps status and totals simple.

**Everything stays in the browser.** No backend and no accounts. The trade-off is that clearing site data loses records. Settings says so, and export is planned for v1.1.

**A first visit opens on the sample.** The dashboard is never empty the first time. After "Clear all data", it stays empty and offers Add, Import CSV or Load sample data. An earlier banner saying "you're looking at sample data" was removed in review as noise.

**Import that avoids errors instead of reporting them.** Column matching first showed errors when two columns pointed at the same field. After several review rounds:
- Picking a field another column has **swaps** the two.
- Each column has an **Import switch**. Required fields' switches are locked on, with a tooltip saying why.
- A **reset** button returns to the automatic match.
- Ambiguous dates are suggested from the currency: MM/DD/YYYY for USD, DD/MM/YYYY for EUR and BAM.

![Matching columns: each column's field, a switch to leave it out, and the suggested date format and decimal separator](screenshots/release/import-match-desktop.png)

**Undo inside the panel too.** Marking paid shows a toast with Undo for 5 seconds. The invoice panel is a modal, which keeps keyboard focus inside it, so the toast's button can't be reached by Tab. The panel shows the same Undo itself, and focus goes to it.

**Invoices become cards below 1024 px.** The seven-column table didn't fit a tablet: at 768 px it was 160 px wider than its card. Other lists switch at 768 px.

**shadcn's look, with stronger focus.** For contrast, four text colours were darkened, and the focus ring is solid at 4.5:1 or more on every Tab stop. Field borders were first darkened to 3:1, then put back to shadcn's light default by choice. Fields are found by their visible labels and the focus ring. That one trade-off is written into the accessibility checklist (A11Y-3). All controls are 36 px tall, so buttons, fields and tabs line up.

**Scope cuts.** Table sorting moved to future work; filtering and search already answer "where is that invoice?". The usability test shrank from 5–8 people to 2–3, and its results are reported as directional.

## 6. Accessibility and quality

| Area | How it was checked |
| --- | --- |
| Keyboard | Every flow is done by keyboard alone in Playwright, with no clicks. Every Tab stop must show a focus ring of at least 3:1, and Tab must leave each page (no traps). The tests found and fixed real bugs: invoice search dropped letters typed quickly, and focus was lost after undo. |
| Contrast | axe-core's colour-contrast rule on every page, panel, error and import step, at desktop and phone width. A separate 3:1 check covers radios, switches, focus rings, chart bars and selected states. |
| Screen readers | Each page has its own title and announces itself, section titles are headings, tables are named, and errors are tied to their fields. Search results and Mark as paid are announced. A VoiceOver pass in Safari passed all 18 steps. |
| Correctness | Every Must acceptance criterion in the PRD is matched to a passing test (PB-28). |
| Privacy | A test records every request while using the app: none leave it. Fonts are bundled, and production loads only its own files. |
| Delivery | CI runs lint, the unit tests, the build and Playwright on every pull request. Each pull request gets a Vercel preview. |

## 7. What was validated, and what was assumed

**Discovery interviews were skipped** for time (decided 2026-10-19). The persona, the jobs to be done and the competitor notes are assumptions. The usability test is the first contact with real users.

| Claim | Status |
| --- | --- |
| Figures follow the calculation rules exactly | **Validated** by automated tests on a hand-worked dataset |
| Every flow works by keyboard and with VoiceOver | **Validated** by tests and a VoiceOver pass |
| Tracking who owes money is the most painful job | **Assumed**; checked in the usability test ✍️ |
| Freelancers keep records they can export as CSV | **Assumed**; checked in the usability test ✍️ |
| They'd rather import a CSV than type records | **Assumed; the biggest open bet** ✍️ |
| Cash received is more useful than billed revenue | **Assumed**; checked in the usability test ✍️ |
| A monthly view is the right default (the app opens on Last 6 months) | **Assumed**; checked in the usability test ✍️ |

## 8. Usability test

> **✍️ To fill in after the test (CASE-3).** Keep it to what was actually observed.
>
> **Setup:** number of participants (2–3), who they were (role, how they track money today), remote or in person, device, and the date. Did they use the live demo or a preview?
>
> **Tasks and results** against the PRD's targets:
>
> | Task | Target | P1 | P2 | P3 | Met? |
> | --- | --- | --- | --- | --- | --- |
> | Find total received this month | ≥ 90% success, under 10 s | | | | |
> | Identify which clients owe money | ≥ 90% success, under 15 s | | | | |
> | Mark an invoice as paid | ≥ 90% success, under 20 s | | | | |
> | Complete a CSV import with a sample file | ≥ 80% success without help | | | | |
> | Ease rating (SEQ, 1–7) per task | Average ≥ 5.5 | | | | |
>
> **CSV import or typing?** What each participant preferred, and why. This is the PRD's biggest open bet, so state plainly whether it held.
>
> **The assumptions in section 7:** what you learned about each.
>
> **What went wrong:** the problems you saw, how serious each was, and what you changed (or plan to).
>
> **Caveat:** with 2–3 people, these results are directional, not statistically meaningful.

## 9. Release screens

Real screenshots of the released app on production (October 2026), on the fictional sample.

| Desktop (1280 px) | Phone (375 px) |
| --- | --- |
| ![Overview](screenshots/release/overview-desktop.png) | ![Overview](screenshots/release/overview-phone.png) |
| ![Invoices](screenshots/release/invoices-desktop.png) | ![Invoices](screenshots/release/invoices-phone.png) |
| ![Invoice panel](screenshots/release/invoice-panel-desktop.png) | ![Invoice panel](screenshots/release/invoice-panel-phone.png) |
| ![Clients](screenshots/release/clients-desktop.png) | ![Clients](screenshots/release/clients-phone.png) |
| ![Expenses](screenshots/release/expenses-desktop.png) | ![Expenses](screenshots/release/expenses-phone.png) |
| ![Import: match columns](screenshots/release/import-match-desktop.png) | ![Import: match columns](screenshots/release/import-match-phone.png) |
| ![Import: preview](screenshots/release/import-preview-desktop.png) | ![Import: preview](screenshots/release/import-preview-phone.png) |
| ![Settings](screenshots/release/settings-desktop.png) | ![Settings](screenshots/release/settings-phone.png) |

Full-page Overview: [desktop](screenshots/release/overview-full-desktop.png), [phone](screenshots/release/overview-full-phone.png).

## 10. What's next

Planned after v1.0, from the PRD and the future-work list:
- Export (v1.1).
- Read-only Google Sheets sync (v1.1 at the earliest).
- Reminder emails (v1.1).
- Dark mode (v1.1).
- Accounts and cloud storage (v1.2).
- Table sorting (#41).
- Recent activity on the Overview (US-1.4).
- A full screen-reader review, and axe scans on every screen.

> **✍️ To fill in after the test:** what the usability test changes about this list.

## 11. Reflection

> **✍️ To fill in: your own reflections.** Some prompts:
> - What would you do differently: skipping discovery, the size of the test, phase gates?
> - What did designing in code with no Figma give you, and what did it cost?
> - Which decision are you proudest of, and which one are you least sure about?
> - What did you learn about directing an AI coding agent with a PRD and a Definition of Done?

## Seeing the code

The repository is private. To see it:

> **✍️ To fill in:** how reviewers can ask for access. For example, "email [your address] with your GitHub username and I'll add you as a read-only collaborator", or a link to a public mirror.

Places to start in the repository:
- `docs/PRD.md`: the product definition.
- `docs/decisions.md`: why things are the way they are.
- `docs/definition-of-done.md` and `docs/verification-log.md`: the release checklist and its evidence.
- `src/lib/`: the calculations and import logic, with their tests.
- `e2e/`: the Playwright tests.
