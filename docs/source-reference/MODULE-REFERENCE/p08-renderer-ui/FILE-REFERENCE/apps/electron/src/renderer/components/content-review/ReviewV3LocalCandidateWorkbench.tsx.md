---
path: apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7937a001bb35a9439bbc1836724d642274eef35
sha256: 606f641069b01f56ef6e42d35651e4b3edbdbb09a0217721f1a914004b17b823
lines: 463
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx

## 1. 结论与边界

「方案试跑」页（本地候选工作台）：以**本机原生案卷**为单位，完成「建案卷 → 导入原件 → 匹配/安装审核方案（D4 固定候选或自定义 B1 方案）→ 启动审核 → 导出报告」的整条手工链路（`apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx:23-462`）。

运行时 UI 组件，是多个既有 Main 能力的**编排层**：案卷存储、材料导入、B1 作者态、D4 固定候选、统一运行、T08 报告、Pi 账本都通过 `window.reviewAPI` 调用，本文件不实现其中任何一项。

明确不做的事：

- **不发布模板**。B1 冻结只写「本机候选」（`:187-192`）；注释明确「The saved B1 revision survives app restart; no school publication is implied」（`:1-4`）。
- **不建立第二套案卷/存储**。创建走 `createCase`（`:164-168`），导入走 `importDocument` / `registerMaterialPathV2`（`:207`、`:233-235`）。
- **不自行判定「已安装」**。`activePlan` 来自聚合的 `d2RuntimePlan` 或 D4 attach 回执（`:85-89`、`:106`）。
- **不代替 Main 做权限/身份判断**。无 sender/role 逻辑（见第 7 节）。

## 2. 导出与关键符号

