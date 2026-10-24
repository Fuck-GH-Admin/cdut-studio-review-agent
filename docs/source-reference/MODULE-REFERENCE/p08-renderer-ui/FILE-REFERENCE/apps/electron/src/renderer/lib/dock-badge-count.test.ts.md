---
path: apps/electron/src/renderer/lib/dock-badge-count.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 206deda8a4445dcfe8a75e90f4882d8136dab471
sha256: 624739fe93ed9607b0653165e57070f11bfffabff2f53aab119870d145953d7d
lines: 36
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/dock-badge-count.test.ts

## 1. 测试目标

直接测试 `dock-badge-count.ts` 两函数（1 个 describe `:4`）。3 个 `test(`。

## 2. 用例清单

| # | 行 | Given-When-Then + 真实断言 |
| --- | --- | --- |
| 1 | `:5-14` | 全零输入→`count toBe(0)` |
| 2 | `:16-25` | 2+3+1+1→`count toBe(7)`（四类求和） |
| 3 | `:27-35` | Map 三分组（含空队列）→`countPendingRequests toBe(3)` |

## 3. 真实断言

`toBe`（精确数值）。纯函数无 mock 框架；Map 构造分组输入，空队列组参与求和验证。

## 4. 未覆盖

- 负数钳制分支；超大计数；countPendingRequests 空 Map。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个 `test(`、断言如 §2 | 已证实 | 文件全读（36 行） |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 零项/求和/分组 | §2 | `:5-35` | covered |
| §4 边缘 | — | — | unknown |
