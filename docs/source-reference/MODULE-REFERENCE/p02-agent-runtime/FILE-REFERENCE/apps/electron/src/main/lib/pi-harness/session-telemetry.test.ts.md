---
path: apps/electron/src/main/lib/pi-harness/session-telemetry.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7801571a09682c5e8395adff13394b7ac65c0bd2
sha256: b64231f351e02622730e6efd6eea40093bd8659bb04ffdec066585571c9c8b4a
lines: 57
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/session-telemetry.test.ts

## 1. 测试目标

`collectSessionPiHarnessTelemetry`（`session-telemetry.ts`，**域外不在本批 scope**）：只读本地 graph+sidecar、不写诊断产物。bun:test；临时配置+真实 appendGraphEvent/appendPiHarnessEvent（`:13-17`）。断言逐条已读；被测实现未回源（如实标注）。

## 2. 用例清单

共 **1 个 `test(`**（`:37`）：写入 graph task_created（description 含 `@verify: bun test target`）+3 条 harness 事件（goal/turn_started/settled+usage）→收集 telemetry。

## 3. 真实断言

`:52-55` `toMatchObject({sessionId:'session', usage:{modelCalls:1,inputTokens:10,outputTokens:5}, goals:{total:1}, turns:{total:1}})`。

## 4. 未覆盖与脆弱点

安全/自主指标组、多 goal 聚合无断言；被测 `session-telemetry.ts` 域外未回源。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例/断言 | 已证实 | 全 57 行 |
| `session-telemetry.ts` 实现 | 未知（域外未回源） | 不在本批 scope |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 用例 | §2/§3 | 37-56 | covered |
| 域外边界 | §1/§5 | — | covered（如实） |
