---
path: packages/shared/src/utils/cslab-canvas.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f288f1951ebc07a09380b7379456b94a72616a8e
sha256: 26ce8ad7e4702ecb4d08a296933d84141235e7a5fb8719d6c993a43a21879b95
lines: 288
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-canvas.ts

## 1. 结论与边界

CSLab **JSON Canvas 无损读写纯函数**（`packages/shared/src/utils/cslab-canvas.ts:1-8`）。三契约：① 只负责 `cdut_science` 命名空间，绝不改 Obsidian 原生字段（文本/坐标/颜色）；② 序列化保留未知顶层/节点/边字段（与 Obsidian 双向互通）；③ 冲突合并只合并 `cdut_science`，结构差异由调用方写时间戳分叉副本。

边界：`parseCanvasDocument` 缺字段温和归一化但**绝不补造业务内容**（`:63`）；group 节点不参与推演（`:138`）；未标记 `cdut_science` 节点正常渲染但不剪枝（`:122-123`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parseCanvasDocument` | function | 64-85 | `(text) => CsLabCanvasDocument` | 温和归一化 |
| `serializeCanvasDocument` | function | 88-96 | `(doc) => string` | 稳定序：nodes→edges→未知顶层，`\n` 结尾 |
| `createEmptyCanvasDocument` | function | 98-100 | `() => {nodes:[],edges:[]}` | |
| `canvasToDagGraph` | function | 125-172 | `(doc) => {nodes: CsLabDagNodeInput[]; edges: CsLabDagEdgeInput[]}` | |
| `applyDagEvaluation` | function | 179-202 | `(doc, evaluation, cancelledJobIds?) => doc` | 写派生状态 |
| `CanvasMetaMergeResult` | interface | 204-208 | `{document; orphanNodeIds[]; orphanEdgeIds[]}` | |
| `mergeCanvasScienceMeta` | function | 214-266 | `(diskDoc, incomingDoc) => CanvasMetaMergeResult` | 仅合并 cdut_science |
| `buildConflictRelPath` | function | 273-279 | `(relPath, now?) => string` | `{base}_conflict_YYYYMMDD_HHmm.canvas` |
| `canvasTitleFromRelPath` | function | 282-288 | `(relPath) => string` | 去扩展名/连字符，空→「未命名画布」 |

内部：`NODE_TYPES`（`:22`）、`isRecord/finiteNumber`（`:24-30`）、`normalizeNode`（`:32-49`，id 缺省 `node-N`、type 缺省 text、坐标缺省 0/260/140、`cdut_science` 仅 record 才保留）、`normalizeEdge`（`:51-61`，from/toNode 必须字符串否则丢弃）、`normalizeManualState/resolveManualStatus`（`:102-113`）、`normalizeOperator`（`:115-117`，非 OR 即 AND）、`pad2`（`:268-270`）。

## 3. 内部逻辑与关键流程

### 3.1 读写（`:64-100`）

JSON.parse 失败 → `'Canvas 文档不是合法 JSON'`；非 record → `'Canvas 文档格式无效'`；缺 nodes/edges 数组 → 抛（`:71-74`）。未知顶层字段经 `...rest` 透传（`:83-84`）；序列化 `nodes→edges→rest` 稳定序（`:88-96`）。

### 3.2 `canvasToDagGraph`（`:125-172`）

- OR 目标预扫：边 `dependency_type==='disjunctive'` 的 toNode 入 `orTargets`（`:129-132`）。
- 参与条件（`:140-147`）：`cdut_science` 五字段（cdut_uri/node_kind/logical_operator/verification_status/manual_status）任一存在；group 排除。
- operator：`logical_operator` 显式 → OR/AND；否则 orTargets → OR；默认 AND（`:153-157`）。
- state= `resolveManualStatus`（manual_status 优先，`pruned` 派生绝不当人工输入，`:106-113`）；`gpu_task_id` 透传。
- 边仅保留两端都在参与节点集内（`:166-169`）。

### 3.3 `applyDagEvaluation`（`:179-202`）

深拷贝后逐节点：**先固化人工事实 `manual_status` 再写派生 `verification_status`**（`:191-193`，pruned 不污染 manual）；`pruned` 且 gpuTaskId 在取消清单 → `job_cancel_requested: true`（任务 ID 保留供 Phase 4 真取消，`:177,195-197`）。

### 3.4 `mergeCanvasScienceMeta`（`:214-266`）

磁盘文档为基、incoming 的 `cdut_science` 浅覆盖（节点 `:224-243`、边 `:245-255`）；旧版画布只写 verification_status 时**补齐 manual_status**（限 verified/dead_end/pending，防旧磁盘 manual 覆盖用户新设值，`:228-235`）；磁盘不存在的节点/边进 orphan 列表（`:259-264`，调用方写分叉）。

### 3.5 路径工具（`:273-288`）

`buildConflictRelPath`：本地时间戳 `YYYYMMDD_HHmm`（依赖 `now` 的本地 getFullYear 等）；`canvasTitleFromRelPath`：取 basename、去 `.canvas`、`[-_]+`→空格。

## 4. 调用者与调用链

出向：`../types/cslab`（9 类型，`:10-20`）。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:117-126`）：

