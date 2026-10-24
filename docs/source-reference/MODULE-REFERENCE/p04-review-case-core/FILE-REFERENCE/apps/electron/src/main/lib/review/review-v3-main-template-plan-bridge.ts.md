---
path: apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fa3318cd44b67919666608729557df5225cf6ccb
sha256: 6d78ef6fb7abbcf33621e49b477e53a0aeb88b2305f30535802ac4a2e573702d
lines: 307
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts

## 1. 结论与边界

已发布模板 → T04 可执行计划的 Main 适配（ARCH-CLOSURE-R01 D1/§4.3）。职责边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-template-plan-bridge.ts:1-14`）：

- **只做无损适配**：`field-number-limit{lte}` 无歧义映射到 T04 `field-maximum`；`gte` 现已有 `field-minimum` 对应（`:118-122`，测试断言）；无法映射的约束进 `unresolved` 由 Main 显式报出，不猜语义。
- **规则身份统一**：沿用 `resolveEffectiveRules()` 的 `template:<id>@<version>`，`template-owner:` 只作发布证据（`:8-10`）。
- **不改写 T04/T01 领域代码**（编译/算子调既有实现）；**不建第二套 PlanStore**（`:11-13`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 4 个函数 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T04UnresolvedConstraint` | 接口（导出） | 40-45 | `{ruleId,fieldKey,operator,reason}` | 未映射约束必须如实报出（`:39`） |
| `T04TemplatePlanBridgeResult` | 接口（导出） | 47-54 | `{compiled?,constraints,unresolved,ruleIds}` | 有 unresolved 时 `compiled` 为 `undefined`（`:48`） |
| `adaptT01ConstraintsToT04` | 函数（导出） | 67-126 | `(template,effectiveRules)=>{constraints,unresolved}` | T01→T04 约束适配 |
| `buildT04TargetsFromCase` | 函数（导出） | 195-254 | `(aggregate,template,fieldUnits)=>T04PublishedTarget[]` | case/subject/group 三类目标 |
| `buildT04TargetFromCase` | 函数（导出） | 257-262 | 兼容旧调用，只返回案卷级 | `:256` |
| `CompileTemplatePlanInput` | 接口（导出） | 264-275 | `{aggregate,template,phase?,extraSourceVersionIds?,asOfDate?}` | `asOfDate` 必须显式给，绝不回退机器时钟（`:270-273`） |
| `compileTemplatePlanForCase` | 函数（导出） | 282-307 | `(input)=>T04TemplatePlanBridgeResult` | 编译主入口 |
| `TemplateCriterionDeterministicConstraint` | 内部 | 28-37 | T01 criterion 上的只读约束形状 | 不重建编辑器语义（`:27`） |
| `criterionOf` | 内部 | 56-59 | 展开 sections.criteria | |
| `IGNORED_PREFIX`/`isIgnored`/`activeDocumentsOf` | 内部 | 129-136 | `'[审核员忽略]'` 前缀；有效未忽略原件 | 与 decision-readiness 同口径（`:128`） |
| `confirmedFactOf` | 内部 | 144-155 | 人工确认事实查询 | 只认 `extractedBy==='user' && confirmed===true`（`:141-143`） |
| `t04FieldsOf` | 内部 | 158-184 | FieldValue→T04Value | confirmed 不因“有值”提升（`:157`） |

## 3. 内部逻辑与关键流程

### 3.1 约束适配（`adaptT01ConstraintsToT04`，`:67-126`）

遍历模板 criterion 的 `deterministicConstraint`（只处理 `kind==='field-number-limit'`，`:75-78`）：

1. `ruleId='section-<sectionId>-<criterionId>'`；`rulePolicy` 从 `effectiveRules` 建 `id→policyVersionId` 映射（`:72-73`）。
2. 确认人/时间（`enteredBy|actorId`、`enteredAt|confirmedAt`；`authored` 时还须 `kind==='owner-statement'` 且有文本），否则 `unresolved: 负责人尚未确认该数值规则`（`:81-90`）。
3. `fieldKey`+有限数值阈值，否则 `约束缺少字段键或阈值`（`:91-94`）。
4. 字段须真实存在于模板（禁止硬编码字段名），否则 `模板中不存在该字段`（`:95-99`）。
5. operator 仅 `lte`/`gte`（其它 `T04 不支持 <op>，不得猜测比较语义`，`:100-104`）。
6. `effectiveRules` 必须有同名规则身份（`有效规则中找不到同名规则身份`，`:105-109`）。
7. 产出 constraint：`gte→field-minimum(minimum)`、`lte→field-maximum(maximum)`（String(threshold)、unit 可选），`policyVersionId` 用 `resolveEffectiveRules` 身份（`:110-123`）。

### 3.2 目标构造（`buildT04TargetsFromCase`，`:195-254`）

- `active` = active 且未忽略原件；`activeVersionIds`。
- case 目标：`caseFields` 经 `t04FieldsOf`（confirmed 来自 `confirmedFactOf`）；材料槽按 `materialSlotId` 归集有效版本，`confirmed:true`（注释：`confirmed=false` 是“未核实”而非“已确认缺件”，`:206-207`）。
- subject 目标：`status!=='ignored'` 的主体；来源 = 主体 `sourceRefs` 交有效版本（空则回退全部有效原件，`:234`）；`correction==='user-confirmed'` 的主体字段升格 confirmed（`:222-230`）。
- group 目标：按 `sectionId` 分组（`group:<caseId>:<sectionId>`），字段用案卷级（`:239-252`）。

