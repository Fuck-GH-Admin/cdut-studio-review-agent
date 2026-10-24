---
path: packages/shared/src/types/agent-preview.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e7b229f95589b6809716588501913b6d39c9982
sha256: 30641bd7a1123e73a9906487823f8f8572ddca6295cd91b262f0b0626662a151
lines: 38
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-preview.test.ts

## 1. 测试目标

Agent 预览契约的**类型形状与保守默认**（`packages/shared/src/types/agent-preview.test.ts:10`）：双 runtime 共用输入字段、runtime 中立结果与结构化错误、默认模式与预算常量。

## 2. 用例清单

1 describe / 3 test（纯类型构造断言）。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 双 runtime 共用输入字段 | 构造 `InspectPreviewInput`（含 `previousRevision`）→ `scope==='page'` | `:11-20` |
| 2 | runtime 中立结果与结构化错误 | 构造 `InspectPreviewResult`（file+visual+images）与 `InspectPreviewError`（`renderer_failed`/`retryable:true`）→ 媒体类型与 retryable 断言 | `:22-30` |
| 3 | 保守默认与显式预算 | `DEFAULT_MODE_BY_KIND.text==='content'`、`.presentation==='both'`；`maxPages>0`；`maxPayloadBytes > maxFileBytes/2` | `:32-37` |

## 3. 真实断言

- `expect(AGENT_PREVIEW_LIMITS.maxPayloadBytes).toBeGreaterThan(AGENT_PREVIEW_LIMITS.maxFileBytes / 2)`（`:36`）。
- `expect(error.error.retryable).toBe(true)`（`:29`）。

## 4. 未覆盖与脆弱点

- 未覆盖：8 类默认模式全表、错误码全集、渲染任务载荷脱敏（纯类型无运行时）。
- 脆弱点：断言绑定常量数值关系（`maxPayloadBytes` 比例）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖形状/错误/默认 | 已证实 | `:11-37` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 输入形状 | 1 | `:11-20` | covered |
| 结果/错误形状 | 2 | `:22-30` | covered |
| 默认/预算 | 3 | `:32-37` | covered |
