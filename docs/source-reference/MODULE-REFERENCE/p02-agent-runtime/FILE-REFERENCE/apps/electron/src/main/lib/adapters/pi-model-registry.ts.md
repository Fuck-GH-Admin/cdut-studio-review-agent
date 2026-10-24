---
path: apps/electron/src/main/lib/adapters/pi-model-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c7939ebbd839ca57fa2e3faa5f254d6956ece6c
sha256: 140972d2b09d88fbbf8874f6bf305fc89bfa8e6c9fc228475917a84a4a66e59b
lines: 906
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-model-registry.ts

## 1. 结论与边界

Pi **模型注册与渠道兼容层**（运行时代码）：把 Proma 渠道临时注册成 Pi runtime provider，集中处理 ProviderType→Pi API 协议/baseUrl/认证头/模型 catalog 默认值映射（`apps/electron/src/main/lib/adapters/pi-model-registry.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT_CONTEXT_WINDOW` | 导出常量 | 54 | `200_000` |
| `normalizePiApi` | 导出函数 | 233-258 | provider+baseUrl→Pi Api 协议 |
| `resolvePiReasoningCapability` | 导出异步函数 | 335-352 | 推理档位能力（级联 profile→catalog） |
| `applyModel1MContextPreference` | 导出函数 | 464-471 | 1M 偏好归一（强开抬 1M/强关压回 200K/未设置保持） |
| `requiresPromaUserAgent` | 导出函数 | 503-505 | kimi-coding/xiaomi-token-plan/zhipu-coding(-team) |
| `buildPiRequestHeaders` | 导出函数 | 511-523 | anthropic-messages 时 Bearer+可选 Proma UA |
| `resolvePiApiKey` | 导出函数 | 537-540 | 智谱团队版复合凭据提取 apiKey；ollama 空键→哨兵 'ollama' |
| `stripAgentSdkContextSuffix` | 导出函数 | 549-551 | 剥 `[1m]` 后缀（智谱 1211 兼容） |
| `getCodexCatalogModels` | 导出异步函数 | 573-576 | 内置 catalog+`CODEX_MODEL_PATCHES` 合并 |
| `listCodexModels`/`listXaiModels` | 导出异步函数 | 608-613/:836-839 | 模型清单 |
| `buildModel` | 导出异步函数 | 615-689 | 主入口（provider 注册+模型解析） |
| `CodexModelInput`/`XaiModelInput` | 导出接口 | 697-703/:782-789 | OAuth 输入 |
| `buildCodexModel` | 导出异步函数 | 754-774 | Codex OAuth credential store 版 |
| `buildXaiOAuthModel` | 导出异步函数 | 888-906 | xAI OAuth 版 |

内部：常量（`:48-64`，ZERO_MODEL_COST/64K 默认/GLM 53=131072/CODEX_BASE_URL 等）；`CODEX_MODEL_PATCHES`（`:80-147`，gpt-6-astra 全条目+gpt-5.4/5.4-mini/5.5 窗口补丁+5.6 三 SKU）；`resolveVerifiedGpt56ContextWindow`/`applyVerifiedGpt56ContextWindow`（`:67-78`，Pi catalog 误标 272K 修正为 1,050,000）；`compilePiReasoningCapabilities`（`:170-206`，encoding kind→compat/thinkingLevelMap：adaptive-effort/deepseek/anthropic-manual/openai-reasoning-effort/zai 系）；`isLocalOllamaBaseUrl`/`isRelayProxyBaseUrl`（`:208-221`）；`candidatePiProviders`（`:260-289`）；`findPiCatalogModel`（`:305-324`，DeepSeek 旧代写法归一+全 provider 兜底）；`buildOpenAICompatibleCompatDefaults`（`:368-387`，custom 5 项保守化）；`isHeuristicReasoningModel`（`:389-392`）；`resolvePiModelDefaults`（`:394-452`）；`normalizePiBaseUrl`（`:482-501`）；`mergeCodexModels`（`:553-567`）；credential stores（`:705-745` Codex / `:791-833` xAI）；`buildXaiApiKeyModel`（`:848-886`）。

## 3. 内部逻辑与关键流程