顶层 `export` 仅 1 个函数；无导出类型。文件内声明较多，按职责列出关键项（全部为内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewV3LocalCandidateWorkbench` | 导出函数组件 | `:23` | `({initialCaseId}: {initialCaseId?: string} = {}): React.ReactElement` | 唯一导出；无 `initialCaseId` 时从空状态开始 |
| `caseTitle/caseApplicant/caseYear` | state | `:26-28` | `string` | 新建案卷三字段；默认「本地人工审核」/「本机用户」/当前年份 |
| `localCaseId` | state | `:29` | `string` | 当前本机案卷 ID，全页的主键 |
| `savedCases` | state | `:33` | `Array<{id; title}>` | 「列出本机历史案卷」的结果 |
| `d4Selection` | state | `:34` | `D4ClientSelection \| undefined` | `D4CaseSetup` 的受控值 |
| `routedD4TemplateId` | state | `:35` | `string \| undefined` | 材料路由建议/人工选择后传给 `D4CaseSetup` |
| `b1Frozen` | state | `:36` | `{templateId; fingerprint} \| null` | 已冻结的 B1 候选；非空才允许「应用到当前案卷」 |
| `materialsEpoch` | state | `:41` | `number` | 材料变更计数器，驱动重读 |
| `product` | state | `:42` | `C11MainLocalProductRead \| null` | 50+1 候选工作台数据 |
| `activePlan` | state | `:47-49` | `{templateId; templateVersion; checks; fingerprint} \| null` | 已安装方案 |
| `nativeAggregate` | state | `:50` | `CaseAggregateV2 \| null` | 原生聚合 |
| `nativeRun/nativeRunStale` | state | `:51-52` | `ReviewRunV2 \| null` / `boolean` | 最近运行与有效性；`stale` 默认 `true` |
| `productSeq` / `localCaseIdRef` | ref | `:44-46` | `number` / `string` | UI-03 异步绑定 |
| `readProduct` | useCallback | `:65-73` | `() => Promise<B32ProductRead>` | 重读产品路由 |
| `readLatest` | useCallback | `:129-134` | `(id: string) => Promise<B1CandidateReadResponse>` | 读 B1 最新修订并映射为客户端响应；**只接收 `templateId`，不接收/不转发 `expectedRevision`**（见 3.5） |
| `reopen` | async | `:135-149` | `() => Promise<void>` | 读取本机最新候选修订 |
| `createCase` | async | `:160-174` | `() => Promise<void>` | 建原生无绑定案卷 |
| `installD4` | async | `:175-186` | `() => Promise<void>` | 安装 D4 技术方案 |
| `freezeB1` | async | `:187-192` | `(document, expectedRevision) => Promise<{fingerprint}>` | 冻结 B1 候选 |
| `attachB1` | async | `:193-202` | `() => Promise<void>` | 把已冻结 B1 方案装到当前案卷 |
| `importMaterial` | async | `:203-217` | `(role: 'application'\|'evidence') => Promise<void>` | 系统文件选择器导入 |
| `dropMaterials` | async | `:218-245` | `(event: React.DragEvent<HTMLDivElement>) => Promise<void>` | 拖拽逐文件登记 |
| `exportLocalMd` | async | `:246-257` | `() => Promise<void>` | 导出本地 Markdown 报告 |
| `openCase` | async | `:258-268` | `() => Promise<void>` | 打开案卷办理页 |
| `start` | 同步 | `:269-272` | `() => void` | 新建候选编辑器 |

## 3. 内部逻辑与关键流程

### 3.1 初始化与「按案重读」（`:30-111`）

- `initialCaseId` 变化时写入 `localCaseId`（`:30-32`），父级传的是 `quickCaseId`（`ContentReviewView.tsx:410`）。
- **effect A（材料/聚合）**：依赖 `[localCaseId, materialsEpoch]`（`:96`）。
  1. `productSeq.current += 1`，清 `product/activePlan/productError/nativeAggregate`（`:75-77`）。
  2. 无 `localCaseId` 直接返回（`:78`）。
  3. `getAggregateV2(localCaseId)`；若聚合带 `d2RuntimePlan`，据此构造 `activePlan` 并**提前返回**，不再读产品路由（`:82-90`）。
  4. 否则 `readLocalNativeProductV3(localCaseId)` 写 `product`（`:91-92`）。
  5. 异常写 `productError`（`:93`）。
  6. 卸载时 `mounted=false`，晚到结果不写（`:79`、`:95`）。
- **effect B（运行）**：依赖 `[localCaseId, materialsEpoch, runEpoch]`（`:111`）。
  1. 清 `nativeRun`、把 `stale` 置 `true`（`:98`）。
  2. `listRunsV2(localCaseId)`，按 `startedAt` 字符串降序取第一条（`:102-103`）。
  3. 无运行或状态为 `queued`/`running` → 直接返回，`stale` 保持 `true`（`:106`）。
  4. 否则 `getWorkspaceRunValidityV2({caseId, runId})` 写 `stale`（`:107-108`）；异常时 `stale=true`（`:109`）。
- **effect C（路由建议）**：`product.read.route.status === 'default-selected'` 且 `chosen` 能在 `product.catalog` 中按 `templateId + templateVersion` 找到时，写 `routedD4TemplateId` 并提示「倒计时结束，已建议 …。请核对真实审核对象与条件，再固定 Plan。」（`:55-64`）。

### 3.2 新建/重开案卷（`:150-174`、`:258-268`）

- `listSavedCases`：`listCases()` 映射为 `{id,title}`，提示「已列出本地已保存案卷（含只读历史）」（`:150-159`）。
- `createCase`：固定 `type:'自定义审核'`、`reviewTemplate:null`（`:164-168`）；成功后 `setLocalCaseId(created.id)`、清空 `savedCases`、提示「本机原生案卷已创建：…；未绑定校方模板…」（`:169-171`）。
- `openCase`：`openAggregateV2(localCaseId)`，找不到抛「未找到该原生案卷…」（`:262-263`）；成功 `showCase(aggregate)` + `goToCase('case-v2')`（`:264-265`），即跳到「案卷办理」页。

### 3.3 材料导入（`:203-245`）

**选择器路径** `importMaterial(role)`：`importDocument({caseId, role})`（`:207`）。

- `imported.canceled` → 提示「已取消选择，没有导入原件」（`:208`）。
- 否则 `materialsEpoch+1`，提示成功/失败份数（`:210-211`）；失败明细拼成 `fileName: message`，截断 500 字符（`:212-213`）。

**拖拽路径** `dropMaterials(event)`：

- `preventDefault + stopPropagation`、清 `dropActive`（`:219-221`）。
- 无 `localCaseId` 或 `caseBusy` 时直接返回（`:222`）。
- 逐个文件：`window.electronAPI.getPathForFile(file)` 取本地路径，失败抛「无法读取系统拖拽文件路径」；然后 `registerMaterialPathV2({caseId, sourcePath, role: dropRole, fileName})`（`:229-236`）。
- 单个文件失败只记入 `errors`，不中断后续文件（`:237-239`）——**部分成功**语义。
- 有成功则 `materialsEpoch+1`（`:241`）；提示「拖入 N 份材料，成功 X 份，失败 Y 份；已记录到当前案卷」（`:242`）；错误拼接截断 800 字符（`:243`）。

### 3.4 方案安装（D4 / B1）（`:175-202`）

- `installD4`：需 `localCaseId && d4Selection`（`:176`）；`attachD4TechnicalPlanV3({caseId, d4})`；用回执写提示「已把「…」应用到当前案卷，固定 N 项检查」，`materialsEpoch+1`（`:179-183`）；失败走 `humanizeReviewError`（`:184`）——本文件唯一使用该函数的 D4 路径。
- `freezeB1`：`freezeLocalCandidateAuthorV3({document, expectedRevision})` → `setB1Frozen({templateId, fingerprint})`、提示「第51套已冻结，可绑定当前本机案卷。」（`:187-192`）。
- `attachB1`：需 `localCaseId && b1Frozen`（`:194`）；`attachB1TechnicalPlanV3({caseId, ...b1Frozen})`；提示「本案已安装 N 项真实 Pi 检查；可以启动审核」，`materialsEpoch+1`（`:197-199`）；失败用原始 message（`:200`）。

### 3.5 B1 作者态（`:124-149`、`:269-272`）

- `readLatest(id)` 调 `readCurrentAuthorRevisionV3({templateId:id})`，把 Main 的 `{templateId, revision, sourceDigest, document}` 映射成 `B1CandidateReadResponse`：`digest = sourceDigest`、`candidateStatus:'candidate-held'`、`schemaVersion:'review-b1-author-read/1'`（`:129-134`）。
- **`expectedRevision` 被丢弃（已证实）**：`ReviewV3AuthorWizard` 的 `onReadLatestCandidate` 类型是 `(templateId, expectedRevision) => Promise<...>`（`ReviewV3AuthorWizard.tsx:37`），但本文件两处传参都是 `(id) => readLatest(id)`（`:410`、`:460`），`readLatest` 自身签名只有 `id`（`:129`），调用 `readCurrentAuthorRevisionV3` 时也只传 `{templateId:id}`（`:130`）。因此这次读取**不携带 expectedRevision，不做版本/CAS 校验**；它拿到的是 Main 当前最新修订，调用方不能用它证明「读到的就是编辑器基线」。
- `reopen`：已有 `loaded` 时先 `window.confirm` 警告未保存修改（`:137`）；读取后 `setLoaded`、**清空 `b1Frozen`**（`:144`，注释说明「预览不是冻结候选」）、`setKey(k+1)` 强制重建编辑器、提示修订号（`:145-146`）。
- `start`：同样 confirm，然后清 `loaded`、`setKey(k+1)`、提示「本地未发布候选草稿」（`:269-272`）。**`start` 不清 `b1Frozen`**（`:269-272` 无 `setB1Frozen`）：新建空白候选后，先前冻结的 `{templateId,fingerprint}` 仍保留，而「把已保存的自定义方案应用到当前案卷」只要求 `b1Frozen` 非空且 `!activePlan`（`:357-360`），所以仍可把**上一个**冻结方案装到当前案卷。只有 `reopen` 会清空（`:144`）。这是源码实际行为，未找到注释说明其意图；按风险记录。

### 3.6 产品候选工作台（`:376-428`）

- 「从真实原件刷新 50+1 候选工作台」按钮调用 `readProduct()`，异常写 `productError`（`:380-383`）。
- `productError` 非空时显示「当前材料 Main 读取失败：…（未返回候选结果）」（`:377-379`）。
- `ReviewV3CandidateIntakeSurface` 以 `key={localCaseId + '-' + product.sessionKey}` 挂载（`:384-387`），传 `route/manualCatalog` 与四组回调：
  - `onRequestRefresh` → `readProduct()`（`:388`）；
  - `onInterrupt` → `interruptLocalNativeProductV3` 后 `setProduct`（`:389-392`）；
  - `onManualChoice` → `chooseLocalNativeProductTemplateV3({caseId, templateId, templateVersion})`；若案卷已切换则直接返回 ack（`:397`）；`ack.requiresPlanSetup` 为真时写 `routedD4TemplateId` 并提示去上方核对对象/场景，否则 `materialsEpoch+1`；最后 `await readProduct()`（`:393-404`）；
  - `author`：`onSaveDraft` → `saveLocalCandidateAuthorV3`、`onPreview` → `previewLocalCandidateAuthorV3`、`onFreezeCandidate` → `freezeB1`、`onReadLatestCandidate` → `readLatest`（`:405-411`）；这组 props 同时被**两处** AuthorWizard 使用（见下条）；
  - **同页两个 AuthorWizard 实例（已证实）**：本文件底部常驻一个 `<ReviewV3AuthorWizard key={key} initialDraft={loaded?.document ?? emptyB1AuthorDocument()} initialRevision={loaded?.revision ?? 0} ...>`（`:454-461`）；当 `product` 存在时，`ReviewV3CandidateIntakeSurface` 的 product 分支把 `renderAuthor` 交给 `ReviewV3ProductWorkspace`，后者在 `editor` 非空时再渲染一个 `ReviewV3AuthorWizard`，其 `key = scope + '::' + (draft?.templateId ?? 'blank')`、`initialRevision={0}`（`ReviewV3CandidateIntakeSurface.tsx:198-211`、`ReviewV3ProductWorkspace.tsx:108`、`:469-484`）。因此在产品候选工作台打开作者编辑器时，同页会同时存在两个实例：底部实例的状态源是 `loaded`/`key`，产品分支实例的状态源是 `scope`/`draft` 且修订号恒为 0。修改 `author` 回调必须同步这两条路径，否则两个编辑器行为不一致。
  - `product.onCreateBusinessTemplateDraft` → `createFallbackTemplateDraft({document, templateId})`，映射为 `{templateId, version, notes}`（`:418-425`）。

### 3.7 报告与复核入口（`:430-449`）

- `ReviewV3UnifiedRun`：`stage` 取 `nativeAggregate?.caseV2.stage ?? 'draft'`，`documentCount` 为未停用文档数，`technicalPlan={!!nativeAggregate?.d2RuntimePlan}`，`canRun={!!activePlan || !!nativeAggregate?.d2RuntimePlan}`，`onUpdated={refreshNativeAggregate}`（`:430-437`）。
- `refreshNativeAggregate`：重读聚合并 `runEpoch+1`（`:112-117`）。
- 有 `nativeRun` 才渲染 `ReviewV3T08ReportPanel`（`aggregate`、`currentRun`、`currentStale`、`template={null}`），否则提示「本案尚无真实运行…」（`:447-448`）。

### 3.8 渲染结构与重挂载键

| 区块 | 行 | 说明 |
| --- | --- | --- |
| 建案/导入区 | `:274-328` | 三个输入 + 创建按钮（三者非空才可点，`:284-286`）；案卷 ID 输入；列出历史；导入申请/证明；打开；导出 |
| 拖拽区 | `:302-319` | 仅 `localCaseId` 存在时渲染；`data-testid="review-v3-native-file-drop"` |
| 历史案卷下拉 | `:320-325` | `savedCases.length>0` 时渲染，选中即写 `localCaseId` |
| 路由助手 | `:329-336` | `localCaseId && !activePlan`；`onPlanInstalled` 写 `activePlan` 并 `materialsEpoch+1` |
| 已绑定计划卡 | `:337-342` | 显示 `templateId@version`、检查数、`fingerprint` |
| D4 方案选择 | `:343-353` | `localCaseId && !activePlan`；`D4CaseSetup` + 应用按钮（`disabled={caseBusy || !d4Selection}`） |
| 自定义方案区 | `:354-375` | 应用 B1（`disabled` 含 `!b1Frozen`、`!!activePlan`）；读取最新修订/新建候选 |
| 候选工作台 | `:376-428` | 见 3.6 |
| 人工事项 | `:429` | `ReviewV3LocalManualItem`，`key=localCaseId+'-'+materialsEpoch` |
| 统一运行 | `:430-437` | 见 3.7 |
| 报告/交付 | `:438-449` | 打开复核 + T08 面板 |
| Pi 高级账本 | `:450-453` | `<details>` 内 `ReviewV3LocalPiControls`，同 key 规则 |
| 作者向导（常驻） | `:454-461` | `key={key}`，`initialDraft`/`initialRevision` 来自 `loaded`；product 分支另有实例（见 3.6） |

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:409-411`：`section === 'local-candidates'` 时挂载，`initialCaseId={quickCaseId ?? undefined}`。
- 该 section 也可由 `ReviewV3CaseTaskView` 的「高级：自定义方案」进入（`ContentReviewView.tsx:438` → `setSection('local-candidates')`）。

