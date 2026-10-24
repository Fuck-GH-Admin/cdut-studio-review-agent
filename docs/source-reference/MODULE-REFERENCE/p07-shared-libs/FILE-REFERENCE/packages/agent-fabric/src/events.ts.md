---
path: packages/agent-fabric/src/events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 971c945c8c5aa5aa1d51a9462878a2f875eadbc5
sha256: 5aea88487324f7dcdd406bd8e6ea66a1788a99b5da8819c9e8dadd3f53d4b12f
lines: 112
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/events.ts

## 1. 结论与边界

**任务事件流契约**：事件按 taskId 持久化、eventSequence 排序；断线用 taskId+lastEventSequence 恢复；eventId 去重（`events.ts:1-6`）。状态判断只看 `Task.status`，不解析自然语言事件文本（`:31-33`）。含进程内实现 `createInMemoryEventLog`（Phase 1 持久化实现须保持同语义，`:69-72`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TaskEventType` | 常量组 | `:10` | **15 值**（created/accepted/started/progress/child_created/child_completed/approval_required/artifact_created/test_result/paused/resumed/failed/completed/cancelled/expired） | |
| `TaskEvent<T>` | 接口 | `:34` | eventId/eventSequence/taskId/type/occurredAt/producerAgentId/payload | eventSequence 同任务内从 1 单调（`:36-37`） |
| `EventCursor` | 接口 | `:46` | taskId/lastEventSequence | 断线游标 |
| `AppendEventInput<T>` | 接口 | `:51` | 无 eventSequence（由日志分配） | |
| `TaskEventLog` | 接口 | `:60` | `append/resumeAfter/listByTask` | append 幂等（同 eventId 返回已存在，`:61-62`）；resumeAfter 不含游标本身（`:63-64`） |
| `createInMemoryEventLog` | 函数 | `:73` | `(): TaskEventLog` | 见 §3 |

## 3. 内部逻辑与关键流程

`createInMemoryEventLog`（`:73-112`）：`append`（`:78-96`）——同 eventId 重复投递返回已存在事件（幂等，`:79-80`）；`eventSequence = list.length + 1`（`:85`）；双记（byTask + seenEventIds，`:92-94`）。`resumeAfter`（`:97-107`）——游标越界（>当前最大）→`VALIDATION_FAILED` 抛错而非静默丢事件（`:100-105`）；否则过滤 `eventSequence > cursor`（`:106`）。`listByTask` 返回副本（`:108-110`）。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:32-38`（TaskEventType/TaskEventLog/createInMemoryEventLog 默认事件日志 `:153`；appendEvent `:522-539`；resumeEvents `:350-352`）。
- 测试：`contract-events.test.ts` 5 用例（§9）+ `contract-gateway.test.ts` 事件序列/游标 1 用例（`:254`）。
- 出向：`./protocol`（错误码）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络；内存 Map（`eventsByTask`/`seenEventIds`，`:74-75`）为实例状态。注释要求 Phase 1 持久化实现保持同语义（`:70-71`，域外）。

## 6. 分支、失败、取消与恢复

重复投递静默幂等（`:79-80`）；游标越界抛 `VALIDATION_FAILED`（`:100-105`）；断线恢复=resumeAfter 语义。无取消机制。

## 7. 权限与权威状态

无权限分支（日志无鉴权——鉴权在 gateway 查询层）；事件序号权威=日志分配（`list.length+1`）。

## 8. 修改影响面

15 事件类型/序号/幂等语义影响 gateway 全部 `appendEvent`/`move` 事件映射、断线恢复消费方（域外）、contract-events/gateway 测试断言（类型字面锁定，`contract-gateway.test.ts:271-278`）。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-events.test.ts`（54 行/**5 个 `it(`**）：序列从 1 单调（`:13-19`，`toEqual([1,2,3])`）；不同任务序列独立（`:21-26`）；同 eventId 去重（`dup===first` 且长度 1，`:28-34`）；游标恢复只拿之后事件（`['e2','e3']`；末游标返空，`:36-47`）；游标越界抛（`:49-53`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 事件类型、幂等/序号/游标语义 | 已证实 | `:10-112` 逐行 + 测试互证 |
| 持久化实现语义等价要求 | 推断（契约注释） | `:69-72`；域外未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出对象 | §2 | 10-73 | covered |
| 内存日志语义 | §3 | 73-112 | covered |
| 测试 5 用例 | §9 | test 文件 | covered（NOT_RUN） |
