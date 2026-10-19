# CDUT Studio Review V3 — Dev-C C-MAIN-WIRE-R01 production-electron entry + guarded composition

**C-only engineering evidence; single binding contract is #145 ABCI DECISIONS:C.** Not I-owned and not a merge instruction. Latest prior C BCR002-B exact signed `461b5c9e7abc17a020c843f279118208196f5ef0` 5/5 completed/success, full Bun 4124 pass/5 skip/0 fail.

## Why this batch

C already implemented Main-only `CMainTrustedAuthorRevisionRead` and `upgradeCanonicalPlanV3` with native Case CAS/Receipt and C-Tx OS lock. But **neither was reachable through registered Electron Main/Preload** and B source still lives on B's isolated #142 Draft. Thus this batch adds real transport boundaries while refusing absent authoritative data.

## Actual C scope on Draft #144

- `apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts` (new): `handleCMainAuthorLatestRead`, `handleCMainUpgradeCanonicalPlan`, `registerCMainV3AuthorPlanIpc`. Main-only source composition via `installCMainV3AuthorPlanAuthorities`: full function suite for currently authenticated B1 author ledger, live Main author/Case Owner grant, publisher proof. **No default authorities; all Electron requests deny `C_MAIN_V3_IPC_INDEPENDENT_AUTHORITIES_NOT_INSTALLED` until explicit trusted Main installation.** Source install is not exposed in IPC.
- `packages/shared/src/types/review.ts`: new `REVIEW_IPC_CHANNELS.AUTHOR_READ_LATEST_V3` and `UPGRADE_CANONICAL_PLAN_V3` only. No new privileged Principal role granted and no new shadow Case schema.
- `apps/electron/src/main/lib/review/review-ipc.ts`: actual `registerReviewIpc()` registers both handlers. Each derives live Main sender `assertC0ReviewMainSender(event)` and `getMainWindow()`, rechecks physical `senderFrame===sender.mainFrame` and frame PID/routing identity; Principal always `local-reviewer` bound to current Main window/session, never Renderer Actor.
- `apps/electron/src/preload/index.ts`: only exposes main-frame-only `reviewAPI.readCurrentAuthorRevisionV3` (candidate-held/displayOnly) and `reviewAPI.upgradeCanonicalPlanV3` (Main published issuer-dependent CAS/Receipt). No Renderer authority installer, credentials, raw filesystem path or SchoolPort API.
- `review-v3-main-author-plan-ipc.test.ts`: exercises **actual** `registerReviewIpc` harness-installed handlers and fake Electron mainFrame window, including no-authority default denial, Renderer school Principal/fake frame denial, B1 author latest revision and async Owner generation revoke, real physical published old/new Plan artifacts and Case original bytes in Test-only trusted issuer fixture with ONE durable UpgradePlan Receipt/idempotency/collision, revoked publisher/Case grant and missing exact removal ACK deny. No fixture issuer is a real policy source.

## Trust and actual blocking dependency

The current C production branch **does not contain B1 candidate author vault code**. C accepts an injected `readLatestB1AuthorRevision` satisfying the exact B R14 `review-b1-draft/1` contract. The real B `readB1AuthorRevision` call and Owner/session/frame grant registry need a later **new, SHA-locked** B/C/I source integration and C approval. Do **not** copy or fork B author files into C.

The current C production branch **does not contain an authorized school/policy issuer**; the C Main authoritative published Plan provenance consumer is already present but no actual issuer is wired. The upgrade path has no fallback to unsigned DTO, candidate-held template, local-reviewer approval alone or synthetic Host receipt. Test fixture publisher only proves deny/allow control flow, not school authorization. No actual school Decision/Run ACK can be produced.

The Main frame gate is applied before dispatch and inside author async comparisons and Plan's serialized Case CAS through the privileged callback. No new Business writer lease is given to I or B. Any future source installation must independently attest Principal/Owner policy source; C fixture authorities are forbidden in production.

## Gate O (checkpoint to verify)

Committed initial registration `f816cc401ce066afd8708e8e8a14e3c9a5faa611`, physical Main handler regression test checkpoint **`eb93bab2c34166495f22553b7861da61fe3974d6`**. New exact-SHA Actions: PR `39320415985`, Baseline `39320415923`, Batch `39320416036`, D1 `39320416037`, D2 `39320415884`. **Initial Gate O pending; do not claim PASS until same-SHA raw PR CI and native handler tests.**

Gate E (real Electron on supported OS) **NOT_RUN**; school L `BLOCKED_NO_AUTH`, P author 5×30min UAT `NOT_RUN`, Release `NO_GO`. Stage2 I #151 is pinned `687ed356de3aee59075b85bf09a978eedab12a02` and no I C-owned production edits are approved.

## Next after code Gate O

1. Build privileged real Main source composition using **new pinned B1 integration** plus independently authenticated candidate author owner grant, not a renderer-provided authorId.
2. Connect a genuine published policy issuer or formally block Main `upgradeCanonicalPlanV3` pending school authority. Never fake C published Source provenance.
3. Real Electron Gate E: actual `senderFrame`, mainWindow navigation/reload, revoke during awaited disk read, cross-case grants, stale revision, delete Check durable Receipt, multi-PID crash/late ACK with original bytes, negative proof capture.
4. Only once this and separate C review pass may the user-facing B author UI be mounted with production workflow, and Gate P/Release considered.