**出向（IPC 全表）**

| 方法 | 本文件行 | preload | 用途 |
| --- | --- | --- | --- |
| `listCases` | `:154` | `preload/index.ts:4745` | 历史案卷 |
| `createCase` | `:164` | `:4748` | 建原生案卷 |
| `getAggregateV2` | `:82`、`:114`、`:250` | `:4874` | 读聚合 |
| `openAggregateV2` | `:262` | `:5080` | 打开办理 |
| `readLocalNativeProductV3` | `:69`、`:91` | `:4838` | 产品路由 |
| `interruptLocalNativeProductV3` | `:390` | `:4840` | 打断倒计时 |
| `chooseLocalNativeProductTemplateV3` | `:395` | `:4842` | 人工选方案 |
| `prepareLocalNativeUnmatchedV3` | `:414` | `:4844` | 未匹配→草稿 |
| `createFallbackTemplateDraft` | `:419` | `:4923` | 业务模板草稿 |
| `saveLocalCandidateAuthorV3` | `:407`、`:457` | `:4818` | 保存 B1 草稿 |
| `previewLocalCandidateAuthorV3` | `:408`、`:458` | `:4821` | 预览 B1 |
| `readCurrentAuthorRevisionV3` | `:130` | `:4812` | 读最新修订 |
| `freezeLocalCandidateAuthorV3` | `:188` | `:4824` | 冻结 B1 |
| `attachB1TechnicalPlanV3` | `:197` | `:4833` | 安装 B1 方案 |
| `attachD4TechnicalPlanV3` | `:179` | `:4829` | 安装 D4 方案 |
| `importDocument` | `:207` | `:4757` | 选择器导入 |
| `registerMaterialPathV2` | `:233` | `:5082` | 拖拽登记 |
| `listRunsV2` | `:102` | `:4802` | 运行列表 |
| `getWorkspaceRunValidityV2` | `:107` | `:4901` | 运行有效性 |
| `exportReportV2` | `:253` | `:4889` | 导出报告 |
| `window.electronAPI.getPathForFile` | `:231` | `preload/index.ts:3503-3505`（`webUtils.getPathForFile`） | 拖拽取真实路径 |

