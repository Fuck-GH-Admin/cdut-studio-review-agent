---
path: apps/electron/src/renderer/atoms/agent-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9616d92a45a4dd44e91f34248072a7c81e0c1b49
sha256: 2d2d5132b832e7b1b3a3c106f634c74caa8a484987fabcfb949e97d225c89885
lines: 1287
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/agent-atoms.ts

## 1. 结论与边界

Agent 模式渲染层的 **Jotai 状态中枢**：以 103 个 `export const`（原始 atom / 派生 atom / atomFamily / atomWithStorage）+ 8 个纯函数 + 10 个接口 + 4 个类型别名（共 125 个导出，`grep '^export '` 全文核数）管理会话列表、流式状态、权限请求、消息队列、草稿、上下文模式等全部 Agent UI 状态；文件头自述"模式照搬 chat-atoms.ts"（`apps/electron/src/renderer/atoms/agent-atoms.ts:1-6`）。

边界（逐条有据）：

- **不做任何 IPC/网络/磁盘调用**：全文 0 处 `window.` / `electronAPI` / `ipcRenderer` / `localStorage` / `fetch(` 直接引用（全文负向检索）。所有主进程交互由调用方（`apps/electron/src/renderer/components/agent/AgentView.tsx`、`apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts` 等）完成，本文件只存状态与做纯函数归约。
- **不是持久化权威**：会话元数据（权限模式、渠道/模型、autoQueueSendEnabled、lastInterruptReason 等）的权威在主进程 session meta，本文件的 Map 仅是渲染层运行时缓存（`apps/electron/src/renderer/atoms/agent-atoms.ts:348-350`、`:477`、`:648-650` 注释自述）。
- 不渲染 UI、不包含 React 组件；唯一的框架副作用是 `atomWithStorage` 经 jotai 默认 storage（浏览器环境即 localStorage）读写 7 个 UI 偏好键（见 §5）。
- 与本批 `apps/electron/src/renderer/atoms/longterm-memory-atoms.ts`（写入型 atom 内收敛 IPC）是**两种不同模式**：本文件是纯状态层，勿把后者的"写入型 atom 做 IPC"语义套到本文件。

## 2. 导出与关键符号

导出 125 条 = 103 `export const`（其中约 90 个 atom、9 个 atomFamily、7 个 atomWithStorage）+ 8 `export function` + 10 `export interface` + 4 `export type`。另有 6 个内部符号（标"内部"）。下表逐条列全。

