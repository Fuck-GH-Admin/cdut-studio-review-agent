---
path: apps/electron/src/renderer/components/agent/ContextMemoryToggleButton.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9b7d9af56cc1154ca2e773540f97389bcbffdb3a
sha256: 13c51c075ef0cf9371f2e6e469bfee69a77152bd16528d650adf04ff98e9cb7d
lines: 62
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ContextMemoryToggleButton.tsx

## 1. 结论与边界

上下文记忆开关（多轮/单轮模式切换）：纯受控展示组件（状态在父级），带 Tooltip 说明两种模式语义。无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ContextMemoryToggleButton` | React.FC | `:12-62` | `{disabled（true=已关记忆/单轮）; onToggle; isProcessing?}`（`:7` 注释口径） |

## 3. 内部逻辑与关键流程

- 按钮：onClick→onToggle；`isProcessing` 时 disabled+半透明；样式按 disabled 双态；aria-label 明示当前态（`:31`）。
- 图标：Brain + 关闭态斜杠覆盖（lucide 无 BrainOff，`:33` 注释）；文案“记忆关/开”（`sm:inline` 响应式）。
- Tooltip 顶置：disabled=“单轮聚焦模式（记忆已关闭）——发送时不携带前序问答，大幅降低 Token 消耗与费用，界面保留完整记录”；否则“多轮对话模式（记忆已开启）——保持上下文连续性”（`:44-58`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 输入区工具条。出向：`react`、`lucide-react`、`@/lib/utils.cn`、`@profer/ui/primitives/tooltip`。

## 5. 数据 I/O、读写与副作用

无（受控组件）。

## 6. 分支、失败、取消与恢复

仅 disabled/isProcessing 两组样式与文案分支。

## 7. 权限与权威状态

模式语义如实披露（“发送时不携带前序问答/费用”）；记忆开关真实生效在发送链路（本组件只控 UI）。

## 8. 修改影响面

改语义文案 → 影响用户对 Token/费用的理解；发送行为在父级/消息链路。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 受控+双态语义披露 | 已证实 | `:7/:31/:44-58` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ContextMemoryToggleButton` | 2/3 | `:12-62` | covered |
