---
path: apps/electron/src/main/lib/study/fim-estimator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1870f77e7129c44a7ee322dbdae6e346a91c7ec9
sha256: 179db9f70477531b58075cf73ed56a64b5c4ef03ef57ac49ced2129ba3394ba2
lines: 92
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/study/fim-estimator.ts

## 1. 结论与边界

连续 **Fisher 信息矩阵（FIM）认知水平追踪引擎**（`apps/electron/src/main/lib/study/fim-estimator.ts:1-13`）：2PL IRT 模型刻画潜伏能力 θ∈[-3,+3]——`P=1/(1+exp(-a(θ-b)))`；作答后在线梯度更新 `θ'=clamp(θ+η·a·(u-P), -3, +3)`。纯函数可直接单测（`:13`）。

边界：θ 恒钳制 [-3,3]（`clampTheta` 非有限→0，`:44-46`）；学习率缺省 0.6（`:67`「兼顾收敛速度与稳定性」）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FimItemParams` | interface | 16-22 | `{discrimination; difficulty}` |
| `THETA_MIN`/`THETA_MAX` | const | 25-26 | -3/3 |
| `itemParamsForDifficulty` | function | 29-38 | easy(-1.0)/hard(1.2)/medium 缺省(0.2) 三档 |
| `fimProbability` | function | 41-44 | 2PL 概率 |
| `fimInformation` | function | 47-51 | `I(θ)=a²·P·(1-P)` |
| `updateTheta` | function | 60-68 | 单题在线梯度（η=0.6） |
| `estimateTheta` | function | 73-81 | 按序在线更新整体估计 |
| `describeTheta` | re-export | 92 | **自 `@profer/shared`**（真源 fim-engine.ts:8） |

## 3. 内部逻辑与关键流程

`updateTheta`（`:60-68`）：`p=fimProbability`→`θ+η·a·(u-p)`→clamp。`estimateTheta`（`:73-81`）：初值 clamp→逐题 update。`itemParamsForDifficulty`（`:29-38`）：三档 2PL 参数（hard 区分度 1.4）。

## 4. 调用者与调用链

出向：`@profer/shared`（describeTheta re-export，`:92`）。入向（检索=符号名+模块名，全冻结树）：`study/study-session-store.ts:34,278-279`（estimateTheta/itemParamsForDifficulty，**产品链** ← main/ipc.ts:194）；`fimProbability`/`fimInformation`/`updateTheta`/2 常量/接口**零外部引用**（仅内部+测试）；`describeTheta` 经本模块唯一消费=cognition-engine.test:16,137-138（**renderer 直引 shared 版不经此处**：AiClassQuizTab.tsx:12,145）。⚠ 碰撞：describeTheta 三级再导出链（shared fim-engine→utils/index→本文件）。测试：`cognition-engine.test.ts`（本批 25 test 中 FIM 段）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径（clamp 兜底）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；2PL 公式与 θ 边界（`:4-10`）是模型口径声明。

## 8. 修改影响面

η/档位参数影响测验能力估计；测试锚在 cognition-engine.test FIM 段（BDD-QUIZ-01）。

## 9. 测试证据

`study/cognition-engine.test.ts`（本批，FIM 段断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2PL 公式+clamp [-3,3] | 已证实 | `:4-10,44-46` |
| 三档难度参数 | 已证实 | `:29-38` |
| 5 导出零外部引用+describeTheta 三级链 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 真实学习数据拟合 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2 | 16-92 | covered |
| 概率/信息/更新 | §3 | 41-81 | covered |
