---
path: packages/shared/src/types/agent-provider.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1ecc011dc3a50857fa7d378aab6c3bb69f5fade0
sha256: 783b37097cccdd570219e7aa5154db7150c63797435fad786a9270f2acf8ca7b
lines: 157
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/agent-provider.ts

## 1. 结论与边界

Agent Provider **适配器接口层**（`packages/shared/src/types/agent-provider.ts:1-7`）：Profer 自有 Agent 接口，使底层 SDK 可替换。当前实现 ClaudeAgentAdapter（历史）/Pi；`AgentRuntime` 现仅 `'pi'`（`:12`，Claude runtime 已移除，`:32`）。

## 2. 导出与关键符号

`export` 共 **10 个**（2 type/const + 2 函数 + 6 interface）。

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `AgentRuntime` | `:12` | `'pi'` 单值 |
| `AgentRuntimeCapabilities` | `:18-30` | 9 能力布尔快照（只读产品契约，`:15-17` 注释：未实现必须 false、禁止用 UI 成功伪装跨 runtime 等价） |
| `DEFAULT_AGENT_RUNTIME` | `:33` | `'pi'` |
| `isAgentRuntime` | `:36-38` | 严格校验（`=== 'pi'`） |
| `normalizeAgentRuntime` | `:41-43` | 历史/未知值归一化为 Pi |
| `SDKUserMessageInput` | `:46-53` | 队列消息注入结构 |
| `SendQueuedMessageOptions` | `:56-63` | `{interrupt?, skillMentions?, onAccepted?}` |
| `AgentQueryInput` | `:71-94` | Provider 无关查询输入（含 Goal 隔离 `isolatedRuntimeSession`/`runtimeSessionId`/回调） |
| `AgentErrorHelpers` | `:102-113` | 4 错误辅助（`friendlyErrorMessage`/`isPromptTooLongError`/`isThinkingSignatureError`/`mapSDKErrorToTypedError`） |

## 3. 内部逻辑与关键流程

仅 2 个纯函数（`:36-43`）：严格校验与归一化。其余为类型合同。`AgentQueryInput.agentRuntime` 注释（`:78`）称「持久化缺省值由调用方归一化为 Claude」——**与 `normalizeAgentRuntime` 归一化为 Pi 不一致**（注释滞后于 Claude 移除，见第 10 节）。

## 4. 调用者与调用链

- 消费方：Agent runtime/Manager（能力快照、查询输入）、Pi adapter（实现接口）。
- 出向：`./agent`（`GetTaskOutputResult`/`SDKMessage`/`TypedError`）。

## 5. 数据 I/O、读写与副作用

纯类型 + 2 纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

`isAgentRuntime` 单分支；`normalizeAgentRuntime` 兜底 `DEFAULT_AGENT_RUNTIME`。无抛错。

## 7. 权限与权威状态

能力快照是**产品契约**（`:15-17`）：不代表 renderer 可绕过主进程权限；`runtimeSupportsSubagents` 只表示理论能力（`:28-29`）。

## 8. 修改影响面

- `AgentRuntime` 扩展（如加回 Pi 之外）需同步 `isAgentRuntime`/`normalizeAgentRuntime`/能力表。
- `AgentErrorHelpers` 是各 adapter 的错误映射合同。

## 9. 测试证据

- `agent-provider.test.ts`（22 行）直接覆盖（见该测试手册）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 个导出 | 已证实 | 全文 |
| AgentRuntime 仅 'pi' | 已证实 | `:12`、`:33`、`:36-38` |
| 能力快照契约语义 | 已证实 | `:15-30` |
| `:78` 注释「归一化为 Claude」与实现（Pi）不一致 | 已证实（注释滞后） | `:41-43` vs `:78` |
| adapter 实现行为 | 未知 | 不在本批 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 个导出 | 2 | — | covered |
| 归一化函数 | 3、6 | `:36-43` | covered |
| 权限契约 | 7 | `:15-30` | covered |
| 测试证据 | 9 | — | covered |
