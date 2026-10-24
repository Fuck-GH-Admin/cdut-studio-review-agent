---
path: apps/electron/src/renderer/components/content-review/batch-ui-feedback.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5872b0e1c29ebed43ecfb0f5ebb1c3cb7ce2dc04
sha256: 341295529bf3d51dba1cad6376ef0dc58aaa0ff6f6d0a924df73b349763688f3
lines: 51
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/batch-ui-feedback.ts

## 1. 结论与边界

**批量执行反馈语义工具**（`batch-ui-feedback.ts:3` 注释）：**Electron 传输包装是实现细节，不是用户可见原因**；区分「本 Run 已应用的自动决定」与「重新入队后的历史回执」（`:34`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `reviewBusinessError` | function（export） | `:4-9` | 剥 IPC 包装前缀+重复 'Error:' 前缀，保留业务原因；空→兜底文案 |
| `BatchExecutionSummary` | interface（export） | `:11-17` | completed/failed/pending/needsHuman/technical |
| `summarizeBatchExecution` | function（export） | `:19-32` | 按 case 状态+triage 路由汇总（§3） |
| `batchAutomationDisplay` | function（export） | `:35-51` | 自动化回执展示（§3） |

## 3. 内部逻辑与关键流程

1. `reviewBusinessError`（`:4-9`）：两次 replace（`Error invoking remote method '…': ` 前缀 `:6`、重复 Error 前缀 `:7`）。
2. `summarizeBatchExecution`（`:19-32`）：completed=done 数；failed/pending（queued/running/paused）；**needsHuman=done 且路由 ∈ {manual-review, auto-return-candidate, auto-pass-candidate}**（**:28-29，检查成功≠业务批准**）；technical=done 且 technical-exception（仅算已完成的，`:30`）。
3. `batchAutomationDisplay`（`:35-51`）：**isCurrent=done+receipt.runId===latestRunId+业务阶段已落（decided/awaiting-supplement/archived）**（`:42-43`）→「已自动…（业务已写入）」；否则 queued+有回执→「待本轮重新审核」+历史行（`:48-49`）；历史行独立附加。

## 4. 调用者与调用链

入向：批量执行 UI（跨文件）。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

不适用（纯映射）。

## 7. 权限与权威状态

语义红线：IPC 包装不可见（`:3`）；本 Run 决定≠历史回执（`:34`）；检查成功≠业务批准（测试 `:31` 锁定）。

## 8. 修改影响面

改语义 → 批量反馈文案与自动化状态可信度；3 用例锁定。

## 9. 测试证据

**直接测试 `batch-ui-feedback.test.ts`（3 用例，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+三语义 | 已证实 | 逐行读 `:1-51` |
| 测试 3 用例断言 | 已证实 | 测试文件；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | `:4-51` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
