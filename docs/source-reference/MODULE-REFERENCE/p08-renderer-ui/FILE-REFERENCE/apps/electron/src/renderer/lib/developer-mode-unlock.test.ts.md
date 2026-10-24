---
path: apps/electron/src/renderer/lib/developer-mode-unlock.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7f897cd75495b6d8764152c8fbeeceb60335ffe8
sha256: 50ebcf4eeafdbea41266fc3195546a29658539ae3b96fd7aa05d7a2f2881dd40
lines: 37
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/developer-mode-unlock.test.ts

## 1. 测试目标

直接测试 `developer-mode-unlock.ts` 的 `advanceDeveloperModeUnlockClick`（1 个 describe `:8`）。3 个 `test(`，Given-When-Then 中文命名。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:9-19` | 五次连续点击（间隔 100ms）→仅第 5 次解锁：循环内 `expect(result.unlocked).toBe(click === 5)`；终态 `toEqual(INITIAL_DEVELOPER_MODE_UNLOCK_CLICK_STATE)` |
| 2 | `:21-28` | 序列中断（间隔 MAX_GAP+1）→`unlocked false`+`state.count toBe(1)` |
| 3 | `:30-36` | 时间回拨（1000→900）→不沿用旧序列：`toEqual({count:1, lastClickedAt:900})` |

## 3. 真实断言

`toBe`/`toEqual`。纯函数无 mock。

## 4. 未覆盖

- 恰好 1500ms 边界（≤ 包含）；同毫秒连点；阈值常量改动联动。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(`、断言如 §2 | 已证实 | 文件全读（37 行） |
| 时间回拨防御 | 已证实 | 用例 3 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 连击解锁/复位 | §2 用例 1 | `:9-19` | covered |
| 超时重计 | §2 用例 2 | `:21-28` | covered |
| 时间回拨 | §2 用例 3 | `:30-36` | covered |
| §4 边缘 | — | — | unknown |
