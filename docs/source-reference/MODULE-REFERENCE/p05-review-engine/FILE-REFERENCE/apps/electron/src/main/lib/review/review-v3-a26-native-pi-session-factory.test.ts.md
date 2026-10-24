---
path: apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8198b56fa8cbd35f82cbba88d21c81530d134010
sha256: 0d175fd2135c6086419cb2fbab0e4ab8c71c4aab9dd607718a9482b6f13fa172
lines: 78
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.test.ts

## 1. 测试目标

A26 真实私有 Pi 会话搭建（`apps/electron/src/main/lib/review/review-v3-a26-native-pi-session-factory.test.ts:36`）：真实 `mkdtempSync` 临时目录 + 真实 Pi SDK `createAgentSession`（A26-01）、缺 provider 配置显式失败（A26-02）、已取消请求不读模型选择（A26-03）。bun:test（`afterEach` 清理临时目录，`:9-12`）。

夹具：`run`/`request` 合成 RunEvidenceIdentity（`:13-20`）；`modelOptions(dir)`（`:21-35`）：`baseUrl:'https://test-provider.invalid/v1'`、`apiKey:'offline-disposable-key'`、`as unknown as PiAgentQueryOptions` 强转（mock 边界：域名 `.invalid` 不可解析，不发真实网络）。

## 2. 用例清单

共 **3 个 `it(`**（1 个 `describe`）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 (A26-01) | 37-53 | builds actual Pi SDK session with selected OpenAI model, separate history | tmp 目录 + select 返回 modelOptions/prompt/tools:[] | `factory.create(request)` → 断言 spec → `dispose()` | 独立 |
| 2 (A26-02) | 54-65 | missing Provider configuration fails visibly without launching Pi | `apiKey:''` | `factory.create` rejects | 独立 |
| 3 (A26-03) | 66-77 | an already cancelled request never reads Main model selection | `AbortController.abort()` + select 抛 'must not select' | `factory.create({...request,signal})` rejects；`selected` 计数 | 独立 |

## 3. 真实断言

- `:48` `expect(spec.trustedOrigin).toBe('https://test-provider.invalid')`。
- `:49` `expect(spec.prompt).toContain('frozen local candidate')`。
- `:50` `expect(spec.session.agent.state.model?.id).toBe('gpt-4o-mini')`。
- `:51` `expect(spec.session.agent.state.isStreaming).toBe(false)`。
- `:63-64` `await expect(factory.create(request)).rejects.toThrow('EXTERNAL_PROVIDER_NOT_CONFIGURED')`。
- `:74-75` `rejects.toThrow('CANCELLED_BEFORE_PI_SESSION')`；`:76` `expect(selected).toBe(0)`。

## 4. 未覆盖与脆弱点

- 未测错误码：`CANCELLED_DURING_MODEL_SELECTION`、`MAIN_FROZEN_PI_SELECTION_MISSING`、`PROVIDER_PROTOCOL_NOT_YET_SUPPORTED`、`PROVIDER_URL_NOT_CONFIGURED`、`PROVIDER_HTTPS_REQUIRED`、`CANCELLED_DURING_PI_SETUP`、`CANCELLED_AFTER_PI_SESSION_CREATION`（7/9 无锚）。
- A26-01 用真实 `createAgentSession`（`buildModel` 真实执行），但 `select` 是内存替身；`tools:[]`（特权工具注入面未测）。
- `session.dispose()` 手动调用（`:52`）；泄漏面（dispose 失败）未测。
- `modelOptions` 强转绕过类型检查（`:34`），字段名漂移不会在编译期被发现。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 it/1 describe | 已证实 | `:36-77` |
| trustedOrigin 钉住 | 已证实 | `:48` |
| 缺 key 可见失败 | 已证实 | `:63-64` |
| 已取消不读 select | 已证实 | `:74-76` |
| `.invalid` 域名无真实网络 | 推断 | RFC 2606 保留域；NOT_RUN 未实测 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支（A26 create） | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 成功路径 | §2/§3 | A26-01 | covered |
| `EXTERNAL_PROVIDER_NOT_CONFIGURED` | §2/§3 | A26-02 | covered |
| `CANCELLED_BEFORE_PI_SESSION` | §2/§3 | A26-03 | covered |
| 其余 7 错误码 | §4 | — | unknown |
