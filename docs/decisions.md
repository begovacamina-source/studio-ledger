# Decision log

Newest first. Each entry: what was decided, why, and what it rules out.

| Date | Decision | Reason | Consequence |
| --- | --- | --- | --- |
| 2026-10-20 | Release Definition of Done (`docs/definition-of-done.md`) kept separate from its evidence (`docs/verification-log.md`) | A checklist with evidence notes mixed in grows long and hard to scan, and evidence that sits next to a box gets edited when the box changes. A dated log keeps a history of what was verified on which commit. | Each feature PR checks items and adds a log entry; an item without a log entry is not done. Rules out evidence notes in the checklist |
| 2026-10-20 | Design in code with shadcn/ui, no Figma; deploy on Vercel | Design engineer portfolio project: the design system lives in the code that ships | Tokens are shadcn's theme colours and Tailwind's spacing in one file; Phases 2–3 become rough screens, then design polish; every pull request is reviewed on its Vercel preview |
| 2026-10-20 | PRD approved; gate 1 passed | Every Milestone 1 checklist item is done | Phase 2 (UX flows) starts |
| 2026-10-20 | PRD moved to the repo as source of truth (`docs/PRD.md`) | Two editable copies drifted (US-5.1, US-5.2) | The Claude Doc is a retired snapshot; PRD changes go through pull requests |
| 2026-10-19 | Currency choice gets its own story (US-5.2) | Currency rules existed with no story, so no issue would build Settings | Settings ships as a Must story in the Settings area |
| 2026-10-19 | Discovery interviews skipped | Time constraints | Assumptions are checked during usability testing; the case study states this openly |
| 2026-10-19 | No Google Sheets sync in the MVP | CSV import already proves the real-data workflow with less complexity | Sheets sync revisited for v1.1 |
| 2026-10-19 | No partial payments | Keeps invoice status and calculations simple | An invoice is Paid or Unpaid |
| 2026-10-19 | One app currency: USD default, EUR or BAM | Covers the target users without exchange-rate logic | Switching changes formatting only; no conversion |
| 2026-10-19 | Income is cash received | Billed revenue overstates income | Received uses `paidDate`, never `issueDate` |
| 2026-10-19 | Amounts stored in cents | Avoids floating-point rounding errors | All maths on integers; format only for display |
| 2026-10-19 | Client-side app, no backend | Portfolio demo; no accounts needed | Data lives in the browser; export planned for v1.1 |
| 2026-10-19 | Fictional data first, CSV import second | No private financial data in a public demo | Sample dataset is a Must |
