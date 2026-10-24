---
path: apps/electron/src/main/lib/review/pi-case-review-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b885d6300f23ec12158aec69ef3b301a807b34e5
sha256: 6a46e1460c6649b34da0086a391ac433879aae27f663988d5aad5b7214033098
lines: 1199
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-case-review-service.ts

## 1. 结论与边界

普通 Pi 会话的案卷审核接入（头注 :1-3）：Agent 自主读材料，本模块**只**创建输入快照、校验结构化结果并写入现有运行记录。职责束：①运行准备/续审（`preparePiReviewRunV2`）；②结果提交校验与落账（`submitPiReviewResultV2`，观察/检查逐条校验 + 确定性重算 + RUN-42 业务就绪分离）；③材料读取账本（逐块/预览/继承/人工回执，经 `finalizePiDocumentCoverage`）；④终态收尾/取消（`finishPiReviewRunV2` 等）；⑤历史账目只读修复（RUN-44）。

边界：不启动第二个审核模型会话（diagnostics 固定声明 :305/:1089）；不做模型调用（在 `run-async-service`/`pi-review-agent-client`）；不写 Case 聚合（`case-store-v2`），运行记录经 `run-store-v2`；权限校验在 assignment 层（`checkAssignment`）。

## 2. 导出与关键符号

