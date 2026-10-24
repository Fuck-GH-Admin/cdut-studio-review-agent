---
path: patches/@earendil-works%2Fpi-coding-agent@0.82.1.patch
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f887a9803124d8f9b68621ddd0e68a671cf4ad17
sha256: 3becd3b80512f427f5a8bebc20436ef9baca3699c5ca41c290e2d8c684d0ac6a
lines: 303
kind: patch
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# patches/@earendil-works%2Fpi-coding-agent@0.82.1.patch

## 1. 目标包与版本

`@earendil-works/pi-coding-agent@0.82.1`（上游产物 `dist/core/agent-session.{d.ts,js}`、`dist/core/settings-manager.{d.ts,js}`）。历史版本补丁（注释为中文）：根 `package.json:47-56` 现钉 0.86.1 且 `patchedDependencies` 只登记 0.86.1，本补丁**当前无登记引用**。

## 2. 改动点

4 文件 7 组语义改动（下表行=语义改动组，合并多个 diff hunk；实际 diff hunk 14 个，补丁 `:1-303`）——重试预算体系（上游行为→补丁后行为）：

| hunk | 上游 | 补丁后 | 行 |
| --- | --- | --- | --- |
| agent-session.d.ts 事件 | `auto_retry_start/end` 简单字段（含重复的旧 `auto_retry_end` 定义） | 新增 `auto_retry_attempt_start` 事件；三事件统一携带 `totalAttempt/maxTotalAttempts/delayMs/totalDelayMs/maxTotalDelayMs/errorMessage`；`auto_retry_end` 增 `outcome: succeeded\|exhausted\|cancelled`；删除重复旧定义 | 5-55 |
| agent-session.d.ts 私有成员 | `_retryAttempt` 等 | 增 `_retryRunAttempts/_retryRunDelayMs/_pendingRetryAttemptStart` 与 `_canScheduleRetry/_getRetryEventDetails` | 56-74 |
| agent-session.js 状态 | 单 `_retryAttempt` | 增三字段；成功响应只重置连续失败段计数（`:83-116`），顶层 prompt 总预算持续，防工具回合间刷新配额 | 79-117 |
| agent-session.js `_canScheduleRetry`/`_getRetryEventDetails` | 无 | 统一准入（enabled ∧ 段计数<maxRetries ∧ 总次数<maxTotalRetries ∧ 总延迟<maxTotalDelayMs）+ 事件详情构造（`:120-137`） |
| agent-session.js `_runAgentPrompt`/`_handlePostAgentRun` | 无预算重置/无 attempt_start | 每次顶层 prompt 重置总预算（`:149-153`）；backoff 完成后、`agent.continue()` 前发 `auto_retry_attempt_start`（`:157-163`）；error 终态发 `outcome:"exhausted"`（`:175-185`） |
| agent-session.js `_prepareRetry` | enabled+maxRetries 判断、`baseDelayMs*2^n` 固定退避 | `_canScheduleRetry` 统一判断（`:197-201`）；指数退避+对称 jitter（`jitterRatio`）+ 总延迟预算封顶（`:202-215`）；sleep 中止发 `outcome:"cancelled"`（`:229-242`）；完成后挂 `_pendingRetryAttemptStart`（`:248`） |
| settings-manager.d.ts/js | `RetrySettings{enabled,maxRetries,baseDelayMs}` | 增 `jitterRatio?/maxTotalRetries?/maxTotalDelayMs?` 与默认值/夹取（jitter 0-1、两预算非有限→MAX_SAFE_INTEGER）（`:256-301`） |

## 3. 为何必须保留

上游重试只看「连续失败段」计数，工具回合间成功响应会刷新配额，长任务可无限重试；无总预算/无 jitter/无 attempt_start 事件，UI 无法区分「退避中/真正发请求/被取消」。补丁提供单 prompt 总预算+延迟预算、jitter、精确生命周期事件，是无人值守任务稳定性的基础（与 pi-ai 重试白名单补丁配套）。

## 4. 升级时的处理

升级 pi-coding-agent 时需在新版本重定位 `_prepareRetry`/`_willRetryAfterAgentEnd`/`_runAgentPrompt`/`getRetrySettings` 移植整组逻辑（0.84.3/0.86.1 补丁即两次此类移植）；上游若引入等价预算机制则收敛差异后丢弃。0.82.1 补丁的中文注释在 0.84.3+ 改英文，语义一致。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 组语义改动全内容 | 已证实 | 补丁 `:1-303` 逐行读 |
| 当前无登记引用 | 已证实 | `package.json:53-56` + 全树检索 |
| 与 0.84.3/0.86.1 的逻辑同源（注释语言/上下文偏移不同） | 已证实 | 三份补丁对比（`diff` 172 行=偏移与上游形态差异） |
| 重试行为实际变化 | 未知 | 需运行验证（NOT_RUN） |
| 上游 agent-session.js 全文 | 未知 | 第三方产物不在冻结树 |

NOT_RUN：未执行任何测试/构建/补丁应用验证。

## 6. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 目标包/版本 | §1 | covered |
| 7 组语义改动 | §2 | covered |
| 保留理由 | §3 | covered |
| 升级处理 | §4 | covered |
| 运行期效果 | §5 | unknown（NOT_RUN） |
