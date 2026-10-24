---
path: apps/electron/src/renderer/lib/spatial-navigation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 378d4e020214ec3b8c5d1eab6bff21953cc0251e
sha256: 3865dd0825b8c555d8f7623bd6c5dc632e3c794c88bd3954c964cff7afe12702
lines: 30
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/spatial-navigation.test.ts

## 1. 测试目标

验证 `findSpatialNavigationTarget` 在 20×20 矩形网格上的方向选择、请求轴对齐偏好与无候选返回 `undefined`（spatial-navigation.test.ts:2、:4-7 工厂函数）。框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=3、`it(`=0、`test.each(`=0，共 3 个用例：

1. `selects the nearest item that lies in the requested direction`（spatial-navigation.test.ts:10-17）
2. `prefers alignment with the requested axis over a farther diagonal item`（:19-24）
3. `returns undefined when no item exists in that direction`（:26-29）

## 3. 真实断言

- spatial-navigation.test.ts:14-16：`'left'→'left'`、`'previous'→'above'`、`'right'→'right'`（`?.id` 断言）。
- :23：`expect(...'right'...)?.id).toBe('aligned')`（更远但同轴的项胜过对角项）。
- :28：`expect(findSpatialNavigationTarget(origin, [origin, item('below', 100, 200)], 'previous')).toBeUndefined()`。

## 4. 未覆盖与脆弱点

未覆盖 `next` 方向（源码 spatial-navigation.ts:39 存在该分支）、等距平分 tie-break、同 id 去重（:31）显式用例、重叠矩形。脆弱点：坐标为硬编码像素值，与打分权重 `crossAxis * 3`（spatial-navigation.ts:45）耦合。无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例与断言行真实存在 | 已证实 | spatial-navigation.test.ts:10-29 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| left/previous/right 方向 | §2/§3 | spatial-navigation.test.ts:14-16 | covered |
| 对齐偏好打分 | §3 | spatial-navigation.test.ts:23 | covered |
| 无候选 undefined | §3 | spatial-navigation.test.ts:28 | covered |
| next 方向 | §4 | — | unknown |
