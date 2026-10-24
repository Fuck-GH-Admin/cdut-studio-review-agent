---
path: apps/electron/src/main/lib/review/native-workspace-case-v3.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b670ce4ad0f078af9a5dd9eceed65512e1567052
sha256: 4a9f2d2fb1bd283d20bdc66ce3c08fbc02bc3d9f1db6fec02ce3ab441d0a99c2
lines: 670
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/native-workspace-case-v3.ts

## 1. 结论与边界

原生（native-first）案卷的创建、草稿设置、材料登记/归档/排序、申报事项更正与人工建项，以及**只读 V1 兼容投影**。权威状态只有一个：`case-store-v2` 的 `state.v2.json` 聚合（`review-cases/{caseId}/state.v2.json`）；本文件所有写入都经 `createAggregate`/`submitCommand` 的幂等回执 + `expectedRevision` CAS 事务落盘，**不创建 `case.json`/`case.v2.json` 影子**（文件头 `:1-5`；测试 `native-workspace-case-v3.test.ts:30-31` 实证）。运行时模块，含磁盘事务、模板解析与投影形状转换。

不做的事：不实现聚合存储/幂等/冲突语义（`case-store-v2.ts`）；不实现物理材料字节入库（`material-service.registerMaterial`）；不实现来源撤效算法（`source-current-validity-v3.revokeCurrentSourceValidity`）；不实现 V1 `case.json` 读写（`case-store` 只在 `getCase`/`listCases` 里调本文件投影做只读兼容，`case-store.ts:150`、`:187`）；不发布官方政策/正式 Plan；不做学校身份认证（actor 只接受 `local/reviewer`，`:240-241`）。

## 2. 导出与关键符号

导出 13 项：1 const、10 function、2 type/interface（1 type + 1 interface）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `NATIVE_CREATE_RECEIPT_V3` | const | `:19` | `'CreateNativeWorkspaceCaseV3'` | 建案回执类型，`isNativeWorkspaceCaseV3` 的判别依据 |
| `NativeCreateWorkspaceInputV3` | type | `:29-43` | `{title; type; applicant; academicYear?; domainPackId?; reviewTemplate?}` | 建案入参 |
| `domainRequiresAcademicYear` | function | `:54-56` | `(domain?: string) => boolean` | 仅 `comprehensive-assessment` 需学年 |
| `isNativeWorkspaceCaseV3` | function | `:58-88` | `(aggregate?) => boolean` | 结构守卫：首回执必须是原生建案 |
| `nativeWorkspaceProjectionV3` | function | `:90-210` | `(aggregate?) => ReviewCase \| undefined` | 只读 V1 兼容投影 |
| `createNativeWorkspaceCaseV3` | function | `:231-277` | `(input, actor?, authorizeAtCommit?) => Promise<{aggregate; view}>` | 原生建案 |
| `updateNativeWorkspaceSettingsV3` | function | `:280-388` | `(caseId, input, actor?, authorizeAtCommit?) => Promise<ReviewCase>` | 草稿设置（标题/类型/领域/手写规则/主体范围/模板） |
| `NativeMaterialRegistrationOptions` | interface | `:390-398` | `{fileName?; replacesVersionIds?}` | 材料登记选项 |
| `registerNativeWorkspaceMaterialV3` | function | `:401-434` | `(caseId, sourcePath, role, actor?, authorizeAtCommit?, materialSlotId?, options?) => Promise<SourceDocument>` | 材料登记（透传槽位） |
| `removeNativeWorkspaceDocumentsV3` | function | `:436-472` | `(caseId, role, documentIds?, actor?, authorizeAtCommit?) => Promise<ReviewCase>` | 批量归档 |
| `reorderNativeWorkspaceDocumentsV3` | function | `:474-506` | `(caseId, role, documentIds, actor?, authorizeAtCommit?) => Promise<ReviewCase>` | 显示排序 |
| `updateNativeWorkspaceReviewItemV3` | function | `:509-574` | `(caseId, input, actor?, authorizeAtCommit?) => Promise<ReviewCase>` | 更正既有事项 |
| `createNativeReviewItemV3` | function | `:581-670` | `(input, actor?, authorizeAtCommit?) => Promise<ReviewCase>` | 人工建项（带来源） |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `PENDING_TEMPLATE` | `:20` | `'pending-template-v3'`，未绑定模板的占位 templateId |
| `MAIN_ACTOR` | `:21` | 缺省 actor：`local-reviewer / local / reviewer` |
| `TYPES` | `:22` | 合法案卷类型：`综合测评/活动申请/自定义审核` |
| `txt` / `value` | `:23-27` | text 字段构造/读取（只取 `kind==='text'`） |
| `ACADEMIC_YEAR_DOMAINS` | `:51` | `{comprehensive-assessment}` |
| `resolvedTemplate` | `:212-228` | 模板解析：显式校验 + 发布状态门 |
| `asDocument`（投影内） | `:107-130` | `DocumentVersion → SourceDocument` 形状转换 |
| items 投影（`flatMap`） | `:132-177` | subject → `ReviewItem`，含锚点精度推导 |