### 3.3 编译（`compileTemplatePlanForCase`，`:282-307`）

模板必须 `status==='published'`（`只能为已发布模板编译审核计划`，`:284-286`）→ `resolveEffectiveRules` → `adaptT01ConstraintsToT04` → 有 `unresolved` 直接返回无 `compiled`（宁可 BLOCKED_OWNER 不跑不完整计划，`:290-292`）→ 从 constraints 提取 `fieldUnits`（`:293-296`）→ `buildT04TargetsFromCase` → `compilePublishedTemplateReviewPlan({template,effectiveRules,constraints,targets,phase,asOfDate?})`（`:297-305`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产：`review-v3-main-template-run.ts:22`（`compileTemplatePlanForCase`）、`:83`（调用）。`adaptT01ConstraintsToT04`/`buildT04TargetsFromCase`/`buildT04TargetFromCase` 无生产调用者（template-run 只用 `compileTemplatePlanForCase`）。
- 测试：`review-v3-main-template-plan-bridge.test.ts:125`（动态 import，11 例）。

出向：`@profer/shared`（`CaseAggregateV2`/`TemplateVersion`/`TemplateCriterionSpec`/`RuleSpec`）；`review-v3-t04-published-plan.ts:18-23`（`compilePublishedTemplateReviewPlan` + T04 类型）；`effective-rules.ts:24`（`resolveEffectiveRules`）；`review-v3-t04-rules-scoring.ts:25`（`T04Value` 类型）。

## 5. 数据 I/O、读写与副作用

- 纯内存适配：无磁盘/网络/IPC；输出仅计划结构。
- 副作用：`compileTemplatePlanForCase` 抛 `Error('只能为已发布模板编译审核计划')`（非 prefixed）。
- 幂等：纯函数（同输入同输出）；`asOfDate` 影响指纹（经 T04 编译器）。

## 6. 分支、失败、取消与恢复

| 未映射（`unresolved[].reason`）/抛错 | 触发 | 行 |
| --- | --- | --- |
| `负责人尚未确认该数值规则` | 缺确认人/时间/文本 | 88 |
| `约束缺少字段键或阈值` | 形状 | 92 |
| `模板中不存在该字段` | 字段缺失 | 97 |
| `T04 不支持 <op>，不得猜测比较语义` | 未知算子 | 101-102 |
| `有效规则中找不到同名规则身份` | 规则身份缺失 | 107 |
| `Error('只能为已发布模板编译审核计划')` | 非发布模板 | 285 |

- 有 unresolved 时 `compiled===undefined`（`:290-292`）——由调用方（template-run）拒绝执行。
- 失败后状态：纯函数无写入；恢复 = 负责人补确认/修正约束。

## 7. 权限与权威状态

- 约束必须“负责人已确认”（`ownerStatement`，`:81-90`）；规则身份以 `resolveEffectiveRules` 为准（`:8-10`）。
- 字段事实的 `confirmed` 只认人工确认 Observation（`extractedBy==='user' && confirmed===true`，`:141-143`）；表单申报值不冒充核实。
- `asOfDate` 显式化（`:270-273`）：缺省时带有效期规则保持 pending 而非机器时间判定。

## 8. 修改影响面

- 改 `T04TemplatePlanBridgeResult` 影响 `review-v3-main-template-run.ts:86-93` 的拒绝逻辑。
- 改约束映射影响 T04 计划指纹/检查（`review-v3-t04-published-plan.ts`）与 11 个测试断言。
- 改目标构造影响 T04 评估的 case/subject/group 三域（测试 `:128-155` 例）。

## 9. 测试证据

直接测试：`review-v3-main-template-plan-bridge.test.ts`（216 行，11 例，详见其手册）：18→compliant、21→non-compliant、无人工确认→pending、未知→pending 不当 0、缺材料不虚构、subject/group 真实目标、asOfDate 封指纹、忽略原件不进材料/来源、gte→field-minimum、真实 T01 编辑器 owner-statement、未确认约束不进计划。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`buildT04TargetFromCase` 兼容分支、`extraSourceVersionIds`（注释有但实现未见使用——见 §10）、未知 operator、`fieldUnits` 冲突（同字段两单位）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| lte/gte 映射不猜语义 | 已证实 | `:100-123`；测试 `:178-188` |
| unresolved→无 compiled | 已证实 | `:290-292` |
| confirmed 只认人工确认 | 已证实 | `:141-155`；测试 `:107-113` |
| asOfDate 显式 | 已证实 | `:270-273`；测试 `:157-163` |
| 纯函数无副作用 | 已证实 | 全文无 IO |
| `extraSourceVersionIds` 未被实现消费 | 已证实（静态） | 接口 `:268-269` 声明，函数体无引用 |
| T04 编译器内部 | 未知（文件外） | `review-v3-t04-published-plan.ts` 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `adaptT01ConstraintsToT04` | §3.1 | 67-126 | covered |
| `buildT04TargetsFromCase` | §3.2 | 195-254 | covered |
| `compileTemplatePlanForCase` | §3.3 | 282-307 | covered |
| `t04FieldsOf`/`confirmedFactOf` | §3.2 | 144-184 | covered |
| 权威/asOfDate | §7 | 81-90,141-143,270-273 | covered |
| `extraSourceVersionIds` | §10 | 268-269 | unknown（未消费） |
| T04 内部 | §10 | — | unknown |
