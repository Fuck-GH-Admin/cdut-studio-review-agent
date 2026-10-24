---
path: apps/electron/src/main/lib/agent-system-prompt-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec27a57b9d89a4c974a8a2f98f2c7c07fab318ca
sha256: 874f6ff2fa99c5e4a7390f5d8def5e79f4f4a0e686a6ab2cc767980a62b9aca5
lines: 39
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-system-prompt-policy.ts

## 1. 结论与边界

系统提示策略解析（39 行）：开放认识论属开发者实验能力，**任一门禁未开即回默认 grounded**（:17 注释）；runtime 决定最终 prompt 形态。

## 2. 导出与关键符号

导出 4 条（`export` :5/:10/:19/:28）：`AgentSystemPromptPolicy`（:5-8）、`AgentRuntimeSystemPrompt`（:10-14，string 或 preset 形态）、`resolveAgentSystemPromptPolicy(settings)`（:19-25，developerMode&&openEpistemic 双门禁）、`resolveAgentRuntimeSystemPrompt(runtime, policy, systemPrompt)`（:28-39，pi 或非 preset→原文，否则 `{type:'preset', preset:'claude_code', append}`）。

## 3. 内部逻辑与关键流程

双门禁 AND（:20）；runtime 二分支（:33-38）。不适用取消/恢复。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 0 处**——全树检索（模块名+4 符号名）仅命中本文件与其测试；仅测试 `agent-system-prompt-policy.test.ts:2`。出向：纯类型 import（`@profer/shared`/`../../types`/`./agent-prompt-builder` :1-3）。

## 5-7. 数据/分支/权限

纯函数；open 门禁=开发者权限语义（:17）。

## 8. 修改影响面

认识论姿态+preset 形态决策。需同步测试（46 行）。

## 9. 测试证据

`agent-system-prompt-policy.test.ts`（批内，46 行）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；双门禁语义 | 已证实 | :19-39 |
| 生产消费者 0（仅测试，疑 policy 迁移后遗留） | 已证实（否定） | 全树检索（§4） |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | :5-39 | covered |