## 3. 内部逻辑与关键流程

### 3.1 结构守卫 `isNativeWorkspaceCaseV3`（`:58-88`）

- `receiptLog[0].type === NATIVE_CREATE_RECEIPT_V3` 且 `revision === 0` 才算原生案卷（`:60-62`）；否则整份判 false。
- `caseV2` 逐层结构校验：`id/title` 非空串、`documents/subjects` 是数组、`caseFields` 是对象非数组（`:63-66`）。
- 每个 document 要求 `documentId/versionId/fileName` 为字符串、`role ∈ {rule,application,evidence,attachment}`、`blocks` 数组且每块有 `blockId/text`（`:67-71`）。
- 每个 subject 要求 `id/title`、`fields` 对象、`sourceRefs` 数组且每条有 `caseId/documentVersionId`、`parseRevision` 安全整数、`location.kind` 字符串（`:72-78`）。
- `nativeWorkspaceDraft` 可缺省（true）；存在时要求 `manualRules` 数组（每条 `id/title/requirement` 字符串），`subjectDocumentVersionIds` 缺省或字符串数组（`:79-87`）。
- **畸形 draft 会整份判 false**：测试把 `manualRules` 写成字符串后 `getCase` 返回 undefined、`updateNativeWorkspaceSettingsV3` 抛“不是原生工作台案卷”，聚合字节不变（`native-workspace-case-v3.test.ts:181-195`）。

### 3.2 只读投影 `nativeWorkspaceProjectionV3`（`:90-210`）

1. 非原生或 `archived` 阶段、`revision` 非安全整数、`documents/subjects` 非数组 → `undefined`（`:91-95`）。
2. 从 `caseFields` 读 `legacyReviewType/applicant/academicYear/legacyDomainPackId`（`:96-100`）；`academicYear` 缺省降级 `''` 而不是整体失效（`:98-99`）。
3. `type ∉ TYPES`、`applicant === undefined`、缺 `domainPackId`、缺 `state.id` → `undefined`（`:101-102`）。
4. **attachment 角色不进 V1 三栏**：`current`/`archived` 都过滤 `role !== 'attachment'`（`:103-106`）；attachment 仍留在 V2 账本。
5. `asDocument`（`:107-130`）：`parseStatus==='pending'` 降级 `'partial'`（`:113`）；block.kind 形状映射（`image→image`、`table→table-cell`、`format==='heading'→heading`、`list-item→list-item`、其余 `paragraph`，`:118-119`）；`page` 取 `pdf-rect` 的 page 否则 1（`:120`）；`importedAt` 从 `receiptLog` 里 `RegisterMaterial` 且 `summary` 含该 `versionId` 的回执时间取，取不到回退 `state.createdAt`（`:128-129`）。
6. items（`:132-177`）：仅 `subject.type==='item'` 且 `declaredScore` 为 number、`category` 为非空 text 才投影；否则返回 `[]`（`flatMap` 丢弃，`:138-139`）。`sourceRefs` 必须有 `caseId===state.id` 且 `documentVersionId/parseRevision` 与某 active document 精确一致，否则丢弃（`:140-142`）。锚点：`nativeSourceBlockId` 优先按 blockId 找块；否则按 `paragraph` location 的 index 找块；都没有则 `precision` 取 `page`（pdf-rect）或 `document`（`:147-163`）。`identifiedBy` 由 `correction==='user-confirmed'` 决定 `manual`/`ai`（`:175`）。
7. `subjectDocumentIds` 由 `nativeWorkspaceDraft.subjectDocumentVersionIds` 映射回当前 active 的 application 文档 `documentId`（`:180-184`）——版本钉选，旧 documentId 不会自动选中新版本。
8. `rulePacks` 由 `role==='rule'` 文档合成（`:185-194`），`confirmed:false` 恒定。
9. `hasBoundTemplate = templateId !== PENDING_TEMPLATE && templateVersion > 0` 才带 `reviewTemplate`（`:195`、`:205`）；`manualRules`/`subjectDocumentIds` 仅在 draft 有值时输出（`:206-207`）。

### 3.3 模板解析 `resolvedTemplate`（`:212-228`）

