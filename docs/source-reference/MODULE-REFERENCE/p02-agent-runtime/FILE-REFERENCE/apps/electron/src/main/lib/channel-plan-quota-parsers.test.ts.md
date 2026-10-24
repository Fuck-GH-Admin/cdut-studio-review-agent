---
path: apps/electron/src/main/lib/channel-plan-quota-parsers.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f58494bc28728ca6c55e92e9d01b9b545ae1f2c5
sha256: fa19ba6e33f5cf7da7bd440a3ca823dab63ad523f7932312cc6f08a706735cc3
lines: 22
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-plan-quota-parsers.test.ts

## 1. 测试目标

直接测试 `parseMiniMaxGeneralQuotaWindows` 的 **0-is-valid 契约**：weekly total=0 仍产窗口；缺失不虚构。2 个 `test(`，1 个 `describe('MiniMax Token Plan 周额度解析')`（`:4`）。

## 2. 用例清单

无夹具/无 mock/无 IO。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:5-15` | `{current_interval_remaining_percent:80, current_weekly_total_count:0, current_weekly_remaining_percent:0}` | `:11` `toEqual([objectContaining{type:'5h',remainingPercent:80}, objectContaining{type:'weekly',remainingPercent:0,usedPercent:100}])` |
| 2 | `:17-21` | `{current_interval_remaining_percent:75}` | `:19` `toHaveLength(1)`；`:20` `toMatchObject{type:'5h',remainingPercent:75}` |

## 3. 真实断言

`toEqual`（含 `expect.objectContaining` 窗口匹配）+ `toHaveLength` + `toMatchObject`。无快照测试。

## 4. 未覆盖

- `resetAt` 秒/毫秒换算与非法值。
- `clampPercent` 边界（>100/NaN）。
- 多 items 循环。
- `?? 100` 缺省满额分支。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个 `test(`、断言如 §2 | 已证实 | 文件全读（22 行） |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 0-is-valid 周窗口 | §2 用例 1 | `:5-15` | covered |
| 缺失不虚构 | §2 用例 2 | `:17-21` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
