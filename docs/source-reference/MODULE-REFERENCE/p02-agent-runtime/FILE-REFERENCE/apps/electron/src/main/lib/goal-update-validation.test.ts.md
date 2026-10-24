---
path: apps/electron/src/main/lib/goal-update-validation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c567ed34bbc14a1ad1e9d4eba905802ecb0847c
sha256: 2d3cd23c6e11bdb63184e87fc64afc8c1e4664dbe874593bef759e69fc55991e
lines: 16
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/goal-update-validation.test.ts

## 1. 测试目标

Goal 更新 IPC 校验：有效契约放行、非法预算/结构拒绝。不运行（`NOT_RUN`）。

## 2. 用例清单

16 用例（1 合法+test.each 7+for 8），1 describe「Goal IPC 更新验证」（:4）：
1. 有效文本契约+正整数预算（:5-7）：toEqual 去空格结果（goal ' 新目标 '→'新目标'、verification ' 测试通过 '→'测试通过'）。
2. `test.each` 非法预算 7 值拒（:8-10）：NaN/Infinity/-1/0/1.2/'30'/null→toThrow。
3. for 循环非法结构 8 形态拒（:11-15）：null/[]/goal 空/goal 数值/limits 数组/contract 验证对象/limits 未知字段/status 越权字段→toThrow。

## 3. 真实断言

`:6`（toEqual）、`:9`（toThrow×7）、`:13`（toThrow×8）。

## 4. 未覆盖与脆弱点

未覆盖：contract 10000 字符边界、goal 20000 边界。mock 边界：纯函数直调。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 放行/预算拒/结构拒 | 全 16 行 | covered |
| 长度边界 | — | unknown |
