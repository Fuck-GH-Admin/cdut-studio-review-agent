---
path: apps/electron/src/main/lib/agent-workspace-archive.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5f1433cf0c9202c8974310eeb6662dd618cdb697
sha256: edc4c8be5586e25072ec8e45e4c22b8c90c91ecc4dd2a8f980ba8a40e4036d7e
lines: 127
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-workspace-archive.test.ts

## 1. 测试目标

工作区收纳（archive）能力——**无同名源模块**，直测 `agent-workspace-manager` 的收纳/CRUD 行为。不运行（`NOT_RUN`）。

## 2. 用例清单

9 用例（:52/:66/:74/:86/:92/:98/:104/:114/:124），1 describe「工作区收纳」（:51）。fixture：mock.module('electron')（:14）+tmp 目录+`getAgentWorkspacesIndexPath`（:45）。
1. 收纳写入 archived/archivedAt，取出清理（:52-64）。
2. 重复收纳保持首次 archivedAt（:66-72）。
3. 收纳不改 name/slug、落盘保留 name 键（:74-84）。
4. 只传 archived 跳过重名校验（:86-90）。
5. 改名仍执行重名校验（:92-96）。
6. 默认工作区不可收纳（:98-102）。
7. 收纳后仍留底层列表、由可见性过滤（:104-112）。
8. 收纳状态跨读取持久化（:114-122）。
9. 未知 id 抛错（:124-126）。

## 3. 真实断言

形态 toBe/toEqual/toThrow（各用例断言对应 §2 语义）。

## 4. 未覆盖与脆弱点

未覆盖：skills/memory 组。mock 边界：mock.module('electron')+真实文件系统 tmp；经 `agent-workspace-manager` 真实实现（await import :44）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例与语义如 §2 | 已证实 | grep 清单+断言段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测能力 | 用例 | 状态 |
| --- | --- | --- |
| 收纳/幂等/重名/默认保护/持久化 | #1-#9 | covered |
