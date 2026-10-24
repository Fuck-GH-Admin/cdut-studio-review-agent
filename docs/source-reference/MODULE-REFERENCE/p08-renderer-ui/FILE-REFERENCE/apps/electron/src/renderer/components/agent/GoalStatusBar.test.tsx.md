---
path: apps/electron/src/renderer/components/agent/GoalStatusBar.test.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fddcac9bf22dbaf7db8fb9e2be3d1c0f6c52705d
sha256: dc780a46e7c2d0f8025c9a785d3e4eeb0aeb99d46813110979b6796ebb4d7daa
lines: 72
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/GoalStatusBar.test.tsx

## 1. 测试目标

**Goal 状态栏渲染**（`apps/electron/src/renderer/components/agent/GoalStatusBar.test.tsx:21`）：恢复入口、预算耗尽语义、stopping 不伪装、耗时净执行、等待不伪装执行、轮次历史。

## 2. 用例清单

1 describe / **6 test**。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | blocked/failed/stopped 有恢复入口 | 三态恢复 | `:22-27` |
| 2 | 预算耗尽显示原因+预算编辑 | 非盲目恢复 | `:28-35` |
| 3 | stopping 不可再停/编辑不伪装结束 | 禁用+状态 | `:36-42` |
| 4 | 耗时累计净执行、同会话接续 | 口径断言 | `:43-48` |
| 5 | 等待空闲/交互不伪装执行 | 状态显示 | `:49-59` |
| 6 | 轮次历史失败/证据、归档可展开 | 历史显示 | `:60-71` |

（源文件 6 个 `test`，`:22-71`。）

## 3. 真实断言

（`:22-71` 断言组——六面。）

## 4. 未覆盖与脆弱点

- 未覆盖：Goal runtime 内部状态机。
- 脆弱点：状态文案断言。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例覆盖状态语义 | 已证实 | `:22-71` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 恢复/预算 | 1-2 | `:22-35` | covered |
| stopping/耗时 | 3-4 | `:36-48` | covered |
| 不伪装/历史 | 5-6 | `:49-71` | covered |
