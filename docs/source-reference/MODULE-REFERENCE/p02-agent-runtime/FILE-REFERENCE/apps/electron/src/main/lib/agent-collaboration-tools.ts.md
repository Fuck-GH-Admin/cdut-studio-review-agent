---
path: apps/electron/src/main/lib/agent-collaboration-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a76a9c75234c135c3703d04f873573dc35af4c3
sha256: 8f1baf640fbc742aa7ea4c14eb403ea350bef5bc603c11977674f13b1c1f8aaa
lines: 1321
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-collaboration-tools.ts

## 1. 结论与边界

本文件是「Profer 协作子会话」的主进程工具层：向 Pi SDK MCP Server 注册 10 个 `mcp__collaboration__*` 工具（`agent-collaboration-tools.ts:984-1321`），受控创建真实 Agent 子会话、等待、读结果、停止、代答阻塞问题、追加后续指令；并实现子会话阻塞事件追踪（`ask_user`/`permission` → `delegation_blocked`）与「全部子会话结束后父会话自动续跑」（auto-continuation）。运行时模块，状态全部在进程内存（`delegations` :97、`blockedEvents` :128、锁与消费集合 :103-104），不直接读写磁盘。

边界（不做的事）：
- 不决定「何时协作」（文件头注释 :5 明示由 Skill 判断）；不做子会话运行本体（委托 `apps/electron/src/main/lib/agent-headless-runner-registry.ts` 的 `runRegisteredHeadlessAgent`/`stopRegisteredAgent`，:28-30/:886/:752）。
- 不直接读写会话元数据 JSON；创建/更新经 `apps/electron/src/main/lib/agent-session-manager.ts`（`createAgentSession` :552、`updateAgentSessionMeta` :1408、`listAgentSessions` :447、`getAgentSessionSDKMessages` :1295）。
- 不实现 AskUser/权限应答本体：answer 工具内动态导入 `./agent-ask-user-service`（:1222）与 `./agent-permission-service`（:1236）。
- 不做模型启停管理（校验委托 `apps/electron/src/main/lib/agent-model-selection.ts` :24/:54）。
- 本文件无 IPC handler、无 sender/role 检查；权限边界见 §7。

## 2. 导出与关键符号

导出 4 条（`export` 逐条核对 :133/:313/:768/:984）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `registerCollaborationEventBus` | function（export） | `:133-223` | `(eventBus: AgentEventBus) => void` | 幂等注册阻塞事件监听（:134 二次调用直接 return） |
| `hasRunningDelegations` | function（export） | `:313-315` | `(parentSessionId: string) => boolean` | 只读内存委派记录（注释 :307-312 明示不看落盘 `running`） |
| `stopDelegationsForParent` | function（export） | `:768-785` | `(parentSessionId: string) => number` | 级联停止，返回实际停止数 |
| `buildPiCollaborationTools` | function（export） | `:984-1321` | `(sdk, ctx: CollaborationToolContext) => unknown[]` | 返回 10 个 `sdk.defineTool` 工具 |