### 2.1 类型 / 接口（14 条）

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ActivityStatus` | type（export） | `:22` | `'pending'\|'running'\|'completed'\|'error'\|'backgrounded'` | 活动派生状态；见 §10 矛盾 1 |
| `ToolActivity` | interface（export） | `:25-41` | `toolUseId/toolName/input/intent?/displayName?/result?/isError?/done/parentToolUseId?/elapsedSeconds?/taskId?/shellId?/isBackground?/imageAttachments?` | 单条工具活动 |
| `ActivityGroup` | interface（export） | `:44-47` | `{ parent: ToolActivity; children: ToolActivity[] }` | Task 子代理分组 |
| `AgentStreamState` | interface（export） | `:68-120` | `running/stopping?/backgroundWaiting?/content/toolActivities/model?/inputTokens?/outputTokens?/cacheReadTokens?/cacheCreationTokens?/costUsd?/contextWindow?/thinkingEstimatedTokens?/usageUpdatedAt?/isCompacting?/compactInFlight?/startedAt?/retrying?` | 单会话流式状态；`stopping` 为 Phase 0 过渡标记（`:70-74`），`backgroundWaiting` 为软空闲（`:75-79`） |
| `AgentPendingPrompt` | interface（export） | `:210-214` | `{ sessionId; message; additionalDirectories? }` | 待自动发送提示 |
| `AgentComposerInjection` | interface（export） | `:290-294` | `{ sessionId; text; nonce }` | 外部一次性注入输入框 |
| `FileBrowserAutoReveal` | interface（export） | `:453-459` | `{ sessionId; path; ts; select? }` | 文件浏览器定位脉冲 |
| `AskUserQuestionAnswer` | interface（export） | `:573-577` | `{ selected: string[]; customText; showCustom }` | AskUser 答案草稿 |
| `AgentContextStatus` | interface（export） | `:992-1002` | `{ isCompacting; inputTokens?; outputTokens?; cacheReadTokens?; cacheCreationTokens?; costUsd?; contextWindow?; usageUpdatedAt? }` | 上下文用量投影 |
| `BackgroundTask` | interface（export） | `:1192-1207` | `{ id; type:'agent'\|'shell'; toolUseId; startTime; elapsedSeconds; intent?; output? }` | 后台任务条目 |
| `GraphQuestionContext` | interface（export） | `:1234-1238` | `{ sessionId; taskId; taskSubject }` | Graph 追问上下文 |
| `AgentSidePanelBaseTab` | type（export） | `:392` | `'session'\|'workspace'\|'changes'` | 侧面板基础 Tab |
| `AgentSidePanelTab` | type（export） | `:394` | `AgentSidePanelBaseTab \| 'preview'` | 右侧栏 Tab |
| `SessionIndicatorStatus` | type（export） | `:652` | `'idle'\|'running'\|'blocked'\|'completed'` | 会话指示点 |

### 2.2 导出纯函数（8 条）

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `finalizeStreamingActivities` | function（export） | `:54-65` | `(toolActivities: ToolActivity[]) => { toolActivities: ToolActivity[] }` | 未完成项置 `done:true`；全完成时返回原引用；非数组防御返回空 |
| `getActivityStatus` | function（export） | `:123-128` | `(activity: ToolActivity) => ActivityStatus` | 四分支派生；永不返回 `'pending'` |
| `groupActivities` | function（export） | `:168-201` | `(activities: ToolActivity[]) => Array<ActivityGroup \| ToolActivity>` | 过滤幽灵条目→TodoWrite 合并→按 `parentToolUseId` 分组 |
| `isActivityGroup` | function（export） | `:204-206` | `(item) => item is ActivityGroup` | 类型守卫 |
| `upsertAgentImageGeneration` | function（export） | `:239-244` | `(cards, incoming) => AgentImageGenerationCard[]` | 按 id 去重、按 `createdAt` 再 `id` 排序 |
| `applyAgentEvent` | function（export） | `:716-989` | `(prev: AgentStreamState, event: AgentEvent) => AgentStreamState` | **核心归约器**，27 个事件分支，见 §3.2 |
| `deleteSessionMapEntry` | function（export） | `:1067-1072` | `<T>(prev: Map<string,T>, sessionId) => Map<string,T>` | 未命中返回原引用；命中返回新 Map |
| `setSessionMessagesCache` | function（export） | `:1079-1093` | `(prev, sessionId, messages) => Map<string, SDKMessage[]>` | LRU 写入，超 `AGENT_MSG_CACHE_MAX` 从最旧淘汰 |

### 2.3 内部符号（6 条，非导出）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `mergeTodoWrites` | function（内部） | `:135-159` | 同层 TodoWrite 只留最新 input 置底；`done = 全部 done`，`isError = allDone && some isError`（`:150-156`） |
| `EMPTY_LIVE_MESSAGES` | const（内部） | `:275` | 稳定空数组引用，避免 `?? []` 新引用 |
| `PermissionRequestsUpdate` | type（内部） | `:523` | 数组或 updater |
| `AskUserRequestsUpdate` | type（内部） | `:549` | 同上 |
| `lastIndicatorSignature` / `lastIndicatorMap` | let（内部） | `:657-658` | 模块级可变缓存，供 `getStableIndicatorMap` |
| `getStableIndicatorMap` / `preserveFailedRetry` | function（内部） | `:660-667` / `:712-714` | 指示点 Map 引用稳定化；重试状态保留规则（仅 `failed:true` 的 retrying 存活） |

### 2.4 导出 atom（103 条 `export const`，按主题分组逐条）

**会话/工作区/渠道/模型（:218-235）**：`agentSessionsAtom` `:218`（`AgentSessionMeta[]`）、`agentWorkspacesAtom` `:219`、`currentAgentWorkspaceIdAtom` `:220`、`agentChannelIdAtom` `:222`（全局默认渠道）、`agentModelIdAtom` `:224`（全局默认模型）、`agentChannelIdsAtom` `:226`（多选白名单）、`agentRuntimeAtom` `:228`（`atom<'pi'>`，新建默认 runtime）、`agentSessionChannelMapAtom` `:231`、`agentSessionModelMapAtom` `:233`、`currentAgentSessionIdAtom` `:234`、`agentStreamingStatesAtom` `:235`（`Map<sessionId, AgentStreamState>`，全文件最高频写入源）。

**流式/消息（:238-296、:1032-1059）**：`agentImageGenerationsAtom` `:238`、`agentSessionImageGenerationsAtomFamily` `:245-247`（只读切片）、`agentProcessGroupsKeepExpandedAtom` `:250-253`（atomWithStorage）、`agentSessionStreamingStateAtomFamily` `:263-265`（**按 sessionId 切片订阅**，防整树重渲染，注释 `:255-262`）、`liveMessagesMapAtom` `:273`、`liveMessagesAtomFamily` `:278-280`、`agentPendingPromptAtom` `:282`、`agentComposerInjectionAtom` `:296`、`agentMessageRefreshAtom` `:1032`（刷新版本号）、`AGENT_MSG_CACHE_MAX` `:1043`（=20）、`agentSDKMessagesCacheAtom` `:1044`（持久化消息内存缓存）、`resolvedBlobMessagesAtom` `:1059`（blob 全文缓存，`sessionId→uuid→SDKMessage`）。

**附件/队列（:302-370）**：`agentSessionPendingFilesAtom` `:302`、`agentPendingFilesAtomFamily` `:309-326`（读写切片，空数组转 delete `:317-321`）、`workspaceCapabilitiesVersionAtom` `:329`、`workspaceFilesVersionAtom` `:332`、`seenFilesVersionAtom` `:335`、`agentSessionMessageQueueAtom` `:340`、`agentQueueAutoSendMapAtom` `:351`（运行时缓存，权威在 meta `:348-350`）、`agentMessageQueueAtomFamily` `:353-370`。

**侧面板/布局（:375-470）**：`agentSidePanelOpenAtom` `:375`（atomWithStorage）、`agentSidePanelWidthAtom` `:378`、`teamAgentPanelWidthAtom` `:381`、`teamWorkspaceLayoutModeAtom` `:384-387`（key `TEAM_WORKSPACE_LAYOUT_MODE_STORAGE_KEY`='profer-team-layout-mode'，默认 'files'，`apps/electron/src/renderer/lib/team-layout-mode.ts:1-5`）、`agentSidePanelOpenMapAtom` `:390`（@deprecated `:389`）、`agentDiffPanelTabAtom` `:397`、`agentPreviewPanelWidthAtom` `:403`、`agentDiffViewModeAtom` `:406`、`agentDiffRefreshVersionAtom` `:409`、`agentSelectedWorktreeAtom` `:412`、`agentDiffUnseenChangesAtom` `:415`、`agentDiffUnseenFilesAtom` `:418`、`agentNonGitFileChangesAtom` `:424`、`agentFileChangesCurrentRunAtom` `:427`、`agentDiffDataAtom` `:436`（SWR 缓存，注释 `:429-435`）、`currentSessionSidePanelOpenAtom` `:439-443`（派生只读）、`agentSessionPathMapAtom` `:446`、`fileBrowserAutoRevealAtom` `:460`、`recentlyModifiedPathsAtom` `:467`、`RECENTLY_MODIFIED_TTL_MS` `:470`（=60_000）。

**权限/AskUser/ExitPlan（:475-597）**：`agentDefaultPermissionModeAtom` `:475`（初值 `PROFER_DEFAULT_PERMISSION_MODE`='bypassPermissions'，`packages/shared/src/types/agent.ts:1935`）、`agentPermissionModeMapAtom` `:478`、`sessionPersistedPermissionModeAtom` `:485-490`（atomFamily 派生 meta 权限模式）、`sessionExistsAtom` `:493-498`、`agentThinkingAtom` `:501`、`agentEffortAtom` `:504`、`studyTeachingModeAtomFamily` `:511-512`（仅存运行内显式覆盖，注释 `:506-510`）、`agentMaxBudgetUsdAtom` `:515`、`agentMaxTurnsAtom` `:518`、`allPendingPermissionRequestsAtom` `:521`、`pendingPermissionRequestsAtom` `:526-544`（当前会话读写派生，空数组删条目 `:539`）、`allPendingAskUserRequestsAtom` `:547`、`pendingAskUserRequestsAtom` `:552-570`、`askUserAnswersAtom` `:585`、`askUserCollapsedAtom` `:591`、`allPendingExitPlanRequestsAtom` `:594`、`agentPlanModeSessionsAtom` `:597`。

**当前会话派生（:599-655、:1005-1100、:1152-1183）**：`currentAgentSessionAtom` `:599-604`、`agentStreamingAtom` `:606-610`、`agentStreamingContentAtom` `:612-616`、`agentToolActivitiesAtom` `:618-622`、`agentStreamingModelAtom` `:624-628`、`agentRetryingAtom` `:630-634`、`agentStartedAtAtom` `:636-640`、`agentRunningSessionIdsAtom` `:642-649`、`unviewedCompletedSessionIdsAtom` `:655`、`agentContextStatusAtom` `:1005-1019`、`currentAgentErrorAtom` `:1096-1100`、`currentAgentSessionDraftAtom` `:1152-1171`（读写，空 trim 删条目 `:1163-1165`）、`currentAgentSuggestionAtom` `:1179-1183`。

**指示点/Dock（:670-707）**：`dockBadgeCountAtom` `:670-677`（经 `calculateDockBadgeCount`/`countPendingRequests`，`apps/electron/src/renderer/lib/dock-badge-count.ts:19/:28`）、`agentSessionIndicatorMapAtom` `:683-707`（优先级 blocked>running>completed，经 `getStableIndicatorMap` 稳定引用 `:706`）。

**错误/草稿/附加目录（:1025-1149、:1176）**：`agentStreamErrorsAtom` `:1025`、`agentSessionDraftsAtom` `:1106`、`agentSessionDraftAtomFamily` `:1109-1111`、`agentSessionDraftHtmlAtom` `:1117`、`agentSessionDraftHtmlAtomFamily` `:1120-1122`、`agentAttachedDirectoriesMapAtom` `:1129`、`agentAttachedFilesMapAtom` `:1135`、`workspaceAttachedDirectoriesMapAtom` `:1142`、`workspaceAttachedFilesMapAtom` `:1149`、`agentPromptSuggestionsAtom` `:1176`。

**后台任务/杂项（:1215-1286）**：`backgroundTasksAtomFamily` `:1215-1217`、`sdkBackgroundTasksAtomFamily` `:1227-1229`、`graphQuestionAtom` `:1241`、`stoppedByUserSessionsAtom` `:1246`、`agentSettingsReadyAtom` `:1251`、`sessionMemoryDisabledMapAtom` `:1259`（默认 false=记忆开启）、`sessionMemoryDisabledAtom` `:1262-1264`、`sessionContextModeMapAtom` `:1272-1275`（atomWithStorage key 'cdut-agent-context-mode'）、`sessionContextModeAtom` `:1278-1280`（默认 'classic'）、`agentContextIndexGlobalAtom` `:1286`（全局索引开关，注释 `:1282-1285`）。

## 3. 内部逻辑与关键流程

### 3.1 分组与派生纯函数（真实执行顺序）

1. `finalizeStreamingActivities`（`apps/electron/src/renderer/atoms/agent-atoms.ts:54-65`）：非数组 → `{toolActivities: []}`（`:57`）；存在未完成项时 map 置 `done:true`（`:62`），否则返回原数组引用（`:63-64`）。
2. `mergeTodoWrites`（`:135-159`）：拆出 `toolName === 'TodoWrite'`（`:140-145`）；无 TodoWrite 原样返回（`:147`）；合并项取最后一个的 input（`:149`），`done` 取全完成、`isError` 取"全完成且至少一个错"（`:150-156`）；合并项追加在末尾（`:158`）。
3. `groupActivities`（`:168-201`）：先滤"幽灵条目"= `done && input 无键 && 无 result`（`:170-173`）→ `mergeTodoWrites`（`:174`）→ 收集 `toolName === 'Task' || 'Agent'` 的 toolUseId 为父（`:176-179`）→ 按 `parentToolUseId` 分桶，其余进 topLevel（`:184-192`）→ 父项包装为 `{parent, children: mergeTodoWrites(children)}`（`:194-200`）。
4. `getActivityStatus`（`:123-128`）：`isBackground`→'backgrounded'；`!done`→'running'；`isError`→'error'；否则 'completed'。
5. `upsertAgentImageGeneration`（`:239-244`）：同 id 且既有 `updatedAt` 更新则丢弃 incoming（`:241`）；否则替换/追加，按 `createdAt` 升序、同值按 `id.localeCompare` 排序（`:243`）。
6. `getStableIndicatorMap`（`:660-667`）：把 entries 原地按 id `localeCompare` 排序（`:661`），拼签名串（`:662`）；签名不变返回旧 Map 引用（`:663`），否则新建并缓存（`:664-666`）。模块级 `lastIndicatorSignature/lastIndicatorMap`（`:657-658`）为跨渲染可变状态。
7. `agentSessionIndicatorMapAtom`（`:683-707`）：只登记非 idle——运行中的会话若存在任一 pending 权限/AskUser/ExitPlan 请求 → 'blocked'，否则 'running'（`:692-698`）；`unviewedCompleted` 中未登记者 → 'completed'（`:700-704`）。
8. `preserveFailedRetry`（`:712-714`）：`prev.retrying?.failed ? prev.retrying : undefined`——**只有失败态重试记录跨事件存活**。

### 3.2 `applyAgentEvent` 事件归约（`:716-989`，27 分支）

按 switch 顺序（每条均为"输入 prev + event → 输出新 state，未提及字段不动"）：

- `text_delta` `:721-723`：`content` 追加 `event.text`；清非失败 retry。
- `text_complete` `:725-728`：`content` **整体替换**为 `event.text`（回放只需此事件即可重建）；清非失败 retry。
- `tool_start` `:730-758`：按 `toolUseId` 命中则原地更新 `input`，`intent/displayName` 用 `event.x || t.x` 保旧（`:737`，空串不覆盖）；未命中则追加 `done:false` 新条目（`:744-757`）。
- `tool_result` `:760-768`：命中项写 `result/isError/done:true/imageAttachments`。
- `task_backgrounded` `:770-778`：`isBackground:true/taskId/done:true`。
- `task_progress` `:780-792`：仅当 `event.elapsedSeconds != null` 更新计时；否则**返回原对象**（`:792`）。
- `task_started` `:794-807`：有 `toolUseId` 且命中才更新 `intent=description` 与 `taskId`；**未命中不创建条目**（`:798-805`）。
- `shell_backgrounded` `:809-817`：`isBackground:true/shellId/done:true`。
- `shell_killed` `:819-820`、`task_notification` `:822-823`、`tool_use_summary` `:831-833`：原样返回（注释明确由 UI 其他层处理）。
- `thinking_tokens` `:825-829`：写 `thinkingEstimatedTokens`。
- `complete` `:835-870`：**保持 `running:true`**（等 STREAM_COMPLETE IPC 才真正收口，注释 `:836-839`）；usage 兜底策略 `needResultFallback = !prev.inputTokens || prev.inputTokens <= 0`（`:854`）：`costUsd`、`contextWindow` 始终覆盖，input/output/cache token 仅在兜底条件成立时写入（`:857-866`，含 `usageUpdatedAt`）；末尾 `finalizeStreamingActivities`（`:868`）+ `preserveFailedRetry`（`:867`）。
- `run_resumed` `:872-874`：`running:true, backgroundWaiting:false`（后台任务唤醒）。
- `typed_error` `:876-881`：仅 `retrying: undefined`；**不释放运行态**（注释 `:877-880`）。
- `error` `:883-885`：原样返回（同上理由）。
- `context_window` `:887-893`：覆盖 `contextWindow` + `usageUpdatedAt`（主端快照优先于推断）。
- `usage_update` `:895-907`：各 token/cost 有值才写；`contextWindow` 仅当 `event.usage.contextWindow && !prev.contextWindow` 才写（`:905`）；总是刷新 `usageUpdatedAt`。
- `compacting` `:909-910`：`isCompacting:true, compactInFlight:true`。
- `compact_complete` `:912-913`：仅 `isCompacting:false`（`compactInFlight` 保持 true 至 state 删除，见字段注释 `:101-106`）。
- `model_resolved` `:915-918`：**故意不写**（保持用户所选 modelId，注释 `:916-917`）。
- `retrying` `:920-930`：无 retrying 时初始化 `{currentAttempt: event.attempt, maxAttempts: event.maxAttempts, history: [], failed:false}`，已有则不动。
- `retry_attempt` `:932-944`：history 追加 `event.attemptData`，`maxAttempts` 取 `prev.retrying?.maxAttempts ?? 3`，`failed:false`。
- `retry_cleared` `:946-948`：`retrying: undefined`。
- `retry_failed` `:950-964`：history 追加 `finalAttempt`，`failed:true`，**保持 running**（注释 `:951-953`）。
- `permission_request/permission_resolved/ask_user_request/ask_user_resolved/prompt_suggestion` `:966-984`：原样返回，由 PermissionBanner/AskUserBanner/全局监听器处理。
- `default` `:986-987`：原样返回。

## 4. 调用者与调用链

### 4.1 入向（真实消费者）

`grep -rl "atoms/agent-atoms"`（冻结树 apps+packages）命中 **98 个文件**（同口径 `wc -l` 复算修正；同目录相对导入 `./agent-atoms` 的 4 个测试文件不被该子串命中，测试入向全量 12 个见下）。代表性消费者（均为 `@/atoms/agent-atoms` 或相对路径 `../../atoms/agent-atoms` 导入）：

- `apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:33`（导入）、`:441`（`events.reduce((state, event) => applyAgentEvent(state, event), current)`，事件批处理）、`:986`（单事件归约）——**applyAgentEvent 的真实运行入口**；同文件消费 `upsertAgentImageGeneration`/`setSessionMessagesCache`（负向检索排除自身后命中此文件与 AgentView.tsx）。
- `apps/electron/src/renderer/components/agent/AgentView.tsx:73-124`（一次性导入 50+ 符号），写 `agentStreamingStatesAtom`（如 `:1441-1454`、`:2117-2130`、`:2444-2463`）、读 `agentSessionStreamingStateAtomFamily`（`:564`）、消费 `sessionContextModeMapAtom`/`agentContextIndexGlobalAtom`/`sessionMemoryDisabledMapAtom`/`studyTeachingModeAtomFamily`（`:1038-1087`、`:2483-2485`）。
- 其他 UI：`components/agent/AgentHeader.tsx`、`AgentMessages.tsx`、`SDKMessageRenderer.tsx`、`SidePanel.tsx`、`PermissionBanner.tsx`、`AskUserBanner.tsx`、`ExitPlanModeBanner.tsx`、`AgentMessageQueue`（经 AgentView）、`components/app-shell/left-sidebar/use-left-sidebar.ts`、`components/settings/AgentSettings.tsx:15`（`agentContextIndexGlobalAtom`/`agentEffortAtom`）、`components/cdut-zone/AiClassTeachingModeBar.tsx:14,42-43`、`hooks/useBackgroundTasks.ts`、`lib/agent-stream-state-cleanup.ts`、`lib/agent-tab-access.ts`、`main.tsx:232`（`agentSettingsReadyAtom`）等（完整 100 文件清单见 COVERAGE.tsv 备注与交付 SOURCE-EVIDENCE）。

测试文件入向共 **12 个**（全树 `*.test.*` 按 `agent-atoms` 导入检索：8 个命中子串 `atoms/agent-atoms` + 4 个同目录相对导入 `./agent-atoms`）：直接测本文件导出符号 **3 个**——`atoms/agent-atoms.test.ts`、`atoms/agent-atoms-lifecycle.test.ts`、`atoms/agent-live-messages.test.ts:4`；导入类型/atom 作夹具（间接）**9 个**——`components/agent/AskUserBanner.test.tsx:6-7`、`GoalStatusBar.test.tsx:7`、`task-progress.test.ts:2`、`app-shell/left-sidebar/session-tree.test.ts:19`、`lib/agent-autosend-turn.test.ts:4`、`lib/agent-stream-state-cleanup.test.ts:2`、`lib/agent-stream-completion.test.ts:2`、`lib/agent-tab-access.test.ts:4`、`lib/task-graph-events.test.ts:2`。

### 4.2 出向（本文件调用谁）

- `jotai` 的 `atom`（`:8`）、`jotai/utils` 的 `atomFamily/atomWithStorage`（`:9`）。
- `@profer/shared`：19 个类型 + `PROFER_DEFAULT_PERMISSION_MODE`（`:10-11`；常量值 'bypassPermissions'，`packages/shared/src/types/agent.ts:1935`）。
- `@/lib/dock-badge-count`：`calculateDockBadgeCount`（`apps/electron/src/renderer/lib/dock-badge-count.ts:28`）、`countPendingRequests`（同文件 `:19`），调用点 `:671-676`。
- 类型导入：`@/lib/agent-message-queue`（`AgentQueuedMessage`，`:13`）、`@/lib/session-file-changes`（`SessionFileChange`，`:14`）、`@/lib/team-layout-mode`（`:15-19`）。
- 无动态/反射调用；无字符串拼接调用。

## 5. 数据 I/O、读写与副作用

- **输入**：各 atom 的 set 由调用方（AgentView、useGlobalAgentListeners 等）驱动；`applyAgentEvent` 输入为 `AgentEvent` 判别联合。
- **输出**：jotai 订阅者；`agentSessionIndicatorMapAtom`/`dockBadgeCountAtom` 等派生值。
- **持久化**：7 个 `atomWithStorage` 键经 jotai 默认 storage（浏览器环境 = localStorage）读写：'profer-agent-process-groups-keep-expanded'（`:250-253`）、'profer-agent-sidepanel-open'（`:375`）、'profer-agent-sidepanel-width'（`:378`）、'profer-team-agent-panel-width'（`:381`）、'profer-team-layout-mode'（`:384-387`，key 来自 `apps/electron/src/renderer/lib/team-layout-mode.ts:1`）、'profer-agent-preview-panel-width'（`:403`）、'cdut-agent-context-mode'（`:1272-1275`）。键名与默认值为已证实（源码字面量）；"落到 localStorage"为推断（jotai 默认 storage，本文件未显式指定 storage）。
- **模块级可变状态**：`lastIndicatorSignature/lastIndicatorMap`（`:657-658`），跨渲染共享的引用缓存（副作用：同一进程内多 store 共享；`getStableIndicatorMap` 还会原地 sort 传入数组 `:661`）。
- 无网络、无磁盘文件、无 IPC、无日志、无遥测、无进程/窗口操作（全文负向检索，见 §1）。
- 并发/原子性：所有 Map 更新均为不可变替换（new Map(prev) 后 set/delete）；`pendingPermissionRequestsAtom` 等读写派生在无当前会话时 write 直接 return（`:533-534`、`:559-560`）。无锁；jotai set 在单次派发内串行。

## 6. 分支、失败、取消与恢复

- **运行态收口规则**（源码反复强调）：`complete`（`:835-839`）、`typed_error`（`:876-880`）、`error`（`:883-885`）、`retry_failed`（`:950-953`）都**不**置 `running:false`；只有外部（STREAM_COMPLETE IPC 驱动的调用方删除/重写 state）才能结束运行态。失败后内存状态：content/toolActivities 保留，`retrying` 按 `preserveFailedRetry` 保留失败历史。
- **重试生命周期**：`retrying` 初始化 `:920-930` → `retry_attempt` 累积 history `:932-944` → 成功 `retry_cleared` `:946-948` 或失败 `retry_failed` `:950-964`（failed:true）。任何 text/tool/complete 事件清除非失败 retry（`preserveFailedRetry` `:712-714`）。
- **压缩**：`compacting`/`compact_complete` 仅切 `isCompacting`；`compactInFlight` 一旦置 true 直到 state 删除（字段注释 `:101-106`）。
- **软空闲**：`backgroundWaiting`（`:75-79`）语义 = UI 可输入但 `activeSessions` 仍持有；`run_resumed` `:872-874` 恢复运行态。
- **防御分支**：`finalizeStreamingActivities` 非数组防御（`:57`）；`groupActivities` 幽灵条目过滤（`:170-173`）；`setSessionMessagesCache` 淘汰循环 `oldest === undefined` break（`:1088-1090`）。
- 不可恢复点：本文件无 throw；无取消机制（无 AbortController）；失败恢复由调用方（如 `apps/electron/src/renderer/lib/agent-stream-state-cleanup.ts` 的 `rollbackRejectedAgentRunState`，被 AgentView.tsx:2828 调用）负责。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无任何 sender/role/权限检查代码（全文无 `assert`/`sender`/`role` 判断）。
- 权限相关 atom（`agentDefaultPermissionModeAtom` `:475`、`agentPermissionModeMapAtom` `:478`、`sessionPersistedPermissionModeAtom` `:485-490`）只是**渲染层投影/缓存**；权威值持久化在主进程会话 meta——由 AgentView 的权限级联注释与实现佐证（`apps/electron/src/renderer/components/agent/AgentView.tsx:1029-1034`：`requestedPermissionMode ?? presetPermissionCapMode`，预设仅作缺省）。
- `agentQueueAutoSendMapAtom`（`:348-351`）自述"权威值持久化在会话 meta；此 atom 仅缓存"。
- `agentRuntimeAtom`（`:227-228`）自述"已加载会话始终以 metadata 为准"。
- Dock 角标、指示点（`:670-707`）是纯派生，不产生权威状态。

## 8. 修改影响面

- 改 atom 形状/键名 → 100 个导入文件全部受影响（§4.1）；重点：`AgentView.tsx`（写入点 `:1441`/`:2117`/`:2444`/`:2784`/`:2874`）、`useGlobalAgentListeners.ts:441/:986`。
- 改 `applyAgentEvent` 分支语义 → 流式 UI 全链路（内容追加、工具卡、token 统计、重试徽标、压缩分隔符）；需同步 `agent-atoms.test.ts`、`agent-atoms-lifecycle.test.ts` 的断言（§9）。
- 改 `AgentStreamState` 字段 → `apps/electron/src/renderer/lib/agent-stream-state-cleanup.ts`、`agent-stream-state-cleanup.test.ts`（导入该类型）、`components/agent/AgentMessages.tsx` 等所有读取方；`stopping/backgroundWaiting` 语义变更需同步主进程注释所指的 STREAM_COMPLETE 收口约定（`apps/electron/src/main/lib/agent-orchestrator.ts:2661` 提及 applyAgentEvent 语义）。
- `atomWithStorage` 键名变更 → 用户本地 UI 偏好丢失（旧键残留）；`sessionContextModeMapAtom` 键 'cdut-agent-context-mode' 与本批 `AgentSettings.tsx`/`AgentView.tsx` 的上下文模式联动（详见两篇手册）。
- `agentSessionIndicatorMapAtom` 的 `getStableIndicatorMap` 引用稳定性 → 侧边栏重渲染频率；改成每次新建 Map 会引发整栏刷新。
- 消息缓存 LRU（`AGENT_MSG_CACHE_MAX=20`、`setSessionMessagesCache`）改动 → `useGlobalAgentListeners.ts`、`AgentView.tsx` 的切会话空窗表现与内存占用。

## 9. 测试证据

**直接测试（3 个文件，9 个 `test()`，bun:test，NOT_RUN——本轮未执行任何测试，仅静态读断言）**：

1. `apps/electron/src/renderer/atoms/agent-atoms.test.ts`（71 行，4 用例，`describe('applyAgentEvent retry recovery')`）：
   - 夹具 `state()` `:6-19`：`running:true, content:'', toolActivities:[], retrying{currentAttempt:1,maxAttempts:8,history:[],failed:false}`。
   - `:22-25` "完整文本到达时清除非失败 retry"：`text_complete` 后 `expect(...retrying).toBeUndefined()`（`:24`）。
   - `:27-41` "retry_failed 只记录失败，不提前结束运行态"：`expect(next.running).toBe(true)`（`:39`）、`expect(next.retrying?.failed).toBe(true)`（`:40`）。
   - `:43-52` "失败历史不会被完整文本清除"：`toBe(failed)` 引用相等（`:51`）。
   - `:54-70` "文本、工具和正常 complete 都只清除非失败 retry"：`text_delta`/`tool_start`/`complete` 三事件后均 `toBe(failed)`（`:67`），无失败态 `complete` 后 `toBeUndefined()`（`:69`）。
2. `apps/electron/src/renderer/atoms/agent-atoms-lifecycle.test.ts`（65 行，4 用例）：
   - `:13-31` `deleteSessionMapEntry`：命中返回新 Map 且不动入参（`next !== prev`、`prev.has('a')` 仍 true，`:21-24`）；未命中 `toBe(prev)`（`:29`）。
   - `:33-41` `applyAgentEvent` 收到 `error`（'Upstream response stream was interrupted'）返回**同一引用**（`toBe(current)`，`:37-40`）。
   - `:43-64` `typed_error`（network_error）后 `running` 保持 true、`retrying` 清空（`:62-63`）。

3. `apps/electron/src/renderer/atoms/agent-live-messages.test.ts`（30 行，1 用例，describe `liveMessagesAtomFamily`，直接断言本文件导出的 `liveMessagesAtomFamily`/`liveMessagesMapAtom` 切片隔离）：`store.set(liveMessagesMapAtom, …)` 写入会话 a 后 `expect(store.get(a)).toEqual([message('a-1')])`（`:21`）、目标切片引用更新 `not.toBe(aBefore)`（`:22`）、**未触切片保持同一引用** `expect(store.get(b)).toBe(bBefore)`（`:23`）。

**间接证据（导入本文件类型/atom 但断言其他模块）**：`task-progress.test.ts:2`（`ToolActivity` 类型）、`session-tree.test.ts:19`（`SessionIndicatorStatus` 类型）、`agent-stream-state-cleanup.test.ts:2`（`AgentStreamState` 类型）、`task-graph-events.test.ts:2`、`agent-tab-access.test.ts:4`（`agentSessionsAtom`）、`AskUserBanner.test.tsx:6-7`、`GoalStatusBar.test.tsx:7`（pending 请求 atom 作夹具）、`lib/agent-autosend-turn.test.ts:4`（断言 `evaluateAutoSendTurn`/`shouldStartAutoSendFromIdle`，并以 `applyAgentEvent` 构造 compacting/complete 边界夹具（`:56`、`:68`）——属对本文件 reducer 局部分支的间接覆盖）、`lib/agent-stream-completion.test.ts:2`（导入 `AgentStreamState` 类型作夹具，测 `agent-stream-state-cleanup` 收尾逻辑）。

**未覆盖（缺口）**：`groupActivities`/`mergeTodoWrites`/`getActivityStatus`/`isActivityGroup`/`upsertAgentImageGeneration`/`setSessionMessagesCache`/`finalizeStreamingActivities`（对外形态）无任何直接测试；`applyAgentEvent` 的 `usage_update`/`complete` token 兜底、`tool_start` 更新分支、`task_started`、`agentSessionIndicatorMapAtom`、`dockBadgeCountAtom`、atomWithStorage 持久化均无断言。测试断言 ≠ 运行通过：本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 125 个导出 = 103 const + 8 function + 10 interface + 4 type | 已证实 | `grep '^export '` 全文核数；§2 逐条 |
| 本文件无 IPC/网络/磁盘直接调用 | 已证实 | 全文 1-1287 逐行读 + `window.\|electronAPI\|ipcRenderer\|localStorage\|fetch(` 全文 0 命中 |
| `applyAgentEvent` 27 分支语义（含 complete 兜底、typed_error 不释放运行态） | 已证实 | `:716-989` 逐行读 |
| `preserveFailedRetry` 仅 failed 态存活 | 已证实 | `:712-714` |
| `PROFER_DEFAULT_PERMISSION_MODE` = 'bypassPermissions' | 已证实 | `packages/shared/src/types/agent.ts:1935` |
| 权限/队列开关权威在主进程 meta，本文件为缓存 | 已证实 | `:348-350`、`:477` 注释 + `AgentView.tsx:1029-1034` |
| atomWithStorage 7 键落到 localStorage | 推断 | `:250/:375/:378/:381/:384/:403/:1272` 使用 jotai/utils 默认 storage；未显式传 storage |
| `groupActivities`/`getActivityStatus`/`isActivityGroup` 全树无消费者 | 已证实（负向） | 冻结树 `baseline/source@05fb2565` 全部扩展名（排除 .git/node_modules）检索三个符号名，仅 `agent-atoms.ts` 自身命中 |
| `finalizeStreamingActivities` 被 AgentView 导入但未调用 | 已证实 | `AgentView.tsx:118` 导入；该文件 grep 仅此一处 |
| 'pending' 状态无产生点 | 已证实 | `getActivityStatus` 四分支 `:123-128` 不返回 'pending'；全文其他处无赋值 |
| AgentEvent 各事件的真实产生端（主进程何种条件发哪个事件） | 未知 | 产生端在 `main/lib/agent-orchestrator.ts` 等（不在本批 SCOPE，未逐行读） |
| `getStableIndicatorMap` 多 store/SSR 下共享模块缓存的影响 | 未知 | 无测试、无多 store 运行验证（NOT_RUN） |
| `resolvedBlobMessagesAtom` 的写入方与 blob 解析全链路 | 推断 | 注释 `:1046-1058` 指向 `main/lib/agent-session-manager.ts` 的 `externalizeSerializedSessionLine`；消费方 `allSDKMessages`（不在本批）未读 |

**现存实现矛盾（照实记录）**：

1. `ActivityStatus` 含 `'pending'`（`:22`），但唯一派生函数 `getActivityStatus`（`:123-128`）永不产生它。
2. `AgentView.tsx:118` 导入 `finalizeStreamingActivities` 但全文件无调用点（未使用导入；实际兜底在 `applyAgentEvent` 'complete' 分支 `:868` 内部调用）。
3. `tool_start` 命中分支 `intent/displayName` 用 `event.x || t.x`（`:737`）：事件传空串时保留旧值，与 `tool_result` 直接覆盖（`:765`）不对称。
4. usage 写入优先级不一致（源码有意为之，注释 `:841-853`）：`usage_update` 仅当 `!prev.contextWindow` 才写推断窗口（`:905`），`complete` 的 result.usage 则无条件覆盖 `contextWindow/costUsd`（`:858-859`）。
5. `agentSidePanelOpenMapAtom`（`:389-390`）标 @deprecated 但仍导出；`agentRuntimeAtom` 类型固定 `atom<'pi'>`（`:228`）而 `AgentRuntime` 联合类型更宽（`AgentView.tsx:707-709` 用 `sessionMeta.agentRuntime ?? 'pi'`），类型面上不存在非 'pi' 的新会话默认值。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 125 导出全清单 | §2 | `:22-1286` | covered |
| `finalizeStreamingActivities` | §2.2/§3.1/§10-2 | `:54-65` | covered |
| `mergeTodoWrites`/`groupActivities`/`isActivityGroup`/`getActivityStatus` | §2.3/§3.1/§9 | `:135-206` | covered |
| `upsertAgentImageGeneration` | §2.2/§3.1 | `:239-244` | covered |
| `applyAgentEvent` 全 27 分支 | §3.2 | `:716-989` | covered |
| `preserveFailedRetry` | §2.3/§3.1/§6 | `:712-714` | covered |
| `getStableIndicatorMap` + 模块缓存 | §2.3/§3.1/§5 | `:657-667` | covered |
| `agentSessionIndicatorMapAtom`/`dockBadgeCountAtom` | §3.1/§4.2 | `:670-707` | covered |
| `deleteSessionMapEntry`/`setSessionMessagesCache`（LRU） | §2.2/§3.1/§9 | `:1067-1093` | covered |
| 派生读写 atom（pending requests/queue/pending files/draft） | §2.4/§5 | `:309-370`、`:526-570`、`:1152-1171` | covered |
| atomWithStorage 7 键 | §2.4/§5 | `:250-:1275` | covered（落 localStorage=推断） |
| usage/complete 兜底分支 | §3.2/§10-4 | `:835-870`、`:895-907` | covered |
| AgentEvent 产生端条件 | §10 | — | unknown（主进程未读） |
| 测试 9 用例断言（3 文件） | §9 | 测试文件行号 | covered（NOT_RUN） |
| 'pending' 状态、未使用导入等矛盾 | §10 | `:22`、`:123-128` | covered |
