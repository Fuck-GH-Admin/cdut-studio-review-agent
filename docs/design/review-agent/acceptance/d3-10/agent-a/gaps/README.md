# Independent usage gaps and limits

## A-001 — no end-user document read via the D2 plan CLI

- `codeSha`: `d16f047af653f7ba259456807c1fc150e9d0f417`; `owner`: D3 / Pi integration user journey; `severity`: major for full document-read sign-off.
- Source requirement: `source-map.md#heading-coverage`, `plain-document@1:local/heading-coverage`.
- Actual CLI commands available to a first-time author: `review-d2-plan.ts preview/register/create/attach`. These validate and persist **rules**, but have no command taking the test Markdown and returning per-document semantic findings.
- Reproduce: create D1 revision 2, then `bun apps/electron/scripts/review-d2-plan.ts preview workspaces/modified.json tests/selection.json tests/case.json`. This preview takes a **case metadata** document with `documents: []`, not `tests/cases.json` content. No real material evaluation occurs.
- Expected: first-use guide should show a supported, verifiable material-ingest + Pi prepare/submit flow, or explicitly delegate to D2/Pi service setup with required real SourceRefs.
- Actual: author can compile, register, create technical cases and export portable definitions; text-reading execution requires a separate Pi material/service workflow not exposed here. We did **not** impersonate a model or fabricate SourceRefs.
- Affected plan Check: `local/heading-coverage`; corresponding runtime Rule ID is recorded in `plans/summary.json` after execution. No run ID was created.
- Status: `not-run` for Pi semantic classification, `tooling-experience gap` not a demonstrated backend code defect. Re-test with a real material registration and Pi service harness if required.

## A-002 — coarse semantic check granularity

The three headings and per-section content statuses are requested inside a **single** natural-language RuleSpec. The D2 mapping has one Check ID; the model must be instructed to report three statuses in its reason, but the service's Check denominator cannot independently prove all three sub-obligations were fulfilled. This is **a testable observability concern**, not proof of an omission. Recommend an optional authored subcheck breakdown or structured per-heading finding when rigorous denominator accounting is required; avoid mandatory Claim/Evidence graph.
