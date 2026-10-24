---
path: apps/electron/src/main/lib/hippo-memory-graph.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d34d39d0eac6dba23a4fe64f639ace2ab0b8e2c
sha256: 424b087d4b245208a46bbf1d5db190e5ed98205e250f19136ffcc5ffb18a27b8
lines: 122
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/hippo-memory-graph.ts

## 1. 结论与边界

**纯内存无向实体共现图 + 个性化 PageRank（PPR）求解器**（122 行）：零外部依赖（仅 `Float32Array`/`Map`），实现 HippoRAG 式激活扩散——种子实体上的概率经幂迭代扩散到文档节点，作为多跳关联置信度。

边界：不读文件、不切词、不做检索编排（`hippo-memory-service.ts` 负责）；不做持久化；节点/边全在内存，随实例销毁。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `HippoEdge` | 导出接口 | 17-20 | `{ target: number; weight: number }` | 邻接表出边 |
| `HippoMemoryGraph` | 导出类 | 22-122 | 见下 | 图 + PPR |
| `nodeNames` | 公开字段 | 23 | `string[]` | 下标→节点名 |
| `nodeIndices` | 公开字段 | 24 | `Map<string, number>` | 名→下标 |
| `isDocumentNode` | 公开字段 | 26 | `Set<number>` | 文档节点标记 |
| `adjacency` | 公开字段 | 28 | `HippoEdge[][]` | 邻接表 |
| `getOrCreateNode` | 公开方法 | 31-41 | `(name: string, isDoc = false): number` | 幂等建点 |
| `addUndirectedEdge` | 公开方法 | 44-51 | `(sourceName, targetName, weight = 1.0): void` | 无向边（双向写） |
| `computePersonalizedPageRank` | 公开方法 | 60-121 | `(seedNames: string[], alpha = 0.15, maxIter = 15): Map<string, number>` | PPR 求解 |

导出计数：`export` 2 条（`:17` 接口、`:22` 类），与源码一致（类成员方法不计）。

## 3. 内部逻辑与关键流程

- **getOrCreateNode**（`:31-41`）：`nodeIndices` 命中直接返回旧下标——**重复调用不覆盖既有 `isDoc` 标记**（仅新建且 `isDoc` 为真才 `add`，`:38`）；新建时同步推进 `nodeNames`/`adjacency`（`:34-37`）。幂等。
- **addUndirectedEdge**（`:44-51`）：两端 `getOrCreateNode`（不传 isDoc → 实体节点）；`u === v` 自环直接忽略（`:47`）；否则双向各写一条出边，权重同值（`:49-50`）。**重复添加同一对会追加重复边**（无去重，权重叠加效果等价于分次累加，照实记录）。
- **computePersonalizedPageRank**（`:60-121`）：
  1. `n === 0` → 空 Map（`:62`）。
  2. 个性化向量 `p0`：种子名命中节点则 +1 计数（`:67-73`）；`validSeeds === 0`（无一命中）→ **退化为均匀分布** `p0.fill(1/n)`（`:76-77`），否则每个命中位归一 `/validSeeds`（`:79`）。
  3. 幂迭代 `maxIter` 次（`:86-111`）：每轮对每个节点 u——无出边（悬空）时把 `(1-alpha)*p[u]` 按 `p0` 比例分给全图（`:91-94`）；有出边时 `outProb = (1-alpha)*p[u]/totalWeight` 按边权重分给邻居（`:97-103`）；随后全图加 `alpha*p0[i]` 重启项（`:106-108`）；`p = 复制 nextP`（`:110`）。对应注释公式 `p^(t+1) = alpha*p^(0) + (1-alpha)*Wᵀp^(t)`（`:7-11`）。
  4. 输出：仅 `isDocumentNode` 中的节点 → `Map<节点名, 概率>`（`:113-120`）。
