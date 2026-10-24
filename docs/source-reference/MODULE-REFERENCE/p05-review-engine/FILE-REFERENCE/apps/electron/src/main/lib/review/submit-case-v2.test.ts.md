---
path: apps/electron/src/main/lib/review/submit-case-v2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5d08c666040734a54a6f0eb9e9c4938805392b9
sha256: 570f05e292213bc1451486c9a2abf4bfcbd06e9c9b43eed0e350624883f285a8
lines: 131
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/submit-case-v2.test.ts

## 1. 测试目标

提交案卷的原子事务（`submitCaseV2` 门槛）与分项案卷创建：有申报表无证明可提交、无申报表阻断、幂等、分项必需校验。不运行（`NOT_RUN`）。

## 2. 用例清单

7 用例（grep `test(` 计 7），describe「提交案卷的原子事务」等。fixture：`publishComprehensiveFixture` 全局前置（:19）、`seed()`（:22-28 建案+registerMaterial 两次）。
1. 有申报表无证明仍可提交（:32-42）：`result.ok` true、`readAggregate(...).caseV2.stage` `submitted'`。
2. 无申报表被门槛阻断（:43-55 区间）。
3-5. 提交原子落盘（revision+1/首任务 auto-check/receiptLog）、旧实现 submitted 无任务恢复补任务（revision=3）、提交重试幂等。
6-7. 分项案卷创建（:101-131）：两级分项字段/断言 `subjects.map([sectionId,title])` toEqual `[['study','课程学业表现'],['service','志愿服务记录']]`、字段值 toEqual `{kind:'number',value:24}` 等（:115-123）；缺必需分项 `rejects.toThrow('案卷缺少必需分项：志愿服务')`（:127-131）。

## 3. 真实断言

代表行：`:39-40` `expect(result.ok).toBe(true)`、`expect(readAggregate(...)?.caseV2.stage).toBe('submitted')`；`:115-123` 分项断言；`:127-131` `rejects.toThrow('案卷缺少必需分项：志愿服务')`。

## 4. 未覆盖与脆弱点

未覆盖：并发 revision 冲突分支细节。mock 边界：真实 application-service/case-store-v2/material-service/stage-workflow；`PROFER_CONFIG_DIR` mkdtemp 隔离（:15-17）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例计数 | 已证实 | grep |
| 断言要点如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 环节 | 用例 | 状态 |
| --- | --- | --- |
| 提交门槛/幂等 | #1-#5 | covered |
| 分项创建/缺项拒绝 | #6-#7 | covered |
| 并发冲突 | — | unknown |
