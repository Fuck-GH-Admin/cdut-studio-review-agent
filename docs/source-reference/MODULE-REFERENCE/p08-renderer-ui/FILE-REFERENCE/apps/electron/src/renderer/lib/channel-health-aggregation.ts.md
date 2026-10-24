---
path: apps/electron/src/renderer/lib/channel-health-aggregation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a8abcf4338a1ac96b40d2455cd7360f0aacd5ca
sha256: 842ec43bff595e2330521b1d6cec17c66f61ad8f4d73d3c7b7863f4c4ce66ca8
lines: 39
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-health-aggregation.ts

## 1. 结论与边界

模型健康聚合纯函数（39 行）：把同一模型跨渠道的 `ModelAvailabilitySample` 采样聚合成单条 `AggregatedModelHealth`（32 格时间槽 + 可用率/时延汇总），供渠道设置面板渲染健康条。边界：无 I/O、无状态、无权限逻辑；输入无任何采样时返回 null（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:13`）；可用率只把 `failure` 计为不可用，`degraded`（慢响应但成功）计入可用（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:23-25`）。

## 2. 导出与关键符号

- 类型导出 1 个：`AggregatedModelHealth` 接口（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:3`，字段 model/slots）。
- 函数导出 1 个：`aggregateModelHealth(models: ModelAvailability[]): AggregatedModelHealth | null`（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:11`）。
- 常量导出 0 个；`BUCKET_COUNT = 32` 为内部常量（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:9`，标注"内部"）。
- 合计导出 2 个符号（类型 1 + 函数 1），与源码逐条一致。

## 3. 内部逻辑与关键流程

按执行顺序（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:11-38`）：(1) `flatMap` 拍平全部渠道采样（`:12`）；(2) 采样为空返回 null 短路（`:13`）；(3) 复制后按 `createdAt` 降序排序（`:15`）；(4) 取最近 32 条再 `reverse` 成时间正序（`:17`）；(5) 左侧补 null 填满 32 槽，空位仅代表历史不足（`:18-21`）；(6) `availableCount` 统计非 failure（`:25`）；(7) `modelId` 取 `models[0].modelId`（`:26`），`updatedAt` 取最新采样 `createdAt`（`:27`）；(8) 返回 `availability = round(可用/总数*100)`（`:31`）、`sampleCount = recent.length`（`:32`）、`avgLatencyMs = round(durationMs 均值)`（`:33`）、`samples = 槽中非 null`（`:35`）与 `slots`（`:37`）。短路条件唯一：样本全集为空。

## 4. 调用者与调用链

- 入向（冻结树全量 grep `aggregateModelHealth`）：`apps/electron/src/renderer/components/settings/ChannelSettings.tsx:35`（import）→ `apps/electron/src/renderer/components/settings/ChannelSettings.tsx:377`（`groupedHealth` Map 构建时调用）。另有域外测试 `apps/electron/src/renderer/lib/channel-health-aggregation.test.ts:3` import（3 用例，见 §9）；除此之外无其它 lib/组件 import 点。
- 出向：仅类型导入 `@profer/shared` 的 `ModelAvailability`/`ModelAvailabilitySample`（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:1`），无运行时依赖、无动态调用。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}` 全文（含测试），除定义文件与域外测试文件外无命中。

## 5. 数据 I/O、读写与副作用

纯函数模块：无模块级状态/缓存/Map/registry；不读写 DOM、localStorage、剪贴板、Worker、IPC。唯一数据变换是对入参数组的复制排序与求和（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:12-35`），返回新对象，不改入参。

## 6. 分支、失败、取消与恢复

- 空输入分支：`samples.length === 0` 返回 null（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:13`）；`models` 为空数组同样落到该分支（flatMap 产物为空）。
- 非空路径上 `models[0]!`/`sorted[0]!` 非空断言（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:26-27`）成立，因为样本非空蕴含两者非空；除数 `recent.length >= 1`（`:31,:33`）无除零。
- 槽不满 32 时左侧以 null 补齐（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:19`）。不 throw、无异步、无取消概念（本文件不适用，依据：全文无 Promise/AbortSignal/定时器）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。数据权威性约定：`failure` 是唯一下调可用率的状态（`apps/electron/src/renderer/lib/channel-health-aggregation.ts:23-24` 注释），与健康条共用同一窗口以避免"条全红但百分比高"矛盾。

## 8. 修改影响面

- `apps/electron/src/renderer/components/settings/ChannelSettings.tsx:377` 的模型健康条/可用率百分比/时延展示直接受影响。
- `BUCKET_COUNT`、排序与空槽语义变更会同时改变 `slots`（健康条格数）与 `availability`；`@profer/shared` 的 `ModelAvailabilitySample.status` 枚举语义是共享契约。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。域外直接测试文件 `apps/electron/src/renderer/lib/channel-health-aggregation.test.ts`（不在 nb-119 批次清单内）：机械计数 `test(` = 3、`it(` = 0（grep `^\s*(it|test)\(`）。真实断言：`apps/electron/src/renderer/lib/channel-health-aggregation.test.ts:30`（`availability` 67，degraded 计可用）、`:40`（全 degraded 为 100）、`:48-50`（跨渠道取 32 条、63%、非空槽 32）。断言引用≠运行，不得视为"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出清单、32 槽窗口、failure-only 计不可用 | 已证实 | `apps/electron/src/renderer/lib/channel-health-aggregation.ts:3-38` 全文 |
| 空样本返回 null、除零安全、非空断言成立 | 已证实 | `apps/electron/src/renderer/lib/channel-health-aggregation.ts:13,26-27,31-33` |
| 域外测试断言与实现语义一致 | 已证实 | `channel-health-aggregation.test.ts:30,40,48-50` |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `AggregatedModelHealth` | §2 | `channel-health-aggregation.ts:3` | covered |
| `aggregateModelHealth` 主流程 | §3 | `channel-health-aggregation.ts:11-38` | covered |
| 空样本 → null 短路 | §6 | `channel-health-aggregation.ts:13` | covered |
| 32 槽补 null / 取最近 32 条 | §3 | `channel-health-aggregation.ts:17-21` | covered |
| failure-only 可用率 | §1,§3 | `channel-health-aggregation.ts:25` | covered |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
