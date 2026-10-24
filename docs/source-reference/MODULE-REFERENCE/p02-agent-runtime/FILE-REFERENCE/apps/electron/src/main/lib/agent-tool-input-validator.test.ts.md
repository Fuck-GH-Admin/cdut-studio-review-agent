---
path: apps/electron/src/main/lib/agent-tool-input-validator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32b2cca3564f12a12cfd37349b99cb5f0f01426a
sha256: 7a0b927171dbd96c5e4fe4bcef7c387fe7dd54c6a6f44d6f9b6b1cfe60b8da81
lines: 59
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-tool-input-validator.test.ts

## 1. 测试目标

Pi/canonical 归一与必需参数校验。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:5/:13/:30/:40/:51/:56），1 describe（:4）。
1. canonical Edit 通过（:5-11）：toBeNull。
2. Pi Edit 归一（:13-28）：normalize toMatchObject（file_path/old_string/new_string）+validate null。
3. MultiEdit 多编辑无需顶层 new_string（:30-38）：null。
4. 缺嵌套 newText 报原生字段+恢复指引（:40-49）：message 含 'edits[0].newText'/'re-reading the current file'/'do not reuse oldText'。
5. Pi Read/Write path 归一（:51-54）：null。
6. 未知工具兼容（:56-58）：null。

## 3. 真实断言

如 §2（toBeNull/toMatchObject/toContain）。

## 4. 未覆盖与脆弱点

未覆盖：Bash 空白命令拒、缺顶层参数 message 形态。mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 归一/嵌套缺参/兼容 | #1-#6 | covered |
