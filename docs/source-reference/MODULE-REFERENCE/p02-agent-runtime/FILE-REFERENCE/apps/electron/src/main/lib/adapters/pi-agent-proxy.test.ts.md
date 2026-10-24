---
path: apps/electron/src/main/lib/adapters/pi-agent-proxy.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 608f045cbf2fa30c123e76985a9b7b31f59a0c76
sha256: 80fc7994a08541b424ef51bd5ded47b74b967ec28e8c6e4742b49a6dfdf40549
lines: 130
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-agent-proxy.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Pi 请求代理与 Codex/Ollama 重试策略（`pi-agent-adapter` 的 `buildPiRemoteConnectionSettings`/`buildPiRetrySettings` + `pi-request-proxy`）：Codex HTTP 代理默认 SSE、显式 transport 保留、非 Codex 不改 transport；Ollama/审核请求禁原生重试、其余 provider 保留；本地/远程 Ollama 连接设置；并发代理作用域隔离；managed dispatcher 成功/失败均关闭；运行时代理环境不改写 `process.env`。

## 2. 用例清单

共 12 条测试声明 = 11 个 `test(`（`:11,21,32,39,43,55,62,75,95,108,119`）+ 1 个 `test.each(`（`:47`，3 个 provider）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | Codex+HTTP 代理未指定 transport → SSE（`:11`） | `buildPiRemoteConnectionSettings({provider:'openai-codex',proxyUrl:'http://127.0.0.1:7897'})` `toEqual({httpProxy:'http://127.0.0.1:7897',transport:'sse'})` |
| 2 | 显式 transport 保留（`:21`） | 同上 + `transport:'websocket'` → `toEqual({httpProxy:'http://127.0.0.1:7897',transport:'websocket'})` |
| 3 | 非 Codex 不改 transport（`:32`） | `provider:'anthropic'`+代理 → `toEqual({httpProxy:'http://127.0.0.1:7897'})`（仅一项） |
| 4 | Ollama 禁原生重试（`:39`） | `buildPiRetrySettings('ollama')` `toEqual({enabled:false})` |
| 5 | 审核请求禁重试（`:43`） | `buildPiRetrySettings('openai',{isReviewRequest:true})` `toEqual({enabled:false})` |
| 6 | 3 provider 保留重试（test.each，`:47`） | `openai`/`openai-codex`/`anthropic` 均 `toEqual({enabled:true,maxRetries:8,baseDelayMs:1000})` |
| 7 | 本地 Ollama 保留 SDK 默认（`:55`） | `{provider:'ollama',baseUrl:'http://127.0.0.1:11434'}` → `toEqual({})` |
| 8 | 远程 Ollama 用 SSE+长 idle（`:62`） | `baseUrl:'https://ollama.example.com/v1'`+代理 → `toEqual({httpProxy:'http://127.0.0.1:7897',transport:'sse',httpIdleTimeoutMs:600000,websocketConnectTimeoutMs:30000})` |
| 9 | 并发代理作用域隔离（`:75`） | 两个 `runWithPiRequestProxy` 并发（`Bun.sleep` 交错）：`firstSeen` `toBe(first)`、`secondSeen` `toBe(second)`；作用域外 `getPiRequestProxyDispatcher()` `toBeUndefined()` |
| 10 | managed dispatcher 成功后关闭（`:95`） | 作用域内 `getPiRequestProxyDispatcher()` `toBe(dispatcher)`；`resolves.toBe('done')`；`close` `toHaveBeenCalledTimes(1)`；作用域外 `toBeUndefined()` |
| 11 | managed dispatcher 失败仍关闭（`:108`） | 抛 `OAuth failed` → `rejects.toThrow('OAuth failed')`；`close` `toHaveBeenCalledTimes(1)` |
| 12 | 运行时代理环境不改 process.env（`:119`） | `runtimeEnv:{env:{HTTPS_PROXY:'http://127.0.0.1:7897'}}` → `toEqual({httpProxy:'http://127.0.0.1:7897',transport:'sse'})`；`process.env.HTTPS_PROXY` 前后 `toBe(before)` |

## 3. 真实断言

逐条见上表（`:12-18,22-29,33-36,40,44,48-52,56-59,63-72,79-92,99-105,112-116,121-128`）。mock 边界：`Dispatcher` 为 mock（`close` 计数）/空对象；`getPiRequestProxyDispatcher`/`runWithPiRequestProxy`/`runWithManagedPiRequestProxy` 为真实实现（内存 dispatcher 验证，不启动真实代理网络）。

## 4. 未覆盖与脆弱点

未覆盖：`applyPiProxySettingsForQuery`（无测试调用）、SOCKS 代理分支、`getPiRequestProxyDispatcher` 缓存语义、真实代理网络。并发用例依赖 `Bun.sleep` 交错时序（`:81,85`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 条声明（11 test + 1 test.each×3） | 已证实 | `grep -n "  test("`；`:11-119` |
| transport 三态（默认/显式/非 Codex） | 已证实 | `:11-36` |
| 重试三态（禁/禁/保留） | 已证实 | `:39-52` |
| Ollama 本地/远程设置 | 已证实 | `:55-72` |
| 作用域隔离/必关 | 已证实 | `:75-116` |
| 不改写 process.env | 已证实 | `:119-128` |
| 真实网络 | 未知 | mock dispatcher |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| transport 策略 | 1-3 | 11-36 | covered |
| 重试策略 | 4-6 | 39-52 | covered |
| Ollama 连接 | 7,8 | 55-72 | covered |
| 作用域/关闭 | 9-11 | 75-116 | covered |
| env 不改写 | 12 | 119-128 | covered |
| applyPiProxySettingsForQuery/SOCKS | 无 | — | unknown |
