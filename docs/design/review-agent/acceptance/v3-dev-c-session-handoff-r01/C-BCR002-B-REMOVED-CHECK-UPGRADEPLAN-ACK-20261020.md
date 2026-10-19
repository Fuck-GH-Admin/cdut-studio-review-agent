# Dev-C B-CR-002-B | Removed Check business UpgradePlan ACK / CAS / durable Receipt

**C-session only; formal authoritative scope is #145 DECISIONS:C `B-CR-002-B`.** No I or B authority to edit this C-owned Main Case write path.

## Real engineering on Draft #144

From previous exact accepted C BCR002-A `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d` (5/5 Gate O, full Bun 4118 PASS/5 SKIP/0 FAIL), C adds narrow business contract to existing `apps/electron/src/main/lib/review/plan-binding-v3.ts` commit `12e9857f706b01dadc69be7573567de4e17b7395`, with new `review-v3-plan-removal-ack.test.ts` commit `d7d6254160844c83177595285a1ddb1755965c60`.

`describeRemovedPlanBindings(before,after)` is deterministic tuple identity `[checkKey,targetKey,objectKey,subjectId,sorted(sourceVersionIds)]`; it represents removed *obligations* rather than raw Check count, so changing bound source versions also requires user removal ACK for prior obligation. Conditions/outcome-only changes do not count as deletion. Recomputed **inside** original `submitCommand` at serialized Case CAS, not trusted from client diff.

`upgradeCanonicalPlanV3` retains prior public signature and adds optional `removalAck` carrying **exact previous+next immutable fingerprint and sorted complete identities**; if any obligation is removed, incomplete/extra/duplicate/mismatched ACK or missing independently injected `CMainAuthorizeRemovedPlanBindings(aggregate,actor,ack,computed)` refuses. C Main callback must independently authenticate actual current Principal/Owner/grant/Subject and authorized human intent at transaction time; a caller Actor string or B Wizard UI confirmation is NOT trusted Main authentication. Both new and old published Plan evidence rechecked at commit for deletions (if historical publisher revoked, a separately authorized recovery path will be needed; not silently bypassed). No deletion => existing operator acknowledgement stays, removal-specific ACK disallowed.

Success reuses **ONE** existing `UpgradeCanonicalPlan` durable Case transaction, PlanHistory append, requestId/type/payloadHash idempotency, revision increment and same-file Receipt commit from `case-store-v2.ts` with C-Tx inter-PID protection. No shadow deletion ledger or school Decision writer.

Six authoring tests include deterministic Check/source identity, missing local-only ACK refusal, forged/deceptive ACK fingerprints and identity sets, absent/revoked Main callback, exact successful Receipt/immutable old Plan/history/replay/collision, revoked previous publication and nonremoval upgrade compatibility.

**Exact new engineering SHA `d7d6254160844c83177595285a1ddb1755965c60`**. GitHub workflows triggered: PR CI `39317571754`, Baseline `39317571911`, Batch `39317571776`, D1 `39317571811`, D2 `39317571801`. **Initial Gate O PENDING.** If CI fails, preserve first failure and repair on new exact SHA; do not claim past green C BCR002-A covers new code.

## Binding limitations

- `authorizeRemoved` is trusted **only if** backed by real C Main actor and frame/grant/Owner observer, which is NOT wired here. Mock callback in tests proves contract/rejection rules only.
- The C Main published Plan verifier is injected; actual B school issuer not present; old publisher revocation currently denies destructive upgrade conservatively.
- Existing `submitCommand` receipts persist summary and payload hash, and old+new immutable Plan history can reconstruct deleted identity; no school decision made.
- No IPC/Preload/UI Main wiring, no cross-host storage or hard-power-loss claim; real Gate E NOT_RUN, L BLOCKED_NO_AUTH, product UAT/P NOT_RUN, Release NO_GO.
- I #151 exact `687ed356...` remains signed only for A R14 technical replay and cannot import this C new revision implicitly. No I Main writer lease or B Main/IPC code permission.
