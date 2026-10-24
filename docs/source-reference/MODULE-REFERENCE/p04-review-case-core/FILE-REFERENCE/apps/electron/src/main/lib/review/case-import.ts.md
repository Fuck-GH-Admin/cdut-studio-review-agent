---
path: apps/electron/src/main/lib/review/case-import.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 29b68fdc5e73db70453489942d7dec59f0c46097
sha256: 5ebdfb4f085e87b7c1fd26b8b7fed56e3eade5b08e9cdf8eaa846a7b1827bb1c
lines: 406
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-import.ts

## 1. 结论与边界

案卷材料导入/移除/排序/依据确认（IPC `IMPORT_DOCUMENT*` 等的**旧版（非原生 V3）实现**）：系统选择框→复制原件进案卷目录→解析为 `SourceDocument`→写回案卷（`apps/electron/src/main/lib/review/case-import.ts:1-7`）。文件头安全边界：文件读取与保存只在主进程，渲染进程只拿解析结果、不接触原始路径（`:6`）。

明确不做的事：

- **不是原生 V3 案卷的路径**：IPC 层对 `isNativeWorkspaceCaseV3` 案卷改走 `registerNativeWorkspaceMaterialV3`/`removeNativeWorkspaceDocumentsV3`/`reorderNativeWorkspaceDocumentsV3`，且 `CONFIRM_RULE_PACK` 对原生案卷直接拒绝（`review-ipc.ts:386-388`「NATIVE_RULE_CONFIRMATION_REQUIRED」）。
- **不删原件**：移除只把材料移出当前审核输入，原件与 `archivedDocuments` 保留（`:301`、`:322-328`）。
- **PDF 图像只保留前 24 页**（`:38`、`:84-89`），截断如实写警告。

## 2. 导出与关键符号

`export` 共 **6 个**（全为异步函数）。

| 符号 | 行 | 签名要点 | 说明 |
| --- | --- | --- | --- |
| `renderPdfImageBlocks` | `:41-124` | `{filePath,fileName,documentId,assetDir,assetDirectoryPrefix?,onProgress?}` → `{blocks, warnings}` | PDF 图像页→image 块 |
| `importDocumentsIntoCase` | `:130-200` | `{caseId,role,parentWindow?,requestId?,onProgress?}` → `ImportDocumentsResult` | 多选框批量导入 |
| `importDocumentFromPath` | `:203-299` | `{caseId,sourcePath,role,requestId?,onProgress?,fileIndex?,fileCount?}` → `SourceDocument` | 单文件导入链 |
| `removeDocumentsFromCase` | `:302-351` | `{caseId,role,documentIds?}` → `ReviewCase` | 移出当前输入 |
| `reorderDocumentsInCase` | `:354-393` | `{caseId,role,documentIds}` → `ReviewCase` | 同栏重排 |
| `confirmRulePackInCase` | `:396-406` | `(caseId, rulePackId)` → `ReviewCase` | 确认依据包 |

内部常量：`MAX_IMPORT_BYTES = 50MB`（`:20`）、`MAX_PDF_PAGE_IMAGES = 24`（`:38`）；`emitImportProgress`（`:23-29`，无 `requestId` 时静默）。

## 3. 内部逻辑与关键流程

### 3.1 `renderPdfImageBlocks`（`:41-124`）

动态 `import('pdfjs-dist/legacy/build/pdf.mjs')`（`:49`），worker 由 `require.resolve` 指定（`:58`）；`isEvalSupported:false`（`:59`）。两阶段：① 全页扫描算子表（`scanning-pdf`），收集含图像算子的页（`:70-75`）；② 对前 24 个图像页调 `renderAuthorizedPreview`（`rendering-pdf`）截图（`:90-100`），写 PNG 进 `assetDir` 并产 `{kind:'image', imageAssetPath}` 块（`:111-121`）。

**截断**（`:85-89`）：超出 24 页写警告「PDF 含图像页 N 页…仅保留前 24 页图像；其余页需查看原件核对」。**单页失败即 break**（`:101-108`）：注释说明隐藏 renderer 每次失败等满 30 秒超时，继续循环会拖死登记；警告写「已停止后续页图像提取」。

### 3.2 `importDocumentsIntoCase`（`:130-200`）

`assertSafeId(caseId)`（`:138`）→ `getCase` 不存在抛「案卷不存在」（`:139-140`）→ 爗口选择（`parentWindow` 或焦点/可见窗，`:142-144`）→ `dialog.showOpenDialog`（多选；无窗口退化无父对话框，`:167-169`）→ 取消返回 `{documents:[],failures:[],canceled:true}`（`:170-173`）→ **逐份循环**调 `importDocumentFromPath`，单份失败记 `failures` 并继续（`:177-197`）——注释明示「单份失败不会撤销已经成功登记的其他文件」（`:128-129`）。

