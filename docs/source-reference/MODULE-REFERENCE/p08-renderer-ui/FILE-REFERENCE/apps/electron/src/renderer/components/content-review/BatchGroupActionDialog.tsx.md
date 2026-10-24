---
path: apps/electron/src/renderer/components/content-review/BatchGroupActionDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c3d0b4c5a636321fb761f913c73ab3226b3aa267
sha256: 0f049a5ef46f2afa62e524fcd54a6fdc9aba30a88d5b4d2cbee89aa6bfae8e5c
lines: 160
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/BatchGroupActionDialog.tsx

## 1. 结论与边界

**本地人工批量组动作对话框**（`apps/electron/src/renderer/components/content-review/BatchGroupActionDialog.tsx:1`）：**预览→显式确认→逐案结果** 三段式。本地人工群组动作的合规入口。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BatchGroupActionDialog` | 组件 | `:17-160` | 批量组动作（预览/确认/结果） |

## 3. 内部逻辑与关键流程

1. **预览**（`:48`）：`window.reviewAPI.previewBatchGroupV2(payload())`——先看影响面。
2. **显式确认**：用户确认后才应用。
3. **应用**（`:60`）：`window.reviewAPI.applyBatchGroupV2({…})`——逐案结果展示。

三段式保证「批量操作先预览再确认」（本地人工群组动作红线）。

## 4. 调用者与调用链

- 消费方：BatchPanel（组动作入口）。
- 出向：`window.reviewAPI.previewBatchGroupV2`/`applyBatchGroupV2`（IPC）。

## 5. 数据 I/O、读写与副作用

IPC 预览/应用（主进程执行逐案事务）；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 预览失败 | `:48` | 错误显示 |
| 未确认 | — | 不应用 |
| 应用失败 | `:60` | 逐案错误展示 |

## 7. 权限与权威状态

**显式确认**是应用前提（`:1` 注释）；本地人工身份（与 BatchAutomationDialog 的 system 来源区分）。

## 8. 修改影响面

- `previewBatchGroupV2`/`applyBatchGroupV2` IPC 契约。
- 预览-确认-结果三段式改动影响批量合规。

## 9. 测试证据

无专属测试（全树检索 `BatchGroupActionDialog` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、三段式 | 已证实 | `:1`、`:48`、`:60` |
| 主进程逐案执行 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `BatchGroupActionDialog` | `:17-160` | covered |
| 预览/确认/应用 | `:48-70` | covered |
