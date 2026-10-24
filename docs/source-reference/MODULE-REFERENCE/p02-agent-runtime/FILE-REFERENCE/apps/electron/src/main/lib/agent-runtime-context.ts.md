---
path: apps/electron/src/main/lib/agent-runtime-context.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68e0ce8047743977a322c3cadb9aa51993651d35
sha256: e19d85a9f552957fba0e3a283ca899ad786c6e569b0b71ac2c2506ed0e355747
lines: 30
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-context.ts

## 1. 结论与边界

活跃会话的**非持久化**上下文窗口存储（注释 :7-12）：`context_window` 是启动瞬时事件，远程 Pocket 迟连会错过；仅保留活动 run 供重连快照恢复，会话结束立即释放，**不能作历史数据**。

## 2. 导出与关键符号

导出 2 条（`export` :1/:13）：`AgentRuntimeContextSnapshot`（:1-5，sessionId/contextWindow/updatedAt）、`AgentRuntimeContextStore`（:13-30，Map 存储）。

## 3. 内部逻辑与关键流程

- `setContextWindow(sessionId, contextWindow, updatedAt=Date.now())`（:16-19）：非法输入静默忽略（:17）。
- `clear(sessionId)`（:21-23）；`list(sessionIds?)`（:25-29）：无参全量/按集合过滤。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-service.ts:45`（new :57、list :67、setContextWindow :181、clear :183/:389/:520）；测试 `agent-runtime-context.test.ts:2`。出向：零 import（纯内存 Map）。

## 5. 数据 I/O、读写与副作用

纯内存 Map（零 import）。

## 6. 分支、失败、取消与恢复

set 静默拒非法（:17）；list 二分支。不适用取消/恢复（非持久化即释放语义 :11）。

## 7. 权限与权威状态

「非持久化、仅活动 run」边界权威（:11 注释）。

## 8. 修改影响面

Pocket 重连快照链。需同步测试（29 行）。

## 9. 测试证据

`agent-runtime-context.test.ts`（批内，1 describe/3 用例，NOT_RUN）：list 过滤（:5-13）、非法输入忽略（:15-20）、clear 释放（:22-28）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；非持久化边界 | 已证实 | :1-30 |
| 测试 3 用例逐断言 | 已证实 | 姊妹手册 §2 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Store 三方法 | §2/§3 | :13-30 | covered |
| 测试 | §9 | — | unknown |
