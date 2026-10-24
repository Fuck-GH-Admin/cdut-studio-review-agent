---
path: apps/electron/src/main/lib/remote-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 671b012057d79739bd9fdb2e93a7faa370959645
sha256: 5c93c9ddb2477311e32eeafbdb7046e72d4b3ac1194e8151ab9c9265ffb2c90b
lines: 2156
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service.ts

## 1. 结论与边界

**Profer Remote Service——移动端（Pocket）远程接入服务**（`remote-service.ts:1-23`）：为手机/平板提供独立 HTTP+WS 通道传输 Agent 工作过程与用户输入（**不传图像** `:6`）。五设计要点：绑定回环+局域网 IP 访问（`:9`）、token 鉴权（`:10`）、唯一 agentEventBus 订阅广播（**对桌面零侵入** `:11-12`）、指令集（`:13`）、**显式开关才启动**（PROFER_REMOTE=1 或 pocketModeEnabled，默认不启动保桌面零变化 `:14-15`）。**不含静态 UI**（tablet 线 2026-09-11 退役，仅 /health 与 /ws `:17-18`）。Chat 引擎已删除（`removedChatEngine` 占位抛错 `:101-109`，随"第3刀"整模块待删）。

## 2. 导出与关键符号（20 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT_REMOTE_PORT=7788`/`DEV_DEFAULT_REMOTE_PORT=7789` | const | `:119/:122` | 正式/开发端口（避免并存 EADDRINUSE `:121`） |
| `mayPublishAgentEventToRemote` | function（export） | `:206-244` | **远程披露边界**（§3.1） |
| `selectOrdinaryRemoteReplayRecords` | function（export） | `:247-249` | 重放/发送时**复查 owner 可见性**（排队期间可能被删 `:246`） |
| `validateExpectedRevision` | function（export） | `:626-642` | 乐观并发校验（REVISION_CONFLICT `:638`） |
| `validateWorkspaceHeatmapRequest` | function（export） | `:644-647` | workspaceId 校验 |
| `DEFAULT_EXPLORATION_SOURCE_LABEL`/`EXPLORATION_SOURCE_LABEL_MAX_LENGTH=120` | const | `:650-652` | 探索来源标签 |
| `normalizeExplorationSourceLabel` | function（export） | `:660-667` | 归一化（非串→缺省/空白折叠/截断 120，防超长随 session_updated 放大 `:657-658`） |
| `buildSessionItem` | function（export） | `:675-702` | 会话脱敏投影（**完整字段契约** `:669-673`；探索血缘三字段下沉、内部守卫不下发 `:687-689`） |
| `handleRemoteRelayCommand`/`handleRemoteCommand` | function（export） | `:788-1866` | 命令入口（§3.3；Relay 不继承旧连接 fallback `:784-787`） |
| `isRemoteEnabled`/`getRemoteServiceStatus`/`setRemoteServiceEnabled`/`getDefaultPort`/`restartRemoteService` | function（export） | `:457-540` | 状态/开关/端口热更（token 仅监听后返回 `:488`） |
| `startRemoteService`/`stopRemoteService` | function（export） | `:1875-2156` | 生命周期（§3.5） |

内部要点：token 加载/旧位置迁移（`:415-454`，迁移防换目录重新生成 `:428-429`）；`checkToken`（query 或 x-profer-token 头 `:543-550`）；`RemoteAgentEventLog` 单例+serverInstanceId（重启清 cursor 走快照 `:145-147`）；replay 闸门（WeakMap 状态+5s 握手超时兼容旧 Pocket `:149-158/:1933-1936`）；**send_message 幂等表**（clientMessageId 10min/512 条 `:169-176`）；WS 闲置踢人（90s/扫 30s `:178-181`）；partial 合并窗 60ms（`:183-192`，final 先取消 pending 防旧 partial 覆盖 `:367-368`）；删除协调器（`:166-167`）。

## 3. 内部逻辑与关键流程

### 3.1 披露边界（`:200-249`）

`mayPublishAgentEventToRemote`：review 隐藏流**永不入重放日志**（`:200`）；**只检 ID 形态元数据字段不碰聊天正文**（`:204/:212`）；深度>32 或对象>12000 **fail closed**（**:220-222，修过 depth>12 静默放行的缺陷**）；`session` 结构化引用同查（`:232-238`）。

### 3.2 事件广播（`:251-387`）

`broadcastAgentFrame`：**先过滤再入日志**（重放日志是持久披露面 `:253-254`）；relay sink 发送前**再查边界**（`:262-264`）；replaying 客户端入队（溢出 2500 断开 1013 `:270-272`）。`replayAgentEvents`（`:320-362`）：**旧记录可能先于删除产生，不信 append 时鉴权**（`:340-341`）；窗口不完整→不发半段（requiresSnapshot `:342-347`）；去重合并 queued live。

### 3.3 命令面（`:817-1865`，~50 命令）

