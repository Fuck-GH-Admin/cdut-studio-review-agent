---
path: apps/electron/src/main/lib/agent-platform-prompt.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e60a37bec9e20671e9718b7b490f7c5e3a88008d
sha256: fe8890e1ebf22722d8e18a96f709f3f561d87b008b8854b632cb4132a430502c
lines: 110
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-platform-prompt.ts

## 1. 结论与边界

**平台运行时 overlay 提示词构造**：只描述当前 OS/shell/路径事实（核心安全与工作区规则由 agent-prompt-builder 单一注入，避免复制两套系统提示词，`agent-platform-prompt.ts:58-61`）。纯字符串构造，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：3 个导出对象（2 接口 + 1 函数）+ 3 内部函数 + 1 内部常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentPlatformProjectCandidate` | 接口 | `:1` | rootPath/name/type/packageName?/gitRemote? | 项目候选 |
| `AgentPlatformPromptOptions` | 接口 | `:9` | platform/shellPath?/agentCwd?/projectCandidates?/isPiRuntime? | |
| `buildAgentPlatformPrompt` | 函数 | `:62` | `(options): string` | 三平台分支构造 |
| `escapePromptText`（内部） | 函数 | `:17` | HTML 转义 &/</> | |
| `projectRootsBlock`（内部） | 函数 | `:21` | 0/1/多候选三态 | 见 §3 |
| `commonToolingRules`（内部） | 函数 | `:35` | 编辑工具形状 + 不链命令规则 | `isPiRuntime` 决定参数形状（`path+edits[].oldText/newText` vs `file_path+old_string/new_string`，`:36-38`） |
| `DIRECTORY_GROUNDING_RULES`（内部常量） | 字符串 | `:49` | 会话沙箱 vs 项目根边界 | 防模型在 cwd `git status` 误判/`git init` 破坏隔离（`:42-48` 注释） |

## 3. 内部逻辑与关键流程

- `projectRootsBlock`（`:21-33`）：0 候选→“No project candidates…inspect first”（`:23`）；1 候选→`**Primary Active Project Root**`+“Do NOT probe the empty session sandbox first”（`:27-30`）；多候选→消歧列表（唯一匹配才用绝对根，`:32`）。
- `buildAgentPlatformPrompt`（`:62-110`）：shellPath 缺省三态（Pi 无 shell→`Bash unavailable (shell_not_found)`；win32→PowerShell；darwin→`/bin/zsh`；否则 `/bin/sh`，`:63-70`）；Pi 无 shell 时执行说明改警告“do not guess-run via zsh/sh”（`:71-73`）；平台三分支：win32（`:76-87`，路径混用警告 `:80`）、darwin（`:89-100`，GUI PATH 提醒 `:96`）、其余 POSIX（`:102-109`）；每分支注入 `commonToolingRules` + `DIRECTORY_GROUNDING_RULES`。

## 4. 调用者与调用链

- 入向：`agent-orchestrator`（域外，grep 全树）；本批测试 `agent-platform-prompt.test.ts` 6 用例。
- 出向：无（纯构造）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯字符串）。

## 6. 分支、失败、取消与恢复

平台三分支 + shellPath/candidate 三态；无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯字符串构造；“工作区规则由 agent-prompt-builder 单一注入”为边界声明（`:58-60`，域外）。

## 8. 修改影响面

提示词文案影响 Agent 行为引导；`escapePromptText` 防注入（**转义覆盖面如实：仅 rootPath/packageName/gitRemote 三值经转义 `:17-19`，项目候选 name/type 直插未转义 `:29,:32`**）；改动需同步 6 测试断言（文案 contains 锁定）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-platform-prompt.test.ts`（104 行/**6 个 `test(`**）：macOS overlay 真 shell+拒 Windows 命令（`:13-31`，9 断言含 `path + edits[].oldText/newText`）；Pi 无 shell 报 shell_not_found 不谎称 zsh（`:33-43`）；Windows overlay 拒 macOS 假设（`:45-60`）；**三平台均注入沙箱边界规则**（回归：防 cwd git init，`:63-76`，3 平台循环断言 `Never run \`git init\`` 等）；单候选标 Primary（`:78-88`）；多/零候选不强标（`:90-103`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三平台模板/三态候选/shell 缺省/转义 | 已证实 | `:1-110` 逐行 + 6 测试互证 |
| “规则由 agent-prompt-builder 单一注入” | 推断（注释声明） | `:58-60`；域外未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 + 4 内部 | §2/§3 | 1-110 | covered |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
