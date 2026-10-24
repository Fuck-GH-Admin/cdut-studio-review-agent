---
path: apps/electron/src/main/lib/channel-url-routing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7180b016ddd580e79143dbf4f7ff6a81abf3c522
sha256: 792a454d45e0fffc61ec36e6ddb0cb1760f67aa7b88248645c3a596a7619553a
lines: 115
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-url-routing.test.ts

## 1. 测试目标

直接测试 `inferAgentBaseUrl`/`normalizeChannelForCurrentSchema` 的 URL 路由与迁移规则：DeepSeek 旧地址拆分、第三方网关不受官方默认覆盖、历史 Agent URL 跟随新 Base URL、各 provider 复用/剥尾规则。11 个 `test(` + 1 个 `test.each`（8 例），1 个 `describe('渠道 Chat/Agent URL 路由')`（`:20`）。

## 2. 用例清单

夹具 `channel()`（`:5-18`，deepseek + `baseUrl:'https://api.deepseek.com/anthropic'` 基底）。无 mock/无 IO。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:21-27` | 默认夹具（旧 Anthropic 地址） | `:24` `changed` `toBe(true)`；`:25` baseUrl `'https://api.deepseek.com'`；`:26` agentBaseUrl `'…/anthropic'`（拆分） |
| 2 | `:29-33` | `inferAgentBaseUrl('deepseek','https://api.deepseek.com')` | `:32` `'https://api.deepseek.com/anthropic'` |
| 3 | `:35-43` | baseUrl 官方 `/v1` | `:41` baseUrl 归根；`:42` agentBaseUrl 官方 anthropic |
| 4 | `:45-52` | baseUrl `https://gateway.example.com/anthropic` | `:50-51` 两 URL 均保持网关值（不被官方覆盖） |
| 5 | `:54-64` | base 网关 `/v1` + agentBaseUrl 官方旧值 | `:63` 推导 `'https://gateway.example.com/v1'`（Agent 跟随新地址） |
| 6 | `:66-74` | 显式非官方 Agent 入口 | `:73` 尊重显式 `'…/anthropic'` |
| 7 | `:76-80` | 官方三形态（根/v1/空） | `:77-79` 均 `'https://api.deepseek.com/anthropic'` |
| 8 | `:82-86` | anthropic-compatible + 带尾斜杠 | `:85` `'https://gateway.example.com/anthropic'`（normalize 去尾） |
| 9 | `:88-92` | openai 无单独 Agent URL | `:91` 复用 `'https://cn.clawnode.cn/v1'` |
| 10 | `:94-96` | xai | `:95` 复用 `'https://api.x.ai/v1'` |
| 11 | `:98-101` | ollama 根/带 `/v1/` | `:99-100` 均 `'http://127.0.0.1:11434'`（剥尾） |
| 12 | `:103-114`（test.each 8 例） | openai/openai-responses/opencode-go-openai/zhipu/doubao/qwen/google/custom | `:113` 复用 `baseUrl` 原值 |

## 3. 真实断言

`toBe`（精确 URL 字符串）+ `changed` 布尔。无快照测试。

## 4. 未覆盖

- `normalizeConfigForCurrentSchema` 整配置入口。
- `agentRuntimes` 静默迁移分支。
- URL 解析失败的回退路径（非法 URL 字符串）。
- deepseek `isAnthropicShapedEndpoint(baseUrl)` 分支的边缘（自定义 Anthropic 形态网关）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 项断言如 §2 | 已证实 | 文件全读 |
| 根因场景（用例 5）锁定"Agent 跟随新地址" | 已证实 | `:54-64` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Anthropic 拆分迁移 | §2 用例 1/3 | `:21-43` | covered |
| 官方推导/三形态 | §2 用例 2/7 | `:29-33`/`:76-80` | covered |
| 网关保护 | §2 用例 4 | `:45-52` | covered |
| Agent 跟随新地址 | §2 用例 5 | `:54-64` | covered |
| 显式尊重 | §2 用例 6 | `:66-74` | covered |
| 复用/剥尾规则 | §2 用例 8-12 | `:82-114` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
