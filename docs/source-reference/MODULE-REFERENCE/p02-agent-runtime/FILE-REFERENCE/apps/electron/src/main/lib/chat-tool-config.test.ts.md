---
path: apps/electron/src/main/lib/chat-tool-config.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f7d29012edf7aa1178ad5a6590203490784119c2
sha256: cfc9c39d15bdbece34b16d98fa0bed37515b768402b5ed08c6fd8180823e153b
lines: 92
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/chat-tool-config.test.ts

## 1. 测试目标

`chat-tool-config.ts` 的 GPT Image provider 凭据迁移与分槽保存（describe `:37`）。被测逻辑见同组手册。

## 2. 用例清单

**3 个 `test()`**：旧单套 OpenAI 迁移不保留明文（`:38-56`）、双 provider 独立不互覆盖（`:58-72`）、过渡配置按 provider 迁移（`:74-91`）。mock `./config-paths`/`./token-crypto`（`:7-13`，加密=`encrypted:` 前缀假实现）。

## 3. 真实断言

- `:47-55` 迁移后 `getGptImageCredentials()` `toEqual({provider:'openai', mode:'byok', apiKey:'sk-old', baseUrl, model})`；落盘 `openaiApiKeyEncrypted` `toBe('encrypted:sk-old')`、`apiKey` `toBeUndefined()`（**不保留明文**）、openaiBaseUrl/openaiModel 归位。
- `:68-71` 两 provider 各 `toMatchObject` 互不影响；`getToolCredentials('gpt-image')` 含 `hasApiKey:'true'`；配置文件存在。
- `:83-90` 过渡配置（provider:'xai'）迁移后 xai 而非 openai；`xaiApiKeyEncrypted` `toBe('encrypted:xai-old')`、`openaiApiKeyEncrypted`/`apiKey` `toBeUndefined()`。

## 4. 未覆盖与脆弱点

未覆盖：`updateToolState`/`addCustomTool`/`deleteCustomTool`/保存失败抛错；真实 token-crypto（mock）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-92` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 旧单套/双 provider/过渡迁移 | 3 | covered |
| 开关/自定义工具 | — | unknown |
