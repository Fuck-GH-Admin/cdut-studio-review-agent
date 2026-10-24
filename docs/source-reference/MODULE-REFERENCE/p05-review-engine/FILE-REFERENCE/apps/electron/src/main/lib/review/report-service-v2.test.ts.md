---
path: apps/electron/src/main/lib/review/report-service-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 050ee15580b2c9cd94ae50d3157c0adb1de00cce
sha256: b12d1e4ae4d4cdc8e8d161047229e8d05f90cc0519898ad9d9c5ed4b2d62f0f2
lines: 63
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/report-service-v2.test.ts

## 1. 测试目标

M4 报告与离线往返（A15/C01/C02）：学生反馈仅 public 字段、矩阵内外分列、离线包哈希校验与版本冲突。

## 2. 用例清单

5 用例 / 3 describe。夹具：内联 caseV2/decisions/supplements（:9-13）、rubric/aggregate/ratings（:24-32）、payload（:41）；纯函数。

| describe | # | 用例（行） |
| --- | --- | --- |
| 案卷反馈（A15） | 1 | public/internal 过滤（15-20） |
| 评委矩阵（A14/A15） | 1 | 内部列与公开列分列（25-37） |
| 离线往返（C01/C02） | 3 | 原样导入 ok（43-47）；篡改 HASH_MISMATCH（49-55）；版本推进 CONFLICT（57-62） |

## 3. 真实断言

- 1：`publicFields['declaredScore']===6`、`internalMemo` `toBeUndefined()`、`decision.result==='pass'`（:17-19）。
- 2：`internalNotes[0].note==='倾向照顾'`、`publicFeedback[0].feedback==='表现优秀'`、`rank===1`（:34-36）。
- 3：`outcome.ok` true（:46）。
- 4：`outcome.ok` false、`code==='HASH_MISMATCH'`（:53-54）。
- 5：`code==='CONFLICT'`（期望 4、包内 3）（:60-61）。

## 4. 未覆盖与脆弱点

- 未覆盖：`recused` 评分排除、canonicalHash 键序边界、SyncReceipt 字段断言、`latest` 决定选取。
- 脆弱点：`as unknown as` 夹具；`if (!outcome.ok)` 窄化分支。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 本文件逐行 |
| A15 分列/C01 防篡改/C02 冲突被固定 | 已证实 | :17-61 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| buildCaseFeedback public 过滤 | §3 | covered |
| buildRatingMatrix 分列/rank | §3 | covered（recused 未测） |
| import HASH_MISMATCH/CONFLICT | §3 | covered |
| canonicalHash 键序/SyncReceipt | §4 | unknown（未测） |
