---
path: packages/agent-fabric/src/contract-task-graph.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dba49ae5b2b9afdc0a9328831fc754b7a576a129
sha256: 755b4667998e69f782486533e8de4237b7b69c74bc260891333552b3258121db
lines: 184
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-task-graph.test.ts

## 1. 测试目标

`task-graph.ts`：子任务不能扩大父任务授权、深度/子数限制、DAG 依赖不跨图不成环（`contract-task-graph.test.ts:3`）。bun:test；真函数直测。夹具 `parentPolicy`（`:24-37`，SINGLE_WRITER+fail+WORKSPACE_WRITE/TEST_RUN+MANUAL_REVIEW_REQUIRED）/`parentTask`（`:39-58`）。

## 2. 用例清单

共 **12 个 `it(`**（计数核对），三 describe：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:61` | 收窄深度与超时通过、未声明项继承 | maxDelegationDepth:1,timeout:600 | narrowPolicy | 独立 |
| `:69` | 扩大委派深度被拒 | depth:5 | narrowPolicy | 独立 |
| `:78` | 扩大能力白名单被拒 | +EXTERNAL_PUBLISH | narrowPolicy | 独立 |
| `:87` | 审批强度不可降 | approvalMode:AUTO_DENY | narrowPolicy | 独立 |
| `:96` | single-writer→isolated-writer 是收窄可过 | workspaceMode 收窄 | narrowPolicy | 独立 |
| `:101` | read-shared→single-writer 被拒 | workspaceMode 扩大 | narrowPolicy | 独立 |
| `:113` | 深度到上限禁止派生 | parentDepth:2 | assertDelegationAllowed | 独立 |
| `:122` | 子数到上限禁止派生 | currentChildCount:3 | assertDelegationAllowed | 独立 |
| `:131` | allowDelegation=false 直接拒绝 | 改 policy | assertDelegationAllowed | 独立 |
| `:143` | 检测依赖环 | a→b→c→a | assertNoDependencyCycle | 独立 |
| `:157` | 无环 DAG 通过 | impl/test/review | assertNoDependencyCycle | 独立 |
| `:166` | 跨图依赖被拒 | dependsOn 不在图内 | assertDependsOnWithinGraph | 独立 |

## 3. 真实断言

- `:63-66` `child.maxDelegationDepth` `toBe(1)`、`timeoutSeconds` `toBe(600)`、未声明 `workspaceMode` `toBe(SINGLE_WRITER)`（继承）。
- `:74,:83,:92,:107` `code` `toBe(POLICY_WIDENING_REJECTED)`。
- `:98` `child.workspaceMode` `toBe(ISOLATED_WRITER)`。
- `:118` `code` `toBe(DELEGATION_DEPTH_EXCEEDED)`；`:127` `toBe(MAX_CHILDREN_EXCEEDED)`；`:137` `toBe(POLICY_VIOLATION)`。
- `:153` `code` `toBe(DEPENDENCY_CYCLE)`；`:163` 无环不抛；`:181` `code` `toBe(DEPENDENCY_NOT_FOUND)`。

## 4. 未覆盖与脆弱点

- 未覆盖：budget 超限分支、timeoutSeconds 扩大独立用例（经 `:61` 合并覆盖）、`ChildTaskLink` 其余字段、依赖环路径 details。
- 脆弱点：错误码字面锁定。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例、断言行、夹具形状 | 已证实 | 全 184 行逐行读 |
| 与 task-graph.ts 语义一致 | 已证实 | 逐条对照 `task-graph.ts:31-173` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 用例 | §2/§3 | 61-183 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
