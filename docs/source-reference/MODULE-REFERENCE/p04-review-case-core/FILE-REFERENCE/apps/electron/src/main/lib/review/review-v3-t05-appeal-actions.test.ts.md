---
path: apps/electron/src/main/lib/review/review-v3-t05-appeal-actions.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba5e8e8606bfa7d75b10ab921060bf3819407af3
sha256: 9b73f0939e074805bde63d55cd59d5fddc704bb14324711eddcfbd3178b12343
lines: 63
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t05-appeal-actions.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 T05 append-only 申诉语义：合法申诉绑定原决定与证据版本且**保留原决定**；更正追加关联 amendment 且必须基于已验证新 Run；撤回仅限原申诉人。

## 2. 用例清单

共 3 个 `it(`（`review-v3-t05-appeal-actions.test.ts:24-62`，单一 `describe`）。夹具（`:6-21`）：`submitter`（student）/`reviewer`（reviewer-2）/`original` 决定（`reviewer-1`、`finality:'final'`、`result:'reject'`）；`aggregate()` 为内存对象（`stage:'decided'`、`documents:[{versionId:'document-2',active:true}]`、`revision:5`，`as unknown as`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | keeps the original decision, binds a legitimate appeal and evidence version（`:25`） | 提交（证据 `document-2`）；再提交证据 `'absent'` | `appeal.status==='submitted'`；`appeal.againstDecisionId===original.id`；`current.decisions` `toHaveLength(1)`；第二次 `toThrow()` |
| 2 | appends a linked amendment based on a verified fresh run（`:38`） | amend（`amendedResult:'pass'`、`verifiedRunId:'run-2'`）；缺 `verifiedRunId` 再调 | `outcome.appeal.status==='overturned'`；`outcome.amendment?.amendsDecisionId===original.id`；`basedOnRunId==='run-2'`；`current.decisions` `toEqual([original])`；缺 Run `toThrow()` |
| 3 | restricts withdrawal to the original appellant（`:55`） | 撤回（本人/他人） | `prepareT05AppealWithdrawal(appeal,submitter).status==='withdrawn'`；他人 `toThrow()` |

## 3. 真实断言

逐条见上表（`:30-35,45-52,59-60`）。mock 边界：聚合/Actor 全内存对象；纯函数无 IO。

## 4. 未覆盖与脆弱点

未覆盖：14 个错误文案中多数分支（角色/在途/自审/空理由/结案等）、`maintain-original` 路径、`effectiveT05Decisions` 独立断言。`as unknown as CaseAggregateV2` 绕过类型检查。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep it(`；`:25,38,55` |
| 原决定保留（append-only） | 已证实 | `:33,50` |
| amend 须 verifiedRunId | 已证实 | `:51-52` |
| 撤回限本人 | 已证实 | `:59-60` |
| 错误分支覆盖 | 未知 | 多数无断言 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 提交+证据校验 | 1 | 25-37 | covered |
| amend+Run 绑定 | 2 | 38-54 | covered |
| 撤回权限 | 3 | 55-62 | covered |
| 其余错误分支 | 无 | — | unknown |
