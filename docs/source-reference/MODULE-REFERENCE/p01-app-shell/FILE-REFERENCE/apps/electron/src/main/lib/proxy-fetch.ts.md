---
path: apps/electron/src/main/lib/proxy-fetch.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8905e35f6e612f525c2fd0195f16155e0289605a
sha256: a63d0881870781f94908d41039b4de6dd3db412b443ada6bdd72dca2a617b227
lines: 38
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/proxy-fetch.ts

## 1. 结论与边界

代理 Fetch 工具（主进程，薄包装）：基于 undici `ProxyAgent` 创建支持 HTTP 代理的 fetch 函数，供渠道配置代理地址时让 AI API 请求走代理（文件头 `apps/electron/src/main/lib/proxy-fetch.ts:1-6`）。

边界：不检测/保存代理配置（`proxy-settings-service`）；不做请求重试/超时策略（调用方）；不解析响应。

## 2. 导出与关键符号

`export` 逐条核对：2 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createProxyFetch` | 函数（导出） | 17-26 | `(proxyUrl: string) => typeof globalThis.fetch` | 建代理 fetch |
| `getFetchFn` | 函数（导出） | 33-38 | `(proxyUrl?: string) => typeof globalThis.fetch` | 有代理值走代理，否则全局 fetch |

无内部函数。

## 3. 内部逻辑与关键流程

1. `createProxyFetch`（`:17-26`）：`new ProxyAgent(proxyUrl)`（`:18`）；返回包装函数，`undiciFetch(input, {...init, dispatcher})`（`:20-24`），类型 cast 成全局 fetch 签名（`:25`）。
2. `getFetchFn`（`:33-38`）：`proxyUrl?.trim()` 非空 → `createProxyFetch(proxyUrl.trim())`（`:34-35`）；否则返回全局 `fetch`（`:37`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`getFetchFn` 被 `conversation-title-service.ts:15,103`、`lightweight-completion.ts:17,98`、`agent-orchestrator.ts:95,486`、`retrospective-service.ts:294`（`getFetchFn(await getEffectiveProxyUrl())`）调用。`createProxyFetch` **无模块外调用点**（仅 `getFetchFn` 内部，`:35`）。

出向：`undici`（`ProxyAgent`/`fetch`，`:8`）；`undici` 类型（`:9`）。

## 5. 数据 I/O、读写与副作用

- 副作用：`createProxyFetch` 每次调用创建一个 `ProxyAgent` 实例（连接池生命周期由 undici 管理，推断）；实际网络请求发生在调用方使用返回的 fetch 时。
- 不写盘/不读配置（依据：全文读）。并发/幂等：纯构造函数；`getFetchFn` 空值返回共享的全局 fetch。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 代理 fetch | proxyUrl 非空（trim 后） | 34-35 |
| 全局 fetch | 空/仅空白 | 37 |

`ProxyAgent` 构造对非法 URL 的行为未在本文件处理（undici 抛错直接冒泡，推断）；无重试/取消（不适用，依据：纯构造）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；代理地址权威来自 `proxy-settings-service`/渠道配置（调用方传入）。

## 8. 修改影响面

- `getFetchFn` 4 个消费模块（§4）：所有出网 AI 请求的传输层。
- undici 升级（ProxyAgent/fetch 签名）需同步 `:8-25`。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `proxy-fetch`/`createProxyFetch`/`getFetchFn` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：代理分支、非法 URL、trim 语义。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 分支行号 | 已证实 | `:17-38` 逐行读 |
| getFetchFn 4 消费点 | 已证实 | §4 行号 |
| createProxyFetch 仅内部使用 | 已证实 | 全树检索 |
| 非法 URL 抛错冒泡 | 推断 | 无 try/catch |
| undici 连接池行为 | 未知 | 第三方包不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createProxyFetch` | §2-3 | 17-26 | covered |
| `getFetchFn` 两分支 | §2-3, §6 | 33-38 | covered |
| 调用链 | §4 | - | covered |
| undici 内部 | §10 | - | unknown（第三方） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
