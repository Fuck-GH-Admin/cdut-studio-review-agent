---
path: apps/electron/src/main/lib/review/review-v3-f08-rubric-calculator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6c9260f8351b8a4378df2d4dd21de1bd8317d2a
sha256: 3db3c4affb783c6a76afc7bcc8fbc152a11e5e56d44e8c30104fff725fbae5f6
lines: 69
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f08-rubric-calculator.test.ts

## 1. 测试目标

F08 量表确定性数值内核（describe :19，A07/A14/D11）：加权/百分制换算、N/A 确认条件与归一、定点尾差、人工确认门禁、非法输入阻断。被测 `calculateF08Rubric`。

## 2. 用例清单

4 用例 / 1 describe。夹具 `rubric`（2 维度 0.4/0.6、precision 2、missingStrategy block、minJudges 2、5→100）与 `vote`（:5-17）；纯函数。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | D11 两有效评委 4.10/5→82.00 | 20-31 |
| 2 | N/A 条件确认+排除归一；0 分≠缺失 | 32-44 |
| 3 | 尾差/非法维度/未确认建议不产生总分 | 45-59 |
| 4 | 超量程/分歧阈值/精度非法阻断 | 60-68 |

## 3. 真实断言

- 1：`status 'ready'`、`total '4.10'`、`convertedTotal '82.00'`、维度均值 `[{quality:3.50,voters:2},{feasible:4.50,voters:2}]`、`effectiveJudges 2`；缺一票（min 2）→ `total` null（:22-30）。
- 2：未确认 N/A 条件 → `awaiting-confirmation`（:39）；`confirmedNaDimensionIds:['feasible']` → `total '0.00'`（0 分有效）、`excludedDimensions ['feasible']`、维度 voters 0（:41-43）。
- 3：0.1/0.2/0.3 × 0.1/0.2/0.7 → `total '0.26'`；`humanConfirmed:false` → null；重复维度 → null；voteId 重复 → `awaiting-confirmation`（:55-58）。
- 4：score 6 越界 → `awaiting-confirmation`（:61）；分歧 3>阈值 0.5 → blockers 含 `'分歧'`、total null（:64-65）；`totalPrecision:7` → `awaiting-confirmation`（:66-67）。

## 4. 未覆盖与脆弱点

- 未覆盖：`missingStrategy` 非 block、`naStrategy` 非法、`scaleConversion` 缺省、负分、`F08_DIVISOR_INVALID`。
- 脆弱点：数值字符串断言耦合 `formatT04` 精度语义。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 本文件逐行 |
| 0 分有效/尾差对账/人工门禁被固定 | 已证实 | 用例 2/3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 加权/换算/minJudges | §3 | 22-30 | covered |
| N/A 确认+排除归一 | §3 | 39-43 | covered |
| 定点尾差/人工门禁/重复标识 | §3 | 55-58 | covered |
| 越界/分歧/精度配置 | §3 | 61-67 | covered |
| missingStrategy/naStrategy 其他分支 | §4 | — | unknown（未测） |
