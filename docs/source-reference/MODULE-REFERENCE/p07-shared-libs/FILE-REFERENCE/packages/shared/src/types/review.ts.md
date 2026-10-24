---
path: packages/shared/src/types/review.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 89a65e5a9911bdef285804113a918469d3fb909d
sha256: 7019b86c0843ea8ce8cf8e20c9cc0240f2f3f9987167b903324ffd17179ab744
lines: 816
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review.ts

## 1. 结论与边界

**内容审核专区共享类型与 IPC 通道契约（V1）**（`review.ts:1-12` 注释）：SourceDocument=三栏定位唯一来源；ReviewCase=案卷聚合根；RulePack/RuleOutline=依据与 AI 大纲；ReviewRun/Finding=运行发现（问题卡）。经 `export * from './review-domain-packs'`（`:17`）统一单入口。

## 2. 导出与关键符号（分组）

**锚点/文档（`:22-115`）**：`ReviewAnchorPrecision`（块>页>文件降级，`:21`）、`ReviewSourceAnchor`（**解析器给不到块时显式降级，不伪造精确位置** `:32`）、`ReviewBlockKind`、`ReviewDocumentBlock`（稳定 ID `blk-xxxx`；`imageAssetPath` **不内联 base64** 防 case.json 撑爆 `:54-59`；bbox 归一化坐标 `:61-64`）、`ReviewParseStatus`、`SourceDocument`（role rule/application/evidence；**parseError 不吞异常** `:85`）、`ImportDocumentsResult`（**失败按文件返回、成功不回滚** `:95`）、`ReviewImportProgressEvent`（9 phase `:107`）。

**规则（`:125-200`）**：`RuleOutlineCategory`（放宽 string，D15 `:119-125`）、`BUILTIN_RULE_OUTLINE_CATEGORIES`（8 类建议值 `:128-137`）、`RuleOutlineItem`（anchors 蓝色高亮目标、generatedBy ai/fixture/manual）、`RuleConstraint`（8 kind 含 required-clause/amount-limit `:157-167`；**`appliesWhen` 无明确适用条件不得按固定分值自动判定** `:181-182`）、`RulePack`。

**事项/证明（`:205-245`）**：`ReviewItemStatus`、`ReviewItem`（declaredScore/anchor/evidenceDocumentIds）、`EvidenceParseStatus`（unclear 进人工复核 `:241`）、`EvidenceDocument`。

**发现/运行（`:250-354`）**：`FindingSeverity`（red/yellow）、`FindingKind`（放宽 string，未知回落 yellow `:252-258`）、`BUILTIN_FINDING_KINDS`（10 值含 `other` 兜底 `:261-272`）、`FindingSuggestion`、`ReviewFinding`（subjectAnchor/evidenceAnchor **缺件时不伪造坐标** `:293`/counterpartAnchor 跨文件对照 `:295-299`/ruleAnchors/suggestedScore 分值明确才给 `:304`）、`ReviewRunStatus`、`ReviewRun`（inputHash **内容哈希非数量拼接** `:320-324`；coverage 含 `unprocessedMaterials`——**有该清单时 UI 必须展示且完整符合结论不成立** `:336-341`）、`ReviewLatestRunResult`（inputStale 过期标记 `:349-354`）。

**案卷（`:359-425`）**：`ReviewCaseType`、`ManualReviewRule`、`ReviewCase`（archivedDocuments 留 V2 追溯 `:379`、domainPackId 缺省综测 `:390-393`、subjectDocumentIds P2 多待审 `:398-402`、`revision` 主进程写回 +1 `:403-407`）、`ReviewCaseSummary`。

**助手/报告/多模态（`:430-473`）**：`ReviewAssistantMessage`（degraded 静态解答标记 `:438`）、`ReviewReportData`、`ReviewTextContentPart`/`ReviewImageContentPart`/`ReviewContentPart`（OpenAI 兼容，本地 ollama 复用 `:469-473`）。

**出口白名单（`:478-482`）**：`REVIEW_MODEL_PROVIDERS`（openai/deepseek/custom/ollama）、`REVIEW_MODEL_PROVIDER_REJECTED_NOTICE`（**双出口收敛安全合规** `:475`）。

