---
path: packages/agent-fabric/src/state-machine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98f4fc30e9f32534413ba3bd8c593dfe06174d82
sha256: 6a949204c1b2a5f77a116465d715695275efa2181f6740016f3eeab1e3202fc4
lines: 131
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/state-machine.ts

## 1. 结论与边界

**Task 状态机**（设计文档 §5.2 迁移表实现）：waiting_for_approval/waiting_for_input **不是失败**、须保留恢复上下文；终态后禁止任何迁移；状态判断只看状态字段（`state-machine.ts:1-8`）。纯逻辑，无 I/O。依赖 `./task`（TaskStatus/AgentTask，**task.ts 域外不在本批 scope**）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TERMINAL_STATUSES` | 常量数组 | `:14` | completed/failed/cancelled/expired | |
| `isTerminalStatus` | 函数 | `:21` | `(status): boolean` | |
| `RESUMABLE_WAITING_STATUSES` | 常量数组 | `:26` | waiting_for_approval/waiting_for_input | 恢复须带 pending 上下文（`:25`） |
| `isResumableWaitingStatus` | 函数 | `:31` | `(status): boolean` | |
| `TRANSITIONS`（内部） | 迁移表 | `:40` | **14 状态**→合法目标集 | 见 §3 |
| `canTransition` | 函数 | `:75` | `(from,to): boolean` | |
| `assertTransition` | 函数 | `:80` | `(from,to): void` | 终态→`TASK_TERMINAL`；非法→`INVALID_STATE_TRANSITION`（`:81-94`） |
| `transitionTask` | 函数 | `:101` | `(task,to,at,opts?): AgentTask` | 不可变更新 + 等待态上下文校验 |

## 3. 内部逻辑与关键流程

- 迁移表（`:40-73`）：`CREATED→[QUEUED,CANCELLED,EXPIRED]`；`QUEUED→[ROUTING,FAILED,CANCELLED,EXPIRED]`（注释 `:42-43`：queued→failed 为调度准入失败细化）；`ROUTING→[ACCEPTED,FAILED,CANCELLED,EXPIRED]`；`ACCEPTED→[RUNNING,FAILED,CANCELLED,EXPIRED]`；`RUNNING→[DELEGATING,WAITING_FOR_CHILDREN,WAITING_FOR_APPROVAL,WAITING_FOR_INPUT,PAUSED,COMPLETED,FAILED,CANCELLED,EXPIRED]`（9 目标）；`DELEGATING→[RUNNING,WAITING_FOR_CHILDREN,FAILED,CANCELLED,EXPIRED]`；三个 WAITING_*→`[RUNNING,FAILED,CANCELLED,EXPIRED]`；`PAUSED→[RUNNING,CANCELLED,EXPIRED]`（**PAUSED 不能→FAILED**）；4 终态→`[]`。
- `transitionTask`（`:101-131`）：先 `assertTransition`（`:107`）；进 `WAITING_FOR_APPROVAL` 必带 `pendingApprovalId`、进 `WAITING_FOR_INPUT` 必带 `pendingInputRequestId`，否则 `VALIDATION_FAILED`（`:109-120`）；不可变展开更新（`:122-129`）；**离开等待态自动清 pending**（`:126-127`）；`failureReason` 仅在 to=FAILED 时写入（`:128`）。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:31`（isTerminalStatus/transitionTask；`move` 私有方法 `:502-520` 统一走 transitionTask）。
- 测试：`contract-state-machine.test.ts` 8 用例（§9）。
- 出向：`./task`（TaskStatus/AgentTask——**域外**）、`./protocol`。

## 5. 数据 I/O、读写与副作用

无 I/O；`transitionTask` 返回**新对象**不改入参（`:122-129`，不可变更新）。

## 6. 分支、失败、取消与恢复

- 失败：终态→`TASK_TERMINAL`（`:81-87`）；非法→`INVALID_STATE_TRANSITION`（`:88-94`）；等待态缺上下文→`VALIDATION_FAILED`（`:109-120`）。
- 恢复：WAITING_*→RUNNING 恢复路径 + pending 自动清除（`transitionTask`）；"恢复必须带回上下文"语义注释 `:25,99`。

## 7. 权限与权威状态

状态权威=本迁移表（机器判定，`Task.status`）；不解析事件文本（`:7`）。无身份权限分支。

## 8. 修改影响面

迁移表是任务生命周期唯一权威：改动影响 gateway 全部 `move` 路径、域外 fabric-store 状态持久化、contract-state-machine/gateway 测试（状态字面锁定）。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-state-machine.test.ts`（125 行/**8 个 `it(`**）：正常路径 4（created→queued→routing→accepted→running→completed 且 updatedAt=5 `:51-60`；委派聚合 delegating→waiting_for_children→running→completed `:62-69`；waiting_for_approval 保留并恢复 pendingApprovalId（进带 `appr_1`、出清 undefined）`:71-79`；paused→running `:81-86`）；非法迁移 4（created 不能直跳 running（`canTransition=false`+INVALID_STATE_TRANSITION）`:90-98`；4 终态均 TASK_TERMINAL `:100-110`；进 waiting_for_approval 缺 pendingApprovalId→VALIDATION_FAILED `:112-119`；queued→expired 排队超时路径 `:121-124`）。无 mock（真 transitionTask）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 迁移表 14 状态、终态封闭、等待态上下文语义、不可变更新 | 已证实 | `:14-131` 逐行 + 测试互证 |
| PAUSED 不可→FAILED（表如此） | 已证实 | `:68` |
| `./task` 字段语义 | 边界 | task.ts 域外（248 行，未深读） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出 + 1 内部迁移表（14 状态） | §2/§3 | 14-131 | covered |
| 测试 8 用例 | §9 | test 文件 | covered（NOT_RUN） |
