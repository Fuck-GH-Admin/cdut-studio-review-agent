---
path: apps/electron/src/main/lib/agent-workspace-profile.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 81a11038ffc922a00ffb848ea1318d96d3ab137d
sha256: 31837dc037fb9e0ee2167f8ec8fafd265f90b5a368bfa4333c315cbc5c7eba24
lines: 75
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-workspace-profile.test.ts

## 1. 测试目标

workspace profile/auto-memory 迁移行为——**无同名源模块**，直测 `agent-workspace-manager` 的 profile 函数。不运行（`NOT_RUN`）。

## 2. 用例清单

3 用例（:35/:53/:66），1 describe「Profer workspace profile」（:34）。fixture：mock.module('electron')（:6）。
1. 旧 CLAUDE.md 仅兼容读取、新写入不回写旧文件（:35-51）。
2. 旧版 .claude/memory 复制到 .cdutai/memory、旧目录保留（:53-64）。
3. 无历史文件时写 workspace-profile.md（:66-74）。

## 3. 真实断言

形态 toBe/existsSync 断言（各用例对应 §2 迁移语义）。

## 4. 未覆盖与脆弱点

未覆盖：auto-memory 文件读写链。mock 边界：mock.module('electron')+tmp 真实文件系统；经 `agent-workspace-manager` 真实实现（await import :18）。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例与语义如 §2 | 已证实 | grep 清单+断言段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测能力 | 用例 | 状态 |
| --- | --- | --- |
| profile 兼容读/记忆迁移/新写入 | #1-#3 | covered |
