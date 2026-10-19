# Decision log

Newest first. Each entry: what was decided, why, and what it rules out.

| Date | Decision | Reason | Consequence |
| --- | --- | --- | --- |
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
