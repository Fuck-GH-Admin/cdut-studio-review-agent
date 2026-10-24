---
path: apps/electron/src/main/lib/review/review-model-gateway.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d2715a038dbcaa7f85a774fe4a62a1703eec91f
sha256: 39c55821a848c74f97fb8d5609921bd43f394db51ca8078a2de02f59b09ba8a0
lines: 481
kind: source
package: p05-review-engine
author: docs-r07-author-models-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-model-gateway.ts

## 1. 结论与边界

本文件是内容审核专区**唯一的模型网络出口**：把「审核渠道 + 模型选择」解析成一次 HTTP 聊天补全请求（两条协议线：`[OI]` 兼容线 `/chat/completions`、本地私有线 ollama `/api/chat`），并统一处理白名单、超时、外部取消、429 退避、多模态降级和错误包装。运行时模块，无纯类型文件特征。

它**不负责**：

- 不决定"审核该用什么模型"的业务语义——默认/显式选择由 `module-settings-store.ts` 的 `getEffectiveReviewModelSelection()` 提供（本文件 `review-model-gateway.ts:172`、`:194` 调用），本文件只消费结果；
- 不保存/创建渠道，不写任何磁盘文件；渠道与密钥读取委托 `channel-manager`（`review-model-gateway.ts:15`）；
- 不做流式输出（所有请求 `stream: false`，`review-model-gateway.ts:346`、`:352`）；
- 不做 run 级状态机与取消登记（那是 `run-async-service.ts` 与 `run-service-v2.ts`）；本文件只接受 `AbortSignal` 并把它转成网络中止（`review-model-gateway.ts:371-375`）。
- 白名单只约束**经过本文件**的调用。Pi 审核执行器 `createPiReviewModelClient` 直接把渠道交给 Pi SDK（`pi-review-agent-client.ts:78`、`:138`），不经过本文件；该路径的入口约束见 `review-pi-run-bridge.ts` 手册 §7。

## 2. 导出与关键符号

导出共 11 条声明：3 个 interface、1 个 const、6 个 function、1 条 re-export（`extractJson`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `REVIEW_RUN_TIMEOUT_MS` | const | `review-model-gateway.ts:39` | `150_000` | 审核运行专用超时；调用方显式传入，普通调用仍是 60s |
| `ReviewChatMessage` | interface | `:49-52` | `{ role: 'system'\|'user'\|'assistant'; content: string \| ReviewContentPart[] }` | 内容为数组即多模态 |
| `reviewPromptWithImages` | function | `:55-59` | `(prompt: string, images?: string[]) => string \| ReviewContentPart[]` | 无图返回原字符串；有图返回 `[text, ...image_url]` |
| `ReviewChatOptions` | interface | `:62-73` | `temperature?/maxTokens?/timeoutMs?/signal?/retryWithoutImages?` | `signal` 是 run 级取消入口；`retryWithoutImages:false` 禁止去图重试 |
| `ReviewChatResult` | interface | `:76-83` | `{ text; imagesDropped; usage? }` | `imagesDropped=true` 必须由调用方在结论/报告中标注 |
| `resolveReviewGatewayModelId` | function | `:198-200` | `(channel: Pick<Channel,'id'\|'models'>) => string` | 回执口径；解析不到返回 `''` |
| `getReviewModelGatewayStatus` | function | `:207-238` | `() => ReviewModelGatewayStatus` | UI/ai-service 自检；不抛错 |
| `resolveReviewGatewayChannel` | function | `:246-260` | `() => { channel; apiKey } \| undefined` | 解密密钥；失败返回 `undefined` 不抛 |
| `chatCompletion` | function | `:269-275` | `(channel, messages, options?) => Promise<string>` | 只要文本；丢弃 `imagesDropped` |
| `chatCompletionWithMeta` | function | `:283-300` | `(...) => Promise<ReviewChatResult>` | 含多模态降级与 usage |
| `extractJson`（re-export） | function | `:22` | `(text: string) => unknown \| undefined` | 实现在 `review-json.ts:2-28` |

