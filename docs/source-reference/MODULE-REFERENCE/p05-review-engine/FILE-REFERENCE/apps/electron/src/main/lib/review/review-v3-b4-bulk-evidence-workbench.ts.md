---
path: apps/electron/src/main/lib/review/review-v3-b4-bulk-evidence-workbench.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 456192fc5932929b9193f6833cee0bd6e4fadd44
sha256: 12437a72eb40c17b1fa9eefd2240bf9b684b875cd12a8b25c7d5241624b2c229
lines: 272
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-bulk-evidence-workbench.ts

## 1. 结论与边界

Dev-B R26：**八域历史源全量工作台**（技术修复队列）。文件头否定权威（`apps/electron/src/main/lib/review/review-v3-b4-bulk-evidence-workbench.ts:1-6`）：冻结 Check、观察字节、SourceRef、B2 回执、R25 原文条款匹配**都不是**校方政策；不改 D4/Case/Run/Principal/Owner/正式 Plan。两个导出函数：`buildB26HistoricalEvidenceWorkbench`（构建全量问题队列）与 `pageB26EvidenceIssues`（有界分页）。

边界：人工观察只能标注一个精确 issue，不能抹除或改冻结计数（`:122-124`）；输入完整性=8 个归档域全量，非任意子集（`:119-121`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B26IssueKind` | type | 16-19 | 5 值：`ORIGINAL_RAW_NOT_OBSERVED\|ORIGINAL_VERSION_CONFLICT\|UNVERIFIED_SOURCE_APPLICABILITY\|UNSCOPED_OBJECT_AND_CASE\|HIGH_RISK_CLAUSE_REQUIRES_INDEPENDENT_GOLD` | |
| `B26OriginalObservation` | interface | 20-25 | `{templateId; bytes:Uint8Array; provenance}` | 真实原始字节（`:22`） |
| `B26SourceObservation` | interface | 26-37 | `{checkId;sourceId;documentVersionId;locator;observationId;observedSha256}` | 纯文档技术观察，非校方批准（`:31-33`） |
| `B26ScopeObservation` | interface | 38-45 | `{checkId;objectKey;subjectId;scopeDescription;observationId}` | 人类提交的 scope 永非授权（`:43`） |
| `B26TemplateView` | interface | 46-53 | `{domain;templateId;frozenSourceSha256;frozenSourceVersion;historicalCandidateOnly:true; original:'RAW_NOT_OBSERVED'\|'RAW_BYTES_MATCH_TECHNICAL_ONLY'\|'RAW_VERSION_CONFLICT'; originalObservedSha256; checks; sourceUnknown; scopeUnknown; schoolPolicyVerified:false; publicationAllowed:false}` | |
| `B26Issue` | interface | 54-60 | `{id;domain;templateId;checkId;sourceId;ruleId;kind;state:'missing'\|'candidate-observed-unverified'\|'quarantined'\|'awaiting-school-gold'; rawVersion; reason; priority:1\|2\|3; canAutoClear:false; schoolAuthorityVerified:false; publicationAllowed:false}` | |
| `B26Workbench` | interface | 61-71 | `{schemaVersion:'review-v3-b26-source-workbench/1'; frozenD4SHA:'b68443b2…'; counts{domains:8;templates:50;checks:3875;originalsSupplied;originalsMatching;originalsConflicting;unscoped:34;unknownSourceRefs:4163;highRisk:32;unresolved}; templates[]; issues[]; snapshotSha256}` | 冻结计数以类型字面量固化（`:65-67`） |
| `B26BatchOptions` | interface | 72-78 | `{rawOriginals?;sourceObservations?;scopeObservations?;highRisk?:B4R25ClauseAudit}` | highRisk 注释：须来自独立验证的 R25（`:76`） |
| `buildB26HistoricalEvidenceWorkbench` | function | 126-248 | `(archives:Readonly<Record<string,B4Archive>>, options?) => B26Workbench` | |
| `B26IssuePage` | interface | 249-252 | `{total;offset;limit;nextOffset;snapshotSha256;items}` | |
| `pageB26EvidenceIssues` | function | 254-272 | `(work, options{offset?,limit?,domain?,kind?,state?}) => B26IssuePage` | 稳定有界虚拟队列（`:253`） |

内部：`fail`（`:12`）、`sha64`/`digest`（`:13-14`）、`domains` 8 常量（`:15`）、`key/validText/newIssue/templateOf/observationMap/sourceFor`（`:79-117`）。

## 3. 内部逻辑与关键流程

`buildB26HistoricalEvidenceWorkbench`（`:126-248`）：

1. `:129` `auditB4FrozenUnknownCoverage(archives)`（B4R24，先验冻结域集与 34/4163 缺口）。
2. `:130-141` raw 原件：上限 50（+sources≤4163、scopes≤34，`:132`）；逐条校验 templateId/provenance/Uint8Array 1B..16MB/不重复（`RAW_ORIGINAL_INPUT`）、模板存在（`RAW_UNKNOWN_TEMPLATE`）；存 `digest(bytes)`。
3. `:142-151` source 观察：`observationMap` 去重（`SOURCE_OBSERVATION_ID`/`SOURCE_DUPLICATE_SCOPE`）；逐条须命中归档 check+sourceId、`sourceApplicability==='unknown'`、documentVersionId/locator 精确、observedSha256 64hex（`SOURCE_PROVENANCE_MISMATCH`）。
4. `:152-157` scope 观察：checkId 必须在冻结 scopeGaps（`SCOPE_NOT_IN_FROZEN_GAP`）。
5. `:158-182` 逐模板视图 + 原件 issue（`original` 三态按 `seen.sha===t.sourceSha256` 判；issue kind/state/reason/priority=2 映射）。
6. `:186-200` 冻结缺口逐条成 issue：sourceGaps → `UNVERIFIED_SOURCE_APPLICABILITY`（有观察 → `candidate-observed-unverified`+「applicability 仍 UNKNOWN」）、scopeGaps → `UNSCOPED_OBJECT_AND_CASE`（priority=1）。
7. `:201-228` highRisk（R25 审计）：提供时校验 `rules===32/independentlyRawBound===32/两 false/proofs 32`（`R25_AUDIT_REQUIRED`）+ 逐 proof 域/去重/三 false/checkIds 全在 index（`R25_HIGH_RISK_PROVENANCE`）→ `awaiting-school-gold` issue；**未提供时**注释（`:223-224`）：缺席≠32 项已被接受，压入一条 `R25_32_GROUP` 汇总 issue（`:225-227`）。
8. `:229-234` 排序（priority→id）、id 唯一、**队列覆盖断言**：templates=50、`UNVERIFIED_SOURCE_APPLICABILITY` 4163 条、`UNSCOPED_OBJECT_AND_CASE` 34 条（`QUEUE_COVERAGE`）。
9. `:235-247` counts 组装 + `snapshotSha256=sha256(JSON{templates,issues,counts})`。

`pageB26EvidenceIssues`（`:254-272`）：work 形状校验（`INVALID_WORKBENCH`）；offset≥0、limit 1..200、domain∈8 域（`INVALID_PAGE`）；三过滤 + slice + `nextOffset`。

## 4. 调用者与调用链

出向：`node:crypto`、`./review-v3-b4-conflict-and-instance-guard`（`auditB4FrozenUnknownCoverage` 运行时）、`./review-v3-b4-obligation-lineage`（B4Archive* 类型）、`./review-v3-b4-r25-raw-clause-condition`（B4R25ClauseAudit 类型）（`:7-10`）。

入向（检索=符号名+模块名，全冻结树）：

- 类型消费（产品/内部）：renderer `review-v3-dev-b/ReviewV3ProductWorkspace.tsx:12,67,74,154`（B26IssueKind）、`review-v3-dev-b/review-v3-product-workflow.ts:8,28,213-215`（B26Workbench/B26Issue/B26IssueKind，type-only）；`review-v3-b3-unmatched-author-bootstrap.ts:15,61`（B26Workbench，type）；`review-v3-b-bulk-remediation-cycle.ts:6-8`；`review-v3-b-candidate-readiness-workbench.ts:13`；`review-v3-b33-currentity-snapshot.ts:16`。
- `buildB26HistoricalEvidenceWorkbench`/`pageB26EvidenceIssues` 两函数：**零调用**（仅定义行）。
- 测试：无同名 .test.ts，全树零测试引用。

## 5. 数据 I/O、读写与副作用

无写盘/网络；读取入参 `archives` 与观察字节（`digest(file.bytes)` 哈希）。抛普通 `Error('B_R26_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（`INPUT_BOUNDS`/`RAW_*`/`SOURCE_*`/`SCOPE_*`/`R25_*`/`QUEUE_COVERAGE`/`INVALID_WORKBENCH`/`INVALID_PAGE`）。无异步/取消。确定性：同输入同 `snapshotSha256`（B28 的 `verified()` 依赖该哈希防篡改）。

## 7. 权限与权威状态

无权限分支。权威否定：`canAutoClear:false`/`schoolAuthorityVerified:false`/`publicationAllowed:false` 每 issue 恒定（`:59,86-87`）；`historicalCandidateOnly:true`、`schoolPolicyVerified:false`（`:48,52`）；R25 缺席不推定接受（`:223-224`）。

## 8. 修改影响面

- `B26Workbench` 形状是 B27（historical 选项）、B28（`verified()` 冻结计数校验）、B33（historical 闸 `unknownSourceRefs===4163/unscoped===34`）的共享契约——改 counts 字面量需四处同步。
- 两导出函数零调用（§4）；类型面已进 renderer（type-only）与 preload 间接（经 `review-v3-b3-unmatched-author-bootstrap`）。
- 无测试，改动无回归网。

## 9. 测试证据

无直接/间接测试（全树零测试引用）。**NOT_RUN**。缺口：全部构建分支与 `QUEUE_COVERAGE` 断言无测试锚；`pageB26EvidenceIssues` 分页/过滤无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 冻结计数 8/50/3875/34/4163/32 与 B4R24/B28/B33 一致 | 已证实 | `:65-67` + 三消费方 |
| R25 缺席→汇总 issue（不推定接受） | 已证实 | `:222-228` |
| 队列覆盖断言（4163/34/50） | 已证实 | `:231-234` |
| 两导出函数零调用、类型面进 renderer | 已证实（否定/肯定结论，检索式见 §4，全冻结树） | grep |
| 观察标注不销项（state 语义） | 已证实 | `:186-200`（state 只升到 candidate-observed-unverified） |
| R25/归档数据的真实来源 | 未知 | 批外模块/数据未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2 | 16-272 | covered |
| 构建 9 步 | §3 | 126-248 | covered（无测试） |
| highRisk 两态 | §3 | 201-228 | covered |
| 分页函数 | §3 | 254-272 | covered（无测试） |
| 数据来源 | §10 | — | unknown |
