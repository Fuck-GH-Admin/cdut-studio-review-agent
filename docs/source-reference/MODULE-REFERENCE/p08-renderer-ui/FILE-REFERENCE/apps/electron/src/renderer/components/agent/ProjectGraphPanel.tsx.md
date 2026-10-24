---
path: apps/electron/src/renderer/components/agent/ProjectGraphPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a02086c4548329f44f7b3e90344dbcd8d77a2476
sha256: 99072d4f21db251a4b5e0dc183203cd9d436c007f89b5bc72aee72f88cce38c4
lines: 726
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ProjectGraphPanel.tsx

## 1. 结论与边界

**无界画板任务图可视化**（`apps/electron/src/renderer/components/agent/ProjectGraphPanel.tsx:2-5`，思维导图风格）：缩放（滚轮）/平移（拖拽）/节点选中；`TaskProgressLink` 的 Dialog 内容。**Harness snapshot 可选：缺 IPC 或账本安全保留现有图 UI**（`:109`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ProjectGraphPanel` | 组件 | `:480-726` | `{refreshVersion?}` 画板面板 |

内部：手动刷新按钮（`:439-441`，从会话 JSONL 重放持久化任务图，**纯读取不调 LLM**——枯枝 `@abandon`/删节点/改状态后同步）。

## 3. 内部逻辑与关键流程

- 画布交互（缩放/平移/选中）；任务图渲染（思维导图布局）。
- 手动刷新（`:439-441`）：**JSONL 重放持久化任务图，纯读取不调 LLM**。
- Harness snapshot 可选（`:109`）：缺 IPC/账本不破坏现有 UI。

## 4. 调用者与调用链

- 消费方：TaskProgressLink Dialog。
- 出向：会话 JSONL（读）、可选 Harness IPC。

## 5. 数据 I/O、读写与副作用

读 JSONL（刷新）；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 缺 Harness IPC/账本 | `:109` | 安全保留现有 UI |
| 刷新 | `:439-441` | 纯读取重放 |

## 7. 权限与权威状态

「纯读取不调 LLM」（`:441`）——刷新无副作用；任务图以持久化 JSONL 为准。

## 8. 修改影响面

- JSONL 任务图形状；画布交互。
- Harness snapshot 可选协议（`:109`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、画板/纯读刷新 | 已证实 | `:2-726` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ProjectGraphPanel` | `:480-726` | covered |
| 刷新/可选 snapshot | `:109`、`:439-441` | covered |