关键内部函数（不导出）：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `hasImageParts` | `:91-95` | 判断是否存在 `image_url` 部件 |
| `stripImageParts` | `:98-107` | 去图，文本部件以 `\n` 连接 |
| `isMultimodalLikelyFailure` | `:114-119` | 4xx/5xx 或图片关键词才值得去图重试；`AbortError` 直接 false |
| `splitParts` | `:122-136` | 把内容部件拆成纯文本 + 裸 base64（ollama `images` 字段） |
| `toProviderMessages` | `:144-153` | 两条协议的消息形状转换 |
| `isAllowedProvider` | `:156-158` | 白名单成员判断 |
| `trimTrailingSlash` | `:161-163` | 去尾部 `/` |
| `findFirstAllowedChannel` | `:170-182` | **选择解析核心**：显式选择优先，失效即返回 `undefined` |
| `isUsableReviewChannel` | `:184-190` | 白名单 + `enabled===true` + 模型清单（ollama 豁免） |
| `firstModelId` | `:193-195` | 委托 `pickChannelModelId` |
| `performChatCompletion` | `:303-426` | 真正发请求（白名单/URL/鉴权/超时/重试/解析） |
| `usageFromResponse` | `:428-447` | 兼容 `prompt_tokens`/`input_tokens` 等命名 |
| `extractChatContent` | `:450-474` | 按协议取文本，形状不符抛中文错误 |

## 3. 内部逻辑与关键流程

### 3.1 渠道与模型解析（本轮重点：显式优先、失效不静默回退）

`findFirstAllowedChannel()`（`review-model-gateway.ts:170-182`）：

1. 读全部渠道 `listChannels()`（`:171`）；
2. 取 `getEffectiveReviewModelSelection().selection`（`:172`）。该函数在 `module-settings-store.ts:41-50`：审核模块显式选择存在 → `{selection, explicit:true}`；否则回退应用全局 `settings.agentChannelId/agentModelId` → `explicit:false`；全局也没配 → `{selection:null}`；
3. 有选择时，必须同时满足：渠道存在（`:174`）、`isUsableReviewChannel`（`:175`）、该渠道 `models` 里有同 ID 且 `enabled !== false` 的模型（`:176`），否则返回 `undefined`（`:177`）。**这里不会换到别的渠道**——显式配置失效即失败关闭；
4. 无选择时，返回 `channels.find(isUsableReviewChannel)`（`:181`），即配置顺序中的第一个可用渠道。

`isUsableReviewChannel`（`:184-190`）：provider 必须在 `REVIEW_MODEL_PROVIDERS`（`packages/shared/src/types/review.ts:478`，`openai/deepseek/custom/ollama`）；`channel.enabled === true`（`:187`，注释明确"用户停用的渠道对审核专区同样停用，不外发任何案卷数据"）；ollama 允许空模型清单（`:188`），其他 provider 要求 `models` 非空（`:189`）。

`firstModelId` → `pickChannelModelId`（`review-model-identity.ts:9-19`）：显式选择命中且模型启用则用它；否则取第一个 `enabled !== false` 的模型；**再否则取 `models[0]`（即使它被标记停用）**。因此"渠道里唯一模型被停用"且没有显式选择时，仍会以该停用模型发起请求——这是 `pickChannelModelId` 的兜底语义，不是本文件的分支；显式选择路径在 `:176` 已提前拒绝。

### 3.2 网关自检 `getReviewModelGatewayStatus`（`:207-238`）

- 无渠道：`available:false, protocol:'none'`；reason 按 `explicit` 区分（`:210-217`）：显式配置失效提示"审核专属渠道或模型已不可用，请打开审核设置重新选择"；未配置提示仅支持 `[OI]` 兼容/本地模型出口。
- 非 ollama 且 `modelId` 为空：不可用，reason 指向渠道无可用模型（`:224-230`）。
- ollama 空模型清单：可用，`protocol:'local-private'`，`modelId` 字段省略（`:223`、`:232-237`）。
- 可用时返回 `channelName`，有 modelId 才带该字段（`:236`）。
- **自检可用 ≠ 实际可调用（ollama 空模型清单）**：`:223` 的注释说"把 modelId 留空由调用方兜底"，但本文件内**没有任何兜底**——`performChatCompletion` 仍调 `firstModelId`，拿不到 modelId 就在 `:314-317` 抛"渠道「x」没有可用模型，无法发起审核调用"；`run-async-service.ts:40-42` 也会抛"审核渠道「x」没有已配置模型"。因此 ollama 渠道在模型清单为空时，`getReviewModelGatewayStatus()` 报 `available:true`，真实请求却必然失败。这是**自检与调用口径的已知不一致**，不是"动态发现模型"的能力：`/api/tags` 发现逻辑不在本文件，`modelId` 也不会被回填。
- **无显式选择时的盲点**：`isUsableReviewChannel` 只要求 `models` 非空（`:189`），而 `pickChannelModelId` 在无匹配时会回退 `models[0]`（`review-model-identity.ts:17-18`）。因此"渠道只有一个被停用的模型"时，自检仍可能显示 `available:true` 并返回该停用 modelId；显式选择路径则会在 `:176` 提前拒绝。这一差异是当前实现的真实语义，不是本文件新增的分支。
- **严格匹配同样作用于 `explicit:false` 的全局回退**：`findFirstAllowedChannel`（`:170-182`）对 `getEffectiveReviewModelSelection()` 返回的任何 `selection` 都做渠道存在 + 可用 + 模型启用的三重匹配；全局回退（`module-settings-store.ts:44-49`）的 `selection` 若失效，同样返回 `undefined`。只是此时 reason 走"未配置 `[OI]` 兼容渠道…"分支（`:216`），不会提示"全局渠道失效"，读者不要误以为只有显式选择才失败关闭。

