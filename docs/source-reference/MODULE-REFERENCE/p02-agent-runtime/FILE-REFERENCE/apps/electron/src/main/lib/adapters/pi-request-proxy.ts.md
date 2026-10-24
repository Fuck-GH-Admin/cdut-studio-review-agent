---
path: apps/electron/src/main/lib/adapters/pi-request-proxy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b80ca750c3ca5c1f76efa2e3cd9e4db8ee141ef7
sha256: 8a5960da58a8464ce8beec45424b68ee0347418f9441895118149ecc974314ab
lines: 132
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-request-proxy.ts

## 1. 结论与边界

Pi runtime 的**请求级 HTTP 代理**（运行时代码）：Pi 的程序化 SDK 不执行 CLI 入口的 `configureHttpDispatcher()`，用 AsyncLocalStorage 为每次模型 provider stream 绑定 dispatcher，避免进程级环境变量或 `setGlobalDispatcher()` 在并发会话间串线（`apps/electron/src/main/lib/adapters/pi-request-proxy.ts:1-7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `installPiRequestProxyFetch` | 导出函数 | 49-61 | `(): void` | 安装全局 fetch 路由（幂等） |
| `PiRequestProxyOptions` | 导出接口 | 63-67 | `{proxyUrl?, noProxy?, httpIdleTimeoutMs?}` | |
| `createPiRequestProxyDispatcher` | 导出函数 | 72-88 | `(options): Dispatcher \| undefined` | 单请求 dispatcher（调用方负责 close） |
| `runWithPiRequestProxy` | 导出函数 | 91-94 | `(dispatcher, operation): T` | ALS 绑定 |
| `runWithManagedPiRequestProxy` | 导出异步函数 | 102-111 | `(dispatcher, operation): Promise<T>` | 执行+finally 释放 |
| `runWithPiRequestProxyScope` | 导出异步函数 | 113-119 | `(options, operation): Promise<T>` | 安装+建+托管一体 |
| `getPiRequestProxyDispatcher` | 导出函数 | 122-124 | `(): Dispatcher \| undefined` | 测试/诊断 |
| `closePiRequestProxyDispatcher` | 导出异步函数 | 126-132 | `(dispatcher): Promise<void>` | 释放连接池（失败 console.warn 吞错） |

内部：`DEFAULT_HTTP_IDLE_TIMEOUT_MS=300_000`（`:21`）、`requestDispatcherStorage`（ALS，`:22`）、`originalFetch`（`:23`）、`withUndiciErrorListener`（`:27-32`，挂空 error 监听防 undici 静默事件崩溃）、`createUndiciClient/createUndiciOriginDispatcher`（`:34-46`，connections===1 用 Client 否则 Pool）。

## 3. 内部逻辑与关键流程

- `installPiRequestProxyFetch`（`:49-61`）：`proxyFetchInstalled` 幂等；全局 fetch 查 ALS——无 dispatcher 走原 fetch（非 Pi 上下文不受影响，`:55`），有则 `undiciFetch` 带 dispatcher。
- `createPiRequestProxyDispatcher`（`:72-88`）：无 proxyUrl→undefined（`:74`）；`EnvHttpProxyAgent`（http/https 同 proxy、`allowH2: false`、headers/bodyTimeout=规范化 idle 超时，`:78-87`）。
- `runWithManagedPiRequestProxy`（`:102-111`）：finally `closePiRequestProxyDispatcher`（成功/取消/抛错均释放，`:99-100`）；OAuth 等短时操作也必须走此入口。
- `closePiRequestProxyDispatcher`（`:126-132`）：无 close 方法则跳过；失败 `console.warn('[Pi SDK] 关闭请求级代理 dispatcher 失败:')` 吞错。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`、`pi-codex-title-generator.ts`、`apps/electron/src/main/lib/oauth-proxy-scope.ts`、`pi-agent-proxy.test.ts`（import 检索）。出向：`node:async_hooks`、`node:events`、`undici`。

## 5. 数据 I/O 与副作用

- 网络：经 undici dispatcher 的 HTTP(S)（可选代理）；副作用=替换 `globalThis.fetch`（一次性）。

## 6. 分支、失败、取消与恢复

无 throw 路径；close 失败吞错仅 warn；取消=operation 抛错/中止仍 finally 释放。

## 7. 权限与权威状态

无权限分支；代理 URL 由调用方（oauth-proxy-scope 等）提供。

## 8. 修改影响面

改路由影响全 Pi 模型请求与 OAuth 短时操作的传输；`globalThis.fetch` 替换是进程级副作用。

## 9. 测试证据

`pi-agent-proxy.test.ts` 消费（非本批）；本文件无专属测试（glob `**/pi-request-proxy*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+ALS 路由+释放保证 | 已证实 | `:21-132` |
| 消费者 4 文件 | 已证实 | import 检索 |
| undici 行为细节 | 推断 | 库语义（未读源） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 8 导出+分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
