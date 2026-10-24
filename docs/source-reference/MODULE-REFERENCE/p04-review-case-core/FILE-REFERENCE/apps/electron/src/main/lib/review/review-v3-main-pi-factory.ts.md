---
path: apps/electron/src/main/lib/review/review-v3-main-pi-factory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d342ae0e14055ca0f73875782d773afa432aa7fd
sha256: 76116b6c58a3abc9d0e1be5257ab1ad6c65d4724d9b96aa6c80049888b667734
lines: 170
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-pi-factory.ts

## 1. 结论与边界

Dev-C C2-R03：惰性、专用的 Pi `AgentSession` **构造**权威。不发起模型请求、不注册 IPC、不读凭证、不装工具、不打补丁普通 Agent、不断言物理 HTTP 回执；返回的结构化 spec 只有在独立 source-locked 的 A/C 集成与 Gate E 后才与 A4 的 Pi HTTP 引擎兼容（文件头 `apps/electron/src/main/lib/review/review-v3-main-pi-factory.ts:1-8`）。

边界：

- 只建新会话：A SDK HTTP 封装仍拥有物理派发、retry=0、SSE 证明、原生生命周期与 prompt 后强制 dispose（`:103-106`）。
- `trustedOrigin` 必须是钉死的精确 HTTPS origin（`:33-34,59-68`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 3 个接口 + 1 个类 = 5 个导出（函数/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C2MainPiMode` | type（导出） | 20 | `'direct'\|'hidden'\|'graph'\|'batch'` | |
| `C2MainPiRequest` | 接口（导出） | 21-26 | `{run,dispatchId,mode,signal?}` | |
| `C2MainPiCreatedSession` | 接口（导出） | 27-31 | `{session:Pick<AgentSession,'agent'\|'prompt'\|'subscribe'\|'dispose'>,prompt}` | prompt 来自可信 Main 派生 |
| `C2MainPiFactoryDependencies` | 接口（导出） | 32-41 | `trustedOrigin/assertPublishedPlan/getCurrentOwner/createFreshSession` | 注入 |
| `C2MainPiAgentSessionFactory` | 类（导出） | 107-169 | `create(input)` | 新会话构造 |
| `consumedAgents`/`consumedDispatches` | 内部 | 43-44 | WeakSet 对象 + Set dispatchKey | 进程内一次性 |
| `valid`/`canonical`/`deny`/`isSame` | 内部 | 45-57 | ≤512 非空；键排序规范化；`C0ContractError('RECOVERY_REQUIRED')` | |
| `exactOrigin` | 内部 | 59-68 | 仅精确 HTTPS origin | 否则 `Main Pi provider origin is not a URL`/`Only an exact pinned HTTPS Provider origin is admissible` |
| `assertCurrent` | 内部 | 71-101 | 案卷/Plan/Run/原件/Owner 全量复查 | |

## 3. 内部逻辑与关键流程

### 3.1 当前性复查（`assertCurrent`，`:71-101`）

`readAggregate(run.caseId)` 必须存在、`stage==='reviewing'`、caseId/plan 指纹/版本对齐、无 `d2RuntimePlan`、有 `v3TechnicalExecution` 且未终态、无 `v3ReviewRun`、`v3TechnicalExecution.run` 与请求 run 规范化相等，否则 `Current admitted C Case/Plan/Run identity is not available`（`:75-85`）→ `assertPublishedPlan`（`:86`）→ `sourceVersionIds` 非空唯一后逐原件 `assertC2PhysicalOriginalBytes`（`:87-93`）→ Owner 见证对齐（`Main Owner/grant/generation/input manifest has expired`，`:94-99`）。

### 3.2 `create(input)`（`:118-169`）

1. `assertC0RunEvidenceIdentity(input.run)`；`dispatchId` ≤512 非空、`mode` 四值、signal 未中止，否则 `Main dispatch, mode or AbortSignal is invalid`（`:123-128`）。
2. `dispatchKey=canonical([run,dispatchId])`；已消费 → `Pi dispatch reused`（派发意图可能已达 Provider，即便会话创建失败也绝不静默二次建会话，`:129-133`）。
3. `before=assertCurrent(...)`（`:134`）→ `createFreshSession({...input,run:structuredClone(run)})`（`:135-137`）。
4. `agent` 必须存在且未消费过（`Dedicated Pi agent missing or reused`）；注释：不 dispose 已消费 agent——它可能属于另一活物理派发，破坏会掩盖证据（`:138-145`）。
5. 会话形状校验（`prompt/subscribe/dispose` 方法、`agent.streamFunction`、`agent.state.isStreaming` 为假、`spec.prompt` 非空 ≤524288），失败 `rejectSession`（先 `session.dispose()` 再抛 `Fresh inert Pi SDK session and trusted prompt required`，`:146-157`）。
6. `after=assertCurrent(...)`（失败也 `dispose` 后重抛，`:158-163`）；signal 中止或 Owner 前后不等（grantId/规范化比较）→ `rejectSession('Main Owner changed or request aborted while creating Pi session')`（`:164-167`）。
7. 返回 `{session,prompt,trustedOrigin}`（`:168`）。

## 4. 调用者与调用链

入向（冻结树 grep）：生产唯一使用者 `review-v3-main-trusted-assembly.ts:26-29`（import）、`:74-82`（构造并包 `createFreshSession`）、`:125-128`（`createPi`）；而该装配无生产调用者（见其手册）。测试：`review-v3-main-trusted-assembly.test.ts:13`（类型）与 `review-v3-main-pi-factory.test.ts:11`（本批 7 例）。

出向：`@earendil-works/pi-coding-agent`（类型 `AgentSession`）；`@profer/shared`（`assertC0RunEvidenceIdentity`/`C0ContractError`）；`case-store-v2.ts:51`（`readAggregate`）；`review-v3-main-trust-port.ts:68`（`assertC2PhysicalOriginalBytes`）。

## 5. 数据 I/O、读写与副作用

- 读：案卷聚合 + 逐原件物理字节（重哈希）；两次复查夹着 `createFreshSession` await。
- 写：无。不发请求、不装工具、不读凭证（`:3-5`）。
- 副作用：`createFreshSession` 是注入的“一次性专用创建”（`:39-40`）；失败路径 `session.dispose()`（`:146-148,161`）。
- 幂等/并发：`consumedDispatches`/`consumedAgents` 进程内一次性（`:43-44`）；类无锁（同 run+dispatchId 并发第二个会拒绝 `Pi dispatch reused`）。

## 6. 分支、失败、取消与恢复

| 拒绝（`C0ContractError('RECOVERY_REQUIRED',…)` 或 `ACTOR_UNTRUSTED`） | 触发 | 行 |
| --- | --- | --- |
| `C Main Pi dependencies required` | 构造缺方法 | 113 |
| `…origin is not a URL`/`Only an exact pinned HTTPS Provider origin…` | origin 非精确 HTTPS | 62,65 |
| `Current admitted C Case/Plan/Run identity is not available` | 案卷/Run 校验失败 | 84 |
| `Frozen original version set invalid` | 来源集合 | 89 |
| `Main Owner/grant/generation/input manifest has expired` | Owner 失效 | 98 |
| `Main dispatch, mode or AbortSignal is invalid` | 入参 | 127 |
| `Pi dispatch reused` | 重复派发 | 132 |
| `Dedicated Pi agent missing or reused` | agent 缺失/复用 | 143 |
| `Fresh inert Pi SDK session and trusted prompt required` | 会话形状（dispose 后抛） | 156 |
| `Main Owner changed or request aborted while creating Pi session` | await 后漂移 | 166 |

- 失败后状态：新会话在拒绝前 dispose（`:146-148`）；已消费 agent 不动（`:140-142`）；dispatch 意图已记账不撤销（`:130-133`）。
- 取消/恢复：signal 中止即拒；恢复需新 dispatchId + 新创建。

## 7. 权限与权威状态

- 权威注入：已发布 Plan（candidate-held 拒绝）、活 Owner/grant、一次性 `createFreshSession`（`:32-41`）。
- prompt 来自可信 Main 派生（`:29-30`）；类不解释/不生成模型文本。
- `trustedOrigin` 严格钉死（`:59-68`），返回值供调用方核对（`:168`）。

## 8. 修改影响面

- 改 `C2MainPiFactoryDependencies` 影响 `review-v3-main-trusted-assembly.ts:41,74-82` 与两测试。
- 改 `assertCurrent` 影响与 `review-v3-main-trust-port.ts`/`case-store-v2` 的一致性契约。
- 改一次性语义影响 `review-v3-main-pi-factory.test.ts` 的 `reused` 断言。

## 9. 测试证据

直接测试：`review-v3-main-pi-factory.test.ts`（190 行，7 例，详见其手册）：构造/origin 校验、真实案卷+Owner 后建一次惰性会话且不 prompt、长 prompt 原样保留、candidate-held/无 Owner/预中止零创建、构建期 Owner 轮换→dispose+拒、原件篡改→拒+dispose、已 streaming 会话 fail-closed+dispose。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

间接：`review-v3-main-trusted-assembly.test.ts`（经装配调用 `createPi`）。

缺口：`valid`/`dispatchId` 边界、`signal` 中止于 await 后段、真实 Pi SDK 会话形状（`as unknown as` mock）无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两次 assertCurrent 夹一次 await | 已证实 | `:134-163` |
| dispatch/agent 进程内一次性 | 已证实 | `:43-44,129-145` |
| 失败 dispose 新会话、不动已消费 agent | 已证实 | `:140-157` |
| 精确 HTTPS origin | 已证实 | `:59-68` |
| 无 IPC/无网络请求 | 已证实 | 全文无 ipcMain/fetch |
| 生产链止于 trusted-assembly（无调用者） | 已证实（检索：冻结树 `apps`+`packages` 非测试 `*.ts`） | 见 §4 |
| 真实 Pi SDK 会话行为 | 未知 | 测试 mock `as unknown as` |
| A SDK HTTP 封装语义 | 未知（文件外） | 注释指向（`:103-105`） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 构造/origin | §3.2 | 59-68,109-116 | covered |
| `assertCurrent` | §3.1 | 71-101 | covered |
| `create` 全流程 | §3.2 | 118-169 | covered |
| 一次性/dispose 语义 | §6 | 129-157 | covered |
| 权威注入 | §7 | 32-41 | covered |
| 生产接线 | §4 | 检索记录 | covered（范围已声明） |
| 真实 SDK 行为 | §10 | — | unknown |
