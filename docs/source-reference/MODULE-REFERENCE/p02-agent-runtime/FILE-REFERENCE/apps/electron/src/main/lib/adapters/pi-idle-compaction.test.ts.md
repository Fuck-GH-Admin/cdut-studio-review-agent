---
path: apps/electron/src/main/lib/adapters/pi-idle-compaction.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: da74346713f1a1971efdd124271813cd7baa1ecf
sha256: 0ae690039b37170d7810a4730c143c0fe337e7291038cbb440544654d108801d
lines: 50
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-idle-compaction.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

上游空闲压缩与审核会话策略整合（`estimatePiContextTokens`/`autoCompactWhenIdle`）：中止/零 usage 回溯有效回复并支持分项 usage；审核上下文超 70% 时先等空闲并保留审核压缩指令；未超阈值不压缩；压缩服务失败不把任务改为失败。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/adapters/pi-idle-compaction.test.ts:22,29,37,45`）。夹具（`:4-19`）：`assistant(totalTokens,stopReason,input)` 构造 usage 消息；`fixture(totalTokens,idle)` mock 会话（`isIdle`/`waitForIdle`/`compact` 记录 actions）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 中止/零 usage 回溯有效回复（`:22`） | 三条消息估算 | `estimatePiContextTokens([...])` `toBe(720)`（跳过 aborted 900 与零 usage）；`[assistant(900,'error'),assistant(0)]`→`toBeUndefined()` |
| 2 | 审核超 70% 先等空闲并保留指令（`:29`） | 701/1000、未 idle、自定义指令 | `actions` `toEqual(['idle','保留审核账本与证据'])` |
| 3 | 未超阈值不压缩；普通会话自身阈值（`:37`） | 700（reserve 300 与 200）→ 801（reserve 200） | 前两轮 `actions` `toEqual([])`；801 后 `toEqual(['compact'])` |
| 4 | 压缩失败不改任务状态（`:45`） | `compact` 抛错 | `resolves.toBeUndefined()`（不抛） |

## 3. 真实断言

逐条见上表（`:25-26,32,41-43,48`）。mock 边界：会话对象为内存 mock（`as unknown as`）；被测函数为真实实现。

## 4. 未覆盖与脆弱点

未覆盖：`isIdle` 为 true 直接压缩路径、`waitForIdle` 抛错、分项 usage 的 input/cache 细节、`reserveTokens` 边界恰等。夹具 `totalTokens` 阈值 700/701/801 硬编码（暗示 70% 阈值）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:22,29,37,45` |
| 回溯有效回复/分项 usage | 已证实 | `:25-26` |
| 审核 70% 策略+指令保留 | 已证实 | `:32` |
| 失败静默（任务不判失败） | 已证实 | `:48` |
| 阈值精确公式 | 推断 | 701/700 边界夹具 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 估算回溯 | 1 | 22-27 | covered |
| 审核等空闲+指令 | 2 | 29-35 | covered |
| 阈值/普通会话 | 3 | 37-44 | covered |
| 失败不判失败 | 4 | 45-49 | covered |
| 其余路径 | 无 | — | unknown |
