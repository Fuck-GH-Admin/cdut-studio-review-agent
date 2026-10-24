---
path: apps/electron/src/main/lib/review/material-lifecycle-v3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d8534c0d7a52b15cb69fe1e1a4e82d2e7a8186f3
sha256: cfd6ac55b2d4d5345c96e83090cb254c38c3c041cac6beacbfee5604afa041da
lines: 39
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/material-lifecycle-v3.ts

## 1. 结论与边界

Dev-C C1 原生 V2 CaseAggregate 的材料退役命令（文件头 `:1-5`）：**内部业务命令**，不是新的渲染层写 IPC；Main 暴露类型化意图前必须先供可信 Principal。单一命令 `archiveMaterialVersionV3`：归档当前版本而不删字节、读取回执或来源历史。运行时模块（经 `submitCommand` 事务）。

不做的事：不删材料字节/回执/历史（`mutate` 只置 `active:false`）；不做撤效算法（`revokeCurrentSourceValidity`）；无 IPC 接线。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ArchiveMaterialVersionPayload` | interface | `:10-13` | `{documentVersionId: string; reason: string}` |
| `archiveMaterialVersionV3` | function | `:16-39` | `(caseId, command{requestId, actor, expectedRevision, payload}) => Promise<ReviewCommandResult<DocumentVersion>>`；命令 type `ArchiveMaterialVersion` |

## 3. 内部逻辑与关键流程

事务 handler 顺序（`:21-37`）：

1. `stage==='archived'` → `INVALID_TRANSITION('已关闭案卷不能操作材料')`（`:22-24`）。
2. `documentVersionId` 须命中某版本，否则 `NOT_FOUND('材料版本不存在')`（`:25-26`）。
3. `active===false` → `INVALID_TRANSITION('材料版本已归档')`（`:27`）。
4. `reason` trim 非空，否则 `VALIDATION_FAILED('归档材料必须记录原因')`（`:28`）。
5. summary `归档当前材料 {versionId}：{reason}`（`:30`）。
6. mutate（`:31-36`）：命中版本置 `active:false`；`revokeCurrentSourceValidity(draft, Set([versionId]), 'archive')` 同事务撤效；返回该版本（归档后的 DocumentVersion）作为 entity。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）：`archiveMaterialVersionV3` 的 import/调用仅测试文件 `material-lifecycle-v3.test.ts` 与本文件——**生产调用点在冻结树未接入**（Main 尚未暴露 typed intent，与文件头“Main 必须先供可信 Principal”一致）。出向：`case-store-v2.{CommandValidationError,submitCommand}`、`source-current-validity-v3.revokeCurrentSourceValidity`。

## 5. 数据 I/O、读写与副作用

仅经 `submitCommand` 写 `state.v2.json`（CAS+幂等回执）；撤效与归档同一事务（原子）；无网络/日志。

## 6. 分支、失败、取消与恢复

四类失败见 §3（INVALID_TRANSITION×2、NOT_FOUND、VALIDATION_FAILED），均不落盘。无取消/恢复概念（依赖 `case-store-v2` 事务语义）。

## 7. 权限与权威状态

无 actor 校验分支（actor 由命令携带，事务层记录）；文件头声明 Main 暴露前须供可信 Principal（消费端义务）。权威状态：`documents[].active` 与 `sourceValidityRevocations` 同事务更新。

## 8. 修改影响面

改 payload/门槛 → 影响未来 Main typed intent 与测试；撤效语义联动 `source-current-validity-v3`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `material-lifecycle-v3.test.ts`（详见该测试手册）；本文件行为以静态阅读为准。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 内部命令、非渲染 IPC | 已证实 | 文件头 `:1-5` |
| 归档保留字节/回执/历史，同事务撤效 | 已证实 | `:31-36` |
| 四类失败门槛 | 已证实 | `:22-28` |
| 生产未接入（仅测试调用） | 已证实 | 全冻结树检索 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ArchiveMaterialVersionPayload` | 2 | `:10-13` | covered |
| `archiveMaterialVersionV3` 四门槛 | 3 | `:21-28` | covered |
| mutate 归档+撤效 | 3 | `:31-36` | covered |
| 调用面 | 4 | — | 已证实缺失（检索） |
