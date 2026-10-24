---
path: apps/electron/src/main/lib/review/stage-workflow.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f3c992fba9fb15ac9097506c57b164f329a97f3
sha256: 0260b1c42c9f39474b6ce02188ceae09f94f29f58406f4f5cc70612a57407d13
lines: 493
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/stage-workflow.test.ts

## 1. 测试目标

N3/R07 单测（文件头 `:1-3`）：阶段推进（初审通过≠decided、终审才 final）、最终驳回、多补件门控（RUN-18 末笔 cancelled 也恢复）、补件回复/回流（G04/G05）、RUN-19 补件材料归属与时效、角色安全收口（P0）、申诉更正与最终投影、补件不足后再回复。被测：`stage-workflow.{ensureInitialTask,recordStageDecision,respondSupplementV2,resolveSupplementV2,resolveAppealV2,resolveFinalDecisionProjection}`；协作 `case-store-v2.{createAggregate,readAggregate,submitCommand}`、`business-workflow.submitAppeal`、`material-service.registerMaterial`。

夹具（`:17-37`）：两级模板 `t@1`（first/reviewer→`final`/teacher，published）；`caseV2` stage `submitted`；actor `u1/reviewer` 与 `teacher-1/teacher`；`seed()` 建聚合+`ensureInitialTask`；多处用 `submitCommand` 直接注入第二补件/申诉种子（测试专用命令类型 `OpenSecondSupplement`/`SeedAppeal`/`SeedAppealForPermissionTest`/`Seed`）。`PROFER_CONFIG_DIR` 临时目录。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

8 个 describe、**23 个 test**：

### 2.1 阶段推进（`:39-160`，8）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:40-74` | 三阶段+冻结 `Date.now=1`：连续通过；终审 `stage==='decided'`；3 个任务 id 唯一（`Set` size 3）；`decisions.stageId===['first','middle','final']` |
| 2 | `:76-86` | 初审通过 → `stage==='reviewing'`（**非 decided**）、`decisions[0].finality==='stage'`、`entity.task.stageId==='final'` |
| 3 | `:88-100` | 终审通过 → `decided`、`decisions.at(-1).finality==='final'` |
| 4 | `:102-118` | reviewer 冒签终审 → `ok:false`、`code:'INVALID_TRANSITION'`、decisions 仍 1 条 |
| 5 | `:120-130` | 传 `version:99` 假模板 → `INVALID_TRANSITION`、decisions 0 |
| 6 | `:132-141` | final-reject → `decided`、`supplements` 空 |
| 7 | `:143-149` | return-for-supplement → `awaiting-supplement` |
| 8 | `:151-159` | 同任务重复决定 → `INVALID_TRANSITION` |

### 2.2 多请求门控（`:162-225`，2）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 9 | `:163-198` | 两 open 请求；非法 outcome `'satisfied-x'` → `VALIDATION_FAILED` 且状态仍 `open`（fail-closed）；满足其一后 `stage` 仍 `awaiting-supplement` |
| 10 | `:200-224` | RUN-18：A satisfied（不恢复）→ B `cancelled` → `stage==='reviewing'` 且 `first` 阶段 open 任务回流 |

### 2.3 回复与回流（`:227-270`，3）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 11 | `:228-248` | 退回补件记录 `originStageId==='first'`；student 回复→`responded`；判定 satisfied → `reviewing` + **恰好 1 个** first 阶段 open 任务、`prerequisiteTaskId===firstTaskId` |
| 12 | `:250-260` | 判定 insufficient → 不恢复（`awaiting-supplement`）、open 任务 0 |
| 13 | `:262-269` | 教师代回学生补件 → `INVALID_TRANSITION` |

### 2.4 RUN-19（`:273-344`，1）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 14 | `:274-343` | 请求前版本登记后开补件（`documentVersionIdsAtRequest` 含旧版本）；他案版本回复 → `VALIDATION_FAILED`+“不属于本案当前有效原件”；旧版本回复 → `VALIDATION_FAILED`+“请求前已有版本”；请求后新版本回复成功（`status:'responded'`、`responses` 1 条）；同 requestId 重试 → `ok:true` 且 `responses` 仍 1 条 |

### 2.5 角色安全（`:346-398`，2）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 15 | `:347-363` | teacher 判定 reviewer 来源补件 → `INVALID_TRANSITION`、状态仍 `open` |
| 16 | `:365-397` | 注入 `in-review` 申诉；reviewer 冒签 `maintain-original` → `INVALID_TRANSITION`、申诉仍 `in-review` |