- `parseCanvasDocument`：`apps/electron/src/main/lib/cslab/cslab-vault-index.ts:20,209`、`cslab-canvas-sync.ts:30,164,187,247`、`cslab-canvas.test.ts`（批外 19 test）。
- `serializeCanvasDocument`：`cslab-canvas-sync.ts:31,96,212,275`、测试多处。
- `createEmptyCanvasDocument`：`cslab-canvas-sync.ts:27,211,249`。
- `canvasToDagGraph`：`CsLabDagCanvas.tsx:28,165`、`cslab-canvas-sync.ts:26,111`、测试。
- `applyDagEvaluation`：`cslab-canvas-sync.ts:23,123`、测试。
- `mergeCanvasScienceMeta`：`cslab-canvas-sync.ts:29,252`、测试 `:481`。
- `buildConflictRelPath`：`cslab-canvas-sync.ts:24,78`。
- `canvasTitleFromRelPath`：`cslab-canvas-sync.ts:25,167`、`CsLabStagePane.tsx:33,138`。
- `CanvasMetaMergeResult`：仅内部+barrel（零外部引用）。
- 产品入口：main（cslab-canvas-sync/cslab-vault-index）+ renderer（CsLabDagCanvas/CsLabStagePane）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数（JSON 深拷贝出入）；磁盘 I/O 在调用方 cslab-canvas-sync。

## 6. 分支、失败、取消与恢复

抛错仅 3 处（JSON/格式/缺数组，`:69-74`）；「取消」= `job_cancel_requested` 标记（`:195-197`，本文件不执行取消）；「恢复」= 分叉副本命名（`:272-279`，写入由调用方）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；契约①③即权威口径：Obsidian 原生字段不可触碰、`manual_status` 优先于派生值（`:106-113,191-193,228-235`）。

## 8. 修改影响面

- 归一化默认值（node-N/坐标 0/260/140）与稳定序列化序是互通契约。
- `manual_status` 补齐逻辑（`:230-235`）与 `resolveManualStatus` 同口径。
- 测试：批外 `cslab-canvas.test.ts`（19 test，:82-481）。

## 9. 测试证据

无本批直接测试；间接 `apps/electron/src/main/lib/cslab/cslab-canvas.test.ts`（批外 19 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三契约（命名空间/无损/合并边界） | 已证实 | `:4-7,83-84,224-255` |
| manual 优先于派生 | 已证实 | `:106-113,191-193,230-235` |
| 参与条件 5 字段+group 排除 | 已证实 | `:137-147` |
| orTargets 兜底 OR | 已证实 | `:129-132,153-157` |
| `CanvasMetaMergeResult` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 真实 .canvas 语料分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2 | 64-288 | covered |
| 读写归一化 | §3.1 | 32-100 | covered |
| canvasToDagGraph | §3.2 | 125-172 | covered |
| applyDagEvaluation | §3.3 | 179-202 | covered |
| merge/orphan | §3.4 | 214-266 | covered |
| 路径工具 | §3.5 | 273-288 | covered |
