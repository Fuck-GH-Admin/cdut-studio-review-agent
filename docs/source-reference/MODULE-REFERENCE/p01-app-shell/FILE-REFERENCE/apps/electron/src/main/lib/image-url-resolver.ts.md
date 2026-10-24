---
path: apps/electron/src/main/lib/image-url-resolver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6030f7623f00fa3c00170ff12f8f9074cc99316
sha256: a9ed7d7943218dff35ff2fc59c4b294363ba4d31570a4071a1b437a7e3d65e7c
lines: 153
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/image-url-resolver.ts

## 1. 结论与边界

**远程图片 URL 解析与确认**（153 行）：给定任意 http(s) URL，经 SSRF 防护、超时/体积限制、文件魔数校验后确认为受支持位图（PNG/JPEG/GIF/WebP），返回可直接渲染的 data URL——渲染层因此无需直连外网。

边界：只确认并内联返回，不落盘、不缓存到磁盘；不做本地文件读取（`agent-image-output-service` 负责本地授权图片）；不改写 URL、不跟随外的重定向策略（`fetch redirect:'follow'`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MAX_REMOTE_IMAGE_SIZE` | 导出常量 | 20 | `= 10 * 1024 * 1024`（10 MiB） | 单图上限 |
| `resolveRemoteImageUrl` | 导出函数 | 130-153 | `(rawUrl: string): Promise<ResolveImageUrlResult>` | 唯一入口 |
| `isPrivateHostname` | 内部函数 | 41-56 | `(hostname): boolean` | 本地/私有/链路本地/元数据拦截 |
| `pathLooksLikeImage` | 内部函数 | 59-61 | `(url: URL): boolean` | pathname 图片扩展名 |
| `readCache`/`writeCache` | 内部函数 | 63-82 | Map 缓存读写（TTL+容量） | 见 §5 |
| `downloadAndConfirm` | 内部函数 | 85-123 | `(parsed, original): Promise<ResolveImageUrlResult>` | 探测+魔数校验 |
| 常量 | 内部 | 23-31 | `REQUEST_TIMEOUT_MS=8000`、`CACHE_TTL_MS=10min`、`CACHE_MAX_ENTRIES=24`、`CACHE_DATAURL_MAX=4MiB`、`IMAGE_EXTENSION_RE=/\.(png\|jpe?g\|gif\|webp)$/i` | |
| `cache` | 内部常量 | 38 | `Map<string, CacheEntry>` | 结果缓存 |

导出计数：`export` 2 条（`:20` 常量、`:130` 函数），与源码一致。

## 3. 内部逻辑与关键流程

- **resolveRemoteImageUrl**（`:130-153`）：非字符串/空白 → `{ok:false, reason:'empty-url'}`（`:131`）；`trim` 后查缓存命中直接返回（`:134-135`）；`new URL` 失败 → `'invalid-url'`（`:137-142`）；协议非 `http:/https:` → `'unsupported-protocol'`（`:143-145`）；`isPrivateHostname` → `'private-host-blocked'`（`:146-148`）；`downloadAndConfirm` 结果写缓存后返回（`:150-152`）。
- **isPrivateHostname**（`:41-56`）：小写并剥 `[]`；`localhost`/`0.0.0.0`/`*.local`/`::1` → true（`:42-44`）；IPv4 点分：`a∈{0,10,127}`、`169.254.*`、`172.16-31.*`、`192.168.*` → true（`:46-54`）。**未覆盖**：IPv6 唯一本地地址（除 `::1`）、十进制/八进制 IP 变体、DNS 重绑定（域名解析后跳私有 IP）——照实记录见 §10。
- **downloadAndConfirm**（`:85-123`）：
  1. `fetch(original, {redirect:'follow', signal: AbortSignal.timeout(8000), headers:{Accept:'image/*'}})`（`:87-91`）。
  2. `!res.ok` → `{ok:false, reason:'http-<status>'}`（`:92`）。
  3. `content-type` 去参数小写；非 `image/` 且 pathname 无图片扩展名 → cancel body、`'not-image'`（`:94-99`）。
  4. `content-length` 有限且 >10MiB → cancel、`'too-large'`（`:101-105`）。
  5. `arrayBuffer` 后 0 字节 → `'empty-body'`；实长 >10MiB → `'too-large'`（`:107-109`）。
  6. `detectAgentImage(buffer)`（魔数，`agent-image-output-service.ts:55-63`：PNG 8 字节头/`FFD8FF`/`GIF87a|GIF89a`/`RIFF....WEBP`）不识别 → `'unsupported-format'`（`:111-112`）。
  7. 成功 → `{ok:true, mediaType: detected.mediaType, dataUrl: 'data:<mime>;base64,<buffer>'}`（`:114-118`）。
  8. catch → `err.name === 'TimeoutError'` → `'timeout'`，否则 `'fetch-failed'`（`:119-122`）。
- **缓存**（`:63-82`）：`readCache` 过期即删（`:66-68`）；`writeCache` 只缓存失败结果或 dataUrl ≤4MiB 的成功结果（`:74-75`）；容量>24 逐出**最旧插入**项（`Map` 插入序，`:77-81`）。TTL 10 分钟（`:25`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep image-url-resolver|resolveRemoteImageUrl|MAX_REMOTE_IMAGE_SIZE`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:2020`，位于 `CHAT_IPC_CHANNELS.RESOLVE_IMAGE_URL`（`chat:resolve-image-url`，`packages/shared/src/types/chat.ts:577`）handler（`ipc.ts:2017-2022`），**无 sender 校验、无入参限制**（URL 安全由本文件 SSRF 防护承担）。
  - `apps/electron/src/main/lib/image-url-resolver.test.ts:6` import（专属测试，7 用例）。
- 出向：`./agent-image-output-service.detectAgentImage`（`:17`）、`@profer/shared` 类型 `ChatImageMediaType`/`ResolveImageUrlResult`（`:16`）、全局 `fetch`（`:87`）。

## 5. 数据 I/O、读写与副作用

- 输入：URL 字符串；输出 `ResolveImageUrlResult`（`{ok:true, mediaType, dataUrl}` 或 `{ok:false, reason}`）。
- 磁盘：无。网络：出站 HTTP(S) GET（**会向任意外部主机发请求**，仅拦私有/本地主机，见 §7）。
- 缓存：模块级 `Map`（24 条、10 分钟 TTL、dataUrl ≤4MiB 才缓存成功结果）；进程内存，重启即清。
- 副作用：网络请求、内存缓存；无日志（本文件无 console）。

## 6. 分支、失败、取消与恢复

- 失败矩阵（reason 字面量）：`empty-url`/`invalid-url`/`unsupported-protocol`/`private-host-blocked`（请求前）；`http-<status>`/`not-image`/`too-large`/`empty-body`/`unsupported-format`/`timeout`/`fetch-failed`（请求后）。**失败结果也会被缓存**（`!result.ok` 恒 cacheable，`:74`），10 分钟内同 URL 不重试。
- 取消：`AbortSignal.timeout(8000)` 自动取消；`res.body?.cancel()` 释放未读流（`:97`、`:103`，mock 环境下 body 为 null 时安全跳过）。
- 恢复：TTL 过期后自动重试；无持久化。
- 边界：`redirect:'follow'` 时重定向目标**不再做私有主机校验**（只检查初始 URL，`:146` vs `:88`）——潜在 SSRF 绕过面，照实记录（§10）。

## 7. 权限与权威状态

- 无 sender/role 权限分支，依据：IPC handler（`ipc.ts:2017-2022`）无 `assertSensitiveAgentIpcSender`；安全边界=本文件的协议/主机/体积/魔数校验。
- 权威状态：`ResolveImageUrlResult.mediaType` 以**文件魔数**（`detectAgentImage`）为准而非 content-type（`:111-118`），防 HTML 登录页/伪装文件冒充图片（注释 `:12`）。

## 8. 修改影响面

- IPC `chat:resolve-image-url`（`chat.ts:577`）+ 渲染层「通用图片渲染能力」；返回 reason 字面量是前端降级提示的契约。
- `detectAgentImage`（`agent-image-output-service.ts:55-63`）的魔数集合变化会影响确认结果（共享依赖）。
- `MAX_REMOTE_IMAGE_SIZE` 导出被外部引用情况：全冻结树检索仅本文件定义与使用（0 外部引用）。
- 测试：`image-url-resolver.test.ts`（7 用例）直接覆盖主流程，改动需同步。

## 9. 测试证据

- 直接测试：`apps/electron/src/main/lib/image-url-resolver.test.ts`（104 行，`bun:test`，**7 it**，NOT_RUN）。mock 边界：`beforeEach` 替换 `globalThis.fetch` 为计数包装（`:35-42`），`afterEach` 还原（`:44-46`）；`makeResponse` 构造假 Response（`arrayBuffer` 模拟、`body: null`，`:15-33`）——`res.body?.cancel()` 在测试中为 no-op。
- 断言摘要：data URL 前缀/`mediaType`（`:52-54`）；仅 content-type 确认（`:60-61`）；`text/html`+非图片扩展名→`not-image`（`:67-68`）；localhost/127.0.0.1→`private-host-blocked`（`:73-78`）；`file://`→`unsupported-protocol`（`:83-84`）；content-length 20MiB→`too-large`（`:94-95`）；缓存命中 `fetchCalls === 1`（`:102`）。
- 未覆盖：`timeout`/`fetch-failed`/`empty-body`/`unsupported-format`、重定向、IPv6 私有地址、缓存逐出/TTL。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实网络；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与判定链 | 已证实 | `:130-153` |
| 私有主机拦截矩阵（IPv4 四段+localhost） | 已证实 | `:41-56` |
| 魔数校验（4 格式） | 已证实 | `agent-image-output-service.ts:55-63` |
| 失败结果也缓存（TTL 10min） | 已证实 | `:73-76` |
| 重定向目标不做私有主机复检 | 已证实 | `:88` 仅初始 `isPrivateHostname`（`:146`） |
| 7 it 断言如 §9 | 已证实 | `image-url-resolver.test.ts:48-103` |
| DNS 重绑定/IPv6 ULA/十进制 IP 绕过 | 未知 | 实现未覆盖（静态确认无该分支） |
| 真实网络确认行为 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveRemoteImageUrl` 校验链 | §3/§9 | 130-153 | covered |
| `isPrivateHostname` | §3/§7 | 41-56 | covered |
| `downloadAndConfirm` 各失败分支 | §3/§6 | 85-123 | covered |
| 缓存读写/逐出 | §3/§5 | 63-82 | covered |
| 重定向复检缺口 | §6/§10 | 88,146 | covered（已标注） |
| timeout/fetch-failed 等分支 | §9 | 119-122 | partial（无测试） |
| 真实网络行为 | §10 | — | unknown（NOT_RUN） |