1. 先 `ensureBuiltinTemplateDrafts`（`:213`）。
2. 显式模板：`templateId` 非空、`version` 安全整数 ≥1，否则 `VALIDATION_FAILED('审核模板版本非法')`（`:215-216`）；`getTemplate` 取不到或 `status !== 'published'` → `VALIDATION_FAILED('只能选择已发布模板…')`（`:217-219`）。
3. 缺省模板：`mapDomainToTemplate(domain).templateId` 有映射才 `getTemplate(mapped)`，且仅 `status==='published'` 才返回（`:222-227`）；自定义/未映射领域保持未绑定（`templateId=PENDING_TEMPLATE`），不静默套综测政策。

### 3.4 建案 `createNativeWorkspaceCaseV3`（`:231-277`）

1. 入参校验：`type ∈ TYPES`、`title` 非空串、`applicant` 非空、`academicYear/domainPackId` 类型正确（`:233-238`）；缺标题/类型/申请人 → `VALIDATION_FAILED`。
2. actor 必须 `local + reviewer`（`:240-241`）；未知领域包 → `VALIDATION_FAILED('未知审核领域不能静默回退综测并创建正式业务案卷')`（`:242-243`）。
3. `domain = resolveDomainPack(input.domainPackId).id`；学年按领域判定（`comprehensive-assessment` 必填，`:247-249`），缺省**不编造**学年。
4. `reviewTemplate === null` 表示显式不绑定；否则走 `resolvedTemplate`（`:250`）。
5. `caseId = case-${randomUUID 无连字符}`（`:251`）；`stage:'draft'`、`revision:0`、`caseFields` 含 applicant/（有则）academicYear/legacyReviewType/legacyDomainPackId（`:253-263`）。
6. 回执 `requestId=native-create-${caseId}`、`payloadHash=payloadHash(type,{title,type,applicant,academicYear,domainPackId,templateId,templateVersion})`、`revision:0`、summary 明示“未发布任何校方政策或正式 Plan”（`:264-271`）。
7. `await createAggregate(caseId, state, receipt, authorizeAtCommit)`（`:272`）；随后 `readAggregate` 重读并投影；投影失败抛“原生案卷已建立但兼容视图未能生成”（`:273-275`）——此时聚合已落盘，异常不回滚。

### 3.5 草稿设置 `updateNativeWorkspaceSettingsV3`（`:280-388`）

- 前置：必须是原生案卷（否则 `NOT_FOUND`）；`canonicalPlan || d2RuntimePlan` 已绑定 → `INVALID_TRANSITION('正式 Plan 已绑定…')`（`:285-288`）。
- `manualRules`：≤100 条（`:292-293`）；id 匹配 `^[a-zA-Z0-9_-]{1,100}$` 且去重、title ≤160、requirement ≤8000（`:296-300`）。
- `subjectDocumentIds`：字符串数组且去重（`:307-310`）；逐个映射 documentId → 当前 `role==='application' && active!==false` 文档的 `versionId`，失败 `STALE_INPUT('待审主体材料不存在、已换版或角色不合法')`（`:313-318`）。**这是草稿范围，不是 CanonicalPlan 源授权**（`:311-312` 注释）。
- title/type/domainPackId 逐项校验（`:320-327`）；领域解析优先入参、其次案卷现值（`:328`）；切到需学年领域而案卷无学年 → `VALIDATION_FAILED('请先为案卷填写适用学年…')`（`:329-334`）。
- 模板：`reviewTemplate` 与 `domainPackId` 都未变时不动；否则 `resolvedTemplate(domain, reviewTemplate)`（`:335-336`）。
- `submitCommand` 的 handler（`:348-383`）：`authorizeAtCommit?.()` 先行；快照必须仍为原生、无 Plan、`stage==='draft'`；改规则/主体范围时若有 `observations.confirmed` 或 `evidenceLinks.status==='confirmed'` → `DEPENDENCY_UNRESOLVED('存在已确认事实或证据…')`；主体版本必须在提交前仍有效，否则 `STALE_INPUT('材料在提交前已换版或归档…')`（`:355-362`）。
- mutate（`:363-382`）：title/type/domainPackId 按入参覆盖；`nativeWorkspaceDraft` 整体重建（`manualRules` 取新值或保留旧值；`subjectDocumentVersionIds` 取新值或保留旧值拷贝）；模板变化时写 `templateId/templateVersion/objectType`（`PENDING_TEMPLATE/0/'document'` 为缺省，`:377-381`）。
- 结束：`!output.ok` 抛 `CommandValidationError`；投影失败抛“原生设置已保存但兼容读取失败”（`:384-387`）。

### 3.6 材料登记 `registerNativeWorkspaceMaterialV3`（`:401-434`）

