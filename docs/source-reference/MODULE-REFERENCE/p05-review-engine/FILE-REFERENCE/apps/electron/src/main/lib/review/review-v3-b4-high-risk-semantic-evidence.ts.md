---
path: apps/electron/src/main/lib/review/review-v3-b4-high-risk-semantic-evidence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86ffd95ee4537f6dd0b09bb5f677348c69ba0f28
sha256: 71cd00162a16f30ac6cf08d0eb3538c224a1a4348954b1ddd4ce9ad0d7bc44e8
lines: 89
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-high-risk-semantic-evidence.ts

## 1. 结论与边界

Dev-B B4：把选中的高风险源条款与冻结归档技术 Check/源证据**对账**（`validateB4HighRiskEvidence`）。文件头禁止升格（`apps/electron/src/main/lib/review/review-v3-b4-high-risk-semantic-evidence.ts:1-5`）：归档标题匹配**绝不**升为语义等价或实时校方政策权威。返回统计中 `semanticValidated:0` 恒定（`:33,88`）。

边界：只做结构+追溯校验（32 规则×Check 边×维度真话），不做语义断言（`semantic:'NOT_ATTESTED'` 字面量，`:12,37`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B4HighRiskSourceEvidence` | interface | 7-29 | `{schemaVersion:'review-v3-b4-high-risk-semantic-evidence/1'; d4FrozenSHA:string; classifications{ruleIdentity:'MATCHED_RAW_ORIGINAL';semantic:'NOT_ATTESTED';schoolPolicy:'NOT_VERIFIED';independentGold:'NOT_AUTHORIZED_OR_NOT_RUN';publicationAllowed:false}; method:string; items[32]}` | 每 item：`{domain;templateId;rawSha256; original{ruleId,headingLine,heading,excerpt,excerptEndsBeforeLine}; technical{archiveBlobSha,checkIds[],sourceIds[],sourceEvidence[],observedScopes[],expectedReviewDimensions[],dimensionsNotEvidencedInArchivedCheckFields[]}; disposition{status:'CANDIDATE_CHECK_TRACEABLE_SEMANTIC_UNPROVEN';authorityVerified:false;applicabilityVerified:false;independentGold:false;authorMayPublish:false;requiredReview[];targetedNegativeTest;negativeTestStatus:'NOT_EXECUTED_TARGET_MACHINE_OR_GOLD'}}` |
| `validateB4HighRiskEvidence` | function | 31-89 | `(proof:B4HighRiskSourceEvidence, archives:Readonly<Record<string,B4Archive>>) => {rules:number;checkEdges:number;distinctTemplates:number;semanticValidated:0;publicationAllowed:false}` | |

内部：`reject`（`:30`，`Error('B4_SEMANTIC_AUDIT_'+name)`）。

## 3. 内部逻辑与关键流程

`validateB4HighRiskEvidence`（`:31-89`）：

1. `:34-41` 头部（`HEADER`）：schemaVersion、**`d4FrozenSHA==='b68443b23293b4714e61a3b81383d3d3a56434fc'` 硬编码**（`:35`）、classifications 五字面量、`items.length===32`。
2. 逐 row（`:43-86`）：
   - `:44-48` 归档钉住：`archives[row.domain]`、模板存在（`B4_SEMANTIC_AUDIT_TEMPLATE_NOT_PINNED`）；`domain.frozenSourceGitSha===d4FrozenSHA`、`t.sourceSha256===row.rawSha256`、`(templateId,ruleId)` 不重复（`DUPLICATE_OR_UNPINNED`）。
   - `:50-61` 证据形状（`PROOF_STATUS`）：ruleId `^R-\d{2}$`、headingLine≥1、heading 前缀 `### R-xx｜`、excerpt 非空 ≥25 字符、checkIds 非空且与 observedScopes 等长、expectedReviewDimensions 非空、disposition 五 false + 两字面量。
   - `:62-76` 逐 checkId（`DUPLICATE_CHECK`/`B4_SEMANTIC_AUDIT_CHECK_MISSING`/`CHECK_MISSING`/`RULE_MISMATCH`/`SCOPE_MISMATCH`）：归档 check `bindingState==='WORKSPACE_BOUND'`；**G04 特判**（`:69`）：`check.taskId==='r'+ruleId.slice(2)`，否则 `taskTitle.startsWith(ruleId+'｜')`；observed scope 与归档 `genericScope`/`sourceIds` JSON 全等、`responsibilityEvidence==='NOT_IN_B4_CHECK_METADATA'`。
   - `:77` sourceIds 顺序拼接与 row 声明 JSON 全等（`SOURCE_IDS`）。
   - `:78-81` sourceEvidence 与 sourceIds 等长逐位对齐（`SOURCE_EVIDENCE`）。
   - `:82-85` `dimensionsNotEvidencedInArchivedCheckFields` 必须恰好=「expectedReviewDimensions 中没出现在 observedScopes JSON 里的键」（`DIMENSION_TRUTH`，「维度真话」）。
