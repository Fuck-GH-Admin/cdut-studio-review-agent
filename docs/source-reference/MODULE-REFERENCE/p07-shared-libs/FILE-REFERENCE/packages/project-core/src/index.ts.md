---
path: packages/project-core/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13f0cd0cae07d3969e19245a26d5866859694865
sha256: 0d39218ef24c5e3b6dd72f18c8d3753828cefbc0b60a370639e39b61ce4268cb
lines: 118
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/project-core/src/index.ts

## 1. 结论与边界

`@profer/project-core` 包入口 barrel（头注释 :1-6：Agent 项目编排 headless 核心，导出全纯函数、浏览器安全）：纯 re-export，无运行时代码。

## 2. 导出与关键符号

7 块聚合（`export` :9/:45/:55/:65/:78/:94/:105）：`./types` 33 类型（:9-42）、`./graph-parser` 6 函数（:45-52）、`./task-tool-names` 5+1（:55-62）、`./graph-state` 9（:65-75）、`./graph-query` 12（:78-91）、`./harness-query` 3 函数 + 4 类型（:94-102）、`./project-meta` 12（:105-118）。注意：聚合面含 18 清单外模块（graph-parser/graph-query）。

## 3. 内部逻辑与关键流程

不适用，依据：纯 re-export 无逻辑。

## 4. 调用者与调用链

入向（子agent 交叉核）：裸说明符 `@profer/project-core` → exports "."，**30 importer（23 生产+7 测试）**。生产前 5：`project-graph-service.ts:13-41`、`agent-session-manager.ts:115-119`、`pi-harness/graph-focus-packet.ts:1-7`、`renderer/atoms/graph-atoms.ts:17-25`、`renderer/lib/task-graph-events.ts:1-2`；其余 pi-harness 系 8 文件、adapters/pi-builtin-tools.ts:15、task-graph-event-converter.ts、retrospective-service.ts:18、渲染层 4 文件、preload/index.ts:1107-1116、ipc.ts:4417。测试 7：pi-harness 系 5+task-graph-event-converter.test+task-graph-layout.test。包内相对：project-core.test.ts:8-42、task-tool-names.test.ts:2-7。出向：仅 7 个包内模块 re-export。

## 5. 数据 I/O、读写与副作用

无（浏览器安全由纯函数结构保证，:5）。

## 6-7. 分支/权限

不适用，依据：纯 re-export。

## 8. 修改影响面

全部 30 个 importer；聚合面增删需同步 package.json exports 与消费方。

## 9. 测试证据

经 `project-core.test.ts`（8-42 对聚合面集成测试）+ `task-tool-names.test.ts` 间接覆盖。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 块聚合、纯 re-export | 已证实 | :9-118 |
| 30 importer（23 生产） | 已证实 | §4 子agent 交叉核 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 聚合块 | §2 | :9-118 | covered |
| 消费面 | §4 | — | covered |
