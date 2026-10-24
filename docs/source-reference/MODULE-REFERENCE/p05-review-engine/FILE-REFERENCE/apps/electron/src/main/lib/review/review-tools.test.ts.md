---
path: apps/electron/src/main/lib/review/review-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 042b0c9aac4442881149a17d32af2629282a0b91
sha256: d2ebceed5aabeceefa91e90abcf556cc110b4abf6650f56cc30cdcc648d97d3b
lines: 182
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-tools.test.ts

## 1. 测试目标

审核业务工具集（M3）：受控写入、确定引擎接线、非法输入拒绝——字段读取 unknown 语义、块检索、能力库读取、批量校验、supersedes 链、Agent 不覆盖确定性计算、语义结论须引用、须完整读规则材料、跨分项同成果人工裁定、证据绑定。

## 2. 用例清单

12 用例 / 1 describe（`审核业务工具集（M3）` :26）。夹具 `context`（:6-24，subject/文档/规则/空账本）；`buildReviewTools` 纯内存工具；无 mock。

| # | 用例（行） | 核心断言 |
| --- | --- | --- |
| 1 | read_subject_field unknown（28-35） | `{known:true,value:6}`；ghost → `{known:false,value:null}`（不当空串） |
| 2 | search_document_text 命中（37-42） | `hits[0].blockId==='b1'` |
| 3 | 能力库目录+块读取（44-51） | `list_review_documents` textBlockCount 1；`read_document` 带 location |
| 4 | 批量/事实/提交逐项校验（53-84） | 批量两关键词结果；`record_observations` `[true,false]`、observations 1；`submit_checks` `[true,false]`、results 1 |
| 5 | record_observation supersedes（86-96） | 不存在的原文 quote → false；两次记录 → 2 条+`supersedesObservationId` 链 |
| 6 | 案卷字段提取回读（98-113） | budget 1680 记录、回读 `{known:true,value:1680}` |
| 7 | 不覆盖确定性计算（115-121） | `submit_check` 对 deterministic 规则 → false、results 0 |
| 8 | 非法规则/状态拒（123-128） | `ghost`/`magic-status` → false |
| 9 | 语义结论须引用（130-136） | 无引用 false、有引用 true |
| 10 | 须完整读规则材料（138-158） | 未读 `rules.md` → error 含 `必须完整读取所有 role=rule`；`read_documents` 后 true |
| 11 | 跨分项同成果人工裁定（160-177） | compliant → error 含 `疑似同一成果跨分项重复申报`；`awaiting-confirmation` → true |
| 12 | link_evidence candidate（179-185） | `status==='candidate'`、links 1 |

## 3. 真实断言

如 §2 表（逐条读自 :28-185）。

## 4. 未覆盖与脆弱点

- 未覆盖：`read_documents` 多文档分页、`buildReviewTools` 其余工具面。
- 脆弱点：`as unknown as ReviewToolContext` 夹具；用例 6/11 改夹具字段。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例断言如 §2 | 已证实 | 本文件逐行 |
| 三不变量（不覆盖计算/须引用/须读规则材料）被固定 | 已证实 | 用例 7/9/10 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| read/search/list/read_document | §2 | covered |
| record(s)/submit(s)/link_evidence | §2 | covered |
| 三拒绝不变量 | §2 | covered |
| 其余工具面 | §4 | unknown（未测） |
