---
path: packages/shared/src/types/review-d2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: af9776191c86551f3b1f68d2d96ebdf31718ccee
sha256: 891a5e47759d4c6a711a96ec0f5040da699b6e26d86c46ff4742584a1d335c86
lines: 152
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-d2.ts

## 1. 结论与边界

**D2 作者态条件/业务对象 → Pi RuleSpec 技术预审运行契约**（`review-d2.ts:1-4` 注释）：纯声明。红线：仅证明执行范围与出处，**不构成学校制度授权或最终审批**（`:3`）。

## 2. 导出与关键符号（13 条）

| 符号 | 类型 | 行 | 形状/红线 |
| --- | --- | --- | --- |
| `D4ClientTemplate` | interface | `:8-20` | 固定 D4 候选最小客户端入口、**无模板编辑/发布权限**（`:7`）；`selectionIssue?` 非空=不可选（`:18-19`） |
| `D4ClientSelection` | interface | `:21-25` | 仅随包 G01-I 合成学籍快照，**不接受 Renderer 提交的学籍事实**（`:23`） |
| `D2TargetKind` | type | `:27` | 6 种对象型 |
| `D2ObjectConditionV1` | interface | `:30-37` | **决定性分支需 reviewer 确认，非 LLM 推断**（`:35-36` `decidedBy:'reviewer'\|'undetermined'`） |
| `D2TargetBinding` | interface | `:40-63` | 同档案件每操作独立 objectKey/subjectId（`:39`）；`studentId` 合成 G01-I、**绝不从 applicant caseFields 推导**（`:56`）；`enrollmentStatus` 申请人声明非权威（`:61`）；conditions 必须全量含 unknown/false（`:50`） |
| `D2TrustedStudentSnapshotV1` | interface | `:65-75` | **NOT official school registry adapter**（`:64`）；`sourceKind:'controlled-synthetic'`；fields 经 reviewer 受控通道（`:73`） |
| `D2StudentScopeV1` | interface | `:79-83` | fieldKeys/intents/enrollmentStatuses?；按目标字段+意图实例化（`:77-78`） |
| `D2ScenarioSelection` | interface | `:85-95` | scenario 显式选择、**不得把未知默认为 false**（`:88`）；scenarios 不从 caseFields 推断（`:90`） |
| `D2RuleBinding` | interface | `:96-110` | authority `'request-scope'\|'unverified-policy'`（Pi 只能返回待确认，`:102-103`）；applicability/evidenceCoverage（本对象精确标签非全局白名单，`:106`）/gate 均**不得从文本推断** |
| `D2GatePredicateV1` | type | `:112-116` | 四谓词：confirmed-observation/evidence-any/case-stage/trusted-registry-field；三值 fail-closed（`:111`） |
| `D2GateExpressionV1` | type | `:117-121` | 谓词 + all/any/not 递归组合 |
| `D2ExecutionGateV1` | interface | `:123-131` | when? + material?{provider,dueStages,alternatives}；**verified trigger+due stage 前不得标缺失**（`:122`） |
| `D2RuntimePlan` | interface | `:132-152` | schemaVersion 1\|2\|3/trustedStudentSnapshot?/`mode:'technical-pre-review'`/`publicationAllowed:false`/workspace/revision/template/scenarios/authoringDigest/previewFingerprint/targets/subjects/rules/mapping/fingerprint（覆盖作者态+情景+对象边界+RuleSpec+来源，`:150`） |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）；`D2GateExpressionV1` 递归组合（`:117-121`）与内联 import（`./review-v2` 的 `ReviewSubject/RuleSpec/CaseStage`，`:5/:115/:127`）建立契约闭包。

## 4. 调用者与调用链

- 出向：`./review-v2`（ReviewSubject/RuleSpec/CaseStage）、`./review-authoring-v1` 被其内联引用 gate/studentScope（`review-authoring-v1.ts:87/:89`）。
- 入向：经 `@profer/shared` barrel；技术预审运行计划编译/执行（跨批未读）；D3/D1 引用本文件两类型。

## 5. 数据 I/O、读写与副作用

无（声明文件）。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；fail-closed 三值语义（`:111`）与 material 缺失判定前提（`:122`）为实现方义务。

## 7. 权限与权威状态

**红线密集**：不构成授权（`:3`）、D4 无发布权（`:7`）、G01-I 受控快照边界（`:23/:64/:73`）、decidedBy 非 LLM（`:35`）、studentId/enrollmentStatus 非申请人声明（`:56/:61`）、authority 待确认（`:102`）、gate/coverage 不从文本推断（`:104-108`）、`publicationAllowed:false`（`:137`）。

## 8. 修改影响面

改形状 → D2 运行计划编译/执行、D1 绑定（gate/studentScope）、D4 客户端候选展示；红线字段放松=权威边界破坏。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `D2RuntimePlan|D2TargetBinding|D2ExecutionGate` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出+红线注释 | 已证实 | 逐行读 `:1-152` |
| 运行计划实现遵守红线 | 未知 | 实现方（跨批）未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 导出 | §2 | `:8-152` | covered |
| 权威红线 | §7 | `:3/:7/:23/:35/:50/:56/:61/:64/:73/:88/:102/:106/:122/:137` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
