---
path: apps/electron/src/renderer/components/cdut-science/CsLabRenameLabDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bfe0fa9120cb5a46619c97062fb055fcf8b8258a
sha256: 84dcb5511ab945ba6f25a8725a3fcac5e1d39d22248c4fe06843cedf2e9b9f85
lines: 142
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabRenameLabDialog.tsx

## 1. 结论与边界

重命名实验室对话框（头注释 :2-6）：**仅改展示名称，沙箱目录/labId/历史数据不变**（:4 语义契约）。

## 2. 导出与关键符号

导出 1 条（`export` :25）：`CsLabRenameLabDialog({lab, onClose, onRenamed})`（:25-142）。状态：name/submitting/error/inputRef（:30-33）。

## 3. 内部逻辑与关键流程

lab 变化重置+30ms 延迟聚焦选中（:35-45，避开 Dialog 动画）；`handleSubmit`（:47-69）：空名拒（:50-53）、**同名直接关闭**（:54-57）、`window.electronAPI.cslab.renameLab`（:61）成功→onRenamed+close、失败→setError（:64-65）；**拼音 IME 回车选词不提交**（:103-108 注释）；maxLength 60（:109）；submitting 中禁关闭（:75）。

## 4. 调用者与调用链

入向（子agent 交叉核）：唯一 `CsLabPreparationView.tsx:52` → :572。出向：`@profer/ui/primitives/dialog`；electronAPI cslab.renameLab :61。

## 5. 数据 I/O、读写与副作用

renameLab IPC（改清单展示名）。

## 6. 分支、失败、取消与恢复

空名/同名/失败三分支（:50-65）；submitting 防重（:48/:75）。不适用取消/恢复。

## 7. 权限与权威状态

「仅展示名」契约（:4/:84）：labId/沙箱不变为权威。

## 8. 修改影响面

- 消费面：实验室清单重命名入口。
- 依赖面：electronAPI.cslab.renameLab 契约。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；同名短路+IME 防误触 | 已证实 | :54-57/:103-108 |
| 通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+提交链 | §2/§3 | :47-142 | covered |
