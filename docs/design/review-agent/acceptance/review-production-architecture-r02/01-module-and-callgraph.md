# 01｜模块与真实调用链（独立静态审计 r02）

审计日：2026-10-19。**只读生产代码与测试定义；未在本轮执行 Electron/Bun/Provider。**结论以固定源码 SHA 为准：
- main: `8989941b6fb5651564e32d11c4215b6a6d5a5209`
- D4 W1 审阅快照：`f77441cee6771090c0fac05a7643372922975157`（#129；分支持续前进，非最新验收）
- P06 L02-01 R03：`db0284879f75ce123b5d83cb6577a3cc7ad057da`（#132）
- D4 统一候选：`b68443b23293b4714e61a3b81383d3d3a56434fc`（#97）
- D4 首次客户闭环：`b5a1bde69b04832a3ce5625b9577a8b50e626f13`（#100）

**第一轮资产异常**：上述固定分支的已列目录未发现名称对应“全分支资产总账、提交血缘报告”的正式文件，亦没有本次委托给出的第一轮具体路径/SHA。故本报告不能宣称已完整复核第一轮全量分支。以下为独立第二轮源码抽样和已核实 PR 固定节点；完整血缘与遗漏须第三轮补录后复核。

## A｜案卷入口与写入流

1. 普通建案：Renderer `CreateCaseDialog.tsx:121` → `use-review-actions.ts` → preload `window.reviewAPI.createCase` → Main `review-ipc.ts:186-228` → `case-creation.ts:19-46` → `case-store.ts:181` 写 `review-cases/<id>/case.json` → `workspace-service-v2.ts:155-164` → `migration.ts:132-176` 首次写 `case.v2.json`（兼容快照）→ `case-store-v2.ts:165` 写 `state.v2.json` 聚合。
2. 普通编辑：`review-ipc.ts:233-328,329-412` 更新 V1；`workspace-service-v2.ts:166-218` 按指纹/expectedRevision 投影当前字段、Subject、材料、规则进 V2 聚合。V1 同案有串行更新及 revision：`case-store.ts:234-254`。
3. D4 建案：Renderer `CreateCaseDialog.tsx:67-121` → `CREATE_CASE` 内 `d4` 分支 `review-ipc.ts:199-203` → `review-d4-client.ts:41-131` → `review-d2-runtime.ts:402-446` `createD2TechnicalCase`，先创建 V2 aggregate 和固定 D2 plan → `review-d4-client.ts:88-95` **再写 V1 case.json** 并 `ensureWorkspaceAggregateV2` → `importDocumentFromPath` 写 V1 原件/解析 → V2 投影。D4 不是 V2 原生单写。
4. V2 原生建案：`V2CasePanel.tsx:145-159` → `review-ipc.ts:594-600` → `application-service.ts:91` → `case-store-v2.ts:createAggregate`。然而旧三栏工作台的选择/投影仍依赖 `getCase`；故“V2 原生建案”不等于旧三栏已能完整原生打开、编辑、重开。
5. 重要存储身份：V1 `case.json` 与 `runs/*.json`（`case-store.ts:324-340`）；迁移兼容 `case.v2.json`（`migration.ts:151-186`）；权威 V2 业务事务文件 `state.v2.json`（`case-store-v2.ts:21-81`）；V2 执行 `runs-v2/<runId>.json` 与不可变节点产物（`run-store-v2.ts:23-97`）。三种案卷状态文件不能混作一个权威状态。

## B｜模板→计划→案卷

D1 `review-authoring-v1.ts:56-136` 校验作者态及 D3 锁，`204-286` 只对可映射部分编译；D3 `review-d3-module-library.ts:92-130,165-245` 冻结模块与依赖 digest，`review-d3-workspace-locks.ts:17-76` 检查锁；D4 catalog `review-d4-catalog.ts:53-96` 核对 50 项索引/内容；D2 `review-d2-runtime.ts:137-311` 编译明确的对象/场景为 `D2RuntimePlan`；`358-392` 通过原 `submitCommand` 固定快照到 aggregate 的 `d2RuntimePlan`、subjects、reviewRules；`475-525` 校验 Pi 成果与固定映射/来源。**没有第二套模板审核执行器。**候选壳 `review-d2-runtime.ts:51-82` 的 `fields=[]`、`materialSlots=[]`、`sections=[]` 是刻意防止偷渡正式制度，但它不等于完整业务表单，不能从作者态自动推断正式校规。

