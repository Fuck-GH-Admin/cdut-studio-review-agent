---
path: apps/electron/src/main/lib/review/review-remote-reconnect-search.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f7283f7dd6c5116921fbe66d29c4f116e843b37e
sha256: 1db597bdf98a7f7599e4ad0dd60913fffdc0e414628f6cf4fc4dc27eae5fef5d
lines: 162
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-remote-reconnect-search.p05.test.ts

## 1. 测试目标

P05-S04 快照/重放/搜索/间接 ID 的 owner 隔离（头注 :1-3「无真实 Pocket/Relay/飞书」）：会话列表/运行时上下文快照排除 owner、搜索隐藏私有路径（含 symlink/显式附件）、私有文件名/陈旧父目录搜索为空、嵌套提及 ID 注入拒、重放过滤保序、窗口外强制快照。

## 2. 用例清单

8 用例 / 1 describe（`P05-S04 Pocket reconnect, snapshot and search` :30）。夹具 `fixture()`（:20-29，真实工作区/会话/文件+`deny` 谓词）；`RemoteAgentEventLog` 真实事件日志；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 快照排除 owner（31-46） | `list_sessions` 不含 owner、`get_agent_runtime_contexts` 无 owner（删除前后两轮） |
| 2 | 搜索隐藏私有（48-64） | 命中 normal/shared；不含 `private-case-document`/ownerRoot/privateFile（显式附件也不放行） |
| 3 | 私有文件名/陈旧目录搜索为空（66-79） | 删除前后 query `private-case` 均无命中（删除后原位重建文件仍不出现） |
| 4 | symlink 别名跳过（81-97） | 文件/目录 symlink 显式挂载不进结果 |
| 5 | 纯搜索保正常路径（99-108） | 命中 normal/public、不含 privateFile |
| 6 | 嵌套提及 ID 注入拒（110-121） | `queue_message` 带 owner id → `会话不存在`（删除前后）；自身 id 正常 |
| 7 | 重放过滤保序（123-138） | `[1,3]`（owner 记录过滤、cursor 顺序保留）；删除后不变；`replayAfter(1)` → `[3]` |
| 8 | 窗口外强制快照（140-154） | `replayAfter(0)` `requiresSnapshot:true`+过滤后空；`replayAfter(null)` 无快照无记录 |

## 3. 真实断言

如 §2 表（逐条读自 :31-154）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实网络重连（websocket-relay 篇）。
- 脆弱点：`RemoteAgentEventLog(2,…)` 小窗口人为构造 overflow。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §2 | 已证实 | 本文件逐行 |
| 快照/搜索/重放三面隔离被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 快照排除 | §2 | covered |
| 搜索过滤（含 symlink/附件/陈旧） | §2 | covered |
| 嵌套 ID 注入拒 | §2 | covered |
| 重放过滤/窗口外快照 | §2 | covered |
