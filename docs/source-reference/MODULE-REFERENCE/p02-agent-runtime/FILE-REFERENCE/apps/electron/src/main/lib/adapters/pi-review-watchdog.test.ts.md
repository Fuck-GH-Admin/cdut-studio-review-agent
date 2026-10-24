---
path: apps/electron/src/main/lib/adapters/pi-review-watchdog.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b892b29405e14759a0804068bf946a1b1fc4b130
sha256: 831ac800c5d1fdb86b6e2d93454d33c7a28a994c26f6a2a08eb9fd775e5dc5ca
lines: 241
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-review-watchdog.test.ts

## 1. 测试目标

`pi-review-watchdog.ts` 全部导出行为：阈值解析、首字节/整轮判定、响应头不算首字节、终态原因覆盖、**原因不得被编排层当成可重试错误**。被测逻辑见同组手册。

## 2. 用例清单

7 个 describe + **19 个 `test()`**：

| describe | 用例数 | 行 |
| --- | --- | --- |
| 阈值解析 | 5 | `:16-64` |
| 首字节超时 | 3 | `:68-103` |
| 响应头不算首字节 | 2 | `:107-127` |
| 整轮无进展 | 3 | `:131-168` |
| 纯判定函数 | 2 | `:172-190` |
| 终态原因 | 2 | `:194-212` |
| 原因不得可重试 | 2 | `:216-240` |

## 3. 真实断言（代表性逐条）

- 阈值：默认=导出常量（`:19-20`）；进程 env `45000` 生效（`:28`）；`transportIdleTimeoutMs:300_000`→`toBe(285_000)` 且 `<300_000`（`:38-39`）；0→默认（`:43-44`）、10_000→`30_000` 保底（`:45-46`）；env 覆盖 600_000/1_800_000（`:56-57`）、非法 'abc'/'-1' 回默认（`:62-63`）。
- 首字节：阈值-1 不触发（`:73`）；到阈值 reason 含'无任何数据返回'+LABEL（`:77-78`）；**firedReason 不再变化**（`:80-81`）；290s 首字节+每 60s 增量不误杀（`:88-95`）；已触发后 `startRequest` 返回 true（`:102`）。
- 响应头：`noteActivity` 不解除首字节（`requestFirstByteSeen` `toBe(false)` `:114`，仍判 first_byte `:115-117`）；`touch` 才解除（`:124-126`）。
- 整轮：工具后停滞→stalled 含'无进展'+LABEL（`:138-142`）；8 轮工具循环均进展不触发（`:149-158`）；首字节已到但无增量仍 stalled（`:161-168`）。
- 纯判定：空闲态按整轮阈值 `kind` `toBe('stalled')`（`:179`）；阈值内 `none`（`:189`）。
- 终态：`applyWatchdogTerminalReason` → subtype `error_during_execution`、terminal_reason `review_watchdog_timeout`、errors[0] 含原因、**session_id 原样保留**（`:199-203`）；传输层 abort 文案被覆盖（`:211`）。
- 可重试：两默认原因 `isWatchdogReasonRetryable` `toBe(false)`（`:228-229`）；'4 分钟'/'20 分钟' 表述、不含'秒'（`:231-233`）；自检识别'服务繁忙'/'502'/'overloaded' `toBe(true)`（`:237-239`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`applyWatchdogToAssistantError`（未直接断言）；`createPiReviewWatchdogState` 单独断言；真实计时器（全部注入假时钟）。
- 脆弱点：中文文案字符串（'无任何数据返回'/'无进展'/'X 分钟'）被精确断言——文案变更需同步测试（正是防重试设计的一部分）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 用例与断言如 §3 | 已证实 | 逐行读 `:1-241` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| resolvePiReviewWatchdogTimeouts | 5 | covered |
| createPiReviewWatchdog/evaluate | 10 | covered |
| applyWatchdogTerminalReason | 2 | covered |
| isWatchdogReasonRetryable | 2 | covered |
| applyWatchdogToAssistantError | — | unknown |
