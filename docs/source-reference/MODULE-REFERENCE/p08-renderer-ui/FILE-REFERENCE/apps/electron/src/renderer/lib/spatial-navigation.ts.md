---
path: apps/electron/src/renderer/lib/spatial-navigation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23f721525c694f43e52e8e045f527fbc8b47a704
sha256: 8cc8360480b764227c60a684772c2ff113b443a4591d3a920d44f29adc4ac9b6
lines: 50
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/spatial-navigation.ts

## 1. 结论与边界

键盘方向导航的几何目标求解（50 行）：按矩形中心距为候选打分，选出请求方向上视觉最近的项，偏向请求轴对齐（spatial-navigation.ts:21）。只做候选选择，不管理焦点、不触 DOM。

## 2. 导出与关键符号

类型 2 个：`SpatialNavigationRect`（spatial-navigation.ts:3-8）、`SpatialNavigationItem`（:10-13）；函数 1 个：`findSpatialNavigationTarget`（:22-50）。内部符号：`SpatialDirection` 类型（内部，:15，取自 `NavigationAction` 的 `previous|next|left|right`）、`center`（内部，:17-19，算矩形中心）。

## 3. 内部逻辑与关键流程

- 中心计算（spatial-navigation.ts:17-19）：`{x: left+width/2, y: top+height/2}`。
- 主流程 `findSpatialNavigationTarget`（:27-49）：先算 origin 中心（:27）；遍历 items，跳过同 id（:31）；算 dx/dy（:33-34）；方向过滤 `inDirection`（:36-39）：`left`→dx<0、`right`→dx>0、`previous`→dy<0、`next`→dy>0，方向外短路 `continue`（:40）；打分 `score = primary + crossAxis * 3`（:42-45，cross-axis 重罚偏移，注释 :44）；保留最小分 `best`（:46）；返回 `best?.item`，无候选返回 `undefined`（:49）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/components/navigation/NavigationInputProvider.tsx:4` import、`:146`、`:251`、`:348` 三处调用（方向键导航）；测试 `spatial-navigation.test.ts:2`。无其它引用（检索范围：baseline 全树 grep `findSpatialNavigationTarget`）。
- 出向：类型 import `./navigation-actions` 的 `NavigationAction`（navigation-actions.ts:2，仅类型）；无运行时调用。

## 5. 数据 I/O、读写与副作用

纯函数，无模块状态、无 I/O、无 DOM/窗口副作用；`items` 为只读数组不被修改（spatial-navigation.ts:24）。

## 6. 分支、失败、取消与恢复

origin 自身跳过（:31）；方向外候选跳过（:40）；items 为空或无方向内候选 → `undefined`（:49，测试 spatial-navigation.test.ts:28）；四个方向共用打分，方向映射全在 :36-39；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

打分权重（:45）或方向判定（:36-39）变更会改变 `NavigationInputProvider.tsx:146/251/348` 的焦点跳转行为；需同步 `spatial-navigation.test.ts` 3 个用例。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。测试文件 `spatial-navigation.test.ts`，机械计数 `test(`=3。真实断言：spatial-navigation.test.ts:14-16（三方向命中）、:23（对齐优先于对角）、:28（`toBeUndefined()`）。间接证据：`NavigationInputProvider.tsx:146/251/348` 为生产调用点（间接，非测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 打分公式/方向映射/undefined 约定 | 已证实 | spatial-navigation.ts:27-49 全文 |
| 测试断言与逻辑一致 | 已证实 | spatial-navigation.test.ts:14-28 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| center | §3 | spatial-navigation.ts:17-19 | covered |
| findSpatialNavigationTarget 方向过滤 | §3/§6 | spatial-navigation.ts:36-40 | covered |
| 打分与 best 选择 | §3 | spatial-navigation.ts:42-46 | covered |
| 无候选返回 undefined | §6 | spatial-navigation.ts:49 | covered |
