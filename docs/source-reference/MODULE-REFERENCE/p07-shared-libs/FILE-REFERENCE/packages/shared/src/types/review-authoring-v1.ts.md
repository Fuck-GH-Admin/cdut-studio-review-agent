---
path: packages/shared/src/types/review-authoring-v1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7982ae7b5d401bb5269b9131346320b62b683ed9
sha256: 704d6dd0dbfbd2411493bd5caa0015dd9c35553fa62a82cf11f6e70c66ebb625
lines: 150
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-authoring-v1.ts

## 1. 结论与边界

**D1 审核作者态最小持久化契约 v1**（`review-authoring-v1.ts:1-4` 注释）：纯声明。红线：组织 Pi 审核责任、**不规定工具执行步骤**；与运行时 TemplateVersion/RuleSpec 分离；**D1 候选快照不具备正式发布权限**（`:3`）。

## 2. 导出与关键符号（12 条）

| 符号 | 类型 | 行 | 形状/红线 |
| --- | --- | --- | --- |
| `ReviewAuthoringSourceKindV1` | type | `:5-9` | `'synthetic'\|'user-request'\|'cross-school-reference'\|'policy-candidate'` |
| `ReviewAuthoringSourceV1` | interface | `:12-25` | sourceId/kind/label/reference?{documentVersionId,locator,excerpt?}/`verification:'unverified'\|'content-checked'`/`applicability`/note。**来源与制度效力分开；verifiedContent 不代表本案适用或行政授权**（`:11`）；locator 非已核验 SourceRef（`:18`） |
| `ReviewAuthoringResponsibilityV1` | interface | `:27-33` | id/title/requirement/completion/limits? |
| `ReviewAuthoringParameterV1` | interface | `:35-39` | key/description/defaultValue? |
| `ReviewAuthoringUseV1` | interface | `:42-49` | id/moduleId/version/scenario?/objectKey?/bindings? |
| `ReviewAuthoringModuleV1` | interface | `:51-62` | moduleId/version/name/purpose/scope/limits/source/tasks/parameters?/references? |
| `ReviewAuthoringTemplateV1` | interface | `:65-78` | templateId/version/name/purpose/limits/source/scenarios?/`genericScenarioAxes?{primary,conditions}`（COMMON-02：primary 互斥、conditions 增补轴，id 必须在 scenarios 中，`:73-75`）/modules/localTasks |
| `ReviewAuthoringSourceBindingV1` | interface | `:81-94` | 作用在实例路径非模块定义（`:80`）：checkId/sourceIds/applicabilityNote?/`gate?: import('./review-d2').D2ExecutionGateV1`/`studentScope?`/`genericScope?{businessTypes,evidenceFacts}`（COMMON-01：逐对象实例化，`:90`）/caseScopeJustification? |
| `ReviewAuthoringAdvancedV1` | interface | `:100-104` | **只在拥有真实执行映射后生效；声明了而运行编译器不能映射必须阻断**（`:97-98`） |
| `ReviewAuthoringWorkspaceV1` | interface | `:106-123` | schemaVersion:1/workspaceId/`revision`（草稿修订号≠TemplateVersion、不能当历史回滚，`:109`）/definitions/sources/sourceBindings/`sharedModuleLocks?: ReviewD3ModuleLock[]`（只记 reuse/import，未列=workspace-local 草稿，`:117-120`）/advanced? |
| `ReviewAuthoringRuleMapV1` | interface | `:126-133` | checkId/criterionId/ruleId/ruleDigest/sourceIds/sourceKinds；作者态 manifest **不替代 ReviewRun.inputManifest**（`:125`） |
| `ReviewAuthoringManifestV1` | interface | `:135-150` | schemaVersion:1/workspaceId/revision/templateId/templateVersion/authoringDigest/previewFingerprint/templateDigest/effectiveRuleDigest/mapping/`status:'review-candidate'`/`publicationAllowed:false`（**不得当行政发布凭证**，`:148-149`） |

## 3. 内部逻辑与关键流程

无逻辑（纯声明）；内联 import 类型（`./review-d2` 的 gate/studentScope `:87/:89`、`./review-d3` 的 `ReviewD3ModuleLock` `:121`）建立跨文件契约。

## 4. 调用者与调用链

- 出向：`./review-d2`（D2ExecutionGateV1/D2StudentScopeV1）、`./review-d3`（ReviewD3ModuleLock；本批同组）。
- 入向：经 `@profer/shared` barrel；D1 工作台/模板制作工具（跨批实现未读）；`review-d3.ts` 引用 `ReviewAuthoringModuleV1/WorkspaceV1`（`review-d3.ts:6`）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；持久化语义由工作台实现承担。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；"advanced 声明无法映射必须阻断"（`:98`）为实现方义务。

## 7. 权限与权威状态

**红线密集**：候选快照无发布权（`:3`）、来源≠制度效力（`:11`）、locator 非核验（`:18`）、revision 非回滚（`:109`）、sharedModuleLocks 不可目录猜测（`:119`）、manifest 非发布凭证（`:148`）、`publicationAllowed:false` 字面量（`:149`）。

## 8. 修改影响面

改形状 → D1 工作台、D3 传输包（引用本文件两类型）、D2 契约（被内联 import）；红线字段（publicationAllowed/revision 语义）不得随意放松。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewAuthoring` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 导出+红线注释 | 已证实 | 逐行读 `:1-150` |
| 工作台/编译器遵守红线 | 未知 | 实现方（跨批）未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 导出 | §2 | `:5-150` | covered |
| 权威红线 | §7 | `:3/:11/:18/:80/:98/:109/:119/:148-149` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
