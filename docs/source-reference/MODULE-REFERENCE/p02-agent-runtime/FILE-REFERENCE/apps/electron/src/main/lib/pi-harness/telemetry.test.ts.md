---
path: apps/electron/src/main/lib/pi-harness/telemetry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6017354b7a91f4050b3c1a49d78d5f82039ad761
sha256: abab5e56d0dd6f22797c9f674a9e6f8d3baebdf742aae8ca74568daa4d3e6e7b
lines: 67
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/telemetry.test.ts

## 1. 测试目标

直接测试 `collectPiHarnessTelemetry`/`serializePiHarnessTelemetry`（telemetry.ts）：①用量/成本按 Goal 归集且不泄 facts；②falseVerified 重算与 no-change 失败循环安全计数；③暂停后 turn 人工审计计数。3 个 `test(`，1 个 `describe('Pi Harness telemetry')`（`:22`）。以 `replayPiHarnessEvents`（pi-harness-reducer，非本批）从事件流重建快照——**重放链路**也在断言面内。

不测试：tool-facts/verification-evaluator 内部（各自测试文件）。

## 2. 用例清单

夹具：`task`（TaskNode，description `'@verify: bun test target'`，`:7-10`）、`graph`（`:11`）、`policy`（shadow/bypassPermissions，`:12`）、`event()` 工厂（goal_created 基底，`:14-20`）。无 mock/无 IO。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:23-35` | 4 事件（goal_created/turn_started/settled(usage 2/20/10/1/1/40)/autonomy_budget_consumed(verification_run,$0.12)） | collect+serialize | `:32` `usage` `toMatchObject{modelCalls:2,inputTokens:20,outputTokens:10,retries:1,compactions:1,estimatedCostUsd:0.12}`；`:33` `byGoal.goal` `toMatchObject{modelCalls:2,equivalentVerificationRuns:1,estimatedCostUsd:0.12}`；`:34` 序列化 `not.toContain('commandHash')` |
| 2 | `:37-56` | 失败 verification_command 事实 + verification failed | collect → 换 verified 事件重放 → 再 collect | `:49` `safety` `toMatchObject{blockedNoChangeFailedVerificationLoops:1, duplicateNoChangeFailedVerificationCandidates:0}`；`:55` `verification.falseVerified` `toBe(1)` |
| 3 | `:58-66` | goal_paused + 暂停后 turn_started | collect | `:65` `safety` `toMatchObject{pauses:1, turnsStartedAfterPause:1}` |

## 3. 真实断言

`toMatchObject`（聚合字段+值）+ `toBe`（精确计数）+ `not.toContain`（脱敏）。无快照测试。

## 4. 未覆盖

- `duplicateNoChangeFailedVerificationCandidates` 的 1 值路径（用例 2 只锁 0）。
- `coverageRatio` 边界（requiredTasks=0→1；部分 verified 比率）。
- `sidecarDiagnostics`、byBlockedReason 4 分桶、byGoal 多 goal。
- `serializePiHarnessTelemetry` 输出格式细节（仅 not.toContain）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| falseVerified 用 verified 声明+空证据构造（`:53`）触发重算打假 | 已证实 | `:51-55` |
| 实际执行结果 | 未知 | `NOT_RUN` |
| `replayPiHarnessEvents` 行为（非本批） | 未知 | reducer 不在 SCOPE |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 用量/成本归 Goal | §2 用例 1 | `:32-33` | covered |
| 序列化脱敏 | §2 用例 1 | `:34` | covered |
| falseVerified | §2 用例 2 | `:55` | covered |
| blocked-loop 安全计数 | §2 用例 2 | `:49` | covered |
| 暂停后 turn 审计计数 | §2 用例 3 | `:65` | covered |
| §4 列出的边界 | — | — | unknown（未覆盖） |
