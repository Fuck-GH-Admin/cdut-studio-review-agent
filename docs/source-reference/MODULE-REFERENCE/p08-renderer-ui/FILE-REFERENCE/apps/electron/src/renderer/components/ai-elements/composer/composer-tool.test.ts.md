---
path: apps/electron/src/renderer/components/ai-elements/composer/composer-tool.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5f97220201ee2867082fa9431150d2c74f33cf65
sha256: 26d7c152403de3506ec459cdcad87c8331ab14dcee16820fd9aeec5684628295
lines: 35
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/composer/composer-tool.test.ts

## 1. 测试目标

直接测试 `ComposerTool.tsx` 的**视觉契约**（1 个 describe `:8`）：唯一尺寸、五态共享 hover/focus/disabled、语义态不换底材、语义态前景区分。4 个 `test(`。

## 2. 用例清单

| # | 行 | 真实断言 |
| --- | --- | --- |
| 1 | `:9-11` | `getAgentComposerToolSize()` `toBe('size-[36px]')`（唯一规范尺寸） |
| 2 | `:13-21` | 五态循环：`toContain` BASE_CLASS/hover:bg-accent/focus-visible:ring-2/disabled:opacity-40 |
| 3 | `:23-27` | `not.toContain` active 的 hover:bg-primary/10、warning 的 hover:bg-amber-500/10、destructive 的 hover:bg-destructive/10（**语态不得换底材**） |
| 4 | `:29-34` | 语态前景 `toContain` text-primary/text-amber-600/text-muted-foreground/text-destructive |

## 3. 真实断言

`toBe`/`toContain`/`not.toContain`（类名字符串契约）。无快照测试、无 mock。

## 4. 未覆盖

- `AgentComposerToolTrigger/Popover/MenuItem` 组件渲染行为（仅类名工厂）。
- default 态前景、className 合并优先级。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（35 行） |
| 底材契约锁定 | 已证实 | 用例 3 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 唯一尺寸 | §2 用例 1 | `:9-11` | covered |
| 共享底材 | §2 用例 2/3 | `:13-27` | covered |
| 语态前景 | §2 用例 4 | `:29-34` | covered |
| §4 边缘 | — | — | unknown |