### 3.3 `importDocumentFromPath`（`:203-299`）——共用导入链

1. `assertSafeId` + `getCase` 存在性（`:212-214`）。
2. **体积上限**（`:226-229`）：`statSync` 超 50MB 抛「文件过大…」。
3. **复制原件**（`:232-236`）：`docId = doc-${Date.now()}-${rand6}`；`assetDir = getReviewCasesDir()/caseId/source-docs`（显式 mkdir）；存名 `${docId}-${fileName}`；相对路径统一正斜杠 `source-docs/…`（`:238-239`）。
4. **解析**（`:242-243`）：`parseFileIntoSourceDocument(filePath, fileName, role, assetRelativePath, assetDir)`。
5. **规则包自动登记**（`:246-261`）：仅 `role==='rule'` 时构造新 `RulePack`（`confirmed:false`、`publisher:''`、名称取文件名去扩展名）。
6. **写回**（`:265-285`）：`updateCase` 队列内以**最新案卷**为基底追加（注释：选择框打开期间案卷可能已变化，`:263-264`）；同时 `invalidateDerivedReviewInputs`（`applicationMaterialsChanged: role==='application'`）、`subjectDocumentIds` 追加去重、`rulePacks` 追加、evidence 角色登记「已收录、待识别」证明卡（`:276-282`）。
7. `syncWorkspaceProjectionV2`（`:286`）+ 完成事件 + `console.log`。

### 3.4 `removeDocumentsFromCase`（`:302-351`）

参数校验（`documentIds` 类型/重复，`:308-312`）→ `updateCase` 内：按 role+id 筛出 `removed`（无 id 则整栏），空则抛「当前案卷中没有可移除的对应材料」（`:316`），指定 id 但不全命中抛「部分材料不存在或材料类型不匹配」（`:317`）→ 按角色联动清理：`application` 删锚定该文档的 items 并过滤 `subjectDocumentIds`；`rule` 删对应 rulePacks；`evidence` 清 items 的 `evidenceDocumentIds` 与 evidences 的 `linkedItemIds`（`:320-346`）；removed 进 `archivedDocuments`（`:322-323`）。

### 3.5 `reorderDocumentsInCase`（`:354-393`）

校验无重复（`:363`）、必须**恰好覆盖**当前栏全部文件（`:366-369`）→ 按 `documentIds` 顺序回填同栏位置（`:371-373`）；rule/evidence/application 三栏联动排序（rulePacks/evidences/items/subjectDocumentIds，`:377-388`）。

### 3.6 `confirmRulePackInCase`（`:396-406`）

`getCase` 存在 + `rulePackId` 存在（`:397-399`）→ `updateCase` 置 `confirmed:true`（`:400-403`）→ `syncWorkspaceProjectionV2`。

## 4. 调用者与调用链

| 函数 | 调用者 |
| --- | --- |
| `importDocumentsIntoCase` | `review-ipc.ts:428`（`IMPORT_DOCUMENTS` handler，原生案卷改走 `registerNativeWorkspaceMaterialV3`，`review-ipc.ts:412-418`） |
| `importDocumentFromPath` | `review-ipc.ts:456`（`IMPORT_DOCUMENT_FROM_PATH`，**仅开发版**：`app.isPackaged` 即抛「路径直导仅在开发版可用」，`:444`）；`review-actions-controller.ts`（4 处）；`pi-review-ops-tools.ts`（2 处）；`ReviewMaterialControls.tsx`、`LeftPanel.tsx`、`preload/index.ts`；`single-case-workspace.e2e.test.ts`（5 处） |
| `removeDocumentsFromCase` | `review-ipc.ts:522`（`REMOVE_DOCUMENTS`，原生案卷改走 `removeNativeWorkspaceDocumentsV3`） |
| `reorderDocumentsInCase` | `review-ipc.ts:544`（`REORDER_DOCUMENTS`，同上） |
| `confirmRulePackInCase` | `review-ipc.ts:391-392`（`CONFIRM_RULE_PACK`，原生案卷拒绝） |
| `renderPdfImageBlocks` | `material-service.ts:170-171`（PDF 材料注册时渲染图像块） |

测试：`workspace-service-v2.test.ts`（remove/reorder）、`single-case-workspace.e2e.test.ts`（import/confirm）。出向：`case-store`（`getCase/saveCase/updateCase/assertSafeId/getReviewCasesDir`）、`document-service.parseFileIntoSourceDocument`、`input-invalidation.invalidateDerivedReviewInputs`、`workspace-service-v2.syncWorkspaceProjectionV2`、`preview-inspection-service.renderAuthorizedPreview`（动态）。

