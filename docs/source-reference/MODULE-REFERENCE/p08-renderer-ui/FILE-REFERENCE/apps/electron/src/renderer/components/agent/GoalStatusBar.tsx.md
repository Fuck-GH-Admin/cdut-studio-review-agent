---
path: apps/electron/src/renderer/components/agent/GoalStatusBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4098a8a9592f555c889912871760ccbbc4e0c2ee
sha256: c03cf3251c1037be3e50dbdfe12b9679c0b95cd28728eb9bc82eff1a4087bf78
lines: 247
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/GoalStatusBar.tsx

## 1. 结论与边界

**Goal 状态栏**（`apps/electron/src/renderer/components/agent/GoalStatusBar.tsx`，247 行）：Goal run 状态/耗时/预算/恢复入口/轮次历史。**耗时只在明确存在 Goal run owner 时递增，暂停与启动水合不计墙钟时间**（`:34` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GoalHistoryDetails` | 组件 | `:77-…` | 轮次历史（失败/证据/归档展开） |
| `GoalStatusBar` | 组件 | `:167-247` | `{sessionId}` 状态栏 |

内部：累计净执行时间口径（`:34`）。

## 3. 内部逻辑与关键流程

- 状态显示（blocked/failed/stopped→恢复入口；stopping→不能再次停止/编辑不伪装结束；预算耗尽→原因+预算编辑而非盲目恢复；等待空闲/交互请求不伪装执行）——test 7 用例锁定。
- 耗时=累计净执行时间、同会话接续（test 锁定）。
- 轮次历史（失败/证据、归档可展开）。

## 4. 调用者与调用链

- 消费方：Agent Goal 面板。
- 出向：Goal 状态 API。

## 5. 数据 I/O、读写与副作用

经 API；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| blocked/failed/stopped | — | 恢复入口 |
| stopping | — | 禁止再次停止/编辑 |
| 预算耗尽 | — | 原因+预算编辑 |
| 等待/交互 | — | 不伪装执行 |

## 7. 权限与权威状态

「不伪装」多处红线（test 锁定）；耗时口径（`:34`）不虚增。

## 8. 修改影响面

- 状态文案/恢复入口是 Goal UX 合同。
- 耗时口径与 Goal runtime 耦合。

## 9. 测试证据

`GoalStatusBar.test.tsx`（72 行，7 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、状态机/耗时口径 | 已证实 | `:34-247` |
| 不伪装红线 | 已证实（test 锁定） | 测试 `:22-71` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:77-247` | covered |
| 耗时口径 | `:34` | covered |
