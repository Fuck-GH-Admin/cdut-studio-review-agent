---
path: apps/electron/src/renderer/lib/lowlight.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 016348f88166dd48d2d05fa28080f397c1c26761
sha256: 4edecc96130564eb2e919b14083b1faa0968974da7498601721bef61f2d87e7f
lines: 10
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/lowlight.ts

## 1. 结论与边界

**共享 lowlight 单例**（10 行）："任何使用 `@tiptap/extension-code-block-lowlight` 的 TipTap 编辑器都应从这里 import，避免重复创建实例并加载相同的语法包"（`:2-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `lowlight` | `:10` | `createLowlight(common)` 单例（common 语法包） |

## 3. 内部逻辑与关键流程

模块级单例创建。

## 4. 调用者与调用链

`apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx`（`apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:358-363` CodeBlockLowlight，同批 nb-107）等 TipTap 编辑器；出向 `lowlight` 包。

## 5. 数据 I/O、读写与副作用

加载 common 语法包（内存）。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

单例契约（防重复加载）。

## 8. 修改影响面

改动影响全部 TipTap 代码块高亮与内存占用。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 10 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