1. 前置：原生案卷且非 `archived`，否则 `INVALID_TRANSITION('案卷不存在、已归档或不是原生 V2 案卷')`（`:415-416`）。
2. `authorizeAtCommit?.()`（`:417`）在调用 `registerMaterial` **之前**执行一次，并把同一闭包再传给 `registerMaterial`（`:427`）——该回调在一次登记里可被调用两次（独立断言 + 聚合提交时）。
3. payload 透传 `sourcePath/role/materialSlotId/fileName/replacesVersionIds`（`:421-426`）；`materialSlotId` 的透传注释明确此前缺失导致“带必需槽模板永远无法提交”（`:404-410`）。
4. `registerMaterial` 失败 → `CommandValidationError`；成功后从投影里按 `documentId` 找回文档，找不到抛“原生材料已写入但只读兼容投影失败”（`:428-432`）。

### 3.7 归档 `removeNativeWorkspaceDocumentsV3`（`:436-472`）

1. `documentIds` 校验：字符串数组、去重（`:440-443`）。
2. 命令 `ArchiveNativeWorkspaceDocumentsV3`；handler（`:452-466`）：`applicable` = active 且 role 匹配、且（`documentIds===null` 或包含）；`applicable` 为空或指定列表数量不匹配 → `VALIDATION_FAILED('材料不存在、版本已失效或角色不匹配')`（`:456-460`）。
3. mutate：命中的版本 `active:false`、`usage:'unread'`（保留物理原件与历史来源），并 `revokeCurrentSourceValidity(draft, retiring, 'archive')`（`:462-465`）。
4. 投影失败抛“归档已写入，兼容视图未能恢复”（`:469-470`）。

### 3.8 排序 `reorderNativeWorkspaceDocumentsV3`（`:474-506`）

- `documentIds` 必须覆盖该角色**全部** active 文档且数量相等，否则 `VALIDATION_FAILED('顺序必须覆盖当前角色的所有有效材料')`（`:490-493`）。
- mutate 按 desired 顺序重排该角色 active 文档，其他文档原位不动（`:496-500`）；不改任何物理身份。

### 3.9 事项更正 `updateNativeWorkspaceReviewItemV3`（`:509-574`）

1. 字段校验：`input.caseId === caseId`、title ≤160、category ≤80、`declaredScore` 有限数 ∈ [0, 1_000_000]、level ≤100、activityDate ≤80、organizer ≤200（`:513-525`）。
2. handler（`:540-568`）：原生 + 无 Plan + `stage==='draft'`，否则 `INVALID_TRANSITION('正式计划已冻结或案卷不在可编辑草稿阶段')`；该事项存在 `observations.confirmed` → `DEPENDENCY_UNRESOLVED('该事项有已确认事实，需要显式撤销后再修正')`；subject 必须存在且 `type==='item'`，否则 `NOT_FOUND`（`:545-549`）。
3. **投影复核**：`nativeWorkspaceProjectionV3(snapshot)` 的 items 必须含该 id，否则 `STALE_INPUT('申报事项未绑定当前可追溯原件，不能凭空修正')`（`:550-552`）——即未通过 §3.2 items 的来源/锚点门槛的事项不可更正（测试 `:169-178` 篡改 `sourceRefs.caseId` 后实证）。
4. mutate（`:554-567`）：覆盖 title/category/declaredScore；level/activityDate/organizer 有值写入、空值删除字段；`correction='user-confirmed'`、`status='confirmed'`。

### 3.10 人工建项 `createNativeReviewItemV3`（`:581-670`）

