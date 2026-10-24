---
path: packages/project-core/src/harness-query.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 066a1c3b4c8f6c1146f3b6487f585198c4d4e77d
sha256: 513dbced6bea69dbaba821453d71af4a0b8cd32a4cca9eeac58821657887b034
lines: 98
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/harness-query.ts

## 1. 结论与边界

Pi Host Harness 用的确定性 Graph 查询（头注释 :2-6）：browser-safe、无 Pi/Electron/模型/持久化依赖；只选图事实，「宿主决定选中任务是否可发起新模型轮」。

## 2. 导出与关键符号

导出 7 条（`export` :12/:14/:20/:25/:40/:66/:86）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `HarnessFocusKind` | `:12` | 'in_progress'/'previous_focus'/'ready'/'blocked'/'graphless' |
| `HarnessFocus` | `:14-18` | `{kind, task?, reason}` |
| `HarnessBlockedTask` | `:20-23` | `{task, unmetDependencies: [{id, status\|'missing'}]}` |
| `TaskVerificationContext` | `:25-30` | `{taskId, artifacts, explicitCriteria, required}` |
| `selectHarnessFocus(graph, previousFocusTaskId?)` | `:40-63` | 单焦点选择（见 §3） |
| `getHarnessBlockedTasks(graph)` | `:66-80` | pending 且有未满足依赖的任务+事实 |
| `getTaskVerificationContext(task)` | `:86-98` | 仅显式 `@verify:` 行+声明 artifacts（:83-85 注释：不从散文推断） |

内部：`stableTaskOrder`（:32-34，createdAt→id 稳定排序）。

## 3. 内部逻辑与关键流程

`selectHarnessFocus` 四级优先（:37-38 注释）：①进行中任务取最旧（:42-45）；②previous focus 仍 ready 才沿用（:47-52，pending+全依赖 completed）；③就绪任务取最旧（:54-57）；④有节点→blocked（:59-61，理由含「循环」）、空图→graphless（:62）。`getTaskVerificationContext`：`@verify:`/`verify:` 行正则提取（:88-90）、artifacts 去重排序（:94）、required=有准则或有 artifact（:96）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`index.ts:94-102` 聚合；经 index 生产消费：`pi-harness/graph-focus-packet.ts:2-5`（四符号全用）、`pi-harness/goal-controller.ts:1`（selectHarnessFocus/HarnessFocus）、`pi-harness/telemetry.ts:1` 与 `pi-harness/verification-evaluator.ts:1`（getTaskVerificationContext）、`pi-harness/evals/replay.ts:1`、`project-graph-service.ts:13-41`（selectHarnessFocus）；仅测试：批内 5 用例文件及 pi-harness 系测试。出向：`./types`、`./graph-state`（getReadyTasks :10，调用 :54）。

## 5. 数据 I/O、读写与副作用

无（纯函数，头注释 :2-6 声明）。

## 6. 分支、失败、取消与恢复

焦点四分支（:43-62）；blocked 任务列表过滤+排序（:66-80）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；「宿主决定是否发起新模型轮」是权威边界（:5-6）——本模块不产生副作用。

## 8. 修改影响面

Harness 焦点选择行为（影响模型轮调度）；`harness-query.test.ts`（5 用例）；`getReadyTasks` 依赖。

## 9. 测试证据

`packages/project-core/src/harness-query.test.ts`（批内，1 describe/5 用例，NOT_RUN）：in_progress 优先最旧（:14-21）、previous_focus 仅仍 ready（:23-31）、blocked/循环/failed 排除+unmetDependencies 事实（:33-44）、graphless 空图（:46-48）、verify 仅显式标记+artifact 去重（:50-58）。mock 边界：纯函数字面量 fixture。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 7 条；焦点四级优先 | 已证实 | :12-63 |
| verify 仅显式标记（不推断） | 已证实 | :83-98 |
| Harness 宿主消费方细节 | 未知 | 运行时装配属他文件 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `selectHarnessFocus` 四分支 | §3/§9 | :40-63 | covered |
| `getHarnessBlockedTasks`/`getTaskVerificationContext` | §2/§9 | :66-98 | covered |
| 宿主装配 | §10 | — | unknown |
