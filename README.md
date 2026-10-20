# Studio Ledger

A personal finance dashboard for freelance creatives. It answers three questions:

1. How much money have I received?
2. How much have I spent?
3. Which clients still owe me money?

> **Status:** Phase 2 — Rough screens. The app is set up and the Overview dashboard is built roughly with the sample data.

## Run locally

Needs Node.js 22 or later.

```bash
npm install
npm run dev
```

`npm test` runs the unit and component tests, `npm run lint` runs the linter, and `npm run build` makes a production build in `dist/`.

## Why this project exists

Freelancers track invoices, clients, income and expenses across spreadsheets and tools, so understanding their finances takes manual calculation. Studio Ledger turns those records into a few clear numbers and lists. It is also a design engineer portfolio project, designed in code with no Figma: strategy → rough screens → design polish → build → validation.

## MVP scope

| Area | What it does |
| --- | --- |
| Overview dashboard | Received, Outstanding, Expenses and Net income for a period; income vs expenses chart; who owes money |
| Invoices and clients | Add invoices, link them to clients, mark paid or unpaid, filter by status |
| Expenses | Record and categorise expenses |
| CSV import | Upload, match columns, preview and validate, import |
| Sample data | A fictional six-month dataset for demos and tests |

Everything else is out of scope until the PRD changes. See [docs/PRD.md](docs/PRD.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | Full product requirements (source of truth) |
| [docs/rules.md](docs/rules.md) | Glossary, financial calculations, behavior rules |
| [docs/data-model.md](docs/data-model.md) | Entities, fields and CSV formats |
| [docs/user-stories.md](docs/user-stories.md) | Story list with priorities |
| [docs/decisions.md](docs/decisions.md) | Decision log |
| [AGENTS.md](AGENTS.md) | Instructions for Codex and other coding agents |

`docs/PRD.md` is the single source of truth for the product: change it through pull requests. The PRD was first written in a Claude Doc, which is now a retired snapshot and is no longer exported or edited.

## Planned tech stack

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
