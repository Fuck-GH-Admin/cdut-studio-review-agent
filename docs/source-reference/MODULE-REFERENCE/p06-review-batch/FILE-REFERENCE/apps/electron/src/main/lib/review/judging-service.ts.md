---
path: apps/electron/src/main/lib/review/judging-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ece9bbdc899349495f6c7d14519f53ab49136a45
sha256: c744d43ed4ca0c90773fc32903c865f014ee4a5f58d3ae14b2f973d444778836
lines: 182
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/judging-service.ts

## 1. 结论与边界

批次与评委评分服务（文件头 `:1-9`，M4）：批次锁定模板/规则版本（A12）；评委独立评分（提交前互不可见）；回避（recused）≠缺评（missing 由 missingStrategy 处理）；汇总排除 na 维度、block 策略缺评阻止定稿、总分按 rubric 精度取整、同分共享名次（A14）。权重和为 0/维度非法已在 M1 `validateTemplate` 拦截，此处信任量表契约（`:8`）。纯函数集，无 I/O。

不做的事：不落盘（返回新数组/对象）；不做独立性隔离的存储层（调用方保证互不可见）；不处理 T07 轮次（`review-v3-t07-*` 是后续实现）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `createBatch` | `:15-27` | `(template, name, caseIds) => ReviewBatch` |
| `assignJudge` | `:31-49` | `(assignments, input) => JudgeAssignment[]` |
| `RatingSubmitInput` | `:51-60` | 提交评分输入 |
| `submitRating` | `:63-90` | `(ratings, input) => JudgeRating[]` |
| `DimensionAggregate` | `:94-101` | `{dimensionId; name; voters; average; weighted}` |
| `CaseAggregate` | `:103-109` | `{caseId; dimensions[]; total: number\|null; naDimensions[]}` |
| `aggregateCaseRatings` | `:112-152` | 案卷评分汇总 |
| `RankingEntry` | `:154-159` | `{caseId; total; rank}` |
| `finalizeRanking` | `:162-182` | 排名（同分共享名次） |

## 3. 内部逻辑与关键流程

### 3.1 `createBatch`（`:15-27`）

模板须 published（“批次只能基于已发布模板创建（A12）”）；caseIds 非空；`policyVersionLock = policyVersionIds.map(id => ({policyVersionId:id, version: 1}))`（**:23 写死 version 1**——与 `batch-store.resolvePolicyVersionLock` 的“缺权威版本拒绝建批、不臆造 v1”（`batch-store.ts:103-106`）口径相反，照实记录）。

### 3.2 `assignJudge`（`:31-49`）

同案同人重复（status≠missing）→ “评委已分配” throw；`status: input.recused ? 'submitted' : 'assigned'`（**:46 回避即 'submitted'**——quirk，与 JudgeAssignment 语义表不直观）。

### 3.3 `submitRating`（`:63-90`）

逐维度：缺评分 → “缺少维度评分…必须覆盖全部维度或显式 N/A”；na 且给分 → 拒；null 且 `missingStrategy==='block'` → “无法提交”；分值越界拒（`[min,max]`）。追加 `JudgeRating`（publicFeedback/internalNotes 分列，A14）。

### 3.4 `aggregateCaseRatings`（`:112-152`）

`activeAssignments` 排除 recused；`activeRatings` 只认这些分配的评分；逐维度：valid（非 na 非 null）求平均、`weighted=average*weight`（无有效值 weighted 0）、全 na 记入 `naDimensions`；`missingVoters = 分配数-评分数`，block 且 >0 → `total:null`（无法定稿）；否则 `total = Σweighted/Σweight` 按 `totalPrecision` 取整（weightSum 0 时除 1）。

### 3.5 `finalizeRanking`（`:162-182`）

过滤 `total!==null`；`tieBreaker==='by-dimension'|'owner-decides'` 分支**为空**（注释“简化：并列仍由发起人决断…共享名次逻辑不适用”，`:164-166`——无实际行为差异，照实记录）；按 total 降序，同分共享名次、后续跳位（1,1,3）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`report-service-v2.ts`（汇总/排名消费）；直接测试 `judging-service.test.ts`。出向仅 `@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/日志；`now()`（`submittedAt/createdAt`）取系统时间。幂等性：同输入同输出（除时间戳）。

## 6. 分支、失败、取消与恢复

throw 族：模板未发布/空案卷/重复分配/缺维度/na 给分/block 缺评/越界（见 §3）。无异步、无取消/恢复。

## 7. 权限与权威状态

无 actor/权限分支；“提交前互不可见”由调用方保证（文件头 `:6`）。权威口径：block 缺评 → `total:null` 不定稿（A14/D05）；na 维度排除出平均。

## 8. 修改影响面

改汇总/排名 → 影响 `report-service-v2` 与评分报表；改 `createBatch` 政策锁 → 与 `batch-store` 口径联动（注意 §3.1 差异）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `judging-service.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| A12/A14 语义（锁定/独立/block/共享名次） | 已证实 | 文件头、`:111-182` |
| `createBatch` 写死 policy version 1 | 已证实 | `:23`（与 batch-store 口径差异） |
| `assignJudge` recused→status 'submitted' | 已证实 | `:46`（quirk） |
| tieBreaker 分支为空 | 已证实 | `:164-166` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createBatch` | 3.1 | `:15-27` | covered |
| `assignJudge` | 3.2 | `:31-49` | covered |
| `submitRating` | 3.3 | `:63-90` | covered |
| `aggregateCaseRatings` | 3.4 | `:112-152` | covered |
| `finalizeRanking` | 3.5 | `:162-182` | covered（tieBreaker 空分支已记） |
