---
path: apps/electron/src/main/lib/cslab/cslab-db.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0285c00477c42d36ab2ed1c449b3b9ae7cec070f
sha256: 20c7512ee8b9d4a2400e3ea9b1c3e27d43d8fb56b09df2f69df92d97b7a8f2fd
lines: 88
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-db.test.ts

## 1. 测试目标

**CSLab SQLite 适配层**（`apps/electron/src/main/lib/cslab/cslab-db.test.ts:29`）：打开即 WAL+busy_timeout、事务提交/回滚不留残、lab 级 revision 单调递增。

## 2. 用例清单

1 describe / 3 test（真实 SQLite）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 打开即 WAL+busy_timeout | `journal_mode==='wal'`（小写比较）、`busy.timeout>0` | `:30-37` |
| 2 | 事务提交可读、回滚不残留 | 提交后 `getEntityByUri(…'raw-1').title==='committed.csv'`；回滚后 `getEntityByUri(…'raw-2')===null` | `:39-79` |
| 3 | revision 单调递增 | `second === first + 1` | `:81-87` |

## 3. 真实断言

- `expect(String(journal.journal_mode).toLowerCase()).toBe('wal')`（`:35`）。
- `expect(getEntityByUri(db, 'cdut://lab-test/raw/raw-2')).toBeNull()`（`:78`）。
- `expect(second).toBe(first + 1)`（`:86`）。

## 4. 未覆盖与脆弱点

- 未覆盖：并发事务、`close*` 释放、45+ CRUD 全表（只覆盖连接/事务/修订核）。
- 脆弱点：`busy_timeout` 只断言 `>0`。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖 WAL/事务/revision | 已证实 | `:30-87` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| WAL/timeout | 1 | `:30-37` | covered |
| 事务提交/回滚 | 2 | `:39-79` | covered |
| revision 自增 | 3 | `:81-87` | covered |
| 全量 CRUD | — | — | unknown（未覆盖） |
