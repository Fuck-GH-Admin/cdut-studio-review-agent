---
path: packages/ui/src/primitives/tooltip.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f0149814d8e7c3ca28ffef3db8ca0818e5c4539
sha256: 24eacfdfbfd957c32f005e9d739dc8643107ed6b948a76ee0d4d08ce26248fad
lines: 47
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/tooltip.tsx

## 1. 结论与边界

Radix Tooltip 的**纯 UI 样式包装**（文件头 `packages/ui/src/primitives/tooltip.tsx:1-6`）：悬停显示额外信息；Provider/Root/Trigger 原样别名 + Content 为 forwardRef 样式组件（Portal 包裹）。无状态逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TooltipProvider` | 导出常量 | 14 | `TooltipPrimitive.Provider` 别名 | |
| `Tooltip` | 导出常量 | 16 | `TooltipPrimitive.Root` 别名 | |
| `TooltipTrigger` | 导出常量 | 18 | `TooltipPrimitive.Trigger` 别名 | |
| `TooltipContent` | 导出组件 | 20-45 | `forwardRef<TooltipPrimitive.Content>`，`sideOffset = 4` 默认 | displayName 继承（`:45`） |

统一导出 `:47`。依赖 `@radix-ui/react-tooltip`、`../lib/cn`、`../lib/z-layers`（`Z_LAYER.tooltip`，定义 `packages/ui/src/lib/z-layers.ts:73` = `z-[10050]`，数值 `:46`）。

## 3. 内部逻辑与关键流程

`TooltipContent`（`:23-44`）：`TooltipPrimitive.Portal` 内 `Content`；类名组：`Z_LAYER.tooltip`（层级 10050）、`bg-tooltip/90 text-tooltip-foreground backdrop-blur-md`（深色毛玻璃，`:29-33` 注释）、进出动画（`animate-in fade-in-0 zoom-in-95` + `data-[state=closed]:animate-out …` + 四方向 slide（`:34-36`））、嵌套选择器 `[&_.text-muted-foreground]:text-tooltip-muted`（内部次要文字，`:38`）；`sideOffset` 默认 4、`className,...props` 透传。

## 4. 调用者与调用链

入向：**49 个消费文件**（冻结树检索 `primitives/tooltip`，单双引号）——本批使用面最广的基元。代表：`apps/electron/src/renderer/App.tsx:6`（TooltipProvider）、`agent/AgentMessages.tsx:39`、`diff/*`（12+ 文件）、`app-shell/left-sidebar/*`、`file-browser/*`、`planning/CalendarWorkspace.tsx:18`、`agent-skills/*` 等。出向：Radix、`cn`、`z-layers`。

## 5. 数据 I/O、读写与副作用

无（Portal 挂载 DOM 由 Radix 管理）。

## 6. 分支、失败、取消与恢复

仅 `sideOffset` 默认参数与样式态分支；无错误路径。

## 7. 权限与权威状态

无权限分支（纯展示）。层级权威=`Z_LAYER.tooltip`（`z-layers.ts:46/:73`，改层级需改该常量而非本文件）。

## 8. 修改影响面

样式/动画改动波及 49 个消费文件的提示外观；`Z_LAYER.tooltip` 与皮肤 CSS（`bg-tooltip/90` 等 token）耦合。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出与样式组 | 已证实 | `packages/ui/src/primitives/tooltip.tsx:14-47` |
| Z_LAYER.tooltip = z-[10050] | 已证实 | `packages/ui/src/lib/z-layers.ts:46/:73` |
| 49 个消费者 | 已证实 | 冻结树检索计数（单双引号） |
| 运行/动画表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | 14-47 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
