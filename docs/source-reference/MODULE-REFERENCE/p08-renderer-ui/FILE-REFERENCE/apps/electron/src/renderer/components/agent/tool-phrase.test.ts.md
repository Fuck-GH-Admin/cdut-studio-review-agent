---
path: apps/electron/src/renderer/components/agent/tool-phrase.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 578483f3b4c62a64a92d562e3ff185fa84f41e34
sha256: 2858fe612473871141cad98503b18533c3f807f9729bf17149ea13c3980075b9
lines: 22
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/tool-phrase.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

命令类工具（Bash/PowerShell）行内短语：「执行」前缀、两工具同形态（不落未知分支）、超长截断。

## 2. 用例清单

3 用例 / 1 describe（`命令类工具的行内短语` :5）。纯函数。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | Bash 前缀 | 6-11 | label `执行 ls -la`、loadingLabel `正在执行 ls -la...` |
| 2 | PowerShell 同形态 | 13-19 | 与 Bash 结果 deep-equal |
| 3 | 超长截 80 | 21-25 | `执行 xxx…`（80 个 x+省略号） |

## 3. 真实断言

逐条读自 :6-25，代表性断言：

- `getToolPhrase('Bash', { command: 'ls -la' })` → `label==='执行 ls -la'`、`loadingLabel==='正在执行 ls -la...'`（:8-10）。
- `getToolPhrase('PowerShell', { command })` deep-equal `getToolPhrase('Bash', { command })`（:17）——同形态不落未知工具分支。
- `command='x'.repeat(200)` → label `执行 ${'x'.repeat(80)}…`（:24）——80 字截断。

## 4. 未覆盖与脆弱点

- 未覆盖：其余 30+ 工具分支、MCP 分解、diffStats。
- 脆弱点：无。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §2 | 已证实 | 本文件逐行 |
| 命令类口径被固定 | 已证实 | 用例 2（同形态是显式契约） |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| Bash/PowerShell 分支 | §2 | covered |
| 其余 switch/default | §4 | unknown（未测） |