关键内部符号（内部）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `CollaborationToolContext` | `:52-60` | sessionId/channelId/modelId?/workspaceId?/agentRuntime?/permissionMode?/triggeredBy? |
| `DelegationRecord` | `:69-88` | 委派内存记录；含 `completion: Promise<void>` + `resolveCompletion`（:86-87） |
| `BlockedEvent` | `:109-126` | 阻塞事件（`ask_user`/`permission`），含 requestId、问题快照、`resolved` |
| 常量 | `:91-95` | `MAX_WAIT_SECONDS=7200`、`DEFAULT_WAIT_SECONDS=1800`、`RESULT_SUMMARY_CHAR_LIMIT=12000`、`DELEGATION_GOAL_CHAR_LIMIT=1000`、`MAX_RETAINED_FINISHED_DELEGATIONS=200` |
| 常量 | `:105` | `AUTO_CONTINUATION_SUMMARY_LIMIT=24000` |
| `delegations`/`blockedEvents` | `:97`/`:128` | 模块级 Map（内存权威状态） |
| `isDelegationParent` | `:226-231` | 内存记录或 `listAgentSessions(true)` 中有 `parentSessionId` 匹配 |
| `getPendingBlockedEvents`/`getBlockedEventById` | `:233-235`/`:237-239` | 未解决阻塞事件查询 |
| `pruneFinishedDelegations` | `:241-252` | 已完成记录超额（>200）按 `completedAt` 升序淘汰，同时清 `autoContinuedDelegationIds` |
| `jsonResult` | `:254-263` | **无调用者**（全文件检索仅定义；工具返回用嵌套 `piJsonResult` :1007） |
| `normalizeTitle`/`truncateText`/`assertNonBlank` | `:265-269`/`:271-275`/`:277-283` | 标题 80 字截断、文本截断附注、非空校验（抛 `${field} 不能为空`） |
| `getRunningDelegationCount` | `:301-305` | 按父会话统计 `status==='running'` |
| `createDelegationCompletion` | `:317-323` | Promise + resolve 句柄 |
| `assertCanCreateDelegation` | `:325-349` | 创建前守卫（详见 §6） |
| `extractTextFromSdkMessage` | `:351-370` | 从 SDK `assistant` 消息 content 抽 text 块 |
| `summarizeChildResult` | `:372-387` | 先取最后一条非空 assistant `AgentMessage`，否则拼 SDK 文本，兜底提示语 |
| `markDelegationFinished` | `:389-411` | 终态收尾（幂等，详见 §3） |
| `buildParentAutoContinuationPrompt` | `:413-425` | 拼续跑提示词（各委派结果摘要） |
| `scheduleParentAutoContinuation` | `:428-490` | 自动续跑调度（详见 §3） |
| `getDelegationSummary` | `:492-511` | 摘要含 `pendingBlockedEvents`（:509） |
| `listKnownDelegations` | `:513-538` | 内存 + 持久化回退合并 |
| `getDelegationResult` | `:540-573` | 内存优先，回退持久化会话（详见 §6） |
| `findPersistedDelegationSessions`/`getPersistedDelegationSession` | `:575-578`/`:580-592` | 按 `sourceDelegationId` 找子会话；唯一且父匹配才回退（:585-591） |
| `recoverDelegationRecordFromSession` | `:594-620` | 恢复记录；**仅非 running 时写回 `delegations`**（:615-618） |
| `getDelegationRecordForContinuation` | `:622-637` | 内存/恢复取记录，校验父归属 |
| `resolveWaitTargets` | `:644-659` | 分流 live 记录与已落定结果 |
| `getFinishedDelegationCount`/`waitForLiveRecords` | `:661-663`/`:665-696` | `Promise.race`(completion 链 vs setTimeout)，finally 清定时器（:693-695） |
| `getCurrentParentPermissionMode` | `:698-704` | **无调用者**（全文件检索仅定义） |
| `getAvailableAgentModels` | `:706-730` | 组装模型清单（含 `currentModelAvailable`） |
| `stopDelegation` | `:732-758` | 单个停止（详见 §6） |
| `startDelegation` | `:787-926` | 委派主流程（详见 §3） |
| `buildCollaborationSchemas` | `:928-982` | Zod 工具 schema 构建器，**无调用者**（全冻结树 `*.ts` 检索仅定义行） |
| `piJsonResult` | `:1007-1012` | 嵌套于 `buildPiCollaborationTools` 的返回包装（`content`+`details`） |

10 个工具（名称→定义行→execute 行段）：

| 工具名 | 定义 | execute |
| --- | --- | --- |
| `mcp__collaboration__list_available_agent_models` | `:1015-1023` | `:1020-1022` |
| `mcp__collaboration__delegate_agent` | `:1024-1048` | `:1036-1047` |
| `mcp__collaboration__delegate_agents` | `:1049-1099` | `:1057-1098` |
| `mcp__collaboration__wait_for_delegations` | `:1100-1139` | `:1110-1138` |
| `mcp__collaboration__list_delegations` | `:1140-1159` | `:1147-1158` |
| `mcp__collaboration__get_delegation_results` | `:1160-1173` | `:1167-1172` |
| `mcp__collaboration__stop_delegation` | `:1174-1185` | `:1181-1184` |
| `mcp__collaboration__stop_delegations` | `:1186-1199` | `:1193-1198` |
| `mcp__collaboration__answer_delegation_question` | `:1200-1251` | `:1210-1250` |
| `mcp__collaboration__continue_delegation` | `:1252-1319` | `:1260-1318` |

