---
path: apps/electron/src/main/lib/review/rating-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 25a4065aaeccac40fca944200503f7f1456e0159
sha256: 18880831367a8ab6b678f848e09ae8ae99bf601d2857cca5e30fa852b5b5cb23
lines: 90
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/rating-service.test.ts

## 1. 测试目标

G06/G11 + 复查 §5.4：唯一票、缺评、N/A 两策略、最低人数、castRating 事务查重、轮次隔离。

## 2. 用例清单

9 用例 / 3 describe。夹具 rubric（d1 权重 3/d2 权重 1、minJudges 2）+ `rating` 帮手（:16-20）；`PROFER_CONFIG_DIR` 隔离（:9-10）；castRating 走真实聚合 `createAggregate`。

| describe | # | 用例（行） | 核心断言 |
| --- | --- | --- | --- |
| 评分聚合（G06） | 6 | 加权平均（22-27） | `average 4.13`、`effectiveJudges 2` |
| | | N/A block 阻断（29-33） | blocked 含 `N/A`、有效 1 |
| | | exclude-renormalize（35-40） | `perJudge[0].total===4`、blocked 0 |
| | | 缺评阻断（42-46） | blocked 含 `缺评`、`average` null |
| | | 最低人数（48-51） | blocked 含 `最低人数` |
| | | 重复票（53-57） | blocked 含 `重复票` |
| 提交事务 | 1 | 同评委重复提交（61-70） | 第二次 `ok` false、`code==='INVALID_TRANSITION'` |
| 轮次隔离 | 2 | 按 R2 汇总只算 R2（74-80） | `effectiveJudges 1`、`average 5` |
| | | 同人不同轮次可提交（82-90） | rr1/rr2 均 `ok` true |

## 3. 真实断言

如 §2 表内（逐条读自 :22-90）；加权注释 :25 明示算式 `(4*3+2)/4=3.5 与 (5*3+4)/4=4.75 → 4.125 → 4.13`。

## 4. 未覆盖与脆弱点

- 未覆盖：越界维度分支、weightBase=0、`missingStrategy`（rubric 字段在本算法未消费——`aggregateRatings` 只用 naStrategy/minEffectiveJudges，记录）。
- 脆弱点：`rating` 夹具 `at:''`；castRating 用例共用 `case-rate-1`（顺序依赖）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例断言如 §2 | 已证实 | 本文件逐行 |
| 四不变量（唯一票/缺评/N-A/minJudges）被固定 | 已证实 | 用例 1-6 |
| 轮次隔离被固定 | 已证实 | 用例 8-9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| aggregateRatings 两策略/阻断族 | §2 | covered |
| castRating 唯一票 | §2 | covered |
| 轮次过滤/跨轮新票 | §2 | covered |
| 越界/weightBase=0 | §4 | unknown（未测） |
