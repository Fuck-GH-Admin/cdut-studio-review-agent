---
path: packages/agent-fabric/src/contract-state-machine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34962e9f326ef3138424d377ad73dd2185391f2c
sha256: 4ba5e6a1b16267338be35f39ce4ea623e2fb769e90b66088bdecde6ed07ac65a
lines: 125
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-state-machine.test.ts

## 1. 测试目标

`state-machine.ts`：合法迁移路径、非法迁移拒绝、终态封闭、等待态保留恢复上下文（`contract-state-machine.test.ts:3`）。bun:test；真 `transitionTask`/`canTransition`/`isTerminalStatus`/`isResumableWaitingStatus` 直测。夹具 `makeTask(status)`（`:21-48`，policy 用 allowDelegation=true/maxDepth 2 等）。

## 2. 用例清单

共 **8 个 `it(`**（计数核对），两 describe：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:51` | created→queued→routing→accepted→running→completed | CREATED | 5 次 transitionTask | 顺序链 |
| `:62` | running→delegating→waiting_for_children→running→completed | RUNNING | 4 次迁移 | 独立 |
| `:71` | waiting_for_approval 保留并恢复 pendingApprovalId | RUNNING | 进（带 appr_1）→出 | 顺序链 |
| `:81` | paused→running 恢复执行 | RUNNING→PAUSED | 恢复 | 独立 |
| `:90` | created 不能直接跳 running | CREATED | canTransition+transitionTask | 独立 |
| `:100` | 终态后禁止任何迁移 | 4 终态 | transitionTask→RUNNING | 独立 |
| `:112` | 进 waiting_for_approval 必须带 pendingApprovalId | RUNNING | 无 opts 迁移 | 独立 |
| `:121` | queued 可 expired（排队超时路径） | QUEUED | 迁 EXPIRED | 独立 |

## 3. 真实断言

- `:58-59` `task.status` `toBe(COMPLETED)`、`task.updatedAt` `toBe(5)`。
- `:68` 委派聚合路径终态 COMPLETED。
- `:74-78` 进入后 `pendingApprovalId` `toBe('appr_1')` + `isResumableWaitingStatus` `toBe(true)`；恢复后 `toBeUndefined()`。
- `:85` PAUSED→RUNNING 成功。
- `:91,96` `canTransition(CREATED,RUNNING)` `toBe(false)` + `code` `toBe(INVALID_STATE_TRANSITION)`。
- `:102-107` 4 终态 `isTerminalStatus` `toBe(true)` + `code` `toBe(TASK_TERMINAL)`。
- `:117` `code` `toBe(VALIDATION_FAILED)`。
- `:122-123` QUEUED→EXPIRED 且 `status` `toBe(EXPIRED)`。

## 4. 未覆盖与脆弱点

- 未覆盖：waiting_for_input 的 pendingInputRequestId 对称路径、failureReason 写入、DELEGATING→FAILED 等次要边。
- 脆弱点：错误码字面锁定。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例、断言行 | 已证实 | 全 125 行逐行读 |
| 与 state-machine.ts 语义一致 | 已证实 | 逐条对照 `state-machine.ts:40-131` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 用例 | §2/§3 | 51-124 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
