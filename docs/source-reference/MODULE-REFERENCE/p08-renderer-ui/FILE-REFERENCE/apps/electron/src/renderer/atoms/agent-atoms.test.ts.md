---
path: apps/electron/src/renderer/atoms/agent-atoms.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 198d42bbab9e002fddb99f0b338fc74e3f99007c
sha256: ec04130cea23f611eed1e33e23afd4b5b81a7182b6d009c32c869c63770633d1
lines: 71
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-atoms.test.ts

## 1. 测试目标

`applyAgentEvent`（测自 `./agent-atoms`，**源文件不属本批**）：retry 恢复语义。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例（:22/:27/:43/:54），1 describe「applyAgentEvent retry recovery」（:21）：
1. 完整文本清非失败 retry（:22-25）。
2. retry_failed 只记失败不提前结束运行态（:27-41）。
3. 失败历史不被完整文本清除（:43-52）。
4. 文本/工具/正常 complete 只清非失败 retry（:54-69）。

## 3. 真实断言

toEqual/toBe 级（retry 状态字段断言）。

## 4. 未覆盖与脆弱点

被测 `applyAgentEvent` 属 agent-atoms（批外源）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| retry 恢复四语义 | #1-#4 | covered |