D4 W1 来源链：Main OS 选件/单次 token `review-d4-intake.ts:42-170` → `review-d4-intake-roles.ts:8-19` 角色 → `review-d4-client.ts:58-125` 导入、原件哈希、遗漏警告 → `document-service.ts:269-326` 解析 → `workspace-service-v2.ts:166-218` 投影。后续字段表单 `review-d4-field-form.ts:62-94` 仍写 **V1** 快照，同时 `124-181` 单独校验 D4 的 Subject/SourceRef/EvidenceLink 范围；是合理的业务范围守卫但需要单写改造。

## C｜三条实际 Run 入口（并非一条）

- **V1 演示/兼容**：`review-ipc.ts:900-914` → `run-service.ts:61-136` → V1 `saveRun`；可能无模型渠道时 `mock-engine`，不可与真实审核完成等同。
- **V2 独立运行图**：`RUN_REVIEW_V2` / `RUN_BATCH_V2` `review-ipc.ts:635-665`（P06 SHA；D4 SHA 在 `700-715`）→ `run-async-service.ts:73-90` → `v2-executor-factory.ts` → `run-service-v2.ts:96-232` → `review-run-graph.ts:129` → `run-store-v2`。
- **现有普通 Pi 直接审核**：`PREPARE_PI_REVIEW_V2` `review-ipc.ts:666-681` → `pi-case-review-service.ts:448-523` 初始化同一种 `ReviewRunV2`、assignment → `agent-orchestrator.ts:1315-1337,1562` 装载专用五工具 → `pi-case-review-service.ts:841-1035` 校验源引用/提交 → `finishPiReviewRunV2`。
- **P06 后台 Pi** **不是第四套业务审核引擎**：Main `START_BACKGROUND_PI_REVIEW_V2` `review-ipc.ts:690-703` → `review-pi-run-bridge.ts:23-81` 创建/复用 `owner.kind='review-case'` 的 session → 仍调用 `preparePiReviewRunV2` + 同一 Pi session/runtime；Stop 经 `review-pi-run-bridge.ts:84-104`、`stopAgentAndWait`、binding 校验。

## D｜批次与出站

P06 `RUN_BATCH_V2` → `batch-store.ts:576-607` 逐案调度 `assembleAndRunReview` → `batch-template-lock.ts:4-35` 审核前后模板/Run 版本锁 → `batch-automation-service.ts:29-110` 在满足条件时复用单案决定事务 → `batch-group-action-service.ts:174-267` 定向批量分组，**提交前每案重读 revision、runId、input hash 和最新作用域** → `workspace-business-service-v2.ts:94-316` 写单案事务。批次 `batch-store.ts:236-318` 终态/重开；`320-498` Outbox 负责学校端出站幂等与恢复。D4 `review-d4-case-batch.ts:41-252` 则是**同一案卷的多原件导入批次**，不是多案审核队列。

## E｜Renderer 与原件

`ContentReviewView.tsx:140,245-261` 仍将 `case-v2` 文案及 `V2CasePanel` 独立挂载，并且 Batch 的 `onOpenProject` 先 `openAggregateV2`、再切至 case-v2；`TemplateWizardPanel.tsx:342` 还通过 `setWorkspaceSection('case-v2')` 跳转，不能只删页签文字。`CenterPanel.tsx:80-105,282-322` 已读取统一 V2 聚合和 D2 plan，同时保留 V1 `reviewCase`。`BatchPanel.tsx:83-85` 同时读取 `listCasesV2/listCases`，说明 UI 仍依赖双索引。原件/Office/PDF/图像需分别核对 `document-service.ts`、`material-service.ts`、`document-preview-path.ts`、`file-preview-service.ts`、`document-parse-tools.ts` 以及 Office #71，在真实 Electron 中尚未通过本轮验证。

## 复现索引

源码固定链接根：`https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/<上述SHA>/<文中路径>`。本报告的行号为对应固定 SHA 的源码行，而非浮动 PR Head；引用未列出的第一轮资产均不得当作已审计输入。
