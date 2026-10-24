---
path: apps/electron/src/main/lib/review/review-ipc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d656fb468c27e2b9783b71dd40c7dc7b16290bae
sha256: 910c0189e44065729e7f53d2e41f3b8f8bbfc9c6c17c904298a90b47b5a074bd
lines: 1539
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ipc.ts

## 1. 结论与边界

内容审核专区**全部 IPC 处理器的注册簿**（`registerReviewIpc()`，`:107` 起）：共 **108 个 `ipcMain.handle`**，对应 `REVIEW_IPC_CHANNELS` 全集。设计决策（`:11-13`）：独立注册函数由 `main/ipc.ts` 的 `registerIpcHandlers()` 启动时调用一次，避免向 7700+ 行 `ipc.ts` 追加业务逻辑。启动即做恢复（`markStaleRunsInterrupted`，`:113-119`）。

明确不做的事：

- **不做业务实现**：业务在 `case-store`/`case-store-v2`/`native-workspace-case-v3`/各 service；本文件是参数校验+守卫+委托。
- **不做身份签发**：命令 actor 经 `bindLocalReviewerCommand`/`bindC0LocalCaseCommand` 由 Main 覆盖（见第 7 节）。

## 2. 导出与关键符号

`export` 共 **1 个**：`registerReviewIpc(): void`（`:107`）。内部常量/函数：`SOURCE_ROLES`（`:70`，`rule/application/evidence` 白名单）、`CASE_TYPES`（`:73`，`综合测评/活动申请/自定义审核`）、`requireString`（`:76-81`，空串/非字符串→「参数 X 缺失或类型非法」）、`assertLegacyChannelNotSuperseded`（`:87-100`，冻结 CanonicalPlan 案卷拒旧写通道；`CAST_RATING_V2` 另拒批次内案卷并行记分）。

## 3. 内部逻辑与关键流程

### 3.1 启动（`:110-119`）

`registerCMainV3AuthorPlanIpc()`（Dev-C C-MAIN-WIRE）→ `markStaleRunsInterrupted` 恢复（queued/running 标 interrupted，08 设计 §5；失败仅 warn）。

### 3.2 108 个 handler 分组（行号为注册行；每 handler 含参数校验→守卫→委托）

**A. 案卷/材料（V1 与兼容路径）**

