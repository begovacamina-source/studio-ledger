# Studio Ledger

A personal finance dashboard for freelance creatives. It answers three questions:

1. How much money have I received?
2. How much have I spent?
3. Which clients still owe me money?

**Live app:** [studio-ledger-rho.vercel.app](https://studio-ledger-rho.vercel.app). It opens on a fictional sample, and your records stay in your browser.

> **Status:** Phase 3, design polish, with release checks under way. Every MVP screen is built and deployed: Overview, Invoices, Clients, Expenses, CSV import and Settings. Keyboard and contrast checks pass. Still to do before v1.0.0: the design review, a screen-reader spot check, and the case study with a usability test. See [`docs/definition-of-done.md`](docs/definition-of-done.md).

## Run locally

Needs Node.js 22 or later.

```bash
npm ci
npm run dev
```

`npm ci` installs the exact versions in `package-lock.json`. `npm run dev` serves the app at the address it prints (http://localhost:5173, or the next free port), opening on the sample data. `npm test` runs the unit and component tests, `npm run lint` runs the linter, and `npm run build` makes a production build in `dist/`.

`npm run test:e2e` runs Playwright against a production build: the three core journeys, keyboard-only flows, and text and non-text contrast checks. Locally it uses your installed Google Chrome; without Chrome, run `npx playwright install chromium` once and remove `channel` in `playwright.config.ts`. CI (`.github/workflows/ci.yml`) runs lint, the unit tests, the build and the journeys on every pull request.

## Why this project exists

Freelancers track invoices, clients, income and expenses across spreadsheets and tools, so understanding their finances takes manual calculation. Studio Ledger turns those records into a few clear numbers and lists. It is also a design engineer portfolio project, designed in code with no Figma: strategy → rough screens → design polish → build → validation.

## MVP scope

| Area | What it does |
| --- | --- |
| Overview dashboard | Received, Outstanding, Expenses and Net income for a period; income vs expenses chart; who owes money |
| Invoices and clients | Add invoices, link them to clients, mark paid or not paid (with undo), filter by status; a Clients page with totals per client |
| Expenses | Record and categorise expenses |
| CSV import | Upload, match columns, preview and validate, import |
| Sample data and settings | A fictional six-month dataset, loaded on a first visit; currency (USD, EUR or BAM, formatting only); clear all data |

Everything else is out of scope until the PRD changes. See [docs/PRD.md](docs/PRD.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | Full product requirements (source of truth) |
| [docs/rules.md](docs/rules.md) | Glossary, financial calculations, behavior rules |
| [docs/data-model.md](docs/data-model.md) | Entities, fields and CSV formats |
| [docs/user-stories.md](docs/user-stories.md) | Story list with priorities |
| [docs/decisions.md](docs/decisions.md) | Decision log |
| [docs/definition-of-done.md](docs/definition-of-done.md) | Release checklist (Must / Nice) |
| [docs/verification-log.md](docs/verification-log.md) | Evidence for each checked item |
| [docs/case-study.md](docs/case-study.md) | Portfolio case study (draft) |
| [AGENTS.md](AGENTS.md) | Instructions for Codex and other coding agents |

`docs/PRD.md` is the single source of truth for the product: change it through pull requests. The PRD was first written in a Claude Doc, which is now a retired snapshot and is no longer exported or edited.

## Tech stack

Vite · React · TypeScript · Tailwind CSS · shadcn/ui (design system, including shadcn charts) · Papa Parse · browser storage (no backend) · Vitest, Testing Library, Playwright · deployed on Vercel, with a preview link for every pull request.

## Roadmap

| Phase | Output | Estimate |
| --- | --- | --- |
| 1. Foundation | PRD, rules, journeys, this repo | ~1 week |
| 2. Rough screens | Every screen built with shadcn/ui and the sample data, including empty/loading/error states | 1–2 weeks |
| 3. Design polish | Theme tokens, type, spacing, component states, charts and responsive layouts refined | 2–3 weeks |
| 4. Build | React app, calculations, CSV import, deployed demo | 3–4 weeks |
| 5. Validate | Usability tests, iterations, case study | 1–2 weeks |

## Working agreement

- One user story per branch and pull request (`feature/us-2-2-mark-paid`).
- Every pull request meets the Definition of Done in the PR template.
- Design tokens are shadcn's theme colours and spacing, kept in one place (`src/index.css`); no hard-coded colours or spacing.
- Every pull request is reviewed on its Vercel preview link.
