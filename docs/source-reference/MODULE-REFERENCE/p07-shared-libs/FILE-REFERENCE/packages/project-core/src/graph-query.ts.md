---
path: packages/project-core/src/graph-query.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c951c82b94d9868be6e39daa8801d804ee8a6055
sha256: c51aadf6fdec1f6f75b27babfa7a629ed3e6790efbd59ecbb2b14034ea8f7561
lines: 660
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/project-core/src/graph-query.ts

## 1. 结论与边界

Graph **查询接口**（运行时纯函数）：摘要生成、就绪 Task、节点查找、进度统计、TaskItem→TaskGraph 派生、DAG 分层与力导向布局、「所有函数均为纯函数，不修改输入 Graph」（`packages/project-core/src/graph-query.ts:1-8`）。依赖 `./graph-state`（`getReadyTasks`/`topologicalSort`，`:23`）与 `./graph-parser`（6 个解析器，`:24`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `generateSummary` | 导出函数 | 36-66 | `(graph): GraphSummary` | 计数+nextPending(≤5)+最近完成/取消(各≤3) |
| `formatSummaryAsPreamble` | 导出函数 | 74-125 | `(summary): string` | ~300-500 token 自然语言 preamble |
| `findNodeById` | 导出函数 | 132-134 | `(graph, taskId): TaskNode \| null` | |
| `findNodesByStatus` | 导出函数 | 139-141 | `(graph, status): TaskNode[]` | |
| `getDependencyChain` | 导出函数 | 146-163 | `(graph, taskId): TaskNode[]` | 递归前置依赖（含间接） |
| `completionPercentage` | 导出函数 | 170-175 | `(graph): number` | 0-100 |
| `getExecutionPlan` | 导出别名 | 181 | `topologicalSort`（re-export） | Kahn 拓扑计划 |
| `deriveGraph` | 导出函数 | 189-252 | `(items: TaskItemInput[]): TaskGraph` | **主入口**（命名复用 TaskItem.subject，`:187`） |
| `computeLayout` | 导出函数 | 265-332 | `(graph): LayoutResult` | 最长路径分层（防环 `:279`） |
| `computeForceLayout` | 导出函数 | 401-… | `(graph, options?): ForceLayoutResult` | 力导向（斥力/引力/DAG 方向力/退火/阻尼，`:391-399`） |
| `formatTaskContext` | 导出函数 | 604-636 | 节点详情文本（分叉/产出标注，`:627-633`；QA F-NB41-04 校正符号名，formatNodeDetail 全树零命中） | |

内部：`DEFAULT_FORCE_OPTIONS`（`:337-344`，iterations 300/repulsion 5000/attraction 0.01/edgeLength 200/dagDirection 0.1/centerGravity 0.05）、`VelocityState`（`:347`）、`computeTopologicalDepth`（`:356-389`）、`countByStatus`（`:640-652`）、`toRecentCompleted`（`:654-660`）。

## 3. 内部逻辑与关键流程

- `deriveGraph`（`:189-252`）：跳过 `status==='deleted'`（`:194`）；元标记优先 description、回退 subject（`:197-206`，兼容历史误写标题）；`stripMetaTags` 净化 subject/description；**枯枝语义**：`abandonReason` 存在且非 completed → 状态置 `cancelled`（灰化+划线，与持久化 `applyEvent` 的 `task_abandon_annotated` 对齐，`:204-211` 注释）；补反向边 `dependedBy`+`edges`+`forkEdges`（`:230-249`）。
- `generateSummary`（`:36-66`）：nextPending=就绪任务按 createdAt 前 5（`:41-43`）；最近完成/取消各 3（`:46-57`）。
- `formatSummaryAsPreamble`（`:74-125`）：进度概览→失败提醒→**已取消任务明确「不要恢复」**并引导 `@forkFrom` 分叉（`:94-101`）→最近完成（含产出）→下一步→「自然地继续…不要提及底层追踪机制」（`:122`）。
- `computeLayout`（`:265-332`）：`getLevel` 递归最长路径（环保护 visited→0，`:279`）；层级分组每层内 createdAt 排序；返回 `{levels, totalLevels, maxNodesInLevel}`。
- `computeForceLayout`（`:401-660 区段`）：拓扑深度种子布局+随机偏移（`:420-448`）→ 边表（依赖+分叉，`:450-462`）→ 迭代：库仑斥力（全对，`:470-491`）/弹簧引力（`:493-509`）/DAG 方向力（浅层推左，`:511-518`）/速度阻尼 ×0.95（`:520-…`）→ 退火收敛。

## 4. 调用者与调用链

入向：真实消费者（QA F-NB41-03 校正——此前「零命中」为检索失误）：`apps/electron/src/main/ipc.ts`（import `:4417`）、`lib/pi-harness/orchestrator-bridge.ts:4`（getReadyTasks）、`reconciler.ts:1`（TaskGraph 类型）、`telemetry.ts:1`（getTaskVerificationContext）、`graph-focus-packet.ts:7`、`goal-controller.ts:1`（selectHarnessFocus）、`governor.ts:1-2`、`verification-evaluator.ts:1`、`evals/replay.ts:1`（buildGraphFromEvents/selectHarnessFocus）、`evals/types.ts:1`（GraphEvent 类型）、pi-harness 4 个测试（telemetry/goal-controller/verification-evaluator/governor/graph-focus-packet.test.ts:2）；另经 `main/lib/project-graph-service.ts:14-25`（generateSummary/formatSummaryAsPreamble）与 `renderer/atoms/graph-atoms.ts:18`（deriveGraph）落地 Electron/CLI 用法。 出向：`./types`（`:10-22`）、`./graph-state`（`:23`）、`./graph-parser`（`:24`）。

## 5. 数据 I/O、读写与副作用

无（纯函数；`computeForceLayout` 用 `Math.random` 种子偏移——同输入两次结果可不同，推断-静态）。

## 6. 分支、失败、取消与恢复

无 throw；空图返回空布局（`:267-269/:407-414`）；环依赖防死递归（visited 集）；不适用取消恢复。

## 7. 权限与权威状态

无权限分支；状态语义权威=`./types` 的 `TaskStatus` 与 deriveGraph 的枯枝映射（`:208-211` 注释与 applyEvent 对齐）。

## 8. 修改影响面

改 deriveGraph 元标记/枯枝语义影响任务图渲染与 preamble；改布局参数影响 SVG DAG/力导向视图；`graph-parser`/`graph-state` 契约同步。

## 9. 测试证据

无专属测试（冻结树 glob `**/graph-query*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出（含 formatTaskContext:604）+布局算法+枯枝语义 | 已证实 | `:36-660` |
| preamble「不要恢复」与 @forkFrom 引导 | 已证实 | `:94-101` |
| 力导向随机种子非确定 | 推断 | `:443-444` Math.random |
| 运行/渲染行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 11 导出 | §2/§3 | 36-660 | covered |
| 力导向迭代四力 | §3 | 401-620 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
