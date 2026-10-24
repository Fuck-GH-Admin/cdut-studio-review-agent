---
path: apps/electron/src/main/lib/bridge-command-handler.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e4efa00a9423f3559ff2af75412c9cced4d801d
sha256: 97f250129eb622d6c2f85201c8ea14c3a777799c230d9154fe9e5c5b8a127fa6
lines: 780
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/bridge-command-handler.ts

## 1. 结论与边界

**通用 Bridge 命令处理器**（`bridge-command-handler.ts:1-8` 注释）：为微信/钉钉等平台统一斜杠命令与 Agent 消息路由；平台经 `BridgePlatformAdapter` 接入（只实现 sendText）。**飞书 Bridge 用独立卡片格式，不接入本模块**（`:7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BridgePlatformAdapter` | interface（export） | `:34-37` | `sendText(chatId, text, meta?)` |
| `BridgeAttachment` | interface（export） | `:40-47` | 已落盘附件引用（absolutePath/label/kind） |
| `BridgeCommandHandlerConfig` | interface（export） | `:50-59` | platformName/adapter/getDefaultWorkspaceId?/onWorkspaceSwitched? |
| `BridgeChatBinding` | interface（export） | `:62-68` | chatId→sessionId/workspaceId/channelId/modelId? |
| `BridgeCommandHandler` | class（export） | `:93-780` | 命令处理+Agent 路由（§3） |

内部：`SessionBuffer`（`:71-76`）、`ContentBlock`/`AssistantMessagePayload`（`:79-89`）；类态：chatBindings/sessionToChat/sessionBuffers/eventBusUnsubscribe（`:98-104`）。

## 3. 内部逻辑与关键流程

### 3.1 入口与绑定

`handleIncomingMessage`（`:114-126`）：`/` 开头走命令（**命令不携带附件** `:121`），否则 `handleUserMessage`。`ensureBinding`（`:133-161`）：已有绑定复用；**无 Agent 渠道→null**（`:139`）；建会话+双向索引+`notifySessionCreated`（webContents 通知渲染层 `:774-779`）。

### 3.2 斜杠命令（`:199-250`，9 命令+简写）

`/help`（`:254-268`）、`/new`（`:270-307`，需渠道否则提示；旧绑定清理 `:288-291`）、`/list`（`:309-358`，**isVisibleAgentSession 过滤**、按工作区分组每组 ≤5、孤儿会话单列、当前标记）、`/stop`（`:360-368`）、`/switch`（`:370-402`，序号或 ID 前缀匹配 `:375-378`）、`/workspace`（`:404-470`，序号/名称/slug 匹配、切换后**清绑定需新会话** `:440-444`、`onWorkspaceSwitched` 持久化 `:447`、列最近 5 会话）、`/now`（`:472-552`，会话/模型（binding>设置同序 `:480-485`，失效标注）/工作区/MCP/Skills/工作区与会话文件树，异常忽略）、`/model`（`:560-641`，三段：列渠道/列模型/切换 per-chat；切换需 binding 承载、无则自动建 `:623-631`；**提示重启后恢复默认** `:638`）。default→未知命令提示（`:248`）。

### 3.3 Agent 消息路由（`:645-728`）

`handleUserMessage`：无渠道→提示（`:653-656`）；自动建绑定（`:661-668`）；**并发保护**：会话运行中直接拒绝且不触碰 buffer（`:670-674`）；即时确认（`:676-681`）；初始化 buffer（`:684-689`）；渠道/模型 **binding 优先于全局设置**（`:691-694`）；附件→`buildAttachedFilesBlock`+`resolveAgentAttachmentPrompt`（`:696-704`）；`runAgentHeadless`（**permissionModeOverride:'bypassPermissions'** `:712`；onError 发错误并清 buffer `:716-720`；complete 由 EventBus 处理 `:721-723`）。

### 3.4 EventBus 缓冲（`:732-766`）

`handleAgentPayload`：sdk_message 的 assistant text 块累加 buffer（`:740-747`）；`result` → `handleSessionComplete`（`:750-752`）；完成时发整段回复（空则"已完成（无文本输出）" `:761`）+清 buffer（`:756-766`）。

## 4. 调用者与调用链

- 入向：微信/钉钉 Bridge（跨文件）。
- 出向：`./agent-session-manager`/`./agent-workspace-manager`/`./agent-service`（runAgentHeadless/agentEventBus/stopAgent/isAgentSessionActive）/`./settings-service`/`./config-paths`/`./bridge-attachment-utils`/`./bridge-model-utils`、`@profer/shared`（AGENT_IPC_CHANNELS/isVisibleAgentSession/resolveAgentAttachmentPrompt）、electron（BrowserWindow）。

## 5. 数据 I/O、读写与副作用

副作用：会话创建/Agent 运行/停止、webContents.send（TITLE_UPDATED）、adapter.sendText、console。内存态：三 Map。

## 6. 分支、失败、取消与恢复

失败路径均以 send 文本反馈；`runAgentHeadless` 捕获异常记日志（`:725-727`）；停止=stopAgent；会话运行中拒绝新消息（`:671`）。unsubscribe 清订阅与 buffers（`:179-183`）。

## 7. 权限与权威状态

红线：命令不带附件（`:121`）、并发拒绝不触碰 buffer（`:670`）、binding 优先（`:691`）；**`bypassPermissions`**（`:712`）为 IM 远程场景的显式权限模式覆盖（照实记录，调用方语义未读）。isVisibleAgentSession 过滤隐藏会话（`:310`）。

## 8. 修改影响面

改命令/路由 → 微信/钉钉 Bridge 全部交互；改 EventBus 缓冲 → Agent 回复完整性。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `BridgeCommandHandler|handleIncomingMessage` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+类全链（9 命令+路由+缓冲） | 已证实 | 逐行读 `:1-780` |
| bypassPermissions 的产品语义 | 未知 | 设计方未读 |
| 平台 adapter 实现 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+类态 | §2 | `:34-104` | covered |
| 命令 9 命令 | §3.2 | `:199-641` | covered |
| Agent 路由+缓冲 | §3.3-3.4 | `:645-766` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
