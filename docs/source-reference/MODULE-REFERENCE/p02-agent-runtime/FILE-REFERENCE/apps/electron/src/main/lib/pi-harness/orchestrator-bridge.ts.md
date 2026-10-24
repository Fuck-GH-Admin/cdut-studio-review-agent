---
path: apps/electron/src/main/lib/pi-harness/orchestrator-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2921313582a8108d8bc8db2feb595b6201dbb705
sha256: c28e5286b215621ca1fcef6c71b399e5f94b431287e15be3006684214e5f8fba
lines: 491
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/orchestrator-bridge.ts

## 1. 结论与边界

**Phase-3 编排桥**（feature-gated Pi 控制面）：为当前用户 Turn 建立 Goal/Turn 观察作用域——**从不调度第二次 query**，全部 sidecar 写入都是对当前 Turn 的观察（`orchestrator-bridge.ts:313-316`）。手动继续候选=一次性主进程票据（非提示文本/IPC 输入/sidecar 状态/自主调度队列，`:38-42`）。写入=`appendPiHarnessEvent`/`appendGraphEvent`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PiHarnessRunScope` | 接口 | `:14` | sessionId/goalId/turnId/activeTaskId?/prompt + observeLifecycle/observeToolResult/observeResult/pause/settle |
| `startPiHarnessRun` | 函数 | `:317` | `(options): PiHarnessRunScope\|undefined`——`/compact`→undefined（`:325`）；manual_compact 同（`:339`） |
| `pauseActivePiHarnessRun` | 函数 | `:464` | `(sessionId, reason='user_stop')`：pause+释放 scope |
| `settlePiHarnessRun` | 函数 | `:474` | `(sessionId,'completed'\|'failed')`：settle+释放 scope |
| `prepareManualPiHarnessCandidateContinuation` | 函数 | `:92` | 一次性票据（会话处理中/重复启动/非候选三拒，`:93-98`） |
| `releaseManualPiHarnessCandidateContinuation` | 函数 | `:104` | 释放未消费票据 |
| `getActivePiHarnessRunForTest`/`clearPiHarnessRunsForTest` | 函数 | `:484,488` | 测试替身访问器 |

内部：`manualCandidateContinuationTickets` Map（`:43`）、`latestManualCandidate`（`:45`，仅 `ready_task`+`shadow_mode`+未手动继续+goal active+shadow 的候选可续，`:49-56`）、`takeManualCandidateContinuation`（`:108`，**消费前重读确定性状态**，goalId/指纹失配→失效拒绝，`:113-116`）、`buildManualCandidateContinuationMessage`（`:79`，有限任务级用户指令+脱敏）、`createScope`（`:140`）、`policy`（`:120`，恒 governorMode:'shadow'/maxFocusChars:1200）、`usageFromResult`（`:130`）。

## 3. 内部逻辑与关键流程

- **startPiHarnessRun**（`:317-462`）：票据校验（带票据但失效→抛“候选任务已失效”，`:327-330`）→ intake 决策（manual 路径跳过）→ **minimal_root 落 Graph**（`appendGraphEvent task_created`，仅无现存 goal 时，`:342-351`）→ 组 focus packet 前缀 prompt（`:373-384`）→ **先构造全部可能抛错的状态再写生命周期事件**（防 turn_started 无终态，`:356-357`）→ 顺序写 goal_created?/manual_candidate_continued?/task_focus_changed/turn_started（`:387-429`）→ 失败兜底：turn_state_changed('failed','harness_setup_failed')+goal_paused（`:430-458`，不掩盖原错）→ 登记 activeScopes。
- **createScope**（`:140-311`）：observeLifecycle 记 running/retrying/compacting 与 usage（model_calls 推断防双计：工具结果先于 agent_end 时置 `inferredUnconfirmedModelCall`，下次确认抵扣，`:158-163,237-243`）；observeToolResult 建 ToolFact（**指纹去重**防重复事实，`:267-268`）+同推断逻辑（`:263-266`）；pause→'interrupted'+goal_paused（**:280-293**）；settle→`reconcileAndRecordShadow`（验证对账+shadow 候选记录，失败仅 warn 不阻 settle，`:294-303`）+按 outcome 写 settled/failed（**:304**）；**Turn settle ≠ Goal settle——Goal 保持 active 供用户后续**（Phase 3 从不自调度，`:305-308`）。

## 4. 调用者与调用链

- 入向：域外（agent-orchestrator/IPC 手动继续入口，grep）；测试 `orchestrator-bridge.test.ts` 13 用例。
- 出向：`./pi-harness-store`/`./graph-focus-packet`/`./goal-controller`/`./tool-facts`（**域外**）/`./reconciler`/`./governor`/`./types`（域外）/`../project-graph-service`（appendGraphEvent/loadHarnessGraphSnapshot）。

## 5. 数据 I/O、读写与副作用

写 harness 事件 JSONL（appendPiHarnessEvent）与 Graph 事件（appendGraphEvent，仅 minimal_root）；内存两张表（activeScopes/tickets）。prompt 拼接=`packet + '\n\n' + prompt`（`:384`）。

## 6. 分支、失败、取消与恢复

- 取消/暂停：pauseActivePiHarnessRun（goal paused+turn interrupted）；settle 单次（paused/settled 后忽略，`:281,295`）。
- 失败：setup 失败写 failed+paused 兜底再抛（`:430-458`）；reconcile 失败只 warn（`:299-303`）。
- 票据失效：消费前重校验（goalId/指纹），失效拒绝不回退普通 Turn（`:328-330`，测试锁定）。

## 7. 权限与权威状态

- **观察者边界**：无二次 query/无自主迁移（`taskTransitions` 恒 0）；`manual_candidate_continued` 仅记录用户点击。
- 票据权威=一次性+主进程内存+消费前重校验（防点击与启动间状态漂移，`:113-114`）。

## 8. 修改影响面

Harness 运行主链（Goal/Turn 生命周期、验证归因、shadow 候选、手动继续）；13 测试断言锁定事件序列与用量。

## 9. 测试证据

`NOT_RUN`。直接测试 `orchestrator-bridge.test.ts`（264 行/**13 个 `test(`**，机械核）：单 Goal+单 Turn+focus packet+root 仅一次（`:41-55`）；marker 声明→同 Turn 事实归因 verified+零迁移（`:57-75`）；`/compact` 零副作用（`:77-86`）；retry/compaction 同 Turn 用量合账（`:88-107`）；stop 暂停无后续 Turn（`:109-119`）；failed 如实落 failed（`:121-130`）；Stop 压掉 agent_end 时工具轮记 1 model call（`:132-144`）；推断后不双计确认（`:146-155`）；已有图不建第二 root（`:157-170`）；Write/Read/Bash 事实→verified 且不再排 Turn（`:172-193`）；仅用户选中的 ready_task 候选续跑（票据三态断言 `:195-225`）；陈旧票据拒绝且零写入（`:227-247`）；非就绪/伪造候选拒绝零改账本（`:249-263`）。mock 边界：临时 PROFER_CONFIG_DIR+真实 store/graph-service，无 mock 库。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 作用域生命周期/票据语义/用量防双计/观察者边界 | 已证实 | `:1-491` 逐行 + 13 测试互证 |
| `./tool-facts`/`../telemetry` 等域外实现 | 边界 | 未深读 |
| 真实 Pi 生命周期事件流 | 未知 | 测试用合成 lifecycle |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出+内部域 | §2 | 14-491 | covered |
| 生命周期/票据流程 | §3 | 92-462 | covered |
| 测试 13 用例 | §9 | test 文件 | covered（NOT_RUN） |