## 3. 内部逻辑与关键流程

### 3.1 `startDelegation`（:787-926，真实执行顺序）

1. `assertNonBlank(args.task)`（:792，空抛 `task 不能为空` :280）；`delegationId = randomUUID()`（:793）；`role` 默认 `'custom'`（:794）；标题截 80（:795）；goal 截 1000（:796）。
2. 运行时继承：`inheritedRuntime = parent?.agentRuntime ?? ctx.agentRuntime ?? 'pi'`（:798；注释 :797 称「回退 Claude」与代码 `'pi'` 不一致，见 §10）。
3. 模型：显式 `args.modelId` 过 `assertEnabledModelForChannel`（:799-805，校验不过由其抛错），否则继承 `ctx.modelId`（:806）。
4. 工作区权威：`workspaceId = parent?.workspaceId ?? ctx.workspaceId`（:812）；`getAgentWorkspace(workspaceId)?.slug` 缺失抛 `父会话工作区不存在`（:813-816）。
5. 预设：`resolveDelegationPreset({parent, target: args.presetReference, workspaceSlug})`（:819-823，跨工作区等校验失败在此抛错）；`permissionMode = resolveDelegationPermissionMode()`（:824，恒 `bypassPermissions`）。
6. 校验全部通过后才晋升 draft 父会话（:828-830 `updateAgentSessionMeta(parent.id, {draft:false})`）——注释 :818/:826-827 明示顺序意图。
7. `createAgentSession(title, channelId, workspaceId, modelId, runtime, false, undefined)`（:831-840，预设先不写）；随后 `updateAgentSessionMeta(child.id, {...})`（:843-856）写入 `parentSessionId`（=ctx.sessionId）、`rootSessionId`（:842 取 `effectiveParent?.rootSessionId ?? effectiveParent?.id ?? ctx.sessionId`）、`sourceDelegationId`、`sourceAutomationId` 继承（:849，注释 #993）、预设字段（:850）、`delegationRole`、`delegationStatus:'running'`、`delegationDepth+1`（:853）、`delegationGoal`、`permissionMode`。
8. 内存记录入 `delegations` 并修剪（:858-876）。
9. `buildDelegationPrompt`（:878-884，见 `apps/electron/src/main/lib/agent-collaboration-utils.ts:74-102`）。
10. `runRegisteredHeadlessAgent`（:886-918）：`triggeredBy:'delegation'`（:894）；`onError` → `markDelegationFinished(record,'failed',{error})`（:899-901）；`onComplete` 仅当 `record.status==='running'` 才收尾 `completed`（:905-908，注释 :903-904 说明级联取消预标 `cancelled` 后跳过此处但不阻断 STREAM_COMPLETE 转发）；`onTitleUpdated` 更新 `record.title`（:910-912）；Promise `.catch` → `failed`（:914-918）。

### 3.2 `markDelegationFinished`（:389-411）

幂等：`record.status !== 'running'` 直接 return（:394）。写 `status/completedAt/error/resultSummary`（:395-398）→ `updateAgentSessionMeta(child, {delegationStatus})`（:399）→ 向父会话 emit `delegation_session_updated`（:402-408，注释 :400-401 强调必须推回渲染进程）→ `resolveCompletion()`（:409）→ `scheduleParentAutoContinuation(parentSessionId)`（:410）。

### 3.3 `scheduleParentAutoContinuation`（:428-490）

按父会话串行：锁集合命中即返回（:429）；仍有 `running` 记录返回（:432）；取未消费（`autoContinuedDelegationIds`）的完成记录，无则返回（:434-435）。父会话守卫（:437-451）：`parent` 缺失 / 无 `channelId` / `stoppedByUser` / `isAgentSessionActive` 任一命中即 `console.info` 跳过（reason：`parent_missing`/`parent_channel_missing`/`stopped_by_user`/`parent_active`）。通过后加锁并消费 ID（:453-454），调 `runAgentHeadless`（`apps/electron/src/main/lib/agent-service.ts:404`）携带 `buildParentAutoContinuationPrompt`，`triggeredBy:'user'`（:468，注释 :467 说明父会话恢复后仍能再委派）；`source:'delegation'`（:472）。`onComplete`（:476-481）与启动 `.catch`（:484-489）都释放锁并**复查一次**（防锁窗口内新完成的子会话被漏收，注释 :478-480/:487）。

