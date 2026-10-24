---
path: apps/electron/src/main/lib/adapters/pi-agent-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 832341d308138810b81d1fb771fbe1831db736cf
sha256: def3a0267b9f71b8f5c34151f265f5bdf606a2679c161723423265a521e71363
lines: 185
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-agent-adapter.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。文件头自述：只验证 AskUserQuestion 工具注册契约与权限包装闭环，**不启动真实 Pi SDK**（`:3`）。

## 1. 测试目标

三个 describe：①AskUserQuestion 提问闭环（注册契约/三题型 schema/canUseTool 注入 answers/未回答拒绝）；②`mapSDKErrorToTypedError` 中转 5xx/瞬时文案归类（回归：曾误判 unknown_error 且不重试）；③索引模式历史检索护栏（transcript/agent-sessions 路径识别，防 Agent 自读会话历史）。

## 2. 用例清单

共 12 个测试声明（11 `test` + 1 `test.each` 4 例）。

### describe `Pi AskUserQuestion 提问闭环（工具注册契约）`（`:40`）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 混合批次阻断（`:41`） | `['AskUserQuestion','Bash']`+目标 Bash→`true`；目标 AskUserQuestion→`false`；`['Bash']`→`false` |
| 2 | 注册契约（`:47`） | `label==='询问用户'`；description 含 `'问答横幅'`；`JSON.stringify(parameters)` 含 `'proferConfirmation'`（Deck Brief 共用 schema） |
| 3 | 三题型 schema（`:61`） | schema 含 `'fill-blank'`/`'placeholder'`/`'"type"'`；description 含 `'单选'`/`'多选'` |
| 4 | answers 注入闭环（`:75`） | canUseTool 被调（toolName/input/toolUseID/displayName 记录）；`updatedInput` 注入 answers 后结果返回模型（`details.answers` `{q1:'选项 A'}`） |
| 5 | 未回答拒绝（`:107`） | `deny{message:'用户取消回答'}` → `rejects.toThrow('用户取消回答')` |

### describe `mapSDKErrorToTypedError …`（`:122`）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 6 | 4 例 test.each（`:131`） | `'520 status code (no body)'`→`service_error`；`'503:{…}'`→`service_unavailable`；`'Request could not be completed'`→`service_error`；`'服务繁忙，请稍后重试'`→`provider_error`；均 `canRetry===true` |
| 7 | thinking-only 空输出（`:135`） | 归为可重试结构化错误 |
| 8 | 认证失败（`:142`） | 不误判为 5xx 可重试（`canRetry===false` 语义） |

### describe `索引模式历史检索护栏`（`:148`）

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 9 | shell 命令命中（`:149`） | `isConversationHistoryLookupCommand` 对 transcript/agent-sessions 路径命令 `true` |
| 10 | 正常源码搜索不误伤（`:161`） | `false` |
| 11 | 文件读取工具命中（`:167`） | `read/grep/powershell` 带历史路径 → `isConversationHistoryLookupToolCall` `true` |
| 12 | 普通工作区文件（`:180`） | `read/glob/bash` 正常路径 → `false` |

## 3. 真实断言

逐条见上表（`:42-44,53-58,68-72,75-105,117-119,131-133,135-140,142-146,149-178,181-183`）。mock 边界：`createPiSdkStub` 捕获 `defineTool`（`:21-33`）；canUseTool 为内存 mock；无真实 SDK/磁盘。

## 4. 未覆盖与脆弱点

未覆盖：`wrapToolWithPermission` 的 deny 无 message 分支、`buildPromaProductToolDefinitions` 其余产品工具、`extractErrorDetails`/`friendlyErrorMessage`/`isPromptTooLongError`。断言多用 `toContain`/子串（schema 结构较弱断言）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 个测试声明 | 已证实 | `grep test`；`:41-180` |
| AskUser 闭环（注入/拒绝） | 已证实 | `:75-119` |
| 5xx/瞬时归类回归 | 已证实 | `:122-146` |
| 历史检索护栏 | 已证实 | `:148-184` |
| 真实 SDK 行为 | 未知 | 不启动真实 Pi SDK（`:3`） |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 阻断/注册/schema | 1-3 | 41-73 | covered |
| answers 闭环/拒绝 | 4,5 | 75-119 | covered |
| 错误归类 | 6-8 | 122-146 | covered |
| 历史护栏 | 9-12 | 148-184 | covered |
| 其余导出 | 无 | — | unknown |
