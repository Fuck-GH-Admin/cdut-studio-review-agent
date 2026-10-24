---
path: apps/electron/src/main/lib/memory-search-router.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 40f051423c7f715cce41495d4d50ec8b45b4be22
sha256: 704e81358d17017c5373870b0a5aa95b42534a5791c05a0baae37a494377e615
lines: 38
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-search-router.test.ts

## 1. 测试目标

hipporag 路由：相关命中+无命中空数组（不抛错契约）。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:25/:33），1 describe（:24）；fixture：tmp memory-archive 两 md（skin/weather :10-16）。
1. hipporag 命中（:25-31）：isArray+length>0+`hits[0].relativePath` toBe 'skin.md'。
2. 无命中返 []（:33-37）：toEqual([])。

## 3. 真实断言

`:28-30`/`:36`（toBe/toBeGreaterThan/toEqual）。

## 4. 未覆盖与脆弱点

未覆盖：classic 分支、异常回退路径。mock 边界：真实 tmp 文件系统（真引擎/回退由 router 内部）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| hipporag 命中/空 | #1/#2 | covered |
| classic/回退 | — | unknown |
