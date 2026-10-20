# Handoff: where Studio Ledger stands

Work so far was done in a Claude.ai chat, then in Claude Code. This file tells the next session where to pick up.

## Done

- PRD written and reviewed, first as a Claude Doc (https://claude.ai/artifact/M62tYXz2FSFGwgmeqmzFob). That doc is now a retired snapshot: it is no longer edited or exported.
- Decisions made: USD default currency, switchable to EUR/BAM with no conversion; no partial payments; no Google Sheets sync in the MVP; discovery interviews skipped; MIT license; private repository.
- **`docs/PRD.md` is the single source of truth** for the product (decided 2026-10-20, see `docs/decisions.md`). Change it through pull requests. Its diagrams are Mermaid blocks in the file itself (#20).
- PRD gap closed: **US-5.2 · Must: choose the app currency** is in `docs/PRD.md`, `docs/user-stories.md` and `docs/decisions.md`. The F5 sample data criteria became **US-5.1 · Must: load sample data and clear all data** (issue #19); the dataset itself shipped in #18 and closed #16.
- Repository foundation: README, AGENTS.md, CLAUDE.md, LICENSE (MIT), docs/, .gitignore, `.github/pull_request_template.md` (Definition of Done + "Closes #"), `.github/ISSUE_TEMPLATE/user-story.yml` (story, priority, area, acceptance criteria), `scripts/setup-github.sh`.
- **Milestone 1 approved (gate 1 passed, 2026-10-20):** every checklist item in `docs/PRD.md` is ticked, and the decision is logged in `docs/decisions.md`.
- **New direction (2026-10-20, #22):** a design engineer portfolio project, designed in code with no Figma. Stack: Vite, React, TypeScript, Tailwind and shadcn/ui (with shadcn charts). Design tokens are shadcn's theme colours and Tailwind's spacing, kept in `src/index.css`. Deployed on Vercel with a preview link for every pull request. The Definition of Done now asks for a review on the Vercel preview, a screenshot in the pull request, and shadcn/ui components and theme tokens.
- GitHub: private repository https://github.com/begovacamina-source/studio-ledger, branch `main`, first commit "Milestone 1: product foundation".
- `scripts/setup-github.sh` has been run: 8 labels, the "MVP" milestone and 17 issues (#1–#17, one per story, acceptance criteria from `docs/PRD.md`). A second run skips everything.
- The `gh` CLI is installed in `~/.local/bin` (add it to `PATH` if a shell can't find it). Commits use the GitHub noreply email, set for this repository only.

## Next (pick up here)

Phase 2: Rough screens (1–2 weeks; gate: rough screens reviewed on the Vercel preview).

1. ~~Set up the app~~ Done: Vite + React + TypeScript (strict), Tailwind v4 and shadcn/ui (Nova preset, Radix), theme tokens including `--status-paid`, `--status-pending` and `--status-overdue` in `src/index.css`. Calculations live in `src/lib/` with unit tests against `data/README.md`.
2. Connect the repository to Vercel (needs the account owner): import the GitHub repository in Vercel, framework preset Vite. Production deploys from `main`, and every pull request gets a preview link.
3. ~~Rough Overview dashboard~~ Done (US-1.1, US-1.2, US-1.3): summary cards, period selector, Received and Expenses chart with a screen-reader table, Outstanding list. The sample data is read straight from `data/` until US-5.1 adds browser storage. Not yet: opening an invoice from the Outstanding list (needs the invoice screen), card lists on mobile, and recent activity (US-1.4, Should).
4. ~~Rough invoices section~~ Done (US-2.2, US-2.3): invoice list with status tabs, counts and search (kept in the URL), invoice detail (now the side panel), mark as paid from the list and the panel (paid date defaults to today, cannot be before the issue date), and "Mark as not paid" on the detail. The ledger lives in React state (`src/state/`), so changes are lost on reload until US-5.1. Not yet: sorting and undo (Should), clients (US-2.5).
5. ~~Add, edit and delete invoices~~ Done (US-2.1, US-2.4): "Add invoice" and "Edit" open the same form in a modal (client select or new client, inline validation, unique invoice number, due date not before issue date, paid date when editing a paid invoice). Clicking a row, or adding an invoice, opens the invoice in a side panel over the table at `/invoices/<number>`, with Mark as paid / Mark as not paid, Edit and Delete (with confirmation). There is no separate invoice page any more. Validation and saving are pure functions in `src/lib/invoice-form.ts`.
6. ~~CSV import~~ Done (US-4.1 to US-4.4): `/import` with four steps. Upload (Invoices or Expenses, .csv up to 5 MB and 5,000 rows, sample files in `public/samples/`), match columns (auto-matched by header, "Don't import", picking a field another column has swaps the two and the menu shows which column has each field, date format and decimal separator suggested from the first 20 rows), preview (first 20 rows, valid / errors / duplicates, each error as "Row N: field problem", where N is the line in the file and the header is line 1), and a result screen with counts and new clients. Logic is in `src/lib/csv-import.ts`.
7. Build the remaining MVP screens roughly with shadcn/ui components and the sample dataset in `data/`, covering the three core journeys in `docs/PRD.md` and the empty, loading and error states. Layout and flow first; visual polish is Phase 3.

## Notes

- If a story changes, update `docs/PRD.md` (and `docs/user-stories.md` if the title or priority changes) in a pull request, then edit the matching GitHub issue by hand (the setup script skips issues that already exist).
