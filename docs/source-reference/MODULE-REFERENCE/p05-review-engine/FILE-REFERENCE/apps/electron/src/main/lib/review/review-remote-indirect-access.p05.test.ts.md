---
path: apps/electron/src/main/lib/review/review-remote-indirect-access.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2490881f1639f78668d7a3d55f6c26026108551e
sha256: 7bb4b6be02840cbec47c9d28f67edc7f648f660beefa410b11a491ad804f764c
lines: 109
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-remote-indirect-access.p05.test.ts

## 1. 测试目标

P05-S01 Pocket 间接请求 ID、遗留文件 ID 与重放（头注 :1「受控合成测试」）：隐藏 owner 会话在三种 pending 交互、权限响应、遗留文件命令、重放过滤中一律不可见/不可达。

## 2. 用例清单

5 用例 / 1 describe（`P05-S01 remote indirect owner boundaries` :25）。夹具 `fixture()`（:17-24，真 `createReviewOwnedAgentSession`/`createAgentSession`）；`spyOn` mock 三个服务的 `getPendingRequests/respond*`（控制合成数据）；`handleRemoteCommand` 进程内命令。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | pending 快照排除隐藏 owner（26-46） | 全局/作用域 `permissions/askUsers/exitPlans` 仅 `['public']`；对 owner 会话查询 → `{ok:false,error:'会话不存在'}` |
| 2 | 裸 requestId 不能批内部权限（48-62） | hidden → `权限请求不存在或已处理`、`respondToPermission` 未调用；public 正常 |
| 3 | 同上 AskUser/ExitPlan（64-85） | hidden 两命令拒且 respond 未调用；public 各调用 1 次 |
| 4 | 遗留文件命令双别名拒（87-101） | 两别名对嵌套/连接上下文 owner id → `会话不存在`（路径访问前拒）；删除后仍拒 |
| 5 | 重放/延迟队列重查 owner（103-108） | `selectOrdinaryRemoteReplayRecords` 过滤 owner 记录 `[3,5]`；删除后不变；`mayPublishAgentEventToRemote` owner false/normal true |

## 3. 真实断言

如 §2 表（逐条读自 :26-108）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实 Pocket/Relay 连接（明确排除，头注 :1）。
- 脆弱点：mock 边界=三个服务的 pending/respond 方法；其余（会话管理/命令路由）真实。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §2 | 已证实 | 本文件逐行 |
| 隐藏 owner 全面不可达被固定 | 已证实 | 用例族 |
| 真实 Pocket 行为 | 未知 | 排除范围 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| pending 三类快照隔离 | §2 | covered |
| 三类 respond 防护 | §2 | covered |
| 遗留文件命令防护 | §2 | covered |
| 重放过滤/延迟重查 | §2 | covered |