导出 22 项（8 接口 + 14 函数）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiReviewBinding` | interface | 23 | `{assignmentId, sessionId, caseId, runId}` | 运行绑定 |
| `PiReviewSourceInput` | interface | 30 | `{documentVersionId, blockId, quote?}` | 引用输入 |
| `PiReviewObservationInput` | interface | 36 | `{subjectId, fieldKey, kind, value, sourceRefs}` | 事实候选 |
| `PiReviewCheckInput` | interface | 50 | `{ruleId, subjectIds, status, reason, sourceRefs?}` | 检查提交 |
| `PiReviewResultInput` | interface | 58 | `{summary, observations?, checks?, finish?}` | 结果载荷 |
| `PiReviewSubmissionRejection` | interface | 65 | `{kind, index, reason}` | 拒绝项 |
| `PiReviewPrepareResult` | interface | 86 | `{assignmentId, runId, caseDirectory, userMessage, continuedRun?, inheritedReadDocumentNames?}` | 准备结果 |
| `reconcilePiReviewRunsWithReadReceipts` | fn | 218 | `(caseId, runs) => ReviewRunV2[]` | 历史账目只读修复（RUN-44） |
| `preparePiReviewRunV2` | fn | 452 | `(input) => PiReviewPrepareResult` | 建运行/续审 |
| `getPiReviewBindingForSession` | fn | 531 | `(sessionId) => PiReviewBinding\|undefined` | 会话→活跃运行 |
| `buildPiReviewCompactionSummary` | fn | 541 | `(caseId, runId) => string\|undefined` | 无模型压缩检查点 |
| `createPiReviewDocumentLibrary` | fn | 634 | `(binding) => {library, documents}` | 案卷限定材料库+读取进度恢复 |
| `recordPiReviewDocumentRead` | fn | 657 | `(binding, documentVersionId, blockIds, documents, activity?) => void` | 逐块读取回执 |
| `recordPiReviewPreviewByPath` | fn | 677 | `(binding, filePath, summary, inspection) => boolean` | 原件预览回执 |
| `PiReviewBusinessReadiness` | interface | 801 | `{technicalCompleted, decisionReady, fullyRead, businessReady, pendingChecks, …}` | RUN-42 投影 |
| `summarizePiReviewBusinessReadiness` | fn | 819 | `(run) => PiReviewBusinessReadiness` | 技术/业务就绪分离 |
| `submitPiReviewResultV2` | fn | 915 | `(input) => {accepted, rejected, missingChecks, status}` | 结果提交主入口 |
| `finishPiReviewRunV2` | fn | 1128 | `(binding, outcome) => void` | 终态收尾 |
| `cancelPiReviewRunForSession` | fn | 1165 | `(sessionId, assignment) => void` | 会话取消 |
| `updatePiReviewReadActivity` | fn | 1170 | `(binding, documents, summary) => void` | 读活动记录 |
| `getPiReviewSessionForCase` | fn | 1189 | `(caseId) => string\|null` | 案卷→最近会话 |
| `assertPiReviewDirectory` | fn | 1196 | `(path, caseId) => boolean` | 目录等价断言（生产零消费者） |

关键内部符号：`numericValueAppears`（:44-48）、`PiReviewSubmissionAttempt`（:71）、`PiDocumentReadInheritanceEntry`（:78-84）、`CASE_ROOT`（:95-98）、`PiDocumentReadState`（:99-103）、`inheritPiReadReceipts`（:105-166）、`snapshots`（:168）、`inputHashOf`（:175-179）、`sectionSubjectIds`（:181-192）、`coverageFor`（:194-215）、`effectiveRulesFor`（:270）、`buildRun`（:274-310）、`sourceBlock`（:312-331）、`makeFieldValue`（:333-357）、`ruleTargets`（:359-364）、`expectedSemanticChecks`（:366-384）、`promptFor`（:386-432）、`continuationPrompt`（:434-450）、`resolveSourceRefs`（:738-771）、`checkId`（:773-775）、`plannedTargetMatches`（:777-785）、`recalculateCoverage`（:787-799）、`applyPiReadReceiptInheritance`（:845-913）。

## 3. 内部逻辑与关键流程

### 3.1 运行准备 `preparePiReviewRunV2`（:452-529）
校验链：`sessionId/turnId` 必填（:453）→ 聚合存在（:455）→ 未归档（:456）→ 模板存在（:458）→ D2 候选必须绑定计划包 `D2_FIXED_PLAN_MISSING`（:459-461）→ `verifyD2InstalledPlan` 通过否则 `D2_FIXED_PLAN_MISMATCH`（:462-463）→ 有效规则非空（:464-467）→ `plannedChecks>0`（:468-471）。续审分支（:473-482）：`resumeRunId` 仅接受 `partially-completed`、模板未变、`inputHashOf` 未变、存在可续交语义检查。单活跃运行互斥（:483-484）。随后 `createAssignment`（:490-496）→ `buildRun` 或 `structuredClone(continuation)` 重开（:499-505）→ 可选读取继承（:506-508）→ `saveRunV2`+`bindRunToAssignment`+回收旧 assignment（:509-511）→ 组装 userMessage（`promptFor`+继承说明+`continuationPrompt`，:512-515）；失败回滚：`revokeAssignment` + 续审时还原旧 run 字节（:524-528）。

`buildRun`（:274-310）：runId `run-pi-{ts36}-{rand36}`（:281）；`inputManifest` 封存 inputHash/政策版本/文档版本内容哈希/观察与证据 id/有效规则 id+`hashEffectiveRuleSet`（:285-299）；`checks` 预置确定性检查（:302）；diagnostics 固定「由项目普通 Pi 会话直接审核」（:305，后续逻辑以此字符串识别本通道运行）。

### 3.2 提交 `submitPiReviewResultV2`（:915-1125）
授权/状态校验：`checkAssignment`（:920-921）、run `running`（:922-923）、聚合存在且未归档（:924-926）、模板存在（:927-928）、D2 门禁同 3.1（:929-933）、**输入哈希未变**否则结果过期（:934）。
观察逐条（:942-972）：fieldKey 必须在模板（:944-945）、case 域 subjectId==caseId / subject 域必须是本案事项且分项匹配（:946-949）、kind 精确匹配（:950）、`makeFieldValue` 类型构造（:951/:333-357）、`resolveSourceRefs(requireQuote=true)`（:952-953）、数字事实须「纯文本块引用且数值出现在引文」`numericValueAppears`（:954-962）；通过则 `recordObservation(extractedBy:'ai', confirmed:false)`（:963）并合并进 `node-auto-check-extract` 快照（:966-968）；任一失败进 `rejected`（:969-971）。
检查逐条（:977-1024）：必须是有效语义规则（:978-981）；`confirmation!=='confirmed'` 不得给 compliant/non-compliant（:983-985）；目标必须精确匹配计划（`plannedTargetMatches` :777-785）；`validateD2OperationEvidence` 逐操作证据（:992-995）；理由非空 ≤2000（:997-1000）；compliant/non-compliant 需精确出处（:1002-1006）；未确认规则只能 `awaiting-confirmation`（:1008-1010）；通过则进 `semanticResultMap`（按 `checkId` 去重覆盖，:1022）。
收尾（:1026-1124）：确定性检查重算（`buildDeterministicRuleChecks`，:1027-1033）；`missingChecks` = 计划语义检查 − 已收（:1035-1038）。`finish=true` 且有缺项/拒绝 → 记 attempt、diagnostics、覆盖重算、**保持 running** 返回（:1039-1053）；否则把缺项补 `execution-failed` 占位（:1056）、生成 AiOpinion（severity 有 non-compliant/execution-failed 为 red，:1073-1085）、`status='completed'`（:1086-1087）、RUN-42：`summarizePiReviewBusinessReadiness` 落 `node-pi-business-readiness` artifact，未就绪时 diagnostics+opinion 明示「技术轮完成不等于完整审核通过」（:1092-1108）。`finish=false` 分支只持久化观察与 attempt（:1111-1122）；最后 `saveRunV2`（:1123）。

### 3.3 材料读取账本
- `recordPiReviewDocumentRead`（:657-674）：run 非 running/案卷归档即忽略（:665）；块 id 并入 `node-pi-read-state`（:666-669）→ `updatePiReviewReadActivity` 刷覆盖（:673）。
- `recordPiReviewPreviewByPath`（:677-736）：`realpathSync` 解析目标，必须位于 `CASE_ROOT` 内（:690-696）且匹配某文档 `assetPath`（:697-705）；`scope==='all'` 且有视觉图且扩展名 pdf/image 才记「完整预览」（:712-716）；刷覆盖并记 `agentActivity`（≤100 条，:733）。
- `resolveSourceRefs`（:738-771）：`sourceBlock`（:312-331）要求引用文档 active、block 存在、非图块 quote 必须是 `block.text` 子串（:321）；图像出处必须先有视觉读取回执（:750-753）；RUN-46 文字出处必须本轮真实读取（逐块回执或完整预览）（:754-768）。
- 继承 `inheritPiReadReceipts`（:105-166）+ `applyPiReadReceiptInheritance`（:845-913）：从历史「同通道已完成运行」按**内容哈希相同**继承读取凭据（proof=`all-parsed-blocks|full-original-preview`，:138-146），写 `node-pi-read-inheritance`；`persist:false` 时只算视图不写盘（RUN-44，:851-854）。
- `reconcilePiReviewRunsWithReadReceipts`（:218-268）：对历史完成运行按当前解析块重建账目（仅内容哈希匹配者 :232），**只返回内存视图不落盘**（注释 :256-258/:263）。

### 3.4 其他
- `promptFor`（:386-432）：案卷/材料/事项/规则清单 + 读取策略 + 提交策略 + `piObservationFieldContract`（:418）+ D2 计划段（:420-426）。
- `buildPiReviewCompactionSummary`（:541-631）：纯读账本拼接检查点（规则/事项/已提交检查/缺项/事实/读取账本/意见/最近拒绝项），无模型、无写。
- `createPiReviewDocumentLibrary`（:634-655）：深拷贝文档列表建 `DocumentCapabilityLibrary`，按 `node-pi-read-state` 回放历史读取（图片 markImageRead、文本批量 read，80/批 :643-652）。
- `summarizePiReviewBusinessReadiness`（:819-843）：`pendingChecks`（awaiting-*）/`executionFailed`/`notExecuted`/`unreadDocuments` 四计数；`businessReady = completed && decisionReady && fullyRead`（:835）。
- `finishPiReviewRunV2`（:1128-1163）：非 running 直接返回（:1130）；案卷已归档 → `cancelled` + 说明（:1132-1139）；否则 completed→`partially-completed`、stopped→`cancelled`、failed→`failed`（:1142-1144），补 `execution-failed` 占位（:1147）并刷覆盖。

## 4. 调用者与调用链

入向（生产）：
- `review-ipc.ts`：`PREPARE_PI_REVIEW_V2` → `preparePiReviewRunV2`（:1107）、`GET_PI_REVIEW_SESSION_V2` → `getPiReviewSessionForCase`（:1113）、`START/STOP_BACKGROUND…` 失败路径 `finishPiReviewRunV2`（:1140）、`LIST_RUNS_V2`/`GET_WORKSPACE_RUN_VALIDITY_V2` → `reconcilePiReviewRunsWithReadReceipts`（:603/:696）。
- `adapters/pi-review-ops-tools.ts:16-21`（`createPiReviewDocumentLibrary` :82、`recordPiReviewDocumentRead` :109/:128、`submitPiReviewResultV2` :181——即 `review_read_documents`/`review_submit_result` 等工具实现）。
- `adapters/pi-builtin-tools.ts:112`（`getPiReviewBindingForSession` :835/:2089、`recordPiReviewPreviewByPath` :839——inspect_preview 记账）。
- `review-pi-run-bridge.ts:14`（:87-123：prepare/finish/绑定查询）；`review-pi-admission.ts:12-16`（:48/:57/:165）；`review-strict-pi-tools.ts:13-17`（:37/:135）。
- `agent-orchestrator.ts`（`getPiReviewBindingForSession` :1439、`cancelPiReviewRunForSession` :3715）；`ipc.ts:3850-3852`（`onRunOutcome → finishPiReviewRunV2`）。
- `report-export-v2-service.ts:44`（reconcile）。
- 测试消费：本批 `pi-case-review-service.test.ts`；他批 `review-d2-runtime.test.ts`、`case-lifecycle-v3.test.ts`、`review-background-reuse.probe.test.ts`、`review-strict-profile.p02.probe.test.ts`、`review-startup-io-recovery.p06.test.ts`、`review-pi-run-bridge.main.test.ts`、`review-storage-id.test.ts:95`（`assertPiReviewDirectory` 唯一消费者）。

出向：`pi-review-prompt-contract`（:5）、`config-paths`（:9）、`review-storage-id`（:10）、`application-service.getCaseV2Aggregate`（:11）、`v2-executor-factory.buildDeterministicRuleChecks`（:12）、`coverage-ledger.combineCoverage`（:13）、`effective-rules`（:14）、`template-store`（:15）、`run-store-v2`（:16）、`evidence-service.recordObservation`（:17）、`review-agent-assignment`（:18）、`document-capability-library`（:19）、`pi-document-coverage`（:20）、`review-d2-runtime`（:21）；动态 require：`run-service-v2.computeRunInputHash`（:177）、`review-agent-assignment.listAssignments`（:1190）。

## 5. 数据 I/O、读写与副作用

- 读：`{configDir}/review-cases/{caseId}` 聚合（经 application-service/run-store-v2/artifact 读写）；`node-pi-read-state`/`node-pi-read-inheritance`/`node-auto-check-extract`/`node-auto-check-summarize`/`node-pi-submit-attempts`/`node-pi-business-readiness` 六类 artifact（run-store-v2 存储）。
- 写：`saveRunV2` 运行记录（多点：:509/:734/:1052/:1123/:1138/:1162/:1186）；artifact 写点 :859-860/:1048/:1051/:1095/:1109-1110/:1113/:1118。
- RUN-44 边界：读路径（reconcile/compaction）**不写盘**（:256-258/:263/:851-854）。
- 副作用：无网络/窗口/日志；`getPiReviewSessionForCase` 纯查。

## 6. 分支、失败、取消与恢复

- throw 型失败（准备/提交入口）：授权失效（:921）、运行结束（:923）、案卷不存在/归档（:925-926/:455-456）、模板缺失（:458/:928）、`D2_FIXED_PLAN_MISSING/MISMATCH`（:459-463/:929-933）、输入过期（:477/:934）、续审条件不符（:475-480）、重复活跃运行（:484）、无有效规则/无计划目标（:465-471）。
- 拒绝型失败（单条）：观察/检查逐条进 `rejected`，不中断整批（:969-971/:978-1010）。
- `finish=true` 有缺项/拒绝 → 运行保持 running 可续交（:1039-1053），attempt 留痕（`node-pi-submit-attempts` 30 条滚动 :1048）。
- 取消/中断恢复：`finishPiReviewRunV2` 把未完成运行收为 `partially-completed/cancelled/failed` 并补 `execution-failed` 占位（占位可被后续提交替换，注释 :974-975）；续审复用 runId 与已接受结果（:500-505）。
- 归档竞态：归档后迟到结果拒绝（:926）、运行中归档 → `cancelled` 历史保留（:1132-1139）。

## 7. 权限与权威状态

- 授权入口：`checkAssignment({assignmentId, sessionId, action:'submit-result', turnTriggeredBy})`（:920）——提交必须携带有效指派；`preparePiReviewRunV2` 创建 `submit-result`/`workRole:'reviewer'` 指派并绑定运行（:490-510），失败即回收（:525）。
- 事实权威：观察一律 `extractedBy:'ai', confirmed:false`（:963）——AI 候选非确认事实；确定性检查由程序重算（:1027-1033，注释「AI 分不覆盖程序分」于 executor 篇同源）。
- 出处权威：引用必须当前激活材料 + 本轮真实读取（RUN-46 :754-768）；图像须视觉回执（:750-753）。
- RUN-42 权威分离：`technicalCompleted`（运行关闭）≠ `businessReady`（可办理）；未就绪写进 artifact/diagnostics/opinion（:1092-1108），防止下游把技术轮当业务通过。
- 归档冻结：归档案卷不接受启动/续跑/迟到结果（:456/:926）。

## 8. 修改影响面

- 校验规则变更影响所有经 `pi-review-ops-tools` 的 Agent 提交路径与本批/他批 5 个测试文件的拒绝文案断言。
- `inputManifest.hash`/`expectedSemanticChecks`/`checkId`（`check-{ruleId}-{scope}-{subjects|case}` :773-775）是续审/缺项判定的稳定键，改动破坏历史运行兼容。
- diagnostics 固定句「由项目普通 Pi 会话直接审核」（:305/:224/:262）是 reconcile/继承的识别标记，改动即失效。
- artifact 键名（`node-*`）被 UI/报告/strict-tools 消费。

## 9. 测试证据

直接测试 `pi-case-review-service.test.ts`（4 用例 / 1 describe；真实事务链：`createCaseFromTemplate`+`registerMaterial`（真写 PNG/TXT 文件 :58-61）+`preparePiReviewRunV2`；`PROFER_CONFIG_DIR=mkdtemp` :13-17；NOT_RUN）：
1. `:102-162` finish=true 图像出处被拒 + 缺项 → status `running`、rejected 含 `'图像出处尚未通过'`、`missingChecks` 5、run 保持 running 无 completedAt 无 execution-failed、attempt 落盘；RUN-46 未读正文引用 → 5 条 rejected 均含 `'文字出处尚未在本轮实际读取'`；`recordPiReviewDocumentRead` 后重交 → `{accepted:5, rejected:[], missingChecks:[], status:'completed'}`、checks 5；RUN-42 readiness `businessReady:false`、`unreadDocuments>0`、reasons 含 `'份材料未读'`，diagnostics 含 `'技术轮完成，但业务未就绪'`，opinion 含 `'技术轮完成不等于完整审核通过'`。
2. `:164-211` 续审：部分完成 → `preparePiReviewRunV2(resumeRunId)` 复用 runId、`continuedRun:true`、userMessage 含 `'【续审同一运行】'` 与被拒原因、绑定更新、run 重开 running；补读后重交 completed、checks 5。
3. `:213-244` 继承读取：新运行 `inheritReadReceipts:true` → `inheritedReadDocumentNames` 2 份、userMessage 含 `'【沿用已核验的原件】'`、新 run 覆盖 2 份 read 且 reason 含源 runId、`node-pi-read-inheritance` 含两文档 sourceRunId。
4. `:246-272` reconcile（RUN-44）：内存视图修复为 `read`（reason 含源 runId），但磁盘封存运行仍 `unread`（:270-271 断言只读不写）。

间接证据：`review-d2-runtime.test.ts`（D2 门禁/逐操作拒绝）、`review-pi-run-bridge.main.test.ts`、`review-background-reuse.probe.test.ts`、`review-strict-profile.p02.probe.test.ts`、`review-startup-io-recovery.p06.test.ts`、`case-lifecycle-v3.test.ts`（归档拒绝）。
未覆盖（缺口）：`buildPiReviewCompactionSummary`（仅 probe 测试间接）、`cancelPiReviewRunForSession`/`getPiReviewSessionForCase`/`assertPiReviewDirectory`（后者仅 review-storage-id.test.ts:95 断 throw）、观察校验各拒绝分支（数字/字段域/kind）、`recordPiReviewPreviewByPath` 路径边界、`finishPiReviewRunV2` 归档分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 22 导出/内部符号行号如 §2 | 已证实 | 逐条 `export` |
| 提交校验链与 RUN-42/44/46 语义 | 已证实 | :915-1125/:256-258/:754-768 |
| 读取权威分级（人工/全预览/逐块/引用） | 已证实 | :657-736 + pi-document-coverage 篇 |
| 观察恒 `ai/unconfirmed` | 已证实 | :963 |
| diagnostics 标记是 reconcile/继承识别键 | 已证实 | :305/:224/:262 |
| `assertPiReviewDirectory` 生产零消费者 | 已证实（否定） | 全树检索仅定义+1 测试 |
| 归档中途竞态的 run 状态历史语义 | 推断 | :1132-1139 分支无直接用例 |
| 真实 Agent 长流程行为（多轮/压缩） | 未知 | 仅 probe 测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `preparePiReviewRunV2`（校验/续审/回滚） | §3.1/§6 | 452-529 | covered |
| `submitPiReviewResultV2`（观察/检查/收尾） | §3.2/§6 | 915-1125 | covered |
| 读取三函数 + resolveSourceRefs | §3.3 | 657-771 | covered |
| 继承/reconcile（RUN-44） | §3.3 | 105-166/218-268/845-913 | covered |
| `summarizePiReviewBusinessReadiness` | §3.4/§7 | 801-843 | covered |
| `finishPiReviewRunV2`/`cancelPiReviewRunForSession` | §3.4 | 1128-1168 | covered（cancel 未测） |
| `buildPiReviewCompactionSummary` | §3.4 | 541-631 | partial（probe 间接） |
| `getPiReviewSessionForCase`/`assertPiReviewDirectory` | §2 | 1189-1199 | covered（后者零生产消费） |
| 观察逐条拒绝分支 | §9 缺口 | 944-961 | unknown（未测） |
