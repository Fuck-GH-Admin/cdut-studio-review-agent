---
path: apps/electron/src/main/lib/agent-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 504af48b54eab9c8817f5e1390821fd688aabff3
sha256: b95ba3366b750539ad63803a67e7f684d9a2353eac64f0c5fc58a228c850b8c8
lines: 776
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-service.ts

## 1. 结论与边界

**Agent 服务层（IPC 薄层）**：创建 Orchestrator/EventBus/Adapter、注册 EventBus IPC 转发中间件、导出 IPC 薄包装、文件操作（`agent-service.ts:1-11`）。业务逻辑全在 Orchestrator（域外）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| 模块实例 | `:49-57` | eventBus（配置投影发布器 `:50`）、`agentCatalogInvalidationPublisher`（`:53`）、PiAgentAdapter、AgentOrchestrator、`setAgentSessionActiveChecker`（`:56`）、runtimeContextStore |
| `agentEventBus`（再导出） | `:60` | 供飞书 Bridge 订阅 |
| `listActiveAgentRuntimeContexts` | `:66` | Pocket 重连水合；run_idle 即清（`:63-65`） |
| `registerWebContents`/`unregisterWebContents` | `:112,130` | sessionId→webContents 映射；destroyed 兜底清理（`:108-124`，WeakSet 防 MaxListeners `:99-104`） |
| `restoreActiveAgentStreams` | `:138` | 刷新重连回放 backlog（含 run_complete/run_error 补发，`:150-154`） |
| `getMainRendererWebContents` | `:169` | 主窗口查找（排除 detached-preview/science-agent，`:161-167`） |
| `emitSessionStreamEvent` | `:234` | 统一事件出口（bus+兜底直发去重，`:221-233` 注释） |
| `runAgent` | `:277` | 桌面运行入口（见 §3） |
| `runAgentHeadless` | `:404` | 无渲染运行（飞书 Bridge）；`setHeadlessAgentRunner` 注册同链路（`:530`） |
| `generateAgentTitle`/`regenerateAgentTitle` | `:535,544` | 标题生成（regenerate 回退会话元数据选择，`:551-552`） |
| `stopAgent`/`stopAgentAndWait`/`stopAllAgents`/`isAgentSessionActive` | `:566,587,628,623` | 停止族 |
| `getAgentRuntimeCapabilities`/`getAgentTaskOutput`/`stopAgentTask` | `:570,574,578` | 后台任务（Pi 无 Task API 时 adapter 明确拒绝，`:579-582`） |
| `isGoalRunActive`/`stopGoalRunAndWait` | `:592,597` | Goal 锁 |
| `beginAgentSessionDeletion`/`endAgentSessionDeletion` | `:602,606` | 删除锁 |
| `rewindAgentSession` | `:613` | 快照回退 |
| `updateAgentPermissionMode` | `:642` | 运行中热切换（Profer+SDK 双侧，`:640`） |
| `queueAgentMessage` | `:653` | 流式追加（'now' 优先级） |
| `saveFilesToAgentSession`/`saveFilesToWorkspaceFiles` | `:677,730` | 文件写入（见 §3） |
| `killOrphanedClaudeSubprocesses` | `:633` | **空实现**（运行时已统一 Pi，保留旧导出名防崩，`:632-635`） |

## 3. 内部逻辑与关键流程

- **runAgent**（`:277-396`）：注册 webContents→**非活跃才清空恢复记录**（防并发拒绝误清，`:285-289`）→ 清 `completedButUnconfirmed`（`:290-293`）→ orchestrator.sendMessage 四回调（onRunOwned 观察者异常隔离 `:300-304`、onError/onComplete/onTitleUpdated 双发 bus+直发（sendOrdinarySessionDirect 审核围栏 `:265-268`）、onRunStarted **draft 晋升**+goal external_run_started（`:342-358`））→ catch：`AgentRunAlreadyActiveError` 直接 rethrow 不广播假终态（`:362-367`）；其余错误广播 run_error+run_complete（`:368-384`）→ finally 仅 orchestrator 已完成时清理映射+backlog 转存（`:385-395`）。
- **EventBus 三中间件**（`:178-217`）：context_window/run_idle 记 runtimeContextStore（`:178-187`）；backlog 记录先于 IPC 转发（`:189-196`）；IPC 转发（审核会话不转发、投影/失效类广播全部窗口，`:198-217`）。
- **saveFilesToAgentSession/…WorkspaceFiles**（`:677-776`）：文件名 `basename` 净化防路径穿越（`:683-687`）；同名防覆盖递增计数（`:690-702`）；>100MB（`MAX_ATTACHMENT_SIZE`）跳过（base64 估算 `data.length*0.75`，`:707-712`；工作区版直接量 buffer，`:764-767`）。

## 4. 调用者与调用链

- 入向：`ipc.ts`（nb-05 批已读：SEND_MESSAGE/GENERATE_TITLE/SAVE_FILES 等 20+ 通道）、`remote-service`/飞书 Bridge（headless）、协作层（`setHeadlessAgentRunner` `:530`）。
- 出向：agent-orchestrator（域外）、agent-session-manager（本批）、ui-projection-publisher（本批）、p0-guards（nb-49 批）、config-paths 等。

## 5. 数据 I/O、读写与副作用

写文件（session 工作目录/workspace-files，writeFileSync）；事件总线+webContents.send；runtimeContextStore 内存。文件写入为唯一磁盘副作用。

## 6. 分支、失败、取消与恢复

- 并发：`AgentRunAlreadyActiveError` 不破坏 owner run（`:362-367,497-498`）。
- 恢复：backlog 回放（restoreActiveAgentStreams，含终态补发）；completedBacklog TTL 60s（`:84-96`）。
- 取消：stopAgent 族委托 orchestrator。

## 7. 权限与权威状态

审核会话围栏：`sendOrdinarySessionDirect`/中间件均过 `isReviewOwnedOrDeletedAgentSessionId`（`:199-204,265-268`）；文件写入路径净化防穿越；运行占用权威=orchestrator。

## 8. 修改影响面

IPC 全链（桌面/远程/headless）；与 orchestrator/session-manager/publisher 联动；backlog/映射清理时序被 p06/p0 相关测试间接锁定。

## 9. 测试证据

`NOT_RUN`。直接测试：无专属测试文件（检索 nb-51 本批 10 测试文件不含本文件）；间接：`agent-orchestrator-permission-wiring.p06.test.ts`（nb-49 批）走真实 service 链路（编排层）；文件写入函数无断言（缺口如实）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §2/§3 全语义（并发不破坏 owner/回放/围栏/净化） | 已证实 | `:1-776` 逐行两段 |
| 无直接测试（本批检索） | 已证实（否定结论） | nb-51 测试文件名 grep |
| orchestrator 语义 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 22+ 导出 | §2 | 49-776 | covered |
| runAgent/中间件/文件写入流程 | §3 | 178-776 | covered |
