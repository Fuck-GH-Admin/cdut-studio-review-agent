---
path: apps/electron/src/main/lib/review/v2-executor-factory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: df8be22990a4862ca4f489a3ac5388730a7c79dd
sha256: 2a14b59a17a05f75e13484c6008f502c27d61e847804d3e28bc97be6f8246d8e
lines: 1075
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/v2-executor-factory.ts

## 1. 结论与边界

V2 真实执行器装配（G02 核心，文件头 :1-10）：`assembleV2Executors` 为 `executeRunGraph` 生成 11 种 NodeExecutor（register/parse/ocr/extract/bind/plan/check/calculate/verify/summarize/task）；输入装配=案卷字段+规则+材料解析文本；extract 走 Pi 完成 JSON→引用校验→observations；check 走确定性引擎；summarize 走 Pi→opinions；OCR 缺省 NullOcrPort 如实标注。另有视觉采集/批量识别与字段事实优先级解析。

不做的事：不写 Run/Case 存储（产物经 run-graph 管线）；不冒充 OCR 已读；不做业务放行。

## 2. 导出与关键符号

导出 12 条（`export` 逐条核 :40/:92/:96/:102/:197/:209/:285/:294/:304/:324/:557/:728）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `V2VisionAttachment` | interface | `:40-46` | dataUrl/documentVersionId/fileName/blockId/imageAlt? |
| `collectV2VisionImages` | function | `:92` | `(aggregate, caseRoot) => string[]`（dataUrl 列表） |
| `V2VisionBatchResult` | interface | `:96-99` | `{recognized[], failed[]}` |
| `recognizeV2VisionBatches` | function | `:102-166` | 分批（每批 8，:33）Pi 视觉识别+逐条映射回 blockId |
| `OcrPageRecord` | interface | `:197-207` | 逐页 OCR 结果记录 |
| `recognizeDocumentImages` | function | `:209-249` | 图片材料 OCR（端口不可用→如实 unread） |
| `AssembleOptions` | interface | `:285-292` | `{client, signal?, ocrPort?, imageInspector?}` |
| `ReviewImageInspectorResult` | interface | `:294-302` | 按需视觉核验结果 |
| `ReviewImageInspector` | type | `:304` | 按需图像核验端口 |
| `resolveEffectiveFieldValue` | function | `:324-370` | 唯一事实优先级（见 §3.2） |
| `buildDeterministicRuleChecks` | function | `:557-725` | 按规则作用域生成检查草稿 |
| `assembleV2Executors` | function | `:728-1075` | 11 节点执行器装配 |

内部符号：`caseAssetPath`（:35-40，案卷目录约束）、`collectV2VisionAttachmentBatch`（:48-87，max 8 张/8MB：:33-34）、`materialTextOf`（:168-205，PDF/Office 走 `document-parser.extractTextFromFile` :199、文本直读 :203、图片返 '' :181、失败 console.warn 如实标注）、`sourceRefsFromUnknown`（:372-375）、`makeCheckBasis`（:377-408）、`buildSheetDataCheck`（:410-555，含分币金额 `toFixed(2)` :522-530）、`checkIdFor`/`sourceRefsForRule`/`conditionFields`（:557-725 区间内）、`buildAgentContext`（:252-283，不在 :557-725 区间）、`fieldValueOf`（:317-319）。

## 3. 内部逻辑与关键流程

### 3.1 视觉采集与批量识别（:35-166）

- 采集（:48-87）：只取 `active!==false` 材料的 image blocks；路径必须落在 caseRoot 内（:57-58 越界跳过）；大小 0<x≤8MB（:62）；mime 白名单 jpg/webp/gif/png（:63-68）；`validImageIndex` 跳过 offset（:70）；满 8 张即返回（:81）；缺图不阻断文本路径（:84-85 catch 空）。
- 批量识别（:102-166）：每批 8 张；`signal.aborted` 抛 `视觉识别已取消`（:105）；连续 2 批不可读→剩余全转人工（:108-112）；响应 `imagesDropped`→整批 failed+计数（:118-122）；JSON 解析后逐行校验三字段+去重+映射回 index（:123-137）；未返回的补 failed（:138-140）；异常（非 abort）→整批 failed（:141-148）。

### 3.2 `resolveEffectiveFieldValue`（:324-370，RUN-35）

