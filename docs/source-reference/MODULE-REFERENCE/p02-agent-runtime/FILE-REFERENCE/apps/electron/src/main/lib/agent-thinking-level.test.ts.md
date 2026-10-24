---
path: apps/electron/src/main/lib/agent-thinking-level.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67f1c33fa9f40632510d213d1886d50c644b2ff4
sha256: 6dd815d3dc4ba81b6c8f267959c5413c2839ded74a9a71cf6d970a257e7d86e3
lines: 80
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-thinking-level.test.ts

## 1. 测试目标

全局档位映射与 Pi 级联解析（会话级/null 语义/provider 能力）。不运行（`NOT_RUN`）。

## 2. 用例清单

17 用例，2 describe：`resolveGlobalThinkingLevel`（:6，6 用例）+`resolvePiThinkingLevel` 11 用例：关→off（:7）、low/medium/high/max→low/medium/high/xhigh（:11-25）、未设置→high（:27-29）。`resolvePiThinkingLevel`（:32，11 用例）：google→off（:33）、anthropic/deepseek 透传（:37/:41）、未设会话级→全局（:45）、openai medium（:49）、off 任意 provider（:53-56）、会话级 xhigh/off 覆盖全局（:58/:62）、**null=用全局而非关**（:66-70，注释 :67）、undefined 分支（:72-75）、medium 忽略全局 high（:77-79）。

## 3. 真实断言

全 toBe（如 :24 max→xhigh、:68-69 null 双值、:74 max→xhigh）。

## 4. 未覆盖与脆弱点

未覆盖：supportsReasoningLevel 其余 provider 矩阵。mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 全局映射/级联/null 语义/provider | 全 16 | covered |
