---
path: apps/electron/src/main/lib/agent-model-routing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cb1da85f98ca02a0f92dfc2b84606da8c1aeefe
sha256: 26c75af3c7042c1e9fc7b0dee14e034a718b6941c0467ab8ea0c0146f97b4939
lines: 57
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-model-routing.ts

## 1. 结论与边界

Agent 辅助模型**路由策略解析**：DeepSeek 系主模型用 `deepseek-v4-flash` 承担 SubAgent（避免复杂主模型被高频子任务消耗），其它模型不写变量交回 SDK 默认解析（`agent-model-routing.ts:20-26`）；同时解析 1M 上下文开关。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：**5 个导出对象**（1 常量 + 2 接口 + 2 函数：DEEPSEEK_SUBAGENT_MODEL_ID/AgentModelRoutingInput/AgentModelRoutingPolicy/resolveAgentModelRouting/applyAgentModelRoutingToEnv）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEEPSEEK_SUBAGENT_MODEL_ID` | 常量 | `:3` | `'deepseek-v4-flash'` | SubAgent 固定模型 |
| `AgentModelRoutingInput` | 接口 | `:4` | modelId?/provider?/context1m?: `boolean\|null` | `context1m` 三态：true 强开/false 强关/缺省自动（`:7-8`） |
| `AgentModelRoutingPolicy` | 接口 | `:11` | deepSeekFamily/enable1MContext/subagentModel? | subagentModel 命中才写，未命中删除环境变量（`:16-17`） |
| `resolveAgentModelRouting` | 函数 | `:27` | `(input): AgentModelRoutingPolicy` | 见 §3 |
| `applyAgentModelRoutingToEnv` | 函数 | `:48` | `(env, policy): void` | 写/删 `CLAUDE_CODE_SUBAGENT_MODEL`（`:52-56`） |

## 3. 内部逻辑与关键流程

- `resolveAgentModelRouting`（`:27-46`）：`deepSeekFamily` = provider==='deepseek' 或 modelId 小写后 `deepseek-` 前缀或 `/deepseek-` 包含（`:28-31`）；`enable1MContext` = context1m 显式 false→false；显式 true→true；缺省→`!deepSeekFamily || supports1MContext(modelId)`（`:39-43`，代际判定注释 `:35-38`：DeepSeek V4 及后默认可用，Claude SDK 需 `[1m]` 后缀+beta）；命中 DeepSeek 附 `subagentModel: 'deepseek-v4-flash'`（`:44`）。
- `applyAgentModelRoutingToEnv`（`:48-57`）：有 subagentModel→写 `env.CLAUDE_CODE_SUBAGENT_MODEL`；否则 `delete env.CLAUDE_CODE_SUBAGENT_MODEL`（保留 SDK 默认解析，`:55`）。

## 4. 调用者与调用链

- 入向：`agent-orchestrator`（域外消费方，grep 全树命中 apps/electron/src/main/lib/agent-orchestrator.ts 与 test）；本批测试 `agent-model-routing.test.ts` 7 用例。
- 出向：`@profer/shared` `supports1MContext`/`ProviderType`（`:1`，shared 域外）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络；`applyAgentModelRoutingToEnv` 修改传入 env 对象（不碰 `process.env`——注释同族设计见 p0-guards `applySdkCredentials`，本文件仅操作入参 env）。无其它副作用。

## 6. 分支、失败、取消与恢复

三分支 1M 判定 + 写/删分支；无抛错、无取消。

## 7. 权限与权威状态

无权限分支，依据：纯函数；策略权威=渠道 `context1m` 偏好（显式）与代际默认（`supports1MContext`）。

## 8. 修改影响面

影响 Agent query env 构造（SubAgent 模型与 1M beta）；改动需同步 `agent-model-routing.test.ts` 7 断言与 orchestrator env 组装。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-model-routing.test.ts`（89 行/**7 个 `test(`**）：DeepSeek V4 Pro→subagent=deepseek-v4-flash+1M 开（`:9-18`）；兼容渠道 `gateway/deepseek-v4-pro` 同（`:20-29`）；`deepseek-reasoner` 1M 不误开（`:31-39`）；非 DeepSeek 删除残留 env（`:41-55`，`toBeUndefined`）；DeepSeek 注入 env（`:57-66`）；context1m:false 强关但不影响 subagent（`:68-78`）；context1m:true 未验证模型也开（`:80-88`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三态 1M/DeepSeek 族判定/env 写删语义 | 已证实 | `:3-57` 逐行 + 7 测试互证 |
| `supports1MContext` 代际判定实现 | 边界 | shared 域外未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出对象 | §2/§3 | 3-57 | covered |
| 测试 7 用例 | §9 | test 文件 | covered（NOT_RUN） |
