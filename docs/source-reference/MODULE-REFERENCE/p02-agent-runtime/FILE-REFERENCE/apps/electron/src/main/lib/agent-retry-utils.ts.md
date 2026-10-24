---
path: apps/electron/src/main/lib/agent-retry-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9496e451b3a4bf56f1e823c46d6112f7e535a7fb
sha256: f5ba2210c04e6c57831f889d1fab71859b6852e4025c7cb6cfb797d8cfbc4d0d
lines: 189
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-retry-utils.ts

## 1. 结论与边界

Agent 重试纯函数集（头注释 :1-4，自 agent-orchestrator 提取）：自动重试决策、延迟计算、错误分类。重试预算风暴治理（:19 注释：单次故障最多重发 5 遍完整上下文）。

## 2. 导出与关键符号

导出 19 条（`export` :11/:20/:23/:26/:29/:35/:39/:46/:81/:89/:91/:97/:101/:105/:139/:143/:149/:167/:187）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AUTO_RETRYABLE_ERROR_CODES` | `:11-17` | rate_limited/provider_error/service_error/service_unavailable/network_error |
| `MAX_AUTO_RETRIES=5`/`OPENAI_UPSTREAM_BUSY_MAX_RETRIES=5`/`MAX_AUTO_RETRY_WAIT_MS=60000`/`RETRY_MAX_DELAY_MS=15000` | `:20-29` | 常量 |
| `isOllamaToolStreamError` | `:35-37` | `/no user query found in messages/i`——禁自动重试（:32-34 注释：Ollama runner 占用风险） |
| `sdkPermissionModeForProferMode` | `:39-41` | 映射 sdkMode |
| `extractApiError(stderr)` | `:46-79` | 三级正则提 `{statusCode,message}`：JSON 形态（:49-57）/API error 前缀（:59-67）/裸码（:69-76，仅 400-599） |
| `isAutoRetryableTypedError` | `:81-83` | 码∈集合 |
| `OPENAI_UPSTREAM_BUSY_MESSAGE`/`isOpenAIUpstreamBusyError` | `:89-95` | 官方上游繁忙统一文案；openai 系 provider 或文本含 openai+过载语义 |
| `getMaxAutoRetries`/`getRetryDisplayReason` | `:97-103` | 繁忙→5/统一文案 |
| `isAutoRetryableCatchError` | `:105-130` | 见 §3 |
| `isRetryBudgetExhausted` | `:139-141` | `elapsed>=60s`（注释 :132-138：预算为准不以延迟 0 为准，防 stream_interrupted 误停） |
| `isSessionNotFoundError` | `:143-146` | `/No conversation found.*with session/i` |
| `isInvalidRelayTokenError` | `:149-156` | 401+「relay 令牌无效」（注释：防普通 API Key 401 误判） |
| `getRetryDelayMs(attempt, elapsed, category?)` | `:167-179` | 指数退避+±20% jitter+分类倍数（stream_interrupted×0/timeout×1.5/dns×2，:158-166） |
| `classifyCatchError` | `:187-189` | 委托 error-patterns.classifyNetworkError |

## 3. 内部逻辑与关键流程

`isAutoRetryableCatchError`（:105-130）顺序：Ollama 流错→false（:110）；apiError 429/5xx→true（:111-113）；`context_management`→true（:115）；OpenAI 繁忙/502/529/overloaded→true（:118-119）；裸 5xx→true（:123，注释 :120-122：中转网关无 API Error 前缀的历史误判修正）；service unavailable/request could not be completed→true（:124-125）；transient 系三判定（:126-128）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/agent-orchestrator.ts:145-161`（12 符号，调用点 :2350-2366/:2388-2399/:2467/:2483-2491/:2831/:2913/:2995/:3003-3004/:3303-3357/:3495）；测试 `agent-retry-utils.test.ts:25`（另引 pi-agent-adapter.mapSDKErrorToTypedError :27）。否定：pi-review-watchdog:220 仅注释；pi-native-retry* 未引用。出向：`@profer/shared`（PROFER_PERMISSION_MODE_CONFIG :40）、`./error-patterns`（:8）。

## 5. 数据 I/O、读写与副作用

无（纯函数；jitter 用 Math.random :177）。

## 6. 分支、失败、取消与恢复

详见 §2/§3；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

重试预算权威：MAX 5 次/60s（:20/:26）；relay token 401 限定识别（:148 注释）。

## 8. 修改影响面

orchestrator 重试循环（12 符号消费）；需同步测试 `agent-retry-utils.test.ts`（10 describe）。

## 9. 测试证据

`agent-retry-utils.test.ts`（批内，251 行/10 describe，断言细节见手册 `agent-retry-utils.test.ts.md`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 19 条；重试语义矩阵 | 已证实 | :11-189 |
| 中转 5xx 裸码历史误判修正 | 已证实 | :120-123 注释 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 19 导出+决策链 | §2/§3 | :11-189 | covered |
| 测试 | §9 | — | covered（NOT_RUN，见姊妹手册） |
