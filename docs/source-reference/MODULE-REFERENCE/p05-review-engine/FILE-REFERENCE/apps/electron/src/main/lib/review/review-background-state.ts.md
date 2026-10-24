---
path: apps/electron/src/main/lib/review/review-background-state.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 89e60ea00861e1ac8414e1efe119e4141039f841
sha256: 55ce2883ed83d8cd739be4b57dbd5a27a77e56a766889ea8db46aa733be41386
lines: 53
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-background-state.ts

## 1. 结论与边界

P03-MAIN-S01：**只读**的 Main/V2 支撑直接 Pi 审核业务状态（`apps/electron/src/main/lib/review/review-background-state.ts:1-7`）。文件头硬约束：**绝不**从 `V2.status==='running'` 推导 'accepted' ACK（`preparePiReviewRunV2` 在编排器持有执行令牌前就写入该状态，`:4-5`）；不暴露 sessionId/assignmentId/SDK 流/内部转写（`:6-7`）。

边界：不写任何状态；phase 是 6 值业务相位投影，「completed 分析完成≠业务批准」（`:40-41`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `summarizeBackgroundPiReviewState` | function | 15-48 | `(caseId, runs: readonly RunSummary[], admitted:(caseId,runId)=>boolean) => ReviewBackgroundPiRunState` | 纯投影；`RunSummary=Pick<ReviewRunV2,'id'\|'caseId'\|'status'\|'completedAt'\|'error'>`（`:13`） |
| `getBackgroundPiReviewState` | function | 50-53 | `(caseId) => ReviewBackgroundPiRunState` | 案卷缺失 → 抛「案卷不存在或尚未初始化」 |

## 3. 内部逻辑与关键流程

`summarizeBackgroundPiReviewState`（`:15-48`）：

1. `:22-23` 取**第一条** `caseId` 匹配且 `id.startsWith('run-pi-')` 的运行（注释 `:20-21`：直接 Pi run ID 由 `buildRun()` 独家以 `run-pi-` 前缀创建；普通自动/历史 V2 运行不是 Pi ACK）；无 → `{phase:'not-started'}`。
2. `:24-31` base：runId/runStatus/completedAt/error（终态失败原因必须随状态回传，`:29-30` 注释）。
3. `:32-47` 状态映射：`queued`/`running` → `running && admitted(caseId,id)` 才 `'accepted'`，否则 `'preparing'`（`:35`——admitted 即 `isPiReviewRunAdmitted` 是 accepted 的唯一来源）；`awaiting-input`/`awaiting-decision` → `'needs-attention'`；`completed` → `'finished'`；`paused`/`partially-completed`/`failed`/`cancelled` → `'incomplete'`。

`getBackgroundPiReviewState`（`:50-53`）：`getCaseV2Aggregate(caseId)` 存在性校验 → `listRunsV2(caseId)` + `isPiReviewRunAdmitted`。

## 4. 调用者与调用链

出向：`@profer/shared` 类型、`./application-service`（getCaseV2Aggregate）、`./review-pi-admission`（isPiReviewRunAdmitted）、`./run-store-v2`（listRunsV2）（`:8-11`）。

入向（检索=符号名+模块名，全冻结树）：

- **产品链**：`apps/electron/src/main/lib/review/review-ipc.ts:1129-1130`（IPC handler `require` 后调用）、`review-pi-run-bridge.ts:11,103,125`（两处 `getBackgroundPiReviewState(input.caseId)`）。
- 直接测试（本批）：`review-background-state.p03-main.test.ts:11,23-25` 等（见 §9）。
- 间接测试（批外）：`review-pi-run-bridge.main.test.ts:36,77,95`。

## 5. 数据 I/O、读写与副作用

只读聚合（listRunsV2/getCaseV2Aggregate 读存储）；无写、无副作用（抛错仅案卷缺失）。

## 6. 分支、失败、取消与恢复

纯映射无失败分支（switch 全覆盖 ReviewRunV2 状态）；无异步/取消。「恢复」语义在数据侧：`admitted` 由 `review-pi-admission` 决定，本文件不判定。

## 7. 权限与权威状态

accepted 权威= `admitted()`（`review-pi-admission` 的准入判定）而非 `V2.status`（`:4-5,35`）。不暴露敏感身份（`:6-7`）。

## 8. 修改影响面

phase 映射改动影响 `review-ipc.ts:1129` 的 UI 状态与 `review-pi-run-bridge.ts:103,125`；`run-pi-` 前缀约定绑定 `buildRun()`（批外）。测试：本批 `review-background-state.p03-main.test.ts` + 批外 `review-pi-run-bridge.main.test.ts`。

## 9. 测试证据

直接测试 `review-background-state.p03-main.test.ts`（84 行；断言如 `:23` 空 runs → `{caseId:'sample',phase:'not-started'}`、`:24` 非 `run-pi-` 前缀 running → 'not-started'、`:25` 前缀不符 → 'not-started'；完整用例清单见该篇）。间接：`review-pi-run-bridge.main.test.ts:95`（failed → 'incomplete'）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| accepted 仅由 admitted 派生非 V2.status | 已证实 | `:4-5,35` |
| `run-pi-` 前缀过滤 | 已证实 | `:20-23` |
| error 随终态回传 | 已证实 | `:29-30` |
| 产品链（IPC+bridge） | 已证实 | `review-ipc.ts:1129`、`review-pi-run-bridge.ts:103,125` |
| buildRun 前缀约定 | 推断 | 注释 `:20-21`；批外实现未读 |
| 真实相位分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | 15-53 | covered |
| 状态映射 9 case 标签/4 return 分支 | §3 | 32-47 | covered |
| admitted 权威 | §7 | 35 | covered |
