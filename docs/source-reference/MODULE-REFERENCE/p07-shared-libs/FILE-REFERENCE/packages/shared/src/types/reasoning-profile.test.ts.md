---
path: packages/shared/src/types/reasoning-profile.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ce7bf0adea6d0a3c184955e05cc631bfa29c169
sha256: 9697921ad8f47c2a65db5582bd8648a8b845f36b88e9d713bf5aec35e9764984
lines: 52
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/reasoning-profile.test.ts

## 1. 测试目标

`reasoning-profile.ts` 的 `resolveReasoningProfile`（唯一被测函数）：各厂商 profile 解析、GLM-5.3 toggle 编码、DeepSeek 短名别名与旧世代负例。被测逻辑见同组 `reasoning-profile.ts.md`。

## 2. 用例清单

1 个 describe（标签 `GLM-5.3 reasoning profile`——**名不副实**，含 astra/DeepSeek 用例）+ **6 个 `test()`**：

| 用例 | 行 |
| --- | --- |
| GPT-6 Astra 五档 + effortMap off:null/minimal:'low' | `:5-12` |
| GLM-5.3 openai-completions 仅 off/high + zai-toggle 全 null map + normalize('max')→'high' | `:13-23` |
| GLM-5.3 anthropic-messages = anthropic-manual（不进 adaptive-effort） | `:25-28` |
| GLM-5.2 保持 off/high/max + zai-thinking-effort | `:30-35` |
| DeepSeek 官方短名别名与正式 ID 同协议（flashAlias=flashOfficial） | `:37-46` |
| DeepSeek 旧世代（deepseek-chat/reasoner）短名不误扩 → undefined | `:48-51` |

## 3. 真实断言

- `:8-11` `profile.id` `toBe('openai-reasoning-astra')`、`levels` `toEqual(['low','medium','high','xhigh','max'])`、`effortMap.off` `toBeNull()`、`effortMap.minimal` `toBe('low')`。
- `:16-22` `id` `toBe('glm-5.3')`、`levels` `toEqual(['off','high'])`、`normalize('max')` `toBe('high')`、encodings `toEqual({kind:'zai-toggle', effortMap:{minimal:null,low:null,medium:null,xhigh:null,max:null}})`。
- `:26-27` anthropic kind `toBe('anthropic-manual')`。
- `:33-34` `levels` `toEqual(['off','high','max'])`、kind `toBe('zai-thinking-effort')`。
- `:42-45` `flashAlias.id` `toBe('deepseek-v4-flash')`、kind `toBe('deepseek-output-effort')`、`flashAlias` **`toEqual(flashOfficial)`**（整体等价）、`proAlias.id` `toBe('deepseek-v4-pro')`。
- `:49-50` `deepseek-chat`/`deepseek-reasoner` 均 `toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`resolveReasoningCapability`/`normalizeReasoningCapabilityLevel`/`getPiCatalogThinkingLevels`/`supportsReasoningLevel`/`inferReasoningTransport`（后者仅 xai 测试触及）；kimi-k3/grok/openai-standard/max profile；`normalize` 各家分支。
- 脆弱点：describe 标签误导（GLM-5.3 标签下含 astra/DeepSeek）；断言为精确对象匹配（映射表变动会碎）。
- **NOT_RUN**：本轮未执行本文件。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例与断言如 §3 | 已证实 | 逐行读 `:1-52` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| resolveReasoningProfile（astra/glm/deepseek 别名/负例） | 6 | covered |
| capability/clamp/transport 其余 | — | unknown |
