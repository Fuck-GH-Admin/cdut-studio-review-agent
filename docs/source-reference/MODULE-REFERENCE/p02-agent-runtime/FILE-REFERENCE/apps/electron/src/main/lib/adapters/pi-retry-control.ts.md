---
path: apps/electron/src/main/lib/adapters/pi-retry-control.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0058cb4cad98fa7a2309b26fb206dee6a1114d5
sha256: a9618ea5bae6371ef4b0152d2701dfc13152fb545ab886893612efe7289d97ec
lines: 133
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-retry-control.ts

## 1. 结论与边界

Pi native retry 的**终态门控与事件映射**（运行时代码）：把 SDK retry 生命周期（对齐 `@earendil-works/pi-coding-agent@0.82.1` + Profer 引入的 `pi-coding-agent@0.82.1.patch` 扩展，`apps/electron/src/main/lib/adapters/pi-retry-control.ts:12-13`）转换为 Profer UI 识别的 retry 事件；在确认 `willRetry` 前调用方不能把 error/result 当终态交给外层编排器（`:39-44`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiRetryUpdate` | 导出类型 | 3-7 | `starting/attempt/cleared/failed` 四态 | UI 事件 |
| `PiNativeRetryOutcome` | 导出类型 | 9 | `'succeeded'\|'exhausted'\|'cancelled'` | |
| `createPiRetryTerminalGate<T>` | 导出函数 | 45-65 | `(): {defer, peek, settle}` | 终态门控 |
| `getPiNativeRetryOutcome` | 导出函数 | 67-71 | `(event): PiNativeRetryOutcome \| undefined` | |
| `mapPiNativeRetryEvent` | 导出函数 | 84-133 | `(event, timestamp?): PiRetryUpdate[]` | 事件映射 |

内部：`PiNativeRetryDetails`（`:23-32`，含 total* 可选系列=backoff total 预算语义）、`PiNativeRetryEvent`（`:34-37`，三阶段：`auto_retry_start`/`auto_retry_attempt_start`/`auto_retry_end`）。

## 3. 内部逻辑与关键流程

- 三阶段语义（`:15-18` 注释）：start=backoff 开始；attempt_start=backoff 结束紧邻 `agent.continue()` 的实际 retry 请求（0.82.1 新增）；end=收尾带 outcome。
- `createPiRetryTerminalGate`（`:45-65`）：`defer` 挂起 error；`settle(willRetry)` —— willRetry 时返回 undefined（错误不透传、pendingError 清空）否则透传（`:59-63`）。
- `getPiNativeRetryOutcome`（`:67-71`）：非 end→undefined；有 outcome 用之；否则 success→'succeeded'/否→'exhausted'。
- `mapPiNativeRetryEvent`（`:84-133`）：start→`starting`（delaySeconds=delayMs/1000，reason 兜底「未知错误」，`:88-96`）；attempt_start→`attempt`（reason 兜底「重试中」，`:98-110`）；end——success 或 outcome==='succeeded'→`cleared`（`:113-115`）；outcome==='cancelled'→也 `cleared`（`:117-120` 注释：retry 被取消已被 stopped 流程接管，避免误报失败）；否则→`failed`（finalError 兜底「重试失败」，delaySeconds 0）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`、`apps/electron/src/main/lib/agent-orchestrator.ts`（import 检索）。出向：`@profer/shared`（RetryAttempt 类型）。

## 5. 数据 I/O 与副作用

无（纯函数+闭包状态）。

## 6. 分支、失败、取消与恢复

无 throw；cancelled→cleared 的取消语义（`:117-120`）；gate 的 settle 清空=pendingError 一次性消费。

## 7. 权限与权威状态

无权限分支；SDK 事件语义权威=`_getRetryEventDetails`（`:20-21` 注释，SDK 未读）。

## 8. 修改影响面

改映射影响 UI 重试横幅/编排器终态判定；SDK 版本升级（0.82.1 patch）需同步。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-retry-control.test.ts`（141 行；NOT_RUN）：15 用例（12 映射+3 gate；QA N-NB54-04 校正）锚定全映射分支（starting/attempt 兜底文案、outcome 四种、cancelled→cleared、gate settle/peek 语义，test:7-140）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+映射全分支 | 已证实 | `:3-133` |
| 测试 15 用例断言 | 已证实 | pi-retry-control.test.ts（QA N-NB54-04 校正） |
| SDK `_getRetryEventDetails` 字段 | 推断 | `:20-21` 注释（SDK 未读） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 5 导出+分支 | §2/§3 | covered |
| 测试断言 | §9 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
