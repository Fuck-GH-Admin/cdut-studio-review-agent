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


## A4-R02: durable pause, reauthorized resume, grant rotation and fenced V3 replay
- Owner now supports an A-local `paused` technical state in its sealed journal. `pause(sessionId)` makes the same-process grant unusable before persistence. After a failed pause write, the original process retains local denial; neither a false pause ACK nor an old tool permission is issued.
- `resumePaused(sessionId,formerGrantId,senderKey,principal)` is **Main-only**: requires the same process epoch, an exactly matching paused Owner, unexpired original lease, complete previously Main-attested immutable Run+Plan snapshot, unchanged sender/frame scope, fresh `authorizeExecution()` plus `isCurrent()`; only after successful durable write is local denial cleared. A new random grantId is issued; prior in-flight Host results cannot use the old grant after resume. Run/attempt/generation are unchanged because this is a technical pause, not a new business Run/Decision.
- On process restart, a paused or active foreign-epoch Owner becomes `recovery-required`; no paused Owner can be resumed from a new process. `quarantineInterrupted()` persists this classification before any later recovery plan. Revoked/deleted/terminal sessions never reopen through this API.
- New V3 proposal chain permits the next sequence from a **newly Main-authorized grant for the same frozen Run**, while preserving original proposal bodies, sequence, and each grantId in place. The journal's initial grant ID remains an audit origin field, not a rewriteable 'current-grant' field. Repeated Host receipt IDs with changed grant/body remain collisions and are never silently upgraded.
- Technical `completed-technical` is calculated solely from **current-grant** persisted, Host-attested read and accepted Check outcomes. Old grant evidence cannot be inherited across resume to manufacture completeness. Contradictory accepted/rejected/unknown outcomes in one grant also block completion instead of choosing whichever was favorable. Main C2 still decides formal consumption and may reject pending old-grant proposals after a revoke/rotation; A emits no business ACK.
- New tests: `A-PAUSE-01..05`, `A-PAUSE-V3-01..02`, `A3-V3-14`. They exercise rotate/revoke, Main denial, ENOSPC pause, disk-backed cold restart, late Host read after resume, same-run sequence across rotated grants, coverage reset, and contradictory Host status fail-closed.
- Important **unclosed contract/flow**: a C2 Run consumer has not been wired. Before taking events across an Owner pause, C must define whether already-durable but not consumed events with the old grant are rejected or recognized by an independently durable pre-pause trust record. Do not infer that A local producer replays constitute C committed ACKs. A's conservative current-grant technical coverage intentionally does not rely on them.
- A4-R02 Gate O: **PENDING_LATEST_EXACT_SHA_CI** (new tests committed, CI may be queued due GitHub runner). Gate E real Electron end-to-end and full OS two-PID lifecycle **NOT_RUN**; Gate L **BLOCKED_NO_AUTH**; Gate P **NOT_RUN**. File primitives/isolated synthetic Host tests are not a replacement for app integration.

## A4-R03｜真实独立 PID 冷崩溃、Host-await 撤权验证（本批已提交，CI 未签收）

- 本批来自协调 PR #145 已更新的 `C-I0-ACCEPT-001`（I0 限定验收）与 `C-I1-AUTH-001`（I1 技术-only GO），没有增加 A 的 C-exclusive 写权。I #147 已在旧已绿 A SHA `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 上真正组装技术集成快照；本次 A4-R03 新 SHA 仍须独立 CI 验证，不能浮动替换 I1 锁定来源。
- 新 `review-v3-execution-crashpid.test.ts`：真实独立 Bun child PID 创建带完整 frozen Run+Plan 的 Owner、Host-attested 单块读取 proposal，并在真实文件 fsync 落盘后 **SIGKILL** 退出，没有应用 shutdown callback。主进程重新打开 Owner 时分别复验 `active` 和 `paused` 两种死亡前状态：旧 capability 必须变 `recovery-required`，`quarantineInterrupted()` 持久记录；proposal 仅能被读作候选，无法借旧 grant 调用 Host/写新事件；普通聊天不能接管私有 Owner ID。
- 新 `review-v3-execution-late-pid.test.ts`：真实独立 Bun child PID 在合成 Host read 中 await，parent Main-only Owner 复开同一物理账本并持久 `revoke()` 后发释放信号。子进程恢复 Host 时必须由于 Owner CAS/snapshot 已变而 `RECOVERY_REQUIRED`，事件文件不存在/无新 proposal，避免 await 期间撤权后迟到事件污染。不是单进程两个对象伪称双 PID。
- 测试作用域：Linux/Bun 两个 OS PID、临时隔离磁盘文件、Main 授权/Host 只用**合成端口**。没有 Electron Renderer→Preload→Main 真实上下文，没有真实 Provider、外部学校权限、正式 C ReviewRun、可信 C ACK；**仅归属 Gate O 的 A4 可靠性负例，不代表 Gate E 通过**。真实多 PID app lifecycle、断电/fsync 崩溃点、满卷 EACCES/ENOSPC fault-volume 仍需集中实机验收。
- 本轮未修改 `packages/shared/**`、Main IPC、preload、Case/Run/Decision writer，也没有自行批准 `CR-A-001` 的 Run 消费者。源 Producer 仍只输出 C 批准的 `review-v3-execution/1` proposal candidate。
- 精确测试文件：`apps/electron/src/main/lib/review/review-v3-execution-crashpid.test.ts` 与 `review-v3-execution-late-pid.test.ts`。目标命令：`bun test --isolate apps/electron/src/main/lib/review/review-v3-execution-crashpid.test.ts apps/electron/src/main/lib/review/review-v3-execution-late-pid.test.ts`；随后 `bun run typecheck`、`bun run check:boundaries`、Main/Preload/Renderer build 和 `bun test --isolate` 全量。应保存 first failure、fix SHA、精确 workflow job/exit、PASS/FAIL/SKIP 数，不借旧 SHA。两个 PID Linux 专项测试在非 Linux 需明确记录 SKIP。
- 本批首次源测试 SHA `cc7105e8b822542e18d051381fe442a9dc4deefd`（cold SIGKILL），第二次 `73936866d42be2348788c94153ee5b0a23293f7c`（跨 PID await revoke）。这些均仅为**已提交源代码**，观察时 PR CI 仍排队，新 HEAD Gate O=`PENDING_EXACT_SHA_CI`，E=`NOT_RUN`，L=`BLOCKED_NO_AUTH`，P=`NOT_RUN`。

