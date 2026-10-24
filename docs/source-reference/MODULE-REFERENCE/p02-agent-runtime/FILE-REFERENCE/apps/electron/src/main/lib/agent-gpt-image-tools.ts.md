---
path: apps/electron/src/main/lib/agent-gpt-image-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 806eeac102c62c43b4c67ce505fea30495de8cb3
sha256: 1254df50f112ff47e00369d435b3fdd4a30f38f8a131d13db96a1b3269918a16
lines: 50
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-gpt-image-tools.ts

## 1. 结论与边界

`generate_image` 工具适配层（in-process MCP adapter）：可用性判定、结果格式化。工具描述声明官方模式成功投递后扣 5 Profer 积分、参考图 1-4 张、`useLastGeneratedImage` 与参考路径互斥（:9）。

## 2. 导出与关键符号

导出 4 条（`export` :7/:13/:45/:50）：`AGENT_GPT_IMAGE_TOOL_NAME='generate_image'`（:7）、`isAgentGptImageAvailable()`（:13-18，official 需团队登录态/BYOK 需可解密 key+开关）、`formatAgentGptImageToolResult(result)`（:45-47）、`AGENT_GPT_IMAGE_DESCRIPTION`（:50）。内部：`claudeToolCallId`（:20-31，注释 :28-29：不从 prompt/arguments 派生，合法同图请求须可区分→randomUUID 兜底）、`toolResult`（:33-43，失败 isError+错误文本、成功含相对路径+「不要输出内部图片协议标记」提示）。

## 3. 内部逻辑与关键流程

可用性二判据（:15-17）；toolCallId 三级取值+UUID 兜底（:23-30）；结果两种形态（:34/:35-42）。不适用取消/恢复。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/adapters/pi-builtin-tools.ts:118`（buildPiAgentGptImageTools 注册）。出向：`node:crypto`、`./chat-tool-config`（:2）、`./auth-service`（getTeamAuth :16）、`./agent-gpt-image-service`（:4）、`./gpt-image-service`（**GPT_IMAGE_QUALITIES/SIZES 导入未使用**——注册方直接从 ../gpt-image-service 取，现存观察）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（格式化+判定）；randomUUID。

## 6. 分支、失败、取消与恢复

可用性二分支（:15-17）、结果 ok/err 二分支（:34-42）。

## 7. 权限与权威状态

official 扣 5 积分语义（:9/:35）；不输出协议标记约束（:39）。

## 8. 修改影响面

pi-builtin-tools 注册面；模型工具行为。无直接测试。

## 9. 测试证据

无直接测试（全树检索：`agent-gpt-image-tools` 测试 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；toolCallId 不派生 | 已证实 | :20-31 |
| QUALITIES/SIZES 导入未使用 | 已证实（现存观察） | :5 |
| 无直接测试 | 已证实（否定） | 全树检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+格式化 | §2/§3 | :7-50 | covered |
| 测试 | §9 | — | unknown |
