---
path: apps/electron/src/main/lib/xai-oauth-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86594234a319e160692db5b33101b0acf89892c8
sha256: daa8f8e3cd85e888c894a92545438eb7cb148998895ae4e37c667faccf49eb5a
lines: 127
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/xai-oauth-service.ts

## 1. 结论与边界

xAI（Grok/X 订阅）OAuth 登录/刷新服务（127 行，头注释 `:1-7`）：复用 Pi SDK 内置 xAI device-code OAuth——浏览器打开预填授权码链接，用户确认后 SDK 轮询换 token。**凭据由调用方用 Channel.apiKey+safeStorage 持久化，本服务绝不写 `~/.pi`**（头注释 `:5-6`）。

**边界**：Pi SDK 动态 import（`@earendil-works/pi-coding-agent`）；代理 scope `oauth-proxy-scope`（本组 nb-131 已深读）；`pi-model-runtime-options`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `XaiLoginCallbacks` | 接口（导出） | 58-61 | `{onDeviceCode?: (deviceCode) => void}` | device code 回传 UI |
| `loginXaiOAuth` | 异步函数（导出） | 69-106 | `(callbacks?) => Promise<XaiOAuthCredentials>` | device-code 登录 |
| `cancelXaiOAuthLogin` | 函数（导出） | 108-111 | `() => void` | 中止登录 |
| `refreshXaiOAuth` | 异步函数（导出） | 114-127 | `(refreshToken: string) => Promise<XaiOAuthCredentials>` | 刷新 token |

内部：`loadPiSdk`（`:20-23`，Promise 缓存）、`activeLoginAbort`（`:18`）、`createEphemeralCredentialStore`（`:26-47`，内存 CredentialStore 只认 `providerId==='xai'`）、`normalizeCredentials`（`:49-56`，校验 access/refresh/expires 缺一 throw）。导出合计 4。

## 3. 内部逻辑与关键流程

1. **loginXaiOAuth**（`:69-106`）：`activeLoginAbort?.abort()` 中止上一个（`:71`）；`runWithOAuthProxyScope` 内 `ModelRuntime.create(createIsolatedModelRuntimeOptions(ephemeralStore))` → `runtime.login('xai','oauth', {signal, prompt, notify})`（`:80-100`）。
   - `prompt`：挂 promise 永不 resolve，但 `prompt.signal`/外层 `abort.signal` 任一 abort 即 reject `'登录已取消'`（`:84-88`，防上游未来增加交互时无限挂起，`:82-83` 注释）。
   - `notify`：`device_code` → log+`onDeviceCode` 回传 UI+`shell.openExternal(verificationUri)`（catch log，`:90-95`）；`progress`/`info` → log。
   - `finally` 仅当仍是本次的 abort 才清 `activeLoginAbort`（`:103-105`）。
2. **cancelXaiOAuthLogin**（`:108-111`）：abort+置空。
3. **refreshXaiOAuth**（`:114-127`）：同 proxy scope，临时 store 装 `{type:'oauth', access:'', refresh: refreshToken, expires:0}`（`:117-122`）→ `runtime.getAuth('xai')` → `normalizeCredentials(await store.read('xai'))`（新凭据从 store 取出）。

## 4. 调用者与调用链

入向（全冻结树检索 `xai-oauth-service`，2 文件）：`main/ipc.ts:219`（`loginXaiOAuth`）、`lib/channel-manager.ts:33`（`refreshXaiOAuth`）。出向：`electron.shell`、`@profer/shared` 类型、`./oauth-proxy-scope`、`./pi-model-runtime-options`、动态 `@earendil-works/pi-coding-agent`。

## 5. 数据 I/O、读写与副作用

- 网络：OAuth 流程（经 proxy scope）；`shell.openExternal` 打开授权页。
- 无盘写（`~/.pi` 不写，头注释 `:6`）；凭据只经内存 store 过手。
- 副作用：console.log/error。

## 6. 分支、失败、取消与恢复

- 取消：新登录 abort 旧登录（`:71`）；`cancelXaiOAuthLogin` 中止在途；prompt 挂 abort 拒绝防无限挂起。
- 失败：`normalizeCredentials` 两处 throw（`:50`/`:53`）；`shell.openExternal` 失败仅 log（`:93-95`）；SDK 异常传播调用方。
- 无自动重试。

## 7. 权限与权威状态

OAuth 流程门控（用户在浏览器授权）；`createEphemeralCredentialStore` 只认 xai provider（`:30`/`:39`/`:43-44`）。凭据权威=xAI token 端点（经 Pi SDK）。

## 8. 修改影响面

2 个消费方（ipc 登录入口/channel-manager 刷新）；`XaiOAuthCredentials` 形状是契约（`normalizeCredentials` 校验）；SDK 动态 import 的接口面（`ModelRuntime.create/login/getAuth`）是外部依赖契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `xai-oauth-service` 无测试命中；检索范围=baseline/source 全树）。批外线索：`docs/plans/2026-09-07-xai-grok-adaptation-design.md` 提及本文件（文档非测试）。

`NOT_RUN`：本轮未运行任何测试/真实 OAuth。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/abort 链/prompt 拒绝路径/临时 store/不写 ~/.pi | 已证实 | `:1-127` 全文逐行 |
| 2 个消费方 | 已证实 | 全树检索（§4） |
| Pi SDK 内置 xAI OAuth 行为 | 边界（跨库） | `:76-100` 调用面 |
| `createIsolatedModelRuntimeOptions` 细节 | 未知 | 跨批模块未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `loadPiSdk`/临时 store/`normalizeCredentials` | §2/§3 | 20-56 | covered |
| `loginXaiOAuth` 全流程 | §3.1 | 69-106 | covered |
| `cancelXaiOAuthLogin` | §3.2 | 108-111 | covered |
| `refreshXaiOAuth` | §3.3 | 114-127 | covered |
