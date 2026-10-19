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