| 通道 | 行 | 守卫/校验 | 委托 |
| --- | --- | --- | --- |
| `LOAD_DEMO_CASE` | `:123` | — | `loadDemoCase` |
| `LIST_CASES` | `:130` | — | `listCases` |
| `LIST_RUNS` | `:134` | caseId | `listRuns` |
| `GET_CASE` | `:140` | caseId | `getCase` |
| `CREATE_CASE` | `:145-181` | `assertC0ReviewMainSender`（`:159`）、`CASE_TYPES` 白名单（`:161`）、模板须 published（`:166-174`）、学年非 undefined 时 `requireString`（`:182-184`） | `createNativeWorkspaceCaseV3`（`:187`） |
| `UPDATE_CASE_SETTINGS` | `:193` | `assertC0ReviewMainSender`（`:196`） | 原生案卷→`updateNativeWorkspaceSettingsV3`（`:205`，传 `() => assertC0ReviewMainSender(event)` 回调），否则 V1 `updateCase` |
| `UPDATE_RULE_OUTLINE` | `:303` | requireString | `updateCase` |
| `UPDATE_REVIEW_ITEM` | `:326` | `assertC0ReviewMainSender`（`:341`） | 原生→`updateNativeWorkspaceReviewItemV3`（`:342`） |
| （匿名行 `:370`，`REVIEW_ITEM` 创建类） | `:370` | `assertC0ReviewMainSender`（`:373`、`:382`） | `createNativeReviewItemV3` |
| `CONFIRM_RULE_PACK` | `:386` | requireString；**原生案卷拒绝**（`:387-388`「NATIVE_RULE_CONFIRMATION_REQUIRED」） | `confirmRulePackInCase`（`:392`） |
| `IMPORT_DOCUMENT` | `:396` | `assertC0ReviewMainSender` 多次（`:403`、`:408`、`:414-415`；选择框打开期间窗口可能变） | 原生→`registerNativeWorkspaceMaterialV3`，否则 `importDocumentsIntoCase`（`:428`） |
| `IMPORT_DOCUMENT_FROM_PATH` | `:441` | **仅开发版**（`:443` `app.isPackaged` 抛「路径直导仅在开发版可用」）；`SOURCE_ROLES`（`:445`） | `importDocumentFromPath`（`:456`） |
| `GET_IMAGE_PREVIEW_PATH` | `:468` | requireString | 预览路径解析 |
| `GET_WORKSPACE_DOCUMENT_PREVIEW_PATH` | `:497` | — | `resolveCaseDocumentPreviewPath` |
| `REMOVE_DOCUMENTS` | `:509` | `SOURCE_ROLES`；`assertC0ReviewMainSender`（`:519`） | 原生→`removeNativeWorkspaceDocumentsV3`（`:520`），否则 `removeDocumentsFromCase`（`:522`） |
| `REORDER_DOCUMENTS` | `:531` | `SOURCE_ROLES`；`assertC0ReviewMainSender`（`:541`） | 原生→`reorderNativeWorkspaceDocumentsV3`（`:542`），否则 `reorderDocumentsInCase`（`:544`） |
| `LATEST_RUN` | `:553` | — | 最新运行 |
| `DELETE_CASE` | `:1342-1370` | `assertSafeReviewStorageId`（`:1344`）；V2 状态/归档历史完整性（`:1345-1360`） | **转归档**：`archiveReviewCaseV3`（`:1364`，requestId=`legacy-remove-`+哈希、actor 固定 local-reviewer） |
| `RESTORE_CASE_V3` | `:1379-1415` | 归档检查点校验（`:1395-1402`） | `restoreReviewCaseV3`（`:1409`，requestId=`native-restore-`+哈希） |

**B. V2 模板/运行/聚合**

| 通道 | 行 | 要点 |
| --- | --- | --- |
| `LIST_TEMPLATES_V2`/`LIST_TEMPLATE_VERSIONS_V2`/`LIST_ARCHIVED_TEMPLATES_V2` | `:561`/`:565`/`:569` | 模板读 |
| `REORDER_TEMPLATES_V2`/`REMOVE_TEMPLATE_V2`/`RESTORE_TEMPLATE_V2`/`GET_TEMPLATE_V2`/`PUBLISH_TEMPLATE_V2` | `:573`-`:594` | 模板管理/发布 |
| `LIST_RUNS_V2` | `:599-604` | 仅 `assertSafeReviewStorageId`（**无 sender 守卫**）→ `reconcilePiReviewRunsWithReadReceipts(caseId, listRunsV2(caseId))` |
| `GET_RUN_V2` | `:605` | 参数校验 |
| `CANCEL_RUN_V2` | `:611` | 取消运行 |
| `MIGRATE_CASE_V2` | `:617` | V1→V2 迁移 |
| `BOOT_CHECK_V2`/`SEED_FIXTURE_V2` | `:631`/`:637` | 启动自检/夹具 |
| `CREATE_CASE_V2` | `:644` | `bindC0LocalCreateIntent(event,input)`（`:647`） |
| `GET_AGGREGATE_V2` | `:651` | 聚合读 |
| `UPDATE_FIELDS_V2` | `:656` | `bindC0LocalCaseCommand(event, caseId,'UPDATE_FIELDS_V2',command)`（`:657`） |
| `EXPORT_REPORT_V2` | `:661` | 报告导出 |
| `ASSIGNMENT_CREATE_V2`/`REVOKE`/`LIST` | `:668`/`:675`/`:683` | Pi 指派管理 |
| `CASE_TIMELINE_V2` | `:688-697` | `getCaseV2Aggregate`→`buildCaseTimeline(aggregate, runs, filterOperator)`（不传 `extra`） |
| `GET_RUN_OBSERVATIONS_V2` | `:699` | 观察读 |
| `GET_WORKSPACE_RUN_VALIDITY_V2` | `:709-715` | 仅参数非空（**无 sender 守卫**） |

