---
path: apps/electron/src/renderer/lib/debounce.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5206119877e58437939b5de476b355b935a830cf
sha256: fc1ea3bddb46e333a52e44014ac89285747f3f81007d93d1f18f8ccb4bd48659
lines: 121
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/debounce.test.ts

## 1. 测试目标

验证 `createDebouncedCallback`（`apps/electron/src/renderer/lib/debounce.ts:40-95`）的尾部触发语义契约：连续调用静默后单次执行且取最后一次参数、`flush` 立即执行且不重复触发、`cancel` 丢弃后可复用、执行后状态不残留、无 `maxWait` 时纯尾部语义、`maxWait` 保证持续触发期间按时执行且触发后重新计时。测试基础设施为真实定时器 + `sleep` 辅助（`apps/electron/src/renderer/lib/debounce.test.ts:4`），无 fake timer。

## 2. 用例清单

机械计数：`test(` = 7、`it(` = 0、`describe(` = 1（grep `^\s*(it|test|describe)\(` 于 `apps/electron/src/renderer/lib/debounce.test.ts`），与下表一致（行号 = `apps/electron/src/renderer/lib/debounce.test.ts:<行>`）：

- describe「createDebouncedCallback」（`:6`）：`:7` 连续调用只在静默后执行一次并使用最后一次参数；`:24` flush 立即执行等待中的调用并清除定时器不重复触发；`:43` cancel 丢弃等待中的调用；`:62` 执行完成后可再次触发（状态不残留）；`:74` 不设 maxWait 时持续触发不会执行（纯尾部语义）；`:88` maxWait 持续触发时至少每 maxWait 执行一次；`:107` maxWait 触发后重新开始计时（不会每帧都执行）。

## 3. 真实断言

- `apps/electron/src/renderer/lib/debounce.test.ts:15-16`：`expect(calls).toEqual([])` + `expect(debounced.pending()).toBe(true)`；`:20-21`：`expect(calls).toEqual(['c'])` + `expect(debounced.pending()).toBe(false)`（取最后一次参数 'c'）。
- `:31-32`：flush 后 `toEqual(['立即'])`、`pending()` `toBe(false)`；`:36` 二次 flush 后仍 `toEqual(['立即'])`；`:40` 睡 30ms 后仍 `toEqual(['立即'])`（定时器已清除不二次触发）。
- `:48,51`：cancel 前后 `pending()` `toBe(true)`→`toBe(false)`；`:54` `toEqual([])`（丢弃）；`:59` `toEqual(['保留'])`（cancel 后可复用）。
- `:71`：两轮触发 `toEqual([1, 2])`（状态不残留）。
- `:84-85`：8 次 10ms 间隔触发后 `toEqual([])` + `pending()` `toBe(true)`（纯尾部语义）。
- `:101-104`：`calls.length` `toBeGreaterThanOrEqual(1)`、`calls[0]` `toBeGreaterThanOrEqual(4)`、逐项递增 `expect(increasing).toBe(true)`（证明突发中途执行）。
- `:115`：maxWait 触发后 `toEqual([1])`；`:119` 第二轮 `toEqual([1, 2])`（重新计时，不每帧执行）。

## 4. 未覆盖与脆弱点

- 未覆盖分支（检索范围：本文件全文 + 冻结树 `**/*.test.ts` grep `createDebouncedCallback`）：`fn` 抛错路径（`apps/electron/src/renderer/lib/debounce.ts:63`）无断言；`flush` 与 maxWait 突发期间的组合无断言；`cancel` 后再 `flush` 无断言；多参数调用（全部用例只传单参数）无断言；`wait=0` 与 `maxWait==wait` 无断言；`maxWait<wait` 已由 `apps/electron/src/renderer/lib/debounce.test.ts:107-119` 覆盖（wait=1000、maxWait=50 用例）。
- 脆弱点：全部用例依赖真实时钟与 `sleep(10/20/30/60/120)`（`apps/electron/src/renderer/lib/debounce.test.ts:4`），CI 慢机下 `:101-104` 的 `calls[0] >= 4`、递增序与 `:115,119` 的 maxWait 触发时刻是时序敏感断言（依赖 10ms sleep 的实际间隔）；`:90` 注释明言 maxWait=60ms 配 10ms 触发节奏。无全局状态污染（工厂每次新建，`:9,26,45,64,76,91,109` 各用例独立实例）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/debounce.test.ts:7-120` |
| 覆盖 flush/cancel/pending/尾部/maxWait 六类语义 | 已证实 | `apps/electron/src/renderer/lib/debounce.test.ts:7-120` |
| 时序断言在慢机下的稳定性 | 未知 | NOT_RUN，无运行数据 |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| 尾部触发 + 最后一次参数 | §2,§3 | `debounce.test.ts:7-22` | covered |
| `flush` | §2,§3 | `debounce.test.ts:24-41` | covered |
| `cancel` | §2,§3 | `debounce.test.ts:43-60` | covered |
| 状态复位（再次触发） | §2,§3 | `debounce.test.ts:62-72` | covered |
| 纯尾部语义（无 maxWait） | §2,§3 | `debounce.test.ts:74-86` | covered |
| maxWait 中途执行 / 重计时 | §2,§3 | `debounce.test.ts:88-120` | covered |
| `fn` 抛错 / flush+maxWait 组合 / 多参数 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
