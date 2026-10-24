---
path: apps/electron/src/main/lib/pi-harness/graph-focus-packet.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7f8010fb8d2d55d5407d28dcddb8664984f70e7e
sha256: fd8bf16d5070183f000bb24b03288e45fe65ff8a4148e0439269938938ad5ce6
lines: 66
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/graph-focus-packet.test.ts

## 1. 测试目标

`buildGraphFocusPacket`（`graph-focus-packet.ts:79`）：单聚焦+有界段、确定性+脱敏+双硬限、graphless 回退。bun:test；node/graph/goal 夹具（`:6-16`），无 mock。

## 2. 用例清单

共 **3 个 `test(`**：单聚焦任务+有界 ready/blocked/验证（`:19`）；确定性+脱敏+双限（`:44`）；graphless 回退（`:61`）。

## 3. 真实断言

- `:34-41` 8 断言：`<graph_focus>`/`active: active`/`acceptance: bun test target`/`assurance: pending`/`ready: ready-1`/**`not.toContain('ready-3')`**（前 2 上限）/`blocked: blocked`/闭合标签。
- `:54-58` `first` `toBe(second)`（确定性）、≤`GRAPH_FOCUS_MAX_CHARS`、`estimateGraphFocusPacketTokens(first)` ≤ MAX_TOKENS、`not.toContain('sk_super_secret')`、含 `[redacted]`。
- `:63-64` `goal: graphless`/`focus: graphless`。

## 4. 未覆盖与脆弱点

truncated 尾标分支、maxChars 入参钳制无独立断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例/断言 | 已证实 | 全 66 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 用例 | §2/§3 | 19-65 | covered |