**C. 工作台命令（`bindLocalReviewerCommand` 覆盖 actor）**

| 通道 | 行 | 委托 |
| --- | --- | --- |
| `UPSERT_CASE_SUBJECT_V2` | `:716` | `bindC0LocalCaseCommand(...,'UPSERT_CASE_SUBJECT_V2',...)`（`:717`） |
| `CORRECT_OBSERVATION_V2` | `:721` | 同上模式（`:722`） |
| `SET_EVIDENCE_LINK_V2` | `:726` | 同上（`:727`） |
| `RECORD_WORKSPACE_DISPOSITION_V2` | `:731-734` | `assertC0ReviewMainSender` + `bindLocalReviewerCommand` → `recordWorkspaceDispositionV2` |
| `OPEN_WORKSPACE_SUPPLEMENT_V2` | `:736-739` | 同上 → `openWorkspaceSupplementV2` |
| `ACKNOWLEDGE_WORKSPACE_MATERIAL_V2` | `:741-744` | 同上 → `acknowledgeWorkspaceMaterialV2` |
| `DECIDE_WORKSPACE_CASE_V2` | `:746-749` | 同上 → `decideWorkspaceCaseV2` |
| `RECORD_WORKSPACE_SUBJECT_ADJUDICATION_V2` | `:1030-1033` | 同上 → `recordWorkspaceSubjectAdjudicationV2` |
| `RECORD_STAGE_DECISION_V2` | `:1037` | 阶段决定 |
| `RESOLVE_SUPPLEMENT_V2` | `:1046` | `deriveLocalSupplementResolverActor`（补件解决者身份派生） |
| `RESPOND_SUPPLEMENT_V2` | `:1061` | 补件响应 |
| `CAST_RATING_V2` | `:1144` | `assertLegacyChannelNotSuperseded`（批次内拒并行记分，`:94-99`） |
| `RESOLVE_APPEAL_V2` | `:1150` | 申诉裁决 |
| `F13_SUBMIT_LOCAL_APPEAL`/`REVIEW`/`WITHDRAW` | `:1156`/`:1162`/`:1168` | F13 本地申诉（`bindLocalSubmitterCommand` 2 处） |
| `SUBMIT_CASE_V2` | `:1335` | 提交案卷 |

**D. T05/T06/T07/T09/T01/V3 面**

| 通道 | 行 | 要点 |
| --- | --- | --- |
| `T07_GET_VIEW`/`T07_APPLY_ACTION`/`T07_INIT_STATE` | `:752`/`:762`/`:788` | T07 评分轮次（`assertC0ReviewMainSender` `:756`/`:769`/`:791`） |
| `T09_ISSUE_STUDENT`/`ISSUE_JUDGE`/`PREVIEW_REPLY`/`IMPORT_REPLY` | `:806`-`:854` | T09 离线回件（`:809`/`:827` 守卫） |
| `FALLBACK_TEMPLATE_DRAFT_V3` | `:944` | B29 兜底草稿链 |
| `D4_DEMO_PUBLISH_V3` | `:960` | D4 演示发布 |
| `TEMPLATE_RULE_RUN_V3` | `:965` | 模板规则运行 |
| `T01_MODEL_DRAFT` | `:977` | 模型草稿（真实模型请求入口） |
| `LIST_CASE_STORAGE_ISSUES_V3` | `:983` | 诊断索引读 |
| `T06_PICK_PHYSICAL_SOURCE`/`COMMIT_PHYSICAL_IMPORT` | `:988`/`:994` | T06 物理来源 |
| `T05_STAGE_CAPABILITY` | `:1001` | 阶段能力（currentRunId） |
| `T05_RECORD_STAGE_DECISION` | `:1009` | T05 阶段决定 |

