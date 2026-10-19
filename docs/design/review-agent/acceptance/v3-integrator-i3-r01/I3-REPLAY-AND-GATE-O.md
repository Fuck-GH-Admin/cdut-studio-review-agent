# Review V3 — Integrator-I I3 Phase 1 exact-source replay and Gate O

**Authority**: Dev-C `C-I3-ANCHOR-003 / APPROVED_SCOPED_REPLAY_C2_R03` in #145 §9. All assertions below are engineering-source facts, not proof of live Provider, authoritative school policy, production Main IPC, or C2 durable business ACK.

## New immutable C baseline and original I2 input

- **C C2-R03 anchor**: `e87f75e044becc35c28292cc835a2c2ec41df48a`, 5/5 own workflows SUCCESS (PR 39304164581, Baseline 39304164500, Batch 39304164599, D1 39304164551, D2 39304164686).
- **Previously C-accepted I2**: `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57`, earlier parent C `3242b22a0825eec347b2748680bb746eb0f55215`. I2 exact PR CI 39298594421, D2 39298594426, Baseline 39298594262 SUCCESS with **4191 pass / 5 skip / 0 fail** and **23/23** synthetic I joint cases.
- **New frozen ref**: `integration/v3-i3-c-anchor-003-frozen` at the exact new C SHA, never a floating branch.
- **New work ref**: `integration/v3-i3-source-replay-r01`. Replay-only checkpoint `d05d39fb6924d5786e3d68486bd9ae16679ea572`, tree `286709e70424cb05ce3e044752e7c3799748ff6b`.
- C old I2 base→C R03: six **C-owned** added files. Old I2 base→signed I2: 34 paths. The two sets have **zero overlap**. This is a path-level protection, NOT compatibility proof.
- Exact same 34 source Git blob references imported directly from accepted I2 tree into new C Git tree; `I3-SOURCE-AND-CHECKPOINT-LOCK.json` records every `path/source sha/blob/replayed blob`. No cherry-pick or whole-branch merge. Source code and historical I1/I2 evidence content were not modified in this replay.
- **C narrow test lease verified before replay**: C's original `review-c0-ipc.test.ts` Git blob `7c4d73b209e926369747ae50f5ce4a5601e3effa` is IDENTICAL on both old and C-R03 bases. Accepted I2 file `8633f3f5d636a813da0bf7b12264e384705063fd` retains this original whole byte prefix and ONLY the previously approved +167/-0 lines. No other C-owned test or production source changes.

## Gate O — new combined SHA required

This replay is not accepted merely because C and I2 independently passed. Run frozen install, all-workspace TypeScript, boundaries, skin, Main/Preload/Renderer build, complete Bun suite, and all triggered D1/D2/Baseline/Batch at the **new I3 metadata commit SHA**. In the raw combined Bun log verify old 19 I1 + I2 A 2 + I2 B 2 probes independently still execute and PASS (23/23), and inspect new C Main Pi factory/Host registry tests actually execute. Collect exact first-failure lines and do I-only fixes or return Owner defects to A/B/C.

**Strict status at source assembly**: Gate O = `PENDING_NEW_SHA_CI`; E = `NOT_RUN`; L = `BLOCKED_NO_AUTH`; P = `NOT_RUN`; Release = `NO_GO`. C engineering acceptance of I3 not signed; `I-LEASE-MAIN-PORT-R01` remains `CONDITIONAL_NOT_ACTIVE`; I Business writer remains `DENIED`.

## Next phase guard

The later I-owned PR #149 (new source-fence SHA `fc663a9c3b9beff8b48020d1b818089b6c4b3f1d`) is not a source for this phase, regardless of its separate CI. C has separately allowed investigation of A R14 exact `56f450f3c783299ceb0a6489bf855a1ba8f0a913` for future **I-only non-live** compatibility tests **only after I3 Stage 1 Gate O PASS and C review**. Do not source-upgrade A R12/B current lock, modify C Main/SDK registry, attach production Provider, elevate synthetic Host receipts or claim durable C2 ACK.

**Rollback**: frozen C `e87f75e044becc35c28292cc835a2c2ec41df48a` / replay source-only `d05d39fb6924d5786e3d68486bd9ae16679ea572` / historical accepted I2 `89a8c52bdaa407f0b8b99a17b2ecc8475e776e57` are distinct immutable checkpoints; do not rewrite #147/#148/#149.
