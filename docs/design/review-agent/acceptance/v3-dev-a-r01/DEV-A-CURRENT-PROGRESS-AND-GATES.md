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

1. **A4-R07（现在推进）**：在 A 自有代码建立 Pi native Host 执行 port 的可校验 provenance、单物理派发约束、明确拒绝 assistant/result/harness 被动事件伪造 turn receipt，并覆盖 Provider 内部多调用、原生 retry、图片降级 requery、取消后迟到完成的安全负例。**若真实 Pi SDK API 未暴露物理 receipt，必须以 `PROVENANCE_UNAVAILABLE` 拒止，不得随机生成假的稳定收据。**
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

## 7. 每批交付行必须具备

`slice_id / source_sha (40位) / ownership_paths / first_failure / exact commands + env + exit + PASS/FAIL/SKIP / CI workflow+job / Gate O/E/L/P / unresolved_risks / next_owner / C lease if applicable / integration source-lock / rollback commit`。

**禁止**：单线组件 pass 写成真正集成 pass、合成 SDK callback 变成 native receipt、用历史 SHA 成绩证明新 HEAD、将 runner queued 写成失败或成功、编造学校 ACK、越权改 C 文件、为了时间削弱旧测试。