**E. 批次/政策/模板草稿**

| 通道 | 行 | 通道 | 行 |
| --- | --- | --- | --- |
| `CREATE_POLICY_V2` | `:1176` | `CREATE_BATCH_V2` | `:1197` |
| `SAVE_TEMPLATE_DRAFT_V2` | `:1190` | `GET_BATCH_V2`/`LIST_BATCHES_V2` | `:1202`/`:1206` |
| `BATCH_ACTION_V2` | `:1210` | `BATCH_AUTO_PROCESS_V2` | `:1230` |
| `BATCH_GROUP_PREVIEW_V2`/`APPLY_V2` | `:1237`/`:1241` | `LIST_CASES_V2` | `:1246` |

**F. 材料登记**

| 通道 | 行 | 要点 |
| --- | --- | --- |
| `PICK_REGISTER_MATERIAL_V2` | `:1252` | 选择框登记 |
| `REGISTER_MATERIAL_PATH_V2` | `:1285` | 路径登记（`assertC0ReviewMainSender`，`:1285-1286` 附近） |

**G. AI/旧通道（兼容）**

| 通道 | 行 | 委托 |
| --- | --- | --- |
| `GENERATE_RULE_OUTLINE` | `:1422` | `generateRuleOutline` |
| `EXTRACT_ITEMS` | `:1435` | `extractItems` |
| `RUN_REVIEW` | `:1452` | `runAiReview`/`startReviewRun` |
| `GET_RUN` | `:1461` | V1 运行读 |
| `ASSISTANT_CHAT` | `:1471` | `reviewAssistantChat` |
| `EXPORT_REPORT` | `:1487` | `report-service.exportReport` |
| `GET_MODEL_GATEWAY_STATUS` | `:1495` | `getReviewModelGatewayStatus` |

**H. 设置**

| 通道 | 行 |
| --- | --- |
| `GET_MODULE_SETTINGS_V2` | `:1500` |
| `SAVE_MODULE_SETTINGS_V2` | `:1504` |

## 4. 调用者与调用链

- 注册方：`main/ipc.ts` 的 `registerIpcHandlers()` 启动调用一次（`:11-13`）。
- 调用方：渲染层 preload `reviewAPI`（`apps/electron/src/preload/index.ts`）逐通道桥接。
- 出向：约 40 个本目录模块（case-store、case-store-v2、native-workspace-case-v3、case-import、workspace-service-v2、run-store-v2、pi-case-review-service、batch-store、ai-review-service、report-service、review-model-gateway 等）+ `registerCMainV3AuthorPlanIpc`。

## 5. 数据 I/O、读写与副作用

- 本身无直接文件 I/O（除启动恢复经 `markStaleRunsInterrupted`）；全部写操作经委托模块。
- `T01_MODEL_DRAFT`/`ASSISTANT_CHAT`/`RUN_REVIEW` 等会触发真实模型请求（经网关）。
- `IMPORT_DOCUMENT` 打开系统选择框；进度经 `IMPORT_DOCUMENT_PROGRESS` 回发。

## 6. 分支、失败、取消与恢复

- **参数层**：`requireString`（31 处）、`SOURCE_ROLES`/`CASE_TYPES` 白名单、`assertSafeReviewStorageId`（11 处）。
- **双路径分流**（`isNativeWorkspaceCaseV3` 15 处）：原生案卷走 `*NativeWorkspace*V3`（附带 `() => assertC0ReviewMainSender(event)` 复核回调），旧案卷走 V1 函数；`CONFIRM_RULE_PACK` 对原生案卷直接拒绝（`:387-388`）。
- **旧通道防写**：`assertLegacyChannelNotSuperseded`（3 处）——冻结 CanonicalPlan 案卷拒绝 `CAST_RATING`/合成 stage-decision；批次内案卷拒 `CAST_RATING_V2` 并行记分（`:94-99`）。
- **启动恢复**：`markStaleRunsInterrupted`（`:113-119`）。
- **失败语义**：各 handler 抛中文错误/委托错误码；`DELETE_CASE` 对 `result.ok===false` 抛 `${code}: ${message}`（`:1370` 附近）。

