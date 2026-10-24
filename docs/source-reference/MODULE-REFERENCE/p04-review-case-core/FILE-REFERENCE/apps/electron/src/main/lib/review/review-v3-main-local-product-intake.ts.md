---
path: apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e7448447f36e1f952795405f7db69a04c73428b
sha256: bc0fcac058df834c7155b56d1cce3acc7937074e2b252fdf0130b7727c6be9dd
lines: 327
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts

## 1. 结论与边界

C11 生产 Main 输入链：把原生 V3 案卷的物理原件（每次读取都重新验字节）送入 B2 作用域暂存，生成 B30 完整清单与 B3 保守路由；另提供中断、未匹配作者草稿、人工选择模板三个 IPC。运行时服务 + IPC 注册。

边界：

- 不制造 Run、政策、Check PASS、学校 ACK 或第二个持久案卷（文件头 `apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:1-6`）。
- 不把材料安装进 CurrentCase；B2 暂存是内存态（`:89-131`；`review-intake-adapter-v3-b2.ts:79-88`）。
- 只有 `LOCAL_PRODUCT_MANUAL_CHOICE_V3` 对非 D4 模板会写案卷（`updateNativeWorkspaceSettingsV3`）；D4 候选只回 `requiresPlanSetup`，不写（`:304-311`）。
- 不解释 B3 路由规则本身；规则在 `review-intake-routing-adapter-v3-b3.ts`。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数、2 个接口（`C11MainLocalProductRead`、`C11MainLocalTechnicalChoiceAck`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `C11MainLocalProductRead` | 接口（导出） | 32-38 | `{read:B32ProductRead;catalog:B3ManualCatalogEntry[];sessionKey:string;routeCandidates:D4ContentRouteSuggestion[]}` | 读取返回；`routeCandidates` 仅供展示/人工点选 |
| `C11MainLocalTechnicalChoiceAck` | 接口（导出） | 39-43 | `{candidateOnly:true;technicalChoiceRecorded:true;caseCandidateId;templateId;templateVersion;requiresPlanSetup?:true}` | 人工选择回执 |
| `installC11LocalNativeProductIntake` | 函数（导出） | 237-327 | `() => void` | 注册 5 个 IPC handler |
| `Session` | 内部接口 | 44-51 | `signature/ctx/staging/router/interrupted/chosen` | 进程内会话 |
| `sessions` | 内部常量 | 52 | `Map<string,Session>` | 键 `sessionId:frameId:caseId` |
| `digest` | 内部 | 53-54 | `(value)=>sha256(JSON.stringify(value))` | 签名/读取版本 |
| `local` | 内部 | 55-84 | `(event,caseId)=> {aggregate,scope,key,signature}` | 身份、案卷、作用域与签名派生 |
| `sameScope` | 内部 | 85-88 | `(a,b)=>boolean` | 比较 caseCandidateId/sessionId/frameId/ownerGeneration |
| `stageOriginals` | 内部 | 89-131 | `(aggregate,ctx,staging)=>void` | 逐原件验真、映射主体、暂存；ZIP 逐条目展开 |
| `digestBytes` | 内部 | 132-134 | `(bytes)=>hex` | 字节哈希 |
| `session` | 内部 | 135-151 | `(event,caseId)=> {data,s}` | 获取/重建会话，清理同案其它会话，末尾再验原件 |
| `catalog` | 内部 | 152-173 | `()=>B3ManualCatalogEntry[]` | 已发布模板 + 冻结 D4 目录（缓存） |
| `evaluate` | 内部 | 174-216 | `(s,items)=>B3RouteState` | 构造 B3 输入并调用路由会话 |
| `read` | 内部 | 217-236 | `(event,caseId)=>C11MainLocalProductRead` | 读取清单 + 路由 + 候选展示 |
| `historicalD4Catalog` | 内部缓存 | 152 | `B3ManualCatalogEntry[] \| undefined` | 首次构建后不再失效 |

## 3. 内部逻辑与关键流程

### 3.1 身份、案卷与作用域（`local`）

