# V3-DEV-A-R01｜Implementation, safety and handoff

Date: 2026-10-19. Scope: Dev-A OWNED paths only. **No product/release GO.**

## Exact anchors
- C0 contract: PR #141, base code SHA 5682057c7232c914e72fdae525ce95fd33f32b53, version review-c0/1, source schema blob b7e5074a71cba3441aa76dd279c45f7021087bbc.
- C0 manifest pre-CI field IMPLEMENTED_NOT_VERIFIED; authoritative PR #141 handoff records C0_FROZEN_GO and five green checks at final SHA. Do not confuse the two.
- R3 evidence PR #140 @ 7f954661b3dbca7f0707832c2d097d9c68a965b4.
- P06 R03 db0284879f75ce123b5d83cb6577a3cc7ad057da; R02 c23789882aabf18689c314c77c270ac4a8ae4729.
- D4 c2f965d29022a42b3c32d6a4cb73aa8fd542329b; production main 8989941b6fb5651564e32d11c4215b6a6d5a5209.
- Dev-A PR #143, base branch feat/v3-dev-c-c0-contract-r01 (not main).

## What is actually implemented
A1 new review-pi-owner-adapter.ts:
- Main-owned injectable authority port. It explicitly requires trusted Main authorizeExecution and re-reads isCurrent; cannot be instantiated with an absent gate. It is not itself a new IPC handler or a school credential service.
- C0 RunEvidenceIdentity/CanonicalPlan/SourceIdentity validators and frozen identity binding; exact source version, hash, parse revision, block and location; only four review tool names.
- Persisted ledger with a content SHA-256 corruption check, file+directory sync on atomic replace, durable ACK ordering. Failures propagate, no success on failed write.
- Session never reassigned to ordinary chat, deleted ID tombstone, process-local deny before revoke disk I/O. Unfinished grants from any previous processEpoch are denied immediately, then recorded recovery-required by quarantineInterrupted.
- Current single-process adapter is not cross-PID transactional. No general ordinary-chat IPC route is changed in this PR. Dev-C must add actual binding to the existing session manager/IPC. SenderKey is a Main-injected input, never a renderer claim.

A2 new review-execution-event-adapter.ts:
- Emits only exact C0/1 ExecutionEvent fields/types; read-receipt-proposal, check-proposal, stopped, failed. Per attempt+generation monotonic sequence and content-addressed local delivery IDs.
- Durable append before delivery; exact dedupe/contiguous ACK and replay; explicit terminal seal with no postterminal event.
- guardedRead checks active owner/source before Host await, after Host await and again at append. Host must return actualSource matching the physical permitted SourceIdentity; only then is a proposed read receipt appended.
- NEVER writes Run/Check/ReadReceipt/Decision. ACK is only an internal Dev-A delivery marker pending Dev-C's final authenticated consumer.

A3 new review-execution-event-adapter-completeness.ts and review-execution-event-adapter-driver.ts:
- Memory-only completeness projection bound to frozen Plan/Run. Enumerates exact Check×target×object×subject; distinguishes Host-accepted/rejected/missing/unknown, nonapplicable, timeout/cancel/failed/turn-exhaustion; zero business write.
- 9/9 is called technically-complete only. Eight of nine, rejected, unknown and 24 exhausted cannot be declared finished; 1680-1480 computes 200 deterministically.
- Shared Host-facing adapter now accepts direct/hidden/Graph/batch mode under the **same** frozen C0 proposal schema, gated physical read and Host-attested check submission. Matching Host identity and post-await Owner checks are required; rejected checks cannot become accepted proposals.
- NOT yet wired to the existing direct/background/Graph/batch **actual production call sites**. Accepted Check event currently lacks target identity in C0, so correctness cannot be transported or finalized until Dev-C approves CR-A-001.

A4 recovery work partially present:
- Process-epoch denial and interrupted-grant quarantine, tamper detection, durable ACK/terminal attempt seal.
- Cross-PID locking, genuine ENOSPC/EACCES fault volume, kill -9 while directory fsync, Windows durability and Dev-C exact ACK/reconcile remain gated.

