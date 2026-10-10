# Agent A verdict — partial technical PASS; end-to-end material review NOT-RUN

- Code tested: d16f047af653f7ba259456807c1fc150e9d0f417 (test branch descended from this SHA, no common D2/D3 implementation changes).
- D1 real revision save/read/diff: **pass**, see `plans/04-revision-1.json`, `plans/09-revision-2.json`, `plans/06-d1-diff.json`, `plans/10-read-revision-2.json`.
- D3 validation, real D2 preview/register/case creation: **pass**, see `plans/08-modified-plan.json`, `plans/13-register.json`, `plans/14-created-case.json`.
- Portable bundle export/import into distinct empty configuration: **pass**, see `bundles/`, `plans/14-reimported-plan.json`, `plans/summary.json`.
- Negative/stale edit recovery: **pass**, see `logs/11-stale-save-refused.stderr` and `logs/18-duplicate-import-refused.stderr`.
- Rule/Check/Source/fingerprint and no-Claim checks: **pass** (structural; `plans/summary.json`).
- Positive/negative/unknown synthetic material: **independent GOLD oracle and real Pi service structured-receipt tests pass**, see `tests/cases.json`, `tests/actual-results.json`, `tests/pi-structured-results.json`; classifications were intentionally supplied, not inferred by an online model.
- Synthetic text document material registration / valid SourceRef: **pass through real backend**. Online Pi model inference and formal publication / policy validity: **not-run / prohibited**.
- Overall D3-10 Agent A: **technical contract and service interface PASS; actual online semantic reading NOT-RUN**. Not a blanket D3-10 release PASS (independent Agent B/integrator remain).