1. `assertC0ReviewMainSender(event)`（`apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts:58`）。
2. `assertSafeReviewStorageId(caseId,'caseId')`（`:59`）。
3. 主窗口必须存在、未销毁、`webContents.id` 等于发送者、`senderFrame` 等于 `sender.mainFrame`、`routingId` 为非负安全整数；否则 `C11_NATIVE_MAIN_FRAME_UNAVAILABLE`（`:60-64`）。
4. 读聚合；必须是原生 V3、ID 一致、非 `archived`；否则 `C11_NATIVE_CASE_UNAVAILABLE`（`:65-68`）。
5. 构造 `B20MainReadScope`：`principalId='local-reviewer'`、`sessionId='local-main:'+sender.id`、`senderId`、`frameId=routingId`、`ownerId='native-case-'+caseId`、`ownerGeneration=caseV2.revision`、`authorityEpochch=0`、`caseCandidateId=caseId`（`:69-76`）。
6. 签名 = sha256(`[caseId, sessionId, frameId, ownerGeneration, activeDocs[versionId,byteHash,role,parseRevision], subjects[id,sourceRefs]]`)（`:77-82`）。
7. 键 = `sessionId:frameId:caseId`（`:83`）。

`B20MainReadScope` 的字段契约见 `apps/electron/src/main/lib/review/review-v3-b1-b2-main-read-bundle-v3-b.ts:31-35`。

### 3.2 原件暂存（`stageOriginals`）

- 只取 `active!==false` 的文档；超过 500 份 → `C11_NATIVE_MORE_THAN_500_CURRENT_MATERIALS`（`:90-91`）。
- `hasApplication`：只要存在 `role==='application'` 的文档，就把“本案”作为临时路由组（`:92-95`）。
- 逐份：
  1. `assertC2PhysicalOriginalBytes` 复核（`:98`；`review-v3-main-trust-port.ts:68-115`）。
  2. 从 `review-cases/<caseId>/<assetPath>` 读原始字节，重算 sha256 必须等于 `doc.byteHash`，否则 `C11_NATIVE_ORIGINAL_CHANGED_AFTER_VERIFY`（`:99-101`）。
  3. 关联主体：`subject.sourceRefs` 中 `caseId`、`documentVersionId`、`parseRevision` 全匹配且唯一时用该主体 ID；否则若 `hasApplication` 用 `case-scope-<caseId>`，再否则 `null`（`:102-106`）。
  4. 角色映射：`application→application`、`evidence→supporting`、其它（含 `rule`/`attachment`）→`unassigned`（`:107-108`）。
  5. `add()` 每次先 `staging.grant(ctx)`（默认 20 秒 TTL）再 `stage`；`requestId='doc-'+digest(versionId)`（`:109-117`；`review-intake-adapter-v3-b2.ts:97-116,137-187`）。
  6. ZIP：ZIP 本身按 `unassigned`/`subjectId:null` 暂存；`decodeReviewB2Zip` 后若任一 receipt 为 `rejected` → `C11_NATIVE_ZIP_HAS_REJECTED_ENTRIES`；每个 accepted entry 独立暂存为 `unassigned`/`null`，键包含 `versionId/index/entryName`（`:120-129`）。

后果（已证实，静态控制流；与 §10 同一结论、同一证据等级）：只要案卷里有 ZIP，ZIP 本体（`:115-117`）与每个 accepted 条目（`:120-129`）都以 `role:'unassigned'`、`subjectId:null` 暂存，而本文件 `scoped` 要求全部材料 `role!=='unassigned'`（`:186-188`）、B3 纯函数也拒绝 `role==='unassigned'` 的材料（`review-intake-routing-adapter-v3-b3.ts:66-72`），因此自动建议/自动路由不会触发；同样，`rule`/`attachment` 文档也会阻断自动路由。该结论为静态控制流推导，未运行验证。

### 3.3 会话（`session`）

