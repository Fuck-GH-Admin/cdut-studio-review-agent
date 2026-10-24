---
path: apps/electron/src/main/lib/agent-session-usage.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd59394ecbf9948da703d0a0250fd5f02e34ce0f
sha256: 8303d4d7b1fed45c7adbfda52587c0b63846461d2bfc7e2421fc2fa8ead86542
lines: 37
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-usage.test.ts

## 1. 测试目标

`pickResultContextWindow`：多模型 modelUsage 时主模型优先/最大窗口兜底。不运行（`NOT_RUN`）。

## 2. 用例清单

2 用例（:20/:29），1 describe（:19）；fixture `resultWithUsage`（:6-17）。
1. 主模型 ID 匹配（:20-27）：子模型在前、`_channelModelId='gateway/deepseek-v4-pro[1m]'` → 选 ONE_MILLION 窗口（:26）。
2. 无主模型 ID 兜底（:29-36）：选最大 400_000（:35）。

## 3. 真实断言

- `:26`：`expect(pickResultContextWindow(result)).toBe(ONE_MILLION_CONTEXT_WINDOW)`——子模型 entry 排第一但有 `_channelModelId` 时选主模型大窗口，而非首项小窗口。
- `:35`：`expect(pickResultContextWindow(result)).toBe(400_000)`——无主模型 ID 时取 modelUsage 中最大有效 contextWindow（400_000 > DEFAULT），防子 agent 小窗误导。
- 两断言均为纯函数直调（fixture `resultWithUsage` 构造 SDKResultMessage 形状，:6-17）。

## 4. 未覆盖与脆弱点

未覆盖：getSessionContextUsageRatio（文件读取路径）。mock 边界：纯 fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 主模型优先/最大兜底 | #1/#2 | covered |
| getSessionContextUsageRatio | — | unknown |
