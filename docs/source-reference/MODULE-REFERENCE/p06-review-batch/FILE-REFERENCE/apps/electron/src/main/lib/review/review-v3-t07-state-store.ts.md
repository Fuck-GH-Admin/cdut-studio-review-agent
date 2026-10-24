---
path: apps/electron/src/main/lib/review/review-v3-t07-state-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 441a5b1d79349240b4bd300e836a9c77a52fe4f5
sha256: f692f8a03b4a155618f1351f0c2b4ef8e9501478d24b0c3fd2adf80667eb206c
lines: 91
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-state-store.ts

## 1. 结论与边界

T07 评分状态的 **Main 侧持久化桥**（Local-L04，运行时代码）。文件头 `apps/electron/src/main/lib/review/review-v3-t07-state-store.ts:1-17`：不是第二套 CaseStore（只存 assignment/vote/tieOrder/freeze，案卷/材料/Run/决定仍以 CaseAggregate 为唯一权威）；actor 由 Main 派生注入；每次写入要求 `expectedRevision` 匹配（CAS 习惯）；存储 `~/.cdutai/review-judging/{batchId}.json`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T07PersistedState` | 导出接口 | 19-25 | `{schemaVersion:'review-v3-t07-state/1', revision, updatedAt, state: T07State}` | 持久化信封 |
| `readT07State` | 导出函数 | 43-54 | `(batchId): T07PersistedState \| undefined` | 读；损坏抛 `T07_STATE_CORRUPT` |
| `initT07State` | 导出函数 | 57-67 | `(batchId, state, expectedRevision): T07PersistedState` | 首次写入（revision 必须 0） |
| `writeT07State` | 导出函数 | 70-91 | `(batchId, state, expectedRevision): T07PersistedState` | CAS 写入 |

内部：`judgingDir`（`:27-29`）、`statePath`（`:31-35`，`assertSafeBatchId`）、`writeAtomic`（`:36-41`，随机后缀 tmp + `renameSync`）。

## 3. 内部逻辑与关键流程

- `readT07State`（`:43-54`）：文件缺失→`undefined`（不伪造空轮次，`:42` 注释）；`schemaVersion` 不符或无 `state.batchId`→`undefined`（`:47-48`）；`JSON.parse` 抛错→**`throw new Error('T07_STATE_CORRUPT')`**（`:51-53` 注释：损坏文件不得被当成空状态继续写入，否则静默丢失评分记录）。
- `initT07State`（`:57-67`）：`expectedRevision!==0` 抛 `T07_INIT_REVISION_INVALID`；`state.batchId!==batchId` 抛 `T07_BATCH_MISMATCH`；已存在抛 `T07_STATE_ALREADY_EXISTS`；委托 `writeT07State(batchId,state,0)`。
- `writeT07State`（`:70-91`）：batchId 匹配；`current=readT07State`（损坏时向上抛 CORRUPT）；`expectedRevision!==current.revision??0` 抛 `` `T07_REVISION_CONFLICT: 期望 X，当前 Y` ``（`:73-76`）；`next.revision=current+1`、`updatedAt=ISO`；`mkdirSync(recursive)`；`writeAtomic`。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/review-v3-t07-main-service.ts:22`（导入块）；`apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.ts:10`（`readT07State`）。出向：`node:fs`（exists/mkdir/read/rename/write，`:13`）、`node:path`（`:14`）、`../config-paths`（`getConfigDir`，`:15`）、`./batch-store`（`assertSafeBatchId`，`:16`）、`./review-v3-t07-rating-workflow`（`T07State` 类型，`:17`）。

## 5. 数据 I/O、读写与副作用

- 写：`<configDir>/review-judging/<batchId>.json`（`JSON.stringify(…,null,2)`）；原子性=随机后缀 `.tmp` + `renameSync`（`:36-41`，非固定名 tmp——并发写互不踩踏，推断-静态）。
- 读：同文件；目录自动创建（`:84-85`）。
- 副作用：无日志/网络/窗口。幂等：init 一次性；write 幂等由 CAS 修订号保证。

## 6. 分支、失败、取消与恢复

错误码：`T07_STATE_CORRUPT`（读损坏）、`T07_INIT_REVISION_INVALID`、`T07_BATCH_MISMATCH`、`T07_STATE_ALREADY_EXISTS`、`T07_REVISION_CONFLICT`。恢复语义：损坏文件**拒绝续写**（抛错交上层处理，不静默重建）；CAS 冲突由调用方重读重试（推断-调用方行为）。无取消概念。

## 7. 权限与权威状态

无 sender/role 分支（Main 侧单进程写方；文件头 `:7` 声明 actor 由 Main 注入）；`revision` 是并发权威（乐观锁）；`assertSafeBatchId`（`./batch-store`）防路径注入（`:33`）。

## 8. 修改影响面

改信封/错误码影响 `review-v3-t07-main-service.ts`（持久化编排）与 `review-v3-t09-judge-adapter.ts`（离线回件读取）；`schemaVersion` 变更需迁移策略（当前不识别即 `undefined`→init 拒绝已有文件路径仅当合法 JSON）。

## 9. 测试证据

**无专属测试**（冻结树 glob `**/*t07-state-store*test*` 零命中）；`review-v3-t07-main-service.test.ts`（非本批）可能间接覆盖。全部分支无断言（NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出与错误码分支 | 已证实 | `:19-91` |
| 损坏抛 CORRUPT 不当空状态 | 已证实 | `:51-53` |
| tmp+rename 原子写、CAS 修订号 | 已证实 | `:36-41/:73-76` |
| 随机后缀 tmp 的并发安全性 | 推断 | `:37` 构造；未并发实测 |
| 调用方 CAS 重试行为 | 推断 | 未读 main-service 实现 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `readT07State`/`initT07State`/`writeT07State` | §3 | 43-91 | covered |
| `writeAtomic`/路径构造 | §3/§5 | 27-41 | covered |
| 测试断言 | §9 | — | unknown（无测试） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
