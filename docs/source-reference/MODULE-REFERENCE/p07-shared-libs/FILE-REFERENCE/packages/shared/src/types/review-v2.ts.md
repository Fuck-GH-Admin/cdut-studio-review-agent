---
path: packages/shared/src/types/review-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a4fd6b1b4639184f6011aecddbec02383636a5bf
sha256: ae9b73648d3fa08b6b7299c84aa4989cc0fac86bcfc98362c747050a640ec0f6
lines: 733
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v2.ts

## 1. 结论与边界

**通用审核 Agent V2 数据契约**（`review-v2.ts:1-11` 注释，03 §3）：与 V1（review.ts）并存；V2 是模板化、可核验、可恢复审核的目标模型。不变量摘要（`:5-10`）：发布版模板不可变/导出不含凭证与学生材料；未确认/冲突规则不能自动产生确定判定、不得默认首份生效；每个 CheckResult 对应一个计划检查、覆盖不从 finding 数量推导；SourceRef 必须带 caseId/documentVersionId/parseRevision + 明确位置、**无准确坐标不得伪造**；BusinessDecision 独立于 AI 建议、更正追加不覆盖。

## 2. 导出与关键符号（49 条，分 12 组）

**通用基础（`:18-64`）**：`FieldValue` 9 kind、`FieldSpec`（conditionRequired/extractionHint 非注入代码 `:39`/visibility/scope/sectionId）、`ConditionAST`（all/any/not/field/fact + 8 op，**不 eval** `:55`）、`TriState`（unknown 不得当 false/0 `:63`）。

**来源/文档（`:69-124`）**：`SourceLocation` 5 kind（无坐标用 file 级并说明 `:68`）、`SourceRef`、`DocumentVersion`（blocks 含 ocr/vision/table 元数据 `:102-114`；**登记≠已读** usage 4 态 `:115`；`manualReadReceipt?` 可弥补解析失败 `:118`；版本链 active/supersedes/byteHash `:120-123`）。

