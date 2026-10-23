# Dev-C ONLY — R07 C-MAIN-B20-WIRE-R02 真实 Main IPC 与物理来源 CR

> **C-ONLY / Only future Dev-C and the user.** A/B/I do NOT need to read, ACK, or execute this document. All binding cross-track permissions reside in the one ABCI document under DECISIONS:C; I has separately been notified via #155. This file adds no additional delegation, no School issuer, no Main lease.

## 1. Precise source checkpoints and product status

- Dev-C #144 branch `feat/v3-dev-c-business-r01`; previous signed C SHA `67960811880e0a84bf62eb6f828ea6c72a101901`; **new formal Gate O signed C SHA `fd88be3ea33fe60ca992af3640d77ecc36f015bb`**.
- Compare old→new: ahead 3/behind 0, four C-owned changed paths only: `apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts` (+87), new `review-v3-main-b20-electron-ipc.test.ts` (+158), `apps/electron/src/preload/index.ts` (+9), `packages/shared/src/types/review.ts` (+2).
- Original R07 C commits: `c7f887c9f87b21608678652bd1ae20a8e98d091f` Main/Preload/channel, `aebc6343a57abd15cf8182d22a3617e62fa33d0c` real handler tests, `fd88be3ea33fe60ca992af3640d77ecc36f015bb` strict TypeScript error repair.
- **Formal C signoff:** https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6280267221
- Final GitHub Action exact SHA: PR 39346092347 job 118378927237, Baseline 39346092230, Batch 39346092212, D1 39346092348, D2 39346092341 — **5/5 successful**. Frozen deps, all TS, package boundaries, skin, Electron Main/Preload/Renderer builds PASS, full Bun **4166 PASS/5 OS skip/0 FAIL, 480 files**; `C-MAIN-B20-WIRE-R02` 6/6 PASS. First red R07 candidate `aebc6343...` PR CI 39345649133/D1 39345649125/D2 39345649146: TS2345 unsupported storage ID field label. Fixed `caseCandidateId`→`caseId` validator label only; no semantic/security bypass.
- Product limits: **Gate O PASSED for IPC read boundary only**; B1/B2/B19/B20 producer, ZIP physical native picker, C current candidate registry/Owner/Principal installation **NOT YET INSTALLED**. Uninstalled handler is **default DENY**. E NOT_RUN / School L BLOCKED_NO_AUTH / P NOT_RUN / Release NO_GO.

## 2. Runtime implementation and actual trust proof

`registerReviewIpc()` calls `registerCMainV3AuthorPlanIpc()`, which now registers `REVIEW_IPC_CHANNELS.B20_CANDIDATE_READ_V3` to `handleCMainB20CandidateRead`. The real main-frame-only Preload exposes `reviewAPI.readCurrentB20CandidateV3(templateId)`. The handler refuses every payload field other than `templateId` (no Renderer actor/Owner/archive key/pick/author pin/issuer), requires `assertC0ReviewMainSender(event)`, current native `senderFrame`, actual current Main window; then uses an independently installed C Main source for candidateId/Owner/grant/epoch/ACL/pinned author expectation and registered B20 read. It invokes the existing `CMainB20TrustedCandidateRead` two physical snapshot reads with installation identity and Owner/pin/ACL revalidation, returning only `candidate-held`, `displayOnly`, `businessWriteAllowed=false`, `publicationAllowed=false`, `schoolPolicyVerified=false` and candidate source provenance.

**Important limitations**: current Main liveFrame emits local-device `local-reviewer`; that is not a school principal or issuer. Real enrolled Principal/session binding, Owner grant provider, Main-issued numerical B2 authorityEpoch translation, native file picker registry, pinned revision/fingerprint installation, actual B R23 source imports, and physical Electron Gate E remain pending. The six new tests use injected trusted Main B20 snapshots only and must NOT be represented as a physical ZIP/B1/B2 integration PASS.

## 3. Formal I source CR — approved but not imported

- C source decision: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144#issuecomment-6280157417
- I notification: https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/155#issuecomment-6280212886
- Single ABCI DECISIONS:C: `CR-B20-R23-EXACT-SOURCE-INTEGRATION-R01=APPROVED_SCOPED_NON_C_OWNED_SOURCE_REPLAY_ONLY`.
- Pinned B origin **old R23 green** `d96c3d176159cd12f4befd2a91bfeade44dca216` (PR 39338187046 Bun 4245/5/0, D2/Baseline green). I frozen accepted parent: `d9ba4ba54293963f8d962182548a627d52b566a3` #155. Existing #155 MUST NOT be overwritten.
- I may copy **ONLY 11 exact B R23 Git blob source paths** and up to **10 enumerated exact B-only tests**, with individual SHA list in C formal comment and ABCI; one independent Draft, no B HEAD merge, no C-owned Main/Preload/shared/Case/Run/Owner/Host/Business Writer file. B R24 new changes are outside this CR, irrespective of later CI result.
- Eleven source files include B20 facade, B1 author vault/plan compiler, B2 staging/parser/ZIP vault/ledger, B19 candidate bridge, ZIP staging/intake, input handoff. Existing I author vault `37cf71a3...` vs R23 `065251ca...` and staging `ebc5f82c...` vs R23 `e9116630...` are **actual conflicts**; I must review changed implementations and preserve source/rollback. I already has matching B1 compiler `974f0b0d...` and B2 source-version `b2101be8...`.
- Once I submits exact source+parent+files and same-SHA full Gate O (including physical B20/ZIP/Subject/Owner/invalid-version negatives), C must **separately sign I new exact SHA**. Source permission is not integration signoff.

## 4. Next C engineering batch — no additional design archaeology

**C-MAIN-B20-PHYSICAL-COMPOSE-R03 (first)**: Read I's new independently accepted B-source checkpoint when available and do file-level provenance/ABI comparison. Bring approved B producers into a C integration composition without second storage. Install C-owned genuine `currentCandidate`, native Main Principal/session/senderFrame/Owner/grant/epoch, author B1 vault pin, Main-owned physical ZIP native picker archive key and current-selection registry. Explicit trusted mapping is required because current C `authorityEpoch` is string and B20 `authorityEpoch` is number; never convert untrusted Renderer source. Verify actual ZIP archive bytes/current SHA and ledger/parseRevision/Subject/Check binding after every await; prove cold PID, Owner revoke, retargeted Subject, replacement archive, same SHA physically distinct and historic accepted no-current authority. Add real Electron Main/Preload/Renderer product caller and Gate E scheduling only after Gate O.

**C-MAIN-HUMAN-OBSERVER-R02 (parallel C-only)**: real native Main human observation dialog/ledger for Plan Check removal, user-visible complete obligation diff; use existing one-use C CAS physical consent gate, no Renderer boolean approval, no fake School issuer.

**C-RUN-HOST-DURABLE-R07 (parallel C-only)**: move old in-memory Run-wide Host tombstones into Case/Run durable CAS, PID-crash and reentrant owner lock negative tests; A Pi transport receipt never C physical Host witness. Do not auto-clear a stale write lock.

**C business chain**: approved School policy publisher only after real L authorization; native Case/Plan/Run, material version, Check, batch/background, Workbench user path, E/P gate with independent real observations. Do not approve release based on offline CI.

## 5. Cross-track safety and rollback

C #144 retained Draft. R07 rollback is fixed C `67960811880e0a84bf62eb6f828ea6c72a101901`. I R23 source CR is separate from C source integration and does NOT activate I Main lease or writer. All previously signed A/B/I refs and historical code remain immutable. The C-only evidence in this document is not the shared source of governance truth. No Main merge / Release GO.