优先级（:322 注释）：已确认人工值（`extractedBy==='user' && confirmed`）→ 人工录入（user）→ 事项/案卷字段值 → AI 候选（**`known = confirmed===true`**，:345-348/:363-366，未确认 AI 候选不得当已知事实）→ 未知。subjectId 分支先查 `subject.fields`（:337-340）；case 分支查 `caseFields` 并回溯同值 confirmed 观察的 sourceRefs（:351-357）。

### 3.3 `buildDeterministicRuleChecks`（:557-725）

逐规则（:561）：`subjectsForRule` 分项过滤（`rule-section-scope`）；`semantic` 跳过（:564）；`dataCheck` 走 `buildSheetDataCheck`（:565-568）；`manual` 生成 awaiting-confirmation（:569-579，subject 按事项拆分/case|group 聚合）；`group` 无 calculation→人工（:582-590），有 calculation→逐 subject 解析输入→`computeGroupScore`（:591-612，未知输入→status 非 compliant）；`workspaceConstraint.score-value` 缺条件→人工（:615-624）否则按 appliesWhen 逐 subject 计分（:625-725）。

### 3.4 `assembleV2Executors`（:728-1075）

- `ocr` 节点（:1053-1054；:975 是 semanticChecksFromJson）：视觉块标 `available-on-demand`（不整案预处理，注释 :291）。
- `extract`（piExtract，:825-970）：先收确定性规则所需字段键（:827-837）；抽取目标=模板字段∩确定性键∩（字段值与观察均缺失）（:838-849）；无目标→沿用既有观察并短路（:850-866）；否则 Pi complete（工具 `read_documents`/`search_document_text_batch`/`record_observations`，`requiredToolKeys` 逐目标 `observation:<subjectId>::<key>`，`terminateAfterTools` :878-888）；abort 前后双检（:826/:889）。
- `summarize`（piSummarize）、`deterministicCheck`、`parse`、`trivial` 节点、11 节点 map（:1060-1072）。
- `inspectDocumentImage` 按需视觉（失败→`document.unusedReason` + `recordCapabilityEvent` + rethrow，:800-820）。

## 4. 调用者与调用链

入向（全树检索+只读子agent交叉核）：
- `assembleV2Executors`：生产 `apps/electron/src/main/lib/review/run-async-service.ts:105`（require）→ 调用 `:113`（`assembleAndRunReview`）、`:147`→`:184`（`startReviewRunAsync`）；上游入口 `review-ipc.ts:1073-1076/:1090-1091` 与 `adapters/pi-review-ops-tools.ts:446-447`。测试：批内 `real-chain-journey.test.ts:18`（:85）、批外 `review-batch-case-fallback.p06.test.ts:3`、`single-case-mvp.e2e.test.ts:12`、`single-case-workspace.e2e.test.ts:60`（动态）。
- `buildDeterministicRuleChecks`：生产 `pi-case-review-service.ts:12`→`:278`/`:1027`；测试 `effective-rules.test.ts:7`（:93）、批内 `v2-executor-factory.test.ts`（多点）。
- `recognizeDocumentImages`/`recognizeV2VisionBatches`/`collectV2VisionImages`/`resolveEffectiveFieldValue` 及 5 个接口类型：**外部调用者检索无命中**（仅批内测试与本文件内部）。

出向（:13-31）：`node:fs`/`node:path`；`@profer/shared` 类型；`./review-run-graph`（NodeExecutor/NodeKind）、`./pi-review-executor`（REVIEW_SYSTEM_PROMPT/REVIEW_VISION_SYSTEM_PROMPT、ReviewModelClient）、`./deterministic-engine`（evaluateCondition/computeGroupScore）、`./source-index`（buildTextSourceIndex）、`../config-paths`（getConfigDir）、`./review-json`（extractJson）、`./effective-rules`（resolveEffectiveRules）、`./rule-section-scope`（subjectsForRule）、`./review-tools`（buildReviewTools/reviewCheckToolKey）、`./document-capability-library`、`./ocr-port`（OcrPort/OcrResult）；动态 `../document-parser`（:199）。

## 5. 数据 I/O、读写与副作用

- 只读磁盘：材料文件（`materialTextOf` :180/:203、图像 base64 :74、statSync :62）；路径均受 caseRoot/getConfigDir 约束（:35-40/:57-58）。
- 模型 I/O：`client.complete`（extract/summarize/视觉识别），可 AbortSignal 取消。
- 副作用：`console.warn` 材料解析失败（:205 附近）；`recordCapabilityEvent` 能力记录；产物交给 run-graph 管线落盘（本文件不写存储）。
- 幂等：执行器为工厂产物，无实例可变状态；`extract` 用 before/after 集合差量登记观察/证据链。