### 2.6 申诉/投影（`:400-424`，3）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 17 | `:401-409` | 手工 d1(final)+d2(amends d1)：`isFinal:true`、`decision.id==='d2'`、`supersededIds===['d1']` |
| 18 | `:411-414` | 仅 stage 决定 → `isFinal:false` |
| 19 | `:416-423` | final-reject 后 `submitAppeal` → `ok:true` |

### 2.7 补件不足后再回复（`:426-458`，2）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 20 | `:427-445` | insufficient 后**再次回复**成功（修复前 INVALID_TRANSITION）；再判 satisfied → `reviewing` + first 任务回流 |
| 21 | `:447-457` | 注入第二请求 status `insufficient`；满足其一 → `stage` 仍 `awaiting-supplement`（insufficient 计入未满足） |

### 2.8 申诉闭环（`:460-493`，2）

| # | 行 | 断言要点 |
| --- | --- | --- |
| 22 | `:461-474` | teacher `maintain-original` → 申诉 `upheld`、`stage==='decided'` |
| 23 | `:476-492` | `amend-original`+`amendedResult:'pass'` → 申诉 `overturned`、`decided`；`amendsDecisionId` 决定 `actor.actorId==='teacher-1'`（不继承原 actor）、`finality==='final'` |

## 3. 真实断言

- #1 冻结 `Date.now` 后仍断言任务 id 唯一——验证 `task-${randomUUID()}` 而非时间戳 id（`:68`）。
- #9 的非法 outcome 断言状态**不变**（`status:'open'`，`:189`），实证 fail-closed 而非静默 undefined。
- #10/#11/#20 断言回流任务的 `prerequisiteTaskId`/`stageId` 与数量恰好 1。
- #14 断言两条拒绝的**不同**消息子串，以及幂等重放不追加 `responses`。
- #23 断言更正决定的 actor 是复核教师本人（`:489`）。
- 注入型夹具（`OpenSecondSupplement` 等）通过真实 `submitCommand` 事务写入（`:169-175`、`:374-387`、`:466`），非直接改内存。

## 4. 未覆盖与脆弱点

**未覆盖**：`submitCaseV2`（全部）、`ensureInitialTask` 的重复初始化/revision 冲突、`item-pass`/`item-partial-pass` 重开任务、`withdraw`→`archived`、`return-to-previous-stage` 的任务轮次+1、`resolveFinalDecisionProjection` 的“final 取最新”排序、`resolveAppealV2` 的 `entity` 旧对象语义、agent 代批开关（`assertAgentDecisionAllowed`）分支。

**脆弱点**：

- #1 用 `Date.now = () => 1` 全局替换并在 `finally` 还原（`:49-72`）；若并行执行会污染其它用例（bun 默认同文件串行，推断安全）。
- 多处断言中文错误文案（“缺少必需材料”“无权判定其他审核角色负责的补件”等）。
- #9/#21 的多请求场景依赖测试专用命令注入真实状态；若 `submitCommand` 增加命令白名单会先失败。
- `seed()` 的 `expectedRevision: 1` 硬编码在多数调用（`:79` 等），依赖 `ensureInitialTask` 后 revision 恰为 1。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 describe、23 test | 已证实 | 各 describe 行；`grep -c test(`=23 |
| 初审≠decided、终审 final | 已证实 | `:76-100` |
| 非法判定值 fail-closed | 已证实 | `:182-189` |
| RUN-18 末笔 cancelled 恢复 | 已证实 | `:200-224` |
| RUN-19 时效/归属拒绝 + 幂等回复 | 已证实 | `:274-343` |
| 角色校验（补件判定/申诉） | 已证实 | `:346-398` |
| 申诉更正不继承原 actor | 已证实 | `:488-490` |
| `submitCaseV2`/item-*/withdraw | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源函数/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `ensureInitialTask` | 全部 seed 间接 | `:32-37` | covered（间接） |
| `recordStageDecision` stage-pass/final/return/reject | #1-#8 | `:39-160` | covered |
| `recordStageDecision` item-*/withdraw | — | — | unknown |
| `respondSupplementV2` | #13/#14/#20 | 多处 | covered |
| `resolveSupplementV2` 门控/回流 | #9-#12/#20/#21 | 多处 | covered |
| `resolveAppealV2` | #16/#19/#22/#23 | 多处 | covered |
| `resolveFinalDecisionProjection` | #17/#18 | `:401-414` | covered |
| `submitCaseV2` | — | — | unknown |