### 3.3 解析渠道 + 明文密钥 `resolveReviewGatewayChannel`（`:246-260`）

先过 `getReviewModelGatewayStatus()` 的 available 闸（`:247-248`），再取一次渠道（`:250-251`），然后 `decryptApiKey`（`:254`）：ollama 把空串规范为 `''`，其他 provider 直接用解密结果；任何解密异常被 catch，`console.warn` 后返回 `undefined`（`:256-259`）——**调用方据此降级，不抛错**。注意 `getReviewModelGatewayStatus` 与 `findFirstAllowedChannel` 各读一次渠道配置，两次之间若配置变化，可能选到与 status 不一致的渠道（无锁，见 §5）。

### 3.4 一次请求 `performChatCompletion`（`:303-426`）

1. **白名单闸最先**（`:309-312`）：非白名单 provider 直接 `throw new Error(REVIEW_MODEL_PROVIDER_REJECTED_NOTICE)`，发生在解密与任何网络请求之前。
2. 解析 modelId，缺失抛"渠道「x」没有可用模型，无法发起审核调用"（`:314-317`）。这是 ollama 空模型清单"自检 true、调用必失败"的落点（见 §3.2）：本文件不做任何兜底或动态发现。
3. URL：ollama 先 `trimTrailingSlash` 再去尾部 `/v1`，拼 `/api/chat`（`:322`）；`[OI]` 线用 `resolve[OI]ChatCompletionsUrl(baseUrl, provider)`（`packages/core/src/providers/url-utils.ts:194`），若结果不以 `/chat/completions` 结尾则补 `/chat/completions`（`:324-327`）。
4. 鉴权：非 ollama 必须 `decryptApiKey`（抛错向上）；ollama 解密异常吞掉并置 `''`（`:329-339`）。这与 `resolveReviewGatewayChannel` 的"解密异常返回 undefined"不同口径。
5. 消息转换 `toProviderMessages`（`:342`）：ollama 把图片拆到 `message.images`（裸 base64，`:130-134`），`[OI]` 线内容部件原样透传（`:145`）。
6. 请求体（`:345-353`）：两条线都带 `model/messages/stream:false`；`[OI]` 线加 `temperature`（缺省 0.2）与可选 `max_tokens`。ollama 线**不发送** temperature/max_tokens。
7. 头（`:355-361`）：`content-type: application/json`；ollama 仅在 apiKey 非空时带 `Authorization`；`[OI]` 线总是 `Bearer ${apiKey}`（空 key 会发出 `Bearer `）。
8. 代理（`:364-365`）：`getEffectiveProxyUrl()` + `getFetchFn(proxyUrl)`，与 Chat/Agent 共用用户代理设置。
9. 超时与取消（`:367-375`）：`timeoutMs = options.timeoutMs ?? 60_000`；内部 `AbortController` + `setTimeout`；外部 signal 已中止则立即 abort，否则 `addEventListener('abort', ..., {once:true})`。
10. 请求循环（`:378-411`）：最多 4 次 HTTP（`MAX_RETRIES=3`）。每次先检查外部取消（`:381`）；429 且 `attempt < 3` 时按 `8000*(attempt+1)` 退避（8s/16s/24s），退避等待 `waitForRetry(backoffMs, controller.signal)`（`review-model-identity.ts:22-38`）同时响应取消与总超时；退避被中断时按 `externalSignal.aborted` 区分"已取消"/"超时"（`:392-399`）。非 2xx 读取 body 截断 500 字后抛 `模型请求失败: HTTP {status} {body}`（`:402-406`）。
11. 成功：`response.json()` → `usageFromResponse` → `extractChatContent`（`:408-410`）。
12. 错误归一（`:412-425`）：已取消文案原样上抛；`AbortError` 按外部信号区分取消/超时；`模型请求失败*` 原样；其余（DNS/连接/证书）`console.error` 后包装为"模型请求失败（网络错误）: ..."。`finally` 清 timer（`:423-425`）。