- 调 `local`；删除同一 `caseId` 下其它键的会话（`:137`）。这会让同一案卷的旧窗口/旧 frame 会话失效。
- 无会话、签名变化或作用域变化 → 新建 `ReviewB2StagingService`、`stageOriginals`、`ReviewB3OwnerBoundRouteSession`，`interrupted=false`、`chosen=null`（`:138-145`）。
- 无论是否重建，末尾都对所有 active 文档再跑 `assertC2PhysicalOriginalBytes`，防止“案卷 revision 未变但磁盘原件被改”（`:146-149`）。

### 3.4 目录（`catalog`）

- 已发布模板：`listTemplateVersions().filter(status==='published')`，`availability='authorized-for-technical-selection'`（`:154-157`）。
- 冻结 D4 目录：首次调用时逐 entry `loadD4UnifiedWorkspace(entry).definitions.templates[0].name`，同样标为 `authorized-for-technical-selection`；结果缓存在模块变量 `historicalD4Catalog`（`:162-169`）。此处 `availability` 是 B3 的技术可选性字段，与 D4 `catalog.json` 条目的 `publication:'candidate-held'`（`review-d4-catalog.ts:68`）是不同字段。
- 合并时以 `templateId@templateVersion` 去重，已发布优先（`:170-172`）。
- 注意：D4 目录构建没有 try/catch；任一候选工作区损坏会让 `catalog()` 整体抛错（与 `buildLocalD4Templates` 的逐套隔离不同，见 `review-v3-main-d4-local-plan.ts:55-72`）。缓存也意味着目录文件后续变化不会反映到本进程。

### 3.5 路由评估（`evaluate`）

1. 取当前作用域全部暂存候选（`listScopedCandidateIds` + `getCandidate`）（`:175-176`）。
2. 重新读案卷；若当前绑定模板在目录中且可用，`selected` 为该目录项（`:179-182`）。
3. `scoped`：有材料、至少一个 `application`、全部 `role!=='unassigned'`、全部有 `subjectId`、且 `subjectId` 唯一（`:186-188`）。
4. 标题精确匹配：案卷标题（小写）等于目录项名称或模板 ID（小写），仅在 `!selected && scoped` 时计算（`:191-195`）。
5. 内容分类：`classifyD4ApplicationDocuments(items, installed.documents)`（`:196`）。`solo` 仅当恰好一个候选且 `autoEligible`（`:197`）。
6. `titleMatch` 仅当唯一匹配且与 `solo` 不冲突；`fromSource` 仅当 `!selected && scoped && solo`（`:198-199`）。
7. `auto = selected ?? titleMatch ?? fromSource`；只有 `auto && scoped` 才生成建议，建议的 `availability` 固定写 `authorized-for-technical-selection`，`evidence` 覆盖全部材料（`:200-209`）。
8. 调 `router.evaluate`，传 `automaticSelectionEnabled:true`、全部材料、建议、目录、`userInterrupted`、可选 `userChoseTemplateId/Version`（`:210-215`）。

注意（已证实，静态；F-01 修正 r1 的“candidate-held 目录项/下游降级”错述）：

- `catalog()` 对已发布模板（`:156`）与全部 50 套 D4（`:167`）都写死 `availability:'authorized-for-technical-selection'`；本文件的目录里**不存在** `availability='candidate-held'` 的条目。`:158-160` 注释所说的 “candidate-held identity” 指 D4 `catalog.json` 条目的 `publication` 字段（`review-d4-catalog.ts:68` 校验 `entry.publication !== 'candidate-held'`），与 `B3ManualCatalogEntry.availability` 是不同字段、不同含义。
- 第 7 步的建议 `availability` 同样硬编码为 `authorized-for-technical-selection`（`:203`），且建议的 `templateId/templateVersion` 必出自同一 `items` 目录（`:200-209`：`auto = selected ?? titleMatch ?? fromSource`，三者都是目录项）。
- `ReviewB3OwnerBoundRouteSession.evaluate` 的降级分支（`review-intake-routing-adapter-v3-b3.ts:205-213`）只对 `allowedCatalog` 之外的建议 key 触发；而 `allowedCatalog` 正是同一 `items` 中标 authorized 的 key 集合（`review-intake-routing-adapter-v3-b3.ts:191-213`），**本文件组合下该降级分支不可达**。它是 B3 对任意调用方的防御性门禁（见该文件手册），不能当作本文件的实际运行分支。随后 `planB3ConservativeRouting` 仍要求 `availability==='authorized-for-technical-selection'`（`review-intake-routing-adapter-v3-b3.ts:100-105`）。

