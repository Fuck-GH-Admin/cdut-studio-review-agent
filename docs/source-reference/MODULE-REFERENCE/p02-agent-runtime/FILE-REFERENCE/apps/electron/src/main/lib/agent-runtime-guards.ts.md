---
path: apps/electron/src/main/lib/agent-runtime-guards.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3152bf2768c704520d771fdf46f542c5c73adebb
sha256: f49a4a2caf4961166658ead8cce8856e1e9f647478e7fe841a5ba0301aa098c0
lines: 460
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-runtime-guards.ts

## 1. 结论与边界

Agent runtime 行为守卫（头注释 :1-8）：只表达 Proma 自身承诺语义、不绑 SDK 入口——①最大轮次（turn 完成后、下一轮 prompt/steer 前停）②最大预算（已知费用后停后续批次）③结构化输出（Pi 无 provider-native schema，用提示词+终检补齐）。

## 2. 导出与关键符号

导出 6 条（`export` :14/:16/:22/:30/:53/:153）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `RuntimeGuardStopReason` | `:14` | 'max_turns'\|'max_budget_usd'\|'output_validation_failed' |
| `RuntimeGuardResultOverride` | `:16-20` | subtype/terminalReason/errors |
| `AgentRuntimeGuard` | `:22-28` | recordMessage/shouldStopBeforeNextTurn/applyToolResult/getLimitResultOverride/getResultOverride |
| `AgentRuntimeGuardOptions` | `:30-34` | maxTurns?/maxBudgetUsd?/outputFormat? |
| `createAgentRuntimeGuard(options)` | `:53-114` | 工厂（见 §3） |
| `appendOutputFormatInstruction(prompt, outputFormat?)` | `:153-165` | 附加 JSON 输出格式指令 |

内部约 20 个非导出（:36-458）：`GuardState`（:41-47）、`markLimitStopReason`（:116）、`createLimitResultOverride`（:133）、`validateFinalOutput`（:185-197）、`extractLastAssistantText`（:199-214，注释 :201-202：Pi 0.86 SystemMessage 入联合后按 unknown 收窄）、`parseJsonOutput`（:216-228，直接/切片双试）、`stripJsonCodeFence`（:230-233）、`validateSchemaValue`（:256）+类型/约束/组合子校验族（:269-458，validateConst/String/Number/Type/Enum/Object/Array/Combinators/matchesJsonSchemaType）。

## 3. 内部逻辑与关键流程

`createAgentRuntimeGuard`（:53-114）：
- `recordMessage`（:68-82）：仅 assistant 计 turn（:69-70）；turn≥maxTurns→flag（:71-73）；费用累计（extractMessageCostUsd :75-81）≥budget→flag。
- `shouldStopBeforeNextTurn`（:84-86）：限流判定即停。
- `applyToolResult`（:88-93）：限流时 `terminate:true`（:89-91）。
- `getResultOverride`（:99-112）：限流优先；否则 outputFormat 校验（validateFinalOutput）失败→`error_during_execution`/`output_validation_failed`+`path: message` 列表（:107-111）。
- `validateFinalOutput`（:185-197）：最后 assistant 文本→JSON 解析（去 code fence :217）→schema 校验；空文本报「未找到可校验的最终文本输出」（:188）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产仅 `lib/adapters/pi-agent-adapter.ts:62-64`（createAgentRuntimeGuard :2565、installRuntimeGuardHooks :2808、appendOutputFormatInstruction :3293/:3337）+`lib/adapters/pi-message-adapter.ts:12`（type）。否定：无 agent-runtime-guards 测试（glob）；main/index、orchestrator、claude 侧均未引用。出向：仅类型 `@earendil-works/pi-agent-core`/`@profer/shared`（:11-12，无运行时依赖）。

## 5. 数据 I/O、读写与副作用

无 I/O（纯状态机+校验器）。

## 6. 分支、失败、取消与恢复

限流/校验两层 override（:99-112）；JSON 解析双试（:216-228）。不适用取消/恢复。

## 7. 权限与权威状态

Proma 语义权威（:3-8）：停止点位承诺（turn 后/费用后）；`output_validation_failed` 仅在有 outputFormat 时校验（:103）。

## 8. 修改影响面

pi-agent-adapter 的 turn/budget/output 守卫；结构化输出契约。无直接测试（否定已证）。

## 9. 测试证据

无直接测试（glob `agent-runtime-guards*.test.ts` 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 6 条；两层守卫+schema 校验族 | 已证实 | :53-458 |
| Pi 0.86 联合收窄兼容注释 | 已证实 | :201-202 |
| 无直接测试；消费面仅 adapters 层 | 已证实（否定） | 全树 glob（§4） |
| schema 校验子分支逐条断言 | 未知 | :269-458 无测试 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出+守卫状态机 | §2/§3 | :53-165 | covered |
| JSON/schema 校验族 | §2/§3 | :185-458 | covered |
| 测试 | §9 | — | unknown |
