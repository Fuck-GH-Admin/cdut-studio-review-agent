---
path: apps/electron/src/renderer/atoms/study-atoms.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: efca163892f14cd1260997e53bd9d35b3f6ddbf0
sha256: f98f666495b860f9bce7a23be0699543a7026830b0cc06737ea614e43f1e9f40
lines: 82
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/study-atoms.test.ts

## 1. 测试目标

**study-atoms 会话状态隔离**（`apps/electron/src/renderer/atoms/study-atoms.test.ts:2-4`）：验证右栏 Tab 拓扑、生成状态、工件摘要在会话间严格隔离。

## 2. 用例清单

1 describe（`:16`）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1+ | 会话隔离 | A 生成中切 B，B 空闲可用；Tab 拓扑/生成中/工件摘要互不串扰 | `:16-82` |

## 3. 真实断言

（`:16-82` 断言组——Map 键控隔离。）

## 4. 未覆盖与脆弱点

- 未覆盖：清理/上限策略。
- 脆弱点：Map 键（sessionId）语义。

## 5. 已证实/推断/未知

会话隔离用例覆盖已证实（`:16-82`）；测试实际通过未知（NOT_RUN）。

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 会话隔离 | 1+ | `:16-82` | covered |
