---
path: packages/shared/src/types/review-v2-contracts.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d8e67a2199af5c1b49e73af3b77494cf0c5e4f1
sha256: 1f2640925a816d42dfb024cac3043f62829e0f323fa5dcb1463c530d222ff5f4
lines: 486
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/review-v2-contracts.ts

## 1. 结论与边界

**V2 应用契约补全（N1a）**（`review-v2-contracts.ts:1-7` 注释）：07 §2.1 契约表落点——新概念独立成接口、旧类型只做可选字段扩展（**旧 JSON 兼容读取，缺失的新能力标未知/待配置，不得补默认"已确认"** `:5`）；新设计哈希 SHA-256、旧 SHA-1 带 algorithm 标识（`:6`）。

## 2. 导出与关键符号（44 条，分 8 组）

**政策仓（`:13-40`）**：`PolicyOrigin`（document/owner-statement——**不伪装校规原文** `:13`）、`PolicyRecord`（contentHash SHA-256、confirmations 记账、`compiledRules?`）、`PolicyRef`（精确到 ID+版本+hash，替代硬编码 version=1，`:35`）。

**字段/数值（`:44-69`）**：`FieldScope`（case/subject，防学年/分值强制化 `:44`）、`FieldSpecV2`（全可选向后兼容）、`DecimalValue`（**禁二进制浮点充当精确计算** `:60`）、`FieldValueV2`。

**规则计算（`:73-86`）**：`CalculationSpec` 5 算子（sum|max|single|dedupe-select-highest|weighted-sum|scale-convert；**不执行用户 JS**、未实现算子不得发布为 deterministic `:71/:73`）、`RequirementSpec` 4 kind。

**文档/来源（`:91-117`）**：`DocumentVersionV2`（byteHash/`assetKey` **主进程受控相对键，renderer 不凭任意路径访问** `:98`/pageIndexed/tableIndexed 精度上限 `:104`）、`SourceLocationV2`（ocr-rect 坐标系 `unrotated-page` `:112`）、`SourcePrecision`。

**任务/计划（`:122-151`）**：`WorkflowTask`（业务轮次不删历史 `:126`）、`CheckPlanEntry`（**覆盖分母唯一来源，不从 AI 问题反推** `:139`；applicability 三值 `'true'|'false'|'unknown'` `:147`）。

**快照（`:156-177`）**：`RunInputSnapshot`（hash SHA-256 固定键序+稳定 ID 排序 `:157`；聊天/备注不入 `:155`；`executionProfile?`）。

**业务对象（`:182-236`）**：`DecisionFinality`（终审/阶段，报告取最终投影 `:181`）、`DecisionAmendment`、`AppealResolution`（中文业务语义三值 `:192`）、`RubricV2`（N/A 策略/量尺转换 D11/定稿快照 `:195-207`）、`AssistantThread`、`DraftPatch`（**用户审阅后逐项命令应用，不直接改业务** `:217`）、`IntegrationProfile`。

**命令外壳（`:240-253`）**：`ReviewCommandTargetKind`、`ReviewCommandV2<T>`（target 资源化）、`ReviewAppErrorCodeV2`（+4 新码）。

**稳定键纯函数（`:258-276`）**：`makeCheckKey`（`${ruleId}@${ruleVersion}|${targetPart}`，subjectIds 排序 `:259-260`）、`makeFindingKey`（`checkKey|category|sourceRefHash`，跨运行继承人工意见前提 `:263`）、`isValidDecimalText`（`/^-?\d+(\.\d+)?$/` `:270`）、`fieldScopeOf`（默认 subject `:275`）。