**子组件**：`ReviewV3TemplateRoutingAssistant`（`:329`，props `caseId/onPlanInstalled/onTemplateBound`）、`D4CaseSetup`（`:346`，`onChange/suggestedTemplateId`）、`ReviewV3LocalManualItem`（`:429`，`caseId`）、`ReviewV3UnifiedRun`（`:430`）、`ReviewV3T08ReportPanel`（`:447`）、`ReviewV3LocalPiControls`（`:452`）、`ReviewV3AuthorWizard`（`:454`）、`ReviewV3CandidateIntakeSurface`（`:384`）。

## 5. 数据 I/O、读写与副作用

- **读**：聚合、运行、产品路由、模板目录（经子组件）、B1 修订、案卷列表。
- **写（Main 持久化）**：`createCase`、`importDocument`/`registerMaterialPathV2`、`attachD4TechnicalPlanV3`、`attachB1TechnicalPlanV3`、`saveLocalCandidateAuthorV3`、`freezeLocalCandidateAuthorV3`、`exportReportV2`（写报告文件）、`chooseLocalNativeProductTemplateV3`（记录技术选择）、`createFallbackTemplateDraft`。
- **无** localStorage / 剪贴板 / 全局监听 / 定时器（倒计时在子组件）。
- **副作用**：系统文件选择器（`importDocument` 由 Main 弹出）、`window.confirm` 两次（`:137`、`:270`）、`goToCase` 切换全局 section（`:265`）。
- **幂等/并发**：
  - `productSeq` + `localCaseIdRef` 保证旧案产品响应不写入（`:68-70`）；
  - `mounted` 标志保护聚合读取（`:79`、`:95`）；
  - `caseBusy` 作为大部分按钮的互斥（`:176`、`:194`、`:204`、`:222`、`:247`、`:259`）；
  - `materialsEpoch` 是**手动失效计数器**：导入/安装/刷新后自增以触发 effect A/B 重读；
  - **重复读取**：`localCaseId && !activePlan` 时本文件同时挂载 `ReviewV3TemplateRoutingAssistant`（`:329-336`），该子组件自己的 effect 在挂载/`caseId`/`epoch` 变化时也执行 `getAggregateV2` + `readLocalNativeProductV3`（`ReviewV3TemplateRoutingAssistant.tsx:51`、`:60`、`:66-74`）。因此同一案卷在无已安装计划时会被本文件 effect A 与路由助手各读一遍，两处各自写自己的 state、不共享结果；这不是缓存复用。
