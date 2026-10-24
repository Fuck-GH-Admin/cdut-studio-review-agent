---
path: packages/shared/src/utils/tab-mru.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d65bbf8c5bc6824131a2c578becb007988aaccbe
sha256: d0c8e6280da5ed81757205b5b1c1a1099e9f17a2d91012eee0b8e33ee7b42d1e
lines: 11
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/tab-mru.test.ts

## 1. 测试目标

MRU 通用操作（`packages/shared/src/utils/tab-mru.test.ts:3-10`）：去重置首、失效记录跳过。被测 `promoteMru`/`removeMruId`/`selectMruFallbackId`。无夹具（内联数组）。

## 2. 用例清单

共 **2 个 `test(`**（无 describe）：

| # | 行 | 用例 | 断言目标 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 3-5 | MRU 访问去重并把最近标签放队首 | `promoteMru(['a','b','c'],'b')` toEqual `['b','a','c']` | 独立 |
| 2 | 7-10 | 关闭后跳过失效记录选最近仍存在标签 | `selectMruFallbackId(['closed','b','a'],'c',['a','b'])` toBe `'b'`、`removeMruId(['c','b','a'],'c')` toEqual `['b','a']` | 独立 |

## 3. 真实断言

- `:4` `toEqual(['b','a','c'])`。
- `:8` toBe `'b'`（跳过 closed 与当前 c）；`:9` `toEqual(['b','a'])`。

## 4. 未覆盖与脆弱点

- limit 截断、空 tabId 短路、fallback null 路径未锚。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 test、核心三语义 | 已证实 | 全文 |
| 边界分支无锚 | 已证实（核对用例） | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| promoteMru 去重置首 | §2/§3 | 1 | covered |
| selectMruFallbackId/removeMruId | §2/§3 | 2 | covered |
| limit/空 id/null | §4 | — | unknown |
