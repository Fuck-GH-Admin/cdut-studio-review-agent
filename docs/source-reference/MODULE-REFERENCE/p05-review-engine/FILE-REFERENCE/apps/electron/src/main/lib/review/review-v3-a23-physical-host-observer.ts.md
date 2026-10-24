---
path: apps/electron/src/main/lib/review/review-v3-a23-physical-host-observer.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5813dcc8728859c31f46dc4e39020a806d219d68
sha256: 75256b7f77f4c67cf201329d6c9c474ed5c8de516b76d004e50a7dd75f6ffd16
lines: 252
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a23-physical-host-observer.ts

## 1. 结论与边界

Dev-A R23：**证据生产型物理 Host 钩子边界**。特权物理 *executor* 与独立技术 *observer* 是两个注入端口（`:50-57`），A23 把「请求 → 执行 → 独立观察 → 双向比对」固化为 `AVerifiedExecutionHost` 实现（`A23ObservedHostTechnicalAdapter`，`:99`）。文件头三条硬约束（`:1-10`）：两者都不能证明 C2 Main 独立复核的物理 Host receipt；物理操作结果缺失/畸形/被撤销/中止/冲突时**永久不确定、绝不重试**。

边界：不实现 C 观察者（`:95`）；输出 `A23TechnicalHostSnapshot.cHostReceiptVerified:false`（`:63,215`）只供诊断（`snapshots()` 注释 `:120`：不能登记进 C 物理注册表）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `A23HostOperation` | interface | 32-40 | `{operationId; run; permissionGrantId; ownerSessionId; ownerProcessEpoch; dispatchId:string\|null; requested:Outcome}` | Main 钉住的可信执行输入，非 IPC/模型 JSON（`:31`） |
| `A23ObservedTechnicalHostEvent` | interface | 41-49 | 同上 + `technicalReceiptId` + `observed:Outcome` | |
| `A23PhysicalExecutor` | interface | 51-54 | `execute(op):Promise<{technicalReceiptId;result:Outcome}>` | 实际执行器 |
| `A23TechnicalPhysicalObserver` | interface | 55-57 | `observe(operationId):Readonly<A23ObservedTechnicalHostEvent>\|undefined` | 独立观察口 |
| `A23TechnicalHostSnapshot` | interface | 58-64 | `{version:'v3-dev-a-physical-hook/1'; trust:'A_TECHNICAL_OBSERVATION_NOT_C_HOST_RECEIPT'; operation; observation; cHostReceiptVerified:false}` | |
| `A23ObservedHostTechnicalAdapter` | class | 99-252 | 实现 `AVerifiedExecutionHost`：`read/check/terminal/close/snapshots/needsRecovery` | 构造 5 参（owners/call/executor/observer/getDispatchId） |

内部：`Outcome` 三型（`:25-29`：A23Read/A23Check/A23Terminal）、`stable/same`（`:65-72`）、`deny`（`:73-75`，抛 `C0ContractError('RECOVERY_REQUIRED','A23_HOST_HOOK: …')`）、`valid`（`:76`，非空 ≤512）、`checkTuple`（`:77-79`）、`equivalentOutcome`（`:81-93`：read 比 source+extent 合法集，check 比四元组+status 合法集，terminal 比 status 相等）。

## 3. 内部逻辑与关键流程

`perform(requested)`（`:147-223`）——三接口共用核心：

1. `:150-151` `current()`（`:125-131`：closed/uncertain/busy 任一 → deny；再 `assertAuthorized`）+ `pinned(lease)`（`:132-146`：runEvidence/planSnapshot 缺失或 runId/caseId/attemptId/ownerGeneration/planFingerprint/manifestHash 六元不符 → deny）。
2. `:152-165` 请求校验：read 须在冻结 Source（sourceIdentities 深比较 + sourceVersionIds）；check 须命中 plan.bindings `checkTuple`；terminal status 须在 6 值白名单（`completed-technical/partial/cancelled/timed-out/needs-resume/failed`）。
3. `:166-167` dispatchId 非 null 时须 `valid`。
4. `:168-173` 构造 operation（`randomUUID()`，structuredClone run/requested）。
5. `:174-176` `busy=true` → `await executor.execute(...)`。
6. `:177-199` `observer.observe(operationId)` 缺失 → 抛 RECOVERY_REQUIRED；随后 13 项比对一票拒（receiptId 合法/不重复/两口一致、result 与 observed 深比较、run/operationId/permissionGrantId/ownerProcessEpoch/dispatchId 一致、`equivalentOutcome`、full-document read 时 `coveredPhysicalBlocks===totalPhysicalBlocks>0` 且均为安全整数）→ deny `physical hook mismatch, duplicate receipt or missing observation`。
7. `:200-209` 事后重查：closed 或 dispatchId 变化 → deny；`assertAuthorized` 再取 lease 比 run/processEpoch/grantId 一致（`:205-208`，「Host owner rotated across physical await」）。
8. `:210-217` 登记 receiptId、追加 snapshot（`cHostReceiptVerified:false`）。
9. `:218-222` catch → `uncertain=true`（**永久停机**，注释 `:219`）后重抛；finally `busy=false`。

