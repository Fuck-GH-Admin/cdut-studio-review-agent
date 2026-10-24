---
path: apps/electron/src/main/lib/review/mock-review-engine.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 84118556c72317a728633c74d9beeba5a14bd258
sha256: 9759c524369d392628ff34b3054057f564592cf20e3c7cf9f7f8a6aa0ade7dec
lines: 147
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/mock-review-engine.test.ts

## 1. 测试目标

确定性模拟引擎测试（文件头 `:1-14`）：被测 `runMockReview` 六类检查产物；数据源 `demo-fixtures.buildDemoCase()`（6 条目 4 证明 7 大纲，预埋等级冲突/缺证明/互斥/日期越界/unclear）。断言基准是“先单独跑一遍确认实际产出 7 条 findings、kind 序列固定，按实际值写死”（`:8-11`）；纯函数已在探针验证配置目录零写入（`:13`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**8 test**（`:32-146`）：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:33-52` | 7 条 findings（等级冲突 1+缺证明 2+看不清 1+互斥 2+日期越界 1）；id 连续 `find-001..007`；全部 `generatedBy==='mock-engine'`。注释披露“无 score-over-limit：demo category 不含「竞赛」，isCompetitionCategory 永不命中（产品问题 #3）”（`:36-38`），不符时打印诊断（`:39-44`） |
| 2 | `:54-63` | item-001 level-conflict：`severity:'red'`、`evidenceAnchor.documentId==='doc-ev-001'`、`ruleItemIds==['outline-003']` |
| 3 | `:65-73` | item-002 missing-evidence：`yellow`、`suggestion==='supplement-evidence'`、**`evidenceAnchor` undefined**（不伪造坐标） |
| 4 | `:75-86` | 互斥两条（`['item-003','item-004']`）全 red、`ruleItemIds[0]==='outline-005'`、detail 同时点名“志愿服务 社区疫情防控志愿”“劳动实践 校园劳动周” |
| 5 | `:88-98` | item-005 date-out-of-range：red、detail 含 `2026-03-10`/`2024-09-01`/`2025-08-31`、`ruleItemIds==['outline-006']` |
| 6 | `:100-108` | item-006 unclear-evidence：yellow、`manual-review`、`evidenceAnchor.documentId==='doc-ev-002'`、`ruleItemIds==['outline-007']` |
| 7 | `:110-129` | 全部 findings：`ruleAnchors` 非空、`subjectAnchor.documentId` 有效且全为 `doc-app-001`、ruleAnchors 全为 `doc-rule-001` |
| 8 | `:131-146` | coverage：`reviewedItemIds` 6 条精确数组、`manualReviewItemIds` 排序后 `['item-002','item-004','item-006']`、`unrecognizedDocumentIds` 0、`ruleUncoveredItemIds` 0、`caseId==='demo-zhangsan-2026'`、`engine==='mock-engine'` |

## 3. 真实断言

- 断言基准明记“以当前引擎逻辑为准”（`:11`）——测试随引擎现状写死，非规格推导（照实记录）。
- #3 的 `evidenceAnchor` undefined 是“缺件不伪造坐标”的直接反证。
- #4 的 detail 点名断言验证互斥文案的双条目枚举。
- #7/#8 的锚点/覆盖全量断言。

## 4. 未覆盖与脆弱点

**未覆盖**：`score-over-limit`（demo fixture 不含“竞赛”类别，产品问题 #3）；`suggestedScore` 计算；`unrecognizedDocumentIds` 非空分支；`ruleUncoveredItemIds` 非空分支；`firstBlockAnchor` 无块分支。

**脆弱点**：断言与 `demo-case-fixture` 内容强耦合（outline-003/005/006/007、doc-ev-001/002、doc-app-001、doc-rule-001）；`findingFor` 要求唯一匹配；kind 序列写死。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、8 test、demo fixture | 已证实 | `:32`；`grep -c test(`=8 |
| 六类检查中五类产物（含锚点/文案） | 已证实 | `:33-129` |
| 缺件不伪造证据锚点 | 已证实 | `:71-72` |
| 覆盖摘要语义 | 已证实 | `:131-146` |
| score-over-limit（产品问题 #3 未命中） | 已证实（测试注释） | `:36-38` |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 总量/id/标记 | #1 | `:33-52` | covered |
| level-conflict | #2 | `:54-63` | covered |
| missing-evidence | #3 | `:65-73` | covered |
| mutual-exclusion | #4 | `:75-86` | covered |
| date-out-of-range | #5 | `:88-98` | covered |
| unclear-evidence | #6 | `:100-108` | covered |
| 锚点一致性 | #7 | `:110-129` | covered |
| coverage | #8 | `:131-146` | covered |
| score-over-limit | — | — | unknown（fixture 不触发） |
