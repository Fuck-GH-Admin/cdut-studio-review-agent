---
path: apps/electron/src/main/lib/review/mock-review-engine.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8dfe1ebe41c0e4476173b6461c77cfa90d5b0361
sha256: dec6a56afec5dea724963a9008ba1f3d153042f13ccbdf609d12967bf7a5cf27
lines: 360
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/mock-review-engine.ts

## 1. 结论与边界

确定性模拟审核引擎（文件头 `:1-16`，D6）：无模型凭证/网关不可用时的**演示降级路径**，纯规则比对产出与 AI 路径同 schema 的审核发现，结果显式 `generatedBy:'mock-engine'`。六类检查（等级冲突/缺证明/分值超上限/互斥计分/日期越界/证明看不清），遍历 `rulePacks[0].outline` 的 constraint 逐条核对。只读案卷数据，不写盘、不联网、可单测。

不做的事：不落盘/网络；不补 id/时间/状态（`run-service` 补齐，`:348`）；不是模型审核（`generatedBy` 标记 + 缺证明/看不清强制人工）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MockReviewResult` | interface | `:29-37` | `{findings[]; coverage{reviewedItemIds, manualReviewItemIds, unrecognizedDocumentIds, ruleUncoveredItemIds}}` |
| `buildFindingsForCase` | function | `:113-343` | `(reviewCase) => MockReviewResult`（纯函数核心） |
| `runMockReview` | function | `:350-360` | 返回 `Omit<ReviewRun,'id'|'startedAt'|'completedAt'|'status'|'inputVersion'>`，`engine:'mock-engine'` |

内部：`VOLUNTEER_LABOR_GROUP='volunteer-labor'`（`:40`）；`isCompetitionCategory`（`:43-45`，category+title 含“竞赛”）；`belongsToVolunteerLabor`（`:48-51`，含“志愿”/“劳动”）；`findLevelRule`（`:54-56`，category `'等级分值'`）；`indexEvidences`（`:59-63`）；`firstBlockAnchor`（`:66-71`，文档无块不给锚点不伪造坐标）；`buildFinding`（`:74-105`，公共骨架+`generatedBy:'mock-engine'`）。

## 3. 内部逻辑与关键流程

`buildFindingsForCase`（`:113-343`）逐 item：

1. **等级冲突（红）**（`:135-166`）：`item.level` 与关联证据 `recognizedLevel` 都存在且不等 → finding（引用 `等级分值` 条款或“请人工确认适用规则”；evidenceAnchor 取首块）。
2. **缺证明（黄）**（`:168-193`）：`evidenceDocumentIds` 空 → finding（引用 `required-evidence` 条款；**不伪造证明侧坐标**（无 evidenceAnchor，`:190` 注释）；计入 `manualReviewItemIds`）。
3. **证明看不清（黄）**（`:195-223`）：证据 `parseStatus==='unclear'` → finding（“看不清的印章…不能推断为一致，也不能表述为已通过”）；manualReview。
4. **分值超上限（红）**（`:226-263`）：`max-score` 约束，学科竞赛类（category/title 含“竞赛”）合计 > 上限 → 逐条 finding，`suggestedScore = max(0, 上限 - 其余合计)`。
5. **互斥计分（红）**（`:265-294`）：`mutual-exclusion`，组为 `volunteer-labor`（默认）时按“志愿/劳动”命中，组内 ≥2 条 → 逐条 finding。
6. **日期越界（红）**（`:296-324`）：`date-range`，`activityDate` ISO 字符串比较越界（`dateFrom/dateTo` 单边“不限”）→ finding。

覆盖摘要（`:327-342`）：`reviewedItemIds` 全量；`ruleUncoveredItemIds` = 未命中任何 constraint 的条目；`unrecognizedDocumentIds` = `parseStatus==='failed'` 的文档。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`run-service`（演示降级路径，调 `runMockReview` 补 id/时间/状态）；直接测试 `mock-review-engine.test.ts`。出向仅 `@profer/shared` 类型（V1 `ReviewCase`/`ReviewFinding` 等）。

## 5. 数据 I/O、读写与副作用

纯函数；只读 `ReviewCase`；无 I/O/日志。`nextId` 顺序号 `find-001…` 确定性。

## 6. 分支、失败、取消与恢复

无 throw（缺规则/缺锚点降级文案）；六类检查全部是数据分支；无异步、无取消/恢复。

## 7. 权限与权威状态

诚实边界：`generatedBy:'mock-engine'` 显式标记（`:100`）；缺证明/看不清强制人工（`manualReviewItemIds`）；“不给出自动结论”“不能推断为一致”（`:213-214`）；不伪造锚点（`:66`、`:190`）。类别判定用关键词（“竞赛”“志愿/劳动”）——fixture 语义耦合（`:42/:47` 注释自认）。

## 8. 修改影响面

改 finding kind/severity/文案 → 影响演示链路与 `mock-review-engine.test.ts`；改覆盖摘要 → 影响 run-service 的 coverage 组装；`ReviewFinding` schema 联动 `@profer/shared`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `mock-review-engine.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯函数、不写盘联网、mock-engine 标记 | 已证实 | 文件头、`:100/:350-360` |
| 六类检查语义与文案 | 已证实 | `:135-324` |
| 缺件/看不清不伪造结论与坐标 | 已证实 | `:190/:213-214` |
| suggestedScore=上限-其余合计 | 已证实 | `:240-243` |
| 关键词类别判定（fixture 耦合） | 已证实 | `:42-51` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MockReviewResult`/内部辅助 | 2 | `:29-105` | covered |
| 检查 1/2/6（逐 item） | 3 | `:135-223` | covered |
| 检查 3/4/5（逐 constraint） | 3 | `:226-324` | covered |
| 覆盖摘要 | 3 | `:327-342` | covered |
| `runMockReview` | 2 | `:350-360` | covered |
