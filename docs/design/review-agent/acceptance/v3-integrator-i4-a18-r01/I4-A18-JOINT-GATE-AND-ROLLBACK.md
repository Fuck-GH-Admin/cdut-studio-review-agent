# I4 A18 exact Git source lock + joint technical acceptance

**Integrator-I only / scoped technical integration; not a shared ABCI policy.**

- C signed source replay permission [`44203ab`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/44203ab3772dfe7ff91832e786e3f572a19b497b); this is **not** I4 engineering acceptance.
- C-accepted I3 Stage3 exact immutable parent `8e9f7caa69b5454cb646bdbe3bdf05f8bb479a8b`. Rollback: point a new engineering branch to this commit; do **not** reset or overwrite the signed #152 or its frozen ref.
- A R18 exact source `0febf1248bc6a580a1bc7b3144e0d96ca4313916`; replay checkpoint `7fca9be90d1fc18ac4e443cf74154f76a1ff488f`; only **four** approved paths, 3 replaced+1 added, source-to-target Git blobs identical **4/4**.
- Current candidate adds **one I-only joint cross-boundary test** with five technical positive/negative cases; uses real imported A HTTP engine + in-memory fake SSE/Pi shim against C R03 physical Host registry. It never uses an external Provider or writes C business records.
- Tests assert Responses API completion requires framed/consumed SSE and *independent* C observation; event-only, unterminated frame, duplicate terminal, and Owner revoke cannot promote provider ID to physical C Read.
- Retain I3 Stage3 **5/5**, Stage2 **4/4**, old I union **23/23**, C Host/Pi **13/13**, SDK/Provider A source tests and all package tests.
- Gate O after the **final exact new commit**: frozen install, whole TypeScript, boundaries, skin, Main/Preload/Renderer builds, full Bun, PR CI+Baseline+D2 success required; record failing SHA/log and repair without weakening guards. C final exact SHA signature **pending**.
- B R18 separate source replay is already approved only **after I4 A18 receives final C signature**; no B version import in this PR. No Main/IPC/shared/Preload/Case/Plan/Run/SchoolPort change. E NOT_RUN, L BLOCKED_NO_AUTH, P NOT_RUN, Release NO_GO.

## Actual failed integration CI and targeted I-owned test-fixture correction

- First exact I4 candidate `54b5257430328cbe334513f7ef5a6044f8cb155a`: PR CI [39325765026](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39325765026), job `118311242845` failed full Bun at **4329 PASS / 5 SKIP / 1 FAIL** (495 files); Baseline `39325765025` and D2 `39325765049` independently passed. Full log fails **only** `I4-A18-01` during application terminal success: `RECOVERY_REQUIRED: Pi HTTP Provider request/stream completion provenance unavailable` at imported A18 engine line 321; 4/5 I4 new tests passed and all other regressions passed.
- Root cause in **I-only test fixture**, not A18 production source: synthetic Pi model is tagged `openai-completions`, but the positive fixture emits **Responses** `event: response.completed`; A18 correctly requires `model.api==='openai-responses'` for that application terminal. Legacy completions must be attested only by framed `data: [DONE]`. The old test was cross-protocol and the source correctly refused it.
- Allowed fix only in the newly added I-owned test: parameterize the mocked model API, explicitly set `openai-responses` for the positive Responses terminal. **No A, C, shared, IPC, Preload, Plan, Run, Host implementation or safety negative changed.** A new exact SHA and full fresh CI are mandatory before claiming Gate O; failed source checkpoint remains preserved.