- 数值：`Float32Array` 单精度；`alpha` 默认 0.15（重置概率）、`maxIter` 默认 15（注释 `:85`：单次执行 <3ms，性能声明未实测）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep hippo-memory-graph|HippoMemoryGraph`，apps+packages 全文件类型）：
  - `apps/electron/src/main/lib/hippo-memory-service.ts:18` `import { HippoMemoryGraph } from './hippo-memory-graph'`；`:114` `new HippoMemoryGraph()`（建图）、`:120` `getOrCreateNode(docNodeName, true)`、`:138` `addUndirectedEdge(docNodeName, token, count)`、`:162` `computePersonalizedPageRank(seeds, 0.15, 15)`。
  - `apps/electron/src/main/lib/hippo-memory-graph.test.ts:2` import；6 个专属测试（§9）。
- 出向：无 import（纯内存实现，`:1-14` 注释「零外部依赖」）。

## 5. 数据 I/O、读写与副作用

- 输入：节点名字符串/种子名列表；输出：下标/Map。
- 磁盘/网络/缓存/全局状态：**无**。
- 副作用：仅实例内存增长（节点/边随 `addUndirectedEdge` 增加，无上限——上限由调用方 `hippo-memory-service` 的 `MAX_TOKENS_PER_DOC=200`、`MAX_FILES=2000` 约束）。
- 并发：单线程纯函数式操作，无锁；实例非线程安全的共享态但 JS 单线程下无交错问题（推断自运行模型）。

## 6. 分支、失败、取消与恢复

- 短路分支：空图返回空 Map（`:62`）；自环忽略（`:47`）；种子 0 命中→均匀分布（`:76-77`）。
- 失败：无 throw 路径（全部为纯计算）；`p0[i] ?? 0` 防御性兜底（`:70`、`:79`、`:93`、`:102`、`:107`）。
- 取消/恢复：不适用（同步纯计算，无 I/O）。
- 不可恢复点：无；图随实例生命周期存在。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无外部输入边界；输入由 `hippo-memory-service` 构造（文档 token/查询种子）。
- 权威状态：图结构即权威（内存态）；`isDocumentNode` 决定输出范围（`:116`）。

## 8. 修改影响面

- 消费方：`hippo-memory-service.ts:114-162`（建图与求解）；API 改动需同步该文件与 `memory-search-router.ts`（经 `hippoMemoryService.search` 间接）。
- 测试：`hippo-memory-graph.test.ts`（6 test）直接断言本文件行为，改动需同步。
- 数值行为（alpha/maxIter/悬空节点处理）改变会直接影响 HippoRAG 检索排序，但无回归测试覆盖数值精度。

## 9. 测试证据

- 直接测试：`apps/electron/src/main/lib/hippo-memory-graph.test.ts`（64 行，`bun:test`，**6 test**，NOT_RUN）：
  1. `getOrCreateNode 幂等`（`:5-13`）：两次调用断言 `first === second`、`nodeNames.length === 1`、`nodeNames[0] === '皮肤引擎'`。
  2. `已存在节点不覆盖 isDoc`（`:15-22`）：`getOrCreateNode('doc::a.md', true)` 后再 `getOrCreateNode('doc::a.md')`，断言 `isDocumentNode.has(idx) === true`。
  3. `addUndirectedEdge 双向`（`:24-33`）：`toEqual([{target: entityIdx, weight: 3}])` 两侧各一条。
  4. `忽略自环`（`:35-41`）：`adjacency[idx]` `toEqual([])`。
  5. `PPR 种子相邻文档得分最高`（`:43-56`）：doc-hit 与种子实体相连、doc-noise 连无关实体，断言 `has()` 两者为真且 `hit > noise`。
  6. `空图返回空 Map`（`:58-63`）：`result.size === 0`。
- 未覆盖：悬空节点分支（`:91-94`）、`validSeeds===0` 均匀分布分支（`:76-77`）、重复边累加、数值精度（Float32）。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与类成员签名 | 已证实 | `:17-121` |
| PPR 公式实现（重启+扩散+悬空处理） | 已证实 | `:86-111` |
| 种子 0 命中退化均匀分布 | 已证实 | `:76-77` |
| isDoc 幂等不覆盖 | 已证实 | `:31-41` |
| 自环忽略、双向边 | 已证实 | `:44-51` |
| 6 test 断言如 §9 | 已证实 | `hippo-memory-graph.test.ts:1-64` |
| 「单次执行 <3ms」性能 | 未知 | 注释声明（`:85`），未实测 |
| 悬空节点/均匀分布分支行为 | 未测 | 无测试覆盖（§9） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getOrCreateNode` | §3/§9 | 31-41 | covered |
| `addUndirectedEdge` | §3/§9 | 44-51 | covered |
| `computePersonalizedPageRank` 主循环 | §3/§9 | 60-121 | covered |
| 悬空节点分支 | §3 | 91-94 | partial（无测试） |
| 均匀分布退化分支 | §3 | 76-77 | partial（无测试） |
| 数值精度/性能 | §10 | 85 | unknown |
