---
path: apps/electron/src/main/lib/review/rating-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ff6d6a4513621d77137b835b4a754f59f39261d3
sha256: 6b19b23533c10c0372427ff3916dce93c3c7c954898a5e35b66f0c8bc7b0b137
lines: 119
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/rating-service.ts

## 1. 结论与边界

独立评分服务（G06/G11，头注 :1-7，针对复查断点：重复计票/缺评/N-A 计算错误）：`castRating` 一评委一次评分（同阶段同人同轮重复 → INVALID_TRANSITION，唯一票）；`aggregateRatings` 加权平均 + N/A 两策略 + 缺评门控（有效评委 < minEffectiveJudges 不能定稿）。评分经命令事务落盘（幂等键 requestId）。

边界：量表定义来自 `RubricSpec`；事务在 `case-store-v2.submitCommand`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RatingEntry` | type | 13 | = `RatingEntryV2` |
| `AggregatedRatings` | interface | 15-26 | perJudge/average/effectiveJudges/naCount/missingCount/blocked |
| `aggregateRatings` | fn | 27-99 | 纯函数聚合 |
| `castRating` | fn | 100-118 | 提交评分事务 |

无内部函数。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. **`aggregateRatings(ratings, rubric, filterRound?)`**（:28-85）：轮次隔离（filterRound 过滤，注释 :29 复查 §5.4 R1/R2 不混算）；逐票逐维度：缺评 → missing（:37-40）；`'N/A'` → naDimensions（:41-45；exclude 系策略剔除后重归一，block 策略继续但随后阻断）；越界/非有限 → invalid（:47-49）；否则 `weightedSum += raw*weight`（:50-51）；block 策略有 N/A → `评委 X 存在 N/A 维度（…），需人工裁定`、该票 NaN（:54-58）；缺评/越界 → `评委 X 缺评维度…`/`存在超出量表范围的维度…`、NaN（:59-64）；有效票 `total = weightedSum/weightBase` toFixed(precision)（:65-66）。唯一票检查（`stageId:actor:round`）→ `评委 X 在 Y 存在重复票（唯一票约束）`（:69-73）；有效票 < minJudges → `有效评委 N 人，低于最低人数 M`（:75-76）；`average` 仅当无 blocked 且有有效票（:78-79）。
2. **`castRating`**（:88-118）：`submitCommand('CastRating')`；同 stageId+actor+round 已有票 → `INVALID_TRANSITION 该评委在此阶段已提交过评分（唯一票）`（:92-94，注释 :91 轮次键）；分值须有限数或 'N/A'（:95-97）；mutate 追加 `rate-{ms}-{rand3}` 条目（:100-107）。

## 4. 调用者与调用链

入向（生产，r1 校订 NB17-F-01）：`castRating` 有 3 处生产消费——`review-ipc.ts:1147-1148`（动态 require，评分 IPC 通道）、`offline-roundtrip.ts:182-185`（动态 import，`judge-rating-reply`→castRating 唯一票约束，注释 :180）、`preload/index.ts:5060`（castRatingV2 渲染层桥）。`aggregateRatings` 生产零消费者（否定范围：`apps/electron/src` 全部 `.ts`，检索含动态 require/import 与 preload；`aggregateRatings|castRating` 全树命中=上述 3 点+本文件+`rating-service.test.ts:11`）。出向：`@profer/shared` 类型（:10）、`./case-store-v2`（:11）。

## 5. 数据 I/O、读写与副作用

`aggregateRatings` 纯函数；`castRating` 经 `submitCommand` 落盘（CAS+receipt）。无日志/网络。

## 6. 分支、失败、取消与恢复

`castRating` 两 `CommandValidationError`（INVALID_TRANSITION/VALIDATION_FAILED）；聚合无 throw（blocked 表达）。无取消；幂等经 requestId。

## 7. 权限与权威状态

- 唯一票权威：同 stage+actor+round 只一票（:92-94）；跨轮次合法新票（:91 注释）。
- N/A 权威：block 策略直接阻断；exclude 系剔除重归一（:41-45）——两种策略都不把 N/A 当 0。
- 缺评权威：缺维度=缺评阻断，不冒充完成（:59-61）。
- 定稿权威：blocked 非空即不能出平均（:78-79）。

## 8. 修改影响面

生产消费面（r1 校订）：`castRating` 消费方=评分 IPC 通道（`review-ipc.ts:1147-1148`）、离线包 judge-rating-reply（`offline-roundtrip.ts:182-185`）、渲染层桥（`preload/index.ts:5060`）；`aggregateRatings` 当前无生产消费方。聚合口径与 `review-v3-f08-rubric-calculator`（V2 定点内核）并存两套评分算法——边界如实记录。同测：`rating-service.test.ts`（9 用例）。

## 9. 测试证据

直接测试 `rating-service.test.ts`（9 用例 / 3 describe；真实聚合 `createAggregate` + `castRating` 事务；NOT_RUN）：
1. `:22-27` 两评委加权：`average 4.13`（3.5/4.75 → 4.125 两位）、`effectiveJudges 2`。
2. `:29-33` block 策略 N/A：blocked 含 `N/A`、有效 1。
3. `:35-40` exclude-renormalize：`perJudge[0].total===4`、blocked 空。
4. `:42-46` 缺评：blocked 含 `缺评`、`average` null。
5. `:48-51` 低于最低人数：blocked 含 `最低人数`。
6. `:53-57` 同人重复票：blocked 含 `重复票`。
7. `:61-70` castRating 重复提交 → `INVALID_TRANSITION`（事务内查重）。
8. `:74-80` 轮次隔离：filterRound=2 只算 R2（`effectiveJudges 1`、`average 5`）。
9. `:82-90` 同人不同轮次 → 两次 ok（跨轮次合法新票）。
未覆盖：invalid 越界维度分支、weightBase=0；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 唯一票/缺评/N-A/最低人数四不变量 | 已证实 | :28-85 + 测试 :22-90 |
| `castRating` 生产消费 3 点（IPC/离线包/preload）、`aggregateRatings` 零消费者 | 已证实 | r1 校订（grep 含动态 require/import 与 preload） |
| 与 F08 定点内核并存两套评分 | 已证实（记录） | 本文件 :28-85 vs f08 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `aggregateRatings` 两策略/缺评/重复票/minJudges | §3.1/§9 | 28-85 | covered |
| `castRating` 唯一票/校验 | §3.2/§9 | 88-118 | covered |
| invalid/weightBase=0 | §3.1 | 47-49 | partial（未测） |
