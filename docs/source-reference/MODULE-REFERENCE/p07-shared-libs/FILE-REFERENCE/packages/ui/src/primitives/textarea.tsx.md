---
path: packages/ui/src/primitives/textarea.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: edbc9448b904c7ff6e43be510b04110f199b3dc8
sha256: edc5f6c0ccd57f84a2f1a049222462691afd8f4f501c5f2ebdd4ade97388ac37
lines: 28
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/textarea.tsx

## 1. 结论与边界

原生 `<textarea>` 的**纯 UI 样式包装**（forwardRef）：与 Input 同款 hairline 边框 + 双层 focus glow，仅高度/最小高度不同（注释 `packages/ui/src/primitives/textarea.tsx:10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Textarea` | 导出组件 | 5-26 | `forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>` | 唯一导出（`:28`） |

`Textarea.displayName = 'Textarea'`（`:26`）。依赖 `../lib/cn`（`:3`）。

## 3. 内部逻辑与关键流程

单 JSX（`:7-23`）：固定样式段 `min-h-[60px] w-full rounded-md border-surface-border/60 bg-input/40 …`（`:11-17`），含 hover（`border-surface-border-strong bg-input-hover/50`）、focus-visible（`border-focus ring-4 ring-focus/15`）、disabled（`cursor-not-allowed opacity-50`）、断点 `md:text-sm`；`ref`/`props` 全透传（`:20-21`）。

## 4. 调用者与调用链

入向：8 个消费文件（冻结树检索），如 `agent-skills/AgentPresetSettings.tsx:26`、`CreateGlobalSkillDialog.tsx:7`、`CreateWorkspaceSkillDialog.tsx:7`、`agent/GoalStatusBar.tsx:13`、`content-review/AssistantDrawer.tsx:18`、`planning/CalendarWorkspace.tsx:16` 等。出向：`cn`。

## 5. 数据 I/O、读写与副作用

无（受控值/变更由调用方 props 处理）。

## 6. 分支、失败、取消与恢复

仅样式态分支（hover/focus/disabled）；无错误路径。

## 7. 权限与权威状态

无权限分支（纯展示输入框）。

## 8. 修改影响面

样式改动影响 8 个表单界面；与 `input.tsx` 的样式约定耦合（注释自述同款风格，改一侧需同步另一侧——推断-注释）。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出与样式段 | 已证实 | `packages/ui/src/primitives/textarea.tsx:5-28` |
| 8 个消费者 | 已证实 | §4 检索 |
| 与 input.tsx 同款约定 | 推断 | `:10` 注释；input.tsx 未逐行核 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Textarea` | §2/§3 | 5-28 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
