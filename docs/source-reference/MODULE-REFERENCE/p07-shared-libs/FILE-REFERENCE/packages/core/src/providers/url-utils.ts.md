---
path: packages/core/src/providers/url-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d4c9956c12225c8cedd66e1c3cfc8dd14d27da78
sha256: 6205019fc855ae2b0cd65d14bcf03a77bae5dba596c497ac9a998f71479d93db
lines: 349
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/url-utils.ts

## 1. 结论与边界

URL 规范化**统一收口**（`packages/core/src/providers/url-utils.ts:1-5`）：各供应商 Base URL 的规范化与请求端点推导；所有 Anthropic URL 规范化逻辑集中于此，避免分散重复。

## 2. 导出与关键符号

`export` 共 **13 个**（全函数）。

| 符号 | 行 | 语义 | 例 |
| --- | --- | --- | --- |
| `isAnthropicShapedEndpoint` | `:79-87` | 路径含 `/anthropic` 判协议形态 | DeepSeek 双入口跟随端点形态（`:68-78`） |
| `normalizeAnthropicBaseUrl` | `:103-118` | 直连 API：去尾斜杠/去 `/messages`、根路径补 `/v1` | `…/v1/messages`→`…/v1` |
| `normalizeVersionedAnthropicBaseUrl` | `:131-138` | 同上但无条件补 `/v1` | `/anthropic`→`/anthropic/v1` |
| `normalizeAnthropicBaseUrlForSdk` | `:153-159` | SDK 环境变量：剥 `/v\d+/messages`、`/v\d+$` | 只留根路径（SDK 自拼） |
| `normalizeBaseUrl` | `:166-168` | 通用：仅去尾斜杠 | OpenAI/Google |
| `normalizeOpenAIBaseUrlForSdk` | `:176-184` | Pi SDK：剥 `/chat/completions`、`/responses` | 还原协议根 |
| `resolveOpenAIChatCompletionsUrl` | `:194-206` | 推导 chat 端点（ollama 重建 `/v1/…`、custom 原样） | |
| `resolveOpenAIResponsesUrl` | `:213-218` | 推导 `/responses` | |
| `resolveOpenAIModelsUrl` | `:225-233` | 同级 `/models`（`replacePathSuffix`） | |
| `normalizeAnthropicProviderUrl` | `:245-264` | 按 provider 分派：ollama+10 家走 versioned、其余走 `normalizeAnthropicBaseUrl` | |
| `resolveAnthropicMessagesUrl` | `:274-289` | 推导 `/messages`（ollama 重建、anthropic-compatible 原样、xiaomi 系 `origin+/anthropic/v1/messages`、已有 `/messages` 原样） | |
| `resolveAnthropicModelsUrl` | `:297-305` | 同级 `/models` | |
| `migrateCompatibleChannelBaseUrl` | `:325-349` | **存量迁移**：custom/anthropic-compatible 旧 Base URL 补全为完整端点（复现旧行为、幂等） | |

内部：`trimTrailingUrlPathSlash`（`:10-19`，保留 `?#` 尾段）、`hasPathSuffix`（`:21-29`，URL 解析失败退化字符串比较）、`replacePathSuffix`（`:31-47`）、`removePathSuffixForSdkBaseUrl`（`:49-66`，剥后缀且清 search/hash）。

## 3. 内部逻辑与关键流程

- **协议跟随端点形态**（`:68-78` 注释）：同一 provider 双入口（如 DeepSeek 官方 `/anthropic` vs 第三方 `…/v1`）按 URL 形判定协议；商业 relay（`…/v1/proxy`）不适用、调用方排除。
- **`normalizeAnthropicProviderUrl` 分派**（`:245-264`）：`ollama` 与 10 家（minimax/xiaomi×2/qwen-anthropic/zhipu-coding×2/ark-coding-plan/deepseek/kimi-api/kimi-coding）走 `normalizeVersionedAnthropicBaseUrl`（按需补 `/v1`，已含 `/coding/v1` 等不重复加）；其余走 `normalizeAnthropicBaseUrl`（仅根路径补 `/v1`）。
- **`migrateCompatibleChannelBaseUrl`**（`:325-349`）：空值/其他 provider 原样返回（幂等）；custom 补 `/chat/completions`、anthropic-compatible 走 versioned+`/messages`；已是完整端点不重复追加（`:333-344`）。注释指明与 SDK 路径互不影响（`normalizeAnthropicBaseUrlForSdk` 可还原根地址，`:321-323`）。

## 4. 调用者与调用链

- 消费方：channel-manager、AnthropicAdapter、OpenAIAdapter、Pi Agent runtime、设置迁移（`:238` 注释「统一收口 channel-manager 和 AnthropicAdapter 中重复的条件分支」）。
- 出向：仅 `ProviderType` 类型。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无状态。

## 6. 分支、失败、取消与恢复

- URL 解析失败时各内部函数**退化为字符串处理**（`:25-28`、`:39-46`、`:60-65`），不抛。
- `resolveAnthropicMessagesUrl` 的 xiaomi 分支用 `new URL(...)` 取 `origin`（`:283`）——非法 URL 此处会抛（与其它退化路径不同）。
- 无异步/取消。

## 7. 权限与权威状态

无身份语义；URL 形态即协议权威输入（`:72-77`）。

## 8. 修改影响面

- provider 分派表（`:246-262`）新增渠道需同步；漏配走 `normalizeAnthropicBaseUrl` 可能少 `/v1`。
- `migrateCompatibleChannelBaseUrl` 语义与存量配置升级耦合（不迁移会 404，`:312`）。
- 无存储格式变更（仅迁移函数改写存储值）。

## 9. 测试证据

- `url-utils.test.ts`（417 行）直接覆盖（见该测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 个导出、4 内部函数 | 已证实 | 全文 |
| 协议跟随端点形态语义 | 已证实 | `:68-87` |
| provider 分派表 11 家 versioned | 已证实 | `:246-262` |
| xiaomi 分支非法 URL 会抛 | 已证实 | `:283` |
| 迁移幂等保证 | 已证实 | `:319`、`:326-348` |
| 消费方全清单 | 未知 | 未逐一列 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 个导出 | 2 | — | covered |
| 4 内部函数 | 2、6 | `:10-66` | covered |
| 分派/迁移流程 | 3 | `:245-349` | covered |
| 失败退化 | 6 | — | covered |
| 测试证据 | 9 | — | covered |
