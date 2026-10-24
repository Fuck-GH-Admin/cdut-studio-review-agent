---
path: packages/shared/src/utils/cslab-dag.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6100ed86c10ebb2eac57f5013d07e5dc7bc86e29
sha256: 612c1966d44292112b26cf830347d93ceb770cac2c151c5e2a10327f2dd56f66
lines: 252
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/cslab-dag.ts

## 1. 结论与边界

CSLab Prove2Me **DAG 推演引擎**（主/渲染共用纯函数，`packages/shared/src/utils/cslab-dag.ts:1-8`）。三条关键契约（`:4-7`）：① `pending/verified/dead_end` 是**人工事实**，`pruned` 是拓扑派生状态，绝不反向污染人工状态；② 扩展 Kahn 拓扑序，**存在环立即停止剪枝**（防节点状态丢失）；③ AND/OR 门限：上游失效按门限级联折叠下游。

边界：环存在时不剪枝（`:183-187`，`prunedIds:[]`）；`pruned` 不可作人工输入（`normalizeManualState` 归一为 pending，`:157-161`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `topologicalOrder` | function | 101-127 | `(nodes, edges) => {order: string[]; cycles: string[][]}` | 扩展 Kahn；有环时 order 仅出队节点 |
| `wouldCreateCycle` | function | 130-155 | `(edges, fromNode, toNode) => boolean` | 自环直接 true；DFS 判 to 能否走回 from |
| `evaluateDag` | function | 170-235 | `(nodes, edges, manualStates?) => CsLabDagEvaluation` | 生效状态+剪枝+`cancelledJobIds` |
| `flattenCycleIds` | function | 238-242 | `(cycles: string[][]) => Set<string>` | |
| `findCanvasCycleIds` | function | 247-252 | `(nodes, edges) => Set<string>` | evaluate 前视觉告警用 |

内部：`GraphIndex/buildGraph`（`:17-46`，悬空边跳过 `:39`）、`findCycles`（`:49-95`，Tarjan SCC，单节点自环也算环 `:84-87`，分量排序确定性）、`normalizeManualState`（`:157-161`）。

## 3. 内部逻辑与关键流程

### 3.1 `topologicalOrder`（`:101-127`）

Kahn：零入度节点**排序**入队（确定性，`:107`），出队即入 order，邻接减度、零度入队再排序（`:118`）；全节点出队 → `cycles:[]`；否则 `remaining`（order 补集）交 `findCycles`（`:125-126`）。

### 3.2 `wouldCreateCycle`（`:130-155`）

`fromNode===toNode` → true（自环）；建邻接表（含重复边），从 toNode DFS：走到 fromNode → true（新边闭合成环，`:144-149`）；visited 去重。

### 3.3 `evaluateDag`（`:170-235`）

1. `:178-181` 人工状态归一（`manualStates` 覆盖 `node.state`；pruned→pending）。
2. `:183-187` **有环快照**：states=人工状态、`prunedIds:[]`、`cancelledJobIds:[]`（不剪枝）。
3. `:193-218` 逐拓扑序节点：`dead_end` 或无父 → 保持 base；否则数失效父（effective 已是 `dead_end/pruned`）；`shouldPrune = operator==='OR' ? deadParents===parents.length : deadParents>0`（`:209-210`）；剪枝 → `pruned` 入 `prunedIds`。
4. `:220-226` 组装 states；`state==='pruned' && node.gpuTaskId` → `cancelledJobIds`（去重排序，`:233`）。

## 4. 调用者与调用链

出向：`../types/cslab`（4 类型，`:10-15`）。入向（检索=符号名+模块名，全冻结树，经 barrel `index.ts:129-134`）：

- `evaluateDag`：`apps/electron/src/renderer/components/cdut-science/CsLabDagCanvas.tsx:29,167`、`apps/electron/src/main/lib/cslab/cslab-canvas-sync.ts:28,113`、`cslab-canvas.test.ts`（批外 19 test，多处）。
- `wouldCreateCycle`：`CsLabDagCanvas.tsx:31,491`、`cslab-canvas.test.ts:18,179-181`。
- `findCanvasCycleIds`：`CsLabDagCanvas.tsx:30,171`。
- `topologicalOrder`：`cslab-canvas.test.ts:17,150,153` + 内部。
- `flattenCycleIds`：仅内部+barrel（零外部引用）。
- **同名碰撞警示**：`packages/core/src/pdf-engine/max-regret-router.ts:219` 有同名本地 `wouldCreateCycle`（签名/语义完全不同），非本模块调用方。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径；「取消」语义是 `cancelledJobIds`（剪枝节点的 GPU 任务清单交调度层执行，`:225`）；环快照即失败保护（`:183-187`）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；契约①即权威口径（`:5,157-161`）：人工状态不可被派生值覆盖/伪造。

## 8. 修改影响面

- AND/OR 门限/剪枝口径改动 → `cslab-canvas-sync.ts:113`（主）/`CsLabDagCanvas.tsx:167`（渲染）联动。
- `cancelledJobIds` 形状是 GPU 任务取消契约。
- 测试：批外 `cslab-canvas.test.ts`（19 test，环检测 :149-181）；无 cslab-dag.test.ts。

## 9. 测试证据

无直接测试文件；间接 `apps/electron/src/main/lib/cslab/cslab-canvas.test.ts`（批外 19 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三契约（人工态/环停剪/门限折叠） | 已证实 | `:4-7,183-218` |
| Kahn 确定性（排序入队） | 已证实 | `:107,118` |
| Tarjan SCC+自环 | 已证实 | `:49-95` |
| `flattenCycleIds` 零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| core 同名 `wouldCreateCycle` 碰撞 | 已证实 | 子 agent 检索 |
| 真实画布图分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 101-252 | covered |
| Kahn+Tarjan | §3.1 | 49-127 | covered |
| wouldCreateCycle | §3.2 | 130-155 | covered |
| 门限折叠/环快照/取消清单 | §3.3 | 170-235 | covered |
| 专属测试 | §9 | — | unknown |
