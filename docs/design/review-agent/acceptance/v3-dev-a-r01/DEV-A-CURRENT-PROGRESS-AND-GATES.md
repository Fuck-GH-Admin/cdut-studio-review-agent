# CDUT Studio Review V3｜Dev-A 当前进度、风险、验收与开发顺序

> **身份**：V3-DEV-A-CONTINUATION-R01；A 专属工程进度总览，随 #143 开发增量更新。**此文档是工程详细账本，不构成第二份四线统一协议**。跨线约束与裁决始终以 #145 的 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` 和 C 最新签署为准。
>
> **本轮读取日**：2026-10-19；仓库 `Fuck-GH-Admin/cdut-studio-review-agent`；源工程 Draft PR [#143](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/143)；分支 `feat/v3-dev-a-pi-execution-r01`，基于 C0 `5682057c7232c914e72fdae525ce95fd33f32b53`。更新时须以 PR 实际 `head_sha` 为唯一源头，不得从历史快照推定当前验证状态。

## 1. 如何阅读进度：必须拆开四种状态

- **SOURCE_COMMITTED**：功能与对应测试文件真实在 #143；不代表运行成功。
- **GATE_O_PASS_EXACT_SHA**：只认可同一个精确 SHA 的 install/typecheck/boundary/skin/main-preload-renderer build/Bun 全量及相关专项真实 exit=0、PASS/FAIL/SKIP/CI。
- **GATE_E_PASS**：真实 Electron/Main/Preload/Renderer、真 Pi SDK/Provider 与后台会话、跨进程/磁盘故障等按要求完成；合成 Main SDK Host 负例无法替代。
- **C_ACCEPTED_FOR_ENGINEERING / RELEASE_GO**：只有 C 对实际集成 SHA 的工程签收和独立产品发布门禁才有权标记；A 单线通过不自动晋升。
- **Gate L** 无校方/Provider 有效授权则 `BLOCKED_NO_AUTH`，禁止以 mock Gold、SchoolPort ACK 等模拟事实抵账；**Gate P** 需要原 71 项产品义务、50 模板、100 案/500 文件、7 条旅程等独立证据，不以接口存在判完成。

## 2. Dev-A 长期责任与当前切片

| 片段 | 自有核心文件 | 已真实提交的能力 | 未能声称完成的部分 |
|---|---|---|---|
| **A1 Owner** | `review-pi-owner-adapter.ts` | Main 注入 Principal/Owner、grant/revoke/pause/resume、进程 epoch、冻结 Run/Plan/Source、跨 PID 文件锁/CAS、cold restart quarantine、用户普通会话隔离 | 未完成真实 Electron/Pi 后台全链 Gate E；C 仍拥有正式 Principal/Run |
| **A2 Proposal** | `review-execution-event-adapter.ts`、`review-v3-execution-proposal-producer.ts` | 分开的 C0 与 `review-v3-execution/1` 技术候选、Host 来源/块读取、精确 Check 状态、顺序/哈希、回放、技术终态 | C2 durable ReviewRun/ReadReceipt/Check ACK **未交付**；A 无权替代 |
| **A3 SDK/coverage** | `review-execution-event-adapter-completeness.ts`、`review-v3-execution-turn-budget.ts`、`review-v3-main-sdk-turn-bridge.ts` | 9/9/unknown fail closed，24 turn 持久预算，Main 注入 SDK Host 单轮接口，direct/hidden/graph/batch 技术 mode，异常/needs-resume | 真 Pi SDK native per-call receipt/Provider token 来源、真实多 turn/Graph/Batch 接线未验证 |
| **A4 reliability** | `review-v3-sdk-dispatch-fence.ts`、Owner/PID/crash tests | 派发前持久 intent；EIO/ENOSPC/SIGKILL、post-await revoke、不可重试未知 Provider 状态、`late-denied` 拒重派、派发 ID 与回执强绑定、旧污染账本冷拒止 | 实际 Provider 中断/网络超时/图片失败重试和多 PID Main SDK worker 全流程未验证；无自动恢复结清权 |

**历史能力保全**：本批不删除 V2 行为及原测试；若发现老 V2 Pi 回退/工具返回成功与 V3 语义冲突，需在 A 独占的新技术端口 fail closed，改变 C-owned 原入口前先递 C CR。A 的技术 `completed-technical` 不是正式 PASS 或 SchoolPort 受理。

## 3. 工程来源和集成冻结

- C0 `review-c0/1` SHA：`5682057c7232c914e72fdae525ce95fd33f32b53`。
- **I1 当前准许导入的旧 A 固定源码**：`d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`，历史记录约 4023 PASS / 5 SKIP；**不适用于 A4-R05/R06/R07 新 HEAD**。
- C #144 的 `review-v3-execution/1` 共享 DTO/validator，由 C 独占；A 的本地结构性 producer **不是**第二个共享类型源。I1 #147 使用旧锚点的 A/B/C 技术集成，未证明新 A 任何 R04+ 源码同 SHA。
- CR-A-001 = `APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`；不得修改 `packages/shared/**`、`review-ipc.ts`、Preload、`pi-case-review-service.ts`、Case/Run/Batch/Decision/Outbox 正式持久化。正式 Source/Plan/Run 当前有效性由 C 二次验证。

## 4. 最新检查点与 GitHub CI 证据（历史快照，先重新检查）

- 前一稳定开发输入 SHA：`74051b154bb35560580153eebe5d539b00c58fb3`，A4-R06 技术候选均 **SOURCE_COMMITTED_NOT_VERIFIED**。
- 对该 SHA 的 PR CI `39263999690`、D2 `39264000377`、Baseline `39263999830` 在 2026-10-19 仍未分配并完成 self-hosted Linux/X64 job，**无通过或首个失败日志**。不可记 PASS/FAIL；不得靠持续新 commit 替代对同 SHA 的验收。后续新 HEAD 须附自己的 workflow ID 与最终结果。
- 当前四门禁：**O=`CI_UNASSIGNED/NOT_ATTESTED`，E=`NOT_RUN`，L=`BLOCKED_NO_AUTH`，P=`NOT_RUN`**。CI 暂未运行不等于代码无错。
- 目标机集中验收文档：`A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md`，包括冻结 SHA、Bun 1.4.0/Node 22、全部必要命令、专项故障负例、证据留存。通过本机 Gate O 也需独立标 `LOCAL_GATE_O_PASS`，不假称 GitHub CI。
- 真实代码详细编年史：`DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md`，CR 合同：`CR-A-001-C0-EVENT-EXTENSION.md`。本表是**当前事实摘要**，不复制全历史。

## 5. R07 起下一阶段顺序及阻断

1. **A4-R07（已有代码，真实 SDK Hook 尚未接线）**：在 A 自有代码建立 Pi native Host 执行 port 的可校验 provenance、单物理派发约束、明确拒绝 assistant/result/harness 被动事件伪造 turn receipt，并覆盖 Provider 内部多调用、原生 retry、图片降级 requery、取消后迟到完成的安全负例。**若真实 Pi SDK API 未暴露物理 receipt，必须以 `PROVENANCE_UNAVAILABLE` 拒止，不得随机生成假的稳定收据。**
2. **A4-R08**：复核 SDK Host worker 跨 PID owner/singleton、SIGKILL 后 unresolved intent、Provider timeout/AbortSignal、技术回执跨运行冲突；Gate O 可用合成端口与 OS process，真实 Electron 链合并在集中 Gate E。
3. **A/I 技术检查点**：精确新 A SHA 同版 Gate O 达标，向 I 报源 SHA、路径、技术依赖和 CR；I 对固定 C 锚点的实际 DTO/validator 与 A 回执按同 SHA 对照，不自动换旧 A 来源。
4. **C2 正式消费和后续**：只在 C 明确实现并签名的正式 Run writer/ACK 端口完成后由 I 做技术接线；不让 A 自己实现第二份业务权威。
5. **集中 Gate E/L/P**：真正 Electron 用户链路、Provider、Owner 窗口关闭、Graph/Batch、9/9、24 turn、双 PID、故障盘和产品回归单独验收。无有效校方授权时 L 继续阻断。

## 6. 最新 A4-R07 技术检查点（2026-10-19，SOURCE_COMMITTED_NOT_VERIFIED）

**新增真实源文件**：`apps/electron/src/main/lib/review/review-v3-sdk-physical-turn-port.ts`（首次提交 `ba0fa298d40d8cfcfe2cc221190ac4d4fc1f8fcd`）。只接受由 Main 实际注入 SDK native in-process Provider request 生命周期的 `requestStarted(nativeRequestId)` + `requestFinished(nativeRequestId,nativeReceiptId,status)`。全程只允许一次请求；缺 native request/receipt、重复/迟到或身份错配、native retry/带图失败二次 query、取消、SDK throw 都 fail closed。没有回执就不给 A3 `recordCompletedTurn()` 技术计数，不给 A2 正式候选终态，更无 C durable ACK。

**测试源码**：`review-v3-sdk-physical-turn-port.test.ts` R07-01..11、R07-14（首次提交 `ee00c3789da1ffeac2aa373854a38c12e806afe6`），以及 `review-v3-main-sdk-turn-bridge.test.ts` R07-12/13（提交 `36764075e0ce05ced185a90a56b26864a4b19524`）联合持久 dispatch fence + 24-turn budget，明确测试二次 Provider 调用被见证钩子拒止时，持久 intent 继续 `unresolved` 而非当成 SDK 完成。全部为**合成 native hook 测试文件已提交，并非已运行/通过**。

**真实 SDK 接线阻断**：已经查阅 `pi-review-agent-client.ts`、`pi-agent-adapter.ts`、`pi-harness-lifecycle.ts`、Pi SDK 0.86.1 patch 的现有事件：`SDKMessage.result.success` 是整次 query 终态；`agent_end` 是 agent loop 终态；`assistant.uuid` 是消息身份。**这些均不足以独立证明某一次物理 Provider 请求及其稳定 receiptId。** 目前未从已读源码中找到可对接 `V3ANativeProviderWitness` 的、具有稳定 native request+receipt 的精确回调；实际 API 是否存在需在安装环境的 SDK/Provider 层进一步核查。在此之前 `NATIVE_PROVIDER_HOOK=UNVERIFIED / REAL_PROVIDER_WIRING=BLOCKED`，不得拿 adapter/假回执宣称 R07 实机 DONE。

**下一个执行节点**：A 可只读追查/独立开发 native SDK 网络 request 观测、真实取消与重试探针；若需要更改共用 `adapters/pi-agent-adapter.ts`、正式 C `pi-case-review-service.ts`、`review-ipc.ts` 或 Main 注册边界，先向 C 提交精确 CR，明确允许路径/函数/源码 SHA，再让 I 在新锚点同 SHA 做联合复验。旧 V2 回退需保留功能，但 V3 不能从 fallback 虚构一个可信单轮回执。

**门禁**：Gate O=`COMMITTED_NOT_ATTESTED`（#143 最新 HEAD 的真实 CI/job 结果单独记录；目标机集中 Gate O 已更新，包含 R07-01..13），Gate E=`NOT_RUN`，L=`BLOCKED_NO_AUTH`，P=`NOT_RUN`，C 工程集成签收尚未发生。详细编年史仍保存原 `DEV-A-R01-IMPLEMENTATION-AND-HANDOFF.md`。

## 7. 最新 A4-R08 技术检查点（2026-10-19，SOURCE_COMMITTED_NOT_VERIFIED）

| 条目 | 精确状态 |
|---|---|
| 前置工程锁 | R07 工程 SHA `f701f8d53e6cfda8623cbaf14c8e7c5cc34946c3` |
| Dev-A A-owned 生产修复 | `review-v3-main-sdk-turn-bridge.ts` `cf9f158ffaac5c703481273697f9847ffcf160df` |
| 合成可靠性测试 | `review-v3-main-sdk-turn-bridge.test.ts` `9813c4b503b9fd884238525437823b821d584e01`，R08-01/02 |
| Linux 真 SIGKILL 测试 | `review-v3-sdk-dispatch-crashpid.test.ts` `e873542a655fb21ff57b03c7f3da481bbe23afc8`，R08-PID-01 |
| 合同 | Main abort 先于 SDK Promise settle → `RECOVERY_REQUIRED` **快速返回**，但直至 Provider promise 真正结束不得释放 SDK session guard；原 `in-flight` durable intent 不因晚到成功/异常结清。 |
| 未解决 | 真 Pi SDK native receipt Hook、SDK worker 跨 PID singleton、真实 Provider remote cancellation/网络断开事件；C2 Main Run ACK，I 新锚点技术接线。 |
| 证据等级 | 源码与测试已提交，未在此会话运行 Bun。真实 OS process 的测试代码 **不等于**测试已执行。 |
| Gate | O = `COMMITTED_NOT_ATTESTED`，E = `NOT_RUN`，L = `BLOCKED_NO_AUTH`，P = `NOT_RUN`；CI 对本轮最终 SHA 单独记录，不继承 R07。 |

**质量关键点**：在真正取消发生时，不准通过简单 `finally` 立刻释放 SDK 会话锁。由于无法保证 Provider 已物理停止，任意新 attempt/不同 Run 也不得与旧未决 SDK 在同一 Owner session 并行。只有可信 SDK settle 或正式的跨进程隔离/恢复合同可以释放活跃调用；冷启动旧 grant 仍 quarantine。

**集中验收**：`A4-R05-EXACT-SHA-OFFLINE-GATE-O-20261019.md` 已包含本批 2 条合成取消反例和 1 条真实 OS SIGKILL 测试。提交者必须记录最终 PR HEAD、真实 Linux runner ID、首个失败、exit code、测试 PASS/FAIL/SKIP、源码来源 SHA。新 Owner 仍 Dev-A；需要改正式 Main 注册/共享 adapter/Case/Run 时需 C 明示 CR lease，I 不得自动替换旧 A 锁源。

## 8. A4-R09 工程里程碑与 A1–A4 总体阶段裁决（2026-10-19）

**本阶段的总体裁决：`A_SOURCE_STACK_BUILT / A_CI_NOT_ATTESTED / A_REAL_SDK_NOT_WIRED / A_C2_NOT_ACCEPTED`。** Dev-A 核心不是再讨论架构；A1 Owner、A2 Host Proposal、A3 技术 SDK 执行/预算、A4 持久派发与可靠性均已有真实源码与对应测试。**但不能由四个源码模块的完成推导出端到端产品已完成；不存在可以诚实写下的“总体 90%”一类百分比。** 当前正式系统仍缺 C2 业务 Run/ACK、Pi 原生回执、同 SHA 工程验证、真实 Electron/Provider/E2E 及权限/发布门禁。

### 一、完整度分层（必须避免单一百分比）

| 轨道 | Dev-A 自有代码交付状态 | 主要缺口 | 可被谁签收 |
|---|---|---|---|
| A1 — Owner/CAS/授权 | `IMPLEMENTED_SOURCE`：Main Owner 生命周期、文件 CAS/lease、暂停恢复、冷 epoch quarantine、拒旧 grant；已有独立测试文件 | 真实 Electron Caller/Owner/SDK 生命周期、跨进程正式 C 案卷、同 SHA Gate O | A 单线 O；C/I 工程集成 + E |
| A2 — SDK 工具事件、Source/Check Proposal | `IMPLEMENTED_SOURCE_PROPOSAL_ONLY`：Host Read/Check/Terminal、9/9 检查、technical status、versioned 候选/回放 | C2 durable ReadReceipt/Check/Run ACK 及政策发布权限（非 A） | A O；C 业务 ACK + I 联合 |
| A3 — 24-turn SDK bridge | `IMPLEMENTED_A_ONLY_SEAM`：24-turn durable journal、Host callback/run/dispatch identity、四 mode 的技术调用 seam | SDK Pi native Provider physical receipt 已证实的实际挂接、Graph/Batch 生产 orchestrator、实际 Provider E | A O；I/C E |
| A4 — reliability/fencing | `IMPLEMENTED_SOURCE_WITH_R09`：派发前 durable claim、未知结果拒重发、延迟结果/Abort、冷 ledger 污染拒止、双 PID/SIGKILL 和跨 Run/Case 隔离测试代码 | 真 SDK/worker/Provider 跨进程与远端 cancel 验收、合法可信 recovery 策略 | A O；I/C E、C 业务恢复 |

### 二、R09：冻结未决 Provider 的 Case 级跨 Run 隔离

- R08 工程输入：`dc59bf1fa41263308729ab6e6dedc90cba11edf3`。新发现：原 `V3ASDKDispatchFence.claim()` 只在同一 `[runId,attemptId,ownerGeneration]` 技术 key 下拒绝 `in-flight/late-denied`；因此在真实 Provider 仍未决时，Main 可创建不同 Run + Owner session **绕过同 Case 的安全 fence**。新的 A-owned `review-v3-sdk-dispatch-fence.ts` 在 durable claim 前遍历其他 Run 链，针对同 Case/Owner session 的未决 Provider 一律拒止；不影响已结清的独立 Case 正常运行。源码提交 `94ed6f92f3c8481762d48613a6f7c98616a8e3e7`。
- 新版每笔 SDK dispatch intent 在原 `grantId` 外存 `caseId/sessionId`，仍为 `v3-dev-a-sdk-dispatch/1` sealed ledger；**旧历史记录允许缺失两字段**，但只要旧未决记录缺 attribution，不能自信归属任何 Case，故对所有新 Run 保守拒止；只缺一半 scope 则当损坏拒止。这是安全兼容处理，不是丢弃旧数据。需 C 明示业务恢复流程才能改变 unresolved。
- 完成回执唯一性此前只在同 Run 检查，跨 Run 重复 native receipt 仍可被错误记为多次独立 SDK 完成。现在 `assertUniqueReceipt()` 及 `decode()` 在**全账本所有 Run** 检查 settled receipt ID 冲突，在线冲突 `REQUEST_ID_COLLISION`，历史冲突 `RECOVERY_REQUIRED`，无业务 writer/ACK。源码提交 `164c92fef653227574fd7a2859ed42e563616fb5`。
- A-only 合成 SDK/Main 测试 `A4-R09-01..07` 已提交（`4c46f7b932c26f77309d2b26029182f489fd266d`、`ccaaddbd1106fe945a8c4950d9ba395f55febbcc`、`20f9ef1ed9bb120d2db8c37a9b4cf9e03a11dc12`）：新 Run/新 session 不能绕过，同 Case 锁住但独立 Case 可继续，冷 reopen 有效，legacy scope 无法猜测，half-present scope 拒止，跨 Run receipt 在线和冷恢复撞号。
- `review-v3-sdk-dispatch-crashpid.test.ts` 已在先前实际 Linux OS 子进程 `SIGKILL` 测试中加 R09-PID-02 的**验证逻辑**：新进程重新授权不同 Run/新 Owner session 同 Case 后，仍不能 `claim`；提交 `d8a1a8d22f9fcbc19fc1036afd78067cc3e8bbad`。这是**一条增强的 PID 测试场景**，不是第二条已经运行的独立测试；Provider 依然合成。

### 三、分层交付/下一 Owner

1. **Dev-A 短期**：固定精确 SHA，在可用 Linux/Bun 环境集中执行 Gate O、处理真实首败，核对 Native Pi SDK 0.86.1 源码可否获得 provider-request/receipt Hook；若不可得，不可自己生成 pseudo-native receipt。推进可验证的 worker 接口，而不是循环新增抽象。
2. **Integrator-I**：只在 C 再次批准的冻结 C 锚点基础上对最新 A SHA 建立独立来源锁，联合 B staging/Plan/Source，绝不自动将 #143 浮动替换进 #147 I1 老锚点。
3. **Dev-C**：Owner/current Case/Source/Plan 正式 Principal/Run ACK/ReviewRun/Check 业务权威；A 保持 proposal-only，所有 Main IPC/Preload/正式 writer 更新均需 C 明示租约。已审批 `CR-A-001=APPROVED_SLICED_SPEC` 不等于生产写入租约。
4. **验收分层**：O 需要固定同 SHA install/typecheck/build/Bun 全量与负例、同环境 exit、报告与 CI；E 需要真实 Electron SDK Provider 物理请求数/取消/worker 崩溃；L/P 在授权与产品全链证据就绪前不签发。

**当前 Gate 一律不可推测**：`O=NOT_ATTESTED`（R08 前一 SHA PR CI cancelled，D2/Baseline queued；R09 新 SHA 的 workflow 必须另读）、`E=NOT_RUN`、`L=BLOCKED_NO_AUTH`、`P=NOT_RUN`。这不是“功能百分比”，而是证据成熟度。

## 9. A4-R10：固定 Pi SDK 0.86.1 HTTP Provider 实际 streamFn 取证（2026-10-19）

**目前代码成熟度**：`A4_R10_SDK_STREAM_BOUNDARY_SOURCE_COMMITTED / HTTPS_SSE_REQUEST_WITNESS_SOURCE_COMMITTED / REAL_SDK_PROVIDER_GATE_E_NOT_ATTESTED`。不是 native SDK 已上线、也不是 C2 正式 Run ACK。

### 实际锁定的依赖及 upstream 源码

- 当前项目 `apps/electron/package.json` / 根 override 锁 `@earendil-works/pi-coding-agent/pi-agent-core/pi-ai 0.86.1`；上游固定 `v0.86.1` Git commit `13cbf77df2396303013a41646bcfa77b4271ae56`。
- 该 tag 的 Pi `AgentSession.agent.streamFunction` 可公开写入，`createAgentSession()` 底层真实走 `modelRuntime.streamSimple`；OpenAI-compatible API 用 `fetch` 且存在 `retryProviderRequest` 外层重试。单看 `agent_end` / `SDKMessage.result.success` / assistant UUID / `onResponse` 均不能证明一笔**独立物理 HTTP Provider 请求已完整完成**。
- 真客户端 `adapters/pi-agent-adapter.ts` 已在 `createAgentSession`（约 2634 行）后、`session.prompt`（约 3060 行）前包装 streamFn（约 2704 行），负责 Proxy 和 payload sanitization。真实 V3 接线不能直接覆盖并丢失这些已有能力。

### 本轮 A-owned 生产代码 / 测试

- 新 `review-v3-pi-http-provider-engine.ts`：直接按真实 Pi `AgentSession.agent.streamFunction`、`subscribe(turn_end)`、`prompt()` 接口做**独立 Main-only 限定技术 Engine**，并由 `V3APhysicalSDKTurnPort` 连接 A4/A3。不接受第二次 streamFn/HTTP fetch；`maxRetries:0`、`transport:'sse'`，Main-selected HTTPS origin、禁止 redirect；只支持 `openai-completions`/`openai-responses`，非 SSE、非 HTTPS、缺失 `x-request-id`、错误停止原因、abort/timeout、旧 Agent 复用均拒绝。Main 取消信号传入 Pi SDK streaming 和底层 fetch。
- 新 `review-v3-pi-http-provider-engine.test.ts` 用内存 HTTP transport 覆盖 request ID、源/回执、HTTPS/redirect、二次调用、上游隐藏 fetch、SDK 正误结果、API/传输白名单、abort/reuse、真实 `Agent` 公开 streamFn 属性 smoke；`review-v3-main-sdk-turn-bridge.test.ts` 中 `A4-R10-16` 联合 A4 pre-dispatch journal + 24-turn budget。以上均为**测试源文件提交，不是实际执行**。
- 完整逐来源证据/未获批 C CR：`docs/design/review-agent/acceptance/v3-dev-a-r01/A4-R10-PI-0861-TRANSPORT-EVIDENCE-AND-INTEGRATION-CR.md`。此文档是 A 的**请求提案**，不是 C 已批准租约。没有改 C-owned Main IPC/Preload/Run/Business writer，亦未改共享 `pi-agent-adapter.ts` 的生产入口。
- **保障与剩余限制**：`x-request-id` 是 Provider 返回的 HTTP request identifier，不是密码学证明、也不是 Pi 统一 native turn receipt；校验须依赖 TLS/已批准 Host、一次真实 `fetch`、成功 SDK `turn_end`，仍需 Gate E 确认代理/透明 retry/真实 SSE EOF；没有 header 或非支持 API **保留 BLOCKED 而不是伪造回执**。
- `Gate O`：本会话远端 Github 读写成功，但工具容器没有 Bun/GitHub clone DNS，不存在同 SHA 的实际 Bun/typecheck/build PASS。后续在 #143 最终 SHA 读取其 workflow/job，严格另锁。Gate E=`NOT_RUN`，Gate L=`BLOCKED_NO_AUTH`，Gate P=`NOT_RUN`。

### 下一个关键检查点

优先级不是再写一个泛 Provider adapter，而是先在**真实安装的 0.86.1 + 应用 Pi runtime**上，完成集中 Gate O 源码/构建/全量回归和官方 request ID 的 Gate E，确认是否能够无损复用现有 proxy/payload sanitizer。然后请 Dev-C 审核 `CR-A-PI-HTTP-WITNESS-R01` 并由 I 在新固定 source lock 上做技术接线。C2 技术账当前并非正式 durable Run ACK，A 无权擅自升级。

## 10. A4-R11：TypeScript 恢复优先，暂停继续堆 Provider 功能

**本批是质量恢复，不是新的 Provider 功能完成阶段。** 读取 #143 原始失败 SHA `53af44752a16369cbaba3071b2a223321087986c` 的三个真实 workflow：PR CI `39277833762` / job `118146558559`、D2 `39277833713` / job `118146557300` 均在类型检查出现**相同 24 条** `@profer/electron` TypeScript 错误，后续测试 skipped；仅 Baseline `39277833670` / job `118146555484` 在原 SHA 获 `SUCCESS`。不能将该 baseline 当作 Gate O PASS。

已在 A 独占文件实施逐错误来源的收口：执行事件生产器的缺项 journal/terminal 访问；EIO replay 测试的下标可空断言；SDK 派发栅栏 settled/late-denied 记录的最后一条校验；物理请求见证异步回调结果；Pi HTTP Provider `fetch.preconnect` Bun 严格签名、异步 Response request ID 及测试 factory 的显式 callable transport。原持久链拒止、一次物理请求与 Owner/Provider 边界均保留。

**实际 CI 状态**：须以新的 #143 `head_sha` 对应 workflow 实时查询为准；新源码/文档 commit 提交 ≠ 编译通过。在同 SHA PR CI / D2 / Baseline 全部真实 `SUCCESS`、必需 build/tests 不被跳过前，`GATE_O=NOT_ATTESTED`。Gate E = NOT_RUN；Gate L = BLOCKED_NO_AUTH；Gate P = NOT_RUN。

**详细修复账本与集中 Gate O 口径**：`A4-R11-TYPECHECK-REMEDIATION-AND-EXACT-SHA-GATE-O.md`。当前下个动作是盯住**最新修复 SHA** 的首个真实 TypeScript/测试/构建结果；若还有新首败，继续只修 A-owned 代码、固定新 SHA、完整重跑。不应在此期间扩充 SDK/Provider 正式工程而绕过 Gate O。

## 11. 每批交付行必须具备

`slice_id / source_sha (40位) / ownership_paths / first_failure / exact commands + env + exit + PASS/FAIL/SKIP / CI workflow+job / Gate O/E/L/P / unresolved_risks / next_owner / C lease if applicable / integration source-lock / rollback commit`。

**禁止**：单线组件 pass 写成真正集成 pass、合成 SDK callback 变成 native receipt、用历史 SHA 成绩证明新 HEAD、将 runner queued 写成失败或成功、编造学校 ACK、越权改 C 文件、为了时间削弱旧测试。
