---
path: apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6c7d687a58098ec578bdaa2e177ff5f6af76e090
sha256: 07aa1442a20a62b44a8632577dfc51d268bac5ae1a4934abc0cdce1f30e5c15a
lines: 151
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts

## 1. 结论与边界

把 B1 作者候选（已冻结的 `ImmutablePlanDescriptorB1`）安装成本机原生草稿案卷上的 D2 技术预审计划：唯一入口是 IPC `LOCAL_B1_ATTACH_PLAN_V3` handler。它校验案卷“未绑定原生草稿”、B1 冻结记录与作者修订、候选模板壳资格（必要时先登记候选壳），再构造 `D2RuntimePlan` 并经 `submitCommand` 写入案卷。运行时服务 + IPC 注册。

边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts:1`）：

- 不发布模板、不产生学校政策/审批；计划固定 `mode:'technical-pre-review'`、`publicationAllowed:false`（`:114-115`）。
- 不解析/不编译作者文档；descriptor（含 `bindingDetails`/`sourceLedger`）来自 `readB1FrozenCandidate` 冻结记录（`:29-33`）。
- 不读渲染层身份；actor 固定 `local-reviewer`（`:15`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（接口/类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `installC11NativeB1TechnicalPlan` | 函数（导出） | 17-151 | `()=>void` | 注册 `LOCAL_B1_ATTACH_PLAN_V3` handler（`:18`） |
| `sha` | 内部 | 14 | `(x)=>sha256(JSON.stringify(x)??'undefined')` | ID/指纹 |
| `actor` | 内部常量 | 15 | `{actorId:'local-reviewer',actorSource:'local',role:'reviewer'}` | 固定 Actor |

## 3. 内部逻辑与关键流程

按 handler 执行顺序（`apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts:18-150`）：

1. `assertC0ReviewMainSender(event)`（`:21`）。
2. 入参：`caseId` 字符串、`isSafeTemplateId(templateId)`、`fingerprint` 64 hex，否则 `B1_AUTHOR_OR_CASE_REQUIRED`（`:22-23`）。
3. 案卷必须是未绑定的原生草稿：`isNativeWorkspaceCaseV3`、`stage==='draft'`、`templateId==='pending-template-v3'`、无 `d2RuntimePlan`、无 `canonicalPlan`、无 subjects、无 reviewRules，否则 `B1_UNBOUND_NATIVE_DRAFT_REQUIRED`（`:24-28`）。
4. `readB1FrozenCandidate(templateId,fingerprint)` 缺失 → `B1_FROZEN_TEMPLATE_NOT_FOUND`（`:29-30`）；`readB1AuthorRevision(templateId,frozen.revision)` 缺失 → `B1_AUTHOR_REVISION_MISSING`（`:31-32`）。
5. `version=Number(author.templateVersion)` 须 ≥1 安全整数 → `B1_NUMERIC_VERSION_REQUIRED`（`:33-34`）。
6. **fallback- 公共兜底来源覆盖检查**（仅 `author.templateId.startsWith('fallback-')`，`:38-48`）：active 文档非空、恰 1 个 `application`、`descriptor.sourceLedger` 的 `documentVersionId` 集合与 active `versionId` 集合等势且无重复、每条 source `kind==='user-declared'` 且 `locator==='native-document:'+documentVersionId`，否则 `B1_FALLBACK_NATIVE_SOURCE_COVERAGE_MISMATCH`；随后对每个 active 文档 `assertC2PhysicalOriginalBytes`（`:48`）。
7. 模板占用：`getTemplate(templateId,version)` 存在且（不是 candidate-held 或 `sourceNote` 不以 `D1_AUTHORING_CANDIDATE: B1` 开头）→ `B1_TEMPLATE_VERSION_OCCUPIED`（`:50-53`）。
8. 不存在则登记最小候选壳（`:54-65`）：`schemaVersion:2`、`fields/materialSlots/sections` 空、单 `manual-review` 阶段、单 `item-feedback` 输出、`status:'draft'`、`sourceNote:'D1_AUTHORING_CANDIDATE: B1 local technical draft'`，`saveAuthoringCandidateDraft(shell)`（`:64`）。
9. 目标/主体构造（`:66-86`）：`targets` 为 `kind:'custom-object'`，`objectKey='b1-'+sha([i,item.objectKey]).slice(0,24)`、`subjectId='b1-'+sha([i,item.subjectId]).slice(0,24)`、`title=item.objectKey`；主体字段 = `b1ObjectKey`/`b1Scenario` + `item.fieldValues`（number→`number`、boolean→`boolean`、其余→`text`，null 跳过），`sectionId='d2-scope-'+sha(t.objectKey).slice(0,16)`、`status:'confirmed'`（`:84-85`）。
10. 规则/映射（`:87-112`）：逐 `descriptor.bindingDetails`；目标缺失 → `B1_TARGET_NOT_FOUND`（`:90`）；规则 ID `'d2-'+sha([templateId,version,checkKey,targetKey]).slice(0,20)`（`:92`）；`authority`：`b.sourceIds` 全部 `user-declared` → `request-scope`，否则 `unverified-policy`（`:93-94`）；fallback- 来源用 `b.sourceVersionIds`（真实 DocumentVersion），否则用 `b.sourceIds`（`:95-98`）；`RuleSpec` 固定 `targetScope:'subject'`、`execution:'semantic'`、`onFail:'manual-review'`、`onUnknown:'needs-confirmation'`、`priority:50000+i`、`confirmation` 随 authority（`:99-108`）；映射 `{checkId:b.checkKey+'#'+b.targetKey, ruleId, objectKey, subjectId, sourceIds, authority, applicability}`（`:109-111`）。
11. 映射为空 → `B1_PLAN_HAS_NO_CHECKS`（`:113`）。
12. 计划定型：`schemaVersion:1`、`workspaceId:'b1-'+templateId`、`revision:frozen.revision`、`authoringDigest:descriptor.authorDigest`、`previewFingerprint:descriptor.canonicalPlan.fingerprint`、`fingerprint=sha(bare)`（`:114-120`）。
13. `assertC0ReviewMainSender(event)`（`:121`）后 `submitCommand`（`:122-141`）：`requestId='native-b1-'+randomUUID()`、`type:'AttachB1LocalTechnicalPlan'`、`expectedRevision=current.caseV2.revision`；handler 内再校验（`:127-130`）并 `mutate`：写模板 ID/版本、`objectType:'document'`、追加 subjects、写 `reviewRules`、写 `caseFields.d2PlanFingerprint`、写 `d2RuntimePlan`（`:131-138`）。
14. `!result.ok` → `Error(code+': '+message)`（`:142`）；`verifyD2InstalledPlan` 有问题 → `B1_INSTALLED_PLAN_INCONSISTENT`（`:143-144`）。
15. 返回 `{caseId,templateId,templateVersion,checks:mapping.length,fingerprint}`（`:145-146`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- 生产注册：`apps/electron/src/main/index.ts:193` 导入、`:951` 调 `installC11NativeB1TechnicalPlan()`（启动，与 `installC11LocalAuthorWorkbench`/`installC11LocalNativeProductIntake`/`installC11NativeD4TechnicalPlan` 同段）。
- preload：`apps/electron/src/preload/index.ts:4833-4836`（`attachB1TechnicalPlanV3` → `LOCAL_B1_ATTACH_PLAN_V3`）。
- 渲染层：`ReviewV3LocalCandidateWorkbench.tsx:197`、`ReviewV3TemplateRoutingAssistant.tsx:142`。
- 测试：**无**（见 §9 否定结论）。

出向：`review-c0-authority.ts:21`（sender）、`case-store-v2.ts:51,203`（读聚合/事务）、`native-workspace-case-v3.ts:58`（原生识别）、`template-store.ts:23,253,358,372`（模板 ID 安全/读/候选资格/登记壳）、`review-template-author-store-v3-b1.ts:211,120`（冻结记录/作者修订）、`review-d2-runtime.ts:320`（`verifyD2InstalledPlan`）、`review-v3-main-trust-port.ts:68`（原件字节）。

## 5. 数据 I/O、读写与副作用

- 读：B1 作者库（冻结记录/修订）、模板库、案卷聚合；fallback- 路径还读每个 active 原件字节并重哈希（`:48`）。
- 写：仅两处——`saveAuthoringCandidateDraft`（模板库草稿，`:64`，仅当模板不存在）与 `submitCommand` 的案卷事务（`:122-141`，revision+1、回执 `AttachB1LocalTechnicalPlan` 同事务）。
- 副作用：`ipcMain.handle` 注册 1 通道（`packages/shared/src/types/review.ts:525`）；无网络/窗口/通知。
- 原子性/幂等：案卷写入由 `submitCommand` 的 CAS/幂等保证（`requestId` 每次 `randomUUID()`，重放不命中幂等）；模板壳登记与案卷安装不是同一事务——attach 失败可能留下模板壳（与 `review-v3-main-d4-local-plan.ts` 同模式）。

## 6. 分支、失败、取消与恢复

| 错误 | 触发 | 行 |
| --- | --- | --- |
| `B1_AUTHOR_OR_CASE_REQUIRED` | 入参非法 | 23 |
| `B1_UNBOUND_NATIVE_DRAFT_REQUIRED` | 案卷非未绑定原生草稿 | 28 |
| `B1_FROZEN_TEMPLATE_NOT_FOUND` | 冻结记录缺失 | 30 |
| `B1_AUTHOR_REVISION_MISSING` | 作者修订缺失 | 32 |
| `B1_NUMERIC_VERSION_REQUIRED` | 版本非 ≥1 安全整数 | 34 |
| `B1_FALLBACK_NATIVE_SOURCE_COVERAGE_MISMATCH` | fallback 来源覆盖/形态不符 | 47 |
| `B1_TEMPLATE_VERSION_OCCUPIED` | 模板版本被占用 | 53 |
| `B1_TARGET_NOT_FOUND` | binding 的 targetKey 无目标 | 90 |
| `B1_PLAN_HAS_NO_CHECKS` | 映射为空 | 113 |
| `B1_NATIVE_CASE_CHANGED` | CAS handler 复核失败 | 130 |
| `Error(code+': '+message)` | `submitCommand` 失败透传 | 142 |
| `B1_INSTALLED_PLAN_INCONSISTENT` | 安装后 `verifyD2InstalledPlan` 有问题 | 144 |

- 失败后状态：`:22-113` 段失败零写入；`:64` 之后失败可能留下模板壳；`submitCommand` 失败不写部分案卷数据（`case-store-v2.ts:242-247`）。
- 取消/恢复：无取消/超时；恢复是修数据后重试（案卷须仍是未绑定草稿）。

## 7. 权限与权威状态

- sender 守卫三处：handler 开头 `:21`、提交前 `:121`、CAS handler 内 `:128`（提交点重验）；只证明主窗口主框架。
- actor 固定本地 reviewer（`:15`），不接受渲染层 actor。
- 候选资格来自 `isAuthoringCandidateDraft` 控制记录 + `sourceNote` 前缀双条件（`:50-53`）；`sourceNote` 只作“本入口自己登记的壳”的辅助识别，资格仍以控制记录为准（`template-store.ts:352-360`）。
- 权威状态：计划 `publicationAllowed:false`；`authority` 仅 `request-scope`/`unverified-policy`，后者 `confirmation:'unconfirmed'`（`:93-94,107`）。

## 8. 修改影响面

- 改计划形状（targets/subjects/rules/mapping）影响 `review-d2-runtime.ts:320` 的安装校验与 Pi 侧检查 ID（`pi-case-review-service.ts:374,774`）。
- 改 `sectionId` 公式 `'d2-scope-'+sha(objectKey)`（`:84,103`）与 `review-d2-runtime.ts:29` 同源；两者必须一致。
- 改错误码影响渲染层错误映射（`ReviewV3LocalCandidateWorkbench.tsx:197` 等）。
- 改入参契约影响 preload `attachB1TechnicalPlanV3`（`apps/electron/src/preload/index.ts:4833-4836`）。

## 9. 测试证据

**无直接测试**：冻结树检索 `apps/`+`packages/` 全部 `*.test.ts`/`*.test.tsx` 对模块名 `review-v3-main-b1-local-plan` 与符号 `installC11NativeB1TechnicalPlan` 的 import 均 0 命中（检索方式：`grep -rn "review-v3-main-b1-local-plan\|installC11NativeB1TechnicalPlan"`；范围不含 `docs/`）。因此本文件所有分支（含 fallback 来源覆盖、模板占用、CAS 复核）均无自动化断言。

间接证据：其写入的计划形状受 `review-d2-runtime.test.ts` 中 `verifyD2InstalledPlan` 断言的约束（不在本批）；D4 入口的同模式行为由 `review-v3-main-d4-local-plan.test.ts` 覆盖（不同文件）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：全部。维护者验证方式：建未绑定原生草稿案卷 + 冻结 B1 候选后 invoke `LOCAL_B1_ATTACH_PLAN_V3`，检查返回 checks>0 与 `verifyD2InstalledPlan` 空。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单 handler、单导出 | 已证实 | `:17-18` |
| 未绑定原生草稿前置 | 已证实 | `:24-28` |
| fallback 来源覆盖 + 逐原件验真 | 已证实 | `:38-48` |
| 候选壳先登记、失败不回滚 | 已证实 | `:54-65`（无清理逻辑） |
| 计划固定不可发布 | 已证实 | `:114-115` |
| 三处 sender 校验 | 已证实 | `:21,121,128` |
| 无直接测试 | 已证实（检索范围：冻结树 `apps`/`packages` 测试文件） | 模块名/符号 0 命中 |
| `sourceNote` 与控制记录双条件的交互 | 推断 | `:50-53` 与 `template-store.ts:352-360` |
| 真实 Electron 下通道重复注册行为 | 未知 | 未运行 |
| fallback- 候选在生产的数据来源 | 未知 | 由 B29 流程产生（不在本批），未读其生成端 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 入参/案卷前置 | §3 | 21-28 | covered |
| 冻结记录/版本 | §3 | 29-34 | covered |
| fallback 来源覆盖 | §3 | 38-48 | covered |
| 模板占用/壳登记 | §3 | 50-65 | covered |
| 目标/主体构造 | §3 | 66-86 | covered |
| 规则/映射/authority | §3 | 87-112 | covered |
| 计划定型/指纹 | §3 | 114-120 | covered |
| submitCommand/CAS/校验 | §3 | 121-146 | covered |
| 权限 | §7 | 21,121,128 | covered |
| 测试 | §9 | — | unknown |
