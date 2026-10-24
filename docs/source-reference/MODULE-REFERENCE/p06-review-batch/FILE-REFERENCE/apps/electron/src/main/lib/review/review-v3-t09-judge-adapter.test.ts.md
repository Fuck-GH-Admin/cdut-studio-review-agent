---
path: apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 01e891ee5e743c91902029b9f0f5723b4b944824
sha256: 3b9276cd85e18666891a2e27314dba8cc8e1cf82d728270c998180466249eca6
lines: 145
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t09-judge-adapter.test.ts

## 1. 测试目标

F18（文件头 `:1`）：真实 T07 评分状态的离线往返，含版本冲突、重复包和匿名投影。被测：`review-v3-t09-judge-adapter.{issueT09JudgePackage,previewT09JudgePackage,importT09JudgePackage}`；协作 `review-v3-t07-state-store`、`review-v3-t07-main-service.applyT07MainAction`（真实 CAS）、`offline-codec.answerT09Task`、`batch-store.createBatchV2`。夹具：`PROFER_CONFIG_DIR=mkdtemp(f18-judge-)`（`:9-11`）；`seedFreshBatch`（`:45-62`）按 JDG-09 轮次新鲜度门建真实批次+已发布模板（rubricVersion 4、d1 质量 0-5）；`deps.submitRating` 委托 `applyT07MainAction`（`:74-83`）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**3 test**：

| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:86-115` | 签发只含匿名投影（json 不含“实名学生”“张某”）、round 1；预览 ready；导入 accepted（votes 1 条、score 4）；重导 `duplicate`（confirmLocalOrganizer 抛错也不触发，votes 仍 1）；删 `receipts.json` 后再导 → `duplicate`（按 vote 的 `offlineActionId` 恢复），votes 仍 1 且 `offlineActionId===actionId` |
| 2 | `:117-132` | 案卷 revision 4 预览 → `conflict`、details 含“案卷版本已变化”；分配改 recused 后导入 → `conflict`、votes 0（不覆盖当前评分） |
| 3 | `:134-144` | `confirmLocalOrganizer:false` → throw `T09_LOCAL_ORGANIZER_CONFIRMATION_REQUIRED`；篡改 publicFeedback（“伪造反馈”）→ throw；votes 0 |

## 3. 真实断言

- #1 的 `not.toContain('张某')` 是匿名投影实证（聚合夹具 title/字段故意含实名）。
- #1 崩溃恢复：删除 receipts.json 后仍 `duplicate` 且 votes 1——“恢复只认 offlineActionId 持久标记，不靠分数相同”的注释断言（`:106-108`）。
- #1 重导用会 throw 的 `confirmLocalOrganizer`（`:101`）——duplicate 不得触发二次确认（`judge-adapter.ts:178-179` 语义）。
- #2/#3 断言 votes 数量不变（不覆盖/不写入）。

## 4. 未覆盖与脆弱点

**未覆盖**：`issueT09JudgePackage` 的分配无效分支；`loadJudgeReply` 的 `T09_*` 错误族；提交失败（submitRating 抛错→rejected 回执）路径；量表版本变化冲突；`scoringBinding` 的 batchId/round 不匹配。

**脆弱点**：`rmSync(receipts.json)` 制造崩溃现场依赖账本路径约定；`deps.submitRating` 走真实 `applyT07MainAction`（T07 行为变化会连带）；聚合夹具 `as never`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、3 test、真实 T07 CAS | 已证实 | `:85`；`applyT07MainAction` `:78-81` |
| 匿名投影不含实名 | 已证实 | `:90-91` |
| 幂等重导不重复计票、不二次确认 | 已证实 | `:100-104` |
| 崩溃恢复认 offlineActionId | 已证实 | `:106-114` |
| 冲突（版本/回避）不覆盖评分 | 已证实 | `:117-132` |
| 组织者确认/篡改拒绝 | 已证实 | `:134-144` |
| 失败/其它冲突分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `issueT09JudgePackage` | #1 | `:89-92` | covered |
| `previewT09JudgePackage` 冲突 | #2 | `:121-123` | covered |
| `importT09JudgePackage` 幂等/恢复 | #1 | `:95-114` | covered |
| 回避/确认/篡改拒绝 | #2/#3 | `:117-144` | covered |
| 失败路径/量表冲突 | — | — | unknown |
