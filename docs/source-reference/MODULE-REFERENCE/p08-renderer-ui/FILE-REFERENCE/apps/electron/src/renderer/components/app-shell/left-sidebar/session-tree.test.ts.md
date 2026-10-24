---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b5ff9f279e4c3dc7cb7fab3974bc9699d287eaf
sha256: 499444663054133d31380fdbc32d7772f37dd8b7d978024940287f56ec389e8f
lines: 224
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.test.ts

## 1. 测试目标

关联会话树与状态聚合单测（Given/When/Then 中文 BDD 风格）：血缘归并/跨项目不串线、删除级联范围、父行展开信息（计数/标签）、置顶收纳、状态聚合优先级与时序窗口。被测：`buildAgentSessionTrees`/`collectDelegatedDeletionSessionIds`/`getRelatedSessionSummary`/`hasPinnedVisibleParent`/`getSessionTreeStatus`/`getDelegatedChildStatus`。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

6 describe、**14 test**：

### 2.1 `buildAgentSessionTrees` 血缘（2，`:49-85`）
1. `:50-67` 探索分支挂主会话下（不重复显为根）。
2. `:68-85` **workspaceId 不一致时保持为根**（防跨项目串线）。

### 2.2 `collectDelegatedDeletionSessionIds`（1，`:86-104`）
3. `:87-103` 嵌套委派+普通会话：仅根+委派后代（探索/普通不入）。

### 2.3 `getRelatedSessionSummary`（3，`:105-151`）
4. `:106-120` 仅委派：showCount+标签“子会话”。 5. `:121-135` 仅探索：不计数+“探索分支”。 6. `:136-151` 混合：不计数+“关联会话”。

### 2.4 `hasPinnedVisibleParent`（1，`:152-165`）
7. `:153-164` 主会话置顶→分支收纳其下。

### 2.5 `getSessionTreeStatus` 聚合（6，`:166-216`）
8. `:167-173` 子完成未查看→父 idle（不显绿标）。 9. `:174-180` 子 running→父 running。 10. `:181-187` 子 blocked→父 blocked。 11. `:188-194` 父自身 completed 保持。 12. `:195-201` 父 completed+子 running→running（优先级）。 13. `:202-207` 无子→idle。 14. `:208-…` **无实时指示器但 delegationStatus=running → 子 running 并上聚合**（时序窗口口径）。

## 3. 真实断言

- #2 跨项目不归并（历史异常数据口径）。
- #8/#14 是状态聚合两条核心口径的回归（后台结果不伪装完成/时序窗口不误判）。
- 计数/标签三态（#4-#6）逐格断言。

## 4. 未覆盖与脆弱点

**未覆盖**：`collectDelegatedDeletionSessionIds` 环防御路径；`getSyncableDelegatedChildren`/`getDirectRelatedChildren`/`getDelegationSummary`（经 getRelatedSessionSummary 间接）；`collectTreeSessionIds`。

**脆弱点**：手工 `AgentSessionMeta` 夹具与实现字段耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 describe、14 test、纯内存 | 已证实 | `:49-216`；`grep -c test(`=14 |
| 血缘/跨项目口径 | 已证实 | `:50-85` |
| 聚合优先级/时序窗口 | 已证实 | `:166-216` |
| 环防御等分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildAgentSessionTrees` | #1/#2 | `:50-85` | covered |
| 删除级联 | #3 | `:87-103` | covered |
| `getRelatedSessionSummary` | #4-#6 | `:106-151` | covered |
| `hasPinnedVisibleParent` | #7 | `:153-164` | covered |
| 状态聚合 | #8-#14 | `:167-216` | covered |
