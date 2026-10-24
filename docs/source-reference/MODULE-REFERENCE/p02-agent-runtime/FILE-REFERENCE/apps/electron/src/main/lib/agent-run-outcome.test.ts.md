---
path: apps/electron/src/main/lib/agent-run-outcome.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42d69644c98323cfd201bd109f8bd15447d3200a
sha256: fc897507da860359e116be6984a9b84f637a3619fbc9b4f54eebedc6bf715dd9
lines: 110
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-run-outcome.test.ts

## 1. 测试目标

`createAgentRunOutcomeReporter` 终态收敛：单次回传、stopped 优先、失败原因保真、callback 抛错隔离。不运行（`NOT_RUN`）。

## 2. 用例清单

8 用例（:13/:24/:32/:53/:62/:69/:76/:102），1 describe（:12）；fixture（:7-10）。
1. 成功只回传一次+background idle 不算终态（:13-22）：双 finish 后 outcomes `[{status:'completed'}]`。
2. onError 后 success 不降级（:24-30）：`{status:'failed', error:'preflight failed'}`。
3. 六种失败信号均 failed（:32-51）：6 组 options 循环断言 failed+error 真值（:44-45）；setup 异常 failed（:50）。
4. 停止优先早先错误与迟到异常（:53-60）：`[{status:'stopped'}]`。
5. busy 拒绝不回传（:62-67）：outcomes []。
6. 无终态/仅 idle 不伪报成功（:69-74）：failed。
7. **真实缺陷复现**（:76-100，注释 :77-79）：无 resultErrors 时 error=endReasonLabel「执行出错」（:89）；带 resultErrors 时 error=watchdog 真实原因（:99）。
8. callback 抛错不改结果不重复（:102-109）：`not.toThrow()`+calls 1。

## 3. 真实断言

`:16/:18/:21/:29/:44-45/:50/:59/:66/:73/:89/:99/:106-108`（toEqual/toBe/toBeTruthy/not.toThrow 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：rejectBeforeStart 后 onComplete。mock 边界：纯 fixture 回调。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 单次/优先级/保真/隔离 | #1-#8 | covered |
