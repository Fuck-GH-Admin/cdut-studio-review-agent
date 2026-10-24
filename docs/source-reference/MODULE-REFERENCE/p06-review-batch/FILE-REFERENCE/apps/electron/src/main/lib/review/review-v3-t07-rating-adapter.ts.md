---
path: apps/electron/src/main/lib/review/review-v3-t07-rating-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 338dc172c3826e4a2c928b8af111770905762e88
sha256: c733da5efef8cd8cf573255686ceb6d8fe981f1e745e68acf85b733ac8fc12ee
lines: 77
kind: source
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-rating-adapter.ts

## 1. 结论与边界

T07 与遗留独立评审（M4 `JudgeAssignment`/`JudgeRating`/`RatingEntryV2`）及 T09 当前「评委评分离线回件」之间的**纯转换层**（运行时代码，纯函数）。文件头 `apps/electron/src/main/lib/review/review-v3-t07-rating-adapter.ts:1-5`：只做翻译，不读写 CaseStore、不导入离线包；L/Main 在应用动作前核 assignment/actor/案卷修订。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `fromLegacyJudgeAssignments` | 导出函数 | 10 | `(assignments: JudgeAssignment[]): T07Assignment[]` | M4 分配→T07（`recused` 优先于原 status） |
| `toLegacyJudgeRating` | 导出函数 | 18 | `(vote: T07Vote, rubricVersion: number): JudgeRating` | T07 票→M4 评分（scores 浅拷贝） |
| `fromLegacyCastRatings` | 导出函数 | 32 | `(records: RatingEntryV2[], round: T07Round, rubric: RubricSpec, stageId: string): T07Vote[]` | 旧 CastRating 导入（按 stageId+round+真实分配过滤） |
| `T07OfflineReply` | 导出类型 | 53 | `{stageId, round, scores: Record<string, number\|'N/A'>}` | T09 回件形状 |
| `toT09JudgeRatingReply` | 导出函数 | 54 | `(vote: T07Vote, stageId: string): T07OfflineReply` | 票→回件（`na?'N/A':score`） |
| `fromT09JudgeRatingReply` | 导出函数 | 61 | `(reply, round, caseId, reviewerId, rubric, publicFeedback?, internalNotes?): Extract<T07Action,{type:'submit'}>` | 回件→submit 动作提案 |

无内部函数/状态。

## 3. 内部逻辑与关键流程

- `fromLegacyJudgeAssignments`（`:10-17`）：字段直映射；`status: a.recused ? 'recused' : a.status`（`:14`）。
- `toLegacyJudgeRating`（`:18-26`）：`scores` 逐项展开拷贝（`:22`），`submittedAt` 取票。
- `fromLegacyCastRatings`（`:32-50`）：先滤 `stageId===stageId && round===round.number`（`:36`）；再按 `caseId+actor` 找 round.assignments，**无分配或 recused 跳过**（`:38-39`）；维度分数映射 `raw==='N/A'` → `{score:null, na:true}`、undefined → `{score:null, na:false}`（`:42`）；`publicFeedback:''`。注释：原 raw ratings 不动，是否对账由调用方决定（`:30`）。
- `toT09JudgeRatingReply`（`:54-59`）：`Object.fromEntries` 重建 scores 映射。
- `fromT09JudgeRatingReply`（`:61-77`）：**只产提案不信任包内身份**（注释 `:60`）；轮次不符抛 `'评分包来自旧轮次，请核对差异后重发'`（`:65`）；按 `caseId+reviewerId+status==='assigned'` 找有效分配，无则抛 `'评分包没有与当前轮次匹配的有效分配'`（`:66-67`）；scores 按 rubric.dimensions 映射（`:70-74`）。

## 4. 调用者与调用链

入向：冻结树检索 `fromLegacyJudgeAssignments|toLegacyJudgeRating|fromLegacyCastRatings|toT09JudgeRatingReply|fromT09JudgeRatingReply` —— 见下方 §10 否定/肯定声明。出向：`@profer/shared` 类型（`:6`）、`./review-v3-t07-rating-workflow` 类型（`:7`）。无 I/O、无副作用、纯函数。

## 5. 数据 I/O、读写与副作用

无磁盘/网络/全局状态；纯内存转换。输出动作仅为提案（调用方 Main 校验后经 `applyT07Action` 落账）。

## 6. 分支、失败、取消与恢复

失败仅两处 throw（`:65/:67`，`fromT09JudgeRatingReply`）；其余静默过滤（recused/无分配跳过）。无取消/恢复概念。

## 7. 权限与权威状态

无权限分支（纯转换，无 sender/actor 判定）；身份权威原则写在注释（`:60`：绝不信任包内 reviewerId/role；`:4`：L/Main 核 assignment/actor/修订）。

## 8. 修改影响面

改转换形状影响 T07↔M4/T09 数据互操作（导入旧评分、离线回件链路）；`fromT09JudgeRatingReply` 的校验文案被 T09 离线回件 UI 依赖。

## 9. 测试证据

**无专属测试**（冻结树 glob `**/*t07-rating-adapter*test*` 零命中）；`review-v3-t07-rating-workflow.test.ts` 不覆盖本文件符号。全部分支无断言（NOT_RUN）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出与行号、映射规则 | 已证实 | `review-v3-t07-rating-adapter.ts:10-77` |
| 两处 throw 文案与条件 | 已证实 | `:65/:67` |
| 无消费者（全树检索） | 已证实（静态） | `apps/**`、`packages/**` 全扩展名检索 5 个导出符号仅命中本文件与类型定义——**当前无调用者**（潜在死代码/预留接口，推断用途为 T09 离线链路） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部 6 导出 | §2/§3 | 10-77 | covered |
| 测试断言 | §9 | — | unknown（无测试） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
