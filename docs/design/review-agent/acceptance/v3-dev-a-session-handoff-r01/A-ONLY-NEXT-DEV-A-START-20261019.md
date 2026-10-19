# CDUT Studio Review V3｜下一 Dev-A 会话接手与真实工程推进（A_ONLY）

**任务身份**：`V3-DEV-A-CONTINUATION-R01`。
**任务性质**：在已有生产研发上持续改进 A1–A4 的 Pi Owner、Host 技术事件、SDK 派发和可靠性；必须动手核验、修代码、提交测试和检查点，不是重新架构考古或只写方案。

**仓库**：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

**Dev-A 工程 Draft**：[#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)，分支 `feat/v3-dev-a-pi-execution-r01`。
**四线共同协调 Draft**：[#145](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145)，分支 `docs/v3-integrator-i-r01-taskbook`。
**共同固定 C0 基准**：`5682057c7232c914e72fdae525ce95fd33f32b53`／`review-c0/1`。

## 第一件事：恢复上下文，确认最新事实

1. **先完整阅读唯一四线协议**：
   `docs/design/review-agent/acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md`，在 #145 docs 分支中取得最新 HEAD、文件 blob SHA、协议版本，完整看 `DECISIONS:C`、`STATUS:A/B/C/I`。这是正式业务边界、来源锁和 Gate 状态的权威；A 只能更新标记 `BEGIN:STATUS:A / END:STATUS:A` 之间的自身摘要。
2. **完整阅读旧 A 会话专属交接**：
   `docs/design/review-agent/acceptance/v3-dev-a-session-handoff-r01/A-ONLY-SESSION-HANDOFF-20261019.md`（同 #145 docs 分支）。它是 `A_ONLY_SESSION_MEMORY`，**B/C/I 没必要阅读、ACK，也不提供 C 批准或 I 导入权限**。此提示词也属于 A-only。
3. **再完整阅读 A 工程本身**：#143 最新源码、变动与测试；`docs/design/review-agent/acceptance/v3-dev-a-r01/DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md` 和 `CR-A-001-C0-EVENT-EXTENSION.md`，特别关注 A3-R04/R05、A4-R02/R03/R04。不要把当前文档分支的 SHA 当成工程 SHA。
4. 只读核对 Dev-C #144（共享 `review-v3-execution/1` 合同/Run 消费端）、Dev-B #142（B2 物理 SourceIdentity）、I #147（跨线集成与固定来源）。如无直接依赖，不要花费大量时间重新翻 #133–#140 历史研究。
5. 重新核查本会话中的快照 SHA 是否仍是 HEAD：A `0192725d1578662db33ff86e9106d6edabff420b`；B `6549f6c27ff4145306ad0a1f38499a873ed2ec65`；C `917505f5d2d05b2f5930205b2c5464140281f6b1`；I `b4e06e767752865835e146c956412c098e98b1d4`。**这些只是交接瞬间快照，不可不查就当最新**。

## Dev-A 职责/绝对边界

- A1：可信 Main 注入的 Owner/Grant/session/Run+Plan/source frozen 快照、跨 PID CAS/lock、pause/rotate/revoke/delete/terminal/cold-start quarantine。
- A2：真实 Host 源读取范围、SourceIdentity、ReadReceipt 提案、Check×target×object×subject/status、`review-c0/1` 旧提案与 `review-v3-execution/1` 本地结构 proposal、事件 SHA/顺序、技术终态/待 C 消费 ACK。
- A3：exact 9/9 Check coverage、8/9 与 unknown/rejected/missing fail closed、24 turn 预算、Main SDK Host 回调、direct/hidden/graph/batch 技术 seam。
- A4：两 PID/崩溃/late Host/授权撤销、ENOSPC/postcommit EIO、技术 SDK 派发意图 `in-flight/settled/late-denied`，未知 Provider 结果不能自动再次派发，重复回执跨不同 dispatchId 必须碰撞。
- C 唯一拥有 Main 正式 IPC/Preload/shared DTO/Principal、Case/Plan/Source-current-validity、`ReviewRun/ReadReceipt/Check` 正式写入及 durable ACK、Batch/Decision/Outbox。A **不能**修改 C 独占生产文件、建第二套权威 Run，技术 `completed-technical` 或 `needs-resume` 不等于业务通过。
- B 拥有模板候选/原件 bytes staging 和 parser；I 自有技术 glue/跨线回归，不是 C 或 A 的替身。`CR-A-001=APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`；唯一有法律效力的跨线裁决取 #145 当前 `DECISIONS:C`。

## 当前证据及下一步顺序

交接时新 A #143 `0192725...` 的 PR CI [#39254709736](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39254709736)、D2 #39254709758、Baseline #39254709719 均为 **QUEUED、非 PASS/FAIL**；PR CI self-hosted Linux/X64 job `118066963319` 最后查看尚无 runner_name。只有旧 A `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7` 曾有独立绿 CI `4023 pass / 5 skip`，I1 首批仍锁该旧 SHA；**新 A HEAD 不得因“源码存在”就浮动导入 I**。Gate O=PENDING_EXACT_SHA_CI、E=NOT_RUN、L=BLOCKED_NO_AUTH、P=NOT_RUN。

**第一批务必实际做的工程**：

1. 冻结最新 #143 SHA、检查 CI run/jobs/runner/first failure 和 #145 变化；如 CI 已跑，核验 typecheck、boundaries、Main/Preload/Renderer build、Bun 全量和 A4 多 PID。若 runner 仍无人接任务，明确 `CI_UNASSIGNED / NOT_RUN`，给出可在真实机器集中执行的精确命令及证据要求；不要连续空提交重置队列，更不要写 PASS。
2. 逐项核验新 `review-v3-sdk-dispatch-fence.ts`、`review-v3-main-sdk-turn-bridge.ts`、`review-v3-execution-turn-budget.ts`、`review-v3-execution-proposal-producer.ts`，以及各自测试。重点：SDK **派发前持久 intent**；真实回执后**预算/技术提案先 durable、后 settle**；不可信 Host Run/异常/ENOSPC/EIO/崩溃后不自动重跑；旧 grant 的晚到结果不入账；24/24 不能重复调用 Provider；同一回执不能跨两次 SDK dispatch 被当成幂等重试。
3. 如果检查发现确切 A-owned bug，**修真实生产代码、增加有判别力的正反例、提交 #143**，保留首败与修复 SHA。不要为了让 CI 变绿弱化断言、删掉业务能力或把 mock 当真实 Host。
4. 技术实现稳定后，继续研究真实 Main Pi SDK 回调来源与 turn receipt attestation、跨进程 SDK worker/Provider recovery；涉及 `pi-case-review-service.ts`、`review-ipc.ts` 或新的 C 共享合同，向 C 正式申请，**不得自行越权修改**。集中做 Electron/Provider Gate E，而非每一小步拉用户去虚拟屏。
5. 只有某批最新 A SHA Gate O 真 PASS 且 C/I 明示来源许可后，才准备 I 所需的 source→blob→test→new integration SHA 交接。I1 现在仍用 C `31aa352c45a33d6832612884b0fea38e39b5cf8d` + A `d8fd3e0...` + B `f7a7cf2...` 的旧固定来源；不自动升级。
6. 更新 A 工程 #143 源码/测试/原 handoff/PR 描述。真正跨线摘要变更只在 #145 的 `STATUS:A` 采用最新 blob SHA 乐观锁更新，不触碰 C 决议或 B/C/I 状态；A-only 文档无需同步给其他会话。保持 Draft、不合 main。

**首轮输出需给出**：A 当前 HEAD、#145 当前 HEAD/blob、现行 C 对 A 的裁决、精确 O/E/L/P、CI 是 PASS/FAIL/QUEUED 及 job/run IDs、这一轮实际改动源码和用例、技术/真实 Provider 分界、下一集中开发/验收节点。

**马上开始实际读取和开发，不要仅复述这份任务或向用户再询问已确定的职责、仓库、分支。**
