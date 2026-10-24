---
path: apps/electron/src/main/lib/review/workspace-service-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd42cd48ad2a7531457d191fcfe6432d730a3f62
sha256: 1048857dbf8d37eb7a9cf50916e6b5f3004e03828fb37e7cc8760ba1353ff934
lines: 250
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/workspace-service-v2.ts

## 1. 结论与边界

迁移期“三栏工作台（V1 `case.json`）→ V2 案卷聚合（`state.v2.json`）”的映射与同步层：首次打开以**同一 caseId** 建立 V2 聚合（`EnsureReviewWorkspaceAggregate` 回执），此后把 V1 的申报字段/事项/文件版本**投影**进聚合（`SyncReviewWorkspaceProjection` 命令事务），V2-only 材料版本、人工事实、回执全部保留。运行时模块，含磁盘读写、乐观并发重试与模板升级迁移。

不做的事：不实现聚合存储（`case-store-v2`）、V1 存储（`case-store`）、规则编译细节（`workspace-rule-compiler`）、材料物理入库（`material-service`）、证据关联算法（`evidence-service.buildEvidenceLinks`）、来源撤效（`source-current-validity-v3`）；不处理原生案卷的 V1 投影（见 §3.3 短路）。

## 2. 导出与关键符号

导出 3 个 function、0 个导出类型。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ensureWorkspaceAggregateV2` | function | `:154-162` | `(caseId) => Promise<CaseAggregateV2>` | 并发去重初始化 + 每次随后同步投影 |
| `syncWorkspaceProjectionV2` | function | `:165-224` | `(caseId) => Promise<CaseAggregateV2>` | V1→V2 投影同步（CAS 事务 + 3 次重试） |
| `projectWorkspaceCaseV2` | function | `:248-250` | `(v1, current) => ReviewCaseV2` | 纯投影构造（测试/查询用） |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `SYSTEM_ACTOR` | `:16` | `{actorId:'review-workspace-sync',actorSource:'system',role:'system'}` |
| `ensureFlights` | `:17` | `Map<caseId, Promise<CaseAggregateV2>>` 初始化去重 |
| `text` | `:19-21` | text 字段构造 |
| `projectedCase` | `:23-117` | V1+current → 目标 `ReviewCaseV2` 形状 |
| `projectionFingerprint` | `:119-122` | `{title,templateId,templateVersion,caseFields,subjects,documents,reviewRules}` 的 JSON |
| `initializeAggregate` | `:124-151` | 首次建立聚合（含迁移） |
| `upgradeLegacyComprehensiveTemplateAssignment` | `:231-245` | 空规则综测模板 v2→v3 升级 |

## 3. 内部逻辑与关键流程

### 3.1 投影构造 `projectedCase`（`:23-117`）

1. `mapDomainToTemplate(v1.domainPackId)` 无 `templateId` → throw（`mapping.note ?? 未映射`，`:24-25`）。
2. 模板选择：`v1.reviewTemplate` 优先；版本缺省时仅当 `current.templateId` 相同才沿用 `current.templateVersion`（`:26-28`）；`getTemplate` 取不到 → throw（`:29-30`）。
3. subjects：`itemToSubject(item)` 后与 `current.subjects` 同 id 旧值合并——`fields` 合并（旧 V2-only 字段保留）、`sourceRefs` 的 `caseId` 统一为 `v1.id`（`:32-43`）。
4. 规则：`sourceRules` = `v1.rulePacks` 逐 outline 经 `compileWorkspaceRule(pack,outline,index+1)`；`manualRules` = `v1.manualRules`（缺省 `[]`）编成 `id=manual:${v1.id}:${rule.id}`、`policyVersionId=case-manual:${v1.id}@1`、`execution:'semantic'`、`confirmation:'confirmed'` 的规则，`priority` 接在 sourceRules 之后（`:44-59`）。
5. 材料投影 `projectDocument`（`:62-79`）：`documentToVersion` 转 V2 版本形状；仅当模板是 `comprehensive-assessment-v2` 时补 `materialSlotId`（application→`application-form`、evidence→`certificates`，`:64-68`）；同 `versionId` 的旧 V2 值保留 `usage/unusedReason/active/supersedesVersionId`（`:69-78`）。
6. 归档集：`v1.archivedDocuments` 经 `projectDocument` 后强制 `active:false`、`usage:'unread'`、`unusedReason:'审核员已从当前审核材料中移除'`，并过滤掉仍 active 的版本（`:82-94`）。
7. **V2-only 版本保留**：`legacyVersionIds` = V1 documents+archived 的 `${id}-v1`；`current.documents` 中不在此集合的版本（如 V2 侧重解析/修复的材料）原样并入（`:95-102`、`:115`）。
8. 返回 `{...current, templateId, templateVersion, title, caseFields:{applicant,academicYear}, subjects, reviewRules, documents:[...active投影,...archived,...v2Only]}`（`:103-116`）。

### 3.2 初始化 `initializeAggregate`（`:124-151`）

1. `ensureBuiltinTemplateDrafts`（首次使用无需先开 V2 面板，`:125-126`）。
2. `readAggregate` 已存在 → 直接返回（**原生 V2 案卷即便没有 V1 case.json 也是权威**，`:127-129`）。
3. `getCase` 无 V1 → throw“辅助审核案卷不存在”（`:130-131`）；`migrateCaseToV2` 失败 → throw（`:133-134`）。
4. `projected` 重置 `revision:0`；`stage = documents.length>0 ? 'submitted' : 'draft'`（`:135-137`）。
5. 回执 `EnsureReviewWorkspaceAggregate`：`requestId=workspace-init-${caseId}`、`payloadHash=sha256('${caseId}|${fingerprint}')`、`actor=SYSTEM_ACTOR`（`:138-146`）；`createAggregate` 落盘；重读失败 throw（`:147-150`）。

### 3.3 同步 `syncWorkspaceProjectionV2`（`:165-224`）

1. `ensureBuiltinTemplateDrafts`；`current = readAggregate ?? initializeAggregate`（`:166-167`）。
2. **短路**：`stage==='archived'` 或回执链里没有 `EnsureReviewWorkspaceAggregate` → 原样返回（原生案卷永不接收 V1 投影；归档案卷不因旧 UI 读 case.json 重开，`:168-171`）。
3. 无 Plan 时先跑模板升级（`:172-174`）。
4. 乐观并发循环 3 次（`:177-222`）：取 V1 → `projectedCase`；**Plan 已绑定时**投影保留 `current` 的 `templateId/templateVersion/subjects/reviewRules`（V1 编辑不得替换冻结模板/规则清单，`:183-187`）；`archivedVersionIds` = V1 归档的 `${id}-v1`（`:188`）；指纹与当前一致 → 直接返回（`:189`）。
5. `digest=sha256(fingerprint)`；命令 `SyncReviewWorkspaceProjection`、`requestId=workspace-sync-${digest.slice(0,32)}`、`expectedRevision=current.revision`、`actor=SYSTEM_ACTOR`（`:190-196`）。
6. mutate（`:199-217`）：`draft.caseV2={...projection, revision/updatedAt 保持}`；同一 CAS+回执内 `revokeCurrentSourceValidity(draft, archivedVersionIds,'archive')`（`:203`）；V1 items 的 `evidenceDocumentIds` 转成 AI/用户候选证据关联（`linkedBy` 按 `identifiedBy==='manual' ? 'user':'ai'`，只对 active 版本建链，`:205-216`）。
7. `result.ok` 返回；`VERSION_CONFLICT` → 重读再试；其它错误 throw（`:219-221`）；3 次仍冲突 throw“案卷聚合同步冲突，请刷新后重试”（`:223`）。

### 3.4 模板升级 `upgradeLegacyComprehensiveTemplateAssignment`（`:231-245`）

- 仅当 V1 `reviewTemplate === comprehensive-assessment-v2@2`（`:234`）、旧模板**无任何 criteria**（`:237`）、当前同名模板是 v3 且 published 且**有 criteria**（`:238-239`）才执行。
- `updateCase` CAS 换绑 `v3`，理由“升级空规则内置综测模板 v2 → v3（保留历史运行）”（`:241-244`）；条件不满足静默跳过。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）。

### 4.1 入向

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:65`（import）；`:125` `ensureWorkspaceAggregateV2`（打开案卷）；`:298`/`:322`/`:361`/`:1429`/`:1440` `syncWorkspaceProjectionV2`；`:628` 模板变更后 `ensureWorkspaceAggregateV2` | 同步触发点 |
| 导入/移除/排序 | `case-import.ts:17`（import）；`:286`/`:349`/`:391`/`:404` `syncWorkspaceProjectionV2` | 材料变更后同步 |

