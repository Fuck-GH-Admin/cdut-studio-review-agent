# CDUT Studio Review V3 — Integrator-I I2 Source Replay R01

**Authority**: C `C-I1-FINAL-ENG-ACCEPT-R01` and `C-I2-ANCHOR-002 / APPROVED_SCOPED_TECHNICAL_SOURCE_REPLAY` in coordination PR #145. This is **actual engineering code**, not a paper-only design; status `COMMITTED_PENDING_EXACT_SHA_GATE_O`.

## Exact boundaries and immutable provenance

- New C frozen anchor: `3242b22a0825eec347b2748680bb746eb0f55215` from Dev-C #144, five successful workflows PR CI 39291945961, Batch 39291945938, D1 39291945965, D2 39291945887, Baseline 39291945881. Earlier C0 `review-c0/1` is unchanged; C additionally owns explicit `review-v3-execution/1` and `review-v3-run/1`.
- Previously **C-accepted** I1: `642c1fa3d3dd2042b7af1afdb3882397d4ca79a7` (#147), PR CI 39277400876, D2 39277400995, Baseline 39277400916 green; includes 19 I-only synthetic crossline tests and original 18 frozen A/B source/test Git blobs.
- New A source pool: `c0132ae06de8ae09ab021ac231ffd34756eb5990` (#143); B source pool: `bf88320e57b20ebc2023f27665c544ce2ba72ce4` (#142). **Neither is imported in this first checkpoint**. C authorization requires separate A and B technical slice checkpoint CI after replay CI.
- New independent branch `integration/v3-i2-source-replay-r01`; own frozen PR base `integration/v3-i2-c-anchor-002-frozen` = `3242b22a0825eec347b2748680bb746eb0f55215`; I1 #147 HEAD remains untouched.
- Replay code commit `417bbe3560b4625672970e63587f874cc2235379` has **exactly 24 I1 source blob paths** on top of C SHA and no cherry-pick/whole-branch merge. Each replay blob is identical to the accepted I1 blob; full `path→sourceBlob→replayedBlob` in adjacent JSON lock. C-diff 36 vs I1-diff 24 path intersection zero in preflight; this does **not** imply behavioral compatibility.
- **C test lease**: current C anchor `review-c0-ipc.test.ts` base blob `7c4d73b209e926369747ae50f5ce4a5601e3effa`, exact same as prior C anchor; reapplying previously accepted I1 test makes whole original byte prefix identical with **+167 lines / -0**, old 3 C tests preserved. No C-owned production files edited.

## Gate O now required on the **new combined tree**

This checkpoint is `STAGED_ONLY` and `C_ACCEPTED_FOR_ENGINEERING_I2=PENDING`. Require on exact I2 SHA: PR CI frozen install, workspace TypeScript, boundaries, skin, Main/Preload/Renderer build, whole Bun; Review Baseline, D1, D2, Batch whenever workflow path filters trigger. Independently check all previously successful I1 19 cases **actually pass on new C** and log first failing assertion; do not use the earlier I1 or C standalone CI as joint evidence. No Electron, real Pi SDK, SchoolPort or end-user UAT evidence at this checkpoint.

For local fallback, pin `git rev-parse HEAD`, Bun 1.4.0 and Node 22, run `bun install --frozen-lockfile`, `bun run typecheck`, `bun run check:boundaries`, `cd apps/electron && bun run check:skin-contract && bun run build:main && bun run build:preload && bun run build:renderer`, then from repo root `bun test --isolate --timeout 30000`, specifically verifying `review-v3-integration-i1-technical.test.ts`, `review-v3-integration-i1-owner-event.test.ts` and the I lease tests in `review-c0-ipc.test.ts`. For D1/D2/Batch follow the source workflows verbatim. Preserve exit codes and logs.

## Interface divergence to check after replay Gate O

The legacy A `review-c0/1` outbox provides local `read-receipt-proposal` / `check-proposal` and local ACK. **Do not** upgrade those to new `review-v3-execution/1` Host verified eventId/read extent/check tuple/terminal, nor generate C2 durable receipt. C technical ledger `review-v3-technical-ledger.ts` remains C-owned, Main-only, CAS-backed and cannot be called with dummy Host verification or candidate-held B1 Plan as published. Main `review-ipc.ts`, Preload, shared DTO, C Case/Run/Plan/Batch/Outbox/SchoolPort production and C2 durable writer remain forbidden I edits.

## Subsequent approved batches (not part of initial replay)

After the new C + I1 exact SHA green Gate O and source lock review, make **one selected A technical pool import** with exact Git blobs, dependencies, negatives, test replay and independent Gate O; then **one selected B technical pool import**, again separate. C will independently inspect and sign I2 actual SHA. Never silently replace moving A/B HEAD or change frozen ref; Rollback to C anchor and retain accepted I1 artifact without rewriting history.
