---
path: apps/electron/src/main/lib/rag/entity-graph.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9cf57b1a9f9601a77631e83efe8d9647c3e5fc84
sha256: f2391bd6f1e8ca3b3d431cce60b7276c1af6d7abbbc7e42edc32a2b4706166a2
lines: 42
kind: test
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/rag/entity-graph.test.ts

## 1. 测试目标

跨文档二分实体图（`apps/electron/src/main/lib/rag/entity-graph.test.ts:1-3`）：实体抽取与跨文档关系 Join。被测 `extractEntityMentions`/`buildEntityIndex`/`findRelationalBridges`。夹具：内联文本数组+docKeys 映射（花名册/任职证明场景，`:19-22` 注释）。

## 2. 用例清单

共 **3 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 断言要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 8-17 | 抽取学号/寝室号/班级名 | 三 kind 存在；id 值 '202519110211'；room 值 **'b3-315'（归一小写）** | 独立 |
| 2 | 19-30 | 两文档共享学号 → 桥接 | bridgeIndices 含 1、sharedKeys 含 '202519110211'、**不含 2**（无共享键不桥接） | 独立 |
| 3 | 32-38 | 同文档已覆盖 → 不重复桥接 | bridgeIndices toEqual [2]（同文档切片排除） | 独立 |

## 3. 真实断言

逐条见 §2（关键锚）：`:11-16` 5 断言（含归一化锚 'b3-315'）；`:26-28` 3 断言；`:37` toEqual。

## 4. 未覆盖与脆弱点

- maxBridges 截断、class 过滤维度、空文本无用例。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 test、跨文档 Join 语义锚 | 已证实 | `:26-28,37` |
| 值归一化（破折号/大小写） | 已证实 | `:16` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| extractEntityMentions | §2 | 1 | covered |
| findRelationalBridges 跨文档 | §2 | 2 | covered |
| 同文档排除 | §2 | 3 | covered |
| maxBridges/class | §4 | — | unknown |