### 3.4 阻塞事件流（`registerCollaborationEventBus` :133-223）

注册一次（:134-136），`console.log`（:222）。监听器：按 `childSessionId` 匹配内存委派且 `status==='running'`（:139-140），只处理 `kind==='profer_event'`（:141）。
- `ask_user_request`（:144-172）：构造 `BlockedEvent`（问题/options 快照 :152-158）入 Map（:162），向父会话 emit `delegation_blocked`（:164-171，事件对象经 `as unknown as ProferEvent` 强转 :170）。
- `permission_request`（:174-196）：同构，记录 `permissionToolName`（:182）。
- `ask_user_resolved`/`permission_resolved`（:198-209）：按 requestId 标记首个未解决匹配项 `resolved=true`（不删除条目）。
- `run_idle`（:214-219）：若该会话是某委派父会话则重查自动续跑（注释 :211-213 记录 #1313 竞态场景）。

### 3.5 wait 机制（工具 :1110-1138）

`delegationIds` 缺省取本父会话全部 `running`（:1112-1116）；`resolveWaitTargets`（:644-659）分流 live/已落定（后者取 `getDelegationResult`）；`totalTargets===0` 直接返回提示（:1119-1121）；`timeoutSeconds = min(入参 ?? 1800, 7200)`（:1124）；`mode='all'` 等全部，`'any'` 等 `clamp(minCompleted,1,totalTargets)` 个（:1125）；`liveTarget = targetCompleted - settled.length`（:1126，可为 0 → `waitForLiveRecords` 立即 `'completed'` :670-672）；返回 `status/mode/completedCount/runningCount/delegations`（:1131-1137）。

### 3.6 `continue_delegation`（:1260-1318）

取/恢复记录（:1262）；`running` 抛错（:1264-1266）；重置 `status='running'`、清 `error/resultSummary/completedAt`（:1268-1271）；换新 completion 句柄（:1272-1274）；`updateAgentSessionMeta(child,{delegationStatus:'running'})`（:1276）；刷新 `startedAt`（:1278-1279）；再次 `runRegisteredHeadlessAgent`（:1281-1309，workspaceId 取 `child.workspaceId ?? record.workspaceId ?? ctx.workspaceId` :1287）；`await Promise.race([record.completion, 30min timeout])`（:1311-1312）；仍在运行则返回超时提示（:1316）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `buildPiCollaborationTools`：`apps/electron/src/main/lib/adapters/pi-builtin-tools.ts:83` 导入、`:2177` 调用。注入门禁在调用方：`collaborationAvailable = !!ctx.workspaceId && ctx.triggeredBy !== 'delegation' && !disabled.has('collaboration')`（pi-builtin-tools.ts:2171）且 `isGroupActive('collaboration')`（:2173）；异常仅 `console.error`（:2187）。工具返回值经 `tools.push(...collaborationTools as ToolDefinition[])`（:2186）。
- `hasRunningDelegations`：pi-builtin-tools.ts:456——TaskUpdate 工具在 `status==='completed'` 且父会话有 live 委派时置 `completionBlocked`，不落提前完成事件。
- `registerCollaborationEventBus`：`apps/electron/src/main/lib/agent-orchestrator.ts:91` 导入、`:322` 构造函数内调用（每次 new Orchestrator 仅首个生效，:134）。另有 `apps/electron/src/main/lib/agent-goal-runtime-bridge.test.ts:57` 仅打桩（模块缝合，不执行本体）。
- `stopDelegationsForParent`：agent-orchestrator.ts:3704，位于 `stop(sessionId)` 内、`adapter.abort` 之后，外层 try/catch（:3702-3708）；mock 于 agent-goal-runtime-bridge.test.ts:69。
- 10 个 `mcp__collaboration__*` 工具：由模型经 Pi SDK MCP 工具调用触发（无 IPC 直达入口）。