### 4.2 出向

`case-store.getCase/updateCase`（`:7`）、`case-store-v2.createAggregate/readAggregate/submitCommand`（`:8`）、`migration.{documentToVersion,itemToSubject,mapDomainToTemplate,migrateCaseToV2}`（`:9`）、`template-store.{getTemplate,saveDraft}`（`:10`）、`builtin-templates.ensureBuiltinTemplateDrafts`（`:11`）、`evidence-service.buildEvidenceLinks`（`:12`）、`workspace-rule-compiler.compileWorkspaceRule`（`:13`）、`source-current-validity-v3.revokeCurrentSourceValidity`（`:14`）。

### 4.3 链路

```
review-ipc 打开/编辑案卷、case-import 材料变更
  → ensureWorkspaceAggregateV2 / syncWorkspaceProjectionV2
  → initializeAggregate（首次：migrateCaseToV2 + createAggregate）
  → projectedCase（compileWorkspaceRule / documentToVersion / itemToSubject）
  → submitCommand SyncReviewWorkspaceProjection（state.v2.json，CAS+回执）
  → revokeCurrentSourceValidity + buildEvidenceLinks（同一事务）
```

## 5. 数据 I/O、读写与副作用

- **读**：V1 `case.json`（`getCase`）、V2 `state.v2.json`（`readAggregate`）、模板库（`getTemplate`）。
- **写**：`createAggregate`（首次）、`submitCommand`（同步）、`updateCase`（模板升级，写 V1 case.json）。全部带 CAS（`expectedRevision`）与回执。
- **副作用**：归档版本的来源撤效与证据候选建链发生在同一事务（`:201-216`）；`ensureFlights` 仅内存去重，`finally` 删除（`:157`）。
- **幂等**：指纹相同短路不写（`:189`）；`requestId=workspace-sync-${digest}` 使同内容重同步可被 `case-store-v2` 幂等识别。
- **并发**：`ensureFlights` 去重同 caseId 的并发初始化；同步循环最多 3 次重试，冲突时**不**用旧快照覆盖他人写入（`:176` 注释、`:221` 重读）。
- **失败**：3 次冲突 throw（`:223`）；迁移/模板缺失 throw（`:25`、`:30`、`:131`、`:134`）。无自动重试以外的恢复；无日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 领域未映射模板 | `:24-25` | throw `mapping.note ?? …` |
| 模板不存在 | `:29-30` | throw |
| V1 不存在（初始化） | `:130-131` | throw“辅助审核案卷不存在” |
| 迁移失败 | `:133-134` | throw `migration.note` |
| 原生/归档短路 | `:170-171` | 返回当前聚合，不写 |
| Plan 绑定 | `:183-187` | 投影保留冻结的 template/subjects/reviewRules |
| 指纹一致 | `:189` | 返回，不写 |
| VERSION_CONFLICT | `:220-221` | 重读重试（≤3） |
| 其它命令错误 | `:220` | throw `${code}: ${message}` |
| 3 次冲突 | `:223` | throw“案卷聚合同步冲突…” |
| 模板升级条件不满足 | `:234-239` | 静默跳过 |
| 取消 | 无 | 无 AbortSignal |
| 重启恢复 | 无内存态 | 聚合/ V1 文件为权威；`ensureFlights` 不持久 |