1. 校验（`:586-606`）：`requestId` 匹配 `^[a-zA-Z0-9:_-]{8,100}$`、`expectedRevision` 安全整数 ≥0、`documentVersionId` 非空、`sourceBlockId` 可选非空串、title/category/declaredScore 限值同 §3.9；actor 必须 `local + reviewer`。
2. `subjectId = manual-${sha256(JSON.stringify([caseId,requestId])).slice(0,24)}`（`:610-611`）——丢回复后同 requestId 重试得到同一 id；requestId 只有幂等/碰撞意义（`:608-609` 注释）。
3. handler（`:624-661`）：原生 + `stage==='draft'` + 无 Plan；源文档必须 `role==='application' && active!==false` 且 `parseRevision` 安全整数 ≥0，否则 `STALE_INPUT('只有本案当前有效、角色为申报材料的真实版本可以建立事项')`（`:629-633`）；`sourceBlockId` 给定但块不存在 → `STALE_INPUT('解析块不属于当前原件版本，拒绝凭空创建定位')`（`:634-637`）；同 subjectId 已存在 → `REQUEST_ID_COLLISION('人工事项 ID 已被占用')`（`:638-639`，防御性；同 requestId 重放已被 `case-store-v2` 幂等短路）。
4. mutate（`:642-659`）：push subject：`fields` 含 title/category/declaredScore/(可选)nativeSourceBlockId/level/activityDate/organizer；`sourceRefs` 一条 `caseId=输入 caseId、documentVersionId=source.versionId、parseRevision=source.parseRevision、location=block?.location ?? {kind:'file'}`；`correction='user-confirmed'`、`status='identified'`。
5. 成功后投影复核：items 必须含该 subjectId，否则抛“持久回执与事项内容不一致”（`:667-668`）；`sourceBlockId` 为空时 location 为 `{kind:'file'}`，UI 锚点 `precision:'document'`、无 `blockId`（测试 `:275-295`）；块无几何 location 时仍保留 `nativeSourceBlockId` 而不编造段落/页码（`:144-148` 注释；测试 `:297-323`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}` 与 `packages/**/*.ts`（排除测试与 `docs/`）。

### 4.1 入向

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC 注册 | `apps/electron/src/main/lib/review/review-ipc.ts:59-61`（import）；`:177` `createNativeWorkspaceCaseV3`；`:205` `updateNativeWorkspaceSettingsV3`；`:342` `updateNativeWorkspaceReviewItemV3`；`:381` `createNativeReviewItemV3`；`:414`/`:451`/`:1300` `registerNativeWorkspaceMaterialV3`；`:520` `removeNativeWorkspaceDocumentsV3`；`:542` `reorderNativeWorkspaceDocumentsV3` | 各 handler 以 `isNativeWorkspaceCaseV3` 分流（`:203/:306/:340/:388/:402/:449/:518/:540/:622/:1297/:1426/:1437/:1454/:1489`）；`authorizeAtCommit` 按实际消费者分列：`:414`（系统选择框导入）与 `:1295-1302`（本地产品入库）传 `() => assertC0ReviewMainSender(_event/_e)`（提交时复核）；`:451`（IMPORT_DOCUMENT_FROM_PATH）**未传** `authorizeAtCommit`，仅 `:450`/`:452` 调用前后各断言一次（开发版直导，`:444` `app.isPackaged` 拒绝） |
| V1 兼容读取 | `apps/electron/src/main/lib/review/case-store.ts:19`（import）、`:150`、`:187` | `nativeWorkspaceProjectionV3`（`getCase`/`listCases` 只读投影） |
| T06 材料归档流 | `apps/electron/src/main/lib/review/review-v3-t06-main-service.ts:30`、`:445-447` | `isNativeWorkspaceCaseV3` + `registerNativeWorkspaceMaterialV3` |
| T09 资产登记 | `apps/electron/src/main/lib/review/review-v3-t09-asset-registration.ts:14`、`:51-52` | 同上 |
| D4 计划 | `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts:12`、`:89` | `isNativeWorkspaceCaseV3` |
| B1 计划 | `apps/electron/src/main/lib/review/review-v3-main-b1-local-plan.ts:7`、`:25`、`:129` | 同上 |
| 本地产品入库 | `apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:17`、`:66`、`:312` | `isNativeWorkspaceCaseV3` + `updateNativeWorkspaceSettingsV3` |

### 4.2 出向

`case-store-v2`（`createAggregate/payloadHash/readAggregate/submitCommand/CommandValidationError`，`:11`）、`migration.mapDomainToTemplate`（`:12`）、`builtin-templates.ensureBuiltinTemplateDrafts`（`:13`）、`template-store.getTemplate/saveDraft`（`:14`）、`material-service.registerMaterial`（`:15`）、`source-current-validity-v3.revokeCurrentSourceValidity`（`:16`）、`@profer/shared` 的 `isKnownDomainPack/resolveDomainPack` 与类型（`:7-17`）。

### 4.3 链路

```
renderer → preload → review-ipc handler（isNativeWorkspaceCaseV3 分流 + assertC0ReviewMainSender）
  → 本文件 create/update/register/remove/reorder/item 函数
  → case-store-v2 createAggregate/submitCommand（state.v2.json，幂等 + expectedRevision CAS）
  → mutation 内 revokeCurrentSourceValidity / registerMaterial
  → nativeWorkspaceProjectionV3 → ReviewCase 兼容形状 → UI / case-store.getCase
