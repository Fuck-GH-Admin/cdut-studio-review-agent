---
path: apps/electron/src/renderer/components/agent/context-usage-badge-channel.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b6eb52b6ceccf05a916a1c00487619510d73847
sha256: 81967135e4e1a588ec3dd99b4e7b0857fdc29586a865aa42305d3b1eef67b4df
lines: 16
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/context-usage-badge-channel.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

额度渠道三值回退：优先当前渠道；初始化短暂缺当前渠道保留最近稳定；从未有渠道不触发额度查询（undefined）。

## 2. 用例清单

共 3 个 `test(`（`apps/electron/src/renderer/components/agent/context-usage-badge-channel.test.ts:5,9,13`，describe `:4`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 优先当前（`:5`） | `('session-channel','previous-channel')` `toBe('session-channel')` |
| 2 | 保留稳定（`:9`） | `(undefined,'previous-channel')` `toBe('previous-channel')` |
| 3 | 无渠道（`:13`） | `(undefined,undefined)` `toBeUndefined()` |

## 3. 真实断言

逐条见上表（`:6,10,14`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：`null` current 入参（`??` 同义）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep test(`；`:5-15` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 三值回退 | 1-3 | 5-15 | covered |
