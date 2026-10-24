---
path: apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 908407df7698772b4ce34e6b77060ed95c9a0f2a
sha256: 85b652cc6d4445507378dc200bfb929a33df7e7a72dc052704f9af1e35818b7e
lines: 208
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.ts

## 1. 结论与边界

F18：T09 评委离线回件 ↔ T07 评分轮次适配（文件头 `:1-7`）。不维护第二份评分状态：只读 T07 持久轮次，评分提交委托现有 T07 Main CAS；包内 reviewerId 仅是独立副本的身份声明，导入必须经本机组织者显式确认，不能模拟学校认证或校方审批。运行时模块（读 T07 状态/T09 账本，写 T09 回执账本）。

不做的事：不直接写 votes 数组（`deps.submitRating` 注入，`:21`）；不自建评分状态；不做包编解码（`offline-codec`）；不做签发语义（`offline-issuer`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T09JudgeImportDeps` | interface | `:20-30` | `{submitRating({batchId,reviewerId,expectedRevision,action}); confirmLocalOrganizer(): boolean}` |
| `T09JudgeIssueResult` | interface | `:32-38` | `{packageId; actionId; json; batchId; round}` |
| `issueT09JudgePackage` | function | `:47-67` | 用实际 T07 批次分配签发匿名评分包 |
| `previewT09JudgePackage` | function | `:120-125` | 只读预览（含批次/轮次/量表/案卷版本差异） |
| `importT09JudgePackage` | function | `:128-208` | 组织者确认后经 T07 CAS 导入（幂等+崩溃恢复） |

内部：`getJudging`（`:40-44`，`readT07State` 缺失抛 `T09_JUDGE_BATCH_NOT_FOUND`）、`loadJudgeReply`（`:69-79`，解析+类型/案卷匹配校验）、`judgeState`（`:81-110`，从 T07 轮次构造 `T09State`+附加冲突）、`checkedPreview`（`:112-117`，合并 `previewT09Reply` 与附加冲突）。

## 3. 内部逻辑与关键流程

### 3.1 签发 `issueT09JudgePackage`（`:47-67`）

`readT07State`+`currentT07Round`；`round.finalized` → “已冻结的评分轮次不能签发新任务”；案卷须在批次内（“案卷不属于该评审批次”）；分配须存在、`status==='assigned'`、`rubricVersion` 匹配（“没有可签发的当前评分分配”）（`:54-59`）；构造 `JudgeAssignment`（`recused:false`）→ `issueT09JudgeFromCase(..., scoringBinding={batchId, round:round.number, revision})`（`:60-63`）；`saveT09TaskPackage` 落账本；返回 JSON 字符串与 ids。

### 3.2 回件装载 `loadJudgeReply`（`:69-79`）

`readT09File` 解析（含 hash 校验）；须 `type==='reply'` 且 `judge-rating-reply`（`T09_NOT_A_JUDGE_REPLY`）；`caseId` 匹配（`T09_CASE_MISMATCH`）；`readT09TaskPackage(caseId, requestPackageId)` 找原任务且带完整 `batchId/round/caseRevision` 绑定（`T09_JUDGE_TASK_NOT_FOUND_OR_UNBOUND`）。

### 3.3 状态与冲突 `judgeState`（`:81-110`）

从 T07 当前轮次构造 `T09State.assignments`（recused→`missing`+`recused:true`，`:87-94`）；附加冲突：任务轮次≠当前轮、`caseRevision`≠聚合 revision、案卷已不在批次、量表版本变化、轮次已冻结（`:96-102`）。`checkedPreview` 把附加冲突并入 preview（rejected 优先不合并，`:115-116`）。

### 3.4 导入 `importT09JudgePackage`（`:128-208`）

1. **回执幂等**（`:134-144`）：`readT09Receipt(caseId, actionId)` 有回执但 hash/caseId 不同 → rejected“相同 actionId 已有不同载荷的持久回执，拒绝覆盖”；完全一致且 accepted → `duplicate`。
2. **崩溃恢复**（`:145-175`）：T07 CAS 可能已成功但 receipts.json 未写——只有 T07 事务里以 `offlineActionId` 持久标记的 vote 才可恢复（“Identical scores alone are never proof of import”，`:147`）；`existingVote` 逐字段比对（assignmentId/caseId/reviewerId/round/scores/publicFeedback/internalNotes，`:154-162`），不匹配 → rejected“评分动作 ID 已被持久记录，但载荷或签发任务不匹配”；匹配 → 生成 `accepted` 回执落账本，`duplicate`（`:169-174`）。
3. **预览**（`:176-177`）：非 ready 原样返回。
4. **组织者确认**（`:180`）：`confirmLocalOrganizer()` 否 → `T09_LOCAL_ORGANIZER_CONFIRMATION_REQUIRED`；注释明确重复回执/崩溃恢复不再需要二次确认或重复写分（`:178-179`）。
5. **T07 CAS 写入**（`:182-205`）：`importT09Reply` 的 apply 回调调 `deps.submitRating({batchId, reviewerId: task.recipient.actorId, expectedRevision, action:{type:'submit', assignmentId, offlineActionId, scores, publicFeedback, internalNotes?}})`；成功回执 `accepted`+`newRevision`；异常 → `rejected`+message（不抛出）。
6. accepted/duplicate 落 `saveT09Receipt`（`:206`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：由 `review-ipc` 的 T09 评委回件入口调用（签发/预览/导入三操作）。出向：`review-v3-t07-rating-workflow.currentT07Round`、`review-v3-t07-state-store.readT07State`、`review-v3-t09-offline-codec`（preview/import/readT09File）、`review-v3-t09-offline-issuer.issueT09JudgeFromCase`、`review-v3-t09-main-service`（T09 账本读写）。

## 5. 数据 I/O、读写与副作用

- **读**：T07 持久状态、T09 任务包/回执账本。
- **写**：T09 账本（`saveT09TaskPackage`/`saveT09Receipt`）；评分写入仅经注入的 `deps.submitRating`（T07 CAS）。
- **副作用**：无日志/网络；不写 votes 直身。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 批次不存在 | `:42` | throw `T09_JUDGE_BATCH_NOT_FOUND` |
| 轮次冻结/案卷不在批次/分配无效 | `:54-59` | throw 中文 |
| 包类型/案卷/任务绑定不符 | `:71-77` | throw `T09_*` |
| 回执载荷漂移 | `:135-141` | rejected |
| 恢复比对不匹配 | `:163-168` | rejected |
| 预览冲突 | `:177` | conflict/rejected 原样返回 |
| 缺组织者确认 | `:180` | throw `T09_LOCAL_ORGANIZER_CONFIRMATION_REQUIRED` |
| T07 CAS 失败 | `:200-203` | rejected+message |
| 取消/恢复 | 无 AbortSignal | 崩溃恢复见 §3.4.2 |

## 7. 权限与权威状态

- **身份边界**：包内 reviewerId 只是声明（文件头 `:5-6`）；导入必须 `confirmLocalOrganizer()`（本机可信确认，`:28` 注释“不能把包内角色当作授权依据”）。
- **权威状态**：评分唯一权威在 T07 轮次（votes 经 T07 CAS 写入，`offlineActionId` 标记）；T09 账本只存任务包/回执；回执幂等+崩溃恢复不重复写分。

## 8. 修改影响面

改导入/恢复语义 → 影响评委离线评分链路与 T07 评分状态；改 `judgeState` 冲突口径 → 预览 UX；`offlineActionId` 是 T07 Action 的字段契约（`Extract<T07Action,{type:'submit'}>`，`:18/:193`）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-t09-judge-adapter.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不维护第二份评分状态、写入走 T07 CAS | 已证实 | 文件头 `:3-4`、`:189-197` |
| 包内身份非授权依据；组织者显式确认 | 已证实 | `:5-6/:28/:180` |
| 崩溃恢复只认 `offlineActionId` 持久标记 | 已证实 | `:145-175` |
| 回执幂等+载荷漂移拒绝 | 已证实 | `:134-144` |
| 冲突预览合并批次/轮次/量表/版本差异 | 已证实 | `:81-117` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `T09JudgeImportDeps`/结果类型 | 2 | `:20-38` | covered |
| `issueT09JudgePackage` | 3.1 | `:47-67` | covered |
| `loadJudgeReply` | 3.2 | `:69-79` | covered |
| `judgeState`/`checkedPreview` | 3.3 | `:81-117` | covered |
| `previewT09JudgePackage` | 3.3 | `:120-125` | covered |
| `importT09JudgePackage` 幂等/恢复/确认/写入 | 3.4 | `:128-208` | covered |
