---
path: apps/electron/src/main/lib/adapters/pi-codex-request-settings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 941091019f4eece220767c55e93281f875f371a2
sha256: 3f2cd47ee9337f34d7a4c24719c3b03e932f63e445335b244e1554aa0d32c9fa
lines: 141
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-codex-request-settings.ts

## 1. 结论与边界

Pi Codex 请求设置扩展（#1268 GPT-5.x 推理档位跨会话记忆）：把 Profer 推理档位 + Fast Mode 映射为 OpenAI provider 请求参数；经 `before_provider_request` 注入，覆盖首轮、续轮与 tool continuation（文件头 `apps/electron/src/main/lib/adapters/pi-codex-request-settings.ts:1-7`）。另含 DeepSeek V4 专有思考协议注入。

## 2. 导出与关键符号

`export` 逐条核对：3 个 re-export + 4 个函数 = 7 个导出（类/接口/常量定义 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `injectCodexFastMode`/`withCodexFastModeServiceTier`/`CODEX_FAST_MODE_SERVICE_TIER` | re-export（导出） | 18 | 自 `./pi-codex-fast-mode` | 统一出口 |
| `injectOpenAIThinkingLevel` | 函数（导出） | 51-74 | `(payload,thinkingLevel)=>unknown` | Codex Responses `reasoning.effort` 注入 |
| `createCodexRequestSettingsExtension` | 函数（导出） | 81-101 | `(settings:{thinkingLevel,fastMode?})=>(pi)=>void` | 推理档位+Fast Mode 合一扩展 |
| `injectDeepSeekV4ThinkingSettings` | 函数（导出） | 109-129 | `(payload,thinkingEnabled)=>unknown` | DeepSeek V4 思考开关 |
| `createDeepSeekV4RequestSettingsExtension` | 函数（导出） | 132-141 | `(settings:{thinkingEnabled})=>(pi)=>void` | |
| `THINKING_LEVEL_TO_EFFORT` | 内部 | 29-37 | off→none、minimal→low、low/medium/high/xhigh 不变、max→max | `:25-28` 注释 |
| `isProviderPayload` | 内部 | 39-41 | 非数组对象守卫 | |

## 3. 内部逻辑与关键流程

### 3.1 `injectOpenAIThinkingLevel`（`:51-74`）

非对象/非 Fast-Mode 支持模型原样返回（`:55-57`）。`gpt-6-astra`（大小写不敏感）不支持 none/minimal，off/minimal 统一降级 `low`（`:59-63`）；其它模型走映射表，未命中默认 `none`（`:63`）。返回 `{...payload, reasoning:{...原 reasoning, effort, summary:'detailed'}}`——剥离 `reasoning.mode`（ChatGPT Codex OAuth 不支持，`:65`）；`summary:'detailed'` 供过程视图审计公开推理摘要（`:48-49`）。

### 3.2 `createCodexRequestSettingsExtension`（`:81-101`）

单一钩子内先 `injectOpenAIThinkingLevel` 再（`fastMode` 时）`doInjectCodexFastMode`，一次遍历（`:79,88-96`）；无变化返回 `undefined`（`:98`）。

### 3.3 DeepSeek V4（`:109-129`）

仅 `isDeepSeekV4Model` 命中才改写；`thinkingEnabled=false` → `thinking:{type:'disabled'}`（`:114-119`）；否则 `thinking:{type:'enabled'}` + `output_config:{...原 output_config, effort:'max'}`（`:121-128`）。注释：Pi 0.80.9 会把通用 reasoning 模型转成旧式 `budget_tokens`，DeepSeek V4 需要无 budget 的开关 + effort（`:103-108`）。

## 4. 调用者与调用链

入向：Pi Agent 扩展装配（`pi-agent-adapter.ts`）；测试：`pi-codex-fast-mode.test.ts`（re-export 面）/`pi-agent-adapter.test.ts`（间接）。出向：`@earendil-works/pi-coding-agent`、`@profer/shared`（`AgentThinkingLevel`/`isCodexFastModeSupportedModel`/`isDeepSeekV4Model`）、`./pi-codex-fast-mode`。

## 5. 数据 I/O、读写与副作用

纯函数 + 扩展工厂：无 IO/无持久状态；副作用仅“向传入 pi 注册 before_provider_request 钩子”（由调用方提供 pi 实例）。

## 6. 分支、失败、取消与恢复

无抛错；分支=原样返回（非对象/非目标模型）或降级（gpt-6-astra off/minimal→low、映射未命中→none/low）。无取消概念。

## 7. 权限与权威状态

推理档位为用户显式选择；`off` 必须显式 `none`（GPT-5.x 服务端默认 medium，`:25`）；模型能力判定归 `@profer/shared`。

## 8. 修改影响面

改映射/降级语义影响 Codex/DeepSeek 请求体、思考计费与测试；re-export 变更影响 `pi-codex-fast-mode` 消费者。

## 9. 测试证据

直接/间接：`pi-codex-fast-mode.test.ts`（118 行，re-export 面）、`pi-agent-adapter.test.ts`（扩展装配面，详见各自手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`injectOpenAIThinkingLevel`/`injectDeepSeekV4ThinkingSettings` 的分支（gpt-6-astra 降级、effortMap 未命中）无专属断言证据（本批 scope 无专属测试文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| off 显式 none（防默认 medium） | 已证实 | `:25,63` |
| gpt-6-astra 降级 low | 已证实 | `:59-63` |
| 剥离 reasoning.mode + summary:detailed | 已证实 | `:65-72` |
| DeepSeek V4 effort:'max' | 已证实 | `:121-128` |
| 生产接线 | 未知 | 本批未逐行核 |
| 分支断言覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `injectOpenAIThinkingLevel` | §3.1 | 51-74 | covered |
| `createCodexRequestSettingsExtension` | §3.2 | 81-101 | covered |
| DeepSeek V4 两函数 | §3.3 | 109-141 | covered |
| re-export | §2 | 18 | covered |
| 接线/分支断言 | §9,§10 | — | unknown |
