---
path: apps/electron/src/main/lib/workspace-heatmap-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e2cdfe397db43a28d95d9f41781d8af9448b9369
sha256: 89e738b88a363ba0675e73aa97d20e21b829b899617f58e2dc25dd18eec2809b
lines: 304
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/workspace-heatmap-service.ts

## 1. 结论与边界

工作区热力图 Token 聚合（头注释 :1-19）：扫会话 JSONL 按天聚合 token；缓存 `~/.cdutai/heatmap-cache/{workspaceId}.json` 仅「加速层」非权威（:7）；口径 input+cache read+cache creation+output（:15）；按 `_createdAt`+本机时区归日（:16-17，跨天会话正确拆分）。

## 2. 导出与关键符号

导出 8 条（`export` :28/:34/:70/:83/:96/:174/:253/:293）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `HeatmapDailyEntry` | `:28-31` | `{date, tokens}` |
| `CACHE_VERSION=7` | `:34` | 结构变更递增淘汰旧缓存（:250-251：v7 全量恢复脏缓存缺口） |
| `todayDate()` | `:70-72` | |
| `usageToTotalTokens(usage)` | `:83-93` | 四项求和缺失按 0 |
| `timestampToLocalDate(timestamp)` | `:96-102` | 本机自然日 |
| `buildWorkspaceTokenDaily(wsId, sessions, throughDate=today)` | `:174-197` | 全量聚合（365 天窗口 :179-181；归档不清历史 :186 注释） |
| `getWorkspaceHeatmapDaily(wsId, sessions)` | `:253-280` | 主入口（见 §3） |
| `mergeDaily(daily, incremental)` | `:293-304` | **覆盖不累加**（:291-292 注释：retry 不双计） |

## 3. 内部逻辑与关键流程

`getWorkspaceHeatmapDaily`（:253-280）三态：无缓存→全量至昨天+写缓存（:264-267）；`lastFinalizedDate<昨天`→增量补算（nextDay 起 :270-274）；**当天恒增量实时扫描不入缓存**（:277-279，保证停留页面即时可见 :247-248）。增量扫描含归档会话防历史缺口（:211）。缓存校验四条（版本/数组/日期串 :228-230）。

## 4. 调用者与调用链

入向（作者 grep）：生产唯一 `workspace-heatmap-query.ts:3` → 调用 `:22`（getWorkspaceHeatmapDaily），经 `preload/index.ts:1041/:3148` 到渲染层 `UsageHeatmap.tsx:134`；测试 `workspace-heatmap-service.test.ts:2`（+workspace-heatmap-query.test 间接）。出向：`node:fs`、`./config-paths`（:23）、`./safe-file`（:24）。

## 5. 数据 I/O、读写与副作用

读会话 JSONL；缓存读写（原子写）；mkdir 缓存目录。

## 6. 分支、失败、取消与恢复

三态缓存策略（§3）；坏行跳过（:129-142）；版本淘汰（:228）。不适用取消/恢复。

## 7. 权限与权威状态

缓存非权威（:7）；归档不清历史（:186/:257）；覆盖语义防双计（:291）。

## 8. 修改影响面

- 消费面：工作区热力图 UI（Token 日历视图）。
- 依赖面：config-paths 会话路径约定、safe-file 原子写、会话 JSONL 格式（type=result+usage+_createdAt）。
- 需同步测试：`workspace-heatmap-service.test.ts`（7 用例，姊妹手册）。

## 9. 测试证据

`workspace-heatmap-service.test.ts`（批内，7 用例，NOT_RUN）：口径求和/缺失按 0/本机时区/v7 版本钉/覆盖语义/跨天补算/去重增量。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 8 条；三态缓存+覆盖语义 | 已证实 | :253-304 |
| 归档不清历史 | 已证实 | :186/:257 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出+缓存三态 | §2/§3 | :28-304 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
