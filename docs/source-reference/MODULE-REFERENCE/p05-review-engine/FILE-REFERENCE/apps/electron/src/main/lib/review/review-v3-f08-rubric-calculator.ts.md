---
path: apps/electron/src/main/lib/review/review-v3-f08-rubric-calculator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7cfb9cd44bd9c6aa997e10b4306cc443dc50233
sha256: 6e4839073eb386ec6ddea5e653112121c76e349f26581fc083f8e5b21e6ff06d
lines: 144
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f08-rubric-calculator.ts

## 1. 结论与边界

F08：评委量表的**纯数值内核**（头注 :1-5）。F15 管评委身份/分配/回避/定稿；此处只接受上游已核验的人工作答与 N/A 条件，**绝不写入评分或案卷**。加权、均值、百分制转换全用六位定点整数（`decimalT04/formatT04` 复用 T04 内核）。

边界：不持久化；不判断评分真伪之外的业务；模型建议不可冒充人工评分（`humanConfirmed` 门禁）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F08RubricVote` | type | 11-18 | `{voteId, humanConfirmed, scores[], confirmedNaDimensionIds?}` |
| `F08RubricCalculation` | type | 19-28 | `{status, total, convertedTotal, effectiveJudges, dimensions, perJudge, divergence, blockers}` |
| `calculateF08Rubric` | fn | 43-144 | 唯一函数导出 |

内部：`SCALE`（:9，未直接使用，复用 `decimalT04`）、`divideRounded`（:31-37，bigint 绝对值 half-up 除法）、`parseNumber`（:39-41，`decimalT04` 失败返 null）。

## 3. 内部逻辑与关键流程

1. **配置校验**（:46-61）：`totalPrecision` 0-6 整数、维度 id 唯一非空、min/max 有限且 min≤max、权重非负可解析、至少一正权重、`minEffectiveJudges` ≥1 安全整数、`scaleConversion` fromMax>0 且 toMax≥0（:49-57）；非法 → `awaiting-confirmation` + `量表维度、权重、人数、精度或转换量尺配置无效`（:59-61）。
2. **标识校验**（:62-65）：voteId/expectedVoteIds 非空且唯一，否则 `评委评分唯一标识不合法或重复`。
3. **分配校验**（:68-73）：出现分配外评分 → `存在不属于当前分配的评分，不能参与汇总`（:69-70）；缺交且 `missingStrategy==='block'` → blocker `存在未交评分：…`（:71-73）。
4. **逐票**（:78-119）：`humanConfirmed` 不真 → `尚未确认是真实人工评分`（:82）；维度重复/缺失/越表 → blocker（:83-85）；N/A（:91-97）：须 `score===null` 且维度有 `naWhen` 且 `confirmedNaDimensionIds` 含之（否则 `N/A 未经条件核验`），且 `naStrategy∈{exclude, exclude-renormalize}`，才进 excluded；分值（:99-107）：解析失败/越界 → `分数缺失或越界`；`weighted+=score*weight`、`weightBase+=weight`；`weightBase===0` → `有效评分权重为零`（:109）。有问题的票不进汇总（:110-114）；好票 `divideRounded(weighted,weightBase)` 进 `validVoteTotals` 并按维度收集值（:115-117）。
5. **汇总**（:120-143）：有效票 < `minEffectiveJudges` → `有效评委 n/m`（:121-122）；逐维度均值（:123-127）；`divergence` = 有效票总分极差（≥2 票才算，:128-129）；`divergenceThreshold` 超限 → `评委分歧超过阈值，需独立复核`（:130-133）；有 blocker → `awaiting-confirmation`（total null，:135-136）；否则 `total` = 有效票均值、`convertedTotal` = 均值×toMax/fromMax（:137-141）。

## 4. 调用者与调用链

入向：**生产零调用者**——全树检索 `calculateF08Rubric` 仅本文件定义与 `review-v3-f08-rubric-calculator.test.ts:3`（否定范围：`apps/electron/src` 全部 `.ts`）。出向：`./review-v3-t04-rules-scoring` `decimalT04/formatT04`（:7）、`@profer/shared RubricSpec`（:6）。

## 5. 数据 I/O、读写与副作用

纯函数：无磁盘/网络/日志；不写评分/案卷（头注 :4）。

## 6. 分支、失败、取消与恢复

- 仅 `divideRounded` throw（`F08_DIVISOR_INVALID`，:32，内部 weightBase=0 已前置拦截 :109）；其余全部以 `awaiting-confirmation` + blockers 表达。
- 无状态/取消/恢复。

## 7. 权限与权威状态

- 评分权威：`humanConfirmed` 必须真（:82，注释 :13「不能用模型建议冒充」）。
- N/A 权威：须 `confirmedNaDimensionIds`（T04/Main 确认的 naWhen 为真），不以 N/A 字面值推断（注释 :16）。
- 分配权威：expectedVoteIds 外的评分一律排除（:69-70）。
- 数值权威：定点整数（无浮点聚合）；0 分有效不等于缺失（测试 :32-43）。

## 8. 修改影响面

当前无生产消费方；若 F15 评分服务接线，`F08RubricCalculation` 形状为契约。`decimalT04/formatT04` 改动同步影响本文件与 T04。
需同步测试：`review-v3-f08-rubric-calculator.test.ts`（4 用例）。

## 9. 测试证据

直接测试 `review-v3-f08-rubric-calculator.test.ts`（4 用例 / 1 describe；`rubric`/`vote` 夹具 :5-17；纯函数；NOT_RUN）：
1. `:20-31` D11：两有效评委 `total '4.10'`、`convertedTotal '82.00'`（5→100）、维度均值 `3.50/4.50`、`effectiveJudges 2`；缺一票（min 2）→ `total` null（:30）。
2. `:32-44` N/A：未确认条件 → `awaiting-confirmation`；`confirmedNaDimensionIds:['feasible']` 后 `total '0.00'`（0 分有效）、`excludedDimensions ['feasible']`、该维度 `voters 0`。
3. `:45-59` 尾差：0.1/0.2/0.3 × 0.1/0.2/0.7 → `total '0.26'`（定点无浮点误差）；`humanConfirmed:false` → null；维度重复 → null；voteId 重复 → `awaiting-confirmation`。
4. `:60-68` 超量程（6>max5）→ `awaiting-confirmation`；分歧 0.5 阈值（5-2=3）→ blockers 含 `'分歧'`、total null；`totalPrecision:7` → 配置无效 `awaiting-confirmation`。

未覆盖：`missingStrategy` 非 block、`naStrategy` 非法分支、`scaleConversion` 缺省（convertedTotal null）、`minEffectiveJudges` 缺省 1、负分；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 定点算术无浮点误差 | 已证实 | :31-37/:105-107 + 测试 :55 |
| humanConfirmed/confirmedNa 门禁 | 已证实 | :82/:91-93 |
| 分配外评分排除 | 已证实 | :69-70 |
| 生产零调用者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 配置/标识/分配校验 | §3.1-3.3 | 46-73 | covered |
| 逐票（人工/N/A/越界/权重） | §3.4 | 78-119 | covered |
| 汇总（minJudges/均值/分歧/换算） | §3.5 | 120-143 | covered |
| missingStrategy/naStrategy 非法 | §9 | 72/94-95 | partial（未测） |