`read/check/terminal`（`:224-251`）：分别以 `extent:'block'`/`status:'unknown'` 占位 check/给定 terminal 发起 perform，结果 kind 不符 → 抛 `physical read/check/terminal kind changed`；返回 `receiptId+actual*`。`close()`（`:119`）；`needsRecovery()`（`:124`）返回 uncertain。

## 4. 调用者与调用链

出向：`node:crypto`、`@profer/shared`（`C0ContractError` 等）、`./review-pi-owner-adapter`、`./review-execution-event-adapter`、`./review-v3-execution-proposal-producer`（`AVerifiedExecutionHost` 类型实现）。

入向（检索=模块名+符号名，全冻结树）：

- `apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.ts:27-29,51-52,60,134`（`new A23ObservedHostTechnicalAdapter`，把 `physicalExecutor/physicalObserver` 从 `A25MainCaseExecutionBinding` 注入）。
- 测试：`review-v3-a25-c11-local-execution-ports.test.ts:11-12,63`、`review-v3-r23-r24-concentrated.test.ts:8-11,59-61,78`（不在本批）。
- `A23TechnicalHostSnapshot` 仅本文件使用（`:58,104,121`）。
- 产品入口层（review-ipc/preload/main index/renderer）0 命中——A 链无产品入口（否定结论同 A22 篇检索范围）。

## 5. 数据 I/O、读写与副作用

本文件不写盘/网络；副作用全在注入端口（executor 的真实物理操作、owner 账本 assertAuthorized）。内存态：`busy/closed/uncertain` 布尔、`receiptIds` 去重集、`observations` 数组（`snapshots()` 返回 structuredClone）。`operationId` 用 `randomUUID()`（`:169`）。

## 6. 分支、失败、取消与恢复

- 一票拒（deny）覆盖 §3 各处；`RECOVERY_REQUIRED` 语义=需外部重建。
- **不可恢复点**（`:178-179,218-221`）：执行后观察缺失、任一比对失败、执行器抛错 → `uncertain=true`，此后 `current()` 拒绝一切调用（`:126-128`），**同一物理操作永不重试**（文件头 `:8-9`）。
- 并发：`busy` 期间并发调用被 deny（`:126-128`）。
- 取消：无内部 Abort 处理；`stop` 语义由上层（A25）`host.close()` 落实。

## 7. 权限与权威状态

每次 perform 前后两次 `assertAuthorized(...,'review_submit_result')`（`:129-130,202-204`）+ 六元 run 身份钉住（`:138-144`）。权威划分（`:3-6,95,180-181`）：executor 自述 receipt **不被单独采信**（必须有独立 observed 钩子且两口一致）；`cHostReceiptVerified:false` 恒定——C 的物理 receipt 验证权不在此。

## 8. 修改影响面

- 改 13 项比对/Outcome 形状 → 影响 `review-v3-execution-proposal-producer`（消费 `AVerifiedExecutionHost` 返回）与 A25 组装链、`review-v3-r23-r24-concentrated.test.ts`。
- `equivalentOutcome` 的 status/extent 合法集与 A22 `snapshot` 的 check 校验是平行口径，需同步。
- `uncertain` 永久停机语义是安全关键：放宽等于允许未知物理副作用重放。

## 9. 测试证据

本批**无**直接测试文件。间接（不在本批）：`review-v3-r23-r24-concentrated.test.ts`（构造 adapter）与 `review-v3-a25-c11-local-execution-ports.test.ts:69-83`（fixture 内联 fake executor/observer，`physical()` 计数断言 `:141`）。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| executor/observer 双端口强制分离（构造校验） | 已证实 | `:112-117` |
| 13 项事后比对一票拒 | 已证实 | `:182-198` |
| 观察缺失/执行异常 → uncertain 永久停机、不重试 | 已证实 | `:178-179,218-221,125-128` |
| 事后重查 owner/epoch/grant 未轮换 | 已证实 | `:200-208` |
| full-document read 要求全覆盖块数 | 已证实 | `:193-197` |
| terminal 6 值白名单 | 已证实 | `:161-164` |
| 无产品入口 | 已证实（否定结论，检索范围同 §4） | grep |
| 真实物理执行语义（executor 实现） | 未知 | 注入端口，实现在批外/未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 interface + class | §2 | 32-99 | covered |
| `perform` 9 步 | §3 | 147-223 | covered |
| `read/check/terminal` | §3 | 224-251 | covered |
| `current/pinned` 身份闸 | §3, §7 | 125-146 | covered |
| `equivalentOutcome` | §2, §3 | 81-93 | covered |
| executor 实际语义 | §10 | — | unknown |
