---
path: apps/electron/src/renderer/atoms/agent-live-messages.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3d27a6340b553fc2c3d42a517480d4e49db4a983
sha256: 3e71b354e15ce17dbf0e45b26667493846d713cc548da522998b3f397a52837e
lines: 28
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-live-messages.test.ts

## 1. 测试目标

`liveMessagesAtomFamily`（测自 `./agent-atoms`，**源文件不属本批**）：会话切片隔离——更新单会话不扰动他者。不运行（`NOT_RUN`）。

## 2. 用例清单

1 用例（:11），1 describe（:10）：store 更新 'a' 后 `a` 变（toBe 新内容+引用变化）、`b` 引用不变（:24-26）。

## 3. 真实断言

`:24`（toEqual）、`:25`（not.toBe）、`:26`（toBe）。

## 4. 未覆盖与脆弱点

注意：被测 `agent-atoms.ts` 源不属 nb-114（本批仅其测试）。mock 边界：jotai vanilla store 真实现。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 切片隔离 | #1 | covered |