### Gate O 首败排障优先级
1. 检查 SIGKILL 子进程在 GitHub Linux runner 中能否加载 TS module 的 file URL、完整写盘后产生 marker，不能把超时/异常当安全拒绝。
2. 检查跨 PID await 测试是否在 `ready` 后先持久 revoke、再 signal Host release；只有子进程 **明确 `RECOVERY_REQUIRED`、0 proposal** 才 PASS。
3. 如果 CI 排队不运行，不将 tests-committed 改成 tests-passed，也不要凭 C / I / 旧 A CI 继承新切片的 Gate O。实际 C2 消费端的 ACK replay、真实用户 Electron/Provider 全流程仍由对应边界验收。

## A3-R04｜Main-SDK 24 轮技术执行预算持久化（等待精确 CI）

- 新增自有生产文件 `apps/electron/src/main/lib/review/review-v3-execution-turn-budget.ts` 与 `.test.ts`。`V3ATurnBudget` 是 **A 自有执行技术计数器**，不创建业务 ReviewRun/Check/Decision，也没有正式 ACK。
- 每一次真实 SDK 完成轮次由 Main 传入 **稳定且非空的 Main 观察 SDK turn receipt ID**。`recordCompletedTurn(call,mainTurnReceiptId)` 必须持有当前 Owner `review_submit_result` 工具权限、Main principal/source scope，和 Owner 同一跨 PID lock 完成 CAS 持久化；同一次 Host/SDK turn 的回调重试返回原 count、不重复扣除。
- 累计计数按固定 `(runId,attemptId,ownerGeneration)` 及完全冻结的 Run SHA 归属；Owner 暂停+再次 Main 授权轮换 grantId **不重置计数**。完整冷启动能读取 count，但无法绕过旧 Owner epoch quarantine 来新增 turn。已达到 `maxTurns=24` 的 attempt 对第 25 个新 SDK turn fail closed。
- 接入 A2 新版 `V3AProposalProducer` 可选且 Main-owned `V3ATurnExhaustion` 端口：**必须确实完成 24/24 持久计数** 才能产生 `terminal.needs-resume` 候选（仍需独立 Host 终态 receipt）；在耗尽后继续请求 read/check 被拒绝，包括 Host await 后的再检查。默认不注入端口时不得自行生成 `needs-resume`，防止 Pi/Renderer 自称轮次耗尽。其它已存在 A2 V3 terminal 合同不变。
- 文件 hash sealed，Owner file fence、CAS 防双 PID 旧快照，独立 budget file journal 可重新打开。ENOSPC 写盘前不返回假 turn ACK；模拟写盘已完成却抛出 EIO 时旧实例因 revision 不匹配不可信，重新打开同 SDK receipt 仍只记 1 轮。
- 新测试：`A3-TURN-01` 23/24 与 24/24 终态；`A3-TURN-02` pause/rotated grant 第 1–24 轮不可复位；`A3-TURN-03` 真实文件恢复旧 Owner quarantine 而 budget preserved；`A3-TURN-04` ENOSPC；`A3-TURN-05` forged grant/wrong tool/损坏账本；`A3-TURN-06` 跨 grant 重复 SDK turn ID 不二次计费；`A3-TURN-07` post-commit EIO 冷恢复幂等。
- **边界**：由 Main 真实 SDK Adapter 提供可靠的 turn receipt ID 仍待 I/C 对实际执行入口接线，本轮测试使用合成 Main/Host，**不构成真实 Provider 的 24 轮 Gate E 或 C2 Run 完成**。旧 C0 producer不变；不修改 `packages/shared/**`、Main IPC、Preload、V2 Case writer 或 C2 Run consumer。
- 源工程 SHA 在 #143 查 latest HEAD；Gate O 仅接受该 SHA typecheck、boundary、build、全量回归成功的独立日志。新代码目前已提交而 PR CI 仍处 GitHub 队列；不得继承旧 `d8fd3e0...` 结果。E=NOT_RUN、L=BLOCKED_NO_AUTH、P=NOT_RUN。

## A3-R05｜Main SDK 单轮回调桥接与中断恢复（源已提交，最新 Gate O 待执行）

- **工程新增**：`apps/electron/src/main/lib/review/review-v3-main-sdk-turn-bridge.ts` + `.test.ts`；现有 `review-v3-execution-proposal-producer.ts` 增加 `terminalCandidate(run)` 只读检查。所有为 Dev-A 自有端口代码，未改 `packages/shared/**`、`review-ipc.ts`、Preload、Case/Run/Batch/Outbox、正式业务状态或 C 的执行合同。
- `V3ASDKTurnBridge` 构造函数接收 Main-only `V3ReviewOwnerAdapter`、`V3ATurnBudget`、`V3AProposalProducer`、可信 `V3AMainSDKTurnPort.nextTurn()`；后者**必须**由实际 SDK Main Host 回调提供 `RunEvidenceIdentity` 和稳定 SDK turn receipt ID，**不能**是 Renderer/Pi 模型文本或模型自述。当前该真实 SDK 端口**没有接入**：本批只验证隔离桥接层和合成 SDK Host 正反例。
- `next(call,mode,signal?)` 接受 direct/hidden/graph/batch 技术模式，SDK 调用前后分别复查当前 Main Owner grant、window/sender、Run+attempt/generation。Host 回执冻结 Run 不同、空 SDK receipt、延迟完成但 Owner 已撤权/暂停/权限失效、已取消的 Main `AbortSignal`，一律拒绝轮次计数和新增 proposal。
- SDK 返回 `completed-turn`：仅当回执 Run 完全一致、当前 grant 有效且未被取消时，将 receipt 交给 A3-R04 持久 CAS/幂等轮次预算；达到 24/24 后才调用 A2 Producer 的 Host-attested `needs-resume` 技术终态，**不生成业务 PASS**。24 轮尚未达标不生成 `needs-resume`；第 24 轮已入 turn journal 但 terminal append ENOSPC，允许 `closeExhausted` 仅补技术 proposal，不再调用 SDK/重复扣轮次。
- SDK 回调返回明确 `interrupted`（cancelled/timed-out/failed）：仅尝试生成 Host 自己再确认的同状态 terminal 技术候选，不伪造 SDK 完成轮数；若 Provider 直接抛出异常而非 Main Host 已确认的回执，则向上抛出、不自行臆造终态。**当前仍未接入真实 Provider 的 failure classifier / AbortController 生命周期**。
- 独立持久事件 ledger 已有 `terminal` 时，Main bridge 在 SDK 调用前通过 `terminalCandidate` 阻断后续 SDK 执行；唯一例外是**同 grant** 且预算已耗尽的 `needs-resume` 只读返回原技术候选，不能重新调用 SDK 或继承旧 grant 的正式 C ACK。
- 两个意外并存的 Main bridge 对象按 process-local Owner session 共用 active-SDK guard，拒绝同 session 的并发 SDK `next`；不声称这替代跨 OS PID 的实际工作量调度与 durable execution lock。跨进程持久互斥仍在 Main Owner ledger 最后授权/落盘阶段进行，Owner epoch 冷重启后旧 grant 不可复活。
- 可执行合成负例 `A3-SDK-01..16`：普通成功只记 turn、24/24 技术 terminal 与重放不重复调用 SDK、timeout 仅技术 terminal、不认 Provider 抛错、不认伪 Run/空 receipt、revoke/Main authority 失效的 Host late result、ENOSPC terminal recovery、同 receipt 去重、terminal 已 sealed 拒再执行、pause→new grant 拦截旧 SDK promise、Main `AbortSignal` 预取消和执行期取消，以及两桥同 Owner 并发冲突。**全部为已提交测试，尚不能宣称通过**。
- 当前原 #143 base C0 `5682057c7232c914e72fdae525ce95fd33f32b53`；C 新 `review-v3-execution/1` DTO/validator 在 C #144 另一个 SHA，必须由 I/C 在相同新集成 SHA 上验证实际 DTO 类型、Host receipt registry 和 C2 durable Run consumer；不得宣称 A 仅通过合成测试即签业务 ACK。
- **未解决**：Main 真 SDK callback 注册、Pi turn ↔ stable receipt 的物理来源证明、Graph/batch 真实生产并发、跨 PID SDK singleton、Provider 取消/关闭窗口实机、真实 EACCES/ENOSPC 盘及硬崩溃、C2 durable receipt replay、同 SHA A/C/I Gate O/E/P/L。正式发布必须继续 NO_GO。
- **验收控制**：本批收口 SHA 只以 #143 最终 HEAD 为准；上一已绿 A SHA `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 仍是 I1 首批来源，禁止自动浮动。GitHub PR CI/D2/Baseline 当前 runner 多次排队，新代码必须由同 SHA 的真实 workflow 成功证明；Gate O=`PENDING_EXACT_SHA_CI`，E=`NOT_RUN`，L=`BLOCKED_NO_AUTH`，P=`NOT_RUN`。