## 5. 数据 I/O、读写与副作用

- **文件系统**：读原件（`statSync`/`readFileSync`/`copyFileSync`）、写原件副本与 PNG 资产（`writeFileSync`）、`mkdirSync`。
- **案卷写**：`updateCase`（导入/移除/排序/确认各一次）；每步后 `syncWorkspaceProjectionV2`。
- **UI**：`dialog.showOpenDialog`；进度事件 `IMPORT_DOCUMENT_PROGRESS`（由 IPC 层转发，`review-ipc.ts:436`）。
- **副作用**：`console.log`/`console.warn`。
- **并发**：`updateCase` 队列内串行读最新再改（`:263-264` 注释）。
- **幂等**：导入不幂等（每次新 `docId`）；移除/排序/确认幂等语义由 `updateCase` 提供。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 案卷不存在 | `:140`、`:214`、`:398` | 抛 |
| 超 50MB | `:227-229` | 抛「文件过大…」 |
| 取消选择 | `:170-173` | `canceled:true`，空结果 |
| 单份失败 | `:192-196` | 记 `failures`，继续其余 |
| PDF 单页截图失败 | `:101-108` | break + 警告 |
| PDF 图像超 24 页 | `:85-89` | 截断 + 警告 |
| 移除无匹配 | `:316-317` | 抛 |
| 排序未覆盖全栏 | `:367-369` | 抛「材料顺序必须包含当前栏的全部文件」 |
| `documentIds` 含重复 | `:312`、`:363` | 抛 |

**恢复**：导入失败的文件不留残件（复制发生在解析前，但失败后不写回案卷——原件副本仍留在 `source-docs`，`:236` 与 `:243` 之间无清理，**推断**残留副本可能滞留）。移除可逆（`archivedDocuments` 保留）。

## 7. 权限与权威状态

- IPC 层参数校验（`requireString`、`SOURCE_ROLES` 白名单）；本文件只 `assertSafeId`。
- `confirmRulePackInCase` 对原生 V3 案卷在 IPC 层被拒（`:386-388`），旧版案卷才允许「审核员确认依据」。
- 无 actor 校验；`updateCase` 的 `reason` 供审计（`:284`、`:348`、`:390`、`:403`）。

## 8. 修改影响面

- 导入链被 IPC 双路径与 `pi-review-ops-tools`/渲染层拖拽共用；改签名影响 6+ 调用点。
- `MAX_PDF_PAGE_IMAGES` 与 DOCX 内嵌图片 24 张上限对齐（`:33-35` 注释）；改动影响登记耗时与警告文案。
- `updateCase` 回调的联动清理（三角色）是移除语义核心；漏改会产生悬挂 `evidenceDocumentIds`/`subjectDocumentIds`。
- 无存储格式迁移；`RulePack`/`SourceDocument` 形状由 `@profer/shared` 决定。

## 9. 测试证据

- **直接**：`workspace-service-v2.test.ts`（remove/reorder 各 2 处引用）、`single-case-workspace.e2e.test.ts`（`importDocumentFromPath` 5 处、`confirmRulePackInCase` 2 处）——均非本批，未逐行读断言。
- `review-storage-id.test.ts:91-99` 侧面覆盖 `assertPiReviewDirectory`/`exportCaseReport` 的 ID 边界（非本文件）。
- **未覆盖**：PDF 图像截断/失败 break、50MB 上限、三角色联动清理细则。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出 | 已证实 | `:41`、`:130`、`:203`、`:302`、`:354`、`:396` |
| 50MB 上限、24 页上限、失败 break | 已证实 | `:20`、`:38`、`:85-89`、`:101-108` |
| 单份失败不撤销已成功登记 | 已证实 | `:177-197` 控制流 |
| 旧版路径 vs 原生 V3 双路径分流 | 已证实 | `review-ipc.ts:386-388`、`:412-418`、`:513-518` |
| `IMPORT_DOCUMENT_FROM_PATH` 仅开发版 | 已证实 | `review-ipc.ts:444` |
| 解析失败后原件副本是否滞留 `source-docs` | 推断 | `:236` 先复制、`:243` 解析可抛、无清理逻辑；未运行复现 |
| 相关测试通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 个导出 | 2 | — | covered |
| `renderPdfImageBlocks` | 3.1 | `:41-124` | covered |
| 批量导入 | 3.2 | `:130-200` | covered |
| 单文件导入链 | 3.3 | `:203-299` | covered |
| 移除/排序/确认 | 3.4-3.6 | `:302-406` | covered |
| IPC 双路径 | 4 | `review-ipc.ts` 各行 | covered |
| I/O 与副作用 | 5 | — | covered |
| 失败分支 | 6 | — | covered |
| 测试证据 | 9 | — | covered（间接） |