出向（导入 + 关键调用点）：
- `apps/electron/src/main/lib/agent-session-manager.ts`：`createAgentSession`（:831）、`updateAgentSessionMeta`（:399/:843/:1276）、`getAgentSessionMeta`（:329/:437/:702）、`listAgentSessions(true)`（:230/:519/:576）、`getAgentSessionSDKMessages`（:378）。
- `apps/electron/src/main/lib/agent-headless-runner-registry.ts`：`runRegisteredHeadlessAgent`（:886/:1281，定义 :74）、`stopRegisteredAgent(child, 'delegation_cancel')`（:752/:773，定义 :84）。
- `apps/electron/src/main/lib/agent-service.ts`：`runAgentHeadless`（:458，定义 :404）、`isAgentSessionActive`（:439，定义 :623）。
- `apps/electron/src/main/lib/agent-collaboration-utils.ts`：`MAX_RUNNING_DELEGATIONS_PER_PARENT`（:337/:951/:956/:963/:969/:1096/:1154）、`buildRecoveredDelegationState`（:602）、`buildDelegationPrompt`（:878）、`buildDelegationTaskWithSharedContext`（:1066）、`resolveDelegationPermissionMode`（:824）。
- `apps/electron/src/main/lib/agent-model-selection.ts`：`assertEnabledModelForChannel`（:800，定义 :24）、`listEnabledAgentModelsForChannel`（:708，定义 :54）。
- `apps/electron/src/main/lib/agent-workspace-manager.ts`：`getAgentWorkspace`（:813，定义 :185）。
- `apps/electron/src/main/lib/agent-delegation-preset.ts`：`resolveDelegationPreset`（:819，定义 :27）。
- `apps/electron/src/main/lib/agent-delegation-preset-schema.ts`：TypeBox 构建器（:1004/:1034）；Zod 构建器（:937/:947，仅死代码 `buildCollaborationSchemas` 内，见 §10）。
- 动态导入：`./agent-ask-user-service`（:1222，`askUserService.respondToAskUser` :1224）、`./agent-permission-service`（:1236，`permissionService.respondToPermission` :1238）。
- 事件总线：emit `delegation_blocked`（:164/:188）、`delegation_session_updated`（:402）、`ask_user_resolved`/`permission_resolved`（:1229/:1243）。

## 5. 数据 I/O、读写与副作用

- 本文件不直接读写磁盘/网络（依据：无 `node:fs`/fetch/import 网络模块；导入清单 :8-50）。但调用链有写副作用：`createAgentSession`/`updateAgentSessionMeta` 写会话元数据（由 agent-session-manager 落盘），`runRegisteredHeadlessAgent`/`runAgentHeadless` 启动真实 Agent run（模型请求、消息落盘属下游模块）。
- 内存状态：`delegations`（权威委派状态）、`blockedEvents`（阻塞事件）、`parentAutoContinuationLocks`、`autoContinuedDelegationIds`。`blockedEvents` 只增不删（`set` :162/:186，`resolved` 标记 :204；全文件无 `blockedEvents.delete`，检索 `blockedEvents\.` 五处 :162/:186/:201/:234/:238）。
- 幂等/并发：`markDelegationFinished` 幂等（:394）；`registerCollaborationEventBus` 幂等（:134）；自动续跑按父会话串行化（锁 :429/:453，释放 :477/:486）；`waitForLiveRecords` 用 completion Promise 链而非轮询（:676-692）。
- 副作用：EventBus 事件（§4）、`console.log`（:222/:782）、`console.info`（:440）、`console.error`（:474/:485/:777）、子/父 Agent 进程与模型请求（经下游）。
- 修剪：`pruneFinishedDelegations` 仅在 `startDelegation` 中调用（:876），保留最近 200 条已落定记录。

## 6. 分支、失败、取消与恢复

抛错点（用户可见文案为中文字符串）：
- `assertCanCreateDelegation`（:325-349）：`triggeredBy==='delegation'` 或 `delegationDepth>0` → `协作子会话不能继续创建新的子会话`（:332-334）；`runningCount + requestedCount > 50` → 上限文案（:337-339）；缺 `channelId`/`workspaceId` → :341-346。
- `startDelegation`：`task 不能为空`（:792→:280）；`父会话工作区不存在`（:815）；预设校验错误自 `agent-delegation-preset.ts:37/:43/:49` 冒泡。
- `getDelegationResult`：跨父查询 → `委派不属于当前父会话`（:543-545）；查无 → `未找到当前会话下的委派`（:551）。
- `resolveWaitTargets`：跨父 → `委派不属于当前父会话`（:650-652）。
- `stopDelegation`：live 记录跨父 → `未找到当前会话下的委派`（:741-743，与 :544 文案不一致，见 §10）。
- `answer_delegation_question`：`阻塞事件不存在`（:1213）；跨父 → `委派不属于当前父会话`（:1217-1219）。
- `continue_delegation`：`未找到当前会话下的委派`（:1263）；`委派正在运行中，无法追加指令`（:1265）。

