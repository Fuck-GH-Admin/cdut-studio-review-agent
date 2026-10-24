---
path: apps/electron/src/main/lib/cslab/cslab-capsule.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db92b86f9a778b7ba8e20182aebc4b20c1281b8c
sha256: 50b047ab3a2d0e07d781d059d91a48b47b0bc8cc83f6603a4c5f489c8a16d082
lines: 132
kind: test
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-capsule.test.ts

## 1. 测试目标

**活体胶囊链路**（`apps/electron/src/main/lib/cslab/cslab-capsule.test.ts:51`）：绑定单元格→读真实值→修订后 stale→一键更新→血缘链→超 500 行预览从 Parquet 读值。

## 2. 用例清单

1 describe / 5 test（真实 SQLite/表/Parquet 夹具）。

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 绑定单元格读真实值 | `value==='1.25'`、`unit==='mA'`、`revisionAtBind>0`；`checkStaleness==[]`；`status==='fresh'` | `:52-70` |
| 2 | 同名表修订后 stale | `checkStaleness` 含 capsuleId | `:72-81` |
| 3 | 一键更新清 stale | `result.capsule.value==='8.88'`、`changed===true`、`checkStaleness==[]` | `:83-89` |
| 4 | 血缘链 raw→table→capsule | `chain.map(layerType)==['raw','table','capsule']`、`currentValue==='8.88'` | `:91-97` |
| 5 | 超 500 行预览从 Parquet 读 | 大表 `value==='551'`；更新后 `'9999'`、`changed===true` | `:99-131` |

## 3. 真实断言

- `expect(capsule.value).toBe('1.25')`（`:63`）。
- `expect(lineage?.chain.map((node) => node.layerType)).toEqual(['raw', 'table', 'capsule'])`（`:95`）。
- `expect(checkStaleness(lab.id)).toContain(capsuleId)`（`:80`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`bindCapsule` 非法输入、并发绑定。
- 脆弱点：依赖真实 SQLite/Parquet 夹具（非 mock）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例覆盖绑定/陈旧/更新/血缘/大表 | 已证实 | `:52-131` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 绑定/读值 | 1 | `:52-70` | covered |
| 陈旧检测 | 2 | `:72-81` | covered |
| 更新 | 3 | `:83-89` | covered |
| 血缘 | 4 | `:91-97` | covered |
| 大表 Parquet | 5 | `:99-131` | covered |
