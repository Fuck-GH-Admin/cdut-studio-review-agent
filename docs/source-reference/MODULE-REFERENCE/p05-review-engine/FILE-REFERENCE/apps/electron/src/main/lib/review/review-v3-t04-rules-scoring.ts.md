---
path: apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f69814b034c1131e7baaccfcd1b9165e3d9e8c9b
sha256: 12d10027de0439c1ba74d2164e56bafdcc7c88d93cf668298d3c4ee572f3118f
lines: 615
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t04-rules-scoring.ts

## 1. 结论与边界

T04：对一份不可变 V3 Plan 的**确定性规则求值**（头注 :1-5）。纯提案适配器——Main 仍是唯一 Case/Run 写者；数值输入必须是人工确认事实而非模型建议分。十进制全程 `bigint` 定点（6 位小数、无二进制浮点聚合，:77），含分组封顶计分、加权、金额限额、日期区间、上下限、材料计数、等值、互斥、等级映射十类操作，以及多政策同约束冲突的具名裁决。

边界：不创建 Plan/规则（Plan 由 `review-v3-t04-published-plan` 编译）；不验证 sourceVersionIds/目标归属（C Main 消费时核，注释 :544）；不写盘、无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T04Value` | type | 9-14 | `{value, confirmed, unit?, sourceRefIds?}` |
| `T04Item` | type | 15 | `{id, fields: Record<string,T04Value>}` |
| `T04Status` | type | 16 | 5 态（含 awaiting-supplement） |
| `T04Operation` | type | 17-28 | 11 种操作（含 `unresolved`） |
| `T04PolicyClaim/T04PolicyDecision/T04ResolvedClaims` | type | 29-42 | 多政策裁决形状 |
| `T04Outcome` | interface | 43-56 | 结果（allocation/groupResults/knownSubtotal/excess） |
| `T04PlanCheck` | type | 57-65 | 求值输入（含 `asOfDate`） |
| `T04PlanProposal` | type | 66-75 | 求值输出 |
| `decimalT04` | fn | 79-87 | `(string\|number) => bigint`（定标 1e6） |
| `formatT04` | fn | 88-101 | `(bigint, precision?, mode?) => string`（half-up/half-even/truncate） |
| `conditionT04` | fn | 123-153 | `(ConditionAST, T04Item) => TriState` 三态条件 |
| `compileT04Operation` | fn | 156-173 | `(RuleSpec) => T04Operation` |
| `resolveT04PolicyClaims` | fn | 180-204 | 多政策冲突裁决 |
| `partitionT04Items` | fn | 220-241 | 按 groupBy 分组（未知键不合并） |
| `evaluateT04Rule` | fn | 504-538 | 单规则求值 |
| `evaluateT04Plan` | fn | 546-587 | Plan 内绑定逐条求值 |
| `toT04CheckResult` | fn | 595-615 | 提案 → `CheckResult` 展示适配 |

内部：`SCALE/pow10`（:77-78）、`unique/field/known/sources/pending/complete`（:102-111）、`strictDate`（:113-120）、`eligible`（:207-217）、`exclusive/groupScore/weighted/amount/dateRange/valueLimit/valueMinimum/materialMinCount/equalsValue/mapping`（:243-501）。

## 3. 内部逻辑与关键流程

1. **十进制**：`decimalT04` 拒绝 >6 位小数/非法（:81 `T04_DECIMAL_INVALID`）；`formatT04` 三种舍入（:95-96），`precision` 0-6（:89）。
2. **三态条件** `conditionT04`（:123-153）：all/any/not 保持三值（:124-135）；字段未确认 → unknown（:138）；`exists` 看 null/空串（:139）；纯日期字符串走 `strictDate` 校验后的字典序比较（:141-148，非法日期 → unknown）；其余委托 `deterministic-engine.evaluateCondition`（:149-152）。
3. **操作编译** `compileT04Operation`（:156-173）：`calculation` → group-score；`workspaceConstraint` 六类映射（max-score/amount-limit/date-range/score-value/mutual-exclusion/level-mapping）；无约束/未实现 → `unresolved`（**不编译成通过**，:159/:172）。
4. **多政策裁决** `resolveT04PolicyClaims`（:180-204）：同 key 多 claim 若定义（operation+when+exceptions）不同且无**具名**决定（`confirmedBy/reason` 非空且唯一匹配）→ `blocked`（:191-195）；相同定义取排序首个，其余进 `excluded`（:196-201）。相同 ruleId 跨政策版本必须指定 `selectedPolicyVersionId`（:189-190）。
5. **资格** `eligible`（:207-217）：when/exception 有 unknown → missing（不静默排除）；false/命中例外 → excluded。
6. **分组** `partitionT04Items`（:220-241）：groupBy 键未确认的 item 进 `unknownItems` 不入组（:229-234）。
7. **groupScore**（:264-340）：cap 校验非负（:268-270）；逐 item 值/单位/去重键确认（:274-292）——任一未知即 pending（:293）；去重择高（同值取 id 小者，:296-303）；`select:'single'` 多候选即 pending（:305-306）；`highest-eligible-score`/`aggregate:'max'` 截断（:307-308）；sum+cap 截断（:309-310）；**最大余数法分配展示尾差**使明细和==展示总分（:318-335）；返回 allocation 明细（截断/未计入原因）。
8. **weighted**（:342-363）：单目标（:343）；权重和须==1（:358）；缺失不视为 0（:357）。
9. **amount**（:365-392）：同币种且单位一致才计入（:373）；缺失时返回 `awaiting-confirmation` + `knownSubtotal/excess`（仅已知子集估计，:388-391）。
10. **dateRange**（:394-408）：含首尾边界；非法/带时区日期 → pending。
11. **valueLimit/valueMinimum/equalsValue/mapping**（:410-501）：未知值/单位不匹配 → pending；比较用 bigint。
12. **materialMinCount**（:449-466）：值须非负安全整数；不足 → `awaiting-supplement`；未知 → pending（不假定 0）。
13. **evaluateT04Rule**（:504-538）：未确认规则/非 deterministic/unresolved → pending（:505-507）；when/exception unknown → pending（:509）；全不适用 → `not-applicable`（:510）；`group-score`+groupBy → 逐组独立封顶后汇总（groupResults，:511-525，任一组未完成即整体 pending :516-518）；其余 switch 分发（:526-537）。
14. **evaluateT04Plan**（:546-587）：绑定集必须与 Plan 完全一致否则 `T04_BINDING_SET_MISMATCH`（:552-553）；逐 binding 校验目标匹配（:561-562）；分支优先级：Plan 标 unknown/not-applicable（:564-566）→ 政策冲突 blocked（:567-568）→ 被具名优先排除（:569-570）→ 有效期规则（`asOfDate` 缺失/非法 → pending 不凭系统时间，:571-575；不在有效期 → not-applicable :576-579）→ 常规求值（:580）。
15. **toT04CheckResult**（:595-615）：checkId `t04:[checkKey,targetKey,objectKey]`；`executedBy:'deterministic'`；`calculation` 仅在 result 非 null 时附带（:609-611）。

## 4. 调用者与调用链

入向：`review-v3-t04-published-plan.ts:16`（`compileT04Operation` :194、`conditionT04` :207）；`review-v3-main-template-run.ts:23`（`evaluateT04Plan` :100）；`review-v3-main-template-plan-bridge.ts:25`（`T04Value` 类型）；`review-v3-f07-plan-coverage.ts:12`（`toT04CheckResult` :130、`T04PlanProposal` 类型）；`review-v3-t07-rating-workflow.ts:8`（`decimalT04` :94、`formatT04` :105）；`review-v3-f08-rubric-calculator.ts:7`（多点 :40-141）；`review-v3-t07-round-setup.ts:4`（`decimalT04` :10）；测试：本批 `review-v3-t04-rules-scoring.test.ts`、`review-v3-t04-published-plan.test.ts`（:3/:53/:123）。
出向：`@profer/shared` 类型（:6）、`./deterministic-engine.evaluateCondition`（:7）。零 I/O。

## 5. 数据 I/O、读写与副作用

纯函数集：无磁盘/网络/日志/全局状态。输出为新对象（T04Outcome/Proposal）。

## 6. 分支、失败、取消与恢复

- 配置非法 → `pending`（不抛）：precision 非 0-6（:266-267）、cap/权重/限额非十进制（:269-270/:362/:367/:412/:431/:470）、日期边界非法（:395-396）。
- 结构性失败 → throw：`decimalT04` 非法输入（:81）、`formatT04` 非法精度（:89）、`evaluateT04Plan` 绑定集不匹配/目标不匹配（:553/:560/:562）。
- 未知事实一律 `awaiting-confirmation`（`pending`，:108-109），`missingFields` 列出（去重排序）。
- 无取消/恢复概念（纯计算）。

## 7. 权限与权威状态

- 数值权威 = `T04Value.confirmed`（`known` 守卫 :104-105）——未确认不参与计算、不视为 0（多处注释 :293/:357/:462）。
- 政策权威 = 具名裁决（`resolveT04PolicyClaims` :180-204）：冲突不按迭代顺序/最新版本静默选择（注释 :175-179）。
- 有效期权威 = 显式 `asOfDate`（:571-579），绝不机器时钟。
- 结果权威边界：提案不写 Run（注释 :3-4）；`toT04CheckResult` 的 `verifiedSources`/`target`/`executedAt` 由 Main 供给（注释 :592-593）。

## 8. 修改影响面

- `decimalT04/formatT04` 被 T07 评分与 F08 量表计算复用，改动影响评分数值。
- `evaluateT04Plan` 的绑定一致性检查与 `toT04CheckResult` 的 checkId 格式影响 `review-v3-main-template-run`/`f07-plan-coverage` 的结果落账。
- 测试：`review-v3-t04-rules-scoring.test.ts`（13 用例）、`review-v3-t04-published-plan.test.ts`（间接）、`review-v3-main-template-plan-bridge.test.ts`、`review-v3-f07-plan-coverage.test.ts`（类型消费）。

## 9. 测试证据

直接测试 `review-v3-t04-rules-scoring.test.ts`（13 用例 / 2 describe；`makeRule`/`item` 纯夹具 :9-17；NOT_RUN）：
- D04（:20-33）：E1 6/3 择 6、E2 5，cap 10 分配 `s1:6.00/s2:0.00/s3:4.00`、result `10.00`、重跑 `toEqual` 相同、含未确认去重键 → pending。
- A07 分组封顶（:34-50）：`groupBy:['applicantId']` 两组独立 cap，result `17.00`，groupResults `['["A"]','10.00'],['["B"]','7.00']`，allocation 逐 item 核对；未知组键 → pending；输入顺序无关（reverse 相等）。
- A07 尾差（:51-65）：`0.004+0.004` → `0.01`，allocation `['0.01','0.00']` 且和==总分；precision 7 → pending；混合单位 → pending。
- D05 加权（:66-78）：85/90/95/80 加权 → `87.75`；显式 0 参与（`73.50`）；缺项 → pending 且 result null。
- D06 金额（:79-93）：`123.45+76.55` cap 180 → result `180.00`、`knownSubtotal 200.00`、`excess 20.00`；未知币种 → pending 但 knownSubtotal 保留；`decimalT04('0.1')+decimalT04('0.2')===decimalT04('0.3')`、`formatT04(2.345,2)==='2.35'`。
- D07 日期（:94-102）：首尾边界 inclusive compliant；范围外 non-compliant；`2025-02-30`/带时区 → pending。
- A07 下限（:103-111）：gte/0/null/非法 minimum 四态。
- 分组/互斥（:112-129）：未知键进 unknownItems；互斥同组多项 non-compliant、异组 compliant、未知 pending。
- 三态条件（:130-136）：all/any/not 三值；例外 unknown → pending。
- 多政策（:141-165）：冲突 blocked（ruleIds 排序）；具名决定选 a 排 b；同 ruleId 跨政策必须指定 policyVersionId（否则仍 blocked）。
- Plan 适配（:166-177）：同 checkKey 跨目标独立求值；`toT04CheckResult.executedBy==='deterministic'`。
- 固定分值（:178-183）：`score-value` 等值比较 3→non-compliant、4→compliant。

未覆盖：`amount-cap` 缺失 `knownSubtotal` 之外的边界、`level-mapping`（无用例）、`material-min-count`（在 published-plan 测试间接）、`formatT04` half-even/truncate、`evaluateT04Plan` 有效期分支（在 published-plan 无 asOf 用例）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 导出/行号如 §2 | 已证实 | 逐条 |
| bigint 定点、无浮点聚合 | 已证实 | :77-101 |
| 未知 ≠ 0、缺失 → pending | 已证实 | :293/:357/:462 + 测试 |
| 政策冲突必须具名裁决 | 已证实 | :180-204 + :141-165 |
| `asOfDate` 显式化（不用机器时钟） | 已证实 | :571-579 |
| 绑定集不匹配 throw 三类 | 已证实 | :553/:560/:562 |
| `level-mapping`/`formatT04` 非默认模式 | 未知（未测） | §9 缺口 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `decimalT04`/`formatT04` | §3.1/§9 | 79-101 | covered |
| `conditionT04` | §3.2/§9 | 123-153 | covered |
| `compileT04Operation` | §3.3 | 156-173 | covered（level-mapping 未测） |
| `resolveT04PolicyClaims` | §3.4/§9 | 180-204 | covered |
| `partitionT04Items`/`eligible` | §3.5-3.6 | 207-241 | covered |
| 十类操作函数 | §3.7-3.12 | 243-501 | covered（mapping 未测） |
| `evaluateT04Rule`（分组汇总） | §3.13 | 504-538 | covered |
| `evaluateT04Plan`（有效期分支） | §3.14 | 546-587 | partial（未测有效期） |
| `toT04CheckResult` | §3.15 | 595-615 | covered |
