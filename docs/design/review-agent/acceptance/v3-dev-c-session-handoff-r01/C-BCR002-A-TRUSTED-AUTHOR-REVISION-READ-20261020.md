# Dev-C C-BCR002-A | trusted Main author-current-revision read

**C-only, technical engineering report; NOT a cross-line grant.** Binding permission in the single four-line #145 coordination document `DECISIONS:C` record `B-CR-002-A`. I3 Stage2 newly signed separately as `C-I3-STAGE2-R01-FINAL-ENG-ACCEPT` (#151 `687ed356...`); no additional I source rights.

## Source scope

C #144 new C-only `apps/electron/src/main/lib/review/review-v3-main-author-revision-read.ts` + `.test.ts`, initial code `00b2b26fb6e367fb165b863fdf397370937f713a`, tests `eda3c4c6f854cc369932def35d17685f03aabd18`; test race fixture refined `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d`.

Matches actual Dev-B fixed R14 full-chain B1 source `review-template-author-store-v3-b1.ts::readB1AuthorRevision(templateId)` (schema `review-b1-draft/1`, `document.status=candidate-held`, `revision`, `digest=sha256(JSON.stringify(document))`, `authorId` exists but MUST NEVER serve as authenticated Main actor). This file is **not imported into C**: B owned source stays pinned outside C, injected only by independent future I source integration and trusted Main wiring. No duplicate shadow author ledger, no UI write, no published policy, no business Case mutation.

`CMainTrustedAuthorRevisionRead` permits only Main-injected `currentIdentity()` with trusted Principal, Session, Owner ID/generation, window, sender frame and authority epoch; separate `canRead()` scoped to template. Before/after awaited read it rechecks identities and authorization, calls B full-history privileged latest revision reader twice, verifies current digest and exact latest revision+source body, and returns immutable-cloned **displayOnly/candidate-held** DTO. Revoked/rotated/closed, another-template, invalid path, changed physical revision, forged digest, Principal mismatch all reject. Result is not a capability to mutate or freeze; future B save or C UpgradePlan must independently check CAS and caller authorization.

## Tests and current gates

Seven authored positive/negative Bun cases: legitimate latest read and detached DTO; wrong template/permission/no senderFrame; Owner rotation during await; frame close on second read; source revision race (must reject, not clobber); malicious recordedBy cannot be promoted; missing independent trust callbacks or tampered digest fail closed.

Initial exact SHA `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d` GitHub Actions PR `39316695862`, Baseline `39316695755`, Batch `39316695746`, D1 `39316695787`, D2 `39316695769` started; **new C-BCR002-A Gate O must be independently checked from SAME SHA before C signs; initial state pending**.

No actual real B reader/B1 files in C snapshot, no IPC/Preload/renderer main entry point, no external school publisher, Gate E NOT_RUN, L BLOCKED_NO_AUTH, P NOT_RUN, Release NO_GO. I readonly Main lease inactive/business writer DENIED. C-BCR002-B formal removal ACK next C-owned engineering after independent A check.

## Final exact Gate O for C-only A scope

Engineering SHA `3878511503f59ed3f44c1ae818dd7ae6abb9ff9d`: PR CI `39316695862`, job `118280136144` TypeScript/boundaries/skin/Main+Preload+Renderer build + Bun **4118 pass/5 OS skip/0 fail (4123 tests/475 files)**; actual 7/7 new C BCR002-A source-read cases PASS. Baseline `39316695755`, Batch `39316695746`, D1 `39316695787`, D2 `39316695769` all SUCCESS. **C-BCR002-A-FINAL-GATE-O PASS_EXACT_SHA_OFFLINE_READ_ONLY.** A further C-only structural type compatibility improvement (B1 interface without index signature) committed in later BCR002-B final SHA `461b5c9...` and re-verified under its own 5/5 CI. Gate E/L/P and release remain blocked as before.
