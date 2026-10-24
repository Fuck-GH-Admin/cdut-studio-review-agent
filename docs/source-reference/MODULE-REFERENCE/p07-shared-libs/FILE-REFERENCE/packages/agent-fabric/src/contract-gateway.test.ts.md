---
path: packages/agent-fabric/src/contract-gateway.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df0bc488c5cc1d0cdd4d0eed848325217ebefb9f
sha256: c507c15067aecf07d6cc6cc44806fdf28ca585555816853a4a7b0341a142ca07
lines: 363
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-gateway.test.ts

## 1. 测试目标

`AgentFabricGateway` Phase 1 验收：提交/幂等/路由/能力拒绝/写租约/取消/事件游标/结果查询（`contract-gateway.test.ts:3`）；**全部用假执行器，不启动真实 Agent**（`:4`）。bun:test。

## 2. 用例清单

共 **16 个 `it(`**（计数核对）。测试替身：`FakeExecutor`（`:54-68`，记录 started/cancelled，complete/fail 由测试手动触发）、`pairedCaller`（`:70-74`，paired-local-agent + 默认 grant + WORKSPACE_WRITE）、`makeRequest`（`:90-106`，taskId 自增）、`makeGateway`（`:108-118`，内存 registry/store + 固定 executor）。

| 行 | 用例 | 要点 | 依赖顺序 |
| --- | --- | --- | --- |
| `:121` | 合法提交 created→running、执行器收到任务 | deduplicated=false | 独立 |
| `:134` | 同 requestId 重复提交同任务不重复执行 | deduplicated=true | 独立 |
| `:145` | 目标节点不存在拒路由 | AGENT_NOT_FOUND | 独立 |
| `:157` | 离线节点不执行留 queued（测试标题如此；断言=提交抛 AGENT_OFFLINE 且无任务落库） | AGENT_OFFLINE | 独立 |
| `:168` | 无 task.submit 拒 | CAPABILITY_DENIED | 独立 |
| `:180` | 写任务要 workspace.write | CAPABILITY_DENIED | 独立 |
| `:204` | maxConcurrency=1 第二个留 queued、完成后自动推进 | 并发限制 | 顺序 |
| `:220` | 写冲突 fail：第二个写任务直接 FAILED | failureReason 含"写租约" | 顺序 |
| `:235` | 写冲突 queue：租约释放后自动推进 | 顺序语义 | 顺序 |
| `:254` | 结果可查、事件序列完整、游标恢复 | 6 事件类型序 | 独立 |
| `:285` | 运行中取消：执行器收到 cancel、终态、并发释放 | 顺序 | 独立 |
| `:300` | 终态不可再取消 | TASK_TERMINAL | 独立 |
| `:315` | 执行器 fail 上报→FAILED+原因 | failureReason | 独立 |
| `:325` | 重复 settle 被忽略 | complete 后 fail 无副作用 | 独立 |
| `:336` | 未配对调用方读任务被拒 | getTask 抛 | 独立 |
| `:344` | 产物读需 artifact.read 且过期拒 | 两段断言 | 独立 |

## 3. 真实断言

- `:128-131` `deduplicated` `toBe(false)`、`task.status` `toBe(RUNNING)`、`executor.started` `toHaveLength(1)`、taskId 一致。
- `:140-142` 重复提交 `deduplicated` `toBe(true)` + 同 taskId + started 长度 1。
- `:152,:164,:176,:198` 错误码精确（AGENT_NOT_FOUND/AGENT_OFFLINE/CAPABILITY_DENIED×2）。
- `:209-217` 第二个 `toBe(QUEUED)`；complete 后 `started` `toHaveLength(2)` 且第一个 `toBe(COMPLETED)`。
- `:231-232` 第二个写任务 `toBe(FAILED)` + `failureReason` `toContain('写租约')`。
- `:271-278` 事件类型序列 `toEqual(['task.created','task.accepted','task.started','task.progress','task.artifact_created','task.completed'])`；游标恢复 `toEqual(['task.progress','task.artifact_created','task.completed'])`。
- `:292-297` 取消后 `toBe(CANCELLED)`、`executor.cancelled` `toEqual([taskId])`、新任务立即 `toBe(RUNNING)`（并发已释放）。
- `:311,:360` TASK_TERMINAL / ARTIFACT_EXPIRED。
- `:321-322` `toBe(FAILED)` + `failureReason` `toBe('模型调用失败')`。
- `:333` 重复 settle 后仍 `toBe(COMPLETED)`。
- `:341` 未配对 `toThrow(ProtocolError)`；`:354` 无 artifact.read 抛。

## 4. 未覆盖与脆弱点

- 未覆盖：`expireOrphanedTasks`、`onTaskEvent` 监听器、`heartbeat/discoverAgents`、跨重启 `findByRequestId` 命中路径（内存 store 注入）、`listTasks` 无过滤行为无断言。
- mock 边界：FakeExecutor=测试替身（真 gateway+真 store/registry 内存实现）；不启动真实 Agent（文件头 `:4` 声明）。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例、断言行、替身结构 | 已证实 | 全 363 行逐行读 |
| 与 gateway.ts 语义一致 | 已证实 | 逐条对照 `gateway.ts:189-539` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 16 用例 | §2/§3 | 121-362 | covered |
| 未覆盖点/替身边界 | §4 | — | covered（如实） |
