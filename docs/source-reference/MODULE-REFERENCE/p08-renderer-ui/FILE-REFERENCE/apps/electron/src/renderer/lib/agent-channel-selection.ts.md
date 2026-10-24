---
path: apps/electron/src/renderer/lib/agent-channel-selection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f438c147f426df88fd677d196f3264ccb2804bf9
sha256: 59ad2c13d48e858f6c03439dd634717d2c5b00e37d98d56e656429f27a5aabcd
lines: 61
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-channel-selection.ts

## 1. 结论与边界

Agent 渠道/模型选择解析（61 行）：可用性按渠道上用户勾选的 Agent 内核（`agentRuntimes`）判定，**不再按渠道类型**；未迁移老配置用历史 Claude 白名单兜底（:29-33 注释，保升级瞬间行为不变）。

## 2. 导出与关键符号

导出 3 条（`export` :6/:16/:22）：
- `nextAgentChannelIdsAfterModelSelect(...)`（:6-14，已含不重复追加；:5 注释：Pi 可用一切启用渠道不动 Claude 白名单）。
- `AgentModelSelection`（:16-19）。
- `resolveAgentModelSelection(channels, runtime, claudeChannelIds, current?)`（:22-61）：preferredProtocol pi→openai/claude→anthropic（:28）；current 有效保留（:39-44）；**Pi OpenAI 优先排序**（:46-54 注释）；遍历取首个启用模型（:55-58）。

## 3. 内部逻辑与关键流程

`isEligibleChannel`（:34-37）：enabled+isChannelEnabledForRuntime(channel,'pi')；排序分支（:49-54）。

## 4. 调用者与调用链

入向：模型选择器/渠道配置链。出向：`@profer/shared`（isChannelEnabledForRuntime）、`./channel-model-groups`（getChannelProtocol）。

## 5-7. 数据/分支/权限

纯函数；兼容兜底语义（:29-33）。

## 8. 修改影响面

- 消费面：模型/渠道选择。
- 依赖面：agentRuntimes 勾选语义。
- 需同步测试：`agent-channel-selection.test.ts`（94 行）。

## 9. 测试证据

`agent-channel-selection.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；按内核判定契约 | 已证实 | :29-37 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+选择链 | §2/§3 | :6-61 | covered |