```

## 5. 数据 I/O、读写与副作用

- **权威状态**：`review-cases/{caseId}/state.v2.json`（`case-store-v2.ts:33`；原子替换 + `.previous.json` 备份，`case-store-v2.ts:5`、`:37`）。本文件不直接触盘，全部经聚合事务。
- **回执**：`CreateNativeWorkspaceCaseV3`（建案）、`UpdateNativeWorkspaceSettingsV3`、`ArchiveNativeWorkspaceDocumentsV3`、`ReorderNativeWorkspaceDocumentsV3`、`CorrectNativeWorkspaceReviewItemV3`、`CreateNativeReviewItemV3` + `registerMaterial` 的 `RegisterMaterial` 回执（测试 `native-workspace-case-v3.test.ts:107-109`、`:228`）。
- **CAS/幂等**：写命令统一带 `expectedRevision`（如 `:340`、`:449`、`:533`）；同 requestId 同载荷重放返回原回执不重复写（`case-store-v2.ts:221-228` 语义；测试 `:237-240` 重放后 revision/回执数不变）；同 requestId 异载荷 → `REQUEST_ID_COLLISION`（“已被不同载荷使用”，`case-store-v2.ts:228`；测试 `:242-243`）；revision 不符 → `VERSION_CONFLICT`（“案卷已被其他操作更新”，`case-store-v2.ts:233`；测试 `:254-256`）。
- **副作用**：`registerNativeWorkspaceMaterialV3` 经 `registerMaterial` 写物理材料字节与 `RegisterMaterial` 回执；归档触发 `sourceValidityRevocations`（测试 `:72-73`）；建案/设置/建项只写聚合。无网络、无窗口操作、无日志打印。
- **只读投影**：`nativeWorkspaceProjectionV3` 纯内存形状转换，不落盘；`importedAt` 依赖 `receiptLog` 中 `RegisterMaterial.summary` 包含 `versionId` 的启发式匹配（`:128-129`）。
- **并发**：写之间靠 `expectedRevision` 串行化；读（投影）不加锁，可能读到提交前快照。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 入参/actor/领域非法 | `:233-243` | `VALIDATION_FAILED`，无写入 |
| 需学年领域缺学年 | `:247-249`、`:331-334` | `VALIDATION_FAILED` |
| 显式模板非发布/版本非法 | `:215-219` | `VALIDATION_FAILED` |
| 建案后投影失败 | `:275` | 抛 Error；**聚合已落盘不回滚** |
| 非原生案卷调设置/建项 | `:285-286`、`:528-529` | `NOT_FOUND` |
| Plan 已绑定 | `:287-288`、`:542-544`、`:626-628` | `INVALID_TRANSITION` |
| 规则/主体变更遇已确认事实 | `:355-358` | `DEPENDENCY_UNRESOLVED` |
| 主体版本换版/归档 | `:359-362`、`:313-318` | `STALE_INPUT` |
| 材料归档清单不匹配 | `:458-460` | `VALIDATION_FAILED` |
| 排序未覆盖全角色 | `:491-493` | `VALIDATION_FAILED` |
| 事项无当前可追溯原件 | `:550-552` | `STALE_INPUT` |
| 建项伪造块/跨案版本 | `:629-637` | `STALE_INPUT` |
| requestId 碰撞（异载荷） | `case-store-v2.ts:228` | `REQUEST_ID_COLLISION` |
| revision 过期 | `case-store-v2.ts:233` | `VERSION_CONFLICT` |
| `authorizeAtCommit` 抛错 | 各调用点 | 事务不提交，聚合字节不变（测试 `:39-45`、`:47-75`、`:163-168`、`:257-262` 实证） |
| 取消 | 无 | 无 AbortSignal；已进入事务的命令不可撤回 |
| 重启恢复 | 无内存态 | 依赖 `state.v2.json` + `.previous.json`（`case-store-v2` 自愈），本文件无恢复逻辑 |

## 7. 权限与权威状态

- **actor 门**：建案与人工建项显式要求 `actor.actorSource==='local' && role==='reviewer'`（`:240-241`、`:605-606`），默认 `MAIN_ACTOR`（`:21`）。设置/材料/归档/排序/更正函数**不校验 actor 字段**，由调用链约束：IPC 路径的 actor 统一为 `undefined`（默认 MAIN_ACTOR）；`authorizeAtCommit` 按实际消费者分列（review-ipc.ts）：`:414`（系统选择框导入）与 `:1295-1302`（本地产品入库）传 `() => assertC0ReviewMainSender(_event/_e)` 作提交时复核；`:451`（IMPORT_DOCUMENT_FROM_PATH）**未传** `authorizeAtCommit`，仅 `:450`/`:452` 调用前后断言（开发版直导，`:444` `app.isPackaged` 拒绝）；测试用注入闭包模拟 Main 撤销。
- **权威状态**：`state.v2.json` 聚合是唯一写入口径；`case.json` 影子被 `case-store.saveCase` 拒写（“原生审核案卷禁止”，`case-store.ts` 守卫，测试 `:34-35` 实证）。投影只是只读兼容形状。
- **政策边界**：`resolvedTemplate` 只接受 `published` 模板；未映射/自定义领域不安装官方 Plan（`templateId` 停留 `pending-template-v3`，测试 `:77-86`）；回执 summary 明示“未发布任何校方政策或正式 Plan”（`:270`）。
- **学年权威**：仅 `comprehensive-assessment` 领域强制学年（`:51-56`）；缺省不编造（`NativeCreateWorkspaceInputV3` 注释 `:33-39`）。

## 8. 修改影响面

- 改投影形状 → 影响 `case-store.getCase/listCases`（`case-store.ts:150/:187`）、IPC 返回给 UI 的 `ReviewCase`、以及依赖 items 锚点的更正门（`:550-552`）。
- 改 `isNativeWorkspaceCaseV3` 的结构校验 → 所有 `review-ipc` 分流点（`:203/:306/:340/:388/:402/:449/:518/:540/:622/:1297/:1426/:1437/:1454/:1489`）与 `t06/t09/d4/b1/intake` 的守卫同步受影响。
- 改命令 type/回执 → `case-store-v2` 幂等键、审计回执链（测试断言 `receiptLog` 序列 `:107-109`）。
- 改材料/归档语义 → `material-service`、`source-current-validity-v3`、`run-store` 的来源有效性判定。
- 需同步的测试：`native-workspace-case-v3.test.ts`（11 例）、`native-case-academic-year.test.ts`（6 例）、`native-case-material-slot.test.ts`（1 例）；`workspace-service-v2.test.ts:222-247` 也依赖 `saveCase` 禁写守卫与投影。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建、Electron/GUI。以下为静态读到的真实断言。

**直接测试**：`native-workspace-case-v3.test.ts`（1 个 describe、**11 个 test**）+ `native-case-academic-year.test.ts`（2 describe、6 test）+ `native-case-material-slot.test.ts`（1 test）。夹具：`PROFER_CONFIG_DIR` 指向临时目录（`native-workspace-case-v3.test.ts:12-15` 用仓库 `work/tmp` 下随机目录，两小文件用 `mkdtempSync`）。

关键断言（`native-workspace-case-v3.test.ts`）：

1. `:22-37` 建案只写 V2 聚合+回执：`receiptLog==['CreateNativeWorkspaceCaseV3']`、`stage==='draft'`、`getCase` 可读、**`case.json`/`case.v2.json` 不存在**、`saveCase` 覆写抛“原生审核案卷禁止”、聚合字节不变。
2. `:39-45` 建案提交前 Main 撤销（注入闭包抛错）→ 拒绝且 `listAggregatesV2` 不变。
3. `:47-75` 设置/材料/归档在 CAS 提交点撤销 → 拒绝且聚合字节不变；成功登记后 `getCase` 可见；归档后 `documents` 空、`sourceValidityRevocations` 含该版本、`case.json` 仍不存在。
4. `:77-86` 自定义领域建案 → `templateId==='pending-template-v3'`、`templateVersion===0`、无 `canonicalPlan`、view 无 `reviewTemplate`。
5. `:87-128` 手写规则/主体文档钉选持久化：`nativeWorkspaceDraft` 存储、`reviewRules` undefined、无 canonicalPlan、回执序列 `Create/Register/Update`；重复 subjectIds 抛“重复”、重复规则 id 抛“无效”、跨案文档抛“待审主体材料”；`revision===2`；归档后 `subjectDocumentIds` 投影为空但 draft 的版本钉选不变。
6. `:130-179` 注入合成 subject 后更正：`status:'confirmed'`、`identifiedBy:'manual'`、`declaredScore` 存为 number；回执 `CorrectNativeWorkspaceReviewItemV3`；撤销提交不落盘；篡改 `sourceRefs.caseId` 后更正抛“未绑定当前可追溯原件”。
7. `:181-195` 畸形 draft 隔离：`getCase` undefined、聚合字节不变、设置抛“不是原生工作台案卷”。
8. `:196-201` 未知领域建案抛“未知审核领域”且不建案。
9. `:203-273` 人工建项：锚点 `{documentId, blockId, precision:'block'}`、`sourceRefs` 与块 location 一致、`identifiedBy:'manual'`、`status:'identified'`、无 observations/decisions；同 requestId 重放幂等（revision/回执数不变）；异载荷抛“已被不同载荷使用”；跨案版本抛“本案当前有效”；伪造块抛“解析块不属于”；过期 revision 抛“案卷已被其他操作更新”；Main 撤销不落盘；归档源后建项抛“本案当前有效”、`getCase.items` 为空。
10. `:275-295` 无块的人工声明 → `anchor.precision:'document'`、无 `blockId`、`location=={kind:'file'}`。
11. `:297-323` 块无几何时仍保留 `nativeSourceBlockId`、`location=={kind:'file'}`、无 decisions。

`native-case-academic-year.test.ts`（6 例）：`domainRequiresAcademicYear` 三态（`:24-28`）；非综测省学年 → `caseFields.academicYear` undefined、投影 `academicYear===''`（`:30-40`）；综测缺学年抛“必须填写适用学年”（`:42-47`）；带学年建案后重读投影 `'2026'`（`:49-57`）；无学年切综测抛“请先为案卷填写适用学年”（`:61-70`）；有学年切综测成功（`:72-83`）。

`native-case-material-slot.test.ts`（1 例）：带必需槽模板——不传 `materialSlotId` 登记后 `submitCaseV2` 抛“缺少必需材料”，传 `'plan'` 登记后 `documents` 含 `materialSlotId==='plan'` 且 `submitCaseV2` 成功（`:20-50`）。

**未覆盖**：`reorderNativeWorkspaceDocumentsV3` 无直接测试（冻结树检索仅 `review-ipc.ts:542` 调用）；`NativeMaterialRegistrationOptions.replacesVersionIds` 透传无断言；投影的 `importedAt` 回执启发式、`rulePacks` 合成、`evidences` 未识别形态无断言；`applyT05…` 无关。见 UNVERIFIED.md。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 权威只有 `state.v2.json`，不建 `case.json`/`case.v2.json` | 已证实 | 文件头 `:1-5`；测试 `:30-31`、`:74`、`:111`、`:191`、`:263` |
| 原生案卷判别 = 首回执 `CreateNativeWorkspaceCaseV3` 且 revision 0 | 已证实 | `:60-62` |
| 畸形 draft 整份隔离、不自动修复 | 已证实 | `:79-87`；测试 `:181-195` |
| 投影降级：学年缺省→`''`、attachment 不进三栏、pending→partial | 已证实 | `:98-99`、`:103-106`、`:113` |
| items 仅在数值分+文本类目+当前来源齐全时投影 | 已证实 | `:136-142`；测试 `:169-178` |
| 显式模板必须 published；自定义领域不装官方 Plan | 已证实 | `:215-227`；测试 `:77-86` |
| actor 门只对建案/建项显式校验；其余靠 IPC 的 `assertC0ReviewMainSender` 提交点断言 | 已证实 | `:240-241`、`:605-606`；`review-ipc.ts:205` 等 |
| `authorizeAtCommit` 抛错→事务不提交、字节不变 | 已证实 | 测试 `:39-45`、`:47-75`、`:163-168`、`:257-262` |
| 同 requestId 幂等重放不重复写；异载荷 `REQUEST_ID_COLLISION` | 已证实 | 测试 `:237-243`；`case-store-v2.ts:221-228` |
| `registerNativeWorkspaceMaterialV3` 会调用 `authorizeAtCommit` 两次（独立+事务内） | 已证实 | `:417` 与 `:427` |
| 建案成功后投影失败不回滚聚合 | 已证实 | `:272-275` |
| `reorderNativeWorkspaceDocumentsV3` 无直接测试 | 已证实 | 冻结树检索仅 `review-ipc.ts:542` 调用点 |
| 归档保留物理原件与历史来源 | 已证实 | `:462-465` 摘要文案 + mutate 只置 `active:false` |
| `importedAt` 启发式是否总能命中 RegisterMaterial 回执 | 推断 | `:128-129` `summary.includes(versionId)`；未构造不匹配样本 |
| `TYPES` 之外的 type 经 IPC 是否可达 | 未知 | IPC 层输入未读（本批外）；本文件 `:233` 已拒 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `NATIVE_CREATE_RECEIPT_V3` | 2、3.1 | `:19` | covered |
| `domainRequiresAcademicYear`/`ACADEMIC_YEAR_DOMAINS` | 3.4、3.5、7 | `:51-56` | covered |
| `isNativeWorkspaceCaseV3` | 3.1 | `:58-88` | covered |
| `nativeWorkspaceProjectionV3` | 3.2 | `:90-210` | covered |
| `resolvedTemplate` | 3.3 | `:212-228` | covered |
| `createNativeWorkspaceCaseV3` | 3.4 | `:231-277` | covered |
| `updateNativeWorkspaceSettingsV3` | 3.5 | `:280-388` | covered |
| `registerNativeWorkspaceMaterialV3` | 3.6 | `:401-434` | covered |
| `removeNativeWorkspaceDocumentsV3` | 3.7 | `:436-472` | covered |
| `reorderNativeWorkspaceDocumentsV3` | 3.8、9 | `:474-506` | covered（无直接测试） |
| `updateNativeWorkspaceReviewItemV3` | 3.9 | `:509-574` | covered |
| `createNativeReviewItemV3` | 3.10 | `:581-670` | covered |
| 投影 items 锚点/精度 | 3.2 | `:132-177` | covered |
| `importedAt` 启发式 | 3.2、10 | `:128-129` | partial（未构造不匹配） |
| 幂等/CAS/撤销语义 | 5、6 | `case-store-v2.ts:221-233` | covered（依赖侧） |
