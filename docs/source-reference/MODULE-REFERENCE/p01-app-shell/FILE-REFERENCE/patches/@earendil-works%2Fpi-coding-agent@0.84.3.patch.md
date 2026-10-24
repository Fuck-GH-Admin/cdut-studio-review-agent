---
path: patches/@earendil-works%2Fpi-coding-agent@0.84.3.patch
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43a0c8f1e986f7d74939c31dd2003d73a19b37d9
sha256: d99c9052c17b5316d8655684c245de17d04f2be502c3a28dde4db9d7d4eda82b
lines: 294
kind: patch
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# patches/@earendil-works%2Fpi-coding-agent@0.84.3.patch

## 1. 目标包与版本

`@earendil-works/pi-coding-agent@0.84.3`（上游产物 `dist/core/agent-session.{d.ts,js}`、`dist/core/settings-manager.{d.ts,js}`）。历史版本补丁（英文注释）：根 `package.json:47-56` 现钉 0.86.1 且 `patchedDependencies` 只登记 0.86.1，本补丁**当前无登记引用**。

## 2. 改动点

4 文件 7 hunk（补丁 `:1-294`）——与 0.82.1 同一重试预算体系，移植到 0.84.3 上下文：

| hunk | 补丁后语义 | 行 |
| --- | --- | --- |
| agent-session.d.ts 事件 | 同 0.82.1：新增 `auto_retry_attempt_start`、三事件统一预算字段、`auto_retry_end.outcome`；删除重复旧 `auto_retry_end` 定义（该删除 hunk 仅 0.82.1/0.84.3 有，0.86.1 上游已无重复） | 5-55 |
| agent-session.d.ts 私有成员 | `_retryRunAttempts/_retryRunDelayMs/_pendingRetryAttemptStart/_canScheduleRetry/_getRetryEventDetails` | 56-74 |
| agent-session.js 状态+成功重置 | 三字段；成功只重置段计数，总预算持续（`:83-117`） | 79-117 |
| `_canScheduleRetry`/`_getRetryEventDetails` | 统一准入四条件 + 事件详情构造（`:118-135`） | 118-142 |
| `_runAgentPrompt`/`_handlePostAgentRun` | 每 prompt 重置总预算（`:147-151`）；`agent.continue()` 前发 `auto_retry_attempt_start`（`:155-159`）；error→`exhausted`（`:171-181`） | 143-181 |
| `_prepareRetry` | 统一准入（`:193`）；指数退避+jitter+总延迟预算封顶（`:204-215`）；sleep 中止→`cancelled`（`:225-233`）；挂 `_pendingRetryAttemptStart`（`:239`） | 182-241 |
| settings-manager.d.ts/js | `RetrySettings` 增 `jitterRatio?/maxTotalRetries?/maxTotalDelayMs?`+默认/夹取（`:247-292`） | 243-294 |

## 3. 为何必须保留

同 0.82.1 补丁：补上游缺失的单 prompt 总重试/延迟预算、jitter、精确 retry 生命周期事件，防工具回合无限重试、支撑 UI 区分退避/发请求/取消。与 pi-ai 重试白名单补丁配套。

## 4. 升级时的处理

升级 pi-coding-agent 时重定位 `_prepareRetry`/`_runAgentPrompt`/`getRetrySettings` 移植整组（0.86.1 补丁即该移植产物，且新增 `_finishCancelledRetry`/`maxAgentDelayMs` 适配）。0.84.3 补丁留作历史。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 hunk 全内容 | 已证实 | 补丁 `:1-294` 逐行读 |
| 与 0.82.1 语义同源/注释英文 | 已证实 | 两份补丁逐段对比 |
| 与 0.86.1 差异=上下文偏移+上游形态（`_finishCancelledRetry`/`maxAgentDelayMs` 仅 0.86.1 有） | 已证实 | `diff` 172 行逐段核 |
| 当前无登记引用 | 已证实 | `package.json:53-56` + 全树检索 |
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
