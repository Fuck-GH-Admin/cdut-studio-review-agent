---
path: apps/electron/src/main/lib/study/hierarchical-graphrag.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d91db5340703ec5fd882d7c507583120532c04d
sha256: c599d3a6888025629714fa5b69a6e82df6115dafcf3c4c556ac26240aec523d6
lines: 295
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/hierarchical-graphrag.ts

## 1. 结论与边界

**分层社区发现（Leiden）**（`apps/electron/src/main/lib/study/hierarchical-graphrag.ts`，295 行）：加权图→分层社区（Leiden 算法迭代）→社区命名/摘要聚合。GraphRAG 检索的图谱构建底座。

## 2. 导出与关键符号

`export` 共 **5 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CommunityNode` | interface | `:17-25` | 社区节点（层级/成员/标题/摘要） |
| `WeightedEdge` | interface | `:26-32` | 加权边 |
| `HierarchicalLeidenEngine` | class | `:40-149` | 分层 Leiden 引擎 |
| `BuildHierarchicalCommunitiesInput` | interface | `:219-231` | 构建输入 |
| `buildHierarchicalCommunities` | 函数 | `:232-295` | `(input) => CommunityNode[]` 主入口 |

内部：`communityName`（`:33-39`）、`aggregateEdges`（`:150-169`，社区间边聚合）、`groupByCommunity`（`:170-186`）、`commonPrefix`/`deriveGroupTitle`/`deriveGroupSummary`（`:187-218`）。

## 3. 内部逻辑与关键流程

`buildHierarchicalCommunities`（`:232-295`）：`HierarchicalLeidenEngine`（`:40-149`）迭代划分社区（模块度优化、分层递归）→`aggregateEdges` 聚合层间边→`groupByCommunity` 分组→`deriveGroupTitle`（`commonPrefix` 取公共前缀命名，`:187-200`）/`deriveGroupSummary`（`:211-217`）→`CommunityNode[]`。

## 4. 调用者与调用链

- 消费方：`hierarchical-graphrag-retriever`（不在本批 scope）。
- 出向：无（纯函数/类）。

## 5. 数据 I/O、读写与副作用

纯计算；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空图/单节点 | `:232-295` | 直接输出 |
| 边聚合 | `:150-169` | 同社区边折叠 |

## 7. 权限与权威状态

无身份语义；Leiden 模块度是图谱质量指标。

## 8. 修改影响面

- Leiden 参数（分辨率/迭代）影响社区粒度；`commonPrefix` 命名口径影响可读性。

## 9. 测试证据

无专属测试（全树检索 `buildHierarchicalCommunities` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出、分层 Leiden | 已证实 | `:17-295` |
| 命名/摘要聚合 | 已证实 | `:187-218` |
| 图谱质量效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:17-295` | covered |
| Leiden 引擎 | `:40-149` | covered |
| 聚合/命名 | `:150-218` | covered |