### 3.6 读取（`read`）

- `session` → `current=()=>local(event,caseId).scope` → `readB30AllCurrentMaterials(current,s.staging)`（`:217-220`；`review-v3-b30-current-materials-read.ts:50-80`）。
- `catalog()` → `evaluate` → 再比较 `local(...).scope` 与 `s.ctx`，不同则 `C11_NATIVE_CASE_CHANGED_DURING_READ`（`:221-224`）。
- 组装 `B32ProductRead`：`schemaVersion:'review-v3-b32-product-read/1'`、`readVersion`（签名 + 清单来源 + 路由的 digest）、`caseCandidateId`、`mainConnection:'C_MAIN_READ_CONNECTED'`、`route`、`inventory`、其余 `null`、`candidateOnly:true`、`publicationAllowed:false`、`businessWriteAllowed:false`、`schoolPolicyVerified:false`（`:225-233`）。
- `routeCandidates` 用 `currentCatalog` 与 `data.aggregate.caseV2.documents` 再分类一次（`:234`）。`data.aggregate` 是本次 `session()` 开头 `local()` 新读的聚合，不是会话建立时的旧快照；但这次分类发生在作用域复核之后，若复核与分类之间文档变化且 revision 未变，仍存在窄竞态（见 §10 推断）。

### 3.7 IPC handlers

`installC11LocalNativeProductIntake`（`:237-327`）注册：

| 通道 | 行为 | 行 |
| --- | --- | --- |
| `LOCAL_PRODUCT_CURRENT_V3` | `read(event,caseId)` | 238-239 |
| `LOCAL_PRODUCT_INTERRUPT_V3` | `session` 后置 `s.interrupted=true`，再 `read` | 240-245 |
| `T02_STAGED_INVENTORY_V3` | 校验 `caseId` 字符串；`session`；懒加载 `previewT02StagedInventory(s.ctx,s.staging)`。预览会把暂存字节写入 `os.tmpdir()` 的临时目录，解析后 `finally` 删除；返回前再次 `assertStillGranted`（`review-v3-t02-staged-source-preview.ts:53-104`） | 253-260 |
| `LOCAL_PRODUCT_UNMATCHED_V3` | 校验输入；`session`；`evaluate` 必须为 `unmatched`；取材料；`prepareB29UnmatchedAuthorDraft`；复核签名与原件字节 | 261-281 |
| `LOCAL_PRODUCT_MANUAL_CHOICE_V3` | 校验输入；`session`；目录可用性；设置 `s.chosen`；`evaluate` 必须 `manually-selected`；D4 直接回 `requiresPlanSetup`；否则 `updateNativeWorkspaceSettingsV3` 写案卷并复核 | 282-326 |

人工选择的持久化细节（`:298-325`）：

- `Number(templateVersion)` 必须是 `>=1` 的安全整数，否则 `C11_NATIVE_TEMPLATE_VERSION_INVALID`。
- 若模板 ID+版本在 D4 目录中：不写案卷，返回 `requiresPlanSetup:true`（`:304-311`）。
- 否则调 `updateNativeWorkspaceSettingsV3(caseId,{caseId,reviewTemplate:{templateId,version}},undefined,()=>assertC0ReviewMainSender(event))`（`:312-315`）。该服务只接受 `status==='published'` 的模板，候选/草稿会被 `VALIDATION_FAILED` 拒绝（`native-workspace-case-v3.ts:212-228`）；提交时还会拒绝已有 `canonicalPlan`/`d2RuntimePlan` 或非草稿阶段（`:349-365`）。
- 重新读聚合，模板必须已变为选择值，否则 `C11_NATIVE_TEMPLATE_BINDING_NOT_PERSISTED`（`:316-319`）。
- 删除当前会话，下一次读取按新 revision 重建（`:320-322`）。

