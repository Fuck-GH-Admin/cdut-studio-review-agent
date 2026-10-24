---
path: apps/electron/src/main/lib/review/judging-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d68661e703d3dbeaa9cfd0491724d3aa38a71040
sha256: 3934c8c7670ac4a70882a63348a84533f76fde11355d2207894907fe1e5aef70
lines: 82
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/judging-service.test.ts

## 1. 测试目标

批次与评委评分单测（文件头 `:1-3`，M4，A14/A12）：独立/回避/缺评策略/共享名次、版本锁。被测：`judging-service.{createBatch,assignJudge,submitRating,aggregateCaseRatings,finalizeRanking}`。纯内存（rubric d1 创新性 0.4/d2 可行性 0.6、`missingStrategy:'exclude'`、`tieBreaker:'shared-rank'`）。本轮 `NOT_RUN`。

## 2. 用例清单

3 describe、**6 test**：

### 2.1 批次（A12，1，`:35-42`）
1. `:36-41` 已发布模板建批：`policyVersionLock===[{policyVersionId:'p1', version:1}]`、`templateVersion===1`；`status:'draft'` 抛“已发布”。

### 2.2 评分提交（A14，2，`:44-54`）
2. `:45-49` 越界（d1=9）抛“超出范围”；缺 d2 抛“缺少维度评分”；block 策略下 d2 null 抛含“block”。
3. `:51-53` na+给分并存抛“N/A”。

### 2.3 汇总（A14/D05，3，`:56-82`）
4. `:64-68` 回避 a3 排除：d1 `voters===2`；`total≈4.80`（4.5×0.4+5×0.6，精度 2）。
5. `:70-75` block 策略缺评：`total===null`（不定稿）。
6. `:77-81` 同分排名 `[1,1,3]`（共享名次+跳位）。

## 3. 真实断言

- #1 断言政策锁精确数组（含写死的 `version:1`——与实现一致）。
- #4 用 `toBeCloseTo(4.8, 2)` 断言加权精度；`voters===2` 证明回避排除。
- #6 断言 rank 数组精确 `[1,1,3]`。

## 4. 未覆盖与脆弱点

**未覆盖**：`assignJudge` 全函数（重复分配/recused→submitted quirk）；`submitRating` 成功路径；naDimensions 全 na 维度记录；`tieBreaker:'by-dimension'/'owner-decides'` 空分支；weightSum 0 除 1 回退。

**脆弱点**：夹具 `template as unknown as` 绕过类型；`makeRating` 的 na 组合构造较绕（`:25`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 describe、6 test、纯内存 | 已证实 | `:35/:44/:56`；`grep -c test(`=6 |
| A12 版本锁+发布门 | 已证实 | `:36-41` |
| 提交校验（越界/缺维度/block/na） | 已证实 | `:45-53` |
| 回避排除/加权精度/block null | 已证实 | `:64-75` |
| 共享名次 1,1,3 | 已证实 | `:77-81` |
| assignJudge/tieBreaker 分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `createBatch` | #1 | `:36-41` | covered |
| `submitRating` 拒绝族 | #2/#3 | `:45-53` | covered |
| `aggregateCaseRatings` | #4/#5 | `:64-75` | covered |
| `finalizeRanking` | #6 | `:77-81` | covered |
| `assignJudge` | — | — | unknown |
