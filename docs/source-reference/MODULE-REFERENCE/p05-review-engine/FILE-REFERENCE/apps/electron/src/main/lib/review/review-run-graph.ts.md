---
path: apps/electron/src/main/lib/review/review-run-graph.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22d5e82e6813acf6efa14d81293414da3841cc56
sha256: 682962f1de45fb281e296bfe2ad38db1f81e66718dade0b6f05a2bc69acc905f
lines: 221
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-run-graph.ts

## 1. 结论与边界

审核运行图执行器（M3，头注 :1-7）：计划（模板阶段→节点图）、检查点（done+同 hash 跳过，A11/A18）、暂停（waiting-input 分支暂停不卡整跑）、取消（不启动新节点，A18/K18）、事件流（即时回调不替代持久化）。

边界：节点执行体由调用方注入（`NodeExecutor`）；持久化经 `writeCheckpoint/writeArtifact` 回调；编排入口在 `run-service-v2`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `NodeKind` | type | 11 | 11 种节点 |
| `RunGraphNode` | interface | 13-21 | id/kind/stageId/dependsOn/status/inputHash/attempts/lastError |
| `RunEventKind`/`RunEvent` | type/interface | 23-31 | 7 种事件 |
| `NodeArtifact` | interface | 35-47 | 产物（`dependencyHash`/`schemaRevision:2`，checks/opinions/observations/links/parseIndex/summary） |
| `NodeExecutor` | type | 49-50 | `done` 或 `waiting-input` |
| `planRunGraph` | fn | 64-84 | 模板→节点图 |
| `restoreCheckpoints` | fn | 87-108 | 检查点恢复 |
| `RunOutcome` | interface | 110-118 | status/checkpoints/events/waiting |
| `executeRunGraph` | fn | 122-221 | 执行循环 |

内部：`AUTO_CHECK_STEPS`（:52-62，auto-check 展开 10 技术步骤）。

## 3. 内部逻辑与关键流程

1. **`planRunGraph`**（:64-84）：auto-check 阶段展开 10 步（`node-{stage}-{suffix}`，线性 dependsOn）；人工/评分阶段 → 单 `task` 节点（注释 :67-68「不映射为任意 AI check 节点」）。
2. **`restoreCheckpoints`**（:87-108）：done+同 inputHash → skip（:96-99）；failed → pending+attempts/lastError 保留（:100-102，可重试）。
3. **`executeRunGraph`**（:122-221）：依赖就绪循环（waiting 下游本轮跳过，:138-147）；`cancelled()` 时 break（:142）；done → checkpoint+`writeArtifact`（`outputRef=artifacts/{nodeId}.json`，:155-165）；waiting-input → checkpoint+`waiting[]`+`node-waiting`（:166-176）；抛错 → attempts+1+failed checkpoint+`node-failed`（:178-188）。收尾：cancelled → `run-cancelled`（不产生完成事件，K18，:192-196）；anyFailed → `failed`；anyWaiting → `awaiting-input`；有 pending 未就绪 → `failed`（`N 个节点无法就绪（依赖缺失或计划错误）`，绝不 completed，07 §4.3，:204-210）；否则 `run-completed`。

## 4. 调用者与调用链

入向（生产）：`run-service-v2.ts:12`（executeRunGraph/planRunGraph + 类型）；`pi-review-executor.ts:10`、`v2-executor-factory.ts:16`（NodeExecutor/NodeKind 类型）。测试：`review-run-graph.test.ts:6`。出向：`@profer/shared` 类型（:9）；纯函数+回调。

## 5. 数据 I/O、读写与副作用

无直接 I/O；经 `options.writeArtifact/writeCheckpoint` 回调持久化（调用方）；`onEvent` 即时回调（注释 :144-145 N2b）。

## 6. 分支、失败、取消与恢复

失败/等待/取消全状态机表达；`restoreCheckpoints` 支持 failed→pending 重试；取消保留已完成（注释 :191）；环/缺依赖 → failed（不 completed）。

## 7. 权限与权威状态

- 诚实状态权威：无法就绪节点绝不 completed（:204-210）；取消不产生完成事件（K18）。
- 产物权威：`NodeArtifact.dependencyHash` 是恢复核验依据（07 §4.2 注释 :33「不能只返回 done+hash」）。
- 人工阶段权威：task 节点由应用服务建 WorkflowTask（注释 :67-68）。
- 无 sender/role 检查。

## 8. 修改影响面

`run-service-v2` 编排、Pi 执行器节点语义；AUTO_CHECK_STEPS 命名被测试/产物路径依赖（`node-auto-check-*`）。同测：`review-run-graph.test.ts`（6 用例）。

## 9. 测试证据

直接测试 `review-run-graph.test.ts`（6 用例 / 2 describe；纯函数+假执行器；NOT_RUN）：
1. `:15-30` planRunGraph：12 节点 id 序列（auto 10 步+2 task）、线性依赖、task kind。
2. `:34-43` 全成功 → `completed`、11 checkpoints、含 `node-started`/`run-completed`。
3. `:45-62` waiting-input → `awaiting-input`、waiting 明细、下游 c 无 checkpoint。
4. `:64-78` restoreCheckpoints：done+同 hash skip `['n1']`、failed→pending。
5. `:80-94` 取消 → `cancelled`、`run-cancelled`、checkpoints<3、无 `run-completed`。
6. `:96-103` 抛错 → `failed`、attempts 1、lastError 含 `模型超时`。

未覆盖：无法就绪 failed 分支、产物 outputRef、事件全集；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 10 步展开/分支暂停/取消 K18/failed 重试 | 已证实 | :52-108/:166-196 + 测试 |
| 未就绪绝不 completed | 已证实 | :204-210 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `planRunGraph`/`restoreCheckpoints` | §3.1-3.2/§9 | 64-108 | covered |
| `executeRunGraph` done/waiting/failed/取消 | §3.3/§9 | 122-196 | covered |
| 未就绪 failed 分支 | §3.3 | 204-210 | partial（未测） |
