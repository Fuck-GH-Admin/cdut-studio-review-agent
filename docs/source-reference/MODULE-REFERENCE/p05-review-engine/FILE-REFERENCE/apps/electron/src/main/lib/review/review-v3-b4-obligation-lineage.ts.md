---
path: apps/electron/src/main/lib/review/review-v3-b4-obligation-lineage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d2c9bc22630000906ea976f7a3a77cfd49dd2e3
sha256: 25766625ec707cad71e47d44fee5f500710a7c82f041db4b8962c715e1c61745
lines: 154
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-obligation-lineage.ts

## 1. 结论与边界

B4 技术候选**血统验证器**（`validateB4TechnicalArchive` + `sumB4Technical`）。刻意无能力批准政策/独立 Gold/正式 Review V3 Plan（`apps/electron/src/main/lib/review/review-v3-b4-obligation-lineage.ts:1-8`）。验证链=原始 D4 冻结 Git blob → workspace 任务 → sourceBinding → source 定位器；**不**验证归档 Markdown 义务等于当前校规，也不主张作者/发布者 ACL（`:5-7`）。

边界：本文件零 import（纯类型+函数，`:1-74` 无 import 行）；数据形状 `B4Archive` 是 B4 集群共享契约。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B4ArchiveSource` | interface | 9-16 | `{sourceId;sourceKind;documentVersionId\|null;locator\|null;verification;sourceApplicability}` | |
| `B4ArchiveCheck` | interface | 17-32 | `{checkId;taskId\|null;taskTitle\|null;module\|null;origin;bindingState;sourceIds[];sources[];genericScope:unknown;caseScopeJustification\|null;applicabilityNote\|null;publicationAllowed:false;policyApproval:'NOT_VERIFIED';goldStatus:'NOT_AUTHORIZED_OR_NOT_RUN'}` | |
| `B4ArchiveTemplate` | interface | 33-48 | `{templateId;templateVersion;workspacePath;workspaceGitBlobSha;gitBlobObserved;sourceVersion;sourceSha256;manifestPath;historicalIntegrationStatus;publication:'candidate-held';obligationCount;workspacesBindings;expectedTasks;obligations[]}` | |
| `B4Archive` | interface | 49-60 | `{schemaVersion:'review-v3-b4-obligation-archive/1';frozenSourceGitSha;domain;templateCount;technicalState:'UNREVIEWED_EXTRACT';publicationAllowed:false;policyApproval:'NOT_VERIFIED';independentGold:'NOT_AUTHORIZED_OR_NOT_RUN';issues{unbound,missingSources,orphan,shaMismatch,other};templates[]}` | |
| `B4TechnicalResult` | interface | 61-73 | `{domain;frozenSourceGitSha;templateCount;workspaceChecks;workspaceBound;unscopedChecks;unknownApplicability;policyValidated:0;goldValidated:0;publicationAllowed:false;technicalLineage:'WORKSPACE_TRACEABLE_NOT_POLICY_VERIFIED'}` | |
| `validateB4TechnicalArchive` | function | 84-142 | `(data:unknown) => B4TechnicalResult` | untrusted JSON 全程守卫 |
| `sumB4Technical` | function | 143-154 | `(results:B4TechnicalResult[]) => {domains;templates;checks;unscoped;unknown;candidateOnly:true;policyPublicationAllowed:false}` | |

内部：`sha40/sha64`、`deny`（`:76`，`Error('B4_LINEAGE_'+reason)`）、`isObject/safe`（`:77-79`）。

## 3. 内部逻辑与关键流程

### 3.1 `validateB4TechnicalArchive`（`:84-142`）

1. `:87-88` 分立守卫保 TS narrowing（注释 `:85-86`：不打 unchecked cast）：非对象/无 templates 数组 → `B4_LINEAGE_ARCHIVE_HEADER`。
2. `:89-95` 头部（`ARCHIVE_HEADER`）：schemaVersion、frozenSourceGitSha 40hex、domain `^G0[1-8]$`、`templates.length===templateCount`、`technicalState==='UNREVIEWED_EXTRACT'`、三否定字面量、**issues 五值全 0**。
3. `:98-110` 每模板（`TEMPLATE_LINEAGE`）：templateId 非空唯一、templateVersion 安全整数、`publication==='candidate-held'`、`workspaceGitBlobSha` 40hex 且 **`gitBlobObserved===workspaceGitBlobSha`**（`:103`，观察即钉住）、sourceSha256 64hex、三路径非空、`obligations.length===obligationCount===workspacesBindings===expectedTasks`（`:107-108`）。
4. `:111-133` 每 check（`CHECK_LINEAGE`）：checkId 前缀 `templateId@templateVersion:` 且唯一、taskId/taskTitle/module 非空、`bindingState==='WORKSPACE_BOUND'`、sourceIds 非空与 sources 等长、三否定字面量；每 source（`SOURCE_LINEAGE`）：`source.sourceId===row.sourceIds[s]` 逐位对齐、不重复、`sourceKind!=='missing'`、documentVersionId/locator/verification/sourceApplicability 非空；`sourceApplicability==='unknown'` → unknown++；`!genericScope && !caseScopeJustification` → unscoped++（`:132`）。
5. `:135-141` 返回 `workspaceBound:total`（全部 WORKSPACE_BOUND 故相等）、两 `:0`、`technicalLineage:'WORKSPACE_TRACEABLE_NOT_POLICY_VERIFIED'`。

### 3.2 `sumB4Technical`（`:143-154`）

逐 result：域不重复 + 三否定字面量（`AGGREGATE`）；累计模板/检查/缺口 → `{domains:8…, candidateOnly:true, policyPublicationAllowed:false}`。

## 4. 调用者与调用链

出向：无 import（仅 node 内建无）。

入向（检索=符号名+模块名，全冻结树）：

- 类型 `B4Archive/B4ArchiveTemplate/B4ArchiveCheck`：`review-v3-b4-bulk-evidence-workbench.ts:9,89-90,110-111,127`、`review-v3-b4-conflict-and-instance-guard.ts:10-12`、`review-v3-b4-high-risk-semantic-evidence.ts:6,32`、`review-v3-b4-r25-raw-clause-condition.ts:17,95,241`、`review-v3-b4-rule-source-diff.ts:7,45,56`。
- `validateB4TechnicalArchive`/`sumB4Technical`：`review-v3-b4-conflict-and-instance-guard.ts:10-12,222`（`sumB4Technical(expected.map(d=>validateB4TechnicalArchive(archives[d])))`）。
- `B4ArchiveSource`/`B4TechnicalResult`：仅本文件（嵌套/返回类型）。
- 测试：无同名 .test.ts，全树零测试引用。

## 5. 数据 I/O、读写与副作用

无。纯校验 + 计数；抛普通 `Error('B4_LINEAGE_…')`。

## 6. 分支、失败、取消与恢复

失败=throw（`ARCHIVE_HEADER`/`TEMPLATE_LINEAGE`/`CHECK_LINEAGE`/`SOURCE_LINEAGE`/`AGGREGATE` + 2 个 `B4_LINEAGE_ARCHIVE_HEADER`）。无异步/取消。

## 7. 权限与权威状态

无权限分支。权威否定以字段字面量固化（`publicationAllowed:false`/`policyApproval:'NOT_VERIFIED'`/`goldStatus:'NOT_AUTHORIZED_OR_NOT_RUN'`/`policyValidated:0`/`goldValidated:0`/`technicalLineage:'WORKSPACE_TRACEABLE_NOT_POLICY_VERIFIED'`）；`:5-7` 明示不主张 ACL、不验证归档=当前校规。

## 8. 修改影响面

`B4Archive` 形状是 B4 集群 5 个模块的共享数据契约（§4）；`validateB4TechnicalArchive` 是 `auditB4FrozenUnknownCoverage:222` 的逐域前置（B26→B28→B33 链的根）。改动连锁全 B4 集群。无测试。

## 9. 测试证据

无直接/间接测试（全树零测试引用）。**NOT_RUN**。缺口：5 个 deny 分支、`gitBlobObserved` 钉住、unscoped/unknown 计数无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| untrusted JSON 分立守卫（无 cast） | 已证实 | `:85-95` |
| 三计数（obligationCount=workspacesBindings=expectedTasks）强制 | 已证实 | `:107-108` |
| sourceIds 与 sources 逐位对齐 | 已证实 | `:125` |
| 零 import（纯模块） | 已证实 | 全文 |
| 无测试、仅集群互调 | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| 归档数据与 D4 真实来源 | 未知 | 数据批外 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 interface + 2 function | §2 | 9-154 | covered |
| 归档三段校验 | §3.1 | 84-142 | covered（无测试） |
| `sumB4Technical` | §3.2 | 143-154 | covered |
| 数据来源 | §10 | — | unknown |
