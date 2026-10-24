---
path: apps/electron/src/renderer/components/ai-elements/composer/ComposerTool.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7126aea2d7199fb3ddeec8da9dd91ad0a0edcd80
sha256: 5477870ed147c706965c64e8f8be90a3a9b8a76eaf880e8053a3da6ed7076464
lines: 169
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/composer/ComposerTool.tsx

## 1. 结论与边界

Agent Composer **唯一交互外壳**（169 行）："领域组件只提供内容、业务状态和事件；尺寸、hover、焦点、禁用态、Tooltip、Popover 定位与菜单行不允许在各工具内重复定义"（`:8-11`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AgentComposerToolState` | `:13` | 'default'\|'active'\|'warning'\|'muted'\|'destructive' |
| `AgentComposerToolPlacement` | `:14` | 'toolbar'\|'overflow' |
| `AGENT_COMPOSER_TOOL_BASE_CLASS` | `:16-23` | 共享底材（**语义状态只能改前景不改底材** `:17-18` 注释；rounded-md 统一壳 `:19`） |
| `getAgentComposerToolSize` | `:33-35` | 'size-[36px]' |
| `getAgentComposerToolTriggerClass` | `:37-47` | 基类+尺寸+STATE_CLASS+外类合并 |
| `AgentComposerToolTooltip` | `:55-64` | 统一 Tooltip（side top/offset 8） |
| `AgentComposerToolTrigger` | `:77-100` | **forwardRef 唯一按钮壳**（`:74-75` 注释：Radix asChild 转发必要条件） |
| `AgentComposerToolPopover` | `:115-141` | 统一 Popover（side top、防自动抢焦点 `:134-135`） |
| `AgentComposerToolMenuItem` | `:149-169` | 唯一菜单行（selected 高亮） |

内部：`STATE_CLASS:25-31`（五态前景色）。

## 3. 内部逻辑与关键流程

类名工厂+三壳组件（Trigger/Popover/MenuItem）+统一 Tooltip；纯组合无状态。

## 4. 调用者与调用链

输入框工具族（模型选择/附件/上下文等 Composer 工具）；被 `composer-tool.test.ts`（4 用例视觉契约）锁定。出向 `@profer/ui`（Button/Popover/Tooltip）。

## 5. 数据 I/O、读写与副作用

纯渲染。

## 6. 分支、失败、取消与恢复

tooltip 可选分支；Popover 焦点抑制。

## 7. 权限与权威状态

**视觉契约红线**（`:17-18`）：所有状态共享同一 surface hover，语义状态只改前景——测试逐态锁定（`not.toContain` 各态专属 hover 材质）。

## 8. 修改影响面

改底材/尺寸影响全部 composer 工具一致性；测试 4 用例锁契约。

## 9. 测试证据

`composer-tool.test.ts`（同批，4 个 `test(`）：36px 唯一尺寸、五态共享 hover/focus/disabled、语态不换底材、语态前景区分。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 8 导出/视觉契约 | 已证实 | 169 行全读 |
| 五态契约 | 已证实 | 测试 4 用例（同批） |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