## Function-level reuse / differential design
| Historical anchor | Used design/behavior | New implementation & deviations |
|---|---|---|
| R03 review-agent-assignment.ts blob 959eaf18efaaef302f3cbb9760501b90400e6549 createAssignment/revokeAssignment/checkAssignment | grant, current assignment, pending deny before I/O | v3 Main-only gate, processEpoch on all live grants, source/plan/run lock, no direct business actions |
| R03 review-pi-admission.ts blob f4a6369170dcfc2839b398b144afa07a9d1577d5 admitPreparedPiReviewTurn | ACK only when actual ownership acquired; durable failed settlement distinction | local owner journal acknowledgement only; Orchestrator ACK remains C integration pending |
| R03 review-strict-pi-tools.ts blob 83d6ddf165d3547c81804708253c68e528ecdd9 selectDirectReviewStrictTools | four restricted review tools, after-await re-authorization | exact frozen SourceIdentity block/hash, Main-attested Host result and double-check |
| R03 review-background-state.ts blob f7f240afd1f53856b3ad846584d3dbfbb2cf9c | business Run is separate; prepared != accepted | proposal only, no separate Run and no false completion |
| R03 review-pi-run-bridge.ts blob a4746a241e3d0a8c325ce927f3ea8e9f73cfa198 | caller/Main owner start/stop and model selection guard | not overwritten; new execution adapter waits for integration |
| R02 batch-run-provenance.ts blob 17dfbf55580228e5f5045f6f5704841e4b80e23c | exact run/input binding negative requirement | Dev-C owns formal batch finalizer; this line does not re-implement batch WAL |
| D4 pi-review-submit-repair.ts | missing Check/repair proposal | A3 tracks exact statuses but online repair and output bridge remain pending |

## Test and gate matrix (not a claim that tests ran)
| ID | Capability, conflict, original gate | New source tests | Status before independent CI |
|---|---|---|---|
| A-OWN-01 | BG-01/BG-04, ARCH-013, F09/A11 | review-pi-owner-adapter.test.ts multi-owners | COMMITTED_NOT_VERIFIED |
| A-OWN-02 | BG-06, ARCH-013, A11 | tombstone/late source re-grant | COMMITTED_NOT_VERIFIED; actual P02 IPC still NOT_RUN |
| A-OWN-03 | BG-05, ARCH-013/017, A16 | guardedRead revoke-await | COMMITTED_NOT_VERIFIED |
| A-TOOL-01 | BG-03, ARCH-010/013, D10 | scoped source and Host attestation | COMMITTED_NOT_VERIFIED; real path/symlink still NOT_RUN |
| A-TOOL-02 | RUN-02/DOC-04, ARCH-010, D10 | single-block read proposal | PARTIAL: C0 cannot express full coverage |
| A-RUN-01 | RUN-01/05/06, ARCH-006/017, F07/A08/D10 | exact nine, rejected/unknown/24, delta 200; all four Host runner modes | COMMITTED_NOT_VERIFIED; production runner wiring & Provider not run |
| A-RUN-02 | RUN-04, ARCH-007/017, A16 | seq/ACK/replay/terminal/cancel state | COMMITTED_NOT_VERIFIED; crash/Provider not run |
| A-FAIL-01 | BG-04/05/06, ARCH-013/017, A11 | cold restart old epoch | COMMITTED_NOT_VERIFIED; true kill not run |
| A-FAIL-02 | BG-07, ARCH-016/017, A16 | injected ENOSPC writes | COMMITTED_NOT_VERIFIED; actual disk fault/crossPID NOT_RUN |
| A-INT-01 | RUN-04/07, ARCH-007/008, A08 | none: Dev-C formal Run integration pending | NOT_RUN |

## Env / commands / provenance
GitHub remote API permitted exact frozen branch reads and new code commits. Current container:
- command: git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git refs/heads/feat/v3-dev-c-c0-contract-r01
- exit 128: "Could not resolve host: github.com".
- command: which bun
- result: none.
No local repository test executed. PR CI is authoritative only AFTER final HEAD checks completed; never carry C0 green checks forward.