取消语义：`stopDelegation` 对无内存记录返回 `{stopped:false, note:'该委派不在当前运行内存中（可能因应用重启已中断），无法主动停止。'}`（:734-739）；已落定记录返回 `{stopped:false}`（:744-749）；running 时 `stopRegisteredAgent(child,'delegation_cancel')` 后立即 `markDelegationFinished(record,'cancelled')`（:752-753，注释 :751 指明这不是 child UI 的 user stop）。下游语义链：`agent-headless-runner-registry.ts:45` 将 `delegation_cancel` 映射为 `{stoppedByUser:false, resultSubtype:'delegation_cancelled'}`，`apps/electron/src/main/lib/agent-end-reason.ts:76-78` 归一为 `reason:'unknown'`、label `因父会话停止而取消`。级联：`stopDelegationsForParent` 逐条 try/catch（:770-779），返回计数。

失败/恢复：`onError`/`.catch` → `failed` + error 文本（:899-901/:914-918）；自动续跑启动失败仅日志+锁释放+复查（:484-489）。重启恢复：`delegations` 为空，`listKnownDelegations` 从持久化会话回显（:519-535，`completedAt` 以 `updatedAt` 推 :534）；`getDelegationResult` 回退持久化并按需 `summarizeChildResult(session.id)`（:549-556）；`recoverDelegationRecordFromSession` 把落盘 `running` 收敛为 `interrupted`（经 `agent-collaboration-utils.ts:53-55`），且只把非 running 记录写回 Map（:615-618）——恢复出的 running 派生记录不入 Map，等待路径不会悬挂。不可恢复点：内存记录丢失后无法主动 stop（:735-739）。

## 7. 权限与权威状态

- 委派子会话权限模式恒为 `bypassPermissions`：`resolveDelegationPermissionMode()`（:824）实现见 `agent-collaboration-utils.ts:35-41`（父模式/请求模式/运行时均被忽略）；恢复路径同样硬编码（`agent-collaboration-utils.ts:64`）。预设中的权限字段不改变此策略（`agent-collaboration-utils.ts:30-34` 注释）。
- 工作区权威：持久化父会话的 `workspaceId` 优先于工具调用上下文（:810-812），防止旧流把子会话建到其它项目；显式工作区预设必须落在父工作区（`agent-delegation-preset.ts:39-50` 抛 `目标工作区预设不属于父会话工作区`）。
- 会话归属：读结果/等待/停止/代答/续跑均校验 `record.parentSessionId === ctx.sessionId`（:543/:628/:650/:741/:1217），跨会话抛错；`getPersistedDelegationSession` 对多义持久化记录不回退（:585-591）。
- 代答授权路径：`answer_delegation_question` 经 `blockedEventId` 归属校验后直接调 `respondToAskUser`/`respondToPermission`，**不经** IPC 路径的 `assertOrdinaryPendingRequestId`（对比 `apps/electron/src/main/ipc.ts:4305`）；`permissionBehavior` 默认 `'allow'`（:1237）。是否等价于用户授权属产品语义，本文件无额外校验。
- 本文件无 sender/role/权限模式分支（依据：全文无 `sender`/`assert` 权限断言；注入门禁在 pi-builtin-tools.ts:2171）。

## 8. 修改影响面