### A3-R05 final static review addendum
- Run evidence values are compared by canonical sorted-key JSON, not JavaScript object insertion order; exact case/run/attempt/generation/manifest fingerprints must still match. Synthetic `A3-SDK-16` covers a reordered but equivalent SDK Run while existing `A3-SDK-05` rejects modified attempt.
- New process-local SDK lock is deliberately **not** proof of cross-PID singleton. A3-R05 remains isolated Main-port implementation, not the real SDK registration or C2 business outcome.
- CI status must be taken from the final source SHA's PR CI, D2 and Baseline, not the intermediate cancelled jobs or prior green ancestor.

## A4-R04｜可信 SDK 派发前持久意图与不确定结果拒绝重试

- **问题证据（源码审阅，不是 CI 通过结论）**：此前 A3-R05 在 `V3ASDKTurnBridge.next()` 直接调用 `sdk.nextTurn()`，只有 SDK 返回完成后才调用 A3-R04 轮次预算写入。进程在 SDK 已开始但回执/预算写盘前崩溃，或 Provider 抛异常，账本可能仍显示 0 轮；自动重试可能再次调用 SDK。此前技术终态和轮次持久化 **不能证明此前没有派发过 SDK**。
- **本批生产实现**：新增 A 自有 `review-v3-sdk-dispatch-fence.ts`（`V3ASDKDispatchFence`）；版本化 `v3-dev-a-sdk-dispatch/1` hash sealed 技术意图 ledger，`claim()` 在 SDK 开始前持 Main current grant/Owner cross-process lease fence 持久写 `in-flight`；`settle()` 仅在 SDK 完成并记录可信轮次预算后，或 Host 终态提案持久写入后标记 `settled`。不同于 C 业务 Transaction/ReviewRun/Outbox，此记录**没有业务 ACK 能力**。
- 发生 SDK 原生异常、Host 返回的 Run 不可信、轮次预算写盘 ENOSPC、dispatch intent 写盘后抛 EIO 或进程突然死亡时，保留 `in-flight`，同固定 Run/attempt/generation 的后续 SDK 自动 `claim` 一律返回 `RECOVERY_REQUIRED`；**不自动重新执行模型，也不伪造完成/取消状态**。不能凭剩余轮次和 `Provider crash` 反推这轮从未执行。
- SDK Promise 已真实返回，但旧 grant 在 await 期间被撤销/暂停、或 Main AbortSignal 已失效时，bridge 不写轮次/Host Check，调用仅针对匹配技术派发 ID 的 `lateDenied()` 记为已返回却拒绝的技术意图；它不会恢复旧授权。其后新 Main 授权的 grant 可重新派发。若进程在 Promise 返回前崩溃，仍保留 unresolved，不由 `lateDenied` 猜测结果。
- `dispatch` 技术记录按冻结完整 Run JSON digest 及 `[runId,attemptId,ownerGeneration]` 绑定；不同 Run 身份、双派发、陈旧 journal CAS、重复 ID、非空 SDK 完成回执条件、损坏 hash seal 会 fail closed。意图链保存所有已 settled/late-denied 记录，不只保留最后一次状态。仅用于技术诊断和拒绝自动重试，不是正式 C2 Run 状态。
- **额外合成测试**：`A4-DISPATCH-01..05`：派发前 ENOSPC → Provider 0 调用；写盘成功但返回 EIO → 新 fence 实例重读为 unresolved，仍阻止 SDK；Host 返回后撤权/轮换 grant → 无旧授权写盘，新 grant 可继续；Host 返回错误 Run/Provider 异常 → 保留 unresolved、第二次不调用 Provider；已存意图篡改后重读拒绝。已修订原 `A3-SDK-04/05/12` 预期：不可信结果或预算 ENOSPC 不再被立即重试；`A3-SDK-01..16` 的常规有效路径继续保留。
- **失败恢复契约**：对真正无法断言 SDK 是否完成的 unresolved intent，本 A 适配器**没有**自动清账或代替 C2 完成恢复的途径。后续正式 Main/Provider recovery 必须用可验证的 SDK/Host 回执、当前 Case/Run/Owner、显式策略来决定 `reconcile` 或新 attempt，且只允许 C 提供业务重新执行/Run/ACK 权威。A 不做猜测性 replay。`closeExhausted()` 可在可信 24th turn 已经持久记账但技术终态写盘失败后补 terminal；不重新执行 SDK。
- **边界和验收**：该 fence 尚未在真实 Pi SDK 回调及 Electron/Main 中注入，本批仅合成 Main/SDK + file CAS 负例，不是 Gate E。主代码仍在 Dev-A #143，未改 C 独占 DTO/Main IPC/Preload/Case/Run/Decision/Batch/Outbox；A 新 SHA 必须跑同版 PR CI、D2、Baseline Gate O，Gate E/P 未做、Gate L 无授权。I #147 继续旧已绿 A SHA，不随新 A 分支 HEAD 浮动。

