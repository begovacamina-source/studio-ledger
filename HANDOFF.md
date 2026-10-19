# Handoff: where Studio Ledger stands

Work so far was done in a Claude.ai chat, then in Claude Code. This file tells the next session where to pick up.

## Done

- PRD written and reviewed (Claude Doc, two tabs: main PRD + "Stories & criteria"): https://claude.ai/artifact/M62tYXz2FSFGwgmeqmzFob
- Decisions made: USD default currency, switchable to EUR/BAM with no conversion; no partial payments; no Google Sheets sync in the MVP; discovery interviews skipped; MIT license; private repository.
- `docs/PRD.md` holds the Markdown export of both PRD tabs (diagrams are placeholders pointing to the doc). Re-export when the doc changes.
- PRD gap closed: **US-5.2 · Must: choose the app currency** is in the PRD doc, `docs/PRD.md`, `docs/user-stories.md` and `docs/decisions.md`. Sample data keeps the ID `F5`.
- Repository foundation: README, AGENTS.md, CLAUDE.md, LICENSE (MIT), docs/, .gitignore, `.github/pull_request_template.md` (Definition of Done + "Closes #"), `.github/ISSUE_TEMPLATE/user-story.yml` (story, priority, area, acceptance criteria), `scripts/setup-github.sh`.
- GitHub: private repository https://github.com/begovacamina-source/studio-ledger, branch `main`, first commit "Milestone 1: product foundation".
- `scripts/setup-github.sh` has been run: 8 labels, the "MVP" milestone and 17 issues (#1–#17, one per story, acceptance criteria from `docs/PRD.md`). A second run skips everything.
- The `gh` CLI is installed in `~/.local/bin` (add it to `PATH` if a shell can't find it). Commits use the GitHub noreply email, set for this repository only.

## Next (pick up here)

1. Build the fictional sample dataset as CSV: 6 months, 5–6 clients, ~40 invoices, ~120 expenses, including overdue invoices and one empty month. Save it under `data/`; it doubles as the CSV import sample.
2. Mark the PRD approved (gate 1), then start Phase 2: sitemap, user flows, low-fidelity wireframes with empty and error states.

## Notes

- If a story changes, update the PRD doc first, re-export `docs/PRD.md`, then edit the matching GitHub issue by hand (the setup script skips issues that already exist).
