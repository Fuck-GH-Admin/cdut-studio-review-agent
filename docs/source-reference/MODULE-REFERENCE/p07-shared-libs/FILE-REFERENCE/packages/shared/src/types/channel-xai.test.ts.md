---
path: packages/shared/src/types/channel-xai.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cbd545573968b43a78ca087d329875051bd419f1
sha256: db412ea7d56d862ebafc500a67b9881b3692ca3887ddca5a2031fbfc51af073f
lines: 61
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/channel-xai.test.ts

## 1. 测试目标

xAI **凭据模式解析与 Agent 内核资格**（`packages/shared/src/types/channel-xai.test.ts:27`）：`resolveXaiCredentialMode`（OAuth JSON/普通 key 自动识别、冲突时 OAuth 结构优先保护 refresh token）与 `isAgentEnabledForChannel`（按 provider 推导/显式勾选/实验开关迁移规则）。

## 2. 用例清单

1 describe / 7 test。夹具 `channel(overrides)`（`:14-25`）、`oauthSecret` JSON（`:8-12`）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 历史 OAuth JSON 自动识别 oauth | `resolveXaiCredentialMode(undefined, oauthSecret)==='oauth'` | `:28-30` |
| 2 | 普通 API Key 自动识别 api-key | `resolveXaiCredentialMode(undefined, 'xai-api-key')==='api-key'` | `:32-34` |
| 3 | 冲突时 OAuth 结构优先 | `'api-key'+oauthSecret→'oauth'`；`'oauth'+'xai-api-key'→'oauth'` | `:36-39` |
| 4 | 无勾选按 provider 推导 | xAI→false（无 Anthropic 端点）；anthropic→true | `:42-47` |
| 5 | 显式勾选 Pi → 允许 | `agentRuntimes:['pi']→true` | `:49-51` |
| 6 | xAI 未勾选 → 拒绝 | `agentRuntimes:[]→false` | `:53-55` |
| 7 | 只开实验开关按迁移规则允许 Pi | `agentExperimentalEnabled:true→true`（含叠加 `['pi']`） | `:57-60` |

注释（`:41`）：`isAgentEnabledForChannel` 的 claude 别名为旧调用方兼容，当前仅 Pi runtime、等价 Pi 资格。

## 3. 真实断言

- `expect(resolveXaiCredentialMode('api-key', oauthSecret)).toBe('oauth')`（`:37`）。
- `expect(isAgentEnabledForChannel(channel({ agentRuntimes: [] }))).toBe(false)`（`:54`）。
- `expect(isAgentEnabledForChannel(channel({ agentExperimentalEnabled: true }))).toBe(true)`（`:58`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`agentRuntimes` 含未来内核值、`provider` 其它值。
- 脆弱点：OAuth 优先语义（防丢 refresh token）与密文形态强耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例覆盖模式解析与资格判定 | 已证实 | `:28-60` |
| OAuth 冲突优先保护 refresh | 已证实（断言） | `:36-39` |
| claude 别名=Pi 资格 | 已证实（注释） | `:41` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 模式自动识别 | 1-2 | `:28-34` | covered |
| 冲突优先 | 3 | `:36-39` | covered |
| 资格推导/勾选/迁移 | 4-7 | `:42-60` | covered |