### A4-R04 补充：不同 SDK 派发间的回执冲突不可视作幂等重试
- 复核发现原 A3-R05 测试允许两次真正调用 `sdk.nextTurn` 返回**相同** SDK 回执 ID，并把后一次由 A3 budget 去重为原轮次。这仅适用于**同一派发重复回调**，不能作为两次物理 Provider 执行的计数逻辑，否则可能实际执行更多次、却不会达到 24 轮上限。
- 在 `V3ASDKDispatchFence.assertUniqueReceipt(run,dispatchId,receiptId)` 中先比较**所有已 settled 的其他 dispatchId**，同一回执见于不同派发直接抛 `REQUEST_ID_COLLISION`；SDK bridge 现在在调用 `recordCompletedTurn` 之前执行该校验，拒绝偷偷把新 SDK 调用扣到历史 receipt。`settle` 再校验一次，防止调用方跳过预算前校验。
- 更新 `A3-SDK-09`：第二次 Provider 派发返回同 receipt 必须拒绝，预算仍是 1、dispatch 停留 unresolved、第三次自动运行被拦截；新增 `A4-DISPATCH-06` 验证 Graph 同类问题。原 A3 budget 层同 receipt 幂等能力依然保留，它是**同一 Host SDK 回调写盘重试**的基础，不授权第二次物理执行。
- 该检验仍只有 Main 注入的 Host Receipt ID，无法替代真 SDK 的出厂原始回执/实际 Pi turn trace。最终 Main 绑定与 Provider Gate E 仍未完成；不能据此签署安全验收。

## A4-R05｜late-denied SDK 意图拒绝自动重派（本会话修复，Gate O 待精确验证）

**依据**：2026-10-19 Dev-A 新会话检查 #143 当前 A4-R04 真实源码，发现 `review-v3-sdk-dispatch-fence.ts::claim()` 只拒绝最后一条 `in-flight`，对 `late-denied` 无阻断；而 `V3ASDKTurnBridge.next()` 在 SDK promise 返回后遇到 `signal.aborted`、Owner grant 撤销/暂停/轮换时会调用 `lateDenied()`。因此，同一 Run/attempt/generation 在 SDK 已物理派发、旧结果被 Main 拒绝后，可能仅凭新 grant 或复用原授权再次调用 Provider，物理调用次数无法与持久 24-turn budget 对齐。这与「未知 Provider 结果不能自动重试」的 fail-closed 门禁相冲突。

**已提交变更（仅 Dev-A 自有文件）**：
- `ed097eddb52d4a4d295da7e875fb901b2f0ff219`：在 `V3ASDKDispatchFence.claim()` 拒绝 `late-denied`，返回 `RECOVERY_REQUIRED` + explicit recovery 提示；诊断方法 `unresolved()` 同时将 `in-flight` 与 `late-denied` 认定为需处理的技术派发。历史 `settled` 仍允许后续正常 SDK 轮次。
- `e2960d825ff2167f2837585c26c2e1be801e59d7`：修订 `A4-DISPATCH-02` 与 `A3-SDK-11`，不再以同一 Run 中「恢复授权后再次调用 Provider」为正例；扩充 `A3-SDK-14` 验证 AbortSignal 期间 SDK 返回后禁止下一次调用；新增 `A4-DISPATCH-07` 验证 `late-denied` 磁盘账本重新打开后依旧阻断重派。所有用例应同时断言 SDK 物理调用次数未增加、预算未误记。
- 这是对 A4-R04 「`lateDenied` 后新 grant 可重新派发」历史策略的**安全收紧**，不是修改 C0 或 C 的业务流程。旧描述保留用于变更追溯，以本节最新技术语义为准。没有实现自行清账、自动恢复或生成第二份业务 ReviewRun。
- 此处「显式恢复」尚**没有**可调用的自动 reconcile API；该错误意味着需等将来 C 业务策略、可信 Provider/SDK 回执及 A 技术恢复合同确定后，才能对遗留 attempt 作人工/可信恢复裁决。不得为了完成测试而删除历史意图文件。

**实时源头与 Gate**：提交后的待核验代码 SHA `e2960d825ff2167f2837585c26c2e1be801e59d7`（后续文档 commit 会产生新 HEAD，以实际 PR SHA 为最终准据）。此时源 SHA 的 PR CI `39261231218`、D2 `39261231367`、Baseline `39261231292` 均 **QUEUED**；自托管 Linux runner 未提供已执行测试证据。执行环境只具 GitHub 仓库读写，容器 DNS 无法 clone 仓库且无 Bun，**本会话没有声称跑过 Bun、typecheck、构建或实机**。Gate O=`BLOCKED_CI_UNASSIGNED/PENDING_EXACT_SHA_VERIFICATION`、E=`NOT_RUN`、L=`BLOCKED_NO_AUTH`、P=`NOT_RUN`。首个真实测试失败尚不可判定；不能用旧绿色 A SHA 替代。

### P2 可信 Pi SDK Host 接口的实际源码核验与接线门禁
- 现有技术入口 `apps/electron/src/main/lib/review/pi-review-agent-client.ts` 的 `createPiReviewModelClient()` 使用 `@earendil-works/pi-coding-agent`、`PiAgentQueryOptions`、`options.query()` 的 `AsyncIterable<SDKMessage>` 及 `abort(sessionId)`；`toolProfile:'review'`、`maxTurns:24` 是旧 Graph 语义请求参数，**不是**本 A3 `V3ASDKTurnBridge.nextTurn()` 的实际已登记 Main 端口。
- 现有 `apps/electron/src/main/lib/adapters/pi-agent-adapter.ts` 的 `buildPiRetrySettings(input.provider,{isReviewRequest:input.toolProfile==='review'})` 针对 review 关闭 native retry；`pi-harness-lifecycle.ts` 提供的是 `turn_running/model_call_completed/retry_started/...` 被动生命周期信号，**未提供稳定的 per-physical-dispatch SDK receiptId 和冻结 Run 身份**。不得将这一被动事件、随机生成 ID、assistant 消息、Renderer 值冒充可信 Provider 收据。
- 旧 `pi-review-agent-client.ts` 存在带图失败后文本降级的重试入口，且在部分工具完成/服务异常时返回 fallback JSON；在正式 V3 接线前必须证明这些 V2 行为不会越过 A4 的 `claim()` 派发意图、把第二次真实 SDK query 当成同一次 SDK turn 或错误的业务 Check ACK。
- `review-pi-run-bridge.ts` 和 `review-pi-admission.ts` 当前仍以原 V2 `preparePiReviewRunV2/finishPiReviewRunV2` 与 Agent service 来处理后台会话；它们并未自动实现新的 C2 `review-v3-execution/1` 正式 Run 消费端。**本轮没有越权修改这些 C-owned 业务路径。**
- A 下一批可独立推进：从 Main 的实际 Pi runtime 读取不可伪造的 dispatch/turn身份、分析 Provider Abort/timeout 后可信 outcome，编写 A-owned 映射与负例；真实 SDK 注册及 `pi-case-review-service.ts`、`review-ipc.ts`、共享 DTO、正式 ACK 接线须由 C 授权且在 I/C 同 SHA 联合验证。I1 继续锁定旧已绿 A `d8fd3e0...`，不可因 A 新提交自动换源。