## 4. 调用者与调用链

入向：

- `apps/electron/src/main/index.ts:191` 导入，`:949` 调用 `installC11LocalNativeProductIntake()`。
- preload：`readLocalNativeProductV3`/`interruptLocalNativeProductV3`/`chooseLocalNativeProductTemplateV3`/`prepareLocalNativeUnmatchedV3`（`apps/electron/src/preload/index.ts:4837-4852`）。
- 渲染层：`ReviewV3LocalCandidateWorkbench.tsx:69,91,390,395,414`；`ReviewV3CaseTaskView.tsx:62`；`ReviewV3TemplateRoutingAssistant.tsx:60,130,239`。

出向：

- `review-c0-authority.ts:21`（sender）；`review-storage-id.ts`（ID 安全）；`case-store-v2.ts:51`（读聚合）。
- `native-workspace-case-v3.ts:58/280`（原生识别/设置写入）。
- `review-v3-main-trust-port.ts:68`（原件字节）。
- `review-intake-adapter-v3-b2.ts`（暂存）、`review-zip-intake-v3-b2.ts:114`（ZIP）、`review-v3-b30-current-materials-read.ts:50`（清单）。
- `review-intake-routing-adapter-v3-b3.ts`（路由会话）、`review-v3-d4-content-router.ts:78`（内容分类）、`review-v3-b3-unmatched-author-bootstrap.ts:57`（B29 草稿）。
- `review-d4-catalog.ts:55/85`（目录/工作区）、`template-store.ts:278`（已发布版本）。
- `review-v3-t02-staged-source-preview`（T02 预览，懒加载）。

## 5. 数据 I/O、读写与副作用

- 读：`state.v2.json`、`review-cases/<caseId>/<assetPath>` 原件、模板库、D4 catalog/workspace、ZIP 字节。
- 写：仅人工选择非 D4 模板时 `updateNativeWorkspaceSettingsV3`（案卷事务）；其余 handler 不写业务数据。B2 暂存只在内存（`review-intake-adapter-v3-b2.ts:79-88`）。
- 缓存：`sessions`（进程内，含暂存字节）与 `historicalD4Catalog`（首次构建后不失效）。
- 副作用：`ipcMain.handle` 注册；T02 预览写 `os.tmpdir()` 临时目录并在 `finally` 删除（`review-v3-t02-staged-source-preview.ts:68-104`）；`console` 由下层使用；无网络/窗口/通知。
- 并发：同一案卷的会话以 `caseId` 为后缀清理（`:137`）；B2 暂存以 owner/generation/case 作用域隔离（`review-intake-adapter-v3-b2.ts:188-214`）。
- 原子性：读取路径无写；人工选择写案卷由 `submitCommand` CAS 保证（`case-store-v2.ts:203-262`）。

## 6. 分支、失败、取消与恢复

| 错误 | 触发 | 行 |
| --- | --- | --- |
| `C11_NATIVE_MAIN_FRAME_UNAVAILABLE` | 主窗口/frame 不匹配 | 64 |
| `C11_NATIVE_CASE_UNAVAILABLE` | 非原生/非本案/已归档 | 68 |
| `C11_NATIVE_MORE_THAN_500_CURRENT_MATERIALS` | active 文档 >500 | 91 |
| `C11_NATIVE_ORIGINAL_CHANGED_AFTER_VERIFY` | 读到的字节与 `byteHash` 不符 | 101 |
| `C11_NATIVE_ZIP_HAS_REJECTED_ENTRIES` | ZIP 有条目被拒 | 123 |
| `C11_NATIVE_CASE_CHANGED_DURING_READ` | 读取中作用域变化 | 224 |
| `C11_NATIVE_UNMATCHED_CASE_REQUIRED` | 未匹配输入缺 caseId | 266 |
| `C11_NATIVE_UNMATCHED_ROUTE_NOT_CURRENT` | 路由已不是 `unmatched` | 270 |
| `C11_NATIVE_SOURCE_CHANGED_DURING_AUTHOR_PREPARE` | B29 准备期间签名变化 | 277 |
| `C11_NATIVE_MANUAL_CHOICE_INVALID` | 选择入参非法 | 288 |
| `C11_NATIVE_TEMPLATE_NOT_AVAILABLE` | 目录无此可用模板 | 293 |
| `C11_NATIVE_MANUAL_CHOICE_NOT_CONFIRMED` | 路由未确认人工选择 | 297 |
| `C11_NATIVE_TEMPLATE_VERSION_INVALID` | 版本非安全正整数 | 303 |
| `C11_NATIVE_TEMPLATE_BINDING_NOT_PERSISTED` | 写后模板未变 | 319 |

