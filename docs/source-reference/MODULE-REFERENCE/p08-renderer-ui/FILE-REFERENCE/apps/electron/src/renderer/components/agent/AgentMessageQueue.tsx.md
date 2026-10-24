---
path: apps/electron/src/renderer/components/agent/AgentMessageQueue.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5d22748515d3d824e56082653f757b38032b02d
sha256: 059fb724d9a4ba13863bb63abf9a690e725df97d7f18a0e636ce66123619e502
lines: 212
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentMessageQueue.tsx

## 1. 结论与边界

Agent 消息队列面板：排队消息列表（引用/正文/操作）+ 自动发送开关 + 拖拽排序。受控组件（队列状态与动作全部在父级，本组件只管呈现与手势）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentMessageQueue` | function 组件 | `:20-173` | `({items, canSendNow, autoSend, onToggleAutoSend, onSendNow, onRecall, onRemove, onMove})`（`:8-18` Props） |
| `QueueIconButton` | function 组件（内部） | `:183-212` | 带 Tooltip 的图标按钮（danger 变体红色 hover） |

内部状态：`draggingId/dropTarget`（`:30-31`）；`resolvePlacement`（`:35-38`，中线以上 before/以下 after）；`handleDragOver/handleDrop`（`:40-60`）。

## 3. 内部逻辑与关键流程

- 空队列 → null（`:33`）。
- **拖拽排序**：行 `draggable`（dragStart 记 id+`effectAllowed:'move'`；dragOver 计算落点指示（before/after 高亮条 `:131-132`）；drop → `onMove(draggingId, targetId, placement)`；dragEnd 清态）。外层容器 drag 事件 stopPropagation 防泄漏到宿主（`:65-71`）。
- **头部**：Clock3“队列”+ 自动发送开关（`role="switch"`/`aria-checked`，title 明示语义“本轮结束自动发送队首/需手动逐条”）+ 计数。
- **行**：队首高亮（`index===0`）；引用行（Quote 图标+`sourceLabel ?? filePath`）+正文 `line-clamp-2`；三操作按钮：立即发送（`disabled={!canSendNow}`）/撤回到输入框/删除（danger）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 输入区上方（队列宿主）。出向：`@profer/ui`（Button/Tooltip）、`@/lib/agent-message-queue`（`AgentQueuedMessage`/`QueueDropPlacement` 类型）、`lucide-react`、`@/lib/utils.cn`。

## 5. 数据 I/O、读写与副作用

无 I/O（手势回调透传父级）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空队列 | `:33` | null |
| 自拖/无拖拽 dragOver | `:45/:56` | 忽略 |
| canSendNow=false | `:148` | 立即发送禁用 |

## 7. 权限与权威状态

无权限语义；发送能力由 `canSendNow`（父级判定）门禁；自动发送语义经 title/switch 如实披露。

## 8. 修改影响面

改手势/布局 → 影响队列交互；`AgentQueuedMessage` 契约联动 `@/lib/agent-message-queue`。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 受控+空不渲染 | 已证实 | `:8-33` |
| 拖拽 before/after 指示+onMove | 已证实 | `:35-60/:131-132` |
| 自动发送 switch 语义披露 | 已证实 | `:79-97` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentMessageQueue` | 2/3 | `:20-173` | covered |
| `QueueIconButton` | 2 | `:183-212` | covered |