**下一精确验收**：在 self-hosted runner 恢复后对最终 #143 HEAD 依次跑 typecheck、check:boundaries、Main/Preload/Renderer build、`bun test --isolate` 全量与 `review-v3-main-sdk-turn-bridge.test.ts` 专项；补齐动作前后 Owner epoch、abort/rotation/cold journal、实际 SDK 回执源和跨 PID 崩溃/满盘证据。若 CI 仍无 runner，保留 `CI_UNASSIGNED`，不将本批标记 PASS。

## A4-R06｜物理 SDK 派发身份与遗留账本保守恢复（已提交，精确 SHA Gate O 待验证）

2026-10-19 持续开发会话以 #143 上批工程 `563256eee69d2555898678cb04d9c5900df20ece` 为输入，读 #145 最新 C 决议和真实 SDK 路径，确认 **A 可修改独立桥接与执行 ledger，但不得实现 C2 正式 Run consumer / ACK、Main IPC、Preload、shared DTO**。#147 I1 继续使用已批准旧 A 锁源，不自动浮动到 R06。

### 工程变更

1. **SDK callback ↔ 已持久 dispatchId 强绑定**：
   - `review-v3-main-sdk-turn-bridge.ts` 的 `V3AMainSDKTurnPort.nextTurn({run,dispatchId,mode,signal})` 现必须接收由 `V3ASDKDispatchFence.claim()` 在 SDK side effect **前持久生成**的同一个 `dispatchId`。
   - SDK Host `completed-turn` 或 `interrupted` 的结构化结果 **必须 echo 同一 dispatchId**；跨 SDK 派发串回来的结果（即使 run 与 receiptId 看似有效）保持 `in-flight`、不扣 24-turn budget、不生成技术 proposal/terminal、不再次调用 Provider；必须显式恢复后才能继续。
   - 这只是 Main callback 的**身份配对约束**，不是信任 Pi 模型文本。只有实际由 Main 连接的 Pi SDK 物理 turn 来源、可核实的 receipt ID 才能提供该 Host port；任何把 Renderer、assistant UUID、`SDKMessage type=result/subtype=success`、`agent_end` 或随机 UUID 冒充原生 Provider turn receipt 的桥接均必须拒止。
   - 对应源码提交 `fad8af7b5c25ec28e4a1fa24eddd02363ba9b1f4`，测试提交 `705f6ebba9591e02f0236f297d8d1ca7481b3f25`。更新原 A3-SDK 合成 callback fixture，新增 `A4-R06-01`（外来 dispatch 的 completed-turn 拒止）、`A4-R06-02`（外来 dispatch 的 interrupted 不可伪造技术终态）。

2. **旧账本不可信历史封堵**：
   - `V3ASDKDispatchFence.decode()` 检测一个 `late-denied` 历史后竟仍有较新 `settled` / `in-flight` 记录时，直接 `RECOVERY_REQUIRED`，防止 R05 修复前重派遗留记录被当作当前安全 Run；不自动删除历史/升级真值（`29232aca8874580ada2f04326bcfb0750ca4146f` + `A4-R06-03`）。
   - 冷打开 SDK dispatch journal 时，对不同物理 `dispatchId` 的 `settled` 记录检查 `receiptId` 唯一性。修复旧版账本即便手工重放已结清记录仍有重复 receipt、进而偷漏 24-turn 数的风险。发现冲突拒绝整个 affected ledger，明确阻断，不重写或自动抵账（`3fcadeac061d4582edb72250f192b45ec5bfebfc` + `A4-R06-04`）。

### 真实 Pi SDK 调研事实（仍阻断真实适配）

- `pi-review-agent-client.ts` 使用 Pi `query(PiAgentQueryOptions)` 返回 `AsyncIterable<SDKMessage>`，其中 `SDKResultMessage` 的 `type:'result'`、`subtype:'success'` 是**整次查询结果**，不是独立物理 Provider turn receipt。assistant `uuid` 是消息身份，不是物理派发身份。
- `adapters/pi-agent-adapter.ts` 的 `onHarnessLifecycle` 为被动事件观察：`model_call_completed` / `retry_*` 等没有稳定 SDK request/turn receipt 或冻结 Run 绑定；`toolProfile:'review'` 已禁用原生 retry，但旧 `pi-review-agent-client.ts` 的带图失败→文本 fallback/requery、tool completed fallback 仍存在，需要确定实际物理调用次数。
- 因以上事实，本轮**没有**制造所谓“native SDK receipt provider”，也未调用真实 Provider。新 `dispatchId` 是 A 技术 ledger 的 Main 意图 ID，不能独立证明 SDK 确实只发起一次调用；正式端口注册与 receipt provenance 必须单独验收。本轮能力是 fail-closed **防跨派发串用**和历史恢复，不是声称 `Pi SDK integration DONE`。

### 新增与旧测试不变性

- `A4-R06-01..04` 是新增四个源级测试，均已提交但未验收。
- 保留之前 `A3-SDK-01..16`、`A4-DISPATCH-01..07`、9/9 Host Check、24-turn、暂停轮换、after-await revoke、真实 Linux 双 PID/SIGKILL 测试；新 `dispatchId` 要求同步调整 *合成* SDK port 以显式 echo Main 输入 ID。不篡改 C0/共享 DTO。
- 严禁将测试里自动 echo `dispatchId` 的**合成 fixture**描述为真实 SDK 本机回执，任何 Gate E 都必须走真实 Main→SDK→Provider 再核对发包/取消/中断/物理 receipt。

### 执行与质量门禁

