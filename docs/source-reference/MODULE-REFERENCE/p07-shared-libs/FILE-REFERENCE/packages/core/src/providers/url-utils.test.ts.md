---
path: packages/core/src/providers/url-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a06266c2077b32c1cdeb08ee67ed4fb165fee401
sha256: 4968af4cce6fedbd5801c757261758f0aac251a075b7de944df03a8b9f30b526
lines: 417
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/url-utils.test.ts

## 1. 测试目标

URL 规范化全函数回归（`packages/core/src/providers/url-utils.test.ts:17` 起 11 个 describe）：`normalizeAnthropicBaseUrl`/`…Versioned…`/`…ForSdk`、`normalizeOpenAIBaseUrlForSdk`、`normalizeBaseUrl`、`normalizeAnthropicProviderUrl`（provider 分派表）、`resolveOpenAI*Url`、`resolveAnthropic*Url`、`migrateCompatibleChannelBaseUrl`（幂等迁移）。纯函数测试，无网络。

## 2. 用例清单

11 describe / 约 52 test（逐行清单见源文件 `:17-415`）。分组要点：

| describe | 行 | 断言要点 |
| --- | --- | --- |
| `normalizeAnthropicBaseUrl` | `:17-38` | 纯域名补 `/v1`；已有 `/v1` 不变；去尾斜杠保留版本；去误填 `/messages`；非版本路径（deepseek `/anthropic`）不补 |
| `normalizeVersionedAnthropicBaseUrl` | `:40-60` | 协议根补 `/v1`；已含 `/v1` 不重复；去 `/messages`；纯域名补 |
| `normalizeAnthropicBaseUrlForSdk` | `:62-83` | 纯域名不变；去 `/v1`、`/v1/messages`；**保留 `/anthropic` 协议根** |
| `normalizeOpenAIBaseUrlForSdk` | `:85-93` | 去 Responses 中转站完整端点、`/chat/completions` 端点（Pi runtime 重拼） |
| `normalizeBaseUrl` | `:95-100` | 仅去尾斜杠 |
| `normalizeAnthropicProviderUrl` | `:102-182` | 分派表 11 家：deepseek/kimi-api/kimi-coding（含手填无 `/v1` 补全）/ollama/minimax/qwen-anthropic/xiaomi×2/zhipu-coding/ark-coding-plan 均补 `/v1`；anthropic-compatible **不走 versioned**（PR：改完整地址后由 resolve 短路，`:140-146`）；原生 anthropic 补/保持 |
| `resolveOpenAIChatCompletionsUrl` | `:184-224` | custom 原样（不加后缀）；内置补 `/chat/completions`、完整端点不重复；ollama 根与 `/v1` 都解析；**保留查询参数** |
| `resolveOpenAIResponsesUrl` | `:226-238` | 根补 `/responses`、完整不重复 |
| `resolveOpenAIModelsUrl` | `:240-262` | `/chat/completions`/`/responses` 端点回同级 `/models`；根推导；保留查询参数 |
| `resolveAnthropicMessagesUrl` | `:264-314` | anthropic-compatible 原样；minimax/ark/xiaomi×2 纠正到 `/v1/messages`（xiaomi 从 OpenAI Base URL 纠正）；完整端点不重复；ollama 解析 |
| `resolveAnthropicModelsUrl` | `:316-356` | messages 端点回同级 `/models`；保留查询参数；ark `/v1/models`；ollama `/v1/models` |
| `migrateCompatibleChannelBaseUrl` | `:358-415` | custom 补 `/chat/completions`（含去尾斜杠、**幂等**）；anthropic-compatible 补 `/v1/messages`（已含 `/v1` 只补 `/messages`、幂等）；迁移后经 SDK 归一化可还原升级前根地址（`:398-404`）；空值/非通用 provider 原样 |

## 3. 真实断言

- `:26-28`（去 `/messages` 保留版本）；`:124-127`（手填 kimi-coding 无 `/v1` 也补全）；`:219-224`/`:257-262`/`:329-334`（查询参数保留）；`:373-377`、`:392-396`（幂等）；`:398-404`（SDK 还原根地址）。

## 4. 未覆盖与脆弱点

- 未覆盖：`hasPathSuffix`/`replacePathSuffix` 的 URL 解析失败退化路径（经调用函数间接）；`isAnthropicShapedEndpoint` 商业 relay 排除（由调用方负责，源码注释 `:76-77`）。
- 脆弱点：断言字符串与文档示例（各函数 JSDoc 例）强耦合；查询参数行为来自 `trimTrailingUrlPathSlash` 保留 `?#`（`url-utils.ts:12-18`）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 组分支回归齐（含幂等/查询参数/迁移还原） | 已证实 | `:17-415` |
| 纯函数、无网络 | 已证实 | 全文 |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测函数 | 行 | 状态 |
| --- | --- | --- |
| `normalizeAnthropicBaseUrl` | `:17-38` | covered |
| `normalizeVersionedAnthropicBaseUrl` | `:40-60` | covered |
| `normalizeAnthropicBaseUrlForSdk` | `:62-83` | covered |
| `normalizeOpenAIBaseUrlForSdk` | `:85-93` | covered |
| `normalizeBaseUrl` | `:95-100` | covered |
| `normalizeAnthropicProviderUrl` | `:102-182` | covered |
| `resolveOpenAIChatCompletionsUrl` | `:184-224` | covered |
| `resolveOpenAIResponsesUrl` | `:226-238` | covered |
| `resolveOpenAIModelsUrl` | `:240-262` | covered |
| `resolveAnthropicMessagesUrl` | `:264-314` | covered |
| `resolveAnthropicModelsUrl` | `:316-356` | covered |
| `migrateCompatibleChannelBaseUrl` | `:358-415` | covered |
| `isAnthropicShapedEndpoint` | — | unknown（本文件未直测） |
