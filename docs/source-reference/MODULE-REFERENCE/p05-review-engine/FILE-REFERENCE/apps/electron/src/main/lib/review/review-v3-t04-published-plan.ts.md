---
path: apps/electron/src/main/lib/review/review-v3-t04-published-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 39146ca3baba2eba25188b32e62ec16106c76642
sha256: 2f5019d19bf1bb55b48e8a7340aa92430b84bf9bd11243b778783b366aa8ff5b
lines: 250
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t04-published-plan.ts

## 1. 结论与边界

T04 R01：**已发布模板 → 冻结 C0 Plan + 显式规则/操作账本**的纯编译器（头注 :1-7）。调用方（可信 Main）负责核验真实 TemplateVersion、政策来源、材料版本与已确认观测；本模块不能发布模板、发明来源或写 Case/Run/Decision。类型化限额只来自 T01/负责人确认的不可变账本（`T04PublishedConstraint`，注释 :31-34「不是 FieldSpec.max 或非结构化文本推导」）。

边界：不求值（`evaluateT04Plan` 在 rules-scoring 篇）；不读盘；`asOfDate` 由调用方显式给（绝不机器时钟，:70-73）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T04PublishedConstraint` | type | 36-48 | 具名确认的类型化限额（field-maximum/field-minimum，可带 `claimKey`） |
| `T04PublishedTarget` | type | 51-61 | Main 核验的 case/subject 快照（fields/materialSlots/sourceVersionIds） |
| `T04PublishedPlanInput` | type | 63-75 | `{template, effectiveRules, constraints, targets, phase, asOfDate?}` |
| `T04PublishedRuleBinding` | type | 77-82 | `{binding, rule, operation, policyVersionId}` |
| `T04PublishedPlanOutput` | type | 83-89 | `{plan: CanonicalPlan, bindings, checks, bindingLedgerHash}` |
| `compilePublishedTemplateReviewPlan` | fn | 113-250 | 唯一函数导出 |

内部：`materialField`（:18）、`nonempty`（:19）、`canonical`（:20-26，键序稳定序列化）、`digest`（:27）、`reject`（:28，抛 `T04_PUBLISHED_PLAN_INVALID: …`）、`identity`（:29，`[policyVersionId, ruleId]` JSON）、`materialRule`（:91-106，材料槽合成确定性规则）。

## 3. 内部逻辑与关键流程

1. **前置校验**（:114-126）：模板须 `published`、id/version 合法、targets 非空、phase ∈ {submission, decision}（:115-118）；`asOfDate` 若给必须 `YYYY-MM-DD`（:121-122）；字段键唯一且不得伪造保留前缀 `__t04_material_count__:`（:123-126）；材料槽合法（id 唯一、minCount 非负安全整数，:127-130）。
2. **规则账本**（:131-137）：`effectiveRules` + 每个 `minCount>0` 材料槽合成 `materialRule`（`required-material-{slotId}`、deterministic/confirmed、priority 1000000+rank，:91-106）；identity（policyVersionId+id）必须唯一（:134-137）。
3. **约束校验**（:139-155）：每个 constraint 必须唯一 identity、模板版本匹配、`confirmedBy/confirmedAt` 非空、对应规则存在且 deterministic+confirmed、kind 合法（:140-148）；字段须 number、scope 与规则 targetScope 一致、数值 `^-?\d+(?:\.\d{1,6})?$`、单位兼容（:149-153）。
4. **目标校验**（:157-175）：target 身份唯一（targetKey+objectKey+subjectId）、scope ∈ {case,group,subject}、sourceVersionIds 无重复非空、fields 不得含保留键（:159-165）；materialSlots 必须属模板、ids 无重复、`confirmed` 为布尔、且所有材料版本都在该 target 的 sourceVersionIds 内（:167-173）。
5. **逐规则绑定**（:177-228）：规则按 `priority || identity` 稳定排序（:180-181）；操作选择：材料槽规则 → `material-min-count`（字段 `__t04_material_count__:{slot}`，:182-187）；有类型化约束 → `value-minimum/value-limit`（:188-193）；否则 `compileT04Operation(rule)`（:194）；targets 按 scope 匹配，无匹配 → reject（:195-196）；每 target：字段值注入材料计数（`{value: 数量|null, confirmed}`，:198-205）、`conditionT04(rule.when, item)` 三态映射 applicability（:207-213）、`conditionFingerprint` digest 含 when/fields/phase/sourceVersionIds（:215-216）；`requiredAt==='decision'` 的槽在 submission 阶段强制 `not-applicable`（:218-221，注释：决策阶段须新快照重查）。
6. **指纹与输出**（:229-249）：`bindingLedgerHash` = bindings 结构摘要（:229-231）；`moduleDigests` = [digest(template), digest(rules+constraints+ledgerHash)]（:232-235）；`fingerprint` 含 schemaVersion/template/版本/moduleDigests/ledgerHash/phase/[asOfDate]（:236-238）；`planId='plan-'+fingerprint[:28]`（:241）；最后 `assertC0CanonicalPlan(plan)` 形状自证（:248）。

## 4. 调用者与调用链

入向：`review-v3-main-template-plan-bridge.ts:23`（类型 + 调用点 `:298 compilePublishedTemplateReviewPlan({…})`，T01 负责人确认约束的只读解析入口）；本批 `review-v3-t04-published-plan.test.ts`（:47/:139）。出向：`@profer/shared`（`REVIEW_C0_SCHEMA_VERSION/assertC0CanonicalPlan` :9-12）、`./review-v3-t04-rules-scoring`（`compileT04Operation` :194、`conditionT04` :207、类型 :15-16）。

## 5. 数据 I/O、读写与副作用

纯函数：无磁盘/网络/日志；输出新对象；`canonical`/`digest` 纯计算。

## 6. 分支、失败、取消与恢复

- 全部非法输入 → `reject`（throw `T04_PUBLISHED_PLAN_INVALID: …`）：模板/phase/targets（:118）、asOfDate（:122）、字段/槽/规则 identity（:126/:130/:137）、约束不匹配（:148/:153）、目标伪造（:165/:171/:173）、规则无目标（:196）。
- 无部分产出：校验失败在绑定生成前 throw；绑定循环中 reject 也不返回中间态。
- 无取消/恢复概念。

## 7. 权限与权威状态

- 模板权威：只有 `published` 模板可编译（:115）；`FieldSpec.max` **不会**自动生成政策检查（注释 :33；无约束时规则走 `compileT04Operation`/`unresolved` → 测试 :84-88 断言 awaiting-confirmation）。
- 限额权威：`T04PublishedConstraint`（具名 confirmedBy/confirmedAt），绑定到确定性已确认规则（:143-148）。
- 材料权威：`materialSlots` 快照须 Main 确认（`confirmed`）且版本∈sourceVersionIds（:167-173）；`requiredAt:'decision'` 槽在 submission 不产生缺件判定（:218-221）。
- 时间权威：`asOfDate` 显式（:70-73/:121-122）。

## 8. 修改影响面

- 编译产物 `CanonicalPlan.fingerprint`/`bindingLedgerHash` 是下游（`review-v3-main-template-run`/`f07-plan-coverage`）防混用锚点；改 `canonical` 序列化或注入字段会使旧指纹失配。
- `materialField` 保留键被目标校验禁止伪造（:164），改动影响 `rules-scoring.materialMinCount` 消费。
- 测试：`review-v3-t04-published-plan.test.ts`（10 用例）、`review-v3-main-template-plan-bridge.test.ts`（间接）。

## 9. 测试证据

直接测试 `review-v3-t04-published-plan.test.ts`（10 用例 / 1 describe；`template/peopleRule/clause/target` 纯夹具 :9-43；编译后经 `evaluateT04Plan` 判状态；NOT_RUN）：
1. `:57-71` 18 compliant/21 non-compliant（无实验室专有分支）；plan.templateVersion `'1'`、bindings 2、checkKey 两两不同、不同输入指纹不同、同输入 plan `toEqual` 相同（确定性）。
2. `:72-75` 未知数值（value null）→ `awaiting-confirmation`（不是 0）。
3. `:76-83` Main 确认空槽 → `awaiting-supplement`；未确认空槽 → `awaiting-confirmation`；空 sourceVersionIds 透传（bindings 全空）。
4. `:84-88` 无类型化约束时 FieldSpec.max 不产生确定性检查（`awaiting-confirmation`），材料规则仍 compliant。
5. `:89-98` 非 deterministic 规则/未确认规则/约束模板版本不符/draft 模板 → 全部 `T04_PUBLISHED_PLAN_INVALID`。
6. `:99-108` 伪造材料版本 → `'Material version not in target'`；约束字段不存在 → invalid；重复规则 → invalid。
7. `:109-116` 单位缺失/单位不匹配 → 均 `awaiting-confirmation`。
8. `:117-126` 同 claimKey 双政策（10 vs 19）→ 两规则全部 `awaiting-confirmation`（冲突不静默双收）。
9. `:127-135` source/约束/规则变更 → fingerprint/bindingLedgerHash 变化。
10. `:136-143` `requiredAt:'decision'` 槽在 submission → `not-applicable`，decision 阶段编译 → `awaiting-supplement`。

未覆盖：`phase` 非法、groupBy 汇总、`asOfDate` 合法/非法路径、`T04PublishedConstraint.claimKey` 与 rules-scoring 裁决的组合；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| FieldSpec.max 不产生政策检查 | 已证实 | 注释 :33 + 测试 :84-88 |
| 材料版本必须在 source manifest | 已证实 | :172-173 + 测试 :99-102 |
| decision 槽 submission 不适用 | 已证实 | :218-221 + 测试 :136-143 |
| 确定性输出（同输入同 plan） | 已证实 | 测试 :70 |
| 唯一生产调用者 template-plan-bridge:298 | 已证实 | grep |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 前置/字段/槽校验 | §3.1 | 114-130 | covered |
| 规则账本 + materialRule | §3.2 | 91-137 | covered |
| 约束校验 | §3.3 | 139-155 | covered |
| 目标校验（材料版本） | §3.4 | 157-175 | covered |
| 绑定生成（操作选择/applicability/decision 槽） | §3.5 | 177-228 | covered |
| 指纹/输出 | §3.6 | 229-249 | covered |
| `asOfDate` 路径 | §9 | 121-122 | unknown（未测） |
