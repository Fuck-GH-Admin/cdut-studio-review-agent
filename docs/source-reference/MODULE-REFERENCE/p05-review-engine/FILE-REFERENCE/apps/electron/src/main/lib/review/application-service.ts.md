---
path: apps/electron/src/main/lib/review/application-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07c72530b7ca23c1f5740caeb9cd0695d6487d93
sha256: 9a04ee9b2ae6dfe6a8b7b56dc94b6956eb8c9ed499d2a803fb8234ed24799764
lines: 578
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/application-service.ts

## 1. 结论与边界

审核应用服务（N1c，头注 :1-9）：N1 命令子集——CreateCaseFromTemplate / UpdateFields / CorrectObservation / SetEvidenceLink / UpsertCaseSubject；每条都校验发布依赖/字段作用域/确认锁。**AI 工具不能直接调用这些命令的人工动作**（actor 来源按命令传入）。

边界：事务经 `case-store-v2.submitCommand`（CAS+回执）；字段校验本文件内（G03）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CreateCasePayload`/`CreateCaseOptions` | interface | 22-27/48-57 | 建案入参（`allowIncompleteIntake`） |
| `rawFieldTypeIssue` | fn | 58-94 | 原始输入类型门禁（RUN-38） |
| `createCaseFromTemplate` | fn | 146-220 | 模板建案 |
| `isFieldValueEmpty` | fn | 222-243 | 空值判定（0/false 是有效值） |
| `collectMissingIntakeInputs` | fn | 244-267 | 提交前缺失清单 |
| `FieldValidationIssue`/`validateFieldValuesV2` | interface/fn | 268-319 | G03 字段校验 |
| `toFieldValueV2` | fn | 320-325 | 规范化 FieldValue（与 fieldValueOf 同源） |
| `UpdateFieldsPayload`/`updateFields` | interface/fn | 326-364 | 字段更新 |
| `CorrectObservationPayload`/`correctObservation` | interface/fn | 365-405 | 人工更正（A05/U02） |
| `SetEvidenceLinkPayload`/`setEvidenceLink` | interface/fn | 406-453 | 证明绑定/状态迁移 |
| `collectMissingSubmissionSlots` | fn | 454-481 | 材料槽缺失清单 |
| `UpsertCaseSubjectPayload`/`upsertCaseSubject` | interface/fn | 482-575 | 事项补录（T06） |
| `getCaseV2Aggregate` | fn | 574-576 | 查询透传 |

内部：`fieldValueOf`（:32-45）、`validateSectionSubjects`（:101-143）、`isProvidedRaw`（:486-488）。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. **`createCaseFromTemplate`**（:146-220）：id 守卫；模板须存在且 `status==='published'`（:155-157 `只有已发布模板可创建真实案卷`）；政策引用 `validatePolicyRef` 全过（:158-161）；`validateSectionSubjects`（事项 ID 唯一/分项归属/字段作用域/类型/枚举/必填，:101-143）；案卷字段不在模板 → `案卷字段不在模板中：…`（:169）；`validateFieldValuesV2`（:171-172）；必填缺失且非 allowIncomplete → `缺少必填案卷字段: …`（:182）；caseFields/subjects 分流（subject 字段限定分项，:188-202）；`createAggregate` 落盘 + `create-{caseId}` 回执（:214-218）。
2. **`rawFieldTypeIssue`**（:62-99）：只拒「确实不可转换」形状；标量规范化放行（注释 :56-60 RUN-38 返修）。
3. **`isFieldValueEmpty`**（:225-243）：0/false 非空（注释 :223-224）。
4. **`validateFieldValuesV2`**（:278-310）：未知 key → `字段不在模板中`（作用域文案分流 :285）；required 显式传空 → `必填字段缺失`（:291）；number/date/enum 类型校验（:295-308）。
5. **`updateFields`**（:331-365）：archived 拒（:333 `已归档案卷不可修改`）；模板可选传入时校验（:334-341）；mutate 写 caseFields/subject.fields + `correction:'user-confirmed'`（:344-362）。
6. **`correctObservation`**（:370-405）：须附理由 `更正必须附理由（保留更正历史）`（:372）；sourceRefs 须当前版本在案 `更正引用了不存在、跨案或已归档的材料版本`（:373-375）；有撤销记录时零引用 → `DEPENDENCY_UNRESOLVED 材料换版后重新确认事实必须指向当前原件`（:376-378）；mutate `recordObservation(extractedBy:'user', confirmed:true)`（:380-392）。
7. **`setEvidenceLink`**（:421-458）：`evidenceLinkId` 存在时走状态迁移（须 status、链接存在、归档证据不得重确认 `已归档的证据不得重新确认为当前证据`，:423-437）；新建绑定须说明事实（:439）、证据版本 active（:440-442 `证据版本不存在或已归档`）、目标主体存在（:443-445）；mutate `buildEvidenceLinks`（:450-456）。
8. **`upsertCaseSubject`**（:491-570）：archived 拒；仅 draft `仅草案阶段可补录申报事项…`（:502）；模板不可用/未发布拒（:503-505）；分项归属/标题/字段类型/枚举/必填校验（:506-528，既有事项已有值不重复要求）；mutate 更新或新建（`subject-{ms36}-{rand4}`，`correction:'user-confirmed'`，:530-566）。

## 4. 调用者与调用链

入向（生产）：`review-c0-case-service.ts:14`（C0 门面）、`review-v3-t06-main-service.ts:23`（collectMissingIntakeInputs/createCaseFromTemplate，批量入库）、`pi-case-review-service.ts:11`/`review-pi-run-bridge.ts:8`/`review-background-state.ts:9`（getCaseV2Aggregate）。测试：`field-validation.test.ts:6`（validateFieldValuesV2）。出向：`./evidence-service`（:13）、`./template-store`（:14）、`./policy-store`（:15）、`./case-store-v2`（:16）、`./review-storage-id`（:17）。

## 5. 数据 I/O、读写与副作用

无直接 I/O；经 `submitCommand/createAggregate` 落盘（CAS+receiptLog）。`validateFieldValuesV2` 等纯函数。

## 6. 分支、失败、取消与恢复

全部拒绝经 `CommandValidationError`（VALIDATION_FAILED/NOT_FOUND/STALE_INPUT/DEPENDENCY_UNRESOLVED/INVALID_TRANSITION）在事务内中止；`requestId` 幂等（注释 :479-483）；无取消。

## 7. 权限与权威状态

- 发布依赖权威：只有已发布模板可建案（:156）、政策引用三性（:158-161）、模板未发布不能写事项（:505）。
- 字段作用域权威：subject 字段不得写 case 域（G03，:285）；分项字段限定分项（:115-117）。
- 人工确认权威：`correctObservation` confirmed=true + supersedes 链（A05）；`setEvidenceLink` 归档不得重确认；`upsertCaseSubject` 仅 draft 阶段（:502）。
- AI 边界：头注 :8「AI 工具不能直接调用这些命令的人工动作」。

## 8. 修改影响面

C0 命令面（`review-c0-case-service`）、T06 批量入库、Pi 后台查询；G03 校验被 `field-validation.test.ts` 固定。同测：`field-validation.test.ts`（4 用例）+ 他批 C0 测试族。

## 9. 测试证据

直接测试 `field-validation.test.ts`（4 用例 / 1 describe，G03；NOT_RUN）：
1. `:17-20` 未知 key → `issues[0].reason` 含 `不在模板中`。
2. `:22-26` subject 字段写 case 作用域 → 含 `不在模板中`；写 subject 作用域 → `[]`。
3. `:28-32` 非法数字/日期/枚举 → `arrayContaining([`有限数`,`ISO`,`枚举`])`。
4. `:34-37` 合法值 → `[]`。
间接：`review-c0-case-service.test`/`review-c0-subject-upsert.test`（他批）、`review-v3-t06-main-service` 链路。缺口：五命令的拒绝分支（本批无专属测试文件）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 导出/内部符号存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 发布依赖/作用域/阶段门禁 | 已证实 | :155-161/:285/:502-505 |
| 人工确认三命令语义 | 已证实 | :370-458 |
| 0/false 非空 | 已证实 | :225-243 |
| 五命令拒绝分支行为 | 未知（无本批测试） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createCaseFromTemplate`+校验链 | §3.1/§3.2 | 101-220 | covered（未测本批） |
| `validateFieldValuesV2`（G03） | §3.4/§9 | 278-310 | covered |
| `updateFields`/`correctObservation`/`setEvidenceLink` | §3.5-3.7 | 331-458 | covered（未测本批） |
| `upsertCaseSubject`/查询/槽位 | §3.8 | 460-576 | covered（未测本批） |
