---
path: apps/electron/src/renderer/components/diff/QuotedSelectionChip.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c8d96456e3f90ce9592f717778beb935d046e617
sha256: 5bfae0864510e407d42b9a66ed67b6286bf50993aa913cd48c74a0933d305c53
lines: 148
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/QuotedSelectionChip.tsx

## 1. 结论与边界

Agent 输入框上方的 Chip 标签（纯展示）：`quote` 变体展示预览面板选中文本+来源文件（primary 视觉）；`interruption` 变体展示任务中断说明（按中断类型配色，悬停提示「中断原因」）；两者都可点 X 移除（`apps/electron/src/renderer/components/diff/QuotedSelectionChip.tsx:1-8`）。

边界：

- 不管理引用/中断数据的产生与清除（由 AgentView 状态持有）；仅展示 + `onRemove` 回调。
- 截断只做视觉展示（原数据不变）；无 Markdown 渲染。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `QuotedSelectionChip` | 函数（导出） | 70-148 | `({text,filePath,onRemove,variant?,interruptionTone?,description?,tooltip?,className?}) => React.ReactElement` | Chip 本体 |
| `QuotedSelectionChipProps` | 内部接口 | 17-33 | 8 字段（text/filePath/onRemove/variant/interruptionTone/description/tooltip/className） | props |
| `INTERRUPTION_TONE_STYLES` | 内部常量 | 36-55 | `Record<AgentInterruptionTone, {container,icon,text}>` | amber/red/muted 三基调 |
| `truncateText` | 内部函数 | 57-62 | `(text, maxLen=80) => string` | 空白折叠后超长 `slice(0,maxLen-3)+'...'` |
| `truncatePath` | 内部函数 | 64-68 | `(filePath, maxLen=40) => string` | 超长 → `'.../'+basename` |
| `handleRemoveClick` | 内部（useCallback） | 80-83 | `(e) => void` | `stopPropagation()` + `onRemove()` |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/QuotedSelectionChip.tsx:70-148`：

1. `isInterruption = variant === 'interruption'`；`toneStyles = INTERRUPTION_TONE_STYLES[interruptionTone]`（缺省 `amber`，`:75,85-86`）。
2. 容器（`:88-99`）：interruption 用 tone 容器色（`:94-95`），quote 用 `bg-primary/8 border-primary/20`（`:96`）。
3. 图标（`:100-104`）：interruption → `Info`（tone 图标色）；quote → `Quote`（旋转 180°）。
4. 主文案：`truncateText(text)` 两行截断（`:106-108`）。
5. 副文案三分支（`:109-117`）：interruption 且有 `description` → 渲染 description；quote → 渲染 `truncatePath(filePath)`；interruption 无 description → null。
6. 移除按钮（`:119-132`）：绝对定位右上、默认 `opacity-0` 悬停显形（`:126`）；`aria-label` 按变体（`:129`）。
7. `tooltip` 有值时整体包 `Tooltip`（`:136-145`），否则直接返回 chip（`:147`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/agent/AgentView.tsx:44`（import）、`AgentView.tsx:3495`（quote 变体：`text/filePath/onRemove={handleRemoveQuotedSelection}`）、`AgentView.tsx:3502`（interruption 变体：`interruptionTone={getAgentInterruptionTone(reason)}`、`tooltip='中断原因'`、`description='中断原因'`、`text/filePath=中断 label`、`onRemove={handleRemoveInterruption}`，且仅 `currentAgentInterruption && !streaming && !streamState?.stopping` 时挂载）。无测试引用（见 §9）。

出向：`@/lib/file-utils`（`getFileBaseName`）、`@/atoms/preview-atoms`（`AgentInterruptionTone` 类型）、`@profer/ui/primitives/tooltip`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

- 无 IPC/磁盘/网络；纯展示组件。
- 副作用：`onRemove` 回调（经 `stopPropagation` 防冒泡，`:80-83`）；样式悬停过渡。
- 状态：无本地 state。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| variant=quote（缺省） | 74,96,103,113-116 | primary 视觉 + 路径副文案 |
| variant=interruption + description | 100-101,109-112 | tone 视觉 + description 副文案 |
| variant=interruption 无 description | 117 | 副文案 null |
| `tooltip` 有值/无值 | 136-147 | 包/不包 Tooltip |

- 无异步、无 throw；无失败/恢复语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC。`interruptionTone` 权威映射函数（`getAgentInterruptionTone`）在 AgentView 侧；本组件只消费枚举值。

## 8. 修改影响面

- 改 props 契约影响 `AgentView.tsx:3495,3502` 两处挂载。
- 改 `AgentInterruptionTone` 枚举需同步 `INTERRUPTION_TONE_STYLES` 的 `Record` 全覆盖（编译期锁定）。
- 改截断规则影响长引用/长路径的视觉。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `QuotedSelectionChip` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：两变体渲染、三 tone、截断规则、移除回调均无自动化断言。维护者验证：预览选中文本引用、触发任务中断，验证 Chip 外观与移除。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:70`） |
| 副文案三分支 | 已证实 | `:109-117` |
| 移除按钮 stopPropagation | 已证实 | `:80-83` |
| tone 映射 amber/red/muted | 已证实 | `:36-55` |
| 两个调用点（quote/interruption） | 已证实（检索） | `AgentView.tsx:3495,3502` |
| truncation 80/40 规则 | 已证实 | `:57-68` |
| AgentView 的 tone 派生逻辑 | 未知 | 文件外（`getAgentInterruptionTone` 未逐行读） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `QuotedSelectionChip` | §3 | 70-148 | covered |
| `INTERRUPTION_TONE_STYLES` | §2,§3 | 36-55 | covered |
| `truncateText`/`truncatePath` | §2 | 57-68 | covered |
| 副文案分支 | §3,§6 | 109-117 | covered |
| 移除按钮 | §3 | 119-132 | covered |
| Tooltip 包裹 | §3,§6 | 136-147 | covered |
| 测试 | §9 | — | unknown |
