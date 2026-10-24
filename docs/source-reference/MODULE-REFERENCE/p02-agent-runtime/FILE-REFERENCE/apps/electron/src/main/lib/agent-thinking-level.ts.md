---
path: apps/electron/src/main/lib/agent-thinking-level.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 566a663b99e0b31e942d49c8985b94ac349f8929
sha256: fba8f311bdda183f6c2de3cb3f549363ede0a68fe8cbe412d3599990edc4b153
lines: 70
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-thinking-level.ts

## 1. 结论与边界

GPT-5.x 推理档位跨会话记忆解析（#1268，头注释 :1-12）：级联优先级=会话级>全局开关>全局 effort>默认 off；「关闭推理」须显式 `reasoning:{effort:'none'}`（:10-11 注释）。

## 2. 导出与关键符号

导出 3 条（`export` :17/:31/:54）：`ThinkingLevelSettings`（:17-22）、`resolvePiThinkingLevel(sessionLevel, settings, provider?)`（:31-49）、`resolveGlobalThinkingLevel(settings)`（:54-70）。

## 3. 内部逻辑与关键流程

- `resolvePiThinkingLevel`（:31-49）：session 级（null/undefined=用全局）（:36-39）；off 短路（:42）；`supportsReasoningLevel(provider)` false→off（:46，如 google；注释 :45：其余档位由 Pi SDK 按 catalog clamp）。
- `resolveGlobalThinkingLevel`（:54-70）：开关关→off；effort low/medium/high/max→low/medium/high/xhigh（:65 max→xhigh）；未设置→high（:67-68）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `agent-orchestrator.ts:203` → 调用 `:2196`（thinkingLevel: resolvePiThinkingLevel）；测试 `agent-thinking-level.test.ts:2`。否定：`resolveGlobalThinkingLevel`/`ThinkingLevelSettings` 无生产消费者（模块内 :38/:33+测试）。出向：`@profer/shared`（supportsReasoningLevel :46）。

## 5-7. 数据/分支/权限

纯函数；级联语义即权威。

## 8. 修改影响面

- 消费面：`agent-orchestrator.ts:2196` 的 queryOptions 组装（thinkingLevel 字段）——影响 GPT-5.x/Codex 系推理档位与费用行为；`resolveGlobalThinkingLevel` 由 resolvePiThinkingLevel 内部调用（:38）。
- 依赖面：`@profer/shared` 的 `supportsReasoningLevel`（provider 能力矩阵，属批外）；会话级持久化字段的写入方在渲染层/设置层（批外）。
- 需同步测试：`agent-thinking-level.test.ts`（17 用例（6+11），批内姊妹手册）；档位枚举（low/medium/high/xhigh/off）与 `AgentThinkingLevel` 类型契约联动。

## 9. 测试证据

`agent-thinking-level.test.ts`（批内，80 行）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；级联+max→xhigh | 已证实 | :31-70 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+级联 | §2/§3 | :31-70 | covered |
