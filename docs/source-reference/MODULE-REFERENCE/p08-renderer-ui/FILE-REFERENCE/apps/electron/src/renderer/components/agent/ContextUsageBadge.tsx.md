---
path: apps/electron/src/renderer/components/agent/ContextUsageBadge.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05e084568c5f8ebc4b758077bbccff997b67e74e
sha256: 6267a12369630ef2ba32cdef1d2363908e195b9de85254b32aa2da755b50ebba
lines: 547
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ContextUsageBadge.tsx

## 1. 结论与边界

上下文使用量指示器（文件头 `:1-10`）：输入框工具栏 36×36 圆形按钮——16px 圆环按 `displayTokens/displayWindow` 比例渲染；hover Popover（token 明细+订阅额度（可手动刷新）+手动压缩按钮（**长按 650ms** 触发、进度动画））；订阅额度与模型选择器徽章共享数据/刷新状态（刷新中图标转圈+锁定、旧额度保持可见）；压缩中按钮位 Loader2；占用接近压缩阈值（窗口×0.775×80%）圆环变琥珀；无数据不显示。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `LONG_PRESS_DURATION` | `:34` | 650ms（长按触发；文件路径搜索长按复用其一半） |
| `ContextUsageBadge` | `:194-547` | 主组件 |

内部常量：`UNSUPPORTED_PLAN_QUOTA_MESSAGE`（`:25`，主进程不支持 Plan 额度时的统一消息→renderer 不展示额度区）、`COMPACT_THRESHOLD_RATIO=0.775`（SDK ~77.5% 窗口自动压缩）、`WARNING_RATIO=0.80`、`HOVER_CLOSE_DELAY=150`。内部组件：`formatTokens`（`:70`，1234→"1.2k"）、`UsageRing`（`:85`，16×16 SVG 描边 2px）、`DetailRow`、`formatResetTime`、`PlanQuotaRow`。

## 3. 内部逻辑与关键流程

### 3.1 数值稳定（`:209-231`）

`stableRef` 保留最近一次有效 token 值（防切会话闪烁）；**会话切换清空陈旧值**（防新会话未上报时显示上个会话数字，`:215-223`）。

### 3.2 订阅额度（`usePlanQuota(planQuotaChannelId)`）

数据/刷新状态跨入口共享（模型选择器徽章同源）；挂载预取/hover 补查/手动刷新统一 hook；`refreshing` 反映任意来源请求在飞；**旧值优先**（刷新期间保持旧值）。

### 3.3 长按压缩（`:258-330`）

`startPress`：`isProcessing` 拒绝；**防重入**（一次物理按压可能同时触发 touchstart+合成 mousedown——iPad/触屏，`pressTriggeredRef`/animFrame 判重，`:262-264`）；rAF 进度环 650ms，满进度触发 `onCompact`。卸载清理动画帧。

### 3.3b Hook 规则备注（NB91-NOTE-01）

`stableRef`/`lastSessionRef`/`closeTimerRef` 等均以**普通变量/ref** 持有（非条件 Hook）——早退分支（无数据不显示）不触碰 Hook 调用顺序，符合 React Hooks 规则。

### 3.4 Popover/渲染

hover cancelClose/scheduleClose（150ms）；按钮=UsageRing（warning 琥珀判定：ratio≥0.775×0.8）或压缩中 Loader2；Popover=token 明细行+PlanQuotaRow（不支持额度消息时隐藏额度区）+手动压缩长按按钮。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 输入框工具栏（`composerTool` 变体）与模型选择器共享额度态。出向：`@/hooks/usePlanQuota`/`planQuotaStateAtomFamily`、`@profer/ui`（Popover）、`lucide-react`。

## 5. 数据 I/O、读写与副作用

经 hook 拉取订阅额度（IPC）；本地 rAF/定时器；无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无数据 | 文件头 | 不显示 |
| 切会话 | `:215-223` | 清陈旧值 |
| 额度不支持 | `:25` | 隐藏额度区 |
| 长按重入/处理中 | `:262-264` | 忽略 |
| 卸载 | `:255` | 清 rAF/定时器 |

## 7. 权限与权威状态

阈值口径如实（0.775 SDK 压缩阈值、0.8 警告线）；刷新“旧值优先+图标转圈”防误导；长按 650ms 防误触压缩。

## 8. 修改影响面

改阈值/显示 → 影响上下文用量感知与手动压缩；`usePlanQuota` 契约联动模型选择器。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 阈值口径/警告线 | 已证实 | `:27-30` |
| 会话切换清陈旧值 | 已证实 | `:215-223` |
| 长按防重入（触屏双事件） | 已证实 | `:262-264` |
| 额度共享/旧值优先 | 已证实 | `:204-207/:248-250` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/内部组件 | 2 | `:25-192` | covered |
| 数值稳定/额度 | 3.1-3.2 | `:204-250` | covered |
| 长按压缩 | 3.3 | `:258-330` | covered |
| Popover/渲染 | 3.4 | `:331-547` | covered |
