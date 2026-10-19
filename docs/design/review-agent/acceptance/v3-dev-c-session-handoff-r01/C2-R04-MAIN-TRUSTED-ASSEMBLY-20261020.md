# Dev-C C2-R04 | Main Trusted Authority Assembly — 2026-10-20

> **C-only engineering handoff, not part of the shared A/B/I required reading.** Four-line binding decision is #145 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` `DECISIONS:C`. This technical report does not grant any code lease, Provider/IPC/SchoolPort authority or Gate E.

## Fixed inputs

- C2-R02 #144 `34c7ea3bd881504302d2682aad79065c0ef9a24c`, 5/5 Gate O success; Main trusted Run port and physical original hashing.
- C2-R03 #144 `e87f75e044becc35c28292cc835a2c2ec41df48a`, 5/5 exact Gate O success; inert dedicated AgentSession factory + process-local independent Host receipt observer registry.
- I2 #148 remains signed at `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`. New I3 authority `C-I3-ANCHOR-003` **locks precisely the PRIOR C R03 SHA `e87f75e...`**; this R04 follow-on source is NOT automatically part of I3.
- A R14 #143 `56f450f3c783299ceb0a6489bf855a1ba8f0a913` verified 3/3 Gate O. A HTTPS/SSE physical request witness is **not** the C Host read/check/terminal receipt. `CR-A-R14-COMPAT-004` authorizes only future I-owned nonlive typed compatibility tests.

## Actual C-owned production engineering

Draft PR #144 / branch `feat/v3-dev-c-business-r01`:

- `apps/electron/src/main/lib/review/review-v3-main-trusted-assembly.ts` initially commit `901bbb3fb7cbaca939606fc1356f075471337c02`.
- Matching `review-v3-main-trusted-assembly.test.ts` commit `f722baaabebaab719edd1e2bc9a237bf14d5eb5d`, corrected closed-assembly synchronous assertion `b51e5f299ffa68284fc1d187607b658405c8643f`.
- Exactly two newly added C-owned files over previous R03 green anchor; existing C0/Main IPC/Preload/shared, ordinary Pi proxy/sanitizer, A/B/I owners' source, Run writer and official school decisions untouched.

`C2MainTrustedExecutionAssembly` supplies ONE privileged `getCurrentOwner` witness to both the isolated Pi factory and the existing trusted technical run port and independent physical Host registry. The same privileged `assertPublishedPlan` callback gates both. There is no Provider network call, SDK configuration, credential access or Electron Main/IPC registration. The current caller must inject true independent Main/Host/B publisher authority; a synthetic fixture only passes Gate O scope.

Supported operations: `admit/record/seal` delegate to existing C-owned technical-only signed/CAS ledger; `createPi` returns an inert dedicated SDK spec; `rememberObservedHostReceipt` only accepts Host ID looked up by independent privileged observer (no caller-supplied receipt); `invalidateRun` tombstones Host receipt; `close` revokes all assembly exposed methods, clears Host registry and blocks in-flight Pi post-await authorization. No direct registry/port/factory escape hatch is returned to Renderer or another actor.

## New negative/positive regression

1. Real disk original and synthetic approved Plan/current owner allow isolated Pi and technical read only after independent Host observer registration; no school Decision.
2. Candidate-held Plan, grant rotation and tampered original deny.
3. Revoked Run receipt ID cannot be recycled; closed registry cannot recover Host proof from proposal journal.
4. Closing assembly while `createFreshSession` awaits must dispose newly built session and reject; closed assembly cannot create again.
5. Missing privileged Host/Plan/Owner/factory constructor callbacks deny.

**Trust and reliability caveats**: process-local Host registry alone is not cross-PID durable authority. Main Host actually observing physical read/check/terminal, B publication/provenance, A native AgentSession/real HTTPS Provider and Gate E are not integrated or demonstrated; this assembly is solely C-owned C2-R04 offline authority composition. Technical C2 ledger and ReviewRun seal are not auto Decision or school ACK. No synthetic physical receipt or `x-request-id` may be promoted as real Host evidence.

## CI/Gates and next step

At creation **engineering exact HEAD `b51e5f299ffa68284fc1d187607b658405c8643f` is COMMITTED; new exact-SHA PR CI `39306309483`, Baseline `39306309415`, Batch `39306309433`, D1 `39306309447`, D2 `39306309399` were queued/in-progress**. Do not inherit prior `e87f75...` Gate O. Read actual jobs/logs and fix first failure on C-owned files before signing `R04 Gate O`. Re-run all five exact same final SHA, then update this report/STATUS:C with reality.

After R04 exact Gate O: continue C-owned trusted immutable B Plan publication/source-to-Case admission/physical Host instrumentation and C-Tx crash/cross-PID fidelity, maintaining signed I3 base R03 unless C explicitly rules otherwise. Production/Electron E `NOT_RUN`, school L `BLOCKED_NO_AUTH`, full product P `NOT_RUN`, release `NO_GO`.

## Verified exact-SHA Gate O after initial pending state

GitHub independently completed all five workflow runs for **unchanged** engineering SHA `b51e5f299ffa68284fc1d187607b658405c8643f`:
- PR CI `39306309483`, job `118244194354` SUCCESS: frozen install, TypeScript, package boundary checks, skin contract, Main/Preload/Renderer build and full Bun **4099 PASS / 5 OS SKIP / 0 FAIL** (4104 tests / 472 files); C2-R04 5 new integrated tests are included.
- Baseline `39306309415`: SUCCESS.
- Batch `39306309433`: SUCCESS.
- D1 `39306309447`: SUCCESS.
- D2 `39306309399`: SUCCESS.

**C2-R04 Gate O = PASS_EXACT_SHA / C_MAIN_OFFLINE_AUTHORITY_SCOPE_ONLY.** Original pending status above is a historical check, not a current failure. No live B publisher/Host/SDK/Provider integration and no Gate E/L/P or Release approval.
