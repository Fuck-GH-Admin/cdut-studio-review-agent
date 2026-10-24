---
path: apps/electron/src/main/lib/agent-system-prompt-policy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 11302833cd58fd450b831221ef939b971020ed3c
sha256: f3906b073128dc0ecb3d5da416afd5cae96ce0d5a9619f1ee7be57f2714e6aec
lines: 46
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-system-prompt-policy.test.ts

## 1. 测试目标

双门禁策略与 runtime prompt 形态。不运行（`NOT_RUN`）。

## 2. 用例清单

5 用例（:5/:12/:19/:29/:36），1 describe（:4）。
1. 默认 grounded+preset（:5-10）。
2. 仅开发者模式仍 grounded（:12-17）。
3. 双门禁→open 且停 preset（:19-27）。
4. 开发者关时忽略残留 open 值（:29-34）。
5. Pi runtime 原文透传（:36-45）：grounded/open 均 toBe 'PROMPT'。

## 3. 真实断言

`:6-9`/`:13-16`/`:20-26`/`:30-33`/`:43-44`（toEqual/toBe）。

## 4. 未覆盖与脆弱点

未覆盖：claude+preset append 形态断言（用例 5 只测 pi）。mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 双门禁四态+pi 透传 | #1-#5 | covered |
| claude preset 形态 | — | unknown |
