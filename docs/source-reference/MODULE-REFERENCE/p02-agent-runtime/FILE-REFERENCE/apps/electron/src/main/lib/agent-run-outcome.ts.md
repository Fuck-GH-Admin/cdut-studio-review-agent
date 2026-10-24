---
path: apps/electron/src/main/lib/agent-run-outcome.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3afcdcfc2127ec6a500f10d07eed797355a56faf
sha256: db0a85e04d1b0c7b2ce00e4139f4096eb5d930f28e4eb7735538379379293aff
lines: 53
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-run-outcome.ts

## 1. 结论与边界

运行回调信号收敛器（:6 注释）：多个生命周期信号（error/complete）保证 owner 最多收到一个终态（stopped/failed/completed）。外部观察者异常不改变结果（:45/:47/:49 catch 注释）。

## 2. 导出与关键符号

导出 1 条（`export` :7）：`createAgentRunOutcomeReporter(onOutcome?)`（返回 `{onError, onComplete, rejectBeforeStart, finish}`）。内部状态：error/stopped/failedSubtype/completionSeen/settled（:8-12）。

## 3. 内部逻辑与关键流程

- `onError`（:15-17）：首个错误保留（`??=`）。
- `onComplete(options)`（:18-37）：`backgroundTasksPending` 直接 return（:19，不计终态）；stoppedByUser/endReason==='stopped_by_user'→stopped（:21-22）；失败判定=resultSubtype 非空非 success 或 malformedSuccess（success 但有 errors，:24-25）且未 stopped→记 failedSubtype+error（:26-30）；非 completed/stopped_by_user 的 endReason→记 error（:31-36）。
- `rejectBeforeStart`（:38-40）：settled=true（不发终态）。
- `finish`（:41-51）：settled 互斥（:42）；stopped→'stopped'；error 或未见 completion→'failed'（缺省「Agent 未产生运行终态」）；否则 'completed'。onOutcome 异常吞（:45/:47/:49）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/agent-service.ts:37`（实例化 outcomeReporter :294）；测试 `agent-run-outcome.test.ts:3`、`agent-goal-runtime-bridge.test.ts:8`、`review-background-reuse.probe.test.ts:18`。出向：`@profer/shared` 类型、`./agent-orchestrator`（仅类型 :4，与 orchestrator 成类型环）。

## 5. 数据 I/O、读写与副作用

无 I/O；闭包状态；onOutcome 回调。

## 6. 分支、失败、取消与恢复

stopped/failed/completed 三终态（:44-50）；settled 互斥；不适用取消/恢复。

## 7. 权限与权威状态

「最多一个终态」契约权威（:6）；外部观察者不可改结果（:45 注释）。

## 8. 修改影响面

运行终态上报链（agent-service/goal bridge）；需同步测试（110 行）。

## 9. 测试证据

`agent-run-outcome.test.ts`（批内，1 describe/8 用例，NOT_RUN）：单次回传+idle 不算终态（:13-22）、onError 不降级（:24-30）、六失败信号（:32-51）、停止优先（:53-60）、busy 拒（:62-67）、不伪报成功（:69-74）、真实缺陷复现 resultErrors 保真（:76-100）、callback 抛错隔离（:102-109）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；三终态收敛 | 已证实 | :7-53 |
| 测试 8 用例逐断言 | 已证实 | 姊妹手册 §2 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| reporter 全分支 | §2/§3 | :7-53 | covered |
| 测试 | §9 | — | unknown |