- #143 最新 SHA 必须现场从 PR 重新读取；本轮代码不因旧 A 4023 pass、C 已绿 DTO 或 I1 的 17 个 synthetic 合同断言而自动签收。
- `Gate O=CI_QUEUED/NOT_ATTESTED`（GitHub self-hosted Linux/X64 jobs 无运行结论）；`E=NOT_RUN`，`L=BLOCKED_NO_AUTH`，`P=NOT_RUN`。目标是**最终 SHA** `bun install --frozen-lockfile`、`bun run typecheck`、boundaries、skin contract、三端 build、`bun test --isolate --timeout 30000` 全量和 A4 专项、D2/Baseline。离线单趟验收仍使用同目录 `A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md`，应同时覆盖 A4-R06 用例。
- 下一批集中任务为：① 在本机 SDK runtime 明确原生可验证的 turn/request/event ID 和唯一 Main callback，区分 query result 与物理 turn；② 把 A4 意图栅栏覆盖旧带图失败重试/多 turn 及 Provider/worker 取消，避免重复物理调用；③ 在经 C 授权的独立技术只读端口中联合 A/I 验证，不越权提交 C-owned Main 入口；④ C2 完成后仍需 C 独立核验 proposal/正式 durable ACK。

## A4-R07｜真实 Pi SDK 物理单次请求见证端口（源码已提交，尚未实机接线）

### 本批工程范围与安全裁决
- 继续遵循 #145 C 签署的 `CR-A-001 APPROVED_SLICED_SPEC/IMPLEMENTATION_PENDING`，本轮只修改/新增 A 自有 `review-v3-sdk-physical-turn-port.ts`、其测试及 `review-v3-main-sdk-turn-bridge.test.ts`，没有写 C 共享 DTO/Main IPC/Preload/Case/Run/Decision/Outbox、没有自行签发正式 ACK，也没有更新 I1 的已固定旧 A source SHA。
- 从真实 `pi-review-agent-client.ts`、`adapters/pi-agent-adapter.ts`、`pi-harness-lifecycle.ts` 与仓库锁定的 Pi SDK 0.86.1 补丁复查：当前已读可用事件里 `SDKMessage.result.success` 是一次 query 结果、`agent_end` 是 agent loop 生命周期、assistant UUID 是消息 ID，**均不提供可独立核实的 physical Provider requestId+receiptId**。因此不能把这些字段伪装为 Native SDK 回执。
- 新增 `V3APhysicalSDKTurnPort`（实现 A3 `V3AMainSDKTurnPort`），要求 Main 实际注入原生 **in-process Provider request** 生命周期 witness；保守接收恰好一次 `requestStarted(nativeRequestId)` 与匹配的 `requestFinished(nativeRequestId,nativeReceiptId,status)`。SDK Native receipt 必须非空、不得直接回显 Main dispatchId；无见证、重复/迟到、第二次 Provider 尝试（native retry/带图降级二次 query）、wrong requestId、缺少可信状态、异常、取消都拒绝。早期 Main `dispatchId` 已在 A4-R06 于 Provider 调用前持久化，新的 adapter 仅进一步验证 physical-request 回执，不凭空制造 receipt。
- `assertC0RunEvidenceIdentity(input.run)` 与 `mode` 白名单在 SDK side effect 前执行，拒绝非法 Run/模式。来源提交 `ba0fa298d40d8cfcfe2cc221190ac4d4fc1f8fcd` 与安全加强 `c94ee4347a90ca39ca7fe4bd31a1ebf2ec4fc9e9`。合成测试文件首次提交 `ee00c3789da1ffeac2aa373854a38c12e806afe6`，扩充提交 `bc3e73ef66eb43b28ab52cb9f46fa909172cc1e9`。
- 测试覆盖 `R07-01..11` 加 `R07-14`（单请求正确接收、模型查询结果无效、内部 retry、伪 receipt、错误 native ID、Provider throw、pre/post cancellation、verified interrupted、延迟回调、空 Main dispatch/伪造 Run/mode）；另外 `R07-12/13` 在原 `review-v3-main-sdk-turn-bridge.test.ts`（`36764075e0ce05ced185a90a56b26864a4b19524`）实际将新 A-only port 送入 Main SDK bridge + durable A4 dispatch fence + 24-turn technical budget；二次尝试时不得增加预算、不得生成 C Run/ACK。这些是**14 条已提交测试代码，0 条本轮真实执行结果**，不可报告 `14/14 PASS`。
- 目标机验收文档 `A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md` 已纳入新专项文件、真实 native callback 检查和 `NATIVE_PROVIDER_HOOK` 独立判定。CI GitHub self-hosted Linux/X64 仍可能缺 Runner；先现场核实最新 SHA workflow/jos 后明确状态。

### 实际尚未完成（不能略过）
1. Pi SDK/Provider 的真实 per-request 可验证 native hook 尚无证据已经存在/接线。**当前只有 A-owned 受控 adapter + 合成 Hook 测试，不是实际 SDK Host 注册**，无真实 Provider 请求、网络级发送次数/结束 receipt 或真实取消数据。标 `NATIVE_PROVIDER_HOOK=UNVERIFIED`、`Gate E=NOT_RUN`。
2. 该 adapter 只在 SDK 真正提供、且在物理发包前触发的 in-process `requestStarted`、发包后可信 `requestFinished` 的条件下约束第二次请求。如果 SDK 在开始后才发事件或漏报重试，检测并不能“阻止已发出的第二次物理调用”；这属于真实 API 验收阻断，不能由合成测试替代。
3. C2 Main `review-v3-execution/1` durable consumer/Host receipt registry、跨 PID worker、真实 Graph/Batch/Electron 与 SchoolPort 都未由 A 实现。只有 C 能批准正式业务接线/Run ACK；I 必须通过固定新 C 锚点联合 Gate O 才可集成新 A SHA。

**后续顺序**：固定 #143 精确 SHA → 跑本机集中 Gate O（包含 R07-01..14，保留首败）→ 调查真实 Pi native Provider hook（若不可获取 request/receipt，保持 BLOCKED，不从 `agent_end` 猜测）→ 在 A 自有独立 adapter 上加真实取消/retry 路径负例 → 需要 C-owned 入口时正式提交 CR → I/C 接线与 Gate E/P/L 独立验收。禁止为了赶进度降低质量或虚构已通过。

## A4-R08｜SDK Main 取消不阻塞 + 延迟 Provider 会话栅栏 + 真 SIGKILL 冷启动（Gate O 未验收）

