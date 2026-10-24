---
path: apps/electron/src/main/lib/lightweight-completion.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 657fa0688e23e26ef2ff24e73e260227f8b58f9f
sha256: 8ce8155985953f7b36487c54ac2eace14d2daea18a3cb4625383f9baaac6b2f7
lines: 117
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/lightweight-completion.ts

## 1. 结论与边界

**轻量非流式补全服务**：面向"极简一次性判定"（长期记忆写入前审核等），只发一条隔离的 system+user 提示词取回纯文本。复用 `buildTitleRequest` + `fetchTitle` 的标题/轻量通道，不启动 Pi Harness、不装配工具与工作区上下文。红线（`:7-10` 文件头注释）：**任何失败返回 null、绝不抛异常**；默认 10s 超时经 `AbortController` 真正中断底层请求。

不做的事：不流式、不发工具、不解析协议（走适配器的标题通道）；不管理渠道/凭据（`channel-manager`/`auth-service` 提供）；不缓存结果；唯一函数入口，无类。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LightweightCompletionInput` | interface（export） | `:27-36` | `{channelId, modelId, systemPrompt?, userPrompt, maxTokens?, timeoutMs?}` | `maxTokens` 缺省沿用适配器默认；`timeoutMs` 缺省 10s |
| `runLightweightCompletion` | async function（export） | `:42-117` | `(input) => Promise<string \| null>` | 唯一执行入口；成功返回 trim 后文本，否则 null |
| `DEFAULT_TIMEOUT_MS`（内部） | const | `:23` | `10_000` | — |
| `ANTHROPIC_PROXY_PROVIDERS`（内部） | const Set | `:25` | `new Set(['anthropic'])` | 商业代理时 Anthropic 走 `/v1/proxy/messages` |

## 3. 内部逻辑与关键流程（`:42-117`）

1. **入参短路**（`:43-45`）：`channelId` trim、`modelId` 经 `strip1MContextSuffix`（`packages/shared/src/utils/context-window.ts:262-264`，剥 `[1m]` 后缀）；`!channelId || !modelId || !userPrompt.trim()` → `null`（注意 `userPrompt.trim()` 只校验非空，仍传原文 `:91`）。
2. **渠道查找**（`:48-52`）：`listChannels().find(id)`，不存在 warn + null。
3. **OAuth 渠道排除**（`:55`）：`channel.provider === 'openai-codex'` 直接 null（注释：ChatGPT OAuth 走 Pi 专属传输，不适配通用 API Key 通道）。
4. **解密 key**（`:57-63`）：`decryptApiKey(channelId)` try-catch，失败 warn + null。
5. **xAI OAuth 排除**（`:65-67`）：`resolveXaiCredentialMode(channel.credentialMode, storedSecret) === 'oauth'` → null。
6. **商业代理决策**（`:69-84`）：`shouldUseCommercialProxy = (isCommercialBuild() || isCommercialMode()) && isOfficialManagedChannel(channel) && channel.directDataPlane !== true`（`:71-73`）。命中则 `getTeamAuthWithRefresh()`（无 auth warn + null `:77-80`），`proxyPath` 按 `ANTHROPIC_PROXY_PROVIDERS` 选 `/v1/proxy/messages` 或 `/v1/proxy/chat`（`:81`），`proxyBaseUrl = auth.baseUrl + proxyPath`，key 换 `auth.proxyToken || auth.token`（`:83`）。
7. **构建请求**（`:86-95`）：`getAdapter(channel.provider)` → `adapter.buildTitleRequest({baseUrl: proxyBaseUrl || channel.baseUrl, apiKey, modelId, prompt: input.userPrompt, systemPrompt, maxTokens})`；**若走代理则 `request.url = proxyBaseUrl` 整体覆盖**（`:95`，与 conversation-title-service.ts:100 同模式）。
8. **超时与执行**（`:97-112`）：`getEffectiveProxyUrl()` → `getFetchFn(proxyUrl)`；`timeoutMs = input.timeoutMs ?? 10000`；`setTimeout(() => controller.abort(), Math.max(1_000, timeoutMs))`（**下限 1s**，`:101`）并 `timer.unref?.()`（`:102`）；包一层 `timedFetch` 注入 `signal`（`:104-105`）；`fetchTitle(request, adapter, timedFetch)`，返回 `text?.trim() || null`；`finally` 清定时器（`:110-112`）。
9. **总兜底**（`:113-116`）：外层 catch 所有异常 → warn + null（"已隔离"）。

## 4. 调用者与调用链

入向（全冻结树检索 `runLightweightCompletion`）：

| 调用者 | 位置 | 用法 |
| --- | --- | --- |
| `apps/electron/src/main/lib/agent-orchestrator.ts` | `:177` import；`:823-830` 调用 | 唯一调用点：长期记忆反思链 `reflectOnTurn({..., auditCandidate})` 内 `auditLongTermMemoryCandidate({complete: (...) => runLightweightCompletion({channelId, modelId, systemPrompt, userPrompt, maxTokens, timeoutMs: 10_000})})`（`:814-832`）；`setImmediate` 后台执行，`.catch` 隔离（`:833`）；`internal || compact` 轮次跳过（`:811`） |

出向依赖：`@profer/shared`（`resolveXaiCredentialMode`、`strip1MContextSuffix`，`:13`）、`@profer/core`（`fetchTitle`、`getAdapter`，`:14`）、`./channel-manager`（`decryptApiKey`、`isCommercialMode`、`listChannels`，`:15`）、`./auth-service.getTeamAuthWithRefresh`（`:16`）、`./proxy-fetch.getFetchFn`（`:17`）、`./proxy-settings-service.getEffectiveProxyUrl`（`:18`）、`./build-target.isCommercialBuild`（`:19`）、`./official-channel.isOfficialManagedChannel`（`:20`）。

调用链全文：`agent-orchestrator` 后台反思 → `auditLongTermMemoryCandidate` 的 `complete` 回调 → `runLightweightCompletion` → `getAdapter`→`buildTitleRequest` → `fetchTitle`（`@profer/core` 的 sse-reader 标题通道，`fetchTitle` 会调 `adapter.parseTitleResponse`）。与主对话流（`yanhu-pi-runtime`）完全解耦。

## 5. 数据 I/O、读写与副作用

- **磁盘/网络**：本身不读写磁盘；网络请求经注入的 `timedFetch`（一次非流式 POST）。
- **副作用**：`console.warn` 四处（`:50`、`:61`、`:78`、`:114`）；无缓存、无全局状态、无遥测。
- **幂等/并发**：无共享可变状态；并发安全。
- **取消**：超时 `controller.abort()` 真正中断请求（`:100-105`）；无调用方主动取消接口。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 结果 |
| --- | --- | --- |
| 入参不全 | `:45` | `null` |
| 渠道不存在 | `:49-51` | warn + `null` |
| `openai-codex` | `:55` | `null`（静默） |
| 解密失败 | `:58-63` | warn + `null` |
| xAI OAuth | `:65-67` | `null`（静默） |
| 商业代理无登录 | `:77-80` | warn + `null` |
| 超时 | `:101` | abort → fetch 抛 → 外层 catch → `null` |
| fetchTitle 抛/网络错 | `:113-116` | warn + `null` |
| 返回空文本 | `:109` | `null` |
| `timeoutMs < 1000` | `:101` | 被钳到 1s（`Math.max(1_000, ...)`） |

恢复策略：无重试；调用方（agent-orchestrator）把 null 当"审核不可用"降级处理。

## 7. 权限与权威状态

- 无权限分支（无 sender/角色检查）；渠道与凭据权威在 `channel-manager`/`auth-service`。
- 安全点：API Key 不落盘不打印（`decryptApiKey` 解密结果只进请求头/URL，经适配器）；商业代理模式下用团队 token 而非本地明文 key（`:83`）。
- 本文件不判断模型可用性；`channelId`/`modelId` 由调用方（agent-orchestrator 当前轮的渠道）给定。

## 8. 修改影响面

- 唯一调用点 `agent-orchestrator.ts:823`：改签名/返回语义直接影响长期记忆审核链（null 会被当审核失败）。
- 与 `conversation-title-service.ts:80-100` 的代理覆盖模式（`request.url = proxyBaseUrl`）保持同构；任一处改动应同步另一处。
- 依赖 `@profer/core` 的 `fetchTitle`/`buildTitleRequest` 契约（本批 core 手册已述：标题默认 max_tokens 因适配器而异）。
- 测试：**无**（见 §9）。

## 9. 测试证据

- **无直接测试**：全冻结树检索 `lightweight-completion`/`runLightweightCompletion` 仅命中 `agent-orchestrator.ts:177/:823` 与本文件；无 `.test.ts` 引用。
- 未覆盖：全部分支（OAuth 排除、代理决策、超时钳制、abort 行为、`strip1MContextSuffix` 行为）。
- `NOT_RUN`：本轮未执行测试/typecheck/build/GUI/网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条（interface + 函数）；失败一律返回 null 不抛 | 已证实 | `:27-36`、`:42-117`；`grep -cE '^export '` = 2 |
| 默认超时 10s、下限钳 1s、`unref` 不阻止退出 | 已证实 | `:23`、`:99-102` |
| `openai-codex` 与 xAI OAuth 显式排除 | 已证实 | `:55`、`:65-67` |
| 商业代理三条件 + `request.url` 整体覆盖 | 已证实 | `:71-73`、`:81-83`、`:95` |
| 唯一调用点是长期记忆审核链 | 已证实（全冻结树检索） | `agent-orchestrator.ts:177`、`:823` |
| `strip1MContextSuffix` 只剥 `[1m]` 后缀 | 已证实 | `context-window.ts:262-264` |
| abort 后 `fetchTitle` 内部的行为（是否部分消费） | 未知 | 未读 sse-reader fetchTitle 全部实现 |
| 真实超时在各网络栈的表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 条导出 + 2 常量 | §2 | `:23-36`、`:42` | covered |
| 9 步主流程 | §3 | `:42-112` | covered |
| 调用者/出向依赖/调用链 | §4 | 跨文件 | covered |
| 副作用/取消 | §5 | `:100-105` | covered |
| 失败分支表 | §6 | `:45-116` | covered |
| 权限/凭据安全 | §7 | `:57-83` | covered |
| 影响面 | §8 | 跨文件 | covered |
| 测试缺口 | §9 | 0 测试 | covered |
| fetchTitle 内部/真实超时 | §10 | — | unknown |
