---
path: packages/agent-fabric/src/task-graph.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7f69dbba015593a314cdfc2253a8ea1a2e284e97
sha256: 49beb9cd5dbc6361a827a7d03dce5b399661bc38df01f28943f022b8fecec9bf
lines: 173
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/task-graph.ts

## 1. 结论与边界

**Task Graph 与委派策略**：核心不变量——子任务策略只能继承或收窄，**永远不能扩大父任务授权**；子 Agent 不能通过再委派绕过审批要求（`task-graph.ts:1-6`）。纯逻辑，无 I/O。依赖 `./task`（TaskPolicy/WORKSPACE_MODE_RESTRICTIVENESS/AgentTask——task.ts 域外）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ChildTaskLink` | 接口 | `:16` | parentTaskId/rootTaskId/dependsOn/requesterAgentId/orchestratorAgentId/targetAgentId/aggregationMode('wait-all'\|'wait-any'\|'fire-and-forget') | 任务树+DAG 依赖分开记录（`:15`） |
| `findPolicyWidening` | 函数 | `:31` | `(parent,child): string[]` | 违规项列表，空=收窄合法 |
| `narrowPolicy` | 函数 | `:72` | `(parent,child:Partial<TaskPolicy>): TaskPolicy` | 生成子策略，扩大→`POLICY_WIDENING_REJECTED` |
| `DelegationGuardInput` | 接口 | `:99` | parent/currentChildCount/parentDepth | |
| `assertDelegationAllowed` | 函数 | `:108` | `(input): void` | 深度/子数/allowDelegation 三闸 |
| `assertNoDependencyCycle` | 函数 | `:132` | `(edges: ReadonlyMap<string,readonly string[]>): void` | DFS 环检测→`DEPENDENCY_CYCLE` |
| `assertDependsOnWithinGraph` | 函数 | `:162` | `(link,knownTaskIdsByRoot): void` | 跨图依赖→`DEPENDENCY_NOT_FOUND` |

## 3. 内部逻辑与关键流程

- `findPolicyWidening`（`:31-66`）七类检查：`maxDelegationDepth`（`:34-36`）、`maxChildren`（`:37-39`）、`timeoutSeconds`（`:40-42`）、`workspaceMode` 按 `WORKSPACE_MODE_RESTRICTIVENESS` 数值（更強写=违规，`:43-48`）、`allowedCapabilities` 新增项（`:49-55`；**父有白名单而子未声明=视为继承不违规**，`:54`）、`budget` 同单位超限（`:56-60`）、`approvalMode` `forward_to_user` 不可降级（`:61-64`）。
- `narrowPolicy`（`:72-95`）：10 个 policy 字段 `child.X ?? parent.X` 合并（`:73-84`）→ `findPolicyWidening(parent, merged)` 有违规即抛 `POLICY_WIDENING_REJECTED`（details.violations，`:86-93`）。
- `assertDelegationAllowed`（`:108-127`）：`allowDelegation=false`→`POLICY_VIOLATION`（`:110-112`）；`parentDepth+1 > maxDelegationDepth`→`DELEGATION_DEPTH_EXCEEDED`（`:113-119`）；`currentChildCount >= maxChildren`→`MAX_CHILDREN_EXCEEDED`（`:120-126`）。
- `assertNoDependencyCycle`（`:132-156`）：DFS visiting/done 双集合（`:133-134`）；回边即抛 `DEPENDENCY_CYCLE`（cycle 路径入 details，`:138-144`）；递归后移 visiting 入 done（`:149-150`）。
- `assertDependsOnWithinGraph`（`:162-173`）：`dependsOn` 逐项须在同 rootTaskId 的已知集合内，否则 `DEPENDENCY_NOT_FOUND`（防跨图挂资源/审批上下文，`:158-161` 注释）。

## 4. 调用者与调用链

- 入向：同包内无调用者（grep：gateway.ts 未 import task-graph）；消费方=域外委派编排（fabric-*，未深读）。
- 测试：`contract-task-graph.test.ts` 12 用例（§9）。
- 出向：`./protocol`、`./task`（TaskPolicy/WORKSPACE_MODE_RESTRICTIVENESS——域外）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯函数；`narrowPolicy` 返回新对象）。

## 6. 分支、失败、取消与恢复

七类 widening 分支 + 三闸 + 环/跨图抛错（§3）；无取消路径。

## 7. 权限与权威状态

委派权威=父 policy（只减不增）；审批权威=`forward_to_user` 不可被子任务降级（`:61-64`，与 approval.ts 用户审批互补）。

## 8. 修改影响面

收窄规则是防权限放大的核心；改动影响域外委派编排与 contract-task-graph 12 断言（错误码锁定）；`WORKSPACE_MODE_RESTRICTIVENESS` 语义在 task.ts（域外），两文件须一致。

## 9. 测试证据

`NOT_RUN`。直接测试 `contract-task-graph.test.ts`（184 行/**12 个 `it(`**）：策略收窄 6（收窄深度/超时通过且未声明项继承 `:61-67`；扩深度拒 `:69-76`；扩能力白名单拒 `:78-85`；审批降级拒 `:87-94`；single-writer→isolated-writer 是收窄通过 `:96-99`；read-shared→single-writer 拒 `:101-109`）；委派边界 3（深度超限 `:113-120`；子数超限 `:122-129`；allowDelegation=false 拒 `:131-139`）；DAG 3（环检测 `:143-155`；无环通过 `:157-164`；跨图依赖拒 `:166-183`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 七类 widening/三闸/环/跨图规则 | 已证实 | `:16-173` 逐行 + 12 测试互证 |
| 同包内无调用者（委派编排在域外） | 已证实（否定结论） | grep packages/agent-fabric/src |
| WORKSPACE_MODE_RESTRICTIVENESS 数值语义 | 边界 | task.ts 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出对象 | §2 | 16-162 | covered |
| 收窄/委派/DAG 流程 | §3 | 31-173 | covered |
| 测试 12 用例 | §9 | test 文件 | covered（NOT_RUN） |
