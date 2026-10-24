---
path: apps/electron/src/main/lib/agent-platform-prompt.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: acb2c442e6aa72c70a2d79ec2484c4440f844e9c
sha256: 4d2a5fd2ec5ac351346f8cab39346f76e5ca0953a5a430fd5aac0c6041cd3290
lines: 104
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-platform-prompt.test.ts

## 1. 测试目标

`buildAgentPlatformPrompt`（`agent-platform-prompt.ts:62`）三平台 overlay、shell 缺省、沙箱边界规则、项目候选三态。bun:test；真函数直测，无 mock（候选夹具 `:5-11`）。

## 2. 用例清单

共 **6 个 `test(`**：macOS overlay 真 shell+拒 Windows 假设（`:13`）；Pi 无 shell 报 shell_not_found 不谎称 zsh（`:33`）；Windows overlay 拒 macOS 假设（`:45`）；**三平台均注入沙箱边界**（回归注释 `:62`：防 cwd git init，`:63` 循环 3 平台）；单候选标 Primary（`:78`）；多/零候选不强标（`:90`）。

## 3. 真实断言

- `:22-30` 9 断言（macOS 文案、`path + edits[].oldText/newText`、`never chain multiple checks...`、`not.toContain('Current platform: Windows')`）。
- `:40-42` `toContain('Bash unavailable (shell_not_found)')`+`do not guess-run via zsh/sh`+`not.toContain('/bin/zsh')`。
- `:54-59` Windows 文案、`file_path + old_string/new_string`、`not.toContain('macOS')`。
- `:71-74` 3 平台循环：`## Working Directory vs. Project Root`/`NOT a Git repository`/`Never run \`git init\``/`git -C <project_root> status`。
- `:85-87` Primary 文案；`:98-102` 多/零候选 `not.toContain('Primary Active Project Root')`+零候选 `toContain('No project candidates are currently detected')`。

## 4. 未覆盖与脆弱点

未覆盖：`escapePromptText` 独立用例、win32 POSIX 回退分支细节。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言 | 已证实 | 全 104 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 用例 | §2/§3 | 13-103 | covered |
