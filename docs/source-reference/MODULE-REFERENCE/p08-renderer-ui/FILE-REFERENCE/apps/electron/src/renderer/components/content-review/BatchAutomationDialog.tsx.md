---
path: apps/electron/src/renderer/components/content-review/BatchAutomationDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c61288fff28aaac53fe51b98bc57b0c627dc060
sha256: b3332b29a23cc56b8389bf62cbeb178243d62b187791efc593ada45404daf822
lines: 68
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/BatchAutomationDialog.tsx

## 1. 结论与边界

**批次自动化策略对话框**（`apps/electron/src/renderer/components/content-review/BatchAutomationDialog.tsx`，68 行）：三档模式（assist/auto-return/auto-approve）+ 授权确认勾选。文案红线：每批次单独授权、改策略增加授权修订号使旧权限失效（`:37`）、自动通过需多条件齐备（`:49-50`）、**本机自动化记录为 system 来源不代表学校外部审批已授权**（`:50`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BatchAutomationDialog` | 组件 | `:7-68` | `{batch, onClose, onSaved}` |

## 3. 内部逻辑与关键流程

- 状态：`mode`（默认 `batch.automation?.mode ?? 'assist'`，`:14`）、`confirmed`、`busy`、`error`。
- `apply`（`:18-31`）：`window.reviewAPI.batchActionV2({action:'configure-automation', batchId, mode, confirmed: mode==='assist' || confirmed})`→`onSaved()`→`onClose()`；失败 `reviewBusinessError(cause)` 显示。
- 非 assist 模式显示授权勾选（`:52-57`）；按钮在非 assist 且未勾选时禁用（`:61`）。

## 4. 调用者与调用链

- 消费方：BatchPanel（批次操作）。
- 出向：`window.reviewAPI.batchActionV2`（preload→IPC）、`batch-ui-feedback.reviewBusinessError`。

## 5. 数据 I/O、读写与副作用

IPC 调用（`configure-automation`）；无本地存储。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| assist 模式 | `:24` | `confirmed` 自动 true |
| 非 assist 未勾选 | `:61` | 按钮禁用 |
| 调用失败 | `:28-29` | 显示业务错误 |
| busy 中关闭 | `:33` | 忽略 |

## 7. 权限与权威状态

**授权语义**：`confirmed` 是本地审核员显式授权（`:55`）；改策略增授权修订号、旧权限失效（`:37`）；system 来源≠学校授权（`:50`）——与主进程批次授权链（nb-13 系列的 CONFIRM_RULE_PACK）对应。

## 8. 修改影响面

- 三档模式名（`assist/auto-return/auto-approve`）是 `BatchAutomationMode` 契约。
- 授权文案改动影响合规披露。

## 9. 测试证据

无专属测试（全树检索 `BatchAutomationDialog` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、三档+授权勾选 | 已证实 | `:7-68` |
| system 来源披露/授权修订号语义 | 已证实（文案） | `:37`、`:50` |
| 主进程授权执行 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `BatchAutomationDialog` | `:7-68` | covered |
| 授权红线文案 | `:37-56` | covered |