### 3.5 多模态降级 `chatCompletionWithMeta`（`:283-300`）

有图片部件时先按多模态请求；失败且 `retryWithoutImages !== false` 且 `isMultimodalLikelyFailure(error)` 为真时，`console.warn` 后用 `stripImageParts` 再请求一次，成功返回 `imagesDropped:true`（`:297-298`）。判定条件（`:114-119`）：`AbortError` 不重试；`HTTP 400|413|415|422|500` 或错误文案含 `image|vision|multimodal|图片|多模态` 才重试。注意：**超时/取消不会触发去图重试**，但网络错误文案不含关键词时也不会重试。

### 3.6 响应解析

- `extractChatContent`（`:450-474`）：非对象抛"返回内容不是 JSON 对象"；ollama 取 `message.content`（`:459-464`），`[OI]` 取 `choices[0].message.content`（`:468-473`），类型不符抛对应协议的中文错误。
- `usageFromResponse`（`:428-447`）：兼容 `prompt_tokens/input_tokens`、`completion_tokens/output_tokens`、`prompt_cache_hit_tokens` 或 `prompt_tokens_details.cached_tokens`/`input_tokens_details.cached_tokens`；只保留 `Number.isFinite` 的字段，全空返回 `undefined`。

## 4. 调用者与调用链

入向（grep `review-model-gateway`）：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `ai-review-service.ts` | `:48-54` import；`:368`、`:504`、`:808`、`:1039` `resolveReviewGatewayChannel`；`:410`、`:1083` `chatCompletion`；`:549`、`:896` `chatCompletionWithMeta`；`:898` `REVIEW_RUN_TIMEOUT_MS` | 旧版 AI 审核/助手/图像检查的真实模型路径；无渠道时降级 |
| `review-v3-t01-model-draft-service.ts` | `:11` import；调用 `resolveReviewGatewayChannel`/`chatCompletion`/`resolveReviewGatewayModelId` | T01 模型草案与回执共用同一 modelId 口径 |
| `run-async-service.ts` | `:34`（`chatCompletionWithMeta`、`reviewPromptWithImages`、`REVIEW_RUN_TIMEOUT_MS`）、`:148` | V2 运行图像检查端口与运行超时 |
| `review-ipc.ts` | `:57` import `getReviewModelGatewayStatus`；handler `GET_MODEL_GATEWAY_STATUS`（`:1495-1497`） | 渲染层自检 |
| `review-model-gateway.test.ts` | `:23` | 直接测试（见 §9） |
| `review-generalization.test.ts`、`single-case-workspace.e2e.test.ts` | `:54`/`:42` `mock.module('./review-model-gateway', ...)` | 用真实导出做类型与替身，不测网络 |

出向：`channel-manager`（`listChannels`/`decryptApiKey`，`review-model-gateway.ts:15`）、`proxy-settings-service.getEffectiveProxyUrl`（`:17`、`:364`）、`proxy-fetch.getFetchFn`（`:16`、`:365`）、`@profer/core` URL 解析（`:18`、`:325`）、`review-model-identity`（`:19`）、`module-settings-store`（`:20`）、`review-json.extractJson`（`:21-22`）。

无 IPC channel 由本文件直接注册；无字符串拼接式动态调用（已 `grep -rn "review-model-gateway"` 覆盖全部 import/require 点）。

## 5. 数据 I/O、读写与副作用

