---
path: packages/ui/src/primitives/switch.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a2cdfdc839cea2fcb1dc49e6a9f9d40b3b972c2
sha256: c38f88259336291dfd6edb74b29647394d4cfd1f44035325a20c59da3f44a135
lines: 29
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/switch.tsx

## 1. 结论与边界

Radix Switch 的**纯 UI 样式包装**（`"use client"` + forwardRef）：Root+Thumb 组合与皮肤 token 类名，无逻辑/状态。受控语义（checked/onCheckedChange）透传 Radix。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Switch` | 导出组件 | 8-27 | `forwardRef<SwitchPrimitives.Root>` | 唯一导出（`:29`） |

`Switch.displayName = SwitchPrimitives.Root.displayName`（`:27`）。依赖 `@radix-ui/react-switch`、`../lib/cn`（`:3-6`）。

## 3. 内部逻辑与关键流程

单 JSX（`:11-25`）：Root `h-5 w-9 rounded-full`，`data-[state=checked]:bg-primary`/`data-[state=unchecked]:bg-input`（`:14`），disabled 态 `cursor-not-allowed opacity-50`；Thumb `h-4 w-4`，`data-[state=checked]:translate-x-4`/`unchecked:translate-x-0`（`:22`）。

## 4. 调用者与调用链

入向：12 个消费文件（冻结树检索），如 `apps/electron/src/renderer/components/agent-skills/AgentPresetSettings.tsx:27`、`McpCard.tsx:9`、`SkillCard.tsx:15`、`SkillDetailSheet.tsx:16`、`agent/AgentView.tsx:52`、`agent/ContextUsageBadge.tsx:17`、`agent/PresetSelector.tsx:15`、`automation/AutomationFormView.tsx:18` 等（设置开关类 UI）。出向：Radix、`cn`。

## 5. 数据 I/O、读写与副作用

无（受控组件，状态由调用方持有）。

## 6. 分支、失败、取消与恢复

仅 checked/unchecked/disabled 样式分支；无错误路径。

## 7. 权限与权威状态

无权限分支（展示组件；开关背后的写权限由调用方/IPC 层决定）。

## 8. 修改影响面

类名/尺寸改动影响 12 个设置界面的开关外观；displayName 改动影响 DevTools 显示。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出与样式分支 | 已证实 | `packages/ui/src/primitives/switch.tsx:8-29` |
| 12 个消费者 | 已证实 | §4 检索（单双引号） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Switch` | §2/§3 | 8-29 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
