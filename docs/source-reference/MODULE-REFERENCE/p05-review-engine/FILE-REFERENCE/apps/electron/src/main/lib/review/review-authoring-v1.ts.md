---
path: apps/electron/src/main/lib/review/review-authoring-v1.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d86bc102b26109dc074df2e739bda65319f7ec8f
sha256: 52e26b4a3292507701612eaa7059b8895a9e91977c6f150414799b29bb587e53
lines: 338
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-authoring-v1.ts

## 1. 结论与边界

D1 作者态 → 既有 TemplateVersion/RuleSpec 的**可验证候选快照**（`apps/electron/src/main/lib/review/review-authoring-v1.ts:1-5`）：复用 D0.5 已验证组合；运行时仍只有现有 `resolveEffectiveRules`/Pi 服务；不确认真实校规、不生成审批结论；**高级约束不能映射时 fail-closed**。四个导出：`validateReviewAuthoringV1`（结构+语义校验）、`compileReviewAuthoringCandidateV1`（候选编译）、`digestAuthoringTemplateV1`（内容摘要）、`verifyReviewAuthoringManifestV1`（sidecar 一致性）。

边界：`compileReviewAuthoringCandidateV1` 产物带 `publicationAllowed:false`/`status:'review-candidate'`（`:282`）；`sourceNote='D1_AUTHORING_CANDIDATE: …禁止无授权发布'`（`:247`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `validateReviewAuthoringV1` | function | 56-192 | `(workspace:ReviewAuthoringWorkspaceV1) => string[]` | 问题列表（去重，`:191`） |
| `ReviewAuthoringCandidateV1` | interface | 194-198 | `{template:TemplateVersion; manifest:ReviewAuthoringManifestV1; preview:DemoPreview}` | |
| `compileReviewAuthoringCandidateV1` | function | 204-285 | `(workspace, templateId, version) => ReviewAuthoringCandidateV1` | 抛错式失败 |
| `digestAuthoringTemplateV1` | function | 288-291 | `(template) => string` | 删 createdAt/publishedAt/status 后 sha256 |
| `verifyReviewAuthoringManifestV1` | function | 294-338 | `(template, manifest, workspace) => string[]` | sidecar 校验 |

内部：`ID`/`sha`/`shaCheckId`（`:17-20`，criterionId 复用 D0.5 对 checkId 的 UTF-8 hash 口径，`:19`）、`toDemo`（`:21-25`）、`sourceUsableInCandidate`（`:27-29`：仅 `synthetic/user-request` + `request-scope`）、`STRUCTURE_KEYS`（`:30-44`，13 组允许字段表）、`checkKnownFields`（`:47-52`：未知字段≠空条件，`:46`）。

## 3. 内部逻辑与关键流程

### 3.1 `validateReviewAuthoringV1`（`:56-192`）四段

1. 头/结构（`:58-66`）：schemaVersion===1、workspaceId `ID`、revision 安全整数、定义/来源数组。
2. `checkKnownFields` 全树（`:67-134`）：workspace/definitions/module/template/source/binding/advanced 逐层对 `STRUCTURE_KEYS`，未知键报「未映射结构化字段」；`genericScenarioAxes`（`:81-93`）：primary/conditions 各 ≤13、`ID` 格式、并集去重且恰好=scenarios 集（`D2_GENERIC_AXES_INVALID`）；binding.gate 走 `validateD2ExecutionGate`（`:101`）；`caseScopeJustification` 须 ≥12 字符且不与 student/generic scope 并存（`D2_STUDENT_CASE_SCOPE_INVALID`，`:102-104`）；genericScope（`:105-116`）/studentScope（`:117-127`）数组 ≤32、去重、ID/键格式（`D2_GENERIC_SCOPE_INVALID`/`D2_STUDENT_SCOPE_INVALID`）。
3. 语义（`:135-155`）：`validateDemoState`+`validateD3WorkspaceLocks` 并入；sources：ID 合法唯一、label/note 非空、kind 4 值/verification 2 值/applicability 3 值、reference 双必填；**policy-candidate 不得 applicability!=='unknown'**（`:149-151`）、**cross-school-reference 不得 'request-scope'**（`:152-154`）。
4. 责任↔绑定对账（`:157-190`）：多情景逐个展开求全部责任（未选情景不当无责任，`:157`）；绑定：checkId 不重复、必须存在于 expected、sourceIds 非空不重复且引用存在；反向 every expected 有绑定（`:180`）；evidenceRelations 引用校验（`:181-190`）。

