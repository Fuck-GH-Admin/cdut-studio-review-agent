---
path: apps/electron/src/renderer/components/agent/tool-result-renderers/grep-preview.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 316e5cf05412df42a8199016c630758df49697c2
sha256: d5fa724fe1e66448ae155bfebce2323f3d4be3fc841f22c8bb91084973195a2c
lines: 42
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-result-renderers/grep-preview.test.ts

## 1. 测试目标

直接测试 `grep-preview.ts` 的 `limitGrepGroupsForPreview` 收敛契约（1 个 describe `:16`）：渲染量上界、隐藏计数、组中截断。4 个 `test(`（Given/When/Then 命名）。纯函数无 mock。

## 2. 用例清单

helper `makeGroups:5-14`（按匹配条数构造分组）。

| # | 行 | Given/When/Then | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:17-22` | 未折叠收敛 | `slice.groups toBe(groups)`（同引用）；`hiddenMatches toBe(0)` |
| 2 | `:24-29` | 折叠 360 条超 200 上限 | 渲染合计 `toBe(GREP_PREVIEW_MATCH_LIMIT)`（200）；`hiddenMatches toBe(160)` |
| 3 | `:31-35` | 折叠 20 条在上限内 | `toHaveLength(2)`；hidden 0 |
| 4 | `:37-41` | 自定义 limit=150 截断落组中 | 长度 `toEqual([100, 50])`；hidden `toBe(50)` |

## 3. 真实断言

`toBe`（同引用/精确数）/`toHaveLength`/`toEqual` 数组全等。无快照测试。

## 4. 未覆盖

- limit=0/负数、空 groups、单组整除边界。
- `collapsed=false` 时 limit 参数忽略语义（用例 1 隐含）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（42 行） |
| 渲染量上界锁定 | 已证实 | 用例 2/4 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 未折叠原样 | §2 用例 1 | `:17-22` | covered |
| 超限收敛 | §2 用例 2 | `:24-29` | covered |
| 限额内 | §2 用例 3 | `:31-35` | covered |
| 组中截断 | §2 用例 4 | `:37-41` | covered |
| §4 边缘 | — | — | unknown |