**起点**：Dev-A PR #143 的 R07 固定源 SHA `f701f8d53e6cfda8623cbaf14c8e7c5cc34946c3`，基于 C0 `5682057c...`；本批仅 A-owned `review-v3-main-sdk-turn-bridge.ts`、`review-v3-main-sdk-turn-bridge.test.ts`、新增 `review-v3-sdk-dispatch-crashpid.test.ts` 和 A 自有工程/验收文档。没有接线 C2 Run consumer / shared DTO / Main IPC / Preload，也未新增第二份持久业务 ACK。

### 真实问题

之前 `V3ASDKTurnBridge.next()` 在记录 durable `dispatch.claim()` 后直接 `await sdk.nextTurn(...signal)`。如果 SDK/Provider 忽略取消并长期不返回，Main 的 `AbortSignal` 无法及时中止此 await；用户看到后台审核卡死，Main Owner 会话内同 SDK guard 一直占用。不能简单在收到取消时释放 guard，否则旧 SDK 实际仍运行，而后续一个桥接实例可能再次调用 Provider。

### 已提交修复

- `cf9f158ffaac5c703481273697f9847ffcf160df`：SDK 物理派发意图成功落盘**之后**，并发等待原 SDK promise 与 Main abort 通知。若取消在 SDK promise 未解决时获胜，立即以 `RECOVERY_REQUIRED` 交还上层，但**原 SDK work 仍保留进程内活动栅栏**；仅在原 promise 真正 fulfill/reject 后异步释放同一 session 的锁。晚到结果被故意丢弃，不触发 A3 turn budget、A2 proposal、`lateDenied` 或第二次 Provider 派发，原 `in-flight` 意图保持未决；晚到 SDK reject 被消费，避免 unhandled rejection。
- 如果先取得可信回执、再观察到 Main cancel，则继续使用 R05 `lateDenied` 路径，仍明确禁止自动重派。原已完成且可信的 SDK turn 不影响继续 24 turn 的正常流程。
- `9813c4b503b9fd884238525437823b821d584e01`：新增合成 `A4-R08-01`（真正挂住的 Promise + prompt abort + 跨桥同 Owner 的锁保持 + late resolve 不记账）和 `A4-R08-02`（迟到 Provider 异常消化 + 不重派），调整此前 `A3-SDK-14`、`A4-DISPATCH-07` 的预期：abort 比 SDK 完成先到应保留 **`in-flight`** 而非 `late-denied`，二者均需显式恢复。SDK 真正结束后锁才释放，而 durable unresolved 不会随之消失。
- `e873542a655fb21ff57b03c7f3da481bbe23afc8`：新增真实 Linux OS PID `review-v3-sdk-dispatch-crashpid.test.ts`，child 在持久 dispatch intent 已写完、模拟 SDK nextTurn 已调用之后 `SIGKILL`；cold process 再打开 Owner/dispatch/budget ledger，验证 Owner 旧授权隔离、意图 `unresolved=true`、0 完成轮次与 0 proposal。**真实 PID/文件系统，模拟 Provider**。

### 反例、局限与下一节点

- Main SDK AbortSignal 的抢先返回不是对远端 Provider 已被取消的证明。SDK 实际仍运行时**不得**复用进程内会话锁；如果进程被杀且 Provider 工作仍在远端，不得根据 restart 自动重发同一 attempt。真实 Provider Cancel API / 请求级回执与 worker 心跳需另测。
- 若 SDK promise 永远不解决，锁会一直保持到进程退出或显式的可信运维恢复；这是一种故意 fail-closed 的可用性牺牲，不应该写成“已自动恢复”。C 唯一业务所有者负责新 attempt/用户可见状态裁决，A 无权清账。
- 跨 PID 的真 Provider singleton 仍未证实。本批 PID 只证明 durable Owner + dispatch cold recovery 行为，不代表真实 Electron SDK/Provider Gate E；`@earendil-works/pi-coding-agent@0.86.1` 的 per-physical-request native Hook 仍 `UNVERIFIED`，真实 API/Provider 线路尚未接入。
- R08 源码/测试已提交，**当前 Gate O 仍需对最终 HEAD 同一 SHA 真正安装/Bun/typecheck/build/专项和全量日志**。CI Runner 排队不等于通过。集中验证文档 `A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md` 已追加 R08 + PID。Gate E/L/P 按独立证据判定，不由 A 直接签发。

## A4-R09｜跨 Run/跨 Owner 的同案未决 SDK 隔离与全账本 Native Receipt 去重（源码已提交，未验收）

**开始输入**：Dev-A #143 R08 工程 SHA `dc59bf1fa41263308729ab6e6dedc90cba11edf3`。本轮仅更改 A-owned `review-v3-sdk-dispatch-fence.ts`、A 主技术测试 `review-v3-main-sdk-turn-bridge.test.ts`、真实 PID 合成 SDK 测试 `review-v3-sdk-dispatch-crashpid.test.ts` 及 A-owned 进度/验收文档。无 C 独占路径，#147 I1 老 A 锁源未更新。

### 触发问题及修复

- 原 R08 SDK dispatch journal 按 `[runId,attemptId,ownerGeneration]` 独立 key；某次 Provider callback 无法核实、原 Run 留下 `in-flight`，Main 另起一个同 Case 新 Run + 新 Owner session 时，`claim` 只看当前 Run 的链，因此可能再次执行 Provider、形成远端未知工作重叠。**主安全修复 `94ed6f92f3c8481762d48613a6f7c98616a8e3e7`**：记录每笔新派发的 `caseId` 和 `sessionId`，claim 时在 Owner grant 文件锁下扫描全部未决 dispatch chain：同 Case 或同 Owner session，禁止派发；正常别的 Case 可继续。**老 v1 hash-sealed journal 无两项 scope 字段是历史事实**，不能反向发明来源；一旦这样的旧 record 仍未决，所有新 Run 暂时隔离为 `RECOVERY_REQUIRED`。若只有 caseId 或只有 sessionId，视作污染账本而拒止。没有自动清账，也没有把技术栅栏升级为 C 正式 Run writer。
- 原 `assertUniqueReceipt()`/冷 decode 只校验同一个 Run 的 settled receipt 去重，不同 Run/attempt/Case 借用同一个 SDK receipt 可能被计为不同 Provider turn。**修复 `164c92fef653227574fd7a2859ed42e563616fb5`**：在线所有 Run 链检查 `receiptId` 全局唯一；历史 hash sealed decode 也扫描全账本拒绝跨 Run 冲突。即使新 Run 的物理 Provider 派发真实进行，错用之前的完成 receipt 不会扣 24-turn budget，保留 unresolved 需明确恢复。SDK receipt 仍需未来真正的 native physical-request hook 证实来源，不能从 agent_end/assistant uuid 派生。

### 测试与验收边界

