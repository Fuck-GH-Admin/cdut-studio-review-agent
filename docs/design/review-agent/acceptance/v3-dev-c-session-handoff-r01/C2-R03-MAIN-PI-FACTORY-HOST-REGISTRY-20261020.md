# Dev-C C2-R03｜Inert Main Pi AgentSession Factory + Physical Host Registry

> C-only implementation/gate record, **not the ABCI shared policy**. A/B/I do not need to read this document. Dev-C production changes live exclusively in Draft #144; this document is maintained on coordination branch #145 for C session handoff.

## Exact base and current code checkpoint

- Predecessor C2-R02: `34c7ea3bd881504302d2682aad79065c0ef9a24c`, previously independently verified 5/5 Gate O, PR CI 4081 PASS/5 SKIP/0 FAIL. Do **not** attach that result to R03.
- First R03 code/test commits: `522ca7df79385dedf08b4f1ba288ee03c77ef6d2`, `6922cf08ef3ccc8f0f2ce2804b3f4dff473368c8`, `82e63bafc5ff277650cf999058358d2783d66fa8`, `ce42f97ccb6d128024bc9d0e113d94d08a1400ba`.
- Target R03 initial static corrections: `08e3c5c7efffc825815fc4588fbee281cd0212eb`; first actual D1 typecheck failed at registry lines 94/104 with TS2345 optional Host receipt. Fixed via explicit fail-closed `return refuse(...)` at `e4d630a15a048c870a180d273e1d7311d36e1c67` (5/5 CI success; 4094 PASS/5 SKIP/0 FAIL). Then strengthened cross-attempt Host negative against a pinned Main Owner, FINAL R03 source SHA **`e87f75e044becc35c28292cc835a2c2ec41df48a`**.
- Prior A4-R13 #143 `1f1f5d1499cb59c813d590aa407189ba05f65f10`; the A4 R13 Pi SDK 0.86.1 implementation is **not** silently copied or integrated in this C branch. I2 #148 remains source-frozen at `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` and does **not** include C2-R02/R03.

## New C-owned implementation

1. `apps/electron/src/main/lib/review/review-v3-main-pi-factory.ts`: C-owned **inert** Pi `AgentSession` factory. It accepts only a trusted Main-provided `createFreshSession` (structural Pi SDK 0.86.1 session), a Main-approved exact HTTPS origin, current A Owner/grant and C published Plan callback. Reads current admitted C Case and rehashes original disk bytes both **before and after** asynchronous construction. Denies stale/rotated Owner, changed manifest, candidate-held/invalid Plan, byte tampering, pre/late abort, reused dispatch/session, existing sealed or technical-terminal Run and already-streaming Pi. Does not prompt, fetch, install tools, select credentials or modify ordinary Agent.
2. `review-v3-main-host-receipt-registry.ts`: Main in-memory physical Host registry. Ingress takes a **receipt ID only** and requires an independent privileged Host observer to yield corresponding evidence; it does not reconstruct physical proof from event DTO/model text. Checks exact Run, grant, generation, manifest, source identity/extent or Check/terminal. Re-reads physical observer and active A Owner on lookup; clone isolation, receipt collision/rebinding detection, capacity bound, revoke invalidation and process shutdown denial. **No cold-start proof rehydration**; production multi-PID recovery requires separate C-Tx/E.
3. The respective `.test.ts` files add isolated positive/negative tests, including realistic long prompt, changed physical original during session creation, owner grant rotation, Host source loss, id rebound and cold registry state.

## Current limits and safety gates

- These files are **not an operational Pi provider**: `createFreshSession`, `getCurrentOwner`, `assertPublishedPlan`, and `getObservedPhysicalReceipt` are privileged Main injection contracts. The tests deliberately use simulated dependencies; no actual A4 Host callbacks, institutional credentials, published B Plan or school identity are claimed.
- No Renderer IPC, Preload, ordinary-agent proxy/sanitizer, global SDK/fetch patch, Run ACK or external school writeback was changed. Existing `review-v3-main-trust-port.ts` remains an independent C consumer; production assembly will need a new source-locked A/B/C union and Gate E.
- Physical Pi HTTP `x-request-id`, redirect/no transparent retry, one-request HTTPS/SSE, native `turn_start → turn_end → agent_end(willRetry:false) → agent_settled`, post-dispose/AbortSignal and persistent A dispatch fence still belong to source-locked A4 real-HOST tests. A physical request response ID cannot by itself become a C Read/Check/terminal business ACK.
- Gate O: **PASS_EXACT_SHA** at final `e87f75e044becc35c28292cc835a2c2ec41df48a` (five GitHub workflows completed/success). PR CI `39304164581` job `118236761701`: frozen install, workspace typecheck, boundaries, skin contract, Main/Preload/Renderer builds, full Bun suite **4094 PASS / 5 SKIP / 0 FAIL; 4099 tests across 471 files; C2-R03 13/13**. D1 `39304164551`, D2 `39304164686`, Baseline `39304164500`, Batch `39304164599` all success at the same final SHA. Raw job logs checked, including 13 actual passed C2-R03 test names. Gate E: NOT_RUN; Gate L: BLOCKED_NO_AUTH; Gate P: NOT_RUN; Release: NO-GO. Earlier C2-R02 4081 PASS was never inherited.
- Local environment lacks a complete working checkout and Bun; `bun run typecheck`, full Bun test and Electron live were **not** executed locally. Use GitHub Actions exact SHA as the only offline Gate O evidence.

## Verification/next batch

R03 exact-SHA Gate O is complete, and its first real failure was fixed without deleting negatives. Next C-owned batch: source-lock a new A/B/C assembly (I2 deliberately lacks C2-R02/R03), inject real A Owner process-epoch/current token and real A4 Host observer into C2 trust port, then run authorized Electron/Pi 0.86.1/provider Gate E only after independent safety permission. Verify physical SSE request ID, no retries, abort/dispose/late reply, B-published policy provenance, multi-PID persistence; do not promote physical HTTP technical receipt into C2 business ACK. Then C-Tx recovery, C3 Run/BatchAttempt, C4 Outbox, C5 workbench and concentrated Gate E/L/P.


## Final R03 Source and Gate O audit lock (2026-10-20)

- C engineering PR #144: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144
- SHA: `e87f75e044becc35c28292cc835a2c2ec41df48a`
- Final test hardening: owner registry in test returns the previously frozen `run`, never echoing receipt-requested altered `attemptId`; cross-attempt registration must throw and must not store evidence.
- PR CI: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39304164581, Bun job `118236761701`, 4094/5/0, 13/13 new tests, typecheck + three builds PASS.
- Other Gate O: Baseline `39304164500`, focused batch `39304164599`, D1 `39304164551`, D2 `39304164686`; all success at precise final SHA.
- Previous actual failure: D1 `39302597562` job `118231367306` TS2345 at registry 94/104. At final SHA those sites typechecked and no security checks were removed.
- Diff: only four C-owned newly added files versus C2-R02 fixed parent, no shared DTO / formal Main IPC / Preload / existing ordinary-agent path edits.
- Scope: OFFLINE ONLY; never claim physical Host, published school policy or production SDK session is now installed. Gate E/L/P remain NO-GO.