### 3.2 `compileReviewAuthoringCandidateV1`（`:204-285`）

顺序 throw：`AUTHORING_INVALID`（校验不过，`:210`）→ `UNMAPPABLE_ADVANCED`（advanced 任一数组非空，`:211-213`）→ `D1_UNMAPPABLE_EXECUTION_GATE`（存在 gate，`:214-216`）→ `D3_FROZEN_LOCK_INVALID`（`:217-218`）→ `projectSimpleDemoDraft`+`previewDemo`（blocked → 抛预览问题，`:220-222`）→ 逐 task 来源可用性（`UNVERIFIED_AUTHORITY`，`:226-232`）→ 逐 task 回填来源声明到 criterion.requirement（`RULE_TRUTH_MISMATCH` 找不到 criterion，`:235-245`，注释：不伪造真实材料 SourceRef）→ 描述/sourceNote 打候选标（`:246-247`）→ `validateTemplate` error 级 → `TEMPLATE_INVALID`（`:248-249`）→ 数量三方一致（criteria===preview.tasks===effective，`RULE_TRUTH_MISMATCH`，`:250-255`）→ mapping 逐条核 RuleSpec 与 criterion 四字段一致（`:257-276`）→ manifest 组装（`authoringDigest=sha(workspace)`、`previewFingerprint`、`templateDigest`、`effectiveRuleDigest=hashEffectiveRuleSet(effective)`，`:277-283`）。

### 3.3 `digestAuthoringTemplateV1`（`:288-291`）

剔除 `createdAt/publishedAt/status` 三键后 sha——只有内容修改改变 digest（`:287`）。

### 3.4 `verifyReviewAuthoringManifestV1`（`:294-338`）六段

① workspace digest/identity 一致（`:300-303`）；② 作者态仍合法（`:304-306`）；③ preview.fingerprint 匹配（`:307-312`）；④ 候选标记（`publicationAllowed===false && status==='review-candidate'`，`:313-315`）；⑤ 模板身份+templateDigest（`:316-319`）；⑥ effectiveRuleDigest + mapping 无遗漏/重复 + 逐条 ruleDigest 与来源映射双 digest（sourceIds 与 sourceKinds 顺序敏感，`:320-336`）。

## 4. 调用者与调用链

出向：`node:crypto`、`@profer/shared` 类型、`./semantic-module-demo`（previewDemo/projectSimpleDemoDraft/validateDemoState）、`./effective-rules`（resolveEffectiveRules/hashEffectiveRuleSet）、`./template-store`（validateTemplate）、`./review-d3-workspace-locks`、`./review-d2-execution-gates`（`:6-15`）。

入向（检索=符号名+模块名，全冻结树）：

- `validateReviewAuthoringV1`：`apps/electron/src/main/lib/review/review-d2-runtime.ts:12,69,148`、`review-d4-catalog.ts:6,94`、`review-authoring-store-v1.ts:10,33,88`（产品/D4/存储链）。
- `compileReviewAuthoringCandidateV1`/`verifyReviewAuthoringManifestV1`：`apps/electron/scripts/review-authoring-v1.ts:17,46,57,58`（**CLI 脚本**调用）+ `review-authoring-v1.test.ts`（本批断言群）——无运行时产品（IPC/渲染）调用（检索范围=全冻结树符号名）。
- `digestAuthoringTemplateV1`：仅本文件自用（`:280,317`），零外部引用。
- `ReviewAuthoringCandidateV1`：仅本文件自用（`:194,208`）。