- **部分失败**：拖拽逐文件独立 try/catch，部分成功仍推进 epoch（`:229-243`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无案卷 ID 调 `readProduct` | `:67` | 抛「请先创建或选择本机案卷」 |
| 旧案产品响应晚到 | `:70` | 返回数据但**不写 state** |
| 聚合读取失败 | `:93` | `productError` 上屏；`nativeAggregate` 保持 null |
| 运行列表读取失败 | `:109` | `nativeRunStale=true` |
| 最近运行为 `queued/running` | `:106` | 不查有效性，`stale` 保持 `true` |
| 创建案卷失败 | `:172` | `caseError` 上屏 |
| 导入被取消 | `:208` | 仅提示，不推进 epoch |
| 导入部分失败 | `:210-213` | 成功数与失败明细同时显示 |
| 拖拽无路径 | `:232` | 该文件记错误，继续下一个 |
| 安装 D4 失败 | `:184` | `humanizeReviewError` |
| 安装 B1 失败 | `:200` | 原始 message |
| 冻结 B1 失败 | `:190-191` | 异常向上抛给向导/调用方（本文件未 catch） |
| 切换作者修订时未保存 | `:137` | `confirm`，取消则 return |
| 新建候选时未保存 | `:270` | 同上 |
| 新建候选（`start`） | `:269-272` | 清 `loaded`、`setKey+1`、清 `error`、写提示；**不清 `b1Frozen`**，旧冻结方案仍可被「应用到当前案卷」（`:357-360`） |
| 读取最新修订（`reopen`） | `:135-149` | 清 `b1Frozen`（`:144`）；读取不带 `expectedRevision`（`:129-134`） |
| 导出前案卷已变 | `:251-252` | 抛「案卷不存在；请重新读取当前原生案卷」 |
| 打开案卷失败 | `:263` | 抛「未找到该原生案卷…」 |

