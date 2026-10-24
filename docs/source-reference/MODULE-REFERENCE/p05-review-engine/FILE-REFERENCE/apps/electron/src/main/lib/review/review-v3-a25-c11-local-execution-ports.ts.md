---
path: apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69ad0345f2eb19c84347eee8dde08687ffbd037c
sha256: 009891d5c4d257d3560e4214263c132e27da3800a67b05b4cde114a6f8bf1337
lines: 213
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts

## 1. 结论与边界

Dev-A R25：为 `C11MainLocalExecutionOrchestrator` 提供**A 侧具体端口的装配器**——把 C Main 提供的当前 Run、已授权 Owner、真实 Pi 会话工厂、物理 Host executor/observer、四个持久 CAS 存储，与既有 A22/A23/A24 实现绑定成一个案卷级执行单元（`apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:1-8`）。不写 Case/Run/Decision、不产 C 物理 receipt、不发 Renderer 凭据、不做校方发布（`:6-7`）。

边界：`bindCase` 只能在 C Main 授权新 Owner/Run 后调用（`:99`）；`check()` 只转发四元组（`:182-185` 注释：转发 applicability/sourceVersionIds 会让合法观察在 A2 精确比较中失败）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A25MainCaseExecutionBinding` | interface | 36-53 | `{call:V3ReviewToolCall; owners; stores{turns,dispatch,proposals,background:OwnerPersistence}; piSessions?; piMainSelection?:A26MainReviewPiSelectionPort; physicalExecutor; physicalObserver}` | `call` 注释：Main 签发的 scoped submit 能力，绝不接受 Renderer 提交（`:37`）；stores 注释：真实分立 CAS 文件（`:40`） |
| `A25C11LocalExecutionPorts` | class | 81-213 | 构造 `(currentRun:(call)=>RunEvidenceIdentity\|undefined)`；`bindCase/read/check/terminal/inspect/stop/stopSession/snapshot` | 暴露 `background/handoff/batch` 三端口（`:83-85`） |

内部：`ActiveCase`（`:54-63`：call/run/owners/driver/producer/host/handoff/store）、`reject`（`:64-66`，`C0ContractError('RECOVERY_REQUIRED','A25_C11_PORT: …')`）、`stable/same`（`:67-74`）。

## 3. 内部逻辑与关键流程

- 构造（`:87-97`）：`currentRun` 非函数 → reject；创建 `V3ABackgroundTechnicalCoordinator`（assertCurrent/driverForCase/storeForCase 闭包）、`handoff={snapshot:…}` 转发、`A24BoundedTechnicalBatchScheduler`。
- `bindCase`（`:100-156`）顺序：① call.tool 必须 `review_submit_result`（`:102-103`）；② `currentRun(call)` 必须返回且与 lease.runEvidence **深比较相等**（`:104-110`）；③ 已有同 caseId 绑定：同 run/session/grant 幂等返回（`:112-115`），否则后台任务 running/stopping 时 reject `ACTIVE_CASE_MUST_BE_STOPPED_FIRST`（`:116-118`），`host.close()` 后替换（`:119-120`）；④ 四个 store 必须都有 `compareAndWrite`（`:122-125`）；⑤ `piSessions ?? piMainSelection→new A26NativeReviewPiSessionFactory`（`:126-129`），无工厂 → reject `REAL_PI_SESSION_FACTORY_NOT_CONFIGURED`（`:130-131`）；⑥ 组装 turns/dispatch/host（`getDispatchId` 闭包取最后 in-flight dispatchId，`:136-140`）/producer/sdk(`V3APiHttpSingleRequestEngine`)/bridge/driver/handoff（`:132-150`）；⑦ `cases.set`（structuredClone call/run，`:151-155`）。
- `assertBound`（`:161-173`）：currentRun 当前性 → byCase → run/session/grant/senderKey 四比对 → `assertAuthorized`。
- 工具入口（`:175-193`）：`read`（转发 producer.read + tool 改 `review_read_documents`）、`check`（解构四元组）、`terminal`。
- 后台（`:194-208`）：`inspect`（UI 可轮询，不推断 C ReviewRun）、`stop`/`stopSession`（同时 `host.close()`）。
- `snapshot`（`:209-212`）：转发 handoff.snapshot（技术证据，非 C ACK）。

## 4. 调用者与调用链

出向（15 个模块）：`@profer/shared`、`./review-pi-owner-adapter`、`./review-execution-event-adapter`、`./review-v3-execution-turn-budget`、`./review-v3-sdk-dispatch-fence`、`./review-v3-execution-proposal-producer`、`./review-v3-main-sdk-turn-bridge`、`./review-v3-sdk-physical-turn-port`、`./review-v3-pi-http-provider-engine`、`./review-v3-technical-sequence-driver`、`./review-v3-background-technical-coordinator`、`./review-v3-a-host-technical-handoff`、`./review-v3-a23-physical-host-observer`、`./review-v3-a24-bounded-technical-batch`、`./review-v3-a26-native-pi-session-factory`（`:9-34`）。

入向：**仅** `review-v3-a25-c11-local-execution-ports.test.ts:10,62`（`new A25C11LocalExecutionPorts`）。产品入口层 0 命中（检索式=A25MainCaseExecutionBinding|A25C11LocalExecutionPorts|模块名，全冻结树）——A 链当前仅测试/内部互调。

## 5. 数据 I/O、读写与副作用

本文件自身不写盘；经注入的 `OwnerPersistence.compareAndWrite`（四账本）持久化（turns/dispatch/proposals/background），CAS 语义在各账本实现。内存副作用：`cases` Map 增删、`host.close()`。`bindCase` 结构化克隆 call/run 隔离外部修改。

## 6. 分支、失败、取消与恢复

- 全部失败 = `reject`（RECOVERY_REQUIRED + 前缀 `A25_C11_PORT`）或 RECOVERY_REQUIRED 抛错；错误文案含 `C_MAIN_RUN_NOT_CURRENT`、`C_MAIN_RUN_NOT_EQUAL_TO_A_OWNER`、`ACTIVE_CASE_MUST_BE_STOPPED_FIRST`、`FOUR_DURABLE_CASE_CAS_STORES_REQUIRED`、`REAL_PI_SESSION_FACTORY_NOT_CONFIGURED`、`CASE_NOT_BOUND_IN_C_MAIN`、`MAIN_OWNER_OR_RUN_CHANGED`（`:64-65,102-131,158-169`）。
- 取消/停止：`stop`/`stopSession` 委托 background coordinator 并关闭 host（`:198-208`）；A23 的永久 uncertain 停机语义随 `host.close()` 传递。
- 幂等：同 run+session+grant 重复 `bindCase` 无副作用返回（`:112-115`）；A25 测试 `:151-156` 验证同 requestId 重跑不新增请求。

## 7. 权限与权威状态

`call` 是 Main 签发能力（`:37`）；`bindCase`/`assertBound` 均 `assertAuthorized(...,'review_submit_result')`（`:106-107,170-171`），且 `currentRun(call)`（C Main 权威）必须与 lease.runEvidence 深比较一致（`:108-110`）。注释反复声明（`:77-79,209`）：C 仍须提供 currentRun 与独立 physicalReview，A23 观察不得当 C 证据。

## 8. 修改影响面

改装配顺序/闸门 → 影响 `review-v3-a25-c11-local-execution-ports.test.ts`（A25-01/02）；`check()` 四元组裁剪是 A2 精确比较的前置（改回全绑定会破坏 A23→A22 链）；`background/handoff/batch` 形状是 C11 编排器的入参契约（`review-v3-main-local-execution-orchestrator.ts` 类型位）。

## 9. 测试证据

直接测试 `review-v3-a25-c11-local-execution-ports.test.ts`（见该篇，`it(` 2 个）：A25-01 全链（native Pi turn → read/check/terminal 3 次物理 → handoff 快照序列 `['read','check','terminal']`、`verifyA22TechnicalEvidenceHash===true`、幂等重跑 0 新请求）；A25-02 Run 撤销（`setCurrent(false)` → `rejects.toThrow('C_MAIN_RUN_NO_LONGER_CURRENT')`、0 请求、snapshot 抛）。**NOT_RUN**：本轮未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组装 15 依赖、四 CAS 存储强制 | 已证实 | `:9-34,122-125` |
| currentRun 与 lease.runEvidence 深比较闸 | 已证实 | `:104-110` |
| check 只转发四元组（防 A2 比较失败） | 已证实 | `:180-189` |
| 仅测试调用、无产品入口 | 已证实（否定结论，检索范围见 §4） | grep |
| 幂等 bind/重跑语义 | 已证实（测试断言存在）/NOT_RUN | 测试 `:151-156` |
| C11MainLocalExecutionOrchestrator 实际装配方式 | 未知 | 该编排器不在本批未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `A25MainCaseExecutionBinding` | §2 | 36-53 | covered |
| `bindCase` ①-⑦ | §3 | 100-156 | covered |
| `assertBound` | §3, §7 | 161-173 | covered |
| `read/check/terminal` | §3 | 175-193 | covered |
| `inspect/stop/stopSession/snapshot` | §3 | 194-212 | covered |
| C11 编排器侧消费 | §10 | — | unknown |
