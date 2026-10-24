---
path: apps/electron/src/main/lib/study/study-retrieval-router.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e4b3be6a540e998f79081ee446eb43da24937acb
sha256: 64c180b00f8d83caac492bc975f615c92087a24080474bacb11769acc1ff3640
lines: 42
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-retrieval-router.ts

## 1. 结论与边界

速课堂**双引擎策略路由器**（`apps/electron/src/main/lib/study/study-retrieval-router.ts:1-10`）：经典混合检索（`hybrid-retriever`）与分层图谱检索（`hierarchical-graphrag-retriever`）两链路解耦，按用户设置选引擎。**契约：默认 classic；graphrag 抛错安全回退 classic，绝不向上抛**（`:9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `StudyRetrievalEngineType` | type | `:17` | `'classic' \| 'graphrag'` |
| `searchStudyRouted` | 函数 | `:27-42` | `(sessionId, query, engineType='classic', options) => StudySearchKnowledgeResult` |

## 3. 内部逻辑与关键流程

`engineType==='graphrag'` → `getHierarchicalGraphRagRetriever().search(…)`（`:35`）；**catch** → `console.warn` + `getGlobalStudyRetriever().searchHybrid(…)`（`:36-39`）。classic/默认 → `searchHybrid`（`:41`）。

## 4. 调用者与调用链

- 消费方：速课堂检索工具（`study-tools` 系）。
- 出向：`hybrid-retriever`、`hierarchical-graphrag-retriever`（后者不在本批 scope）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（路由层）；实际检索在两引擎。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| graphrag 正常 | `:35` | 返回增强结果 |
| graphrag 抛错 | `:36-39` | warn + 回退 classic（不抛） |
| classic/默认 | `:41` | `searchHybrid` |

## 7. 权限与权威状态

无身份语义；「不向上抛」是可靠性契约（`:9`）。

## 8. 修改影响面

- 回退语义变更会破坏「绝不抛」契约；测试 `study-retrieval-router.test.ts` 锁定。

## 9. 测试证据

`study-retrieval-router.test.ts`（32 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、回退契约 | 已证实 | `:27-42` |
| 引擎实际行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `searchStudyRouted` | `:27-42` | covered |
| 回退契约 | `:36-39` | covered |
