---
path: apps/electron/src/main/lib/adapters/pi-codex-title-generator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8814004112c155336f5f7e6e8973eedbdeb1d13a
sha256: 8a58092fa0468b6cc953cde0be9fe90ce2a3a1ce0be578a0baaec0fba0e6cb8d
lines: 77
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-codex-title-generator.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

Codex OAuth 标题生成：`extractCodexResponseText` 只取可见文本（忽略 thinking/toolCall）；`completeCodexTitleRequest` 用小额度非推理请求（UUID sessionId/transport:auto/maxTokens:40/30s/maxRetries:0/reasoningEffort:'none'/verbosity:'low'/toolChoice:'none'）且**成功/失败均关闭代理 dispatcher**。

## 2. 用例清单

共 4 个 `test(`（`apps/electron/src/main/lib/adapters/pi-codex-title-generator.test.ts:25,34,38,67`）。夹具 `createEnvironment`（`:13-22`，记录 install/closed 的 `CodexTitleRequestEnvironment`）；mock runtime `complete`（`:41-47,68-70`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 只取可见文本（`:25`） | `extractCodexResponseText([...])` `toBe('修复 OAuth 登录问题')`（thinking/toolCall 忽略、text 拼接） |
| 2 | 无 text 返回空串（`:34`） | `toBe('')` |
| 3 | 请求参数+关代理（`:38`） | `resolve` `'OAuth 标题修复'`；prompt `'生成标题'`；`toMatchObject` sessionId UUID 正则、transport 'auto'、maxTokens 40、30_000、0、'none'、'low'、'none'；`installed===true`；`closed===dispatcher` |
| 4 | 失败仍关代理（`:67`） | `rejects.toThrow('quota exceeded')` 且 `closed===dispatcher` |

## 3. 真实断言

逐条见上表（`:26-31,35,51-64,74-75`）。mock 边界：`CodexTitleRuntime` mock（无真实 Codex 网络）；被测函数为真实实现。

## 4. 未覆盖与脆弱点

未覆盖：`generateCodexTitle` 端到端（buildCodexModel/连接策略）、`resolveCodexTitleConnectionSettings`（代理优先级）、`stopReason:'error'/'aborted'` 抛错分支、空文本→null。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个用例 | 已证实 | `grep test(`；`:25-75` |
| 文本抽取 | 已证实 | `:26-35` |
| 请求参数契约 | 已证实 | `:53-62` |
| finally 关闭（含失败） | 已证实 | `:64,75` |
| 真实网络/凭证刷新 | 未知 | mock runtime |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 文本抽取 | 1,2 | 25-36 | covered |
| 请求参数/清理 | 3 | 38-65 | covered |
| 失败清理 | 4 | 67-76 | covered |
| 端到端/错误分支 | 无 | — | unknown |
