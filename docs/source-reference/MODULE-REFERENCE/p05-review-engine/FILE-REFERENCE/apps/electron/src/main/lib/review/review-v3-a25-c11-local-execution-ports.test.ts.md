---
path: apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6fd1ff8c16548dfd8faae1d168237e42adb1d986
sha256: ac29171c909c9c53ef993ce910c76e36d2662ecf36927ee0ddb4a86d52351904
lines: 169
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.test.ts

## 1. 测试目标

A25 **真实组合路径**：Main 冻结 Owner → native Pi HTTP → A Host → C11 端口全链（`apps/electron/src/main/lib/review/review-v3-a25-c11-local-execution-ports.test.ts:1-2`）。文件头明示合成的上游 HTTPS **有意不是**外部 Provider/Gate E（`:2`）。bun:test（`describe/it`，`:4`）。

夹具（`:15-129`）：`Memory implements OwnerPersistence`（内存 CAS，`compareAndWrite` 不匹配抛 'stale A journal'，`:15-23`）；`principal/run/source/plan` 合成冻结身份（`:24-47`）；`fixture()`（`:50-129`）：真 `V3ReviewOwnerAdapter`（authorizeExecution 空、isCurrent 可切）、真 `A25C11LocalExecutionPorts`、fake `physicalExecutor`（计数+写 observations Map，check 请求把 status 改 `'accepted'`，`:69-82`）、fake `physicalObserver`（读 Map，`:83`）、fake `piSessions.create`（合成 `StreamFn` 调 `options.fetch!('https://approved.example/v1/chat/completions')`、`prompt()` 内跑 `ports.read/check/terminal`，`:84-125`，`transportFetch` 返回 `data: [DONE]` SSE 并记 requests）。mock 边界：Pi session 是对象替身（`as unknown as Pick<AgentSession,…>`，`:114-115`）；物理执行是内存观察对（非真实 Main Host）。

## 2. 用例清单

共 **2 个 `it(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 (A25-01) | 131-157 | one native Pi HTTP turn, A23 Read/Check/terminal and C11 handoff | fixture() | `background.run({requestId:'a25-one',…})` + handoff 快照 + **同 requestId 重跑** | 独立 |
| 2 (A25-02) | 158-168 | C Main Run revocation blocks new technical effects | fixture() + `setCurrent(false)` | `background.run` 与 `handoff.snapshot` | 独立 |

## 3. 真实断言

A25-01（`:138-156`）：

- `expect(task).toMatchObject({state:'completed-technical', committedUsedTurns:1, completedSteps:1})`。
- `expect(f.requests()).toBe(1)`（一次 HTTP）、`expect(f.physical()).toBe(3)`（read/check/terminal 三次物理）。
- `expect(f.ports.inspect(run.caseId)?.state).toBe('completed-technical')`。
- `expect(handoff.technicalEvents.map(x=>x.kind)).toEqual(['read','check','terminal'])`。
- `expect(handoff.turnBudget.usedTurns).toBe(1)`。
- `expect(handoff.sdkDispatches).toMatchObject([{state:'settled',technicalReceiptId:'provider-a25-one'}])`。
- `expect(handoff.canSealCReviewRun).toBe(false)`、`expect(verifyA22TechnicalEvidenceHash(handoff)).toBe(true)`。
- 重跑同 requestId：`.state` 仍 `'completed-technical'` 且 `f.requests()` 仍 1（幂等回执，不重复物理）。

A25-02（`:161-167`）：

- `await expect(…background.run…).rejects.toThrow('C_MAIN_RUN_NO_LONGER_CURRENT')`。
- `expect(f.requests()).toBe(0)`（0 HTTP）、`expect(()=>f.ports.handoff.snapshot(f.call)).toThrow()`。

## 4. 未覆盖与脆弱点

- fake executor 把 check 结果改 `'accepted'`（`:72`）是替身语义，A23 的 13 项比对在此路径上「两口一致」由同一 Map 自然满足——真实独立观察者的行为未测。
- `physicalObserver` 与 executor 共享同一 observations Map（`:63,75,83`），不一致观察（A23 mismatch 分支）未构造。
- A23 uncertain 永久停机、A25 `ACTIVE_CASE_MUST_BE_STOPPED_FIRST`/`FOUR_DURABLE_CASE_CAS_STORES_REQUIRED`/`REAL_PI_SESSION_FACTORY_NOT_CONFIGURED` 等错误分支未测。
- `it(` 用例数=2（无 `test(`），与源文件 `describe/it` 口径一致。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 it/1 describe、夹具结构 | 已证实 | `:50-169` |
| 幂等重跑不重复物理请求 | 已证实 | `:151-156` |
| Run 撤销阻断 | 已证实 | `:158-167` |
| 合成 HTTPS 非外部 Provider（设计声明） | 已证实（注释） | `:1-2` |
| 测试通过与否 | 未知 | NOT_RUN |
| 真实 Pi SDK session 行为 | 未知 | 对象替身 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| A25 全链 + handoff | §2/§3 | A25-01 | covered |
| A25 幂等回执 | §2/§3 | A25-01 后半 | covered |
| Run 撤销闸 | §2/§3 | A25-02 | covered |
| bindCase 拒绝分支 | §4 | — | unknown |
| A23 mismatch/uncertain | §4 | — | unknown |
