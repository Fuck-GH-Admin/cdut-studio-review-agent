---
path: apps/electron/src/main/lib/review/review-v3-f13-main-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0b89a74e86b11eb44ce458bd9dca75c9f839f914
sha256: 80001574579fce98a9574c9272ba7a7cac016735225246d95e7cc6ac8c05af7f
lines: 150
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f13-main-service.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

F13 Main 申诉端到端（`:1`）：真实 Case CAS 下 Appeal+任务+身份+回执一次保存；无确认拒绝、确认后原子提交、重放幂等；受指派复核人维持原判恢复 decided 且原决定保留；新证据未重审禁止改判；RUN-24 时间较新但未冻结新证据版本的 Run 不能背书；撤回关闭申诉不删历史。

## 2. 用例清单

共 5 个 `test(`（`review-v3-f13-main-service.test.ts:40-149`，单一 `describe`）。夹具（`:8-38`）：`PROFER_CONFIG_DIR` 临时目录；动态 import `case-store-v2` 与被测模块（`:12-14`）；`seedDecidedCase` 用真实 `createAggregate` + `submitCommand('FixtureFinalDecision')` 写入最终决定（`decision-original`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | Given 旧案卷未绑定提交方 When 确认本地提交并申诉 Then Appeal+任务+身份+回执原子保存（`:41`） | 无 `confirmLocalSubmitter` 提交；带确认提交；重放 | 无确认 `ok===false` 且 `submitter` 仍 `undefined`；确认后 `ok===true`、`submitter.actorId==='local-student'`、`stage==='awaiting-review'`、`appeals` 长度 1、`appeal-review` 任务 `assigneeActorId==='local-teacher'`、`receiptLog.at(-1).actor.role==='student'`、`decisions` 长度 1；重放 `ok===true` 且 `appeals` 仍 1 |
| 2 | Given 申诉已提交 When 受指派复核人维持原决定 Then 案卷恢复 decided 且原决定保留（`:74`） | submit+review maintain | `result.ok===true`；`appeals[0].status==='upheld'`；`stage==='decided'`；`tasks[0].status==='completed'`；`decisions` 长度 1；回执 actor `'local-teacher'` |
| 3 | Given 申诉新增证据但尚未重审 When 要求改判 Then 禁止修改既有决定（`:97`） | 带证据 `doc-1` 提交后 amend | `result.ok===false`；`decisions` 长度 1 |
| 4 | RUN-24: 时间较新但未冻结新证据版本的 Run 不能为新证据背书（`:115`） | `runCoversAppealEvidence` 五组合 | `oldRun,['doc-1']`→false；`oldRun,['doc']`→false；`newRun,['doc-1']`→true；`newRun,['doc']`→false；`newRun,[]`→true |
| 5 | Given 待处理申诉 When 本地原提交人撤回 Then 申诉关闭而原判与历史不删除（`:130`） | submit+withdraw | `ok===true`；`appeals[0].status==='withdrawn'`；`tasks[0].status==='cancelled'`；`decisions` 长度 1；`stage==='decided'`；回执 actor `'local-student'` |

## 3. 真实断言

逐条见上表（`:48-71,88-94,111-112,123-127,142-148`）。mock 边界：`case-store-v2` 与被测服务均为**真实实现**（临时目录落盘）；actor 由 `deriveT05LocalActor` 真实派生；无 Electron/IPC。

## 4. 未覆盖与脆弱点

未覆盖：`chooseLocalReviewer` 退化（teacher=decider 时改派 reviewer）、amend 成功路径（带 verifiedRunId 的端到端）、复核指派变更分支、`requireLocalBusiness` 技术预审拒绝。`FixtureFinalDecision` 是测试自定义命令类型（走通用命令流）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(`；`:41,74,97,115,130` |
| 真实 CAS 端到端 | 已证实 | `:12-14,26,32-37` |
| 首次绑定确认门槛 | 已证实 | `:44-49` |
| RUN-24 exact-version | 已证实 | `:123-127` |
| 幂等重放 | 已证实 | `:65-71` |
| amend 成功路径 | 未知 | 无用例 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 提交+绑定+幂等 | 1 | 41-72 | covered |
| 维持原判 | 2 | 74-95 | covered |
| 无 Run 拒改判 | 3 | 97-113 | covered |
| RUN-24 判定 | 4 | 115-128 | covered |
| 撤回 | 5 | 130-149 | covered |
| amend 成功/指派变更 | 无 | — | unknown |