Commands for CI or an authorized isolated machine:
  bun install --frozen-lockfile
  bun test --isolate apps/electron/src/main/lib/review/review-pi-owner-adapter.test.ts
  bun test --isolate apps/electron/src/main/lib/review/review-execution-event-adapter.test.ts
  bun test --isolate apps/electron/src/main/lib/review/review-execution-event-adapter-completeness.test.ts
  bun test --isolate apps/electron/src/main/lib/review/review-execution-event-adapter-driver.test.ts
  bun run typecheck
  bun run check:boundaries
  bun test --isolate --timeout 30000
Also run old P02 deletion, owner-index recovery, tool guards, Office SourceRef, Pi completeness, and startup I/O tests from the checked fixed checkout.

Gate O: PENDING_CI. Gate E: NOT_RUN. Gate L: BLOCKED_NO_AUTH. Gate P: NOT_RUN; original 120+30 and model/UX/resource targets retain independent verification.

## Mandatory Dev-C handoff
1. Review CR-A-001; approve versioned eventId, identity, exact Check target and read extent, technical terminal and authenticated ACK, or explicitly reject with alternate secure mapping. No new shared schema silently created by A.
2. Wire a Main-only trusted sender/Principal callback and the current Case/Plan/Source snapshot; never allow renderer actor/session metadata to issue leases.
3. Wire owner session manager/projection/IPC, Pi direct and hidden tool dispatcher, Run event consumer and a real C0-only compatibility path with no formal completion.
4. Joint Gate O on one fixed integration SHA; then independently Gate E/L/P.
5. Keep this Draft; do not merge direct into main or mark Review V3 complete.

## Next development work
A1 unfinished: actual session manager and Orchestrator admission/stop; persist ACK/journal ordering across I/O faults. A2 unfinished: physical source mapper, full-source ledger, Host tool-result receipts and guarded submit. A3 unfinished: connect the now-implemented common Host wrapper to actual Graph/direct/background/batch caller entrypoints via Dev-C integration approval; C0 proposal mapping after C approval. A4 unfinished: cross PID/restart/fault-volume tests and Dev-C ACK recovery.

## A3 incremental delivery
- New adapter: `review-execution-event-adapter-driver.ts` (modes direct/hidden/graph/batch), test: `review-execution-event-adapter-driver.test.ts`.
- Host read must supply matching actualSource; Host submit must echo the exact Check tuple and outcome after an await; both paths recheck current Main Owner generation. The adapter does not invoke arbitrary model tools.
- `closeTechnical()` returns a memory-only proof of 9/9 Host receipts and does not emit a C0 completed/business-pass event. It is intentionally unusable as a Dev-C formal Run finalizer until CR-A-001 is decided.


## A4 follow-on: file-backed optimistic CAS, stale-state fence and A2 receipt idempotence
- Added OwnerPersistence.compareAndWrite(expectedRaw,nextRaw) as an optional Dev-A-local persistence port, **without changing C0 DTO**. The production file adapter uses exclusive O_EXCL .write-lock, atomic rename, fsync, and exact previous-file comparison. A contested/orphaned lock is RECOVERY_REQUIRED; never automatically steal by age or untrusted PID.
- Owner and event adapters remember the read snapshot. Before owner grant/private-session check/current-tool permission/query, event proposal append, pending delivery or ACK, they reject external changes. Writes use CAS when the underlying store supports it. Existing synthetic stores remain test-only with process-local semantics.
- A revoke/delete performs local denial before any failed write. The remaining interleaving between separate files and Dev-C final business commit **is not solved** here: C still owns transaction coordination and authenticated ACK.
- Same Host receipt ID plus kind/grant/sourceVersion/exact physical SourceIdentity digest returns one durable event. Reuse for another tool or block is REQUEST_ID_COLLISION. The private digest is NOT a new C0 eventId, a formal ReadReceipt, or full-document coverage; CR-A-001 stays PENDING_C.
- New tests cover two adapters sharing one file, stale CAS, contested lock, cold quarantine, file-backed outbox sequence, duplicate receipts and collision, malformed persisted record. These use **two objects in one test PID**; not a real two-process/kill/full-volume/Electron Gate E.
- The prior 4023 PASS CI applies to d8fd3e0e696caa1df7321c23c46e4f70a1f910f7 only. Latest new code/head needs its own Gate O workflow.

