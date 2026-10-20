# Claude Code instructions

Read `AGENTS.md` first: its scope rules, money rules, UI language and Definition of Done apply to every task here.
Then read `HANDOFF.md` to see where the project stands and what comes next.
The product source of truth is `docs/PRD.md`, and only that file: change it through pull requests. The original Claude Doc is a retired snapshot; never export from it or edit it. Condensed rules are in `docs/rules.md` and `docs/data-model.md`.

## Definition of Done

`docs/definition-of-done.md` is the release checklist. Follow it on every pull request:

- Before opening or updating a pull request, read the checklist and find the items the change completes or affects, by ID (for example PB-12).
- Check an item only with evidence seen in this task: working code running in the browser, a passing test, or a reviewed preview. Never check one on assumption, and never uncheck or reword one without saying why in the pull request.
- Add an entry to `docs/verification-log.md` (newest first): the date, the pull request, the item IDs, what was actually verified, and what was not covered. Evidence goes in the log, never in the checklist.
- Fill in the Definition of Done table in the pull request description (from `.github/pull_request_template.md`) with the same items and evidence, and keep the template's other checks.
- Record anything found but not fixed under "Found, not fixed" in the log, and mention it in the reply.
- A pull request that checks or changes no items says so in its table instead of adding a log entry.

## Git workflow

- Always work on a new branch, never on `main`.
- Never stack pull requests. Always branch from an up-to-date `main` (`git checkout main && git pull`), never from another feature branch, and always target `main`.
- Wait for the previous pull request to merge before starting the next one. If one is still open, say so and wait rather than building on it.
- When done, open a pull request with a screenshot (for docs-only changes, say so in place of the screenshot).
- Explain each git step in one sentence.