**IPC 通道（`:486-672`）**：`REVIEW_IPC_CHANNELS`——单常量对象含 **123 个通道键**，分组：V1 案卷/导入/规则/条目/运行（`:488-553`）、V2 模板/运行/Pi 会话（`:555-573`）、N1d 应用命令（`:575-588`）、N3b 业务闭环（`:590-600`）、T01-T09 任务系列（`:602-634`）、F13 申诉（`:639-641`）、N4b 模板向导（`:643-648`）、N5b 批次（`:650-660`）、助手/报告/网关/模块设置（`:662-669`）；`ReviewIpcChannel` 派生类型（`:672`）。通道注释携带红线（如 `AUTHOR_SAVE_LOCAL_V3` never a school-published rule `:513`、`T05_STAGE_CAPABILITY` 不构成授权 `:621`、`T09_ISSUE_JUDGE` 本地声明非学校认证 `:629`）。

**后台 Pi 运行（`:675-702`）**：`ReviewBackgroundPiRunPhase`（**业务状态非学校审批结果** `:674`；'running' alone never means accepted `:682`）、`ReviewBackgroundPiRunState`（error 必须可诊断 `:686-688`）、`ReviewBackgroundPiStartRequest`（`resumeInterrupted` **未显式确认必须失败关闭，不得自动重放** `:696-700`）。

**请求/响应载荷（`:707-816`）**：`ReviewModelGatewayStatus`、`ReviewModuleSettingsV2`（密钥留全局渠道配置 `:720`）、`GenerateRuleOutlineRequest`/`ExtractItemsRequest`/`RunReviewRequest`/`UpdateCaseSettingsRequest`（manualRules 全量替换 `:752`）/`UpdateRuleOutlineRequest`/`UpdateReviewItemRequest`/`CreateNativeReviewItemV3Request`（**人工声明非 AI 事实/校方决定；requestId 不透明幂等键非身份凭证** `:777-780`）/`AssistantChatRequest`/`ExportReportRequest`/`ExportReportResult`。

## 3. 内部逻辑与关键流程

无函数（纯类型/常量）；`REVIEW_IPC_CHANNELS` 为唯一大型常量对象。

## 4. 调用者与调用链

- 入向：全仓审核专区（主进程 handler/preload/渲染层，经 `@profer/shared` barrel）；`review-domain-packs.ts` 反向被本文件 re-export；`review-v2.ts`/`review-v2-contracts.ts` 引用 `RuleConstraint`。
- 出向：`./review-domain-packs`（`:15/:17`）、`./pdf`（`NormalizedBBox` `:16`）。

## 5. 数据 I/O、读写与副作用

无（声明文件）；IPC 语义由主进程实现。

## 6. 分支、失败、取消与恢复

不适用（纯类型）；失败/恢复语义编码于字段（parseError `:85`、inputStale `:353`、resumeInterrupted 失败关闭 `:696-700`、ImportDocumentsResult 不回滚 `:95`）。

## 7. 权限与权威状态

红线密集：不伪造坐标（`:32/:293`）、不吞异常（`:85`）、登记≠检查（unprocessedMaterials `:336-341`）、非数量拼接哈希（`:320-324`）、appliesWhen 限定（`:181`）、双出口收敛（`:475`）、T 系列通道注释红线（`:513/:526/:621/:629`）、resumeInterrupted 失败关闭（`:696`）、requestId 非凭证（`:779`）。

## 8. 修改影响面

改类型/通道名 → 主进程 handler、preload 桥、渲染层审核专区全链；`REVIEW_IPC_CHANNELS` 变更牵动 IPC 双端。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `REVIEW_IPC_CHANNELS|ReviewCase|ReviewFinding` → 0 专属命中；`review-domain-packs` 亦无）。全部类型与通道**无测试锁定**。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部导出组+红线注释 | 已证实 | 逐行读 `:1-816` |
| 通道键总数（123） | 已证实（枚举级） | `:486-670` |
| 主进程实现遵守红线 | 未知 | 跨批实现未读 |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 锚点/文档/规则/事项/发现/运行/案卷 | §2 | `:22-425` | covered |
| 助手/报告/多模态/白名单 | §2 | `:430-482` | covered |
| REVIEW_IPC_CHANNELS+派生 | §2 | `:486-672` | covered |
| 后台 Pi/请求响应载荷 | §2 | `:675-816` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
