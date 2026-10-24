---
path: apps/electron/src/main/lib/agent-send-coordinator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ef1ab99611af6cc5af3c28070ec4cbad66e548c9
sha256: abee4930f54e93185999164d661f3a92f5291d834bc8523df1b674bd44706744
lines: 49
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-send-coordinator.test.ts

## 1. 测试目标

`coordinateAgentSend`（`agent-send-coordinator.ts:16`）：校验先于副作用、run 先于 mirror 顺序、镜像失败不阻断、draft 跳过镜像。bun:test；deps 记录替身（`calls` 数组，`:9-23`）。

## 2. 用例清单

共 **4 个 `test(`**：校验失败零副作用（`:26`）；先 run 后 mirror（`:32`）；镜像失败仍运行（`:38`）；draft 只 run（`:44`）。

## 3. 真实断言

`:28-29` `rejects.toThrow('AGENT_SESSION_NOT_FOUND')`+`calls` `toEqual([])`；`:35` `['run','mirror']`；`:41` `['run','mirror-error']`；`:47` `['run']`。

## 4. 未覆盖与脆弱点

orchestrator 真实占用语义（域外）；validatePreset 分支无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/顺序断言 | 已证实 | 全 49 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 用例 | §2/§3 | 26-48 | covered |