**恢复**：`localCaseId` 不持久化，重进页面需重新输入/选择；`activePlan` 与 `nativeRun` 都从 Main 重读（`:82-90`、`:102-108`），因此「已安装/已运行」可恢复。`b1Frozen`、`loaded`、`notice/error` 为易失状态。

**`b1Frozen` 的清理边界（已证实）**：`reopen` 清空（`:144`，注释「预览不是冻结候选」），`start` **不清**（`:269-272`）。因此两条路径不对称：重开修订后必须重新冻结，新建空白候选却仍保留旧冻结并可安装。`start` 的行为未在源码注释中说明意图，按风险记录；若视为缺陷，应在 `start` 同步 `setB1Frozen(null)`（本批不改源码）。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查，无直接 `ipcRenderer`；全部经 preload 白名单方法。
- 权限与权威在 Main：
  - `createCase`/`importDocument`/`registerMaterialPathV2`/`attach*` 等写通道由 Main 的审核 IPC 层校验（例如 `registerMaterialPathV2` 先 `assertC0ReviewMainSender(_e)`，`review-ipc.ts:1285-1286`）；
  - 「方案是否可安装」由 Main 的 D4/B1 计划安装器决定（本文件只展示回执）；
  - 「运行是否有效」由 `getWorkspaceRunValidityV2` 决定（`:107`）。
