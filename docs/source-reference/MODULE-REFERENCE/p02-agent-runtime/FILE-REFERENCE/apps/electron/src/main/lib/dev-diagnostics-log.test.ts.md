---
path: apps/electron/src/main/lib/dev-diagnostics-log.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2e27cf4d748730753a2417ee87421da5c02759f1
sha256: b625bacbd91454881a9d51eb5c819c3d4efe16d0658df3954b8d77a820be06f6
lines: 14
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-diagnostics-log.test.ts

## 1. 测试目标

`dev-diagnostics-log.ts` 的 `shouldRotateDiagnosticsLog` 轮转阈值判定（被测逻辑见同组手册）。

## 2. 用例清单

**2 个 `test()`**（describe `shouldRotateDiagnosticsLog`）：未达上限保留（`:5-8`）、达/超上限轮转（`:10-13`）。

## 3. 真实断言

`shouldRotateDiagnosticsLog(0)`/`(DEV_DIAGNOSTICS_MAX_BYTES-1)` `toBe(false)`（`:6-7`）；`(MAX)`/`(MAX*3)` `toBe(true)`（`:11-12`）。

## 4. 未覆盖与脆弱点

未覆盖 `appendDevDiagnostic` I/O 与 `prepareFile` 轮转执行。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-14` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 轮转阈值边界 | 2 | covered |
| I/O/轮转执行 | — | unknown |