- 直接调用方：`apps/electron/src/main/lib/adapters/pi-builtin-tools.ts`（工具注入与门禁）、`apps/electron/src/main/lib/agent-orchestrator.ts`（事件注册 :322、级联停止 :3704、自动续跑经 `runAgentHeadless`）。
- 工具名契约被按名字消费：`mcp__collaboration__delegate_agent` 等出现在 `packages/shared/src/types/agent-preset-policy.test.ts:130`、`apps/electron/src/main/lib/agent-preset-manager.test.ts:93/:1215-1217`、`apps/electron/src/main/lib/task-graph-event-converter.test.ts:102-112`（并解析本文件返回 JSON 的 `delegation.delegationId/childSessionId` 形状 :104-105）、`apps/electron/src/main/lib/pi-task-prompt.test.ts:49`。改工具名或返回 JSON 形状会波及预设工具策略、任务图事件转换与提示词。
- 会话元数据字段（`delegationStatus`/`sourceDelegationId`/`delegationRole`/`delegationDepth`）被渲染层消费：`apps/electron/src/renderer/lib/agent-session-list.test.ts:91-100`、`apps/electron/src/renderer/components/app-shell/left-sidebar/session-tree.test.ts:108-115/:208-214`。
- `status` 枚举/`DelegationRecord` 改动需同步 `agent-collaboration-utils.ts` 与恢复逻辑；`MAX_RUNNING_DELEGATIONS_PER_PARENT` 同时是并发上限与 Zod 数组上限（:337/:951）。
- 自动续跑改动影响父会话续跑提示词与 `agent-service.runAgentHeadless` 依赖；停止语义改动影响 `agent-headless-runner-registry.ts` 的 `delegation_cancel` 终态映射与 `agent-end-reason.ts` 文案。
- 无直接测试需同步修改（§9）；间接契约测试（上列）按名断言，改动需回归核对。

## 9. 测试证据

直接测试：**无**。检索范围：全冻结树 `*.test.ts` 中 import `'./agent-collaboration-tools'`/`'../agent-collaboration-tools'` 仅 `agent-goal-runtime-bridge.test.ts:57/:69`（把 `registerCollaborationEventBus`/`stopDelegationsForParent` 当模块缝合桩传入，不执行本体逻辑）。

间接证据（标注「间接」）：
- `apps/electron/src/main/lib/agent-headless-runner-registry.test.ts:10-15`：断言 `getAgentStopCompletionOptions('delegation_cancel')` 等于 `{stoppedByUser:false, resultSubtype:'delegation_cancelled'}`——本文件停止链（:752/:773）的下游语义。
- `agent-headless-runner-registry.test.ts:17-34`：断言委派记录预标 cancelled 时 `forwardHeadlessAgentCompletion` 仍转发完整 completion——对应本文件 `onComplete` 跳过收尾（:905）与 STREAM_COMPLETE 转发不被阻断的注释（:903-904）。
- `apps/electron/src/main/lib/task-graph-event-converter.test.ts:96-112`：断言 `isDelegateAgentTool('mcp__collaboration__delegate_agent')`、`delegationLinkFromResult` 能解析本文件 delegate 返回 JSON 的 `delegation` 结构。
- `apps/electron/src/main/lib/adapters/pi-builtin-tools.test.ts:591-604`：断言特定上下文下 `delegate_agent` 不注入而 `delegate_agents` 注入（工具门禁的消费侧断言）。
- `agent-collaboration-utils.test.ts`（本批内）：覆盖 :824 调用的 `resolveDelegationPermissionMode` 恒返回 `bypassPermissions`。