**模板/规则（`:129-238`）**：`MaterialSlotSpec`（requiredAt 缺件阻断阶段 `:136`）、`TemplateSheetCheckSpec`（**有限操作，不接受脚本/任意公式** `:146`）、`TemplateCriterionSpec`/`TemplateSectionSpec`（多分项共享同一案卷/运行 `:170`）、`RuleExecutionKind`、`RuleSpec`（when/requirement/calculation/semanticOutputEnum/onFail/onUnknown/**confirmation 三值——未确认/冲突不能自动产生确定判定** `:214-215`/exceptions/workspaceConstraint/dataCheck）、`PolicyVersion`（owner-statement 不伪造页码 `:232`）。

**流程/量表/模板（`:241-311`）**：`WorkflowStageSpec`（7 kind、nextStageId/returnToStageId/workflowOwner）、`RubricSpec`（missingStrategy/tieBreaker/N1a 扩展 `:263-268`）、`TemplateVersion`（schemaVersion:2、objectType 6 种、catalogKind/sourceNote（开源参考≠采纳其校规 `:281`）、policyRefs 精确引用 `:292`、`executionScope` **Main 发布派生不接受作者自填** `:300-306`、status draft→published→deprecated）。

**案卷/主体（`:315-369`）**：`RoleId` 7、`CaseStage` 9、`ReviewSubject`（correction 两层保留原值 `:331`）、`ReviewCaseV2`（`nativeWorkspaceDraft?` **三栏兼容 DRAFT，非已发布政策/计划/签署决定** `:348-353`、revision 乐观并发 `:363`）。

**事实/证据（`:374-400`）**：`Observation`（缺失≠零值、supersedes 链 `:373/:383`）、`EvidenceLink`（**共享证书≠重复申报** `:388`、重复计分由规则判 `:397`）。

**检查/发现（`:404-469`）**：`CheckStatus` 7、`CheckResult`（每计划检查都有记录 `:408`、basis 追溯 `:419`、calculation 明细）、`AiOpinion`（与确定检查分开、verification 三态 `:441`）、`FindingDisposition` 7（**忽略是有理由的处理，不自动成为符合** `:446`）、`FindingDispositionRecord`、`SubjectAdjudication`（supersedes 追加 `:457`）。

**运行（`:473-534`）**：`RunV2Status` 9、`CheckpointRecord`、`ReviewRunV2`（**已完成不可改，补件/修正新建运行** `:487`；inputManifest 含 planFingerprint——旧运行无该字段=未绑定计划，**不得据此推断计划已通过** `:505-509`；coverage 双分母 `:515`；modelUsage/agentActivity/initiatedBy）。

**决定/补件/申诉（`:539-592`）**：`BusinessDecision`（**AI 建议不是决定** `:538`、finalScores 与建议分列 `:545`、finality/amends 追加 `:551-553`）、`SupplementRequest`（**回复≠满足** `:558`、G04 回流 `:573`）、`Appeal`（resolution 中文业务语义，旧值迁移人工确认 `:587`）。

**评委/批次/交接（`:597-643`）**：`JudgeAssignment`（**回避≠缺评** `:602`）、`JudgeRating`（对外/内部分列 `:614`）、`ReviewBatch`（锁定政策版本 `:622`）、`SyncReceipt`（幂等+期望外部版本 `:633`）。

**命令契约（`:648-698`）**：`ActorSource` 5（'agent'=显式指派不冒充校方 `:647`）、`Actor`、`ReviewAppCommand<T>`、`ReviewAppErrorCode` 5、`ReviewAppCommandResult/Error`、**`assertExpectedRevision` 函数**（`:685-698`，冲突返回当前版不覆盖旧快照 `:684`）。

**模型能力（`:703-733`）**：`ModelCapability`（source 实测/声明/未知，**不能仅从模型名猜** `:702`）、`ModelSelection`（**渠道被删/禁用时暂停需模型阶段，不静默改用** `:715`）、**`resolveModelSelection` 函数**（`:722-733`：不存在/禁用/模型不在列表三 throw）。

## 3. 内部逻辑与关键流程

仅 2 函数：`assertExpectedRevision`（`:685-698`）单比较返回错误对象或 null；`resolveModelSelection`（`:722-733`）find + 三 throw + 返回 `{channel:{id,protocol}, model}`。其余纯类型。

## 4. 调用者与调用链

- 入向：`@profer/shared` barrel；`review-v2-contracts.ts`（import 8 类型 `:9`+内联 RuleSpec/CaseStage/ActorSource/RoleId/ReviewBatch/ReviewCaseV2 等）；`review-d2.ts`（ReviewSubject/RuleSpec/CaseStage）；主进程/渲染层审核链（跨批实现未读）。
- 出向：`./review-domain-packs`（`ReviewDomainPackId` `:13`）、`./review`（`RuleConstraint` 内联 `:222`）。

## 5. 数据 I/O、读写与副作用

无（声明+纯函数）；`assertExpectedRevision`/`resolveModelSelection` 无副作用（后者抛错）。

## 6. 分支、失败、取消与恢复

`resolveModelSelection` 三失败分支（`:727/:728/:730`）抛 `Error`（调用方映射 CAPABILITY_UNAVAILABLE，`:721` 注释）；`ReviewRunV2` 不可改+新建运行语义（`:487`）、Appeal/Supplement 恢复语义由实现方承担。不适用取消。

## 7. 权限与权威状态

不变量红线（`:5-10`）+ 分布式红线：不 eval（`:55`）、无坐标不伪造（`:68`）、登记≠已读（`:115`）、模板不可变（`:271`）、executionScope 不自填（`:300`）、AI 建议≠决定（`:538`）、回复≠满足（`:558`）、回避≠缺评（`:602`）、不冒充校方（`:647`）、不静默换渠道（`:715`）。

## 8. 修改影响面

改类型 → 审核全链（模板/案卷/运行/决定/批次/聚合 `review-v2-contracts` 闭包）；改 2 函数 → 并发校验与模型选择路径。

## 9. 测试证据

**直接测试：无**（`review-v2-contracts.test.ts` 测的是 contracts 文件的 4 函数与结构冒烟，仅类型引用本文件）。负向检索：冻结树 `*.test.*` 检索 `assertExpectedRevision|resolveModelSelection|ReviewRunV2` → 0 专属命中。2 函数与全部不变量**无测试锁定**。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 49 导出+不变量注释+2 函数 | 已证实 | 逐行读 `:1-733` |
| 下游实现遵守不变量 | 未知 | 跨批实现未读 |
| 2 函数行为 | 已证实（代码）/未测 | `:685-698`、`:722-733` |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 49 导出（12 组） | §2 | `:18-733` | covered |
| 2 函数 | §3/§6 | `:685-733` | covered |
| 不变量红线 | §1/§7 | `:5-10` 及分布行 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
