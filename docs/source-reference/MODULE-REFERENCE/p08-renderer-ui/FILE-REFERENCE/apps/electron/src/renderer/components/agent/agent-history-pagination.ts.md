---
path: apps/electron/src/renderer/components/agent/agent-history-pagination.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9387b8661dbd334d3b794e996173121345318d38
sha256: 3d5cfa979f004e13d91a377e3bb05c95ac0207c7cee20220c13ff2acae34fc7d
lines: 102
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/agent-history-pagination.ts

## 1. 结论与边界

Agent 历史分页归一：①`normalizeAgentHistoryResult`——兼容分页对象与旧版纯数组返回（`:37`）；②`normalizeAgentHistoryRefresh`——refresh 后窗口归一化，**裁掉超出原起点的前缀防窗口向前膨胀**（`:71-87` 注释详述：每次 refresh 若直接采用 tail 会让用户凭空看到更早轮次且线性累积）。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 2 个函数 = 6 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentHistoryPageLike`/`AgentHistoryCursorState`/`AgentHistoryLoadResult` | 接口（导出） | 12-27 | 分页形状/游标/归一结果 |
| `AgentHistoryRefreshNormalization` | 接口（导出） | 29-35 | +`clippedCount`（裁掉前缀条数） |
| `normalizeAgentHistoryResult` | 函数（导出） | 38-69 | 数组→游标按长回退+`legacyHasMore` 兜底（`:48-49`）；分页对象→`startIndex` 缺省时推算（`:57-59`）；**旧页缺 hasMore：正游标即有历史**（`:64-65` 注释） |
| `normalizeAgentHistoryRefresh` | 函数（导出） | 88-111 | `overflow=previousStartIndex-cursor.startIndex`；≤0 不裁、≥页长**整页保留**（rewind 截断窗口重置，绝不裁空，`:81-82,100`）；否则 `slice(overflow)`+游标推进 |

## 3. 内部逻辑与关键流程

refresh 归一（`:88-111`）：非分页/`previousStartIndex===null`（会话切换，窗口基准在内存缓存无累计膨胀，`:85-86`）短路；旧 preload 数组返回 overflow=整页长→被边界守卫拦下（`:93-94`）。

## 4. 调用者与调用链

入向：Agent 历史加载/refresh（流结束/终止/出错/rewind）；测试：`agent-history-pagination.test.ts`（131 行，本批）。出向：`@profer/shared`（`SDKMessage`）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 数组/坏值 | 兼容数组/`[]` | 45-52 |
| startIndex 缺 | 按长推算 | 57-59 |
| hasMore 缺 | `startIndex>0` 判有历史 | 65 |
| overflow≤0/≥页长 | 不裁/整页保留 | 101-103 |
| 会话切换(null) | 短路不裁 | 95-97 |

## 7. 权限与权威状态

窗口起点权威=「保持不动只追加新消息」+游标推进防重复拉取（`:78-79`）。

## 8. 修改影响面

改归一影响历史窗口稳定性/膨胀缺陷。

## 9. 测试证据

直接测试：`agent-history-pagination.test.ts`（131 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 膨胀缺陷/裁剪契约 | 已证实 | `:71-87` |
| rewind 整页保留防裁空 | 已证实 | `:81-82,100-103` |
| 旧格式兼容 | 已证实 | `:37,45-52,93-94` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 接口 | §2 | 12-35 | covered |
| 2 函数 | §2,§3 | 38-111 | covered |
