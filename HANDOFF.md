# Handoff: where Studio Ledger stands

Work so far was done in a Claude.ai chat, then in Claude Code. This file tells the next session where to pick up.

## Done

- PRD written and reviewed (Claude Doc, two tabs: main PRD + "Stories & criteria"): https://claude.ai/artifact/M62tYXz2FSFGwgmeqmzFob
- Decisions made: USD default currency, switchable to EUR/BAM with no conversion; no partial payments; no Google Sheets sync in the MVP; discovery interviews skipped.
- Repository scaffold: README, AGENTS.md, CLAUDE.md, docs/ (rules, data model, stories, decisions), .gitignore.
- `docs/PRD.md` now holds the Markdown export of both PRD tabs (diagrams are left as placeholders pointing to the doc). Re-export when the doc changes.
- PRD gap closed: **US-5.2 · Must: choose the app currency** added to the PRD doc (story table + "Stories & criteria", under F5, renamed "Sample data (prototype only) and settings"), `docs/PRD.md`, `docs/user-stories.md` and `docs/decisions.md`.
- GitHub setup files:
  - `.github/pull_request_template.md`: Definition of Done checklist from AGENTS.md.
  - `.github/ISSUE_TEMPLATE/user-story.yml`: story ID, story, priority, area, acceptance criteria, notes.
  - `scripts/setup-github.sh`: creates labels, the "MVP" milestone and one issue per story (17), reading stories from `docs/user-stories.md` and criteria from `docs/PRD.md`. Re-runnable; `--dry-run` previews without `gh`. Dry run verified; not yet run against GitHub.

## In progress (pick up here)

1. Create the GitHub repository (`git init`, first commit, `gh repo create`), then run `scripts/setup-github.sh` (needs the `gh` CLI, not installed on this machine yet, and `gh auth login`).
2. Decide the ID scheme for sample data: it is listed as `F5` with no story ID, while currency is `US-5.2`. Renaming F5 to `US-5.1` would make it consistent; change the PRD doc first, then the docs, before running the script.

## Next after that

- Build the fictional sample dataset as CSV: 6 months, 5–6 clients, ~40 invoices, ~120 expenses, including overdue invoices and one empty month. Save it under `data/`; it doubles as the CSV import sample.
- Mark the PRD approved (gate 1), then start Phase 2: sitemap, user flows, low-fidelity wireframes with empty and error states.

## Not yet decided

- License (MIT is typical for a portfolio repo).
- Public or private repository (public recommended for a portfolio).