## 7. 权限与权威状态

- **无权限分支**：本文件不接收 sender/actor 参数；同步命令以 `SYSTEM_ACTOR`（`actorSource:'system'`）入账（`:16`、`:145`、`:193`）。谁能触发由 IPC 层约束（本文件不校验）。
- **权威状态**：迁移期双源——V1 `case.json` 是输入投影源，V2 `state.v2.json` 是事务权威；`EnsureReviewWorkspaceAggregate` 回执标记“该 caseId 属工作台迁移案卷”，原生案卷缺此回执即拒收 V1 投影（`:170-171`；测试 `workspace-service-v2.test.ts:222-247` 实证标题不被陈旧 V1 覆盖）。
- **Plan 冻结**：`d2RuntimePlan/canonicalPlan` 存在时 V1 编辑不能替换模板/Subject×Rule 身份（`:181-187` 注释与实现）。

## 8. 修改影响面

- 改 `projectedCase` 形状/合并规则 → 影响 IPC 打开案卷的显示、`reviewRules` 内容、证据候选；测试 `workspace-service-v2.test.ts`（11 例）与 `workspace-rule-compiler` 语义联动。
- 改指纹字段（`:119-122`）→ 影响同步短路与 `requestId`，可能对既有案卷产生一次性额外写。
- 改同步事务（`:199-217`）→ 归档撤效、证据关联的原子性；`run-store`/`source-current-validity-v3` 消费方受影响。
- 改模板升级（`:231-245`）→ 影响旧综测案卷的模板绑定与历史运行引用。
- 需同步的测试：`workspace-service-v2.test.ts`；间接 `workspace-rule-compiler.test.ts`。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `workspace-service-v2.test.ts`（1 describe、**11 test**；夹具 `PROFER_CONFIG_DIR` 指向 `work/tmp` 随机目录，`buildDemoCase()` 造 V1 案卷）：