- **输入**：`Channel`（含 `provider/baseUrl/models/id`）、`ReviewChatMessage[]`、可选 `ReviewChatOptions`。
- **输出**：文本或 `ReviewChatResult`；**本文件自身**不落盘、不缓存、不写全局状态。
- **读的副作用（重要限定）**：`listChannels()` → `channel-manager.readConfig()`（`channel-manager.ts:131-165`）在 schema 迁移或预设模型候选更新时会 `writeFileSync` 渠道配置（`:152-158`）。因此"本文件不写盘"不等于"读本文件不会引发写盘"：首次读到旧格式配置时可能触发迁移写。
- **读**：渠道配置（`listChannels`/`decryptApiKey` 每次调用重新读配置，`channel-manager.ts:510-522`、`:688-697`）、应用设置（经 `getEffectiveReviewModelSelection` → `settings-service.getSettings()` 内存缓存，`settings-service.ts:45-47`）、审核模块设置文件（`module-settings-store.ts:20-35`）。
- **网络**：POST 到 `.../chat/completions` 或 `.../api/chat`；代理由用户设置决定。
- **原子性/幂等**：无写盘；同一请求可因 429 重试最多 4 次，**不是幂等键机制**，重复请求可能产生重复计费；多模态降级会再发一次（共 2 次）。
- **并发**：无共享可变状态；每次调用独立 `AbortController`。但 `getReviewModelGatewayStatus`/`findFirstAllowedChannel` 各自读配置，配置在两次读取间变化会导致"自检说可用、解析拿不到"的窗口。
- **副作用**：`console.warn`（非白名单 `:310`、去图重试 `:294-296`、429 `:391`、解密失败 `:257`）、`console.error`（网络错误 `:421`）；**不记录 prompt/密钥/案卷内容**。
- **定时器**：`setTimeout(timeoutMs)` 在 `finally` 清理（`:424`）；外部 signal 监听器使用 `{once:true}`，但请求正常结束后未 `removeEventListener`，长生命周期 signal 上会残留一个监听器直到 abort 或 GC（非阻断，属实现细节）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果/文案 |
| --- | --- | --- |
| 非白名单 provider | `:309-312` | `REVIEW_MODEL_PROVIDER_REJECTED_NOTICE`（`packages/shared/src/types/review.ts:481-482`），发生在解密/网络前 |
| 渠道无模型 | `:314-317` | `渠道「x」没有可用模型，无法发起审核调用` |
| 显式选择失效 | `:174-177` + `:210-217` | 自检不可用，reason 要求重新选择；**不换模型** |
| 停用渠道 | `:187` | 不算可用渠道 |
| 解密失败（解析阶段） | `:256-259` | 返回 `undefined`，调用方降级 |
| 解密失败（请求阶段，ollama） | `:334-338` | 空 key 继续 |
| 429 | `:389-399` | 8/16/24s 退避，最多 3 次重试；退避期间可取消/超时 |
| 非 2xx | `:402-405` | `模型请求失败: HTTP {status} {≤500字}` |
| 外部取消 | `:381`、`:396`、`:416` | `模型请求已取消` |
| 内部超时 | `:397`、`:417` | `模型请求超时（超过 N 秒未响应）` |
| 网络错误 | `:421-422` | `模型请求失败（网络错误）: ...` |
| 响应形状不符 | `:452`、`:462`、`:471` | 中文"模型响应格式异常：…" |
| 多模态失败 | `:293` | 满足条件才去图重试；否则原样抛 |

**取消/恢复语义**：本文件不持久化任何状态；取消只是中止当前 HTTP 请求并让调用方看到"已取消"。重试由调用方决定（run 级重启/续交在 `run-async-service.ts` 与 `review-pi-run-bridge.ts`）。超时与外部取消共用同一个 `AbortController`，通过 `externalSignal.aborted` 区分语义（`:414-418`）；一旦内部 timer 触发，后续 429 退避也会立刻失败，总耗时受 `timeoutMs` 约束。

## 7. 权限与权威状态

- 无 `sender`/`role` 检查：本文件不是 IPC 入口，自身没有权限分支。**但"权限由调用方负责"不等于每个调用方都做了校验**，逐消费者如下：
  - `GET_MODEL_GATEWAY_STATUS`（`review-ipc.ts:1495-1497`）：**没有 sender 断言**，只读返回自检；任何能发 IPC 的渲染进程都可调用。
  - `RUN_REVIEW_V2`（`review-ipc.ts:1087-1092`）：只做 `assertSafeReviewStorageId(caseId)`，**没有 sender 断言**。
  - `RUN_BATCH_V2`（`review-ipc.ts:1070-1074`）：只校验 `batchId` 是非空字符串，**没有 sender 断言**。
  - 后台 Pi 入口 `START/STOP_BACKGROUND_PI_REVIEW_V2`（`review-ipc.ts:1117-1126`）：有 `assertMainWindowSender`。
  - Agent 工具侧（`pi-review-ops-tools.ts`）：有 `requireAssignment` + 案卷绑定校验。
  - `ai-review-service`/T01：进程内调用，无额外 sender 概念。
