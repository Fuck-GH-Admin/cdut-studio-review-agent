---
path: apps/electron/src/main/lib/agent-send-binding.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 22c7213c854e13026351ebba531c65b14c42bf0b
sha256: 37f0bcff18ddf24c712e2f087b05a6890ffd3e334f2944ff853ef44a87ab9ff6
lines: 46
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-send-binding.ts

## 1. 结论与边界

SEND_MESSAGE 的**主进程归属校验**（`agent-send-binding.ts:7-9`）：session/workspace 以持久化 meta 为准；channel 允许在已启用渠道间切换（不把历史 channelId 当不可变绑定）；runtime 是会话元数据归属，不允许过期 renderer/延迟请求越过切换结果（`:23`）。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：2 个对象。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentSendBindingResult` | 类型 | `:3` | `{ok:true} \| {ok:false; code; message}` | 稳定错误码 |
| `validateAgentSendBinding` | 函数 | `:11` | `(input, session, workspaceExists, channel): AgentSendBindingResult` | 七级校验 |

## 3. 内部逻辑与关键流程

七级分支（`:17-45`）：①session 缺→`AGENT_SESSION_NOT_FOUND`；②`session.workspaceId !== input.workspaceId`→`AGENT_SESSION_WORKSPACE_MISMATCH`（`:20-22`）；③`input.agentRuntime` 与 `normalizeAgentRuntime(session.agentRuntime)` 不符→`AGENT_SESSION_RUNTIME_MISMATCH`（`:24-26`）；④有 workspaceId 且 workspace 不存在→`AGENT_WORKSPACE_NOT_FOUND`（`:27-29`）；⑤渠道缺→`AGENT_CHANNEL_NOT_FOUND`；⑥渠道停用→`AGENT_CHANNEL_DISABLED`（`:30-35`）；⑦modelId 存在时：不属于渠道→`AGENT_MODEL_NOT_IN_CHANNEL`、停用→`AGENT_MODEL_DISABLED`（`:36-44`）；全过→`{ok:true}`。

## 4. 调用者与调用链

- 入向：`agent-send-coordinator.ts:2`（本批）；测试 `agent-send-binding.test.ts` 6 用例。
- 出向：`@profer/shared` `normalizeAgentRuntime`（`:1`，域外）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯判定）。

## 6. 分支、失败、取消与恢复

七级错误码（§3）；无取消/恢复路径（纯校验）。

## 7. 权限与权威状态

归属权威=持久化 `AgentSessionMeta`（入参 session）；渠道/模型权威=Channel 配置；runtime 归属=会话元数据（防延迟请求越权）。

## 8. 修改影响面

SEND_MESSAGE 入口唯一校验；错误码被 coordinator/前端锁定（6 测试断言）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-send-binding.test.ts`（49 行/**6 个 `test(`**）：session 缺→AGENT_SESSION_NOT_FOUND（`:17-19`）；workspace 不匹配/已删除双码（`:21-24`）；渠道缺/停用双码（`:26-29`）；历史渠道不同但请求渠道启用→`{ok:true}` 保留切换（`:31-33`）；runtime 已切换旧请求拒绝+新请求通过（`:35-41`）；model 不属于渠道/停用双码（`:43-48`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 七级校验/错误码语义 | 已证实 | `:1-46` 全文 + 6 测试互证 |
| `normalizeAgentRuntime` 归一语义 | 边界 | shared 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+七级分支 | §2/§3 | 3-45 | covered |
| 测试 6 用例 | §9 | test 文件 | covered（NOT_RUN） |
