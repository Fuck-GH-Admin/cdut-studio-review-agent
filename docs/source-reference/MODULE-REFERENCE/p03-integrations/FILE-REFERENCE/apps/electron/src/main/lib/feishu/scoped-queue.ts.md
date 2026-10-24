---
path: apps/electron/src/main/lib/feishu/scoped-queue.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b6627b16dc93d22fde0c4e94845806f3a03b61a
sha256: e21ec7a24e2c903b504733aae1afd182e310097928bb0449f08e3fb04bba2027
lines: 131
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/scoped-queue.ts

## 1. 结论与边界

**Per-scope 防抖累积队列**（`apps/electron/src/main/lib/feishu/scoped-queue.ts:1-16`，参考 zara/feishu-claude-code-bridge pending-queue）：scope=chatId 或 `chatId:threadId`；quiet window 内消息合并 batch 处理。关键语义：**push**（累积+重置 timer）/**block**（run 期间禁止 timer 触发、消息继续累积）/**unblock**（结束后**重新 arm 全新 quiet window**——避免用户刚发完 Agent 立刻抢答）。解决两痛点（`:12-15`）：连发 N 条不触发 N 个并行 Agent；run 期间新消息不打断、结束合并。

边界：命令直通用 `cancel`（跳过防抖+丢弃累积，`:70-72` 注释）；flush 异常吞掉记 console.error（`:126-129`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `QueuedMessage<T>` | interface | 18-22 | `{scope; payload; enqueuedAt}` |
| `FlushHandler<T>` | type | 24 | `(scope, batch) => void` |
| `ScopedQueue<T>` | class | 31-131 | `push/cancel/cancelAll/block/unblock/hasPending` |

内部：`PendingEntry`（`:26-29`）、`map/blocked/delayMs/onFlush`（`:32-35`）、`armTimer/flush`（`:119-131`）。

## 3. 内部逻辑与关键流程

- `push`（`:45-63`）：已 block 则**不 arm timer**（只累积）；返回同 scope 队列深度。
- `block/unblock`（`:88-111`）：block 幂等清 timer；unblock 仅在有累积时 arm 全新 quiet window。
- `flush`（`:124-131`）：先 delete 再回调（防重入）；回调异常捕获。

## 4. 调用者与调用链

出向：无（零 import）。入向（检索=符号名+模块名，全冻结树）：`feishu-bridge.ts:83,169`（new ScopedQueue<QueuedFeishuMessage>，注释提及 :913-:1580）；`QueuedMessage`/`FlushHandler` 零外部引用。⚠ 名称族碰撞（非本符号）：AgentQueuedMessage/sendQueuedMessage 等。产品链：feishu-bridge ← feishu-bridge-manager ← main/index.ts:235、main/ipc.ts:448。

## 5. 数据 I/O、读写与副作用

内存队列+timer；console.error。无 I/O。

## 6. 分支、失败、取消与恢复

flush 回调异常吞掉（队列已 delete，不阻塞后续）；无异步链。

## 7. 权限与权威状态

本文件不适用（无权限代码）；「不立刻抢答」语义（`:9`）是用户体验口径。

## 8. 修改影响面

防抖语义影响飞书桥消息合并；无直接测试。

## 9. 测试证据

**无任何测试**（0 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| push/block/unblock 三语义 | 已证实 | `:45-111` |
| flush 先 delete 防重入+异常吞 | 已证实 | `:124-131` |
| 命令直通 cancel 语义 | 已证实 | `:70-80` |
| 2 类型零外部引用 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| **零测试** | 已证实 | caller 图 |
| 真实并发行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2 | 18-131 | covered |
| 防抖状态机 | §3 | 45-131 | covered |
| 测试锚 | §9 | — | unknown（零测试） |
