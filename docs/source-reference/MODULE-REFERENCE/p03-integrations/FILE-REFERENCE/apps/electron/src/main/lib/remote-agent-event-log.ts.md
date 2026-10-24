---
path: apps/electron/src/main/lib/remote-agent-event-log.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d4da416a55c558d60ea4f76a084bb3796d65f644
sha256: 5003e3ed2b6b9a6f518767427a30db2491e2a5d13d25112dd4545fa45cf29b55
lines: 115
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-agent-event-log.ts

## 1. 结论与边界

**进程内 Agent 事件日志**（`remote-agent-event-log.ts:19-22` 注释）：为远程 Pocket 提供**有限窗口的断线补发**；**事件不落盘，服务重启由调用方快照恢复**（`:21`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RemoteAgentEventRecord` | interface（export） | `:3-8` | eventId/sessionId/payload/createdAt |
| `RemoteAgentEventReplay` | interface（export） | `:10-17` | records/from/to/oldest/latest/**requiresSnapshot** |
| `RemoteAgentEventLog` | class（export） | `:23-115` | 构造 `maxEvents=2000`/`maxAgeMs=10min`（`:28-29`，非法即抛 `:31-36`）；方法：append/replayAfter/getOldestEventId/getLatestEventId/clear |

内部：`prune`（时间+条数双裁剪 `:106-114`）。

## 3. 内部逻辑与关键流程

1. `append`（`:39-50`）：前后各 prune 一次、`nextEventId` 单调递增。
2. `replayAfter(cursor)`（`:52-91`）三分支：**cursor=null（首次连接）不补发历史**、requiresSnapshot=false（`:56-65`）；非法 cursor（负/非整数）→空+**requiresSnapshot=true**（**:67-76，拒绝静默补发不完整流**）；**cursor < oldest-1（窗口外）→ requiresSnapshot=true 不补**（`:78-80`）；否则补 `eventId > cursor`。

## 4. 调用者与调用链

入向：remote-service（同批 2156 行）断线补发链。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯内存；无落盘（`:21`）。

## 6. 分支、失败、取消与恢复

replayAfter 三分支（§3）；构造参数校验抛（`:31-36`）；恢复=快照（requiresSnapshot 信号）。不适用取消。

## 7. 权限与权威状态

可靠性契约：**拒绝不完整补发**（`:60` 用例名对应实现 `:67-76`）。

## 8. 修改影响面

改窗口/补发语义 → 远程 Pocket 断线恢复体验。

## 9. 测试证据

**直接测试 `remote-agent-event-log.test.ts`（5 用例，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+1 内部+三分支+双裁剪 | 已证实 | 逐行读 `:1-115` |
| 测试 5 用例断言 | 已证实 | 测试文件；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类全链 | §2/§3 | `:23-115` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