- `normalizePiApi`（`:233-258`）：**协议跟随端点而非 provider**（`:226-232`：第三方中转多只提供 OpenAI 兼容端点）；deepseek 有 baseUrl 且非 `/v1/proxy` 且非 anthropropic 形态→openai-completions；远程 ollama→openai-completions；缺省 deepseek→anthropic-messages（兼容历史）。
- `resolvePiModelDefaults`（`:394-452`）：1M 判定三层——`explicit1MContext`（显式 `[1m]` 或勾选，`:651`）/`supportsVerified1MContext`（代际已验证）/**中转 DeepSeek 保守回退**（`:419-424`：非 deepseek provider 未显式 1M 时不继承 catalog 1M）；配置的 contextWindow/maxTokens 最后统一生效（`:431-437`）；1M 偏好经 `applyModel1MContextPreference`（`:437`）。
- `buildModel`（`:615-689`）：openai-codex→OAuth store 版或 runtime key 版；xai→OAuth/API key 两路；通用路——provider 名 `profer-<provider>-<sessionId>` 隔离注册（`:647`）、`resolvePiApiKey` 提取真 token、`stripAgentSdkContextSuffix` 剥后缀、`buildPiRequestHeaders`、`registerProvider` 单模型条目（`:664-685`）；getModel 失败抛 `Pi model registration failed`（`:687`）。
- credential store（Codex `:705-745`）：一次性内存 store，`modify` 检测 access/refresh/expires/accountId 变化→`onRefreshed` 回写（失败 warn 下次重试，`:736`）；xAI 版经 `refreshXaiOAuthCredentialsSerial` 串行刷新（`:810-818`）。
- `buildCodexModel`/`buildXaiOAuthModel`：模型解析三级回退（runtime getModel→catalog 兜底→首个内置，`:765-769/:898-901`），全失败抛「请确认已登录/订阅已授权」。

## 4. 调用者与调用链

入向：`apps/electron/src/main/ipc.ts`、`apps/electron/src/main/lib/remote-service.ts`、`adapters/pi-agent-adapter.ts`、`adapters/pi-codex-title-generator.ts`、`review/review-v3-a26-native-pi-session-factory.ts`（import 检索）。出向：`@profer/shared`（窗口常量/reasoning/凭据类型）、`@profer/core`（UA/BaseUrl 归一化）、`@earendil-works/pi-ai/compat`（catalog）、`./pi-agent-adapter`（PiAgentQueryOptions 类型）、`../xai-oauth-credentials`、`../official-channel`、`../pi-model-runtime-options`（均不在本批）。

## 5. 数据 I/O 与副作用

网络=catalog 动态 import（无 HTTP，静态表）；副作用=OAuth 凭据回写回调、`console.warn`。

## 6. 分支、失败、取消与恢复

- 抛错：Codex 凭据缺失（`:755-757`）、无可用模型（`:702/:771`）、Base URL 缺失（`:661/:860`）、注册失败（`:687/:884`）。
- 回写失败降级 warn（`:736/:824`）；模型 ID 漂移回退首个内置（`:599-600`）。

## 7. 权限与权威状态

凭据权威=Profer 渠道存储（经 OAuth 回写）；API key 只写当前 runtime 的 credential store（`:845-846`，不落 `~/.pi`——`:751` 注释）；官方渠道判定=`../official-channel`。

## 8. 修改影响面

改注册逻辑影响全部 Pi 模型请求（Agent/标题生成/远程服务）；catalog 补丁与 Pi SDK 版本联动（0.86 注释 `:95/:342`）。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-model-registry.test.ts`（823 行；NOT_RUN，另有跨文件断言见 test 手册）：mock 边界=`ModelRuntime.create` 注入假 sdk（test:50-61）与真实 SDK 直连（test:122 等）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出（QA N-NB54-01 计数校正）+全分支语义 | 已证实 | `:48-906` |
| 协议跟随端点/1M 三层判定/凭据隔离 | 已证实 | `:233-258/:413-429/:705-745` |
| Pi catalog 行为（272K 误标等） | 推断 | 注释自述（SDK catalog 未读） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 16 导出+内部工具 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
