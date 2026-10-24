---
path: apps/electron/src/main/lib/pi-harness/reconciler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3fdb496f3f7ed8838c75e9eaf039a9bb8a513f4d
sha256: 4dc3188acb900024523f207daa84cc9f5e024ee3c14c72912735731f794fc78b
lines: 26
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/reconciler.ts

## 1. 结论与边界

**证据/验证对账**（26 行薄文件）：只对账单个聚焦任务，**绝不改 Project Graph 任务状态**（`reconciler.ts:5`）。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：2 个。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `reconcileFocusedTask` | 函数 | `:6` | `({graph,taskId?,facts,previous?}): VerificationDecision\|undefined`——无 taskId/任务不存在→undefined（`:12-14`）；否则委托 `evaluateVerification` |
| `shouldPersistVerificationDecision` | 函数 | `:18` | 持久化判重：无 previous→true；state/reason 变→true；evidenceFactIds 长度或逐位变→true，否则 false |

## 3. 内部逻辑与关键流程

见 §2（两函数直判定）。

## 4. 调用者与调用链

- 入向：`orchestrator-bridge.ts:9`（本批，settle 时 `reconcileAndRecordShadow`）、`evals/replay.ts:4`（本批）。
- 出向：`./verification-evaluator`（**域外**：evaluateVerification 实现未在本批）、`./types`（**域外** pi-harness/types.ts，194 行背景件）、`@profer/project-core`。

## 5. 数据 I/O、读写与副作用

无（纯判定；持久化由调用方决定）。

## 6. 分支、失败、取消与恢复

undefined 三分支 + 判重四分支；无抛错。

## 7. 权限与权威状态

验证状态权威=`VerificationDecision`（evaluation 归域外 evaluator）；“不改 Graph”为本文件不变量。

## 8. 修改影响面

settle 时证据对账与 shadow 候选前置；`shouldPersist` 防事件膨胀。

## 9. 测试证据

`NOT_RUN`。直接测试：无专属文件（检索 nb-56 8 测试文件 grep 本文件 0 命中）；间接：`orchestrator-bridge.test.ts` 3 用例走真实 reconcile（verified/failed 归因）、`evals/replay.test.ts` fixture 覆盖。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出语义 | 已证实 | `:1-26` 全文 |
| `evaluateVerification` 行为 | 边界 | verification-evaluator 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | 6-25 | covered |