- 前端门禁：按钮 `disabled` 条件（`:284-286`、`:292-300`、`:347-350`、`:357-360`、`:369-370`、`:444-445`）与 `caseBusy`；这些是可用性约束，不是授权。

## 8. 修改影响面

- **唯一挂载点**：`ContentReviewView.tsx:409-411`；`initialCaseId` 来源是 `quickCaseId`。
- **`materialsEpoch` 语义**：effect A/B 与**两个**子组件的 `key` 依赖它——effect A/B 依赖数组（`:96`、`:111`），子组件重挂载键是 `ReviewV3LocalManualItem`（`:429`）与 `ReviewV3LocalPiControls`（`:452`）（全文件其余 `key=` 是 `:324` 的下拉选项 `c.id`、`:385` 的 `localCaseId+product.sessionKey`、`:454` 的 AuthorWizard `key` 状态，均不依赖 `materialsEpoch`）；改变自增时机会导致「导入后仍显示旧材料」或「子组件状态被意外重置」。
- **`localCaseId` 语义**：全页唯一主键；任何写操作都带它。改名为 `caseId` 会牵动约 20 处调用与子组件 props。
- **`activePlan` 门禁**：`!activePlan` 控制路由助手与 D4 选择区的显示（`:329`、`:343`），`!!activePlan` 控制 B1 安装按钮禁用（`:358`）；两者必须同步，否则会出现「已安装仍可再装」。
- **`readLatest` 的字段映射与版本语义**：`sourceDigest → digest`（`:132`）是 Main 与客户端响应形状的适配层；Main 改字段名会静默产生 `undefined` digest。**`expectedRevision` 未转发**：AuthorWizard 传入的第二参数（`ReviewV3AuthorWizard.tsx:37`）在本文件被丢弃（`:410`、`:460`），所以该读取没有 CAS/版本校验语义；若 Main 之后把 `readCurrentAuthorRevisionV3` 的 `expectedRevision` 设为必填或行为改变，这里会静默退化。
- **两个 AuthorWizard 实例**：底部常驻实例（`:454-461`）与产品分支实例（`ReviewV3CandidateIntakeSurface.tsx:198-211`）共用同一组 `author` props；改 `onSaveDraft`/`onPreview`/`onFreezeCandidate`/`onReadLatestCandidate` 的签名或语义必须同时考虑两者（两者 `key`/`initialRevision` 不同）。
- **`b1Frozen` 生命周期**：`freezeB1` 设置（`:187-192`）、`reopen` 清空（`:144`）、`start` **不清**（`:269-272`）；安装按钮只校验非空与 `!activePlan`（`:357-360`）。
- **子组件契约**：`ReviewV3CandidateIntakeSurface` 的 `author/product` 回调形状（`:405-426`）、`ReviewV3T08ReportPanel` 的 `template={null}`（`:447`，即不传模板）、`ReviewV3UnifiedRun` 的 `canRun` 口径（`:435`）。
- **测试同步**：无直接测试；相关 Main 侧测试见第 9 节。
- 无存储格式迁移；B1 文档 schema 由 `emptyB1AuthorDocument()` 决定（`ReviewV3AuthorWizard.tsx:43-53`），不在本文件。

## 9. 测试证据

- **直接测试**：无。`grep -rln "ReviewV3LocalCandidateWorkbench" apps/electron/src --include=*.test.*` 无命中。
- **间接（只读断言，未运行）**：
  - `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts`：覆盖 D4 安装的 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 等拒绝分支，本文件 `:184` 经 `humanizeReviewError` 展示。
  - `review-intake-routing-adapter-v3-b3.test.ts:43`：`route.status === 'default-selected'`，对应本文件 `:57` 的建议条件。
  - B1 作者链的 Main 测试（`review-template-plan-adapter-v3-b1` 相关）本批未读，**未知**其断言。