**聚合/命令结果（`:282-449`）**：`CommandReceipt`、`RatingEntryV2`（G06 唯一票）、`SourceValidityRevocation`（C1 追溯账，原件/回执保留 `:308`）、`CaseArchiveRecordV3`（**可逆归档≠销毁历史；恢复不静默重启旧 Run/Decision** `:319/:325`）、`CaseAggregateV2`（state.v2.json 形态：observations/evidenceLinks/dispositions（处置绑定不可变输入 `:347`）/tasks/decisions/supplements/appeals/receiptLog/`v3TechnicalExecution?`（**Main-only 技术提案日志，非 ReviewRunV2/正式结论** `:358-362`）/`v3HostRunFences?`（C 拥有的物理 Host 接纳围栏，历史 runId 跨 PID/attempt/generation 禁用 `:377-380`）/`v3ReviewRun?`/`canonicalPlan(History)?`/`d2RuntimePlan?`（不授发布权 `:396`）/`ratings?`）、`ReviewWorkspaceCaseRef`、`CommandErrorCode`（7+1）、`ReviewCommandResult<T>`。

**批次自动化（`:416-486`）**：`BatchAutomationMode`、`BatchAutomationPolicy`（**本地显式授权，非校方审批凭证** `:418`）、`BatchAutomationReceipt`（**真实事务结果，非裸 AI 意见** `:429`）、`BatchAutomationReport`、`BatchCaseEntryBinding`（**只认 entryRunId，禁止"取最新 Run"** `:453`；bindingState 4 态含 `recovery-required` `:472`）、`BatchStateV2`。

## 3. 内部逻辑与关键流程

纯类型+4 纯函数（§2 末组）。`makeCheckKey` 的 targetPart 三分（group→`group:key`/subject→`subjects:sorted`/case→`case`，`:259`）；`isValidDecimalText` 单正则；`fieldScopeOf` 单 ??。

## 4. 调用者与调用链

- 出向：`./review-v2`（8 类型 import `:9`、RuleSpec/CaseStage/ActorSource/RoleId/ReviewBatch 内联）、`./review-v3-c0`/`./review-v3-execution`/`./review-v3-run`/`./review-d2`（内联 import 建聚合闭包，`:364-397`）。
- 入向：测试 `review-v2-contracts.test.ts`（4 函数+结构冒烟）；`@profer/shared` barrel；主进程 case 聚合/命令链（跨批实现未读）。

## 5. 数据 I/O、读写与副作用

无（声明+纯函数）；`RunInputSnapshot.hash` 的规范化约定由调用方保证（`:257` 注释）。

## 6. 分支、失败、取消与恢复

纯函数三分支（§3）；类型层：`bindingState:'recovery-required'`（`:472`）与 `CaseArchiveRecordV3` 可逆恢复语义（`:325`）为实现方义务。不适用取消。

## 7. 权限与权威状态

红线密集：不得补默认"已确认"（`:5`）、PolicyOrigin 不伪装（`:13`）、assetKey 受控（`:98`）、CheckPlanEntry 覆盖分母唯一（`:139`）、DraftPatch 不直接改业务（`:217`）、BatchAutomationPolicy 非校方凭证（`:418`）、entryRunId 禁取最新（`:453`）、v3TechnicalExecution 非正式结论（`:358-362`）。

## 8. 修改影响面

改接口 → 主进程 case 聚合/命令处理、批次自动化、V3/D2 集成（内联 import 闭包）；改 4 纯函数 → 稳定键/十进制语义（测试精确断言锁定）。

## 9. 测试证据

**直接测试 `review-v2-contracts.test.ts`（5 用例，NOT_RUN）**：makeCheckKey 稳定/跨版本、makeFindingKey 格式、isValidDecimalText 六断言、fieldScopeOf 默认 subject、契约结构冒烟（详见测试手册）。未覆盖：其余接口字段级语义。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 44 导出+红线注释+4 纯函数 | 已证实 | 逐行读 `:1-486` |
| 聚合/命令链实现遵守红线 | 未知 | 跨批实现未读 |
| hash 规范化实现 | 未知 | 调用方（跨批） |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 44 导出（8 组） | §2 | `:13-486` | covered |
| 4 纯函数 | §3 | `:258-276` | covered |
| 权威红线 | §7 | 见列 | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
