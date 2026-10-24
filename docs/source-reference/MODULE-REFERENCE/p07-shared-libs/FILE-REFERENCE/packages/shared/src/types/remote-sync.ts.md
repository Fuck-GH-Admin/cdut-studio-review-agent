---
path: packages/shared/src/types/remote-sync.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0854855852a59895a685abb4b210891cccaa01f7
sha256: d5aa0da09ba4472c82cb6015c7b2c1107563be40d0d6b68b527dff913bf26e2d
lines: 56
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/remote-sync.ts

## 1. 结论与边界

**双端 Remote Store / WS 协议共享类型**（`packages/shared/src/types/remote-sync.ts:1-56`）：纯声明。定义连接相位、命令信封/结果/冲突、hello 与续传帧——协议契约层。

## 2. 导出与关键符号（8 条，表 7 行含 1 处合并行）

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `RemoteConnectionPhase` | type | `:3-9` | `'disconnected'\|'connecting'\|'snapshot_loading'\|'replaying'\|'live'` | 相位机 |
| `CommandConflict` | interface | `:10-15` | `{ code:'REVISION_CONFLICT'; expectedRevision; actualRevision; sessionId }` | 唯一冲突码 |
| `CommandResult<T>` | type | `:17-19` | `{ok:true;commandId;data} \| {ok:false;commandId;error;conflict?}` | 命令结果 |
| `RemoteCommandEnvelope` | interface | `:21-26` | `{type;commandId;expectedRevision?;[k]:unknown}` | 上行信封 |
| `RemoteHelloFrame` | interface | `:28-34` | `{kind:'hello';serverTime;serverInstanceId;latestAgentEventId?;oldestAgentEventId?}` | 握手帧 |
| `RemoteResumeFrame` | interface | `:36-46` | `{kind:'agent_events_resumed';requestId;fromEventId;toEventId;replayed;complete;requiresSnapshot;oldestEventId;latestEventId}` | 续传回执 |
| `RemoteCommandPending`/`RemoteCommandState` | interface | `:48-56` | pending → `{status:'pending'\|'succeeded'\|'failed';error?}` | 命令跟踪 |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）。相位顺序隐含于 `RemoteConnectionPhase` 联合（disconnected→connecting→snapshot_loading/replaying→live）；`requiresSnapshot`（`:43`）标志续传失败时的快照兜底。

## 4. 调用者与调用链

经 `@profer/shared` barrel 消费（Remote Store 客户端/服务端，跨批）；出向：无。

## 5. 数据 I/O、读写与副作用

无（声明文件）。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；恢复语义编码在 `RemoteResumeFrame.complete/requiresSnapshot` 字段（实现方职责）。

## 7. 权限与权威状态

无权限分支；`expectedRevision/REVISION_CONFLICT`（`:10-15`）表达乐观并发契约（权威在服务端 revision）。

## 8. 修改影响面

改协议形状 → Remote Store 双端（WS 帧/命令队列/续传）全链，跨版本兼容风险高。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RemoteConnectionPhase|CommandResult|RemoteResumeFrame` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出形状与行号 | 已证实 | 逐行读 `:1-56` |
| 相位转移/续传行为 | 未知 | 实现方（remote store/WS）未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出 | §2 | `:3-56` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
