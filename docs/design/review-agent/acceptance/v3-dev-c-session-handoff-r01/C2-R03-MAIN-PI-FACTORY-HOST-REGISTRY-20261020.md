# Dev-C C2-R03｜Inert Main Pi AgentSession Factory + Physical Host Registry

> C-only implementation/gate record, **not the ABCI shared policy**. A/B/I do not need to read this document. Dev-C production changes live exclusively in Draft #144; this document is maintained on coordination branch #145 for C session handoff.

## Exact base and current code checkpoint

- Predecessor C2-R02: `34c7ea3bd881504302d2682aad79065c0ef9a24c`, previously independently verified 5/5 Gate O, PR CI 4081 PASS/5 SKIP/0 FAIL. Do **not** attach that result to R03.
- First R03 code/test commits: `522ca7df79385dedf08b4f1ba288ee03c77ef6d2`, `6922cf08ef3ccc8f0f2ce2804b3f4dff473368c8`, `82e63bafc5ff277650cf999058358d2783d66fa8`, `ce42f97ccb6d128024bc9d0e113d94d08a1400ba`.
- Target R03 after offline static safety corrections: `08e3c5c7efffc825815fc4588fbee281cd0212eb`. Inspect remote head before concluding Gate O.
- Prior A4-R13 #143 `1f1f5d1499cb59c813d590aa407189ba05f65f10`; the A4 R13 Pi SDK 0.86.1 implementation is **not** silently copied or integrated in this C branch. I2 #148 remains source-frozen at `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` and does **not** include C2-R02/R03.

## New C-owned implementation

1. `apps/electron/src/main/lib/review/review-v3-main-pi-factory.ts`: C-owned **inert** Pi `AgentSession` factory. It accepts only a trusted Main-provided `createFreshSession` (structural Pi SDK 0.86.1 session), a Main-approved exact HTTPS origin, current A Owner/grant and C published Plan callback. Reads current admitted C Case and rehashes original disk bytes both **before and after** asynchronous construction. Denies stale/rotated Owner, changed manifest, candidate-held/invalid Plan, byte tampering, pre/late abort, reused dispatch/session, existing sealed or technical-terminal Run and already-streaming Pi. Does not prompt, fetch, install tools, select credentials or modify ordinary Agent.
2. `review-v3-main-host-receipt-registry.ts`: Main in-memory physical Host registry. Ingress takes a **receipt ID only** and requires an independent privileged Host observer to yield corresponding evidence; it does not reconstruct physical proof from event DTO/model text. Checks exact Run, grant, generation, manifest, source identity/extent or Check/terminal. Re-reads physical observer and active A Owner on lookup; clone isolation, receipt collision/rebinding detection, capacity bound, revoke invalidation and process shutdown denial. **No cold-start proof rehydration**; production multi-PID recovery requires separate C-Tx/E.
3. The respective `.test.ts` files add isolated positive/negative tests, including realistic long prompt, changed physical original during session creation, owner grant rotation, Host source loss, id rebound and cold registry state.

## Current limits and safety gates

- These files are **not an operational Pi provider**: `createFreshSession`, `getCurrentOwner`, `assertPublishedPlan`, and `getObservedPhysicalReceipt` are privileged Main injection contracts. The tests deliberately use simulated dependencies; no actual A4 Host callbacks, institutional credentials, published B Plan or school identity are claimed.
- No Renderer IPC, Preload, ordinary-agent proxy/sanitizer, global SDK/fetch patch, Run ACK or external school writeback was changed. Existing `review-v3-main-trust-port.ts` remains an independent C consumer; production assembly will need a new source-locked A/B/C union and Gate E.
- Physical Pi HTTP `x-request-id`, redirect/no transparent retry, one-request HTTPS/SSE, native `turn_start → turn_end → agent_end(willRetry:false) → agent_settled`, post-dispose/AbortSignal and persistent A dispatch fence still belong to source-locked A4 real-HOST tests. A physical request response ID cannot by itself become a C Read/Check/terminal business ACK.
- Gate O: **PENDING exact new SHA** until all applicable workflows complete and PR raw Bun/typecheck logs are verified. Gate E: NOT_RUN; Gate L: BLOCKED_NO_AUTH; Gate P: NOT_RUN; Release: NO-GO. Do not inherit prior C2-R02 4081 PASS.
- Local environment lacks a complete working checkout and Bun; `bun run typecheck`, full Bun test and Electron live were **not** executed locally. Use GitHub Actions exact SHA as the only offline Gate O evidence.

## Verification/next batch

Read #144 new HEAD, then fetch exact commit Actions, actual job steps and first failure logs. Require PR CI TypeScript/boundaries/Main+Preload+Renderer build/full Bun suite, Baseline, D1, D2, Batch for this C branch. First failure must be repaired in C-owned files without weakening negatives; lock a new SHA and repeat. After new Gate O, assemble only against separately approved A/B source SHA, prove Host observer and A Owner current-token attestation, provider no-retry/abort/late reply and production disk/transaction recovery under Gate E; then C-Tx and multi-Run/Batch/Outbox work.