## 7. 权限与权威状态

守卫矩阵（全文件计数）：`assertC0ReviewMainSender` **58**（主窗口+主帧）、`assertMainWindowSender` **3**（旧 AI 通道）、`bindLocalReviewerCommand` **10**（写命令 actor 覆盖为 `LOCAL_REVIEWER_ACTOR`）、`bindLocalSubmitterCommand` **2**、`bindC0LocalCaseCommand` **5**、`bindC0LocalCreateIntent` **2**、`deriveLocalSupplementResolverActor` **2**、`assertSafeReviewStorageId` **11**、`assertLegacyChannelNotSuperseded` **3**、`requireString` **31**。

要点：写命令的 Renderer actor 一律被 Main 派生身份覆盖（`review-ipc-actor-guard.ts:46-53`）；读通道（`LIST_RUNS_V2`/`GET_WORKSPACE_RUN_VALIDITY_V2`）**无 sender 守卫**，仅参数校验（`:599-604`、`:709-715`）。

## 8. 修改影响面

- 新增通道需同步 `REVIEW_IPC_CHANNELS`（`packages/shared/src/types/review.ts`）与 preload `reviewAPI`。
- 双路径分流以 `isNativeWorkspaceCaseV3` 为界；漏分流会造成新旧账本混写。
- `assertLegacyChannelNotSuperseded` 的 CanonicalPlan/批次判定与 T05/T07 权威切换耦合。
- 学年 `requireString`（`:182-184`）+ 领域层判定构成两层口径（详见 CreateCaseDialog 手册 nb-02 批）。

## 9. 测试证据

- 直接相关（本批 12 个测试中的 5 个）：`review-ipc-legacy-sender.test.ts`（154 行，旧通道 sender 守卫）、`review-ipc-path.test.ts`（45 行，路径通道）、`review-ordinary-ipc-pending.p04.test.ts`（41 行）、`review-generalization.test.ts`（687 行，泛化合同）、`review-model-gateway.test.ts`（125 行，模型网关）。
- 跨批：`review-ipc-actor-guard.test.ts`（actor 覆盖）、`review-v3-main-*` 各 handler 测试。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 108 个 handler、1 个导出 | 已证实 | `grep -c "ipcMain.handle("` = 108；`grep -c "^export"` = 1 |
| 守卫矩阵计数 | 已证实 | 全文件 grep 计数（上表） |
| 双路径分流 15 处 | 已证实 | `isNativeWorkspaceCaseV3` 计数 |
| `DELETE_CASE` 实为软归档 | 已证实 | `:1351-1370`（`archiveReviewCaseV3`） |
| 读通道无 sender 守卫 | 已证实 | `:599-604`、`:709-715` |
| 各委托模块实现细节 | 未知 | 分散在各批手册；本文件只到调用点 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 分组 | 章节 | 状态 |
| --- | --- | --- |
| A 案卷/材料 19 通道 | 3.2A | covered |
| B V2 模板/运行 18 通道 | 3.2B | covered |
| C 工作台命令 16 通道 | 3.2C | covered |
| D T05/T06/T07/T09/T01/V3 15 通道 | 3.2D | covered |
| E 批次/政策 11 通道 | 3.2E | covered |
| F 材料登记 2 通道 | 3.2F | covered |
| G AI/旧通道 7 通道 | 3.2G | covered |
| H 设置 2 通道 | 3.2H | covered |
| 守卫矩阵 | 7 | covered |
| 失败/恢复 | 6 | covered |
| 测试证据 | 9 | covered |
