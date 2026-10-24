---
path: apps/electron/src/main/lib/review/review-runtime-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d11b98d97b7a93717ff332bf16b8fb7e0072d5c4
sha256: 5f6f4996994419f6e9039f83c255a4221278b2eb00c0b0795a0669c50d1fe9d6
lines: 233
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-runtime-contract.test.ts

## 1. 测试目标

RUN-01/02/04/05/07/09/14/22 业务 Run 合同 + RUN-43 冷启动续交：分类/冻结身份、不回退旧成功、诊断隔离、决定引用、CheckId 公式、中断续跑 fail-closed。

## 2. 用例清单

13 用例 / 5 describe。夹具 `check/run/aggregate`（:22-54，纯函数+mkdtemp V2 存储）；动态 import 被测（:15-21）。

| describe | # | 要点（行） |
| --- | --- | --- |
| 权威分类与冻结身份 | 3 | tpl/diag 不得为当前（57-66）；缺 planFingerprint 无冻结身份（69-75）；同输入同计划=同 attempt（77-84） |
| 当前业务 Run 选择（RUN-04） | 4 | 最新失败不回退（88-102）；running 阻断（104-122）；诊断不影响（124-135）；过期阻断（137-144） |
| 决定引用与 Check 清单 | 2 | superseded/same-attempt-history/unbound（148-166）；CheckId 与 F07 公式一致（168-183） |
| RUN-43 按原 RunId 续交 | 2 | 崩溃→failed+可续交（partially-completed+marker+拒止解除，187-210）；无检查点不伪装（212-221） |
| RUN-43 未知 effect 不自动重放 | 2 | 闸门 fail-closed+两放行+提示含「未确认的模型请求」（224-232）；确认续交记「新回合」「不会被重放」（234-248） |

## 3. 真实断言

要点如 §2（逐条读自 :57-248）。代表性：`decision.reason==='latest-attempt-failed'`+`blockedByRunId:'run-pi-new'`（:98-100）；`expectedCheckIdsFromPlan` → `['t04:["limit","case","doc","s1"]']` 公式（:180-183）；`diagnostics` 含 `INTERRUPTED_RUN_MARKER` 与 `resume-interrupted` 前缀（:202-205）。

## 4. 未覆盖与脆弱点

- 未覆盖：`assessStagePassWithT03`/`buildT03Evidence` 独立断言（经 T03 测试族）。
- 脆弱点：`run()` 夹具硬编码 inputManifest；`markStaleRunsInterrupted` 全局扫描副作用（按 caseId 过滤）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例断言如 §2 | 已证实 | 本文件逐行 |
| RUN-04/43 语义被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 分类/冻结/isSameAttempt | §2 | covered |
| resolveCurrentBusinessRun | §2 | covered |
| decisionRunRelation/CheckId 公式 | §2 | covered |
| RUN-43 拒止/续交/闸门 | §2 | covered |
| T05 stage-pass 严门禁 | §4 | unknown（他测覆盖） |