## 5. 数据 I/O、读写与副作用

无写盘/网络（纯校验+投影；`sha` 计算）。副作用=throw/返回问题数组。数据流：workspace→(issues|candidate)。

## 6. 分支、失败、取消与恢复

- `validate` 只报不抛；`compile` 抛 7 类错误（`AUTHORING_INVALID`/`UNMAPPABLE_ADVANCED`/`D1_UNMAPPABLE_EXECUTION_GATE`/`D3_FROZEN_LOCK_INVALID`/预览阻断/`UNVERIFIED_AUTHORITY`/`RULE_TRUTH_MISMATCH`/`TEMPLATE_INVALID`）；`verify` 只报。
- fail-closed 原则：未知结构字段≠空条件（`:46`）、高级约束不静默降级（`:200-202` 注释）。
- 无异步/取消。

## 7. 权限与权威状态

无权限分支（无 actor/sender）。权威口径：以 `resolveEffectiveRules` 结果为真值核对作者责任（`:202`）；候选/来源警告写进 criterion.requirement 使 Pi 任务文本不丢来源性质（`:233-234`）；`publicationAllowed:false` 恒定（`:282,313-315`）。

## 8. 修改影响面

- `validateReviewAuthoringV1` 被 D2 运行时与 D4 目录消费——改校验面影响 D2/D4 链（`review-d2-runtime.ts:69,148`、`review-d4-catalog.ts:94`）。
- `digestAuthoringTemplateV1` 口径（剔除三键）是 manifest 契约；改之则旧 manifest 全部失效。
- `STRUCTURE_KEYS`/scope 上限（13/32/12 字符）与 `review-d2-execution-gates.ts`/`semantic-module-demo` 的口径需同步。
- 测试：`review-authoring-v1.test.ts`（本批 329 行）。

## 9. 测试证据

直接测试 `review-authoring-v1.test.ts`（本批，329 行；用例详情见该篇）。静态读到的断言（`:89-151`）：合法 workspace → `[]`；compile+verify → `[]`；模板改动 → 「模板内容或版本与作者态 manifest 不符」「生效规则集与作者态 manifest 不符」；manifest.mapping 改动 → 「责任来源映射与作者态不一致」；workspace 改动 → 「作者态定义或来源绑定已变化」；未知字段 → 「未映射结构化字段：condition」+ `compile` 抛 `AUTHORING_INVALID`；指纹变 → 「责任包指纹」；缺绑定/坏引用 → 「审核责任缺少来源绑定」「不存在的来源」。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 高级约束/gate fail-closed 不静默降级 | 已证实 | `:211-216` |
| 未知字段≠空条件 | 已证实 | `:46-52` |
| 数量三方一致 + RuleSpec 四字段比对 | 已证实 | `:253-266` |
| policy-candidate/cross-school 适用性限制 | 已证实 | `:149-154` |
| digest 剔除三时间/状态键 | 已证实 | `:288-291` |
| compile/verify 经 CLI 脚本+测试调用，无运行时产品调用 | 已证实（否定结论，检索式见 §4，全冻结树） | grep + 子 agent 调查 |
| `digestAuthoringTemplateV1`/`ReviewAuthoringCandidateV1` 零外部引用 | 已证实（否定结论，同上） | 同上 |
| `resolveEffectiveRules` 真值语义 | 推断 | effective-rules 批外未读 |
| 真实 workspace 数据分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 + 6 内部 | §2 | 17-56 | covered |
| validate 四段 | §3.1 | 56-192 | covered |
| compile 7 类抛错 | §3.2 | 204-285 | covered |
| digest/verify 六段 | §3.3-3.4 | 288-338 | covered |
| effective-rules 依赖语义 | §10 | — | unknown |
