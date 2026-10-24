---
path: apps/electron/src/main/lib/study/study-retrieval-router.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68f29e1da5b507e9cd4a01368d1c075d6211dec1
sha256: 3a5baedbddd1ae8d6ac85dfa06a3469f60c10fa0c7a5411a1ccec07fc266ba42
lines: 32
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-retrieval-router.test.ts

## 1. 测试目标

**速课堂双引擎路由**（`apps/electron/src/main/lib/study/study-retrieval-router.test.ts:7`）：默认 classic、graphrag 安全回退、空会话空结果、空白查询 `EMPTY_QUERY`。

## 2. 用例清单

1 describe / 4 test。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 默认 classic、空会话空结果 | `success===true`、`items==[]` | `:8-12` |
| 2 | 显式 classic 一致 | 同上 | `:14-18` |
| 3 | graphrag 空会话安全返回 | `success===true`、`items==[]` | `:20-24` |
| 4 | 空白查询 `EMPTY_QUERY` | `success===false`、`error==='EMPTY_QUERY'` | `:26-31` |

## 3. 真实断言

- `expect(result.error).toBe('EMPTY_QUERY')`（`:30`）。
- `expect(result.items).toEqual([])`（`:11`、`:17`、`:23`）。

## 4. 未覆盖与脆弱点

- 未覆盖：graphrag 抛错回退分支（测试用空会话不触发异常）。
- 脆弱点：空会话夹具语义。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例覆盖路由/空查询 | 已证实 | `:8-31` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| classic/默认 | 1-2 | `:8-18` | covered |
| graphrag 安全 | 3 | `:20-24` | covered |
| 空查询 | 4 | `:26-31` | covered |
| 抛错回退 | — | — | unknown（未覆盖） |