- **已提交但尚未运行**合成 A-only 新用例 `A4-R09-01..07`（主测试文件），含新 Run/新 session 同案拒止、不同案允许、cold reopen、旧无 scope fail-closed、半损坏 attribution 拒止、跨 Run 重复收据在线拒止及历史账本冷拒止。测试提交 `4c46f7b932c26f77309d2b26029182f489fd266d`、`ccaaddbd1106fe945a8c4950d9ba395f55febbcc`、`20f9ef1ed9bb120d2db8c37a9b4cf9e03a11dc12`。
- **Linux PID 原测试增强**：在 `review-v3-sdk-dispatch-crashpid.test.ts` 已有实际 child PID/SIGKILL + 重开文件的用例中，另检查 parent Main 新 grant/new Run 同 Case 不能 claim SDK；提交 `d8a1a8d22f9fcbc19fc1036afd78067cc3e8bbad`。这只算一条真实 PID 测试里的新负例，不是已运行额外独立测试；Provider 本身仍是 synthetic。
- 离线验收文档 `A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md` 已增 R09 安全断言，并修正 R08 取消竞态的 in-flight/late-denied 状态描述。
- **依赖与终局**：A 生产源码成熟度可标 `A1/A2_IMPLEMENTED_SOURCE, A3/A4_IMPLEMENTED_A_ONLY_SEAM`，不能写 `A1–A4_PRODUCTION_COMPLETE`。O Gate 需要 R09 最终精确 SHA 的 Bun/typecheck/full CI，真实 E 需要 native Pi per-physical Provider hook、取消及 worker、Electron Main；C 需要正式 durable Run ACK、I 需要新冻结锚点；L/P 独立关闭。详见新增 `DEV-A-CURRENT-PROGRESS-AND-GATES.md` 的完整成熟度矩阵。

## A4-R10｜Pi SDK 0.86.1 真正 HTTP Provider 请求入口的限定观测

**固定输入**：R09 Draft PR #143 @ `3bcd229c0d9fa5485206dc5e82d05f9ea80f9c5a`。已独立核对根及 Electron 依赖均是 `@earendil-works/pi-* 0.86.1` 和两个已有 Bun patch；其真实上游 `v0.86.1` tag = `13cbf77df2396303013a41646bcfa77b4271ae56`，确认 `AgentSession.agent.streamFunction` 可写、`sdk.ts` 与 `agent-loop.ts` 使用该函数发起真正的模型请求，并确认 OpenAI-compatible Provider `fetch`、外层 `retryProviderRequest`、`onResponse` 边界。上述为**源码事实**；不等于实际 Provider 访问或 npm dist 二进制已验证。

**真实新增 A 自有工程**：
- `apps/electron/src/main/lib/review/review-v3-pi-http-provider-engine.ts`，把新建、一次性的受信 Pi `AgentSession` 的 `agent.streamFunction` 接口包装成 `V3ANativeSingleRequestEngine`。明确只支持 `openai-completions`/`openai-responses` 的 HTTPS/SSE，必须 `maxRetries:0`、1 次 Pi streamFn、1 次 Main 监控的 HTTP fetch、来自 Provider HTTPS response 的 `x-request-id`、1 个成功 SDK `turn_end`，禁止非白名单协议、旧 session 复用、SDK 自有 fetch wrapper、跨主机、自动 redirect、Main AbortSignal 后认可 completion。任意不满足均 fail-closed，保留原 A4 durable intent；SDK session 的原 streamFn 与订阅在结束后恢复/释放，不修改 Pi 模块全局实现。
- 主要生产提交 `d47d33c677faafe60faaa5d7624d7b4647524a0f`、`0bbbe623bb35e6cd434fc45bdd945e4382e8c726`、`c626776546aeb352fd02b00e752d1506b6d2e856`、`23b14c65f4daa13f1f6dfd70573bed6376046650`、`2c30cf3dc6803eda4fb10a7203aef968dc5825c8`，后续状态均按最终 PR HEAD 判定。
- 新 `review-v3-pi-http-provider-engine.test.ts` 中内存 Provider HTTP 负例/正例 + 对真实安装 `pi-agent-core` 的 `Agent.streamFunction` 属性探针，以及 `review-v3-main-sdk-turn-bridge.test.ts` 中 `A4-R10-16` 从 SDK 流到 A4 durable intent / A3 24-turn 的联合源码测试（`711c87f1cc22e45a777d853560c39400465a9116`、`426e5e3fee370698e814f448109a0c8c99ca743f`、`e6182bb959e1138c32113c86a745c2adb54c76e2` 等测试提交）。**不是**运行通过的用例，也不是真实提供方流数据。
- 固定第三方源码证据、完整连接路径、限制、C/I 逐 hunk 授权申请在新增文档 `A4-R10-PI-0861-TRANSPORT-EVIDENCE-AND-INTEGRATION-CR.md`；更新集中 Gate O runbook `A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md` 与阶段矩阵 `DEV-A-CURRENT-PROGRESS-AND-GATES.md`。

**必须守住的区别**：
1. `x-request-id` 为可绑定一次 HTTPS provider response 的**传输身份**，不是所有提供商、所有 Pi 模型/Provider 的原生可信回执，不是密码学完结 ACK；必须与 SDK `turn_end` / transport 单请求条件配对并实机核验真实 HTTP fetch/代理日志。没有这个 header 的提供商继续 blocked，不得用随机 ID 补。
2. `pi-agent-adapter.ts` 现有约 2704 行流函数覆盖还负责内容净化、代理，`pi-review-agent-client.ts` 的图片降级、old review tool fallback 仍需保留 V2 行为；R10 **没有**擅自修改这些 C/共享正式产线。Main 注册/专用 factory 需要 Dev-C 的明确租约；I 继续从批准的旧 A SHA 入场。
3. Dev-C 现 C2-R00 `v3TechnicalExecution` 是技术候选账而**非**正式 `ReadReceipt/Check/ReviewRun` ACK；A 的 R10 output 只能先写 A3/A4 技术账。Gate O 必须用 R10 最新单 SHA 真实 CI/Bun 验收；Gate E、L、P 仍未证实。**本会话使用 GitHub 仓库 API 写入，无法 clone 安装/执行 Bun/真 Provider**。

**下一批 A4-R11**：优先集中 Gate O first-failure 修复，以及目标机 Pi 0.86.1 patched dist 真 SDK stream + 真 HTTPS/SSE/Proxy 状态核验；适配为真实 Main 受信 factory 只有在 C 评审 `CR-A-PI-HTTP-WITNESS-R01` 明确 hunk 后才能开始。继续堆没有实际回执的通用 wrapper 不计里程碑。