- 中断是粘性的：`s.interrupted=true` 后只有重建会话（签名/作用域变化或手工选择后删除）才复位（`:242-244`；`:138-145`）。
- 无超时/取消令牌；B2 grant 有 20 秒 TTL（`review-intake-adapter-v3-b2.ts:97`），但每次 `add` 都新发 grant，正常路径不会因 TTL 失败。
- 恢复：原件变化 → 下次 `session` 重建暂存；模板选择写失败 → 抛错，`s.chosen` 仍保留（无回滚），下一次 `evaluate` 仍会显示人工选择状态；D4 选择只返回 `requiresPlanSetup`，需另走 D4 attach。

## 7. 权限与权威状态

- 所有 handler 都经 `session→local→assertC0ReviewMainSender`（`:58`；`review-c0-authority.ts:21-28`）；`local` 还额外比对主窗口与 `senderFrame`（`:60-64`）。
- `principalId`/`ownerId` 由 Main 派生，不接受渲染层传入（`:69-76`）。
- 人工选择的写入在提交时再校验 sender：`updateNativeWorkspaceSettingsV3` 的 `authorizeAtCommit` 回调（`:315`）。
- 目录的 `availability` 只是技术可选性（本文件全部条目都写 `authorized-for-technical-selection`，`:156,167`），不是发布/授权，也不等于 D4 的 `publication:'candidate-held'`（`review-d4-catalog.ts:68`）；B3 的降级门禁在本组合不可达（见 §3.5）。
- 返回固定 `candidateOnly:true`、`publicationAllowed:false`、`businessWriteAllowed:false`、`schoolPolicyVerified:false`（`:230-232`）。

## 8. 修改影响面

- 改 `C11MainLocalProductRead` 形状会影响 preload 类型与 3 个渲染层组件（`ReviewV3LocalCandidateWorkbench.tsx`、`ReviewV3CaseTaskView.tsx`、`ReviewV3TemplateRoutingAssistant.tsx`）。
- 改 `sessionKey` 语义会影响工作台重挂载键（`ReviewV3LocalCandidateWorkbench.tsx:385-386`）与 B3 会话作用域。
- 改 `stageOriginals` 的角色/主体映射会影响 B3 的 `scoped` 判定、自动建议与人工确认。
- 改 `catalog()` 会影响路由目录、人工选择与 D4 入口；D4 缓存不失效是现有行为。
- 改通道名会影响 `packages/shared/src/types/review.ts:518-521,626`、preload 与渲染层。
- 改 `evaluate` 的建议 `availability`（`:203`）或 `catalog()` 的目录 `availability`（`:156,167`）会改变 B3 降级分支（`review-intake-routing-adapter-v3-b3.ts:205-213`）的可达性；两侧要一起看。

## 9. 测试证据

本文件**没有**直接测试。冻结树检索（`grep -rln` 于 `apps`/`packages` 的 `*.test.ts`/`*.test.tsx`）对五个通道常量（`LOCAL_PRODUCT_CURRENT_V3`/`LOCAL_PRODUCT_INTERRUPT_V3`/`LOCAL_PRODUCT_MANUAL_CHOICE_V3`/`LOCAL_PRODUCT_UNMATCHED_V3`/`T02_STAGED_INVENTORY_V3`，注册点 `:238,240,253,261,282`）与文件名均无命中；因此不存在“测试通过”的静态证据。相关行为只被间接覆盖：

