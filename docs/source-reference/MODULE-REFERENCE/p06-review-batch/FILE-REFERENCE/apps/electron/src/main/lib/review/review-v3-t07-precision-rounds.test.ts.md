---
path: apps/electron/src/main/lib/review/review-v3-t07-precision-rounds.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 47e1c9c10387d4457f28b986c5897d0f896802a2
sha256: 456bc0b0923f3d5135938707981aa6d383de7015804cdb312b150d01a66d5694
lines: 133
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t07-precision-rounds.test.ts

## 1. 测试目标

T07 评分精确性与轮次闭环回归（文件头 `:1-4`，JDG-05/06/08/13）：**直接回放审计报告中的数值与动作**，防止退回浮点 toFixed 或可绕过门禁。被测：`review-v3-t07-rating-workflow.{applyT07Action,computeT07Ranking,currentT07Round}`（纯函数）。夹具：`RubricSpec`（d1 综合、精度 2、exclude、minEffective 1、by-dimension、quota 1）+ `base/assign/submit` 辅助。本轮 `NOT_RUN`。

## 2. 用例清单

4 describe、**7 test**：

### 2.1 JDG-05 评分精确性（2，`:42-58`）
1. `:43-48` 单维 2.675、精度 2 → **2.68**（定点 half-up，与 F08 一致，非浮点 2.67）。
2. `:50-57` 双评委均值 2.675+2.675 → `total===2.68` 且 `dimensions[0].average===2.68`（均分与总分一致）。

### 2.2 JDG-06 按维度同分闭环（2，`:60-95`）
3. `:61-87` 双维度交叉分（c1:3/1、c2:1/3，总分均 2）：未指定维度时 `total===2` 且有 `blockers`（阻断）；`set-tie-dimension('d1')` 后 c1 `rank===1`、`selected===true`、c2 `selected===false`；`finalize` 后 `currentT07Round(frozen).finalized` 已定义。
4. `:89-94` 指定不存在维度 'nope' → throw；`tieBreaker:'shared-rank'` 下 set-tie-dimension → throw。

### 2.3 JDG-08 负名额（1，`:97-107`）
5. `:98-106` `quota:-1`：全部 `selected!==true`、blockers 含“名额”、`finalize` 抛错（不得冻结空名单）。

### 2.4 JDG-13 动作账本（2，`:109-133`）
6. `:110-121` assign→submit→finalize 账本：`actionType` 序列精确、`actorId==='j1'`、`at` 非空、actionId 全唯一、`stateDigest` 全 16 hex。
7. `:123-132` 同一 `offlineActionId:'offline-1'` 二次入账 → throw `/T07_ACTION_REPLAY/`。

## 3. 真实断言

- #1/#2 是审计数值回放（2.675→2.68 定点）——“防止退回浮点 toFixed”的直接反证。
- #3 断言阻断→裁定→冻结全链（blockers/selected/finalized）。
- #6 断言账本不可覆写要素（唯一 id+stateDigest 格式）。
- #7 断言离线 actionId 幂等拒重放（与 t09-judge-adapter 的 `T07_ACTION_REPLAY` 语义一致）。

## 4. 未覆盖与脆弱点

**未覆盖**：回避/缺评门控细节（t07-main-service.test #6 部分覆盖）；`naEligible`；多轮（round 2+）；`T07_ACTION_REPLAY` 的错误码字段断言（用正则）。

**脆弱点**：`base()` 纯内存 state；`quota:-1` 是构造非法值探测；stateDigest 16 位格式断言随实现。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 describe、7 test、纯函数回放 | 已证实 | `:42/:60/:97/:109`；`grep -c test(`=7 |
| 定点 half-up 2.675→2.68 | 已证实 | `:43-57` |
| 同分维度裁定闭环 | 已证实 | `:61-94` |
| 负名额阻断 | 已证实 | `:98-106` |
| 账本不可覆写+离线幂等 | 已证实 | `:110-132` |
| 多轮/回避细节 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 评分精确性 | #1/#2 | `:43-57` | covered |
| `set-tie-dimension`/finalize | #3/#4 | `:61-94` | covered |
| quota 阻断 | #5 | `:98-106` | covered |
| actionLog/REPLAY | #6/#7 | `:110-132` | covered |
