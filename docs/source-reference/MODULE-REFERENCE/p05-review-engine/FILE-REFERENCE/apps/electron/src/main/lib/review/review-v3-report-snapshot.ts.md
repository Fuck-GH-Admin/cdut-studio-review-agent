---
path: apps/electron/src/main/lib/review/review-v3-report-snapshot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c57efc8ebfdb369d0d830ecf0b92be4869e96f18
sha256: 71b44592d5012a04426aac3d67f01284b44ee8a68d53106b276c45818ea395c3
lines: 213
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-report-snapshot.ts

## 1. 结论与边界

报告冻结投影（T08/F16/EXPORT_REPORT_V2 共用只读投影，文件头 :1-13）：Run 选择唯一可解释（显式 > 决定绑定 > 最新）、supersedes 仅同 Run 内生效、受众由 Main 可信 actor 授予（Renderer 不能自提权）、快照指纹绑定内容、归档恢复代次标注历史。纯函数、无副作用（:13 注释）。

不做的事：不读存储（输入为已加载值）、不发报告、不做授权凭据（`reportAudienceOptions` 只是「可请求」声明 :205-206 注释）。

## 2. 导出与关键符号

导出 15 条（`export` 逐条核 :15/:16/:18/:34/:42/:79/:92/:112/:118/:132/:169/:178/:190/:195/:207）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReportAudience` | type | `:15` | `student\|reviewer\|organizer` |
| `ReportRunBasis` | type | `:16` | `explicit\|decision\|latest` |
| `ReportRunSelection` | interface | `:18-24` | `{run, basis, historical, reason}` |
| `latestReportDecision` | function | `:34-36` | 排序取最后一条决定（仅内部 :48 使用） |
| `resolveReportRun` | function | `:42-77` | Run 选择（RUN-02） |
| `ReportAdjudicationSelection` | interface | `:79-85` | `{current, supersededInRun, excludedOtherRun}` |
| `resolveReportAdjudications` | function | `:92-110` | 裁定 Run 作用域投影（RUN-21） |
| `ReportActor` | interface | `:112-116` | `{actorSource?, actorId?, role?}` |
| `ReportAudienceGrant` | interface | `:118-124` | `{requested, audience, granted, reason}` |
| `resolveReportAudience` | function | `:132-167` | 受众授权（RUN-31/UI-15） |
| `ReportCaseCycle` | interface | `:169-175` | `{archiveCycle, archivedAt?, restoredAt?, stage}` |
| `resolveReportCaseCycle` | function | `:178-187` | 归档代次（ASSET-10） |
| `isDecisionPreRestore` | function | `:190-192` | 决定是否早于恢复 |
| `reportSnapshotDigest` | function | `:195-204` | sha256([caseId,runId,audience,json]) |
| `reportAudienceOptions` | function | `:207-213` | 受众能力声明（无外部调用者） |

内部符号：`byTimeThenId`（:26-31，`at ?? startedAt` 降序 + id 兜底）、`AUDIENCE_RANK`（:126，student 0/reviewer 1/organizer 2）。

## 3. 内部逻辑与关键流程

### 3.1 `resolveReportRun`（:42-77，RUN-02）

优先级：① 显式 `requestedRunId`（:48-57）：不存在 → `{run:null, reason:所选运行…不属于该案卷或已不可用}`；存在 → `basis:'explicit'`，`historical = decision?.basedOnRunId !== run.id`。② 有决定（:58-69）：决定绑定 Run 存在 → `basis:'decision'`；缺失 → **明确拒绝**（`最终决定引用的运行 … 已不可用，拒绝改用其他运行代替`，:64-68），不静默换用。③ 无决定（:70-75）：`[...runs].sort(byTimeThenId)[0]`，`basis:'latest'`、reason 注明「不构成结论」。空列表 → `{run:null, reason:该案卷还没有任何审核运行}`（:75-76）。

### 3.2 `resolveReportAdjudications`（:92-110，RUN-21）

`sameRun` 过滤：`basedOnRunId===runId` 且（无 inputHash 或 inputHash 一致或记录缺哈希 :95-96）；supersedes 集合仅在 sameRun 内解析（:97-98）；current = 未被替代者按 subjectId+id 排序（:99-102）；`supersededInRun` = sameRun 内被替代数；`excludedOtherRun` = 其它 Run 的记录数（:103-108）。语义（:86-88 注释）：跨 Run 裁定不删不采，重导历史 Run 不丢当时裁定。

### 3.3 `resolveReportAudience`（:132-167，RUN-31/UI-15）

actor 缺失/`actorSource==='unknown'` → 降级 student（granted 仅当请求即 student，:137-144）；`agent`/`mock` → 降级 student（:145-151）；否则按 role 计 rank（organizer/reviewer/其它→student，:153-155）；`AUDIENCE_RANK[requested] <= allowedRank` 才授予（:156-159），否则降级 student + reason（:160-166）。

### 3.4 其余

`resolveReportCaseCycle`（:178-187）：`archiveCycle = caseArchiveHistory.length + (restoredAt?1:0)`（:181）；`isDecisionPreRestore`（:190-192）：`restoredAt` 存在且 `decision.at <= restoredAt`；`reportSnapshotDigest`（:195-204）：JSON 数组四元组 sha256；`reportAudienceOptions`（:207-213）：三受众映射 `enabled = grant.granted && audience===grant.audience`。

## 4. 调用者与调用链

入向（全冻结树 `*.ts`）：
- 生产：`apps/electron/src/main/lib/review/report-export-v2-service.ts:9`（类型 import）+ `:38` `require('./review-v3-report-snapshot')`；调用 `resolveReportRun` :45、`resolveReportAudience` :49、`resolveReportCaseCycle` :51、`resolveReportAdjudications` :115、`reportSnapshotDigest` :149。
- 测试：`review-v3-report-snapshot.test.ts:3-10`（批内，12 用例）。
- **否定**：`reportAudienceOptions` 无任何外部调用者（符号全树检索仅 :207/:208）；`latestReportDecision` 仅内部 :48；`isDecisionPreRestore` 仅测试引用；`ReportRunBasis`/`ReportAdjudicationSelection`/`ReportAudienceGrant` 无外部引用。

出向：`node:crypto` createHash（:201）；`@profer/shared` 类型（BusinessDecision/CaseAggregateV2/ReviewRunV2/SubjectAdjudication :13）。

## 5. 数据 I/O、读写与副作用

无 IO、无副作用、无状态（依据：纯函数 + 仅类型/哈希导入）。输入输出均为值对象。

## 6. 分支、失败、取消与恢复

- 无 throw；失败语义以 `run:null`/`reason` 表达（:52/:64-68）；降级语义（audience→student）显式带 reason。
- 不适用「取消/恢复」：纯函数无状态。

## 7. 权限与权威状态

- 受众授权是本文件的核心权限语义：只有 Main 传入的可信 actor 可得 reviewer/organizer（:128-131 注释）；`agent`/`mock`/`unknown`/缺失一律学生版；Renderer 自报角色无法提权（rank 只来自 `actor.role`，:153-155）。
- 投影权威：Run 选择与 supersedes 语义以「决定绑定」为准（决定引用缺失即拒绝，不改用）。

## 8. 修改影响面

- 生产消费方 `report-export-v2-service.ts`（导出报告主链）；改 reason 文案/选择语义影响导出行为与 UX。
- 指纹算法（:195-204）是历史重导可比对的契约。
- 需同步测试：批内 `review-v3-report-snapshot.test.ts`。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-report-snapshot.test.ts`（批内，4 describe/12 用例，NOT_RUN）。
- RUN-02（:26/:34/:44/:51）：决定优先（`run-old`+basis decision+historical false）、显式历史（historical true）、决定引用缺失拒绝（run null + reason 含 run-gone）、时间+id 确定性与数组顺序无关（run-b）。
- RUN-21（:63/:79/:89）：跨 Run supersedes 不删（current 仅 adj-run1、excludedOtherRun 1、supersededInRun 0）、同 Run 内生效（adj-new、supersededInRun 1）、inputHash 不一致排除（current 0）。
- RUN-31（:97/:104/:109）：无 actor 降级（audience student/granted false/reason 含「降级」）、agent/mock 降级、reviewer 不得 organizer 且 organizer 可得。
- ASSET-10+指纹（:120/:133）：archiveCycle 2 + 恢复前后判定、指纹稳定性与 audience/json 敏感性。
- mock 边界：纯函数 fixture（`as unknown as` 断言最小对象）。未覆盖：`reportAudienceOptions`、`latestReportDecision` 空数组、`isDecisionPreRestore` 无 restoredAt。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 15 条与 §2 一致 | 已证实 | :15-207 |
| 决定引用缺失→明确拒绝不换用 | 已证实 | :64-68 |
| supersedes 仅同 Run（+inputHash 约束） | 已证实 | :95-102 |
| agent/mock/unknown/缺失降级 student | 已证实 | :137-151 |
| archiveCycle 公式 | 已证实 | :181 |
| 指纹绑定四元组 | 已证实 | :195-204 |
| `reportAudienceOptions`/`isDecisionPreRestore`/`latestReportDecision` 无生产调用 | 已证实（否定） | 全树符号检索（§4） |
| report-export-v2-service 导出侧整合语义 | 推断 | :38/:45-149 调用点，未逐行读该文件 |
| `actor.role` 的 Main 派生真实性 | 未知 | 依赖上游 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveReportRun` 三分支 | §3.1/§9 | :42-77 | covered |
| `resolveReportAdjudications` | §3.2/§9 | :92-110 | covered |
| `resolveReportAudience` 四分支 | §3.3/§9 | :132-167 | covered |
| `resolveReportCaseCycle`/`isDecisionPreRestore`/`reportSnapshotDigest` | §3.4/§9 | :178-204 | covered |
| `reportAudienceOptions` | §4/§9 | :207-213 | unknown（无调用/无测试） |
| `byTimeThenId`/`AUDIENCE_RANK` | §2 | :26-31/:126 | covered |
| actor.role 派生真实性 | §10 | — | unknown |
