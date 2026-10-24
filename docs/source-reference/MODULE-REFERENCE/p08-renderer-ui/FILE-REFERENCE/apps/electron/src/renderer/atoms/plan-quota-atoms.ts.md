---
path: apps/electron/src/renderer/atoms/plan-quota-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 114c424a4ea572fd9604ca82fc810c1fceda8d2e
sha256: 6ab333070e0ec7dbdda88e59e90f382433ff2e2475d018443927fb53cf6e0815
lines: 22
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/plan-quota-atoms.ts

## 1. 结论与边界

渠道订阅 Plan 额度展示状态（22 行，头注释 `:1-8`）：供 ChannelPlanQuotaBadge（模型选择器徽章）与 ContextUsageBadge（上下文 Popover）共用，保证同一渠道任一入口看到一致数据/刷新态。纯状态。

**边界**：额度请求本体在 `use-plan-quota`（跨批 hook）；不持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PlanQuotaUiState` | 接口（导出） | 14-17 | `{quota: ChannelPlanQuotaResult \| null; refreshing: boolean}` | quota null=从未成功（旧值优先时无旧值） |
| `planQuotaStateAtomFamily` | atomFamily（导出） | 20-22 | `(channelId: string) => atom<PlanQuotaUiState>` 初值 `{quota:null, refreshing:false}` | 按渠道 ID 切分 |

导出合计 2。`ChannelPlanQuotaResult` 来自 `@profer/shared`（`:11`）。

## 3. 内部逻辑与关键流程

无函数逻辑（不适用，依据：atomFamily 包一个初值 atom）。语义契约（注释 `:5-7`）：`quota`=最近一次成功结果（旧值优先、刷新期间保持可见）；`refreshing`=是否有额度请求在飞（手动/被动/定时统一置位）。

## 4. 调用者与调用链

入向（全冻结树检索 `plan-quota-atoms`，1 文件）：`hooks/use-plan-quota.ts:13`（`planQuotaStateAtomFamily`+`PlanQuotaUiState` 类型）。出向：`jotai`/`jotai/utils`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯内存 atomFamily）。

## 6. 分支、失败、取消与恢复

无（不适用）。

## 7. 权限与权威状态

无权限分支（不适用）。权威数据=服务端额度结果（经 use-plan-quota 写入，跨批）。

## 8. 修改影响面

`use-plan-quota` hook 与两个徽章组件（跨批）的一致性契约；`PlanQuotaUiState` 形状变化需同步三处。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `plan-quota-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/形状/一致性契约 | 已证实 | `:1-22` 全文逐行 |
| 调用方=use-plan-quota（1 文件） | 已证实 | 全树检索（§4） |
| 额度请求时序（手动/被动/定时） | 边界（跨批 hook） | `:7` 注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PlanQuotaUiState`/`planQuotaStateAtomFamily` | §2/§3 | 14-22 | covered |
