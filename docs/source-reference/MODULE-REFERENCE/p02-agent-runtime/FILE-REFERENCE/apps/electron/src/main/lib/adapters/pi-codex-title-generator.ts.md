---
path: apps/electron/src/main/lib/adapters/pi-codex-title-generator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 92546200354a4f31d1c89ed9941f6fd285602b3d
sha256: bfc41717a85b2bedc3cae5fff0e4763270ca89798efeb732a0ce7832d72aa2a3
lines: 168
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-codex-title-generator.ts

## 1. 结论与边界

通过 Pi 的 ChatGPT Codex OAuth runtime 发起轻量文本（标题）请求。标题生成不能复用 `@profer/core` 的 Chat Completions/Messages 请求：Codex OAuth 只支持 Pi 管理的 Responses 协议、认证头与账号路由；本模块复用同一 ModelRuntime/凭证存储，且**不写入 Pi 的全局认证目录**（文件头 `apps/electron/src/main/lib/adapters/pi-codex-title-generator.ts:1-8`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个接口 + 4 个函数 = 8 个导出（类/常量导出 0；`:28,37,45,52` 四接口 + `:70,85,95,141` 四函数）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CodexTitleGenerationInput` | 接口（导出） | 28-36 | `{modelId,prompt,credentials,proxyUrl?,signal?,onCredentialsRefreshed?}` | |
| `CodexTitleRuntime` | 接口（导出） | 38-43 | `complete(model,context,options)=>Promise<Pick<AssistantMessage,…>>` | 可注入运行时 |
| `CodexTitleRequestEnvironment` | 接口（导出） | 45-51 | `dispatcher?`+代理三操作 | 抽出以便验证参数/清理 |
| `CodexTitleConnectionSettings` | 接口（导出） | 53-57 | `{proxyUrl?,noProxy?,transport:'auto'\|'sse'}` | |
| `resolveCodexTitleConnectionSettings` | 函数（导出） | 71-83 | `(proxyUrl?)=>CodexTitleConnectionSettings` | 连接策略 |
| `extractCodexResponseText` | 函数（导出） | 86-91 | 抽取 text 块 | 忽略 reasoning/tool |
| `completeCodexTitleRequest` | 函数（导出） | 96-136 | `(runtime,model,prompt,environment,signal?,transport?)=>Promise<string\|null>` | 单次短请求 |
| `generateCodexTitle` | 函数（导出） | 142-168 | `(input)=>Promise<string\|null>` | 端到端 |
| `TITLE_MAX_OUTPUT_TOKENS`/`TITLE_REQUEST_TIMEOUT_MS` | 内部 | 25-26 | 40 / 30_000 | |
| `getCaseInsensitiveEnvironmentValue` | 内部 | 59-65 | 环境变量大小写不敏感读取 | |

## 3. 内部逻辑与关键流程

### 3.1 连接策略（`resolveCodexTitleConnectionSettings`，`:71-83`）

代理优先级：显式 `proxyUrl` → `HTTPS_PROXY` → `HTTP_PROXY` → `ALL_PROXY`（大小写不敏感，`:73-76`）；`NO_PROXY` 透传（`:77`）；有代理 → `transport:'sse'`（可携带 undici dispatcher），否则 `'auto'`（优先 WebSocket）（本文件 `:66-68` 注释、`:82`）。

### 3.2 单次请求（`completeCodexTitleRequest`，`:96-136`）

`finally` 关 dispatcher（`:125-127`）。请求要点（`:103-118`）：`sessionId=randomUUID()` **独立 session**，避免加入前台 Agent 的 Responses continuation/cache（`:104-106`）；`maxTokens:40`、`timeoutMs:30_000`、`maxRetries:0`；`reasoningEffort:'none'`、`textVerbosity:'low'`、`toolChoice:'none'`；`summary` 省略让 Pi 用协议默认 `auto`（OpenAI 不接受 `off`，`:112-114`）。`stopReason` 为 `error`/`aborted` → 抛 `errorMessage` 或 `Codex 标题请求未完成`（`:120-122`）；返回 `extractCodexResponseText(...).trim() || null`（`:124`）。

### 3.3 端到端（`generateCodexTitle`，`:142-168`）

动态 `import('@earendil-works/pi-coding-agent')` → `buildCodexModel`（含凭证刷新回调，`:135-140`）→ 连接设置 → `createPiRequestProxyDispatcher`（idle 超时=请求超时，`:142-147`）→ `completeCodexTitleRequest`（注入真实代理操作，`:149-161`）。失败由调用方按产品语义决定降级（本文件 `:139` 注释）。

## 4. 调用者与调用链

入向：会话标题生成链（调用方按产品语义降级，`:279-280`）；测试：`pi-codex-title-generator.test.ts`（77 行）。出向：`node:crypto`、`@profer/shared`（`CodexOAuthCredentials`）、`@earendil-works/pi-ai/compat`（类型）、`undici`（Dispatcher 类型）、`./pi-model-registry`（`buildCodexModel`）、`./pi-request-proxy`（代理四操作）。

## 5. 数据 I/O、读写与副作用

- 网络：经 Pi Codex runtime 发一次 Responses 请求（标题）。
- 副作用：安装/清理请求代理 fetch/dispatcher（`:125-127,142-147`）；凭证刷新回调（`:138`）。
- 不写 Pi 全局认证目录（文件头 `:7`）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非对象/非目标模型（settings 层） | 原样返回 | 见 settings 手册 |
| `stopReason` error/aborted | 抛 `errorMessage`/`Codex 标题请求未完成` | 120-122 |
| 空文本 | 返回 `null` | 124 |
| AbortSignal | 透传 `runtime.complete` | 108 |
| 任何异常 | `finally` 清理 dispatcher | 125-127 |

无自动重试（`maxRetries:0`）；恢复=调用方降级。

## 7. 权限与权威状态

- 凭证来自 `CodexOAuthCredentials`（调用方提供 + 刷新回调）；独立 `sessionId` 防止标题请求污染前台 Agent 会话/缓存（`:104-106`）。
- `reasoningEffort:'none'`/`toolChoice:'none'`——标题请求不带推理/工具。

## 8. 修改影响面

- 改请求参数影响 Codex 计费/限流与标题生成；改连接策略影响代理环境适配。
- `CodexTitleRuntime`/`CodexTitleRequestEnvironment` 抽象供测试注入（测试手册记录）。

## 9. 测试证据

直接测试：`pi-codex-title-generator.test.ts`（77 行，详见其手册）：连接设置解析、文本抽取、请求参数/代理作用域/异常清理。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

缺口：真实 Codex 网络路径（测试为 mock runtime）、凭证刷新路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 独立 sessionId 防污染 | 已证实 | `:104-106` |
| maxRetries:0/超时 30s/40 tokens | 已证实 | `:108-110` |
| finally 清理 dispatcher | 已证实 | `:125-127` |
| 代理→SSE、无代理→auto | 已证实 | `:71-83` |
| 不写 Pi 全局认证目录 | 已证实 | 文件头 `:7` |
| 真实网络/凭证刷新 | 未知 | 测试 mock |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 连接策略 | §3.1 | 59-83 | covered |
| `extractCodexResponseText` | §3.2 | 86-91 | covered |
| `completeCodexTitleRequest` | §3.2 | 96-136 | covered |
| `generateCodexTitle` | §3.3 | 142-168 | covered |
| 真实网络 | §9,§10 | — | unknown |