3. `:87` 覆盖断言（`COVERAGE`）：`templates.size===3 && actual.size===32`。
4. `:88` 返回 `rules:32, semanticValidated:0, publicationAllowed:false`。

## 4. 调用者与调用链

出向：类型 `./review-v3-b4-obligation-lineage`（B4Archive，`:6`）。

入向（检索=符号名+模块名，全冻结树）：

- `apps/electron/src/main/lib/review/review-v3-b4-conflict-and-instance-guard.ts:7-9,134,139`（`validateB4HighRiskEvidence` 作为实例审计前置）。
- `apps/electron/src/main/lib/review/review-v3-b4-r25-raw-clause-condition.ts:11-13,94-98,240-241`（内部集群）。
- 测试：无同名 .test.ts，全树零测试引用。

## 5. 数据 I/O、读写与副作用

无。纯结构校验 + JSON 比较；抛普通 `Error('B4_SEMANTIC_AUDIT_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（`HEADER`/`DUPLICATE_OR_UNPINNED`/`PROOF_STATUS`/`DUPLICATE_CHECK`/`CHECK_MISSING`/`RULE_MISMATCH`/`SCOPE_MISMATCH`/`SOURCE_IDS`/`SOURCE_EVIDENCE`/`DIMENSION_TRUTH`/`COVERAGE` + 2 个运行时抛错）。无异步/取消。一次性校验，无状态恢复。

## 7. 权限与权威状态

无权限分支。权威否定五字面量（classifications/disposition）+ 返回 `semanticValidated:0`；`negativeTestStatus:'NOT_EXECUTED_TARGET_MACHINE_OR_GOLD'` 表明目标机/Gold 负向测试未执行（`:27,61`）。

## 8. 修改影响面

被 B4R24（`inspectB4HighRiskInstanceEvidence:139` 前置）与 `review-v3-b4-r25-raw-clause-condition.ts:98` 消费；改校验面影响两处下游。32/3/G04 特判/维度真话都是数据契约（与冻结归档数据绑定），数据或校验改动需双向复核。无测试。

## 9. 测试证据

无直接/间接测试（全树零测试引用）。**NOT_RUN**。缺口：11 个 reject 分支无断言；G04 特判与 `DIMENSION_TRUTH` 无测试锚。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| d4FrozenSHA 硬编码钉死 | 已证实 | `:35`（与 B4R24 `:14`、B26 `:63` 同值） |
| 32 规则/3 模板覆盖断言 | 已证实 | `:41,87` |
| G04 taskId 特判 | 已证实 | `:69` |
| 维度真话反向核对 | 已证实 | `:82-85` |
| 仅内部集群消费 | 已证实（检索式见 §4，全冻结树） | grep |
| 归档数据真实性 | 未知 | 数据来源批外 |
| heading/excerpt 与真实原文一致性 | 未知 | 校验的是形状非内容 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `B4HighRiskSourceEvidence` | §2 | 7-29 | covered |
| 头部闸 | §3 | 34-41 | covered |
| 逐 row 六段校验 | §3 | 43-86 | covered |
| 覆盖断言/返回 | §3 | 87-88 | covered |
| 内容真实性 | §10 | — | unknown |
