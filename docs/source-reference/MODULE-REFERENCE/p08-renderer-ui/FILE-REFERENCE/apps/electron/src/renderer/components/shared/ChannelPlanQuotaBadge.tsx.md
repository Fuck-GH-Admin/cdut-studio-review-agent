---
path: apps/electron/src/renderer/components/shared/ChannelPlanQuotaBadge.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f68b01b1dd0534c2876946a2c35e9b4cd1a6cca6
sha256: 22e80b9f0ca9aff3fd549d10962534be43aaf9ed224588cfd88172ed68e7990b
lines: 96
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/ChannelPlanQuotaBadge.tsx

## 1. 结论与边界

模型选择器里的渠道订阅额度徽章（`:43-50`）：手动刷新入口（方案 A+B 结合）——空闲未悬停只显额度摘要；空闲悬停右侧浮现刷新图标；**刷新中图标持续转圈（不随鼠标移开消失）**，重复点击由数据层 in-flight 锁兜底，结束恢复“仅悬停显示”；**数据与刷新状态与上下文 Popover 共享**（usePlanQuota + planQuotaStateAtomFamily，一处刷新各处同步转圈）。纯展示+刷新回调。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ChannelPlanQuotaBadge` | function 组件 | `:52-96` | `({channel}) => ReactElement \| null` |

内部：`formatWindow`（`:8-15`，额度窗口格式化）、`buildSummary`（`:17-25`，摘要文本）、`buildTitle`（`:27-41`，tooltip 标题）。

## 3. 内部逻辑与关键流程

`usePlanQuota` 取 quota/refreshing/refresh；无额度数据→null（不显示）；渲染摘要+按三态显隐刷新图标（hover/refreshing）；点击 `refresh()`（in-flight 锁在数据层）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：ModelSelector（渠道行）。出向：`@/hooks/usePlanQuota`/`planQuotaStateAtomFamily`、`@profer/shared`（Channel/额度类型）。

## 5. 数据 I/O、读写与副作用

经 hook 拉取额度（IPC）。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无额度 | — | null |
| refreshing | `:49` | 图标持续转圈 |
| 重复点击 | `:49` | in-flight 锁兜底 |

## 7. 权限与权威状态

共享态口径如实（一处刷新各处同步）；in-flight 锁防重复请求。

## 8. 修改影响面

改徽章 → 影响额度感知；与 ContextUsageBadge 共享 usePlanQuota 契约。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三态刷新交互/共享态 | 已证实 | `:43-50` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ChannelPlanQuotaBadge`/内部三件 | 2/3 | `:8-96` | covered |
