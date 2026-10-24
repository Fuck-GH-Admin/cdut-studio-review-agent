---
path: apps/electron/src/main/lib/task-graph-event-converter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e0fea12dd992090021e8fb0e87677b72aa3a8737
sha256: 7f88596aa919ce912ac6130bf79f856847b00b7b0393e2760a2e6ff88dd28240
lines: 155
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/task-graph-event-converter.test.ts

## 1. 测试目标

`task-graph-event-converter` 的事件转换契约（155 行，bun:test，2 describe/9 test）：①`nativeTaskToolToGraphEvents` 的事件生成/清边/auto-link 不覆盖显式/completed 拦截/completionBlocked 识别/MCP 结构化结果+delegation 三事件；②`structuredTaskAutoLinkEvent` 跨 run 兜底。mock 边界：**无 mock**——真实转换函数 + `@profer/project-core.buildGraphFromEvents` 真实归并（`:2`）。

## 2. 用例清单

依赖顺序：无（各用例独立调用）。fixture：`createToolCall(id)`（`:90-96`，proma_task_create 工具+result JSON）。

**describe `nativeTaskToolToGraphEvents`（`:13-88`，6 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 1 | persists native TaskCreate after its SDK tool result | 14-26 | `nextCurrentTaskId` toBe('task-1')；events toEqual `task_created`（payload subject/description/dependsOn:[]）+`task_session_linked`（sessionId） |
| 2 | explicit empty dependencies replace and clear old graph edges | 28-45 | 三事件链 buildGraphFromEvents 后 `nodes.b.dependsOn` toEqual([])、`nodes.a.dependedBy` toEqual([])、`edges` toEqual([])（显式空数组清边） |
| 3 | auto-links child tasks and sequential tasks without overriding explicit | 47-65 | 子任务 payload `{dependsOn:[], forkFrom:'parent'}`；后续任务 `dependsOn:['finished']`；显式任务 `dependsOn:['chosen']` 且 `not.toHaveProperty('forkFrom')` |
| 4 | Given running delegations When TaskUpdate requests completed Then no early completion | 67-77 | `completionBlockedByRunningDelegations:true` 时 completed 更新 events toEqual([]) |
| 5 | recognizes completionBlocked from structured result | 78-84 | `isTaskCompletionBlocked(JSON{completionBlocked:true})` toBe(true)；false/字符串 toBe(false) |
| 6 | reads MCP structured create result and emits delegation trio | 85-88 | `delegationToGraphEvents` 三事件（created forkFrom/session_linked childSessionId/in_progress）与 `delegationLinkFromResult` 双格式 |

**describe `structuredTaskAutoLinkEvent`（`:97-155`，3 test）**：
| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 7 | lastCompletedTaskId 连边 | 97-135 | 无 currentTaskId 时 `task_updated{dependsOn:['a']}`（taskId 'new-b'） |
| 8 | 显式 dependsOn 优先于兜底，不额外加边 | 137-144 | 显式 `dependsOn:['x1']` → evt toBeUndefined() |
| 9 | currentTaskId 优先 forkFrom 不重复连 dependsOn | 146-154 | `task_updated{forkFrom:'parent'}`（taskId 'fork-b'） |

声明合计 **9 test / 0 it**（机械计数）。

## 3. 真实断言

逐条见 §2 表。关键精确断言：`:21-25`（toEqual 两事件结构）；`:42-44`（三重清边）；`:61-64`（`not.toHaveProperty('forkFrom')`）；`:75`（拦截后 `events` toEqual([])）；`:83`（三种 completionBlocked 输入）；`:131-134`/`:150-153`（toEqual 单事件结构）。

## 4. 未覆盖与脆弱点

- **未覆盖**：`resolveRecentAutoLinkTaskId`（loadGraph 成功/失败两分支）、`structuredTaskToolCurrentTaskId`、legacy `Task #N` 正则路径、`task_deleted`/`task_abandon_annotated` 分支、`isDelegateAgentTool`。
- **脆弱点**：用例 2/6 依赖 `buildGraphFromEvents`/`parseDependsOn` 的跨批真实实现（无 mock，语义变化会连锁改断言）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe/9 用例设置/动作/断言如上 | 已证实 | `:1-155` 全文逐行 |
| 声明计数 9 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| 无 mock（真实 project-core） | 已证实 | `:2` |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| TaskCreate 事件/清边/auto-link/拦截/completionBlocked/delegation | §2.1/§3 | 14-88 | covered |
| structuredTaskAutoLinkEvent 三路 | §2.2/§3 | 97-154 | covered |
| 未覆盖分支清单 | §4 | - | unknown（未覆盖） |
