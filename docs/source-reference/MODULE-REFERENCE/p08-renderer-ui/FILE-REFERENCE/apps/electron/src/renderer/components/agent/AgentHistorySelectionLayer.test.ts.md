---
path: apps/electron/src/renderer/components/agent/AgentHistorySelectionLayer.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c07d5fa687b90d21ed3ef86a5083fd8f83e3453
sha256: 413b89745754e47fcfcec2b6eecc9c0402edb834aa6edfbee2bfb6f04427b566
lines: 34
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentHistorySelectionLayer.test.ts

## 1. 测试目标

`pickSelectionAnchor` 纯函数单测：锚点水平居中、垂直按抬手点/方向展开留间距、键盘选择兜底。被测：`pickSelectionAnchor`/`SelectionRect`。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**4 test**（`:15-33`，夹具 `rect()` 默认 100,100→300,160 宽 200）：

1. `:16-18` 水平恒居中（`x===200`）。
2. `:20-23` 抬手点 150（下半部）→ `{x:200, y:174, direction:'down'}`（150+24）。
3. `:25-28` 抬手点 110（上半部）→ `{x:200, y:86, direction:'up'}`（110-24）。
4. `:30-33` pointerY null（键盘选择）→ `{x:200, y:136, direction:'up'}`（bottom 160-24）。

## 3. 真实断言

- 四分支坐标精确断言（含 `ANCHOR_GAP=24` 间距与展开方向）。
- #4 键盘兜底（选区底部向上）与注释口径一致。

## 4. 未覆盖与脆弱点

**未覆盖**：`AgentHistorySelectionLayer` 组件（DOM 事件管线/探索门禁）；`SelectionRect` 退 `getClientRects` 路径。

**脆弱点**：坐标断言与 `ANCHOR_GAP` 常量耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、4 test、纯内存 | 已证实 | `:15`；`grep -c test(`=4 |
| 锚点四分支 | 已证实 | `:16-33` |
| 组件事件/门禁 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `pickSelectionAnchor` 四分支 | #1-#4 | `:16-33` | covered |
| 组件本体 | — | — | unknown |