**安全前置**：review 会话 ID 命名即拒（**:806-809 默认拒绝**）；旧 Pocket 无 sessionId 的文件读取只在同 token 连接内 fallback（`:811-816`）。分组：
- 会话：list_sessions/get_agent_runtime_contexts（**active 二次过滤防残留快照** `:832-838`）/delete_session（协调器+stopAndWait 成功前不清持久化、与桌面同语义 `:842-865`）/create/rename/regenerate_session_title/mark_unread/read/fork_session/**create_exploration_session**（独立命令防隐式开关 `:1412-1414`；失败回滚不留半成品 `:1415`）/rewind_session/toggle_pin（置顶自动取消归档 `:1457`）/toggle_archive/move_session_to_workspace（运行中拒，**500ms 后二次确认** `:1480-1482`）。
- 模型/权限：update_session_model（运行中拒/内核兼容校验 `:1072/:1078`）/update_session_runtime/update_permission_mode（**远程显式 bypass 同样授予 CSLab 信任、切回撤销** `:1110-1115`；运行中更新失败回滚 meta+信任 `:1118-1126`）/update_session_thinking_level/agent_effort（白名单校验+运行中拒 `:1499-1504/:1514-1519`）。
- 交互：get_pending_interactions（**filterOrdinaryPendingRequests** 过滤 review 挂起 `:916-918`）/respond_permission/ask_user/exit_plan_mode（**远程"完全自动"=显式授权授予 CSLab 信任** `:961-966`）。
- 消息：send_message（**uuid/startedAt 逐字透传** `:1343-1347`；clientMessageId 幂等 `:1350`；onError 暂存并入 run_completed.resultErrors（此前零日志零提示 `:1366-1367`）；onComplete 广播 run_completed 含 endReason `:1371-1387`）/queue_message（**mentionedSessionIds 含 review ID 即拒** `:1531-1535`）/stop_agent/get_sdk_messages（分页或原始数组 `:977-989`）/session_detail。
- 检索/文件：search_workspace_files（**不接受客户端 roots**，服务端推导+denyPath review 栅栏 `:1027-1061`）/get_pi_reasoning_capability（**必须 await 防 Promise 序列化 {}** `:1022-1024`）/get_workspace_heatmap_daily/upload_attachment（basename sanitize+10MB `:1228/:1233`）/resolve_and_read_file+read_file_as_data_url（**token 可能泄露故权限严格绑会话；candidateBasePaths 绝不采纳** `:1808-1814`；legacy access.sessionId 同过 owner 闸 `:1822-1823`；roots=会话工作目录+工作区+附加，denyPath review 私有 `:1831-1848`）。
- Chat（遗留）：list/create_conversation、消息 CRUD、chat_* 系列（**chat_send_message 走 removedChatEngine 运行时抛** `:104-109/:1664`）、chat_attachment（**只按附件操作授权，绝不授权整个 configDir** `:1792-1794`）。
- 预设：list/get_default/set_default/update_session_preset（未知 ID 报错不静默回退 `:1171-1174`）/create/copy/update/delete。

### 3.4 WS 生命周期（`:1875-2123`）

`/health` 200 + 其余 HTTP 404（`:1888-1899`）；WS 鉴权 4001（`:1920-1922`）；每连接 replay 闸门+5s 兼容超时（`:1927-1937`）；ping→pong 帧（**不走 command_result 防污染 FIFO** `:1956-1957`）；`_cmdId`/`requestId` 兼容（`:1947-1948`）；hello 握手带 serverInstanceId+事件边界（`:1987-1993`）。bus 订阅：run_complete/run_error **不下发**（移动端有 run_completed，防未知 kind 与重复终态 `:1998-2001`）。**Relay 仅 PROFER_REMOTE_RELAY=1 显式开启**（`:2018-2066`；resume 一律 requiresSnapshot 防跨连接 cursor 污染 `:2044-2053`；多 viewer 不共享 legacy activeSessionId `:2057-2058`）。监听 HOST 可覆盖（默认 0.0.0.0 `:2068-2070`）；EADDRINUSE 不冒泡成主进程异常（清理全链 `:2071-2092`）。

### 3.5 停止（`:2126-2156`）

全资源清理+**eventLog.clear()+serverInstanceId 换新**（客户端清 cursor `:2150-2151`）。

## 4. 调用者与调用链

- 入向：Electron 主进程启动/设置页开关（跨文件）；测试 5 文件（同批 31 用例）。
- 出向：agent-service/agent-session-manager/agent-workspace-manager/agent-preset-manager/conversation-manager（均跨批）、`./remote-file-access`/`remote-workspace-file-search`/`remote-agent-event-log`/`remote-relay-client`/`chat-stream-bus`/`cslab-tool-trust`（同批）、`@profer/shared`、electron/ws/node:http。

## 5. 数据 I/O、读写与副作用

token 持久化（remote-token.json+迁移）；附件上传写盘；WS/HTTP 服务；事件广播；console。

## 6. 分支、失败、取消与恢复

命令错误结构化 `CommandResult`（REVISION_CONFLICT 码 `:624`）；启动失败清理+remoteError（`:2071-2092`）；弱网幂等/闲置踢人/replay 重放均为恢复语义。不适用取消。

## 7. 权限与权威状态

**远程安全权威**：token 鉴权、review 默认拒绝、文件授权严格绑会话+denyPath、客户端 roots 永不采纳、附件只按附件授权、CSLab 信任仅显式 bypass 授予——各红线行号见 §2/§3。

## 8. 修改影响面

改命令面 → Pocket 全部交互；改披露边界 → review 隐私泄露面；改生命周期 → 长连接可靠性。

## 9. 测试证据

**直接测试 5 文件（同批 31 用例，NOT_RUN）**：commands 7（校验/可达/兼容）、exploration-session 11（血缘/标签/命令）、send-message 3（uuid/startedAt 透传）、workspace-file-search 2（成功链+防泄露）、heatmap 1（校验）。未覆盖：文件预览授权链、生命周期、relay。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 导出+~50 命令+披露边界+生命周期 | 已证实 | 逐行读 `:1-2156` |
| 测试 31 用例断言 | 已证实 | 同批测试文件；NOT_RUN |
| 真实双端交互 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 20 导出 | §2 | `:119-2156` | covered |
| 披露/广播/命令/生命周期 | §3 | `:200-2156` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