- **未覆盖**：建案/导入/拖拽部分成功、`materialsEpoch` 触发链、运行排序与 `queued/running` 短路、`openCase` 跳转、导出前案卷校验、`reopen` 清空 `b1Frozen`、`start` 保留 `b1Frozen`、`expectedRevision` 丢弃、同页双 AuthorWizard、`confirm` 分支。
- **NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出，`initialCaseId` 可选 | 已证实 | `:23` |
| `activePlan` 优先来自聚合 `d2RuntimePlan`，有则不再读产品路由 | 已证实 | `:85-90` |
| `productSeq` + `localCaseIdRef` 丢弃旧案响应（UI-03） | 已证实 | `:43-46`、`:68-70` |
| 拖拽逐文件登记、部分成功仍推进 epoch | 已证实 | `:229-243` |
| 导入取消不推进 epoch | 已证实 | `:208-209` |
| 最近运行按 `startedAt` 字符串降序取首条 | 已证实 | `:103` |
| `queued/running` 时不查有效性、`stale` 保持 `true` | 已证实 | `:106`、`:98` |
| `reopen` 会清空 `b1Frozen` | 已证实 | `:144` |
| `start` 不清 `b1Frozen`，旧冻结方案仍可被安装 | 已证实 | `:269-272`（无 `setB1Frozen`）、`:357-360`（按钮只校验非空与 `!activePlan`） |
| `readLatest` 丢弃 `expectedRevision`，读取无版本校验 | 已证实 | `ReviewV3AuthorWizard.tsx:37` 类型两参；本文件 `:410`、`:460` 只传 id；`:129-134` 只传 `templateId` |
| product 分支打开编辑器时同页存在两个 AuthorWizard | 已证实 | 本文件 `:454-461`；`ReviewV3CandidateIntakeSurface.tsx:198-211`；`ReviewV3ProductWorkspace.tsx:108`、`:469-484` |
| 路由助手与本文件 effect A 对同一案卷重复读取 | 已证实 | `:329-336`；`ReviewV3TemplateRoutingAssistant.tsx:51`、`:60`、`:66-74` |
| 冻结只写本机候选、不代表发布 | 已证实 | `:1-4`、`:187-192` |
| 导出前校验聚合 ID | 已证实 | `:250-252` |
| `ReviewV3T08ReportPanel` 不传模板（`template={null}`） | 已证实 | `:447` |
| `startedAt` 非 ISO 时排序可能不符合时间序 | 推断 | `:103` 用 `localeCompare` 字符串比较，未解析时间 |
| 冻结后未安装就重开修订需重新冻结，且无显式提示 | 推断 | `:144` 清空；UI 只显示「请先在下方保存并冻结模板」（`:361`） |
| Main 侧 B1 冻结/安装的完整校验集合 | 未知 | 本批未读 `review-template-plan-adapter-v3-b1` 实现 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出与 props | 2 | `:23` | covered |
| effect A 聚合/产品重读 | 3.1 | `:74-96` | covered |
| effect B 运行与有效性 | 3.1 | `:97-111` | covered |
| effect C 路由建议 | 3.1 | `:55-64` | covered |
| `listSavedCases`/`createCase`/`openCase` | 3.2 | `:150-174`、`:258-268` | covered |
| `importMaterial` | 3.3 | `:203-217` | covered |
| `dropMaterials` | 3.3 | `:218-245` | covered |
| `installD4`/`freezeB1`/`attachB1` | 3.4 | `:175-202` | covered |
| `readLatest`/`reopen`/`start` | 3.5 | `:129-149`、`:269-272` | covered |
| 候选工作台回调 | 3.6 | `:376-428` | covered |
| 统一运行与报告 | 3.7 | `:430-449` | covered |
| 渲染结构与 key | 3.8 | `:273-461` | covered |
| 调用者/出向 IPC | 4 | — | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | partial |
| Main B1 校验细节 | 10 | — | unknown |
