---
path: patches/@earendil-works%2Fpi-coding-agent@0.86.1.patch
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 934d02be84cafa72574d514009273e989a823580
sha256: f7eb00d3ef29f3c0fdaf834051645f2ad562a841596f499d62f6e4021452b874
lines: 293
kind: patch
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# patches/@earendil-works%2Fpi-coding-agent@0.86.1.patch

## 1. 目标包与版本

`@earendil-works/pi-coding-agent@0.86.1`（上游产物 `dist/core/agent-session.{d.ts,js}`、`dist/core/settings-manager.{d.ts,js}`）。**当前生效补丁**：根 `package.json:50` overrides 钉 0.86.1、`package.json:55` `patchedDependencies` 映射本文件（与 pi-ai@0.86.1 补丁配套）。

## 2. 改动点

4 文件 7 hunk（补丁 `:1-293`）——重试预算体系（上游→补丁后）：

| hunk | 补丁后语义 | 行 |
| --- | --- | --- |
| agent-session.d.ts 事件 | 新增 `auto_retry_attempt_start`（backoff 完成、紧邻重试请求）；`auto_retry_start/end/attempt_start` 统一携带 `attempt/maxAttempts/totalAttempt/maxTotalAttempts/delayMs/totalDelayMs/maxTotalDelayMs`；`auto_retry_end` 增 `outcome: succeeded\|exhausted\|cancelled` | 5-43 |
| agent-session.d.ts 私有成员 | 增 `_retryRunAttempts/_retryRunDelayMs/_pendingRetryAttemptStart`（`:44-50`）与 `_canScheduleRetry/_getRetryEventDetails`（`:54-59`） | 44-62 |
| agent-session.js 状态+成功重置 | 三字段（`:67-78`）；成功响应只重置连续失败段计数，顶层 prompt 总预算持续防工具回合刷新配额（`:88-102`） | 67-106 |
| `_canScheduleRetry`/`_getRetryEventDetails` | 统一准入四条件（enabled ∧ `_retryAttempt<maxRetries` ∧ `_retryRunAttempts<maxTotalRetries` ∧ `_retryRunDelayMs<maxTotalDelayMs`，`:107-112`）+ 事件详情构造（`:113-124`） | 107-133 |
| `_runAgentPrompt`/`_handlePostAgentRun`/`_finishCancelledRetry` | 每顶层 prompt 重置总预算（`:138-142`）；backoff 完成后 `agent.continue()` 前发 `auto_retry_attempt_start`（`:148-153`）；error 终态 `outcome:"exhausted"`（`:165-175`）；`_finishCancelledRetry` 消费 pending 详情发 `cancelled`（`:179-197`） | 134-197 |
| `_prepareRetry` | 统一准入（`:209`）；`retryDelayMs` 名义值+对称 jitter+`maxAgentDelayMs` 单次封顶+总延迟预算封顶（`:220-227`）；`auto_retry_start` 携完整详情并挂 `_pendingRetryAttemptStart`（`:231-235`） | 198-238 |
| settings-manager.d.ts/js | `RetrySettings` 增 `maxAgentDelayMs`（上游已有）+ `jitterRatio?/maxTotalRetries?/maxTotalDelayMs?` 与默认/夹取（jitter 0-1；两预算非有限→MAX_SAFE_INTEGER）（`:243-291`） | 239-293 |

## 3. 为何必须保留

上游 0.86.1 重试仅按连续失败段计数（成功响应即刷新），且无总预算/jitter/精确生命周期事件。补丁：①单 prompt 总次数与总延迟预算防工具循环无限重试；②jitter 防同步惊群；③`auto_retry_attempt_start` 让 UI 区分「退避中」与「已发请求」，`outcome` 区分成功/耗尽/取消。与 pi-ai@0.86.1 重试白名单补丁共同构成完整重试策略。

## 4. 升级时的处理

升级 pi-coding-agent 时在新版本重定位 `_prepareRetry`/`_willRetryAfterAgentEnd`/`_runAgentPrompt`/`_finishCancelledRetry`/`getRetrySettings` 移植整组逻辑；上游若引入等价预算/事件则收敛差异后从 `patchedDependencies` 移除（与 pi-ai 补丁同步处置）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 hunk 全内容 | 已证实 | 补丁 `:1-293` 逐行读 |
| 当前生效（patchedDependencies 映射） | 已证实 | `package.json:55` |
| 与 0.84.3 差异=上下文偏移+`_finishCancelledRetry`/`maxAgentDelayMs` 适配 | 已证实 | `diff` 172 行逐段核 |
| `_willRetryAfterAgentEnd` 增 `_agentRunAbortRequested` 前置（上游 0.86.1 形态） | 已证实 | 补丁 `:125-133` 上下文行 |
| 重试行为实际变化 | 未知 | 需运行验证（NOT_RUN） |
| 上游源全文 | 未知 | 第三方产物不在冻结树 |

NOT_RUN：未执行任何测试/构建/补丁应用验证。

## 6. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 目标包/版本 | §1 | covered |
| 7 hunk 语义 | §2 | covered |
| 保留理由 | §3 | covered |
| 升级处理 | §4 | covered |
| 运行期效果 | §5 | unknown（NOT_RUN） |