## 6. 分支、失败、取消与恢复

- 取消：`signal.aborted` 在视觉循环（:105）、extract 前后（:826/:889）、`client.complete` 透传（:116/:885）；AbortError 原样抛（:142）。
- 失败降级：材料解析失败→空文本+warn（不阻断）；图像缺失→跳过（:84-85）；视觉批次失败→failed 列表+转人工（:108-112）；OCR 端口不可用→`recognizeDocumentImages` 如实 unread（ocr-port 契约）。
- 恢复：无自动恢复；失败以结构化结果（failed/unusedReason）上报，不伪造成功。

## 7. 权限与权威状态

无 sender/role 检查（执行器无 IPC 入口）；权威语义：RUN-35「AI 候选未人工确认不得 known=true」（:345-348/:363-366）；引用校验（extract 的 sourceRefs 必须指向已解析材料，头注释 :7）；路径约束（caseRoot :57-58）。

## 8. 修改影响面

- `run-service-v2` 真实执行链、`real-chain-journey.test.ts`、`v2-executor-factory.test.ts`；确定性引擎/审查工具契约（`deterministic-engine`/`review-tools`）。
- `resolveEffectiveFieldValue` 语义改动影响全部确定性检查事实口径。
- 需同步测试：批内 `v2-executor-factory.test.ts`（13 用例）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/v2-executor-factory.test.ts`（批内，1 describe/13 用例，NOT_RUN；伪造引用剔除在 real-chain-journey.test:82-104，属批外）：①视觉只读激活材料的图像页（:51）②超单次上限分批识别+逐张校验原图块 ID（:68）③视觉批次失败只标记该批不中断（:90）④连续 2 批失败停止重复等待、剩余页标人工核对（:111）⑤PDF 页图 OCR 写回可引用文字块与原页坐标（:131）⑥subject 隔离同名字段（:151）⑦同案分项规则只查本分项（:158）⑧嵌套 all/any/not 条件（:165）⑨semantic 交模型/manual 进待确认（:173）⑩人工确认事实优先（:182）⑪确定性预算规则逐行求和、排除合计行（:190）⑫重复票号报具体行、金额缺失不按零（:218）⑬等级映射用人工更正值并保留事实/证明/出处链（:244）。mock 边界：假 Pi client（openai-chat 形状）、真实文件系统 tmp。
间接：`real-chain-journey.test.ts`（批内）全链路含真实执行器运行+假 Pi。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 12 条；11 节点装配 | 已证实 | :40-728/:1060-1072 |
| RUN-35 未确认 AI 候选 known=false | 已证实 | :345-348/:363-366 |
| 视觉 8 张/8MB/案卷目录约束/连续 2 批失败转人工 | 已证实 | :33-34/:57-62/:108-112 |
| extract 无目标短路+requiredToolKeys | 已证实 | :850-866/:886-887 |
| 材料解析失败降级为空文本 | 已证实 | :204-205 catch |
| `AssembleOptions.ocrPort` 注入后在 `assembleV2Executors` 内无引用（仅 `recognizeDocumentImages` :209-231 消费 OcrPort，而该函数无生产调用者）——生产注入（run-async-service:77→:113/:184）当前无消费点，照实记录 | 已证实 | 全文件 `ocrPort` 命中仅 :209/:221/:222/:231/:289 |
| `deterministic-engine`/`review-tools`/`document-parser` 内部实现 | 未知（属他文件） | :23-30/:199 |
| 生产入向清单（run-async-service/pi-case-review-service 等） | 已证实 | 见 §4（子agent 交叉核） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 视觉采集/批量识别 | §3.1 | :35-166 | covered |
| `resolveEffectiveFieldValue` | §3.2 | :324-370 | covered |
| `buildDeterministicRuleChecks` | §3.3 | :557-725 | covered |
| `assembleV2Executors`/`piExtract`/`ocr` | §3.4 | :728-1075 | covered |
| `recognizeDocumentImages`/`makeCheckBasis`/`buildSheetDataCheck` | §2/§5 | :197-283/:377-555 | covered |
| 依赖内部实现 | §10 | — | unknown |
