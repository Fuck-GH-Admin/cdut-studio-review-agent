---
path: apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7af5fb6db342f3308257e1adf5232bc1ca5459ea
sha256: 1e04c0f6a240b025b7015ecb4cbab0bc5e85d4a6120df27015d57ebaa2fb8425
lines: 156
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-b3-unmatched-author-bootstrap.ts

## 1. 结论与边界

Dev-B R29：用户确认的 B3「unmatched」路由 → 既有 B1 held 作者编辑器的**候选草稿**（`prepareB29UnmatchedAuthorDraft`，`:57-156`）。文件注释定位（`:2-8`）：**不**新建自治/泛化「校方批准」模板；**不写任何持久化**；保存/冻结走 B1 既有认证流程。调用方必须从既有 Main 派生 scope 取完整 B2 staged 集；本文件不认证任何渲染层声明。

明确不做的事：

- **不写盘**：返回内存快照（`snapshotSha256` 仅供校验）。
- **不合并多主体/冲突申请**（`:53-54` 注释）：材料必须同质单一主体。
- **不建 SourceIdentity**：`locator` 只是 `b2-candidate:` 选择器（`:104-105` 注释）。

## 2. 导出与关键符号

`export` 共 **3 个**（2 interface + 1 函数）。

| 符号 | 行 | 形状要点 | 说明 |
| --- | --- | --- | --- |
| `B29HumanAuthorIntent` | `:22-33` | 9 字段，`userConfirmedAuthoring: true` 字面量 | 人工意图 |
| `B29UnmatchedAuthorDraft` | `:34-51` | 含 `planCondition:'unknown'`、`document`、`descriptor`、`snapshotSha256` | 草稿快照 |
| `prepareB29UnmatchedAuthorDraft` | `:57-156` | `(routing, materialCandidates, intent, historical?) => B29UnmatchedAuthorDraft` | 唯一构建函数 |

内部：`sha64`/`safeId`/`subjectId` 正则（`:17-19`，templateId 须 `[A-Za-z][A-Za-z0-9._-]{0,79}`）、`refuse`（`:20`，抛 `B_R29_*`）、`present`（`:21`）。

## 3. 内部逻辑与关键流程

1. **路由门禁**（`:63-65`）：`routing.status==='unmatched' && chosen===undefined && remainingMs===0 && reason.trim()` 非空，否则 `B_R29_EXPLICIT_UNMATCHED_ROUTE_REQUIRED`。
2. **意图完整性**（`:66-71`）：`userConfirmedAuthoring===true` + `templateId` 匹配 safeId + `name/purpose/scenario/objectKey/humanRequirement/recordedBy/reviewerRole` 全非空，否则 `B_R29_HUMAN_AUTHOR_INTENT_INCOMPLETE`。
3. **历史冲突**（`:72-77`）：若传 `historical`（B26Workbench），schema 必须 `review-v3-b26-source-workbench/1`、`publicationAllowed===false`、且 `templates` 不含同 `templateId`，否则 `B_R29_HISTORICAL_FROZEN_ID_COLLISION`。
4. **材料同质性**（`:78-98`）：数量 1..100（`B_R29_MATERIAL_SET_REQUIRED`）；`owners`/`subjects` 各唯一、`candidateId`/`documentVersionId` 全唯一、**恰 1 个 `application`**，且每项字段全校验（candidateId/caseCandidateId/ownerId/ownerGeneration≥0/documentVersionId/materialId/rawSha256 64hex/byteLength>0/status==='accepted'/role∈{application,supporting}/subjectId 匹配/physicalSourceKey/requestId 非空），任一不符 `B_R29_COMPLETE_HOMOGENEOUS_B2_SET_REQUIRED`。
5. **来源声明**（`:101-108`）：每材料生成 `sourceId=candidate_source_N`、`kind:'user-declared'`、`locator='b2-candidate:'+candidateId`。
6. **文档组装**（`:109-130`）：字段 `human_scope_confirmed`（boolean，required，源=第一来源）；单 target（`target-primary`，subjectId=申请材料主体）；单 module 单 check `unmatched-business-intake`（condition `field-equals human_scope_confirmed=true`，responsibility=reviewerRole）；stages 两段（`human-intake` 手动 + `technical-review`）；output `candidate-preview`；`status:'candidate-held'`。
7. **编译校验**（`:131-136`）：`compileReviewB1Plan(doc)` 后必须 `publicationAllowed===false`、恰好 1 个 binding、`applicability==='unknown'`、`sourceIds.length===materials.length`，否则 `B_R29_NOT_AN_UNCERTAIN_CANDIDATE`。
8. **快照**（`:137-155`）：`sourceCandidates` 记录 4 元组；三个只读标志（`rawMaterialsRevalidatedByB:false`、`currentMainAuthorityRecheckedByC:false`、`requiresMainPickerAndRoleRecheck:true`）+ 5 个 candidate 标志；`snapshotSha256 = sha256(JSON.stringify(payload))`。

