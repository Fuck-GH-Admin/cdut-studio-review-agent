---
path: apps/electron/src/main/lib/codex-oauth-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 114520ce79648db70f6b8c1cb9774b169c9ef04d
sha256: 469236bee5627d1f703555134171c51052510d77917a4408ae8d2619877e1b06
lines: 156
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/codex-oauth-service.ts

## 1. 结论与边界

**ChatGPT (OpenAI Codex) OAuth 登录服务**（`codex-oauth-service.ts:1-7` 注释）：经 Pi 的公开 ModelRuntime API 完成 OAuth（避免依赖已删除的 `@earendil-works/pi-ai/oauth`）；**凭据仅存内存 store，持久化由 Profer channel-manager 负责**（`:5-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CodexLoginCallbacks` | interface（export） | `:82-87` | onAuthUrl/onProgress |
| `loginCodexOAuth` | function（export） | `:94-134` | 浏览器 OAuth 登录（§3） |
| `cancelCodexOAuthLogin` | function（export） | `:137-140` | 取消进行中登录 |
| `refreshCodexOAuth` | function（export） | `:143-156` | refresh token 刷新（getAuth 标准流程，`:153`） |

内部：`OAuthCredential`（`:14-20`）、`loadPiSdk`（单例动态 import `:24-27`）、`createEphemeralCredentialStore`（内存实现防 Pi 写自己的配置目录 `:29-53`）、`normalizeCredentials`（缺 access/refresh/expires 即抛 `:55-77`）、`activeLoginAbort`（**同一时刻只允许一个登录流程** `:79`）。

## 3. 内部逻辑与关键流程

`loginCodexOAuth`（`:94-134`）：**新登录先 abort 旧的**（`:97`）→ `ModelRuntime.create`（隔离 options+内存 store `:102-104`）→ `runtime.login('openai-codex','oauth')`：`prompt` 回调 select 一律 'browser'（**:108 注释：Codex 固定入口浏览器授权；其余输入在 callback 成功时被取消**——挂 abort 监听 reject '登录已取消' `:110-114`）；`notify` auth_url→回调+`shell.openExternal`（失败仅日志 `:117-121`）、progress/info→回调。`finally` 清 activeLoginAbort（幂等 `:130-132`）。

## 4. 调用者与调用链

入向：设置/登录 UI（跨文件）。出向：electron（shell）、`@profer/shared`（CodexOAuthCredentials）、`./pi-model-runtime-options`（createIsolatedModelRuntimeOptions `:11`）、Pi SDK（动态）。

## 5. 数据 I/O、读写与副作用

副作用：浏览器打开（auth_url）、内存凭据 store、console、AbortController 管理。无持久化（`:5-6` 红线）。

## 6. 分支、失败、取消与恢复

取消=`cancelCodexOAuthLogin`/新登录挤掉旧登录（`:97`）；凭据校验失败抛 Error（`:57/:66`）；浏览器打开失败仅日志。恢复=refresh 流程（`:143-156`）。

## 7. 权限与权威状态

红线：凭据不落 Pi 目录（`:30-31`）、持久化归 channel-manager（`:5-6`）、单登录互斥（`:79`）。

## 8. 修改影响面

改登录/刷新 → ChatGPT 订阅接入与渠道凭据链；`normalizeCredentials` 形状 → channel-manager 持久化。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `loginCodexOAuth|refreshCodexOAuth|cancelCodexOAuthLogin` → 0 命中）。**NOT_RUN**（网络/浏览器流程）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+4 内部+登录/刷新链 | 已证实 | 逐行读 `:1-156` |
| Pi ModelRuntime OAuth 行为 | 未知 | 外部 SDK |
| 真实登录流程 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | `:82-156` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
