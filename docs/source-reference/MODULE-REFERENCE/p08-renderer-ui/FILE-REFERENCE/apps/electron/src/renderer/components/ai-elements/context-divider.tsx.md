---
path: apps/electron/src/renderer/components/ai-elements/context-divider.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c32675ac10495ebea457df074a2476803f42a351
sha256: daf6eb0553f4f233b16fbfe5255cc11c99f116f6f9702766d460b89c395de60d
lines: 58
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/context-divider.tsx

## 1. 结论与边界

**上下文分隔线**（58 行）：虚线+"清除上下文"标签+删除按钮；移植自 profer-frontend（`:2-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ContextDividerProps` | `:13-18` | `extends ComponentProps<'div'>` + `messageId: string` + `onDelete?(messageId)` |
| `ContextDivider` | `:20-58` | 三段布局：左虚线+中间（标签+ghost icon 按钮 `aria-label="删除分隔线"` `:48`，onClick `onDelete?.(messageId)`）+右虚线 |

## 3. 内部逻辑与关键流程

纯展示组件；删除语义在调用方回调。

## 4. 调用者与调用链

消息列表（conversation 区）；出向 `@profer/ui`（Button）、`lucide-react`。

## 5. 数据 I/O、读写与副作用

纯渲染；点击回调。

## 6. 分支、失败、取消与恢复

onDelete 可选（无回调时点击无操作）。

## 7. 权限与权威状态

messageId 为分隔线与消息的关联键（删除范围语义在调用方）。

## 8. 修改影响面

改组件影响上下文清除交互；messageId 键契约联动消息列表的分隔线删除语义，onDelete 回调签名变动会波及会话视图调用方。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 58 行全读 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
