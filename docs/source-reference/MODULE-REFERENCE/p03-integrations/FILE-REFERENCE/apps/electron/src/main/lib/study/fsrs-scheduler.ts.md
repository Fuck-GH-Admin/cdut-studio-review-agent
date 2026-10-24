---
path: apps/electron/src/main/lib/study/fsrs-scheduler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d02ffdbc3b137e96fc56c98de608e1e5c1ed78b8
sha256: d620e4d4a28783dd0f9817ed4b088af0701e19372a85b35ee7871c51b3173b50
lines: 203
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/study/fsrs-scheduler.ts

## 1. 结论与边界

**FSRS-7 记忆动力学调度引擎**（`apps/electron/src/main/lib/study/fsrs-scheduler.ts:1-15`）：记忆状态三元组 `(R, S, D)`——R 提取概率 `(1+FACTOR·t/S)^DECAY`（DECAY=-0.5、FACTOR=19/81 使 R(S,S)=0.9）；S 稳定性（衰减到 90% 天数）；D 难度 1-10 向初始回归。四挡评分：Again（脱落→10 分钟重测）/Hard/Good（幂律检索曲线最优点间隔）/Easy（easyBonus）。**纯函数**（时间入参注入，`:15`）。

边界：Again 统一 10 分钟（`:161`）；Hard 首次 learning 步进 6 分钟（`:164`）；间隔下限 1 分钟（`:73`）；requestRetention 钳 [0.7,0.99]（`:72`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DESIRED_RETENTION` | const | 27 | 0.9 |
| `AGAIN_INTERVAL_MS` | const | 33 | 10 分钟 |
| `DEFAULT_FSRS_WEIGHTS` | const | 42-49 | FSRS-6 同构 17 参数（结构注释 `:36-40`） |
| `ratingGrade` | function | 52-62 | Again=1…Easy=4 |
| `retrievability` | function | 65-69 | R(t,S)（S≤0→0） |
| `intervalMsFromStability` | function | 72-76 | 反解间隔（下限 1 分钟） |
| `createInitialFsrs` | function | 100-109 | 新卡状态（S=0/D=5/state 'new'） |
| `scheduleFsrs` | function | 118-173 | **主入口**：单评推进（不改入参） |
| `previewIntervalDays` | function | 178-180 | UI 预览（**零外部引用**） |

内部：`initialStability/initialDifficulty/clampDifficulty`（`:78-93`）、`nextDifficulty`（`:95-101`，线性阻尼+均值回归）、`nextStabilityOnSuccess`（`:103-115`，Hard 惩罚 w[15]/Easy 奖励 w[16]）、`nextStabilityOnLapse`（`:111-116`，不超过原 S）。

## 3. 内部逻辑与关键流程

`scheduleFsrs`（`:118-173`）四步：① R（新建视为 0）；② D（新建 initial/否则 next）；③ S+状态（新建 Again 取 S0(2)；lapse→relearning+lapses+1；成功→review）；④ 到期（Again 10min/learning 6min/否则 R=0.9 反解间隔）。

## 4. 调用者与调用链

出向：`@profer/shared`（FlashcardFsrs/FlashcardRating，`:17`）。入向（检索=符号名+模块名，全冻结树）：`study/study-session-store.ts:33,206`（scheduleFsrs，**产品链** ← main/ipc.ts:194）、`study/study-artifact-service.ts:29,134`（createInitialFsrs ← main/ipc.ts:195）。`retrievability`/`AGAIN_INTERVAL_MS`/`DESIRED_RETENTION`/`DEFAULT_FSRS_WEIGHTS`/`ratingGrade`/`intervalMsFromStability`/`previewIntervalDays` **零外部引用**（仅内部+测试）。测试：`cognition-engine.test.ts`（FSRS 段 BDD-SRS-01）。⚠ 噪声：'retrievability' 在 docs 英文散文命中非代码。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数（时间注入）。

## 6. 分支、失败、取消与恢复

无异常路径（clamp/下限兜底）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；FSRS-7 公式与权重结构（`:1-40`）是记忆模型权威口径。

## 8. 修改影响面

权重/间隔规则改动影响复习调度；测试锚在 cognition-engine.test FSRS 段。

## 9. 测试证据

`study/cognition-engine.test.ts`（本批，FSRS 段断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| FSRS-7 三元组+四挡语义 | 已证实 | `:1-15,118-173` |
| Again 10min/Hard 6min/间隔下限 | 已证实 | `:161-164,73` |
| 7 导出零外部引用 | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 真实记忆数据拟合 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2 | 27-180 | covered |
| 四步推进 | §3 | 118-173 | covered |
