---
path: apps/electron/src/main/lib/review/deterministic-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9108fb29ccb5a19ecd6e14a9a1e2319b8f77d565
sha256: 5975de4cebc8961e95e2dde9ed72beb2a81247948e3b463d028dc279a2233315
lines: 215
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/deterministic-engine.ts

## 1. 结论与边界

确定计算引擎（M2，头注 :1-9）：数值/日期/必填/上限/互斥按可复查规则核对；AI 只处理语义不得覆盖计算值（H13/K13）；unknown 三值传播（缺输入不当 false/0，D05）；计算可重放（同输入同规则版本→同明细，A07）；组内先去重/择高再聚合、封顶、按模板分配（D04）。

边界：不读案卷/不落盘；输入为 `CalcInput[]`；产出供 `toCalculationResult` 转 `CheckResult`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CalcInput` | interface | 14-17 | `{subjectId, fields: {…, known}}` |
| `evaluateCondition` | fn | 21-70 | 条件树三值求值（TriState） |
| `GroupScoreOutcome` | interface | 74-83 | 组级计分结果（total/allocation/unknowns/detailLines） |
| `computeGroupScore` | fn | 89-190 | 组级计分主流程 |
| `toCalculationResult` | fn | 193-215 | 构造 CheckResult（V2 契约） |

无内部函数。

## 3. 内部逻辑与关键流程

1. **`evaluateCondition`**（:21-70）：`all` 有 false→false、有 unknown→unknown（:25-33）；`any` 有 true→true 短路、有 unknown→unknown（:34-42）；`not` 保 unknown（:43-46）；叶子 `exists`：known 且非 null/''→true、known 空→false、未知→unknown（:50-52）；比较：缺输入→unknown（:53）；`eq/neq` 直比、`gt/gte/lt/lte` 数值化（NaN→unknown，:60-66）、`in` 数组包含（:67）。
2. **`computeGroupScore`**（:89-190）：无 calculation → throw（:95）；取值（:101-113）：`valueFrom` 未知/非数值 → 记 unknowns；有 unknowns **整组 `awaiting-confirmation`、不当零分**（:114-120）；空候选 → 待确认（:123-125）；负值 → 待确认不参与（:127-130）；去重（:132-147）：同 dedupeKey 择高，被舍弃项 detailLines 记 `去重舍弃` 并以 0.00 入分配账（分母完整，A07，:143-146）；选择（:149-157）：`highest-eligible-score`（无 dedupeBy 时）保留最高；`single` 多候选 → 待确认不擅自选择；聚合（:159-161）：max/sum 分明；封顶+分配（:163-183）：`score-desc-then-subject-id` 排序、余量递减计入、截断项 note 标注（max 聚合未全额计入/被组上限截断）、舍弃项 `同键择高舍弃` 0.00；返回 `compliant`+total+allocation+detailLines（:189-190）。
3. **`toCalculationResult`**（:193-215）：checkId `chk-{ruleId}-{ms}-{rand4}`（:199）；awaiting → reason `存在未知输入（…），待确认后重放`，否则 `组计入 {total}`（:202-205）；`executedBy:'deterministic'`（:212）。

## 4. 调用者与调用链

入向（生产）：`review-v3-t04-rules-scoring.ts:7`（`evaluateCondition`）；`v2-executor-factory.ts:19-20`（evaluateCondition/computeGroupScore）；`resource-check.ts:11`（evaluateCondition）。测试：`deterministic-engine.test.ts:6`。**`toCalculationResult` 生产零消费者**（全树检索仅定义与测试）。出向：`@profer/shared` 类型（:11）；纯函数（`toCalculationResult` 含时间戳）。

## 5. 数据 I/O、读写与副作用

纯计算；`toCalculationResult` 生成新 id/时间戳（非纯但无 I/O）。

## 6. 分支、失败、取消与恢复

- 仅 `computeGroupScore` 无 calculation 时 throw（:95）；其余以 `awaiting-confirmation` 表达（unknown/空组/负值/single 多候选）。
- 可重放性：确定性纯函数（A07）；重放一致性由测试 :40 断言（JSON.stringify 相等）。

## 7. 权限与权威状态

- 计算权威：AI 不得覆盖计算值（头注 :5）；unknown 不当 0（:118 detailLines `不当零分`）。
- 去重权威：同键择高、被舍弃项 0.00 入账不消失（:143-146）。
- 分配权威：高分优先、截断显式标注（:163-183）。
- 无 sender/role 检查。

## 8. 修改影响面

- `review-v3-t04-rules-scoring`（T04 求值）、`v2-executor-factory`（运行节点计算）、`resource-check`。
- 三值语义/分配口径变更影响 T04 与覆盖账本对账。
- 同测：`deterministic-engine.test.ts`（7 用例）。

## 9. 测试证据

直接测试 `deterministic-engine.test.ts`（7 用例 / 2 describe；D04 固定样本规则 :9-21；纯函数；NOT_RUN）：
1. `:24-29` max 聚合：`total '6.00'`、明细之和=6。
2. `:30-41` E1 6/3、E2=5、上限 10：`total '10.00'`、alloc `s1 6.00/s2 0.00/s3 4.00`、detailLines 含 `去重舍弃`、**重放 JSON 相等**（:40）。
3. `:43-51` 确认分值缺失：`awaiting-confirmation`、unknowns `[{s4, confirmedLevelScore}]`、detailLines 含 `不当零分`。
4. `:60-62` all+unknown → `unknown`。
5. `:63-65` any+true → `true`（短路）。
6. `:66-68` not(unknown) → `unknown`。
7. `:69-71` all+false → `false`。

未覆盖：`single` 多候选、负值拒绝、`toCalculationResult`、`in`/日期 op；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/行号如 §2 | 已证实 | 逐条 |
| 三值传播语义 | 已证实 | :21-70 + 测试 :60-71 |
| 去重择高/封顶分配/可重放 | 已证实 | :132-183 + 测试 :24-51 |
| unknown 不当零 | 已证实 | :114-120 |
| `toCalculationResult` 生产零消费者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `evaluateCondition` 六种语义 | §3.1/§9 | 21-70 | covered |
| `computeGroupScore` 主链（去重/聚合/封顶/分配） | §3.2/§9 | 89-190 | covered |
| unknown/空组/负值待确认 | §3.2/§9 | 114-130 | covered（负值未测） |
| `single`/`toCalculationResult` | §3.2-3.3 | 155-215 | partial（未测） |