- **权威状态**：渠道配置（`channel-manager`）是"哪些出口存在/启用/有哪些模型"的唯一权威；`module-settings-store` 是"审核模块选了哪个渠道/模型"的权威；本文件只读，不写。
- 安全边界：`REVIEW_MODEL_PROVIDERS` 白名单 + `channel.enabled === true` + 显式/全局选择失效即失败关闭，共同保证**经过本文件**的请求不会发往未授权协议/停用渠道。白名单外 provider 在解密前被拒（`:309-312`），即使渠道 ID 不存在也不会泄露"渠道不存在"。**该保证不覆盖绕过本文件的路径**：Pi 后台审核由 `runAgent` 直接按渠道 provider 发起（`review-pi-run-bridge.ts:92-94`），不经过本文件，见该篇 §7。
- 密钥：只在本进程内解密使用，不写日志、不返回给渲染层；`ReviewChatResult` 不含密钥。

## 8. 修改影响面

- `ai-review-service.ts:48-54`、`:368`、`:410`、`:504`、`:549`、`:808`、`:896-898`、`:1039`、`:1083`：改签名/返回形状会影响旧版 AI 审核、助手问答、图像检查与报告生成；`imagesDropped`/`usage` 字段被用于降级标注。
- `run-async-service.ts:34`、`:148`：V2 运行的图像检查端口依赖 `chatCompletionWithMeta` 的 `retryWithoutImages:false` 与 `REVIEW_RUN_TIMEOUT_MS`；改超时/错误文案会改变运行失败诊断。
- `review-v3-t01-model-draft-service.ts:11`：T01 回执 modelId 与真实请求必须同口径；改 `resolveReviewGatewayModelId`/`pickChannelModelId` 会造成"请求 B、回执 A"。
- `review-ipc.ts:57`、`:1495-1497`：`GET_MODEL_GATEWAY_STATUS` 的 `protocol/reason/modelId` 直接进 UI；改 reason 文案要同步 UI 文案断言（现有测试 `review-model-gateway.test.ts:119-120` 断言 reason 含 `[OI] 兼容渠道`/`本地模型渠道`）。该 handler 无 sender 断言，改动其返回内容等于扩大一个未受 sender 保护的读接口的信息面。
- `module-settings-store.ts` 的选择语义：若把"显式失效 → undefined"改成"回退第一个渠道"，会改变 `run-async-service.ts:44-46`、`review-pi-run-bridge.ts:44-46` 的失败关闭行为。
- 需同步的测试：`review-model-gateway.test.ts`（白名单/extractJson/无渠道自检）、`review-generalization.test.ts`、`single-case-workspace.e2e.test.ts`（mock 了本模块导出）、`module-settings-store.test.ts`（选择持久化）。

## 9. 测试证据

直接测试文件 `apps/electron/src/main/lib/review/review-model-gateway.test.ts`（125 行，**不在本批 6 文件内，仅作间接证据**）。7 个 `test(`，真实断言：

