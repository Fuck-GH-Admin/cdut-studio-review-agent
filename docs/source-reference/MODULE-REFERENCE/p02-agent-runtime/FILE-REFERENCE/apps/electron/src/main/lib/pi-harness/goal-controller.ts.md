---
path: apps/electron/src/main/lib/pi-harness/goal-controller.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2adfb9df66631355eabc772a2f1794fe6044d8f
sha256: 33b95d551369ce26af984f68e181c02cbe0ae42467469396475481457074bf0e
lines: 88
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/goal-controller.ts

## 1. 结论与边界

**Goal 准入判定**：判断用户请求是否需要最小可见任务骨架；**保守失败**——不清/纯聊天请求保持 graphless 直到 Agent 自行展开（`goal-controller.ts:53-57`）。rootTask 仅是提案，Phase 2 不自己写任务（`:17-18`）。纯函数，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GoalIntakeKind` | 类型 | `:3` | manual_compact/existing_graph/minimal_root/graphless |
| `GoalIntakeRequest` | 接口 | `:5` | userMessage/graph/previousFocusTaskId?/goalConflict?（冲突须调用方声明不推断，`:9`） |
| `GoalIntakeDecision` | 接口 | `:13` | kind/focus/reason/rootTask?（仅提案） |
| `decideGoalIntake` | 函数 | `:58` | `(request): GoalIntakeDecision` |

内部：`EXECUTION_SIGNAL`/`MULTI_STEP_SIGNAL`/`SIMPLE_QUESTION` 三正则（`:21-23`，中英双语）；`rootSubject`（`:25`，80 codepoint 截断）；`rootVerificationMarkers`（`:37`，行级 `@verify:/@artifact:` marker，≤240 字符/最多 3 条，散文绝不当指令 `:32-36`）。

## 3. 内部逻辑与关键流程

`decideGoalIntake`（`:58-88`）：①`/compact`→manual_compact（硬任务边界，`:62-64`）；②图非空且无 goalConflict→existing_graph（不重复建根，`:65-67`）；③`shouldCreateRoot` = 非空 且 EXECUTION_SIGNAL 且（MULTI_STEP_SIGNAL 或非 SIMPLE_QUESTION）→minimal_root（subject 截断+marker 注入 description，`:69-86`）；④否则 graphless（`:87`）。

## 4. 调用者与调用链

- 入向：`orchestrator-bridge.ts:7`（startPiHarnessRun 内，`:334-338`）、`evals/replay.ts:3`（本批）。
- 出向：`@profer/project-core`（selectHarnessFocus/TaskGraph，`:1`）。

## 5. 数据 I/O、读写与副作用

无（纯判定）；rootTask 由 bridge 落 Graph（本文件不写）。

## 6. 分支、失败、取消与恢复

四类 intake 分支（§3）；无抛错。

## 7. 权限与权威状态

用户意图判定权威=三正则（保守：疑问句不建骨架）；marker 仅声明形（@verify/@artifact）进 root，散文不当完成契约（`:32-36`）。

## 8. 修改影响面

Goal 建立/骨架提案；测试 6 断言锁定分类。

## 9. 测试证据

`NOT_RUN`。直接测试 `goal-controller.test.ts`（45 行/**6 个 `test(`**）：`/compact`→manual_compact（`:14-16`）；已有图→existing_graph+focus 继承（`:18-20`）；多步执行→minimal_root（subject 含原文+description 含“最小任务骨架”，`:22-26`）；**仅行级 marker 进 root、散文不进**（`:28-36`）；疑问句→graphless（`:38-40`）；goalConflict→minimal_root（`:42-44`）。无 mock（graph/node 构造夹具 `:5-11`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四类判定/marker 提取/保守失败 | 已证实 | `:1-88` 全文 + 6 测试互证 |
| `selectHarnessFocus` 行为 | 边界 | project-core 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+3 正则+2 内部 | §2/§3 | 3-87 | covered |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
