---
path: packages/agent-fabric/src/approval.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa24284d73699328b9f1512d87f9829dadb2ec7e
sha256: 4ee93cdb04d77ad8f45cc92e7d5486b4b9395f3b31e273579a31024592842ffb
lines: 107
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/approval.ts

## 1. 结论与边界

**审批绑定契约**：高风险操作审批归原始用户（不归父 Agent）；token 一次性、不可跨任务/Agent/workspace/版本重放（`approval.ts:1-6`）。纯逻辑，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ApprovalRequest` | 接口 | `:12` | 11 字段（approvalId/taskId/rootTaskId/requesterAgentId/targetAgentId/workspaceScope/capability/operationSummary/expiresAt/createdAt/protocolVersion） | `protocolVersion` 防跨版本重放（`:26-27`） |
| `ApprovalDecisionKind` | 类型 | `:30` | `'approved'\|'denied'` | |
| `ApprovalDecision` | 接口 | `:33` | approvalId/decision/decidedBy/decidedAt/oneTimeToken | **`decidedBy` 类型锁定 `'user'`**（`:36-37`），任何 Agent 不能成为 decidedBy |
| `ApprovalConsumeContext` | 接口 | `:46` | taskId/rootTaskId/targetAgentId/workspaceScope/capability/protocolVersion | 逐项匹配，不接受"近似可信"（`:43-45`） |
| `assertApprovalConsumable` | 函数 | `:56` | `(request,context,now?): void` | 见 §3 |
| `ApprovalTokenLedger` | 类 | `:88` | `consume(decision,request): void` | 一次性 token 账本（见 §3） |

## 3. 内部逻辑与关键流程

- `assertApprovalConsumable`（`:56-82`）：①过期（`expiresAt<=now`）→`APPROVAL_EXPIRED`（非 retryable，`:61-67`）；②六字段逐项比对（taskId/rootTaskId/targetAgentId/workspaceScope/capability/protocolVersion，`:69-74`），任一不符收集 mismatches→`APPROVAL_BINDING_MISMATCH`（details 含明细，`:75-81`）。返回 void（注释 `:55` 称"返回原请求"——与签名不符，见 §10）。
- `ApprovalTokenLedger.consume`（`:91-106`）：decision.approvalId≠request.approvalId 或 token 空→`APPROVAL_BINDING_MISMATCH`（`:92-97`）；key=`${approvalId}:${oneTimeToken}` 已消费→`APPROVAL_REPLAY`（`:98-104`）；否则入账（`:105`）。消费记录在实例 `consumed:Set`（`:89`）。

## 4. 调用者与调用链

- 入向：同包内 gateway 未直接调用（grep）；测试 `contract-security.test.ts` 6 用例（§9）；域外审批流（fabric-*，未深读）经 `@profer/agent-fabric` 可用（边界）。
- 出向：`./protocol`（错误码）、`./capabilities`（类型）。

## 5. 数据 I/O、读写与副作用

无 I/O；`consumed:Set` 为实例内存账本（无持久化——跨进程/重启防重放依赖上层持久化，边界）。无其它副作用。

## 6. 分支、失败、取消与恢复

过期/失配/重放三类抛错（§3）；无恢复路径（过期必须重新向用户请求，`:64`）。

## 7. 权限与权威状态

审批权威=**用户**：`decidedBy:'user'` 类型级锁定（`:37`）；绑定六元组为权威上下文；token 一次性为权威消费规则。子 Agent 不能绕过（与 task-graph 的 approvalMode 收窄互补）。

## 8. 修改影响面

字段/断言语义影响域外审批流与 contract-security 断言（错误码+文案锁定）；`protocolVersion` 与 `PROTOCOL_VERSION` 联动（跨版本失效机制）。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-security.test.ts` 6 用例（`:192` 绑定匹配+未过期可消费；`:196` 过期→APPROVAL_EXPIRED；`:205` 跨任务→APPROVAL_BINDING_MISMATCH；`:214` 跨 Agent 同；`:223` token 重放→APPROVAL_REPLAY；`:235` decision/request 不绑定→APPROVAL_BINDING_MISMATCH）。无 mock。缺口：protocolVersion 失配、workspaceScope/capability 失配无独立断言（经 mismatches 列表逻辑覆盖）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 六字段绑定/过期/一次性账本语义 | 已证实 | `:56-106` 逐行 + 测试互证 |
| **注释≠实现 2 处**：`:55` "返回原请求"（实际返回 void）；`:84-87` "consume 返回 true/…返 false（调用方应抛 APPROVAL_REPLAY）"（实际 consume 返回 void、自身抛 APPROVAL_REPLAY） | 已证实（矛盾存在） | `:55,:84-87` vs `:56,:91-106` |
| `decidedBy:'user'` 编译期锁定 | 已证实 | `:36-37` |
| 跨进程防重放（账本无持久化） | 未知/边界 | 域外持久化未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出对象 | §2 | 12-88 | covered |
| 绑定/账本流程 | §3 | 56-106 | covered |
| 注释≠实现 2 处 | §10 | — | covered（照实记录） |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