1. `:52-64` 白名单常量：`toContain('openai'/'deepseek'/'custom'/'ollama')`、`not.toContain('anthropic'/'google'/'openai-responses')`、`toHaveLength(4)`。
2. `:66-75` `chatCompletion(buildChannel('anthropic'), ...)` `rejects.toThrow(REVIEW_MODEL_PROVIDER_REJECTED_NOTICE)`；并断言文案含"白名单""内容审核专区"。
3. `:77-81` google 同样被拒。
4. `:85-94` `extractJson` 纯 JSON/```json 围栏/无语言围栏/数组。
5. `:96-100` 前后解说文字取最外层 `{}`。
6. `:102-107` 非 JSON、空串、花括号不配对 → `undefined`。
7. `:111-124` 空配置目录：`available:false`、`protocol:'none'`、reason 非空且含两类出口、`channelName/modelId` 为 `undefined`。

未覆盖（本文件角度）：`resolveReviewGatewayChannel` 解密成功/失败、ollama URL 归一化、429 退避、超时/取消、去图重试、`usageFromResponse` 命名兼容、`[OI]` 与 ollama 响应解析、`temperature/max_tokens` 请求体形状、代理选择。这些在本轮**均未读到运行证据**。

`NOT_RUN`：本轮未执行 `bun test`、typecheck、Electron/GUI；上述断言是静态阅读所得，不代表已运行通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 白名单外 provider 在解密/网络前抛固定文案 | 已证实 | `review-model-gateway.ts:309-312`；`packages/shared/src/types/review.ts:478-482` |
| 显式审核选择失效时不回退其他渠道，自检给出重新选择提示 | 已证实 | `:170-182`、`:210-217`；`module-settings-store.ts:41-50` |
| 未显式选择时回退应用全局 `agentChannelId/agentModelId` | 已证实 | `module-settings-store.ts:44-49` |
| `pickChannelModelId` 在无匹配时可能返回停用的 `models[0]` | 已证实 | `review-model-identity.ts:17-18` |
| ollama 允许空模型清单且空 key 不带 Authorization | 已证实 | `:188`、`:223-237`、`:356-358` |
| **ollama 空模型清单时自检 `available:true`，但 `performChatCompletion` 必抛"没有可用模型"；本文件无兜底** | 已证实 | `:223-237` vs `:314-317`；`run-async-service.ts:40-42` |
| 严格匹配同样作用于 `explicit:false` 的全局回退（失效同样返回 undefined，只是 reason 不同） | 已证实 | `:170-182`、`:210-217`；`module-settings-store.ts:44-49` |
| 本文件自身不写盘，但 `listChannels()` 在迁移/预设更新时可能写渠道配置 | 已证实 | `channel-manager.ts:131-165`（写于 `:152-158`） |
| `GET_MODEL_GATEWAY_STATUS`、`RUN_REVIEW_V2`、`RUN_BATCH_V2` 无 sender 断言；仅后台 START/STOP 有 | 已证实 | `review-ipc.ts:1495-1497`、`:1087-1092`、`:1070-1074`、`:1117-1126` |
| 429 最多重试 3 次（总请求最多 4 次），退避 8/16/24s | 已证实 | `:378-400` |
| 去图重试只在 400/413/415/422/500 或图片关键词时发生 | 已证实 | `:114-119`、`:293-298` |
| 外部取消与超时共用 AbortController，按 `externalSignal.aborted` 区分文案 | 已证实 | `:367-375`、`:414-418` |
| `getReviewModuleSettings` 在 `:20` 导入但文件内未使用 | 已证实 | `grep -n getReviewModuleSettings review-model-gateway.ts` 仅第 20 行 |
| 配置在 status 与 channel 两次读取间变化会产生不一致窗口 | 推断 | `:207-208` 与 `:250-251` 各自读配置，无锁 |
| `resolveReviewGatewayChannel` 对 ollama 解密异常返回 undefined，而 `performChatCompletion` 吞掉异常用空 key | 已证实 | `:254-259` vs `:334-338` |
| 外部 signal 监听器在请求成功后未移除 | 已证实 | `:374` 仅 `{once:true}`，无 `removeEventListener` |
| 真实 UI 是否展示 `imagesDropped`/usage | 未知 | 未读渲染层消费点；本轮不追 UI |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 条导出清单 | §2 | `:22`-`:300` | covered |
| `reviewPromptWithImages` | §2、§3.5 | `:55-59` | covered |
| `getReviewModelGatewayStatus` 全分支 | §3.2 | `:207-238` | covered |
| `resolveReviewGatewayChannel` | §3.3 | `:246-260` | covered |
| 白名单闸 | §3.4、§6 | `:309-312` | covered |
| URL 归一化（两条线） | §3.4 | `:319-327` | covered |
| 鉴权头差异 | §3.4 | `:329-361` | covered |
| 429 重试/退避 | §3.4、§6 | `:378-400` | covered |
| 超时/取消/错误归一 | §3.4、§6 | `:367-425` | covered |
| 去图重试 | §3.5 | `:283-300`、`:114-119` | covered |
| `usageFromResponse` | §3.6 | `:428-447` | covered |
| `extractChatContent` | §3.6 | `:450-474` | covered |
| 调用者/影响面 | §4、§8 | 跨文件 | covered |
| 真实网络/运行行为 | §9 | — | unknown（NOT_RUN） |