- B3 路由规则由 `review-intake-routing-adapter-v3-b3.test.ts`（本批）覆盖，但不覆盖本文件的会话、暂存、目录与 IPC。
- D4 目录由 `review-v3-main-d4-local-plan.test.ts`（本批）覆盖，但不覆盖本文件的 `catalog()` 合并与缓存。
- 内容分类由 `review-v3-d4-content-router.test.ts`（本批）覆盖，但不覆盖本文件如何把结果转成建议。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求。

缺口（静态判断）：无 sender 拒绝、归档案卷、>500 材料、原件篡改、ZIP 拒绝、B29 未匹配、人工选择 D4/非 D4、写后未持久化、会话清理、`historicalD4Catalog` 损坏候选等用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 每次读取都重验 active 原件字节 | 已证实 | `:98-101,146-149` |
| 会话按签名/作用域重建，并清理同案旧会话 | 已证实 | `:135-145,137` |
| ZIP 本体与条目都以 `unassigned` 暂存 | 已证实 | `:115-129` |
| 因此含 ZIP 的案卷不会自动路由（静态控制流，与 §3.2 同一等级、同一依据） | 已证实 | `:115-129`（ZIP 本体/条目均 `unassigned`）；`:186-188`（scoped 要求全部非 unassigned）；`review-intake-routing-adapter-v3-b3.ts:66-72`（B3 同样拒绝） |
| `catalog()` 对 D4 损坏候选无隔离 | 已证实 | `:162-169` 无 try/catch |
| `historicalD4Catalog` 首次构建后不失效 | 已证实 | `:152,162` |
| 目录与建议的 `availability` 在本文件均硬编码为 authorized；B3 降级分支在本组合不可达（F-01 修正） | 已证实（静态） | `:156,167,203`；降级仅对 `allowedCatalog` 外的 key 触发（`review-intake-routing-adapter-v3-b3.ts:205-213`），而建议 key 必出同一目录（`:200-209`） |
| 人工选择 D4 不写案卷 | 已证实 | `:304-311` |
| 人工选择非 D4 写案卷并复核模板 | 已证实 | `:312-319` |
| 非 D4 绑定只接受已发布模板 | 已证实 | `native-workspace-case-v3.ts:212-228` |
| 写失败后 `s.chosen` 不回滚 | 推断 | `:294` 先赋值，`:312-319` 抛错前无清理 |
| `routeCandidates` 与作用域复核之间存在窄竞态 | 推断 | `:234` 用 `data.aggregate`；复核在 `:223-224`，分类在其后 |
| 无直接测试 | 已证实（检索范围：冻结树 `apps`/`packages` 测试文件） | 五个通道常量与文件名 0 命中 |
| T02 预览会写临时目录并清理 | 已证实 | `review-v3-t02-staged-source-preview.ts:68-104` |
| T02 预览的完整字段/解析器行为 | 未知 | 只读入口与临时文件段，未逐行读完整解析链 |
| B29 草稿内部校验 | 未知（超出本文件） | 由 `review-v3-b3-unmatched-author-bootstrap.ts:57-...` 实现 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `local` 身份/frame/案卷/作用域 | §3.1 | 55-84 | covered |
| `stageOriginals` 逐原件/主体/角色 | §3.2 | 89-118 | covered |
| ZIP 展开与拒绝 | §3.2 | 120-129 | covered |
| `session` 重建/清理/末尾验真 | §3.3 | 135-151 | covered |
| `catalog` 合并/缓存 | §3.4 | 152-173 | covered |
| `evaluate` selected/scoped/title/content | §3.5 | 174-209 | covered |
| 路由会话调用 | §3.5 | 210-215 | covered |
| `read` 清单/版本/复核 | §3.6 | 217-236 | covered |
| 读取/中断 IPC | §3.7 | 238-245 | covered |
| T02 预览 IPC | §3.7 | 253-260 | covered |
| 未匹配作者 IPC | §3.7 | 261-281 | covered |
| 人工选择 IPC | §3.7 | 282-326 | covered |
| 无直接测试 | §9 | — | unknown |
