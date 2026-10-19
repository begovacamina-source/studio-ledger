# Handoff: where Studio Ledger stands

Work so far was done in a Claude.ai chat, then in Claude Code. This file tells the next session where to pick up.

## Done

- PRD written and reviewed, first as a Claude Doc (https://claude.ai/artifact/M62tYXz2FSFGwgmeqmzFob). That doc is now a retired snapshot: it is no longer edited or exported.
- Decisions made: USD default currency, switchable to EUR/BAM with no conversion; no partial payments; no Google Sheets sync in the MVP; discovery interviews skipped; MIT license; private repository.
- **`docs/PRD.md` is the single source of truth** for the product (decided 2026-10-20, see `docs/decisions.md`). Change it through pull requests. Its diagrams are Mermaid blocks in the file itself (#20).
- PRD gap closed: **US-5.2 · Must: choose the app currency** is in `docs/PRD.md`, `docs/user-stories.md` and `docs/decisions.md`. The F5 sample data criteria became **US-5.1 · Must: load sample data and clear all data** (issue #19); the dataset itself shipped in #18 and closed #16.
- Repository foundation: README, AGENTS.md, CLAUDE.md, LICENSE (MIT), docs/, .gitignore, `.github/pull_request_template.md` (Definition of Done + "Closes #"), `.github/ISSUE_TEMPLATE/user-story.yml` (story, priority, area, acceptance criteria), `scripts/setup-github.sh`.
- **Milestone 1 approved (gate 1 passed, 2026-10-20):** every checklist item in `docs/PRD.md` is ticked, and the decision is logged in `docs/decisions.md`.
- GitHub: private repository https://github.com/begovacamina-source/studio-ledger, branch `main`, first commit "Milestone 1: product foundation".
- `scripts/setup-github.sh` has been run: 8 labels, the "MVP" milestone and 17 issues (#1–#17, one per story, acceptance criteria from `docs/PRD.md`). A second run skips everything.
- The `gh` CLI is installed in `~/.local/bin` (add it to `PATH` if a shell can't find it). Commits use the GitHub noreply email, set for this repository only.

## Next (pick up here)

Phase 2: UX flows (1–2 weeks; gate: wireframes reviewed).

1. Sitemap: every screen in the MVP and how they connect.
2. User flows for the three core journeys in `docs/PRD.md` (import records, understand the month, collect an unpaid invoice).
3. Low-fidelity wireframes for every screen, including empty, loading and error states.

## Notes

- If a story changes, update `docs/PRD.md` (and `docs/user-stories.md` if the title or priority changes) in a pull request, then edit the matching GitHub issue by hand (the setup script skips issues that already exist).
