---
path: apps/electron/src/main/lib/project-graph-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73acd3da048bf00bde10a43e683dd6c2e7e889c0
sha256: affa309f456e02bd98b6a36def43782ff79a6f1a9c7cb63a47c9425a7d09a445
lines: 194
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/project-graph-service.ts

## 1. 结论与边界

主进程 Project Graph 服务（文件头 `apps/electron/src/main/lib/project-graph-service.ts:1-8`）：桥接 `@profer/project-core` 与 Electron 主进程——①把 GraphEvent 追加写 `project-{uuid}.jsonl`；②IPC 查询接口；③Project 元数据（存 `AgentSessionMeta` 扩展字段）。算法层全在 project-core；本文件负责**路径安全**（会话 ID 校验防注入 + 拒 symlink + 目录内复核，`:62-66`）。

## 2. 导出与关键符号

`export` 逐条核对：10 个函数 = 10 个导出（类/接口/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `loadGraph` | 函数（导出） | 82-90 | JSONL→`buildGraphFromEvents`；无文件→空图 |
| `getGraphSummary` | 函数（导出） | 95-98 | `generateSummary(graph)` |
| `loadHarnessGraphSnapshot` | 函数（导出） | 104-120 | 一次加载派生 `{graph,readyTaskIds,focusTaskId,focusReason}`（Harness 禁止各自重读 JSONL，`:100-103`）；ready 按 `createdAt` 再 id 排序（`:113-116`） |
| `getProjectPreamble` | 函数（导出） | 125-129 | 空图返回 `''` |
| `queryNodeById`/`queryNodesByStatus`/`queryProgress` | 函数（导出） | 136-155 | 节点/状态/完成度查询 |
| `initProjectMeta` | 函数（导出） | 163-166 | `createProjectMeta(sessionId,graphJsonlPath)` |
| `syncProjectMetaFromGraph` | 函数（导出） | 171-178 | 计数=节点总数/completed 数，`updateTaskCounts(touchProject(meta),…)` |
| `appendGraphEvent` | 函数（导出） | 186-194 | `serializeEvent`+`appendFileSync`（自动 mkdir） |
| `assertSafeSessionId`/`realpathCandidate`/`isPathInside`/`getSafeGraphPath` | 内部 | 49-80 | 路径安全核心 |

## 3. 内部逻辑与关键流程

`getSafeGraphPath`（`:67-80`）：`isSafeSessionId`（project-core）不合法抛 `无效的会话标识`；`getGraphJsonlPath(getAgentSessionsDir(), sessionId)`；**已有 Graph 文件是 symlink → 抛 `任务图文件不允许使用符号链接`**（防本地恶意文件把安全文件名重定向出会话目录，`:64-65,72-74`）；`realpathCandidate`（存在取 realpath，否则父目录 realpath+拼接，`:53-56`）必须 `isPathInside(realSessionDir,…)` 否则抛 `任务图路径不在会话目录内`。

## 4. 调用者与调用链

入向：pi-builtin-tools 的 `mcp__task-graph__proma_task_create/update`（`appendGraphEvent`/`queryNodeById`，nb-53 手册）；会话创建（`initProjectMeta`）；Harness（`loadHarnessGraphSnapshot`）；IPC 查询面。测试：`project-graph-service.test.ts`（116 行，本批）。出向：`node:fs/path`、`./config-paths.ts:12`、`@profer/project-core`（本文件 `:13-41` import 全部算法）、`@profer/shared`（`AgentSessionMeta` 类型）。

## 5. 数据 I/O、读写与副作用

- 读：`project-{uuid}.jsonl`（`readFileSync`）；写：`appendFileSync` 追加事件行（自动 `mkdirSync`）。
- 无缓存/状态；每次调用重读（`loadGraph`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非法 sessionId | 抛 `无效的会话标识` | 50 |
| Graph 文件 symlink | 抛 `任务图文件不允许使用符号链接` | 73 |
| 路径出目录 | 抛 `任务图路径不在会话目录内` | 76-78 |
| 文件不存在 | 空图/正常写入（mkdir） | 84-86,189-191 |
| 空图 preamble | `''` | 127 |

无取消概念；JSONL 追加即恢复语义（replay 构图）。

## 7. 权限与权威状态

- 路径安全三层（ID 校验/symlink 拒/目录复核）为写入权威；算法权威在 `@profer/project-core`（纯函数）。
- Harness 快照语义：一次加载，防止 focus/ready 各自重读不一致（`:100-103`）。

## 8. 修改影响面

改路径安全影响任务图完整性/安全；改快照排序影响 Harness focus；影响 `project-graph-service.test.ts` 与 task-graph 工具（nb-53）。

## 9. 测试证据

直接测试：`project-graph-service.test.ts`（116 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| symlink 拒绝+目录复核 | 已证实 | `:62-80` |
| 每次重读（无缓存） | 已证实 | `:82-90` |
| Harness 一次加载语义 | 已证实 | `:100-120` |
| JSONL 追加+自动建目录 | 已证实 | `:186-194` |
| project-core 算法内部 | 未知 | 文件外 |
| 生产接线全貌 | 未知 | 本批未逐行核 IPC |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 路径安全 | §3 | 49-80 | covered |
| 读/查询族 | §2 | 82-155 | covered |
| 元数据 | §2 | 163-178 | covered |
| 写入 | §3 | 186-194 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