### Recovery procedure still to validate
1. If a .write-lock survives, deny all writers. Only an authorized recovery coordinator after independent proof of no active writer may remove it. No automatic stale lock steal.
2. C's Run consumer must revalidate attemptId/generation/sequence/manifest/Owner/current Case/Source before accepting a replay. Dev-A local ACK is not business persistence or approval.
3. Never reopen a grant from a previous processEpoch. Quarantine then issue a fresh trusted Main authorization and generation under an approved C contract.
4. Run two *actual OS PIDs*, cold kill, crash-after-rename, ENOSPC/EACCES and post-reboot recovery on an isolated fault volume before declaring Gate E.

### Separate OS-process CAS probes added
- `review-pi-owner-adapter-multipid.test.ts` invokes an independent Bun child process through `spawnSync(process.execPath, ['-e', ...])`. One case has the child commit a file CAS and verifies the parent with an old expected snapshot cannot overwrite it; the other has the child create an exclusive lock and verifies the parent fails closed. The fixture uses a disposable temporary directory and **no real Case/Run/Provider data**.
- This is a genuine two-PID test **of the filesystem persistence primitive only**. It does not certify that the Electron Main Orchestrator across two real user sessions or Dev-C Run consumer is safe; kill/recovery, actual full volume, cross-file atomicity and authorization remain unverified.
- Only a successful exact-HEAD PR CI after the test addition counts as Gate O evidence. Failed/cancelled/queued CI is not PASS.

### Last-authority-check to outbox append fence (additional A2/A4 slice)
- Production file persistence now exposes an optional synchronous `withLeaseFence` using the **same owner write lock as grant/revoke**. `V3ReviewOwnerAdapter.withAuthorizedEvent()` verifies current Main-owned lease *inside* this lock, then `V3ExecutionEventAdapter.append()` writes the C0 proposal before releasing it. A cross-PID owner revoke using the same file backend cannot land strictly between that final check and A's proposal persistence.
- Synthetic/in-memory ports do not claim cross-process serialization; they still pass their own scoped fail-closed tests. An uncoordinated external writer/third-party service that bypasses this port is outside the guarantee.
- Event acceptance before a subsequent revoke is still NOT formal Run acceptance: Dev-C must re-check generation/current Case/Source at consumer write time and reject old proposals. No C0 schema edits, no local ACK promotion.
- New negative: holding the Owner .write-lock prevents proposing any event even with an otherwise active grant; after controlled lock release, the first authorized proposal has sequence 1.
- Cross-PID disk CAS probes are real child processes only at the storage primitive layer, not a successful whole Electron/Run lifecycle test. Gate E remains NOT_RUN and CR-A-001 stays pending.