## 4. 调用者与调用链

- **生产调用者**：`review-v3-main-local-product-intake.ts`（import + 2 处调用）——即 `LOCAL_PRODUCT_UNMATCHED_V3`（B29 兜底初稿）IPC 链；渲染层经 `prepareLocalNativeUnmatchedV3`（preload）进入。
- **测试**：无直接测试（全冻结树检索 `prepareB29UnmatchedAuthorDraft` 测试命中 0）。
- **出向**：`compileReviewB1Plan`/`ImmutablePlanDescriptorB1`/`B1AuthorDocument`（`review-template-plan-adapter-v3-b1`）、`B2MaterialCandidate`（`review-intake-adapter-v3-b2`）、`B3RouteState`（`review-intake-routing-adapter-v3-b3`）、`B26Workbench`（`review-v3-b4-bulk-evidence-workbench`）。

## 5. 数据 I/O、读写与副作用

- **纯内存**：无文件/网络/定时器；唯一"副作用"是 `compileReviewB1Plan` 的纯计算。
- 输出 `snapshotSha256` 为无键摘要（校验用，非签名）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 错误 |
| --- | --- | --- |
| 路由非显式 unmatched | `:63-65` | `B_R29_EXPLICIT_UNMATCHED_ROUTE_REQUIRED` |
| 意图不完整 | `:66-71` | `B_R29_HUMAN_AUTHOR_INTENT_INCOMPLETE` |
| 历史冻结 ID 冲突 | `:72-77` | `B_R29_HISTORICAL_FROZEN_ID_COLLISION` |
| 材料集非法/异质 | `:78-98` | `B_R29_MATERIAL_SET_REQUIRED` / `B_R29_COMPLETE_HOMOGENEOUS_B2_SET_REQUIRED` |
| 编译结果不是不确定候选 | `:131-136` | `B_R29_NOT_AN_UNCERTAIN_CANDIDATE` |
| 缺 application（防御） | `:99-100` | `B_R29_MISSING_APPLICATION` |

全部同步抛错、无部分输出、无取消。

## 7. 权限与权威状态

- 不认证调用方（`:6-8` 注释）；`intent.recordedBy/reviewerRole` 是**声明**而非验证身份。
- 输出恒带 candidateOnly/禁止发布/禁止业务写/无校方政策 5 标志 + `planCondition:'unknown'`。
- 权威状态由 B1 保存/冻结流程与 C Main 后续校验建立（`requiresMainPickerAndRoleRecheck:true`）。

## 8. 修改影响面

- `review-v3-main-local-product-intake.ts` 的 `prepareLocalNativeUnmatchedV3` 链依赖其输出形状（`document`/`descriptor`/`sourceCandidates`）；渲染层 `ReviewV3TemplateRoutingAssistant.attachFallback` 用 `prepareLocalNativeUnmatchedV3` 回执走 B1 保存/冻结/装载。
- `human_scope_confirmed` 字段与 `field-equals` 条件是渲染层确认勾选的落点（草稿后需人工填 true）。
- 同质性约束（单 application、单主体）收紧/放宽会影响 `executableFallbackAuthor` 的来源一一对应校验（`review-v3-fallback-executable-plan.ts:46-52`）。
- 无存储格式迁移（不落盘）。

## 9. 测试证据

- **无直接测试**（已证实，全冻结树检索命中 0）。
- 间接：渲染层 `ReviewV3TemplateRoutingAssistant.tsx` 手册（nb-02 批）记录了 `attachFallback` 四步链对本模块回执的使用；`review-v3-main-local-product-intake.test.ts`（若存在）覆盖 IPC 层——本批未逐行读（见第 10 节未知）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出 | 已证实 | `:22`、`:34`、`:57` |
| 五段门禁与错误码 | 已证实 | `:63-98`、`:131-136` |
| 恰 1 个 application、单主体、单 target/check | 已证实 | `:86-87`、`:116-125` |
| `planCondition:'unknown'` 与 applicability unknown | 已证实 | `:47`、`:134` |
| 生产调用者为 product-intake IPC 链 | 已证实 | `review-v3-main-local-product-intake.ts` 2 处 |
| 无直接测试 | 已证实 | 全冻结树检索 |
| product-intake 层的 handler 校验细节 | 未知 | 未逐行读（该文件属 nb-01 批） |
| 测试实际通过 | 未知 | 无测试可跑 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 个导出 | 2 | — | covered |
| 五段门禁 | 3 | `:63-136` | covered |
| 文档组装细节 | 3 | `:101-130` | covered |
| 失败分支 | 6 | — | covered |
| 调用链 | 4 | — | covered |
| 权限边界 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无测试） |