1. `:23-35` 首次打开同 caseId 建聚合：subjects/documents 数量与 V1 一致、`sourceRefs[0].documentVersionId==${anchor.documentId}-v1`、首回执 actor `system`。
2. `:37-57` 同步新申报输入保留人工事实：`correctObservation` 后改 V1 title 再同步 → title 更新、observation“人工确认等级”仍在、`CorrectObservation` 回执仍在。
3. `:59-79` V2-only 材料存活：`registerMaterial` 登记 workbench 材料后同步 → 该 versionId 的文档仍在（1 份、parsed、active），不被 V1 投影抹掉。
4. `:81-99` 模板+手写规则投影：`templateId/Version` 与所选模板一致、`reviewRules` 含 `manual:${id}:local-rule-1` 与 `sourceRefIds` 以 `-v1` 结尾；同步后仍一致。
5. `:101-117` 空规则综测 v2→v3 升级：`getCase.reviewTemplate` 变为 v3、聚合 templateId/Version 更新、subjects 数量不变。
6. `:119-158` 重投影保留已读/确认关联/人工事实：`acknowledgeWorkspaceMaterialV2` 后 `manualReadReceipt` 存在；`setEvidenceLink` 候选+确认后同步 → `usage:'read'`、link `status:'confirmed'`、`AcknowledgeWorkspaceMaterial`/`SetEvidenceLink` 回执在。
7. `:160-189` 移除证明材料：`removeDocumentsFromCase` 后 V1 归档、V2 该版本 `active:false,usage:'unread'`、原确认关联 `status:'rejected'`、同步回执 summary 含“同步申报输入与材料”。
8. `:191-203` 重排证明材料 V1/V2 同序。
9. `:205-220` 规则编译联动：未确认 pack → 全部 `manual/unconfirmed`；确认后 `confirmed` 且 deterministic/manual 混合、`sourceRefIds[0]` 以 `-v1` 结尾。
10. `:222-247` 原生权威压制陈旧 V1：同 caseId 冲突下 `saveCase` 抛“原生审核案卷禁止”，`ensure/sync` 均返回原生标题、subjects 为空、`receiptLog` 长度 1。
11. `:249-283` 归档级联：`removeDocumentsFromCase` 后旧 observation `confirmed:false`、`sourceValidityRevocations.previouslyConfirmedObservationIds` 含旧 id、对已撤效版本 `setEvidenceLink` 返回 `STALE_INPUT`。

**未覆盖**：同步 3 次冲突后 throw（`:223`）；`ensureFlights` 并发去重；指纹短路不写；`upgrade` 的双条件不满足分支；`projectedCase` 对缺 `mapDomainToTemplate` 领域的 throw 文案；`materialSlotId` 仅综测模板补槽分支的直接断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 同 caseId 建聚合、`EnsureReviewWorkspaceAggregate` 系统回执 | 已证实 | `:124-151`；测试 `:23-35` |
| 原生/归档短路，不收 V1 投影 | 已证实 | `:168-171`；测试 `:222-247` |
| Plan 绑定时冻结 template/subjects/reviewRules | 已证实 | `:181-187` |
| V2-only 材料版本在同步中存活 | 已证实 | `:95-102`；测试 `:59-79` |
| 归档撤效与投影同一 CAS 事务 | 已证实 | `:201-203`；测试 `:249-283` |
| 手写规则编成 `manual:` 前缀 semantic 规则 | 已证实 | `:45-59`；测试 `:81-99` |
| 空规则综测 v2→v3 自动升级 | 已证实 | `:231-245`；测试 `:101-117` |
| 同步冲突重试 ≤3 后 throw | 已证实 | `:177`、`:223`（分支存在；未触发测试） |
| `ensureFlights` 并发去重行为 | 已证实（代码）/未知（并发实测） | `:155-159` |
| 同步 actor 为 system、无权限校验 | 已证实 | `:16`、`:145`、`:193` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `projectedCase` | 3.1 | `:23-117` | covered |
| `projectionFingerprint` | 3.3 | `:119-122` | covered |
| `initializeAggregate` | 3.2 | `:124-151` | covered |
| `ensureWorkspaceAggregateV2` | 3.2、5 | `:154-162` | covered |
| `syncWorkspaceProjectionV2` | 3.3 | `:165-224` | covered |
| `upgradeLegacyComprehensiveTemplateAssignment` | 3.4 | `:231-245` | covered |
| `projectWorkspaceCaseV2` | 2 | `:248-250` | covered |
| 3 次冲突 throw | 6 | `:223` | partial（未触发） |
| materialSlotId 补槽 | 3.1 | `:64-68` | partial（经 #4 间接） |