## Versioned Dev-C CR-A-001 A-1 proposal producer (next test checkpoint)
- Following Dev-C's #145 sliced approval, Dev-A added `review-v3-execution-proposal-producer.ts` and isolated `.test.ts`. **A1/legacy A2 remains independently available at old verified SHA for I; never silently replace that locked source.**
- The producer references the **C-approved wire shape** `review-v3-execution/1` via local structural types because A's original base is frozen C0. This is not a shared DTO fork: Dev-C owns `packages/shared/src/types/review-v3-execution.ts` at C #144 SHA `395f74741d4dda8635cc46fbd3dc2fb3ed86841e`; I must typecheck/validate both sides on its own exact integration SHA.
- A's Owner now freezes the Main-authorized complete `RunEvidenceIdentity` and `CanonicalPlan` in its own lease journal (old journals without snapshots are not upgraded into v3 grants). This binds the new proposal to current `runId/caseRevision/planFingerprint/sourceVersionIds/checkKeys/attemptId/ownerGeneration` rather than accepting Pi values.
- New Host port returns a receipt ID and actual physical source/check/status; A validates after-await and holds the cross-PID Owner fence across append. A calculates `eventId` from sorted canonical payload JSON SHA-256 and persists contiguous per-Run/attempt/generation events in a separate versioned outbox. Same Host receipt+body replays exactly; same receipt with changed body is rejected; old C0 proposals are never reinterpreted as V3.
- Physical `read.extent='full-document'` is forbidden unless the Host attests a positive equal physical covered/total block count. A only makes a Host technical claim; C must independently verify the Host receipt and Source validity. Precise Check×target×object×subject and status must exactly match the frozen Plan; `accepted` is illegal for applicability=unknown.
- A derives `completed-technical` from durable Host Check outcomes using the existing A3 exact coverage evaluator **and** at least one physical read proposal for each applicable source version. Any missing/rejected/unknown Check blocks completion; no source means no complete. The Host must also issue its own verified terminal receipt; C is still sole formal Run consumer and business finalizer.
- Proposal outbox intentionally exposes `replayCandidates` but **no method pretending to produce C's durable consumer ACK**. C2 must match its own receipt registry and current Principal/Case/Run/generation and persist uniquely before replying with authoritative ACK.
- Tests: check event canonical ID/run scope, real block vs alleged full read, spoofed source, exact Check statuses and receipt collision, unknown applicability, revoke during awaited Host operation, partial/completed-technical gates, ENOSPC before append, damaged and external-written proposal journal, disk restart with cold Owner denied but proposal replay possible for later C revalidation.
- Because development branch is still based on C0, new unit coverage is scoped to Dev-A structural contract. The critical same-SHA compile assertion against C's exported DTO + validator and integration with an actual Main/Host receipt registry are I/C tasks, NOT proved on A's own branch.
- **Gate O** for this new source SHA = PENDING_CI until workflows actually finish; C's newly approved schema is not evidence that A's new code compiled. **Gate E=NOT_RUN; Gate L=BLOCKED_NO_AUTH; Gate P=NOT_RUN.**

### Immediate follow-on
1. Inspect new exact-HEAD PR CI typecheck/boundaries/build and fix any first failures in #143. Avoid inheriting old workflow success from `d8fd3e0...`.
2. Run two-PID real producer replay and uncertain commit fault-injection tests, then test actual Main/Host glue with I without altering C business service.
3. C2 formal Run/ACK remains a C-owned implementation with approved spec, NOT an automatic wiring flag; P06 Graph/direct/hidden and actual Provider/Electron user journey must be tested before Gate E.

### Additional A4 uncertainty and 9/9 synthetic Gate O regression cases
- `review-pi-owner-adapter.test.ts`: injected disk backend writes the exact grant bytes **then throws EIO before a success response**. The original Owner must deny use due to snapshot mismatch; a cold restarted process sees persisted grant but marks it `recovery-required`, never treats that uncertain grant as live.
- `review-v3-execution-proposal-producer.test.ts`: injected proposal disk backend writes event bytes then throws EIO. Old process cannot publish/ACK from stale state. New producer loads the single persisted Host proposal, and reissuing the identical Host receipt returns that same eventId/sequence; a duplicate new proposal or business ACK is never fabricated.
- New synthetic 9 Check×target plan: source physical read+only 8 accepted Check receipts must reject `completed-technical`; the ninth accepted physical Host Check permits a **technical** terminal event, with 11 chained events (1 read + 9 checks + 1 terminal). No business ReviewRun/Decision is written.
- The C-owned contract on PR #144 has a successful **distinct** new code checkpoint `6a9de1ecc4d8d24dc1c29935230b28a579f997df` (per #145 C decision), independent of A. Crossline typecheck/contract-verifier still needs I/C combined SHA.
- GitHub Actions PR CI at the A latest new HEAD has not yet returned a passing result at the time of handoff, because workflows were queued/pending. All new tests above are **committed test code, not yet passed verification evidence**. Gate O latest = PENDING_CI; E=NOT_RUN, L=BLOCKED_NO_AUTH, P=NOT_RUN.
