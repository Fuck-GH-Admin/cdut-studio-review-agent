---
path: apps/electron/src/main/lib/review/review-v3-b4-rule-source-diff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d725f339ac37b5974dbef039252418e81ec9a381
sha256: f7cdb5c9a2d61bbf5ab2c5d19b9106f1281ed66402ad0e22fd546732728c3370
lines: 101
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b4-rule-source-diff.ts

## 1. 结论与边界

Dev-B B4 R13「规则锚账本」校验器（文件头 :1-7）：防止「规则 ID/标题巧合」被升格为「历史业务义务保留」。只读冻结 D4 Check 证据；政策、Gold、语义对齐明确在其权限之外。

不做的事：不语义判定（`semanticValidated:false`/`schoolAuthorityVerified:false` 恒定）、不发布（`publicationAllowed:false` 恒定）。

## 2. 导出与关键符号

导出 4 条（`export` 逐条核 :9/:24/:34/:44）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B4RuleAnchor` | interface | `:9-23` | 单规则锚：ruleId/headingLine/heading/firstBodyLine/firstBodyExcerpt/mappedCheckIds/candidateCheckCount/sourceIds/sourceApplicability `'UNKNOWN_NOT_APPROVED'`/risk 二值/status 二值/semanticValidated:false/schoolAuthorityVerified:false |
| `B4RuleAnchorTemplate` | interface | `:24-33` | domain/templateId/rawOriginalSha256/originalRuleCount/workspaceCheckCount/ruleAnchors/semanticAudit `'PENDING_PER_RULE_CONDITION_OBJECT_AUTHORITY'`/publicationAllowed:false |
| `B4RuleAnchorLedger` | interface | `:34-42` | `review-v3-b4-raw-rule-to-check-audit/1` + baseSourceGitSHA/evidenceMethod/publicationAllowed:false/policyApproval `'NOT_VERIFIED'`/independentGold `'NOT_AUTHORIZED_OR_NOT_RUN'`/templates[3] |
| `validateB4RuleAnchorLedger` | function | `:44-101` | `(ledger, archives) => 计数结果` |

内部符号：`fail`（:43，抛 `Error('B4_RULE_DIFF_'+why)`）。

## 3. 内部逻辑与关键流程

`validateB4RuleAnchorLedger`（:44-101）：
1. 头校验（:45-49）：schemaVersion、`baseSourceGitSHA === 'b68443b23293b4714e61a3b81383d3d3a56434fc'`、publicationAllowed false、policyApproval/independentGold 常量、templates 恰 3 个，违者 `B4_RULE_DIFF_HEADER`。
2. 逐模板（:51-97）：archive 按 domain 找且 `frozenSourceGitSHA` 一致、`sourceSha256 === rawOriginalSha256`、`obligations.length === workspaceCheckCount`、`ruleAnchors.length === originalRuleCount`、模板 ID 唯一（:53-65，违者 `B4_RULE_DIFF_TEMPLATE`）。
3. 逐规则锚（:66-89）：ruleId 形如 `R-\d\d` 且序号 1..originalRuleCount 且不重复；`firstBodyLine === headingLine+1`；`heading.startsWith('### '+ruleId+'｜')`；`semanticValidated/schoolAuthorityVerified` false；`sourceApplicability==='UNKNOWN_NOT_APPROVED'`；risk ∈ 二值；status 恒 `RULE_ID_ANCHOR_ONLY_SEMANTICS_NOT_VALIDATED`；`mappedCheckIds.length===candidateCheckCount≥1`（:67-79，违者 `B4_RULE_DIFF_RULE`）。
4. 边校验（:81-92）：check 边唯一（`DUPLICATE_EDGE`）；check 存在（`CHECK_RULE_MISMATCH`）、`bindingState==='WORKSPACE_BOUND'`、G04 特例 `taskId==='r'+序号` / 其它 domain `taskTitle.startsWith(ruleId+'｜')`（:83-90，违者 `B4_RULE_DIFF_CHECK_RULE_MISMATCH`）；`sourceIds` 与边展开顺序全等（:91-92，`SOURCE_EDGE`）。
5. 全序号覆盖（:94-95）：1..originalRuleCount 每号存在，否则 `MISSING_SOURCE_RULE`。
6. 总量封口（:97）：`total===107 && ids.size===3`，否则 `COVERAGE`。
7. 返回计数（:98-100）：templateCount/rawRules/checkAnchorEdges/highRiskRules/`semanticApproved:0`/`publicationAllowed:false`。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：**仅** `apps/electron/src/main/lib/review/review-v3-b4-r25-raw-clause-condition.ts:15-16`（`validateB4RuleAnchorLedger` 调用 :97、类型 :93/:239）。否定：`B4RuleAnchor`/`B4RuleAnchorTemplate` 无外部引用（符号名全树检索仅本文件 :9/:24 及内部 :30/:41）。无测试引用。

出向：`review-v3-b4-obligation-lineage`（B4Archive/B4ArchiveTemplate 类型 :7，使用 :45/:56）。

## 5. 数据 I/O、读写与副作用

无 IO/无副作用（依据：纯校验 + 类型导入）。输入为已解析 ledger/archives 值。

## 6. 分支、失败、取消与恢复

失败即抛 `B4_RULE_DIFF_*`（无 catch）；fail-closed；不适用「取消/恢复」（同步纯函数）。

## 7. 权限与权威状态

无 sender/role 检查。权威语义：frozenD4GitSHA 硬编码（:46）为冻结证据锚；输出恒 `semanticApproved:0/publicationAllowed:false`（:98-99），不越权做语义/政策判定（:5-6 注释）。

## 8. 修改影响面

- 唯一消费者 `review-v3-b4-r25-raw-clause-condition.ts`（audit 前置 :97）；改校验规则影响 R25 整链。
- 硬编码：107 规则/3 模板/frozenD4GitSHA（与 R25 :23 同值）。
- 无测试需同步（§9）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.ts` grep `validateB4RuleAnchorLedger`/`B4RuleAnchor` 0 命中；检索口径：全仓符号名）。运行时断言依赖 R25 调用方。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；6 段校验与错误码 | 已证实 | :44-101 |
| 107 规则/3 模板封口 | 已证实 | :97 |
| G04 taskId 特例（`rNN`）vs 其它 taskTitle 前缀 | 已证实 | :85-90 |
| check 边唯一 + sourceIds 顺序全等 | 已证实 | :81-92 |
| 仅被 R25 消费、无测试 | 已证实（否定） | 全树检索（§4） |
| archives 实物内容 | 未知（运行时输入） | — |
| `B4Archive` 内部结构 | 未知（属 review-v3-b4-obligation-lineage） | :7 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateB4RuleAnchorLedger` 全步骤 | §3 | :44-101 | covered |
| 3 个导出接口 | §2 | :9-42 | covered |
| 错误码矩阵 | §3/§6 | 见 §3 | covered |
| 测试断言 | §9 | — | unknown（无测试） |
| archives 实物 | §10 | — | unknown |
