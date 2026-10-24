---
path: apps/electron/src/main/lib/hippo-memory-graph.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ed342951e1173c0080aeadf524ee804736eb3afe
sha256: 2fc2c513e693d01c2277e07e6e091d78a50d471da8c0b900705ef4ecc4d8e9b0
lines: 64
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/hippo-memory-graph.test.ts

## 1. 测试目标

`HippoMemoryGraph`（`./hippo-memory-graph`，同批深读）的纯内存图操作与个性化 PageRank 求解：节点创建幂等性、无向边/自环语义、PPR 排序方向性、空图退化。框架 `bun:test`；无 mock、无 fs/网络，纯内存断言。

## 2. 用例清单

用例计数：`test(` **6**（`:5`、`:15`、`:24`、`:35`、`:43`、`:58`），`it(` 0——与源码计数一致。单一 `describe('HippoMemoryGraph（纯内存海马体图谱）')`（`:4`）。

| # | 用例（test 名） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | `getOrCreateNode 幂等：重复调用返回同一下标且不重复建点`（`:5-13`） | `new HippoMemoryGraph()` | `getOrCreateNode('皮肤引擎')` 两次 | 独立 |
| 2 | `getOrCreateNode 已存在节点不会覆盖既有 isDoc 标记`（`:15-22`） | 空图 | 先 `('doc::a.md', true)` 后 `('doc::a.md')` | 独立 |
| 3 | `addUndirectedEdge 双向：两端邻接表都能互相找到对方`（`:24-33`） | 空图 | `addUndirectedEdge('doc::a.md','皮肤',3)` | 独立 |
| 4 | `addUndirectedEdge 忽略自环`（`:35-41`） | 空图 | `addUndirectedEdge('重复','重复')` | 独立 |
| 5 | `PPR：种子命中时其相邻文档节点得分最高`（`:43-56`） | 两个 doc 节点 + 两条边（hit↔'皮肤' w=2，noise↔'天气' w=1） | `computePersonalizedPageRank(['皮肤'], 0.15, 15)` | 独立 |
| 6 | `空图返回空 Map`（`:58-63`） | 空图 | `computePersonalizedPageRank(['任意'], 0.15, 15)` | 独立 |

每用例新建实例，无共享状态、无 `beforeEach`/`afterEach`、无依赖顺序。

## 3. 真实断言

（逐条引用 expect 行，均为 bun:test 静态断言）

1. `expect(first).toBe(second)`；`expect(graph.nodeNames.length).toBe(1)`；`expect(graph.nodeNames[0]).toBe('皮肤引擎')`（`:10-12`）。
2. `expect(again).toBe(idx)`；`expect(graph.isDocumentNode.has(idx)).toBe(true)`（`:20-21`）。
3. `expect(graph.adjacency[docIdx]).toEqual([{ target: entityIdx, weight: 3 }])`；`expect(graph.adjacency[entityIdx]).toEqual([{ target: docIdx, weight: 3 }])`（`:31-32`）。
4. `expect(graph.adjacency[idx]).toEqual([])`（`:40`）。
5. `expect(result.has('doc::hit.md')).toBe(true)`；`expect(result.has('doc::noise.md')).toBe(true)`；`expect(result.get('doc::hit.md')!).toBeGreaterThan(result.get('doc::noise.md')!)`（`:53-55`）。
6. `expect(result.size).toBe(0)`（`:62`）。

## 4. 未覆盖与脆弱点

- 未覆盖分支（对照被测源码）：悬空节点概率重分配（`hippo-memory-graph.ts:91-94`）、种子 0 命中→均匀分布（`:76-77`）、`maxIter`/`alpha` 参数变化、重复边累加、非 1 权重的 PPR 数值、大图性能。
- 脆弱点：用例 5 只断言**相对排序**（`toBeGreaterThan`），不锁数值——PPR 参数或迭代算法改动只要保持方向性仍能通过；Float32 精度未测。
- 用例 1/2 的中文/文档节点名与真实服务的 `doc::<相对路径>` 命名约定一致（`hippo-memory-service.ts:29`、`:119`），但未测路径样式节点名。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `hippo-memory-graph.test.ts:10-62` |
| 无 mock/无 I/O、纯内存 | 已证实 | 全文仅 import `bun:test` 与被测类（`:1-2`） |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 悬空/均匀分布分支行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getOrCreateNode` 幂等/isDoc | §2/§3 | 5-22 | covered |
| `addUndirectedEdge` 双向/自环 | §2/§3 | 24-41 | covered |
| `computePersonalizedPageRank` 排序/空图 | §2/§3 | 43-63 | covered |
| 悬空节点分支 | §4 | — | unknown |
| 均匀分布退化 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
