---
path: apps/electron/src/main/lib/adapters/pi-runtime-smoke.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 23df893eb351c9b0f256830271596639f668179d
sha256: cb26b1200c7e14e42d1bf7da4193a5b5c5a726773eab822868ad92e2de3eee8e
lines: 63
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-runtime-smoke.test.ts

## 1. 测试目标

**Pi SDK 0.84.3 运行时冒烟**（describe `:3`）：SDK 可加载、所需 API 存在、SettingsManager 运行时配置可读、`.d.ts` 形状符合 adapter 依赖（含 patch 生效验证）。被测对象是**外部 SDK 本体**（`@earendil-works/pi-coding-agent`/`pi-agent-core`），非本仓实现文件。

## 2. 用例清单

1 个 describe + **5 个 `test()`**：

| 用例 | 行 |
| --- | --- |
| sdk 可加载且 SessionManager/createAgentSession/SettingsManager/DefaultResourceLoader 存在 | `:4-11` |
| SettingsManager.inMemory 读到 compaction/retry total 配置 | `:13-24` |
| Agent.constructor 可实例化且暴露 streamFunction（0.84.3，dts 断言） | `:26-38` |
| retry 事件模型含 auto_retry_attempt_start 与 total 字段（patch 生效，dts 断言） | `:40-53` |
| adapter 依赖的 SettingsManager 运行时 API 可调通 | `:55-62` |

## 3. 真实断言

- `:6-10` sdk/SessionManager/`typeof createAgentSession` `toBe('function')`/SettingsManager/DefaultResourceLoader `toBeDefined()`。
- `:19-23` `getRetrySettings()` 的 `maxTotalRetries`/`maxTotalDelayMs` `toBeTypeOf('number')`、`baseDelayMs` `toBe(1000)`、`getCompactionSettings().enabled` `toBe(true)`。
- `:34-35` `agent.d.ts` `toContain('streamFunction: StreamFn')` 与 `toContain('streamFn: StreamFn')`（构造入参与运行时属性并存，`:36-37` 注释+console.log）。
- `:47-52` `agent-session.d.ts` `toContain('auto_retry_attempt_start')`/`maxTotalAttempts`/`outcome: "succeeded" | "exhausted" | "cancelled"`/`"manual" | "threshold" | "overflow"`（compaction 溢出 reason）/`agent_settled`。
- `:58-61` `getProviderRetrySettings`/`getHttpIdleTimeoutMs`/`getWebSocketConnectTimeoutMs` 均 `typeof` `toBe('function')`、`getHttpIdleTimeoutMs()` `>= 0`。

## 4. 未覆盖与脆弱点

- 未覆盖：Agent 构造实测（`:26` 名为可实例化，实际只断言 dts 文本——照实记录）；createAgentSession 调用链。
- 脆弱点：依赖 node_modules 里 d.ts 文本（SDK 升级/patch 变动会碎——这正是其"patch 生效"哨兵用途）；SDK 版本 0.84.3 写死在 describe 标题。
- **NOT_RUN**：本轮未执行本文件（依赖安装树）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例与断言如 §3 | 已证实 | 逐行读 `:1-63` |
| 通过与否（SDK 行为） | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| SDK 加载/API 存在 | 1 | covered |
| SettingsManager 配置 | 2 | covered |
| d.ts 形状（streamFn/retry 事件） | 2 | covered |
