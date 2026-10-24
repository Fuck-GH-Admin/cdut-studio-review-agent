---
path: apps/electron/src/renderer/components/agent/mention-query-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2c08cd6da799166c19f8d6e8a32a49494a6877d
sha256: 7515924182b983ba6ec28072ad9316e83fe430bbce9f96f6317275614879ede1
lines: 82
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/mention-query-utils.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

mention 查询工具层：快照键稳定、本地过滤排序、双组配额封顶（代表性+总上限）、最新查询胜出（在途被替换立即空值）。

## 2. 用例清单

6 用例 / 1 describe（`mention query helpers` :10）。纯函数+真异步（setTimeout）；无 mock。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 快照键等价稳定 | 12-17 | 去重+排序后键相等 |
| 2 | 本地过滤排序 | 19-31 | 'age'→`['agent.md']`、total 1 |
| 3 | 封顶保双组代表 | 33-42 | limit 2→各 1 |
| 4 | 偏斜组总上限 | 44-62 | 1999+1→200；limit 1→1 |
| 5 | 在途被替换立即空值 | 64-75 | `Promise.race` 50ms 内得 ''（不等旧 promise） |
| 6 | 只有最新返回真值 | 77-85 | old→''、new→'new' |

## 3. 真实断言

如 §2 表（逐条读自 :12-85）。

## 4. 未覆盖与脆弱点

- 未覆盖：`getCachedWorkspaceCapabilities`/`getCachedFileSnapshot`（需 window.electronAPI）。
- 脆弱点：用例 5-6 依赖计时（5ms/50ms）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| 最新胜出/配额被固定 | 已证实 | 用例 3-6 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| createFileSnapshotKey/filterFileSnapshot/capGroups | §2 | covered |
| createLatestQueryRunner | §2 | covered |
| 双缓存 TTL | §4 | unknown（未测） |