未覆盖：`startDelegation` 全链（含 draft 晋升顺序）、`scheduleParentAutoContinuation`（锁/跳过原因/复查）、`blockedEvents` 流、`wait`/超时、`continue_delegation`、恢复路径（`recoverDelegationRecordFromSession`/`listKnownDelegations`）、`pruneFinishedDelegations` 均无任何测试。mock/真实边界：goal-runtime-bridge 测试只打桩本模块函数，未触达实现。`NOT_RUN`：本轮未执行任何测试（静态阅读断言行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出恰 4 条；10 个工具名与 execute 行段如 §2 | 已证实 | `agent-collaboration-tools.ts:133/:313/:768/:984`，工具 :1015-1319 |
| 权限恒 `bypassPermissions`，入参被忽略 | 已证实 | `agent-collaboration-utils.ts:35-41/:64`；调用 :824 |
| 工作区以持久化父会话为准，跨工作区预设抛错 | 已证实 | `agent-collaboration-tools.ts:812-816`；`agent-delegation-preset.ts:39-50` |
| 级联停止经 `stopRegisteredAgent(child,'delegation_cancel')`，下游映射 `delegation_cancelled` | 已证实 | `agent-collaboration-tools.ts:752/:773`；`agent-headless-runner-registry.ts:45`；`agent-end-reason.ts:76-78` |
| 自动续跑：全部子会话结束后按父会话串行启动一轮，`triggeredBy:'user'` | 已证实 | `agent-collaboration-tools.ts:428-490` |
| `blockedEvents` 只增不删（无 `delete`） | 已证实 | 全文件 `blockedEvents\.` 检索 :162/:186/:201/:234/:238 |
| `buildCollaborationSchemas`（:928）、`jsonResult`（:254）、`getCurrentParentPermissionMode`（:698）无调用者 | 已证实 | 全冻结树 `*.ts` 检索 `buildCollaborationSchemas` 仅 :928；另两者全文件检索仅定义行 |
| Zod 工具 schema 构建器唯一生产调用点是死代码 `buildCollaborationSchemas` | 已证实 | `:937/:947` 位于 :928-982 内；该函数无调用者 |
| `delegate_agents` TypeBox 参数无 maxItems，与 Zod 版 `.max(50)`（:951）不对称；运行时仅靠 :337-339 计数拒绝 | 已证实 | `:1055`（`Type.Array(delegateItemType)` 无上限）vs `:951` |
| 注释 :797「回退 Claude」与代码 `?? 'pi'`（:798）不一致 | 已证实（矛盾照实记录） | `agent-collaboration-tools.ts:797-798` |
| `stopDelegation` 跨会话文案（:742 `未找到当前会话下的委派`）与 `getDelegationResult`（:544 `委派不属于当前父会话`）不一致 | 已证实（矛盾照实记录） | `:543-545` vs `:741-743` |
| `delegation_blocked` 事件对象经 `as unknown as ProferEvent` 强转，共享类型是否收录该事件未核实 | 未知 | `:170/:194`；`@profer/shared` 类型联合未在本批范围内逐条核 |
| `respondToAskUser`/`respondToPermission` 内部实现与其对 pending 的写入 | 未知（属他文件，未逐行读） | 动态导入 `:1222/:1236`；本批不含 `agent-permission-service.ts` |
| 代答路径绕过 `assertOrdinaryPendingRequestId` 是否为产品预期 | 推断 | 归属校验 `:1217-1219` 与 `ipc.ts:4305` 对照；无注释声明意图 |
| `delegation_blocked`/`delegation_session_updated` 在渲染层的具体消费 | 推断 | 仅见 `session-tree.test.ts`/`agent-session-list.test.ts` 对 delegation 字段的断言 |
| Pi SDK `defineTool` 的执行/校验语义（TypeBox 是否强制 min/max） | 未知 | 未读 SDK 实现（node_modules 不在冻结核对范围） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `registerCollaborationEventBus` + 4 事件分支 | §2/§3.4 | :133-223 | covered |
| `hasRunningDelegations` | §2/§4 | :313-315 | covered |
| `stopDelegationsForParent` | §2/§6 | :768-785 | covered |
| `buildPiCollaborationTools` + 10 工具 | §2/§3/§4 | :984-1321 | covered |
| `startDelegation` 10 步流程 | §3.1 | :787-926 | covered |
| `markDelegationFinished`/自动续跑 | §3.2/§3.3 | :389-411/:428-490 | covered |
| wait 机制 | §3.5 | :644-696/:1110-1138 | covered |
| `continue_delegation` | §3.6 | :1260-1318 | covered |
| 恢复路径（persisted fallback/`recoverDelegationRecordFromSession`） | §6 | :540-637 | covered |
| `answer_delegation_question` 动态导入与代答 | §4/§7 | :1210-1250 | covered |
| `pruneFinishedDelegations` | §2/§5 | :241-252 | covered |
| `summarizeChildResult`/`extractTextFromSdkMessage` | §2/§3.1 | :351-387 | covered |
| `getAvailableAgentModels` | §2 | :706-730 | covered |
| 死代码 `jsonResult`/`getCurrentParentPermissionMode`/`buildCollaborationSchemas` | §2/§10 | :254/:698/:928 | covered |
| `delegation_blocked` 的 `ProferEvent` 强转合法性 | §10 | :170/:194 | unknown |
| SDK `defineTool` 参数校验语义 | §10 | :1015-1319 | unknown |
| 测试断言（间接 5 处） | §9 | 见 §9 | covered（NOT_RUN） |
