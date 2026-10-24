---
path: apps/electron/src/renderer/components/agent/AgentView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 975ccdde55f1d9616eb762b6be5ca9077d9b3d83
sha256: 958b8d4ec90357fd1de88aac6d9b8246786be43cf353ede3bf751b09306b606e
lines: 3671
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentView.tsx

## 1. 结论与边界

Agent 模式主视图容器（3671 行）：加载当前会话消息、发送/停止/压缩消息、附件上传、运行中队列、Goal 命令、分叉/探索/撤销、权限与课堂/实验室访问管控，并组装 `AgentHeader | AgentMessages | AgentInput + 侧面板`（文件头 `apps/electron/src/renderer/components/agent/AgentView.tsx:1-14`）。导出 2 条（`AgentViewProps` + `AgentView`）；其余 ~25 个符号均为内部。

边界（文件头 + 逐行核对）：

- **IPC 流式事件监听不在本文件**——已提升到全局 `useGlobalAgentListeners`（文件头 `:10-11` 自述"本组件为纯展示 + 交互组件"；真实归约入口 `apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:441/:986`）。
- 不是持久化权威：会话元数据（渠道/模型/权限模式/预设/中断原因）真源在主进程 session meta，本文件的 Map atom 是运行时缓存（`:611`、`:700-706`、`:1029-1034` 注释与代码）。
- 不实现消息渲染（`AgentMessages`/`SDKMessageRenderer`）、权限审批逻辑（`PermissionBanner`）、检索/记忆算法（主进程）。

## 2. 导出与关键符号

### 2.1 导出（2 条，`grep '^export '` 核数）

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentViewProps` | interface（export） | `:483-493` | `{ sessionId: string; variant?: 'default'\|'ai-class'\|'cs-lab'; emptyState?: React.ReactNode }` | variant 语义注释 `:485-489` |
| `AgentView` | function（export） | `:495-3671` | `({ sessionId, variant='default', emptyState }) => React.ReactElement` | 主容器 |

### 2.2 模块常量（内部）

| 符号 | 行 | 值/形状 | 说明 |
| --- | --- | --- | --- |
| `DESKTOP_AGENT_PAGE_SIZE` | `:150` | 60 | 注释：与 `main/agent-session-manager` 的同名常量同步 |
| `AGENT_REFRESH_HEADROOM` | `:152` | 100 | refresh 时在已加载条数上追加的余量 |
| `AGENT_CACHE_WINDOW` | `:154` | 160 | 内存缓存尾部窗口 |
| `EMPTY_SDK_MESSAGES` | `:181` | `[]` 稳定引用 | 避免 `?? []` 新引用 |
| `LONG_TEXT_ATTACHMENT_THRESHOLD` | `:182` | 2000 | 超长粘贴转附件阈值 |
| `EFFORT_LABELS` | `:257-262` | low/medium/high/max → 低/中/高/最大 | 4 档 |
| `OPENAI_THINKING_LABELS` | `:264-272` | off…max 7 档中文名 | Pi 推理档位 |
| `ALL_THINKING_LEVELS` | `:275` | `['off','minimal','low','medium','high','xhigh','max']` | capability 缺省回退 |

### 2.3 内部函数与子组件

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `createUserSDKMessage` | function（内部） | `:185-193` | 乐观用户消息（`type:'user'`，`_createdAt`） |
| `buildAgentInterruptionText` | function（内部） | `:196-199` | 中断说明注入文本（含时间与引导语） |
| `SDKMessageRecord` / `isRecord` / `getUserTextFromSDKMessage` | type+function（内部） | `:201-229` | 从 SDKMessage 提取用户文本（过滤 tool_result/合成/子代理消息） |
| `AgentThinkingPopover` | component（内部） | `:277-414` | 思考模式/推理档位菜单（§3.9） |
| `AttachMenuButton` | component（内部） | `:418-447` | 附件二级菜单（添加文件/附加文件夹） |
| `ToolbarGraphButton` | component（内部） | `:451-481` | 任务图按钮（getGraphSummary 状态感知） |
| `OpenAIThinkingConfig` / `AgentThinkingPopoverProps` | interface（内部） | `:233-255` | popover props |

## 3. 内部逻辑与关键流程

以下均在 `apps/electron/src/renderer/components/agent/AgentView.tsx`，行号即证据。

### 3.1 历史分页加载（`:505-559`、`:1218-1386`）

- `handleLoadEarlierHistory`（`:513-559`）：`historyPullInFlightRef` 防重入；`{ before: historyStartIndexRef, tail: 60 }` 调 `getAgentSessionSDKMessages`（`:522-523`）→ `normalizeAgentHistoryResult`（`./agent-history-pagination`）→ 早段 prepend（`:531-537`）；分页游标 `startIndex/hasMore` 从 `normalized.cursor` 同步（`:538-541`），旧版全量返回走 `getSdkMessagesHasMore` 兜底（`:542-548`）；catch 保持 `hasMore=true` 可重试（`:550-554`）。
- 主加载 effect（`:1218-1386`，依赖 `sessionId/refreshVersion`）：
  - **会话切换 vs 刷新**区分（`:1221-1256`）：切换时清乐观消息登记（`:1225`）、重置触顶状态（`:1227-1229`）、非运行中会话清 stale live 消息（`:1234-1242`）、缓存命中立即填充（`:1248-1251`），未命中清空+loading。
  - tail 计算 `max(60, 已加载+100)`（`:1270-1273`）；`normalizeAgentHistoryRefresh` 裁掉超起点前缀（`:1284`，注释 `:1260-1262` 防窗口膨胀）。
  - 乐观消息合并（1.7.1）：按 uuid 保留未持久化的乐观气泡（`:1286-1299`）。
  - 缓存写入只留尾部 160 条（`:1300-1302`）；`unstable_batchedUpdates` 内同步消息/游标（`:1303-1319`）。
  - 加载完成后清流式展示态：保留 `backgroundWaiting`/usage/`taskActivities`（`isTaskProgressTool` 过滤，`:1325-1368`），并清 live 消息（运行中不清，`:1369-1377`）。
  - catch：`setMessagesLoaded(true)` 不卡死 UI（`:1380-1384`）；cleanup `cancelled=true`（`:1385`）。

### 3.2 流式状态订阅与软空闲（`:560-610`）

- `agentSessionStreamingStateAtomFamily(sessionId)` 切片订阅防整树重渲染（`:561-564`）；`streaming = state.running`（`:565`）；`backgroundWaiting`（软空闲：SDK 通道开着等后台任务唤醒，`:567-569`）。
- 流式结束（true→false）拉取持久化 Graph 供任务图（`:573-583`）。
- 队列 epoch/轮次版本：`turnVersionRef` 在 running 下降沿 +1（`:602-610`）；`queueStopEpochRef` 使 Stop 前取出的消息失去回队资格（`:597-598`）。

### 3.3 渠道/模型/工作区/预设解析（`:611-748`、`:981-1012`）

- 渠道/模型级联：`sessionMeta.channelId ?? sessionMap.get(sessionId) ?? default`（`:663-666`）；meta 是跨重启真源（注释 `:611`、`:700-701`）。
- `stableChannelId`/`planQuotaChannelId`（`:692-698`）：仅 `supportsChannelPlanQuota` 渠道允许 ContextUsageBadge 发起额度请求。
- 空模型自动补全（`:891-926`）：仅空闲（`!streaming && !backgroundWaiting`）自动选第一个可用模型并 `updateAgentSessionModel` 持久化；不与运行中 binding 竞争（注释 `:892`）。
- 预设加载（`:677-690`）与有效性（`:981-1002`）：`presetSelectionRequired` 延迟 500ms 显提示（`:995-1002`）；无效绑定自动 rebind 首个可用预设（`:1004-1012`）。

### 3.4 上下文模式/记忆开关（本批主题，`:1037-1087`）

- `sessionMemoryDisabled`（单轮聚焦，`:1038-1045`）；`sessionContextModeMapAtom`（持久化会话选择，`:1048-1049`）；`agentContextIndexGlobalAtom` 挂载时 `getSettings()` 回填（`:1052-1059`）。
- `effectiveContextMode` 优先级：`sessionMemoryDisabled → 'classic'` > `globalContextIndexEnabled → 'index'` > 会话选择（`:1062-1066`）。
- `handleGlobalContextIndexChange`（`:1068-1079`）：乐观 + `updateSettings` + 返回值回写 + toast/回滚——**与 `AgentSettings.tsx:47-61` 重复实现同一逻辑**（矛盾 3）。
- `handleContextModeChange`（`:1082-1087`）：全局索引开时点"经典"= 一键关全局 + 写会话选择。
- 透传：主发送 `contextMode: effectiveContextMode` + `disableContextMemory`（`:2480-2481`）、队列新 run 同（`:2145-2146`）；但 `handleCompact`（`:2797-2808`）、`handleRetry`（`:2889-2897`）、`handleRetryInNewSession`（`:2931-2941`）的 `sendAgentMessage` **不带**这两字段（矛盾 4；语义影响未知，主进程编排属跨批）。

### 3.5 中断说明恢复与消费（`:766-808`、`:1980-1997`）

- 恢复：meta `lastInterruptReason` 非 `completed` 且 atom 无值 → 从 meta 填充（`:790-808`）；消费/移除时 atom 与 meta 同步清除（`updateAgentInterruptionState({state:null})`，`:779-786`、`:1988-1989`），重启不复活。
- 消费：`consumeAgentInterruptionBlock`（`:1980-1997`）读清 atom + 清 meta，返回序列化块；拼接顺序「中断说明 → 用户引用 → 用户文本」（`:2102-2108`、`:2428-2431`）。

### 3.6 附件处理（`:1495-1854`）

- `addFilesAsAttachments`（`:1510-1575`）：`MAX_ATTACHMENT_SIZE` 内转 base64 存 `window.__pendingAgentFileData`（`:1558-1561`，全局 Map 旁路）；超限但有本地路径 → `attachSessionFile` 引用（`:1519-1542`）；超限无路径 → toast 跳过（`:1572-1574`）。
- 文件对话框（`:1615-1659`）/大文件引用（`:1578-1612`）/文件夹附加（`:1662-1683`）/拖放（`:1780-1854`，`checkPathsType` 区分目录与文件，失败回退按普通文件）/粘贴文件与超长文本（`:1749-1765`，阈值 2000）/clipboard 预览写临时文件（`:1708-1730`，`writeClipboardPreview`）。
- 发送时三类附件分流（`:2317-2412`）：真实文件原地引用、剪贴板草稿读最新内容重存、新上传从内存保存到 session 目录（`saveFilesToAgentSession`）；数据失效即中断发送并 toast（`:2358-2363`、`:2370-2376`）。

### 3.7 发送主链 `handleSend`（`:2186-2579`）

1. Goal 命令拦截（`parseGoalCommand`）：status/pause/resume/stop/clear/start 分支（`:2188-2228`），start 需确认时挂起 `pendingGoalReplacement`（`:2215-2218`）。
2. 早退：未加载/空文本/无渠道/无模型/预设缺失/stopping（`:2232-2240`）。
3. 队列非空 → 强制入队（`:2243-2246`）；streaming → 入队（`:2254-2258`）；backgroundWaiting → 直接注入不中断（`:2261-2285`，失败恢复草稿）。
4. 清错误/建议（`:2288-2301`）→ 附件保存（`:2304-2412`）→ 引用选区（`:2415-2426`）→ 中断块拼接（`:2430-2431`）→ 清 stoppedByUser（`:2434-2439`）。
5. 初始化流式状态（保留 task 类活动跨 turn，`:2441-2463`）→ 乐观用户消息（uuid 生成，`:2466-2468`）→ `sendAgentMessage(input)`（`:2470-2498`，含 `permissionModeOverride/disableContextMemory/contextMode/studyTeachingMode/mentions` 解析 `/skill:` `#mcp:` `&session:` `:2488-2497`）。
6. 失败恢复链（`:2503-2578`）：`isAgentRunAlreadyActiveError` → 恢复 owner run 代次 + `queueAgentMessage` 追加（`:2504-2531`）；`isQueueTargetNoLongerActiveError` → 换新 startedAt 重发（`:2533-2554`）；两路均失败 → 撤销乐观气泡 + 草稿回填（`:2561-2564`）；预设失效错误码（AGENT_PRESET_REQUIRED/PRESET_UNKNOWN_REFERENCE/PRESET_NOT_FOUND）→ 专项 toast + 回填（`:2567-2570`）；最后 `running:false`（`:2571-2577`）。

### 3.8 队列系统（`:1963-2703`）

- `enqueueCurrentInput`（`:2004-2029`）：纯文本入队（附件拒绝 `:2010-2015`）+ 消费引用选区 + 清输入。
- `queueMessageIntoActiveAgent`（`:2065-2088`）：乐观上屏 → `queueAgentMessage`（streaming 时 `interrupt:true` 软打断）→ 失败回滚乐观消息再抛。
- `sendPlainTextAgentMessage`（`:2095-2183`）：`streaming||backgroundWaiting` 优先注入（`:2167-2175`，`isQueueTargetNoLongerActiveError` 降级新 run `:2171-2172`），否则 `startNewRun`（`:2112-2163`）。
- 控制：`handleSendQueuedNow`（`:2593-2617`，`queueStopEpochRef` 使旧 epoch 消息不回队 `:2608`）、`handleRecallQueuedMessage`（`:2619-2642`，回填草稿+引用）、remove/move（`:2644-2654`）。
- 自动发送 effect（`:2657-2703`）：`evaluateAutoSendTurn`（`@/lib/agent-autosend-turn`）决策 idle/defer/consume/send；发送锁 `autoSendingQueuedRef/queuedSendInFlightRef` 防重入；失败 `shouldRestoreQueuedMessageAfterFailure` 决定回队（`:2692-2694`）；成功后 `queueSendSettledVersion+1` 唤醒（`:2701`）。
- 自动发送开关：运行时缓存 map + meta 权威持久化（`updateAgentQueueAutoSend`，`:650-662`、`:2741-2749`）；手动 Stop 关开关并写 meta false（`:2713-2720`）。

### 3.9 停止/压缩/重试/分叉/撤销

- `handleStop`（`:2706-2738`）：唯一停止入口；`queueStopEpochRef+1`、关自动发送、置 `stopping:true`、`stopAgent`；**失败仅 toast 保持 stopping，不伪装空闲**（`:2730-2734`）。
- `handleCompact`（`:2753-2838`）：streaming/backgroundWaiting 拒绝（`:2756`）；`compactInFlightRef` 防重入（`:2758-2760`）；注入合成 `/compact` 消息（uuid 复用防双气泡，`:2762-2781`）；乐观 `isCompacting/compactInFlight`（`:2784-2795`）；失败回滚合成消息 + `rollbackRejectedAgentRunState`（`:2809-2833`，注释 `:2811-2815` 警告只清 isCompacting 会永久卡"运行中"）；finally 释放锁（`:2834-2837`）。
- `handleRetry`（`:2854-2899`）：找最后一条用户消息（`getUserTextFromSDKMessage`）重发；`handleRetryInNewSession`（`:2902-2945`）：新建会话 + `&session:` 引用旧会话。
- `handleFork`（`:2953-2987`）：必须与源会话同渠道（`:2955-2960`）；SDK "not found in session" 转友好文案（`:2980-2982`）。
- `handleExplore`（`:2990-3018`）：仅 Pi runtime（`:2991-2994`）；`openExplorationBranchTab` 并排分支。
- 撤销（`:3028-3104`）：`rewindSession` → 刷新消息/diff 版本号（`:3049-3058`）→ 回填提问（`:3061-3068`）→ 按 `fileRewind` 结果分档 toast（canRewind/skipped/incomplete/error，`:3070-3097`）。

### 3.10 快捷键与渲染树

- 快捷键按 `activeTabId === sessionId` 归属（`:643-646`）：stop-generation（`:3107-3113`）、focus-input（`:3116-3124`）、toggle-preview-panel（`:3149-3152`）。
- 渲染（`:3353-3671`）：`AgentSessionProvider` → `AgentHeader`/`ExplorationBranchBar`/`GoalStatusBar`/Goal 替换确认框（`:3365-3392`）→ 访问管控分流（未登录课堂 `CdutAiClassContentGuard` `:3395-3396`）→ `AgentMessages`（回调按 `csLabLockedOutsideZone` 禁用 `:3410-3415`）→ 权限/AskUser/ExitPlan 横幅（`:3425-3443`）→ 输入区（课堂/实验室锁 `:3447-3459`；正常 composer `:3461-3633`：附件/引用/中断 chip、`AgentMessageQueue`、建议、预设警告、无渠道空态、`RichTextInput`、`InputToolbarOverflow` 工具栏）。
- 工具栏 items（`:3164-3322`）：ModelSelector、PermissionModeSelector、PresetSelector（ai-class 隐藏 `:3181`）、AgentThinkingPopover、AttachMenuButton、ContextModeToggleButton（`mode/onChange/disabled/disabledReason/isProcessing`，`:3229-3245`）、ContextMemoryToggleButton、ContextUsageBadge、任务图按钮（`taskGraphEnabled` 门 `:3158-3162`）。
- 尾部按钮（`:3324-3351`）：streaming/stopping 显示停止键；否则发送键（右键入队 `:3343-3346`）。

## 4. 调用者与调用链

- **入向（渲染点，全树检索 `<AgentView`）**：`apps/electron/src/renderer/components/tabs/TabContent.tsx:12`（`import { AgentView } from '@/components/agent'` barrel）+ `:60`（`<AgentView sessionId={tab.sessionId} />`）；`components/cdut-zone/AiClassChatPanel.tsx:10` + `:36`（`variant="ai-class"`）；`components/cdut-science/agent-window/ScienceAgentWindowView.tsx:57`（直连 `@/components/agent/AgentView`）+ `:635`（`variant="cs-lab"`）。barrel：`components/agent/index.ts:5`。测试入向：`components/agent/PlanModeDashedBorder.test.ts:6`（读源码文本，见 §9）。
- **出向（模块）**：见 `:16-178` import 块——`./AgentMessages`、`./AgentHeader`、`./GoalStatusBar`、`@/atoms/goal-atoms`（`agentGoalAtomFamily/getGoalActions/GOAL_STATUS_LABELS/goalEditorAtomFamily/goalReplacementAtomFamily/startGoalWithReplacement` `:24`）、`./ContextUsageBadge`、`./ContextMemoryToggleButton`、`./ContextModeToggleButton`（`:27`）、`./context-usage-badge-channel`、`@/lib/channel-plan-quota`、`@/lib/agent-channel-selection`、`./PermissionBanner`、`./CsLabToolTrustBadge`、`./RuntimeProcessPanel`、`./BackgroundTaskControls`、`./PermissionModeSelector`、`./PresetSelector`+`./preset-selector-utils`、`@/atoms/agent-preset-atoms`、`./AskUserBanner`、`./ExitPlanModeBanner`、`./PlanModeDashedBorder`、`@/components/shared/ModelSelector`、`AttachmentPreviewItem`、`@/components/diff/QuotedSelectionChip`、`@/components/ai-elements/rich-text-input`、`InputToolbarOverflow`、`composer/ComposerTool`、`@profer/ui` primitives（Switch/AlertDialog/Dialog）、`./ProjectGraphPanel`、`@/lib/utils`、`@/lib/agent-autosend-turn`（`evaluateAutoSendTurn`）、`@/lib/agent-stream-state-cleanup`（`rollbackRejectedAgentRunState`）、`@/lib/shortcut-registry`、`@/atoms/preview-atoms`、`@/components/diff/preview-opener`、`@/atoms/agent-atoms`（50+ 符号 `:73-124`）、`@/atoms/graph-atoms`、`@profer/project-core`（`generateSummary`）、`./task-progress`（`isTaskProgressTool`）、`@/atoms/settings-tab`/`active-view`/`tab-atoms`、`@/lib/exploration-tab`、`@/atoms/conversation-atoms`/`draft-session-atoms`、hooks（`useOpenSession`/`useEnterCdutAiClass`）、`@/atoms/cdut-account-atoms`、`@/lib/cdut-ai-class`、`@/components/cdut-zone/CdutAiClassGuards`、`@/components/cdut-science/CsLabAgentGuards`、`@/contexts/session-context`、`./ExplorationBranchBar`、`@/atoms/shortcut-atoms`、`@profer/shared`（`MAX_ATTACHMENT_SIZE/isAgentPresetToolGroupDisabled/parseGoalCommand` 等 `:156`）、`@/lib/file-utils`、`@/lib/clipboard-text-attachment`、`./AgentMessageQueue`、`./agent-history-pagination`、`@/lib/session-reference-drag`、`@/lib/quoted-selection`、`@/lib/agent-message-queue`（9 函数 `:163-174`）、`@/atoms/ui-preferences`、`@/lib/exploration-session`。
- **出向（IPC，38 个不同方法：30 个命中单行字面 `grep -o "window\.electronAPI\.[a-zA-Z.]*"` 去重口径 + 8 个跨行/`api` 别名访问（`getAgentSessionSDKMessages`/`getSdkMessagesHasMore`/`getSettings`/`getWorkspaceFilesPath`/`getWorkspaceAttachedFiles`/`getGraph`/`getGraphSummary` 等）补齐，以下枚举为全量）**：`sendAgentMessage`/`queueAgentMessage`/`stopAgent`/`getAgentSessionSDKMessages`/`getSdkMessagesHasMore`/`updateAgentSessionModel`/`updateSessionAgentRuntime`/`updateSessionAgentEffort`/`updateSessionOpenAIThinkingLevel`/`updateSettings`/`getSettings`/`getAgentSessionPath`/`getWorkspaceFilesPath`/`getWorkspaceAttachedFiles`/`listAgentPresets`/`rebindAgentSessionPresetReference`/`getPiReasoningCapability`/`updateAgentInterruptionState`/`updateAgentQueueAutoSend`/`saveFilesToAgentSession`/`attachFile`/`attachDirectory`/`openFileDialog`/`openFolderDialog`/`checkPathsType`/`getPathForFile`/`writeClipboardPreview`/`resolveAndReadFile`/`rewindSession`/`forkAgentSession`/`createAgentSession`/`getGoal`/`pauseGoal`/`resumeGoal`/`stopGoal`/`clearGoal`/`getGraph`/`getGraphSummary`（后两个经可选链 `:458`、`:578`）。桥在 `apps/electron/src/preload/index.ts`（如 `sendAgentMessage` 桥 `:2904`，声明 `:872`）；主进程注册在 `apps/electron/src/main/ipc.ts`（`AGENT_IPC_CHANNELS.STOP_AGENT` `:3934`、`queueAgentMessage` `:3959` 等；未逐条全读，标 partial）。

## 5. 数据 I/O、读写与副作用

- **读**：会话消息（IPC 分页 + `agentSDKMessagesCacheAtom` 内存缓存）、settings、session meta（经 `agentSessionsAtom`）、工作区路径/附加文件、预设列表、Graph。
- **写**：30+ atom（流式态/队列/草稿/附件/中断/引用）；IPC 写（发送/停止/模型绑定/runtime/effort/推理档位/队列开关/中断态/附件落盘/rewind/fork/Goal）；**`window.__pendingAgentFileData` 全局 Map**（base64 旁路缓存，`:1558-1561`、`:1641-1644`；发送后删除 `:2407-2410`）。
- **副作用**：toast（十余处）、`console.error`、`URL.createObjectURL/revokeObjectURL`（预览 URL，`:1527`、`:2408`）、DOM 查询/聚焦（`.ProseMirror`，`:866`、`:3065-3067`）、`queueMicrotask`（`:1438`）、`crypto.randomUUID`（消息/附件 id）、事件注册（`profer:stop-generation`/`profer:focus-input`，`:3111/:3122`）。
- **并发/交错**：多把 ref 锁（`stopInFlightRef` `:599`、`compactInFlightRef` `:2752`、`queuedSendInFlightRef` `:594`、`runtimeSwitchInFlightRef` `:705`、`historyPullInFlightRef` `:510`）+ epoch（`queueStopEpochRef` `:598`）+ 轮次版本（`:602-603`）防竞态；`startedAt` 由渲染层生成原样传主进程做竞态保护同一凭据（`:1439` 注释、`:2477`）。
- 原子性：乐观消息 + uuid 对账（`:2542`、`:2800-2802`），失败回滚链见 §3.7/§3.9。

## 6. 分支、失败、取消与恢复

- 早退/短路：§3.7 步骤 2、`handleCompact` 双拒（`:2756`）、`handleModelSelect`/`handleAgentRuntimeChange` 运行中拒绝（`:1858-1861`、`:1911-1914`）。
- 失败恢复：发送三级恢复（§3.7-6）；压缩回滚（§3.9）；队列失败回队（`:2608`、`:2692`）；历史加载失败保留 hasMore（`:550-554`）；runtime 切换失败回滚 meta+默认（`:1936-1944`）；effort/推理档位失败 toast（`:300-303`、`:332`）。
- **取消/停止语义**：`handleStop` 失败保持 `stopping`（`:2731-2734`）；`typed_error/error` 不释放运行态（详见 `agent-atoms.ts` 手册 §3.2/§6，两文件共同遵守 STREAM_COMPLETE 收口）；`streamState?.stopping` 期间 `handleSend` 早退（`:2237-2240`）。
- 恢复（重启/会话切换）：中断说明从 meta 恢复（§3.5）；消息缓存消除切会话空窗（§3.1）；乐观消息登记跨重载合并（`:1188-1211`）。

## 7. 权限与权威状态

- **权限模式级联**（`:1015-1035`）：会话显式选择（map→meta）> 预设 `permissionMode` > 全局默认；`permissionModeOverride` 随发送透传（`:2479`）；注释 `:1029-1031` 明确不能把用户已选 plan/bypass 压回预设值。
- **访问管控（本文件派生守卫）**：CDUT AI 速课堂——未登录拦截内容（`aiClassBlockedNotLoggedIn` `:966`、渲染 `:3395-3396`）、已登录但非专区入口锁输入（`aiClassLockedOutsideZone` `:968`、`:3447-3453`）；CSLab 实验室会话在专区外锁全部交互（`csLabLockedOutsideZone` `:974`、`:3455-3459`，消息回调置 undefined `:3410-3415`、横幅不渲染 `:3425`）。账号状态来自 `cdutAccountAtom`（`:961`）。
- 预设作为能力上限：`sessionBoundPreset` 决定权限上限/岗位（`:1013-1014` 注释）、任务图工具组开关（`:3158-3162`）。
- 权威状态：session meta（渠道/模型/权限/预设/中断/queue 自动发送）在主进程；本文件只投影（§1）。运行所有权（activeSessions）在主进程——`isAgentRunAlreadyActiveError` 恢复链（`:2504-2531`）即为 renderer 误判空闲时的对账。

## 8. 修改影响面

- 改 props（`sessionId/variant/emptyState`）→ 3 个渲染点（§4）+ `AgentViewProps`。
- 改发送/队列语义 → `@/lib/agent-message-queue`（9 个被调函数 `:163-174`）、`@/lib/agent-autosend-turn`（含 16 用例测试，§9）、主进程 `agent-service`（`runAgent/queueAgentMessage/stopAgent`）。
- 改流式态字段 → `agent-atoms.ts`（`AgentStreamState`）、`agent-stream-state-cleanup.ts`、`useGlobalAgentListeners.ts`。
- 改 `AgentView.tsx` 源码文本 → **`PlanModeDashedBorder.test.ts:11` 的字符串断言会失败**（要求保留 `(isPlanMode || isPermissionPlanMode) && !isDragOver && <PlanModeDashedBorder />` 字面量）。
- 改上下文模式/记忆开关 → `ContextModeToggleButton.tsx`、`AgentSettings.tsx`、`agent-atoms.ts:1253-1286`、主进程 `contextMode` 编排。
- 改中断/恢复 → meta 字段 `lastInterruptReason/Label/At`、`updateAgentInterruptionState` IPC。

## 9. 测试证据（全部 NOT_RUN，仅静态读断言）

- **源码文本契约（直接命中本文件）**：`apps/electron/src/renderer/components/agent/PlanModeDashedBorder.test.ts`（3 用例，bun:test）：`:10-22` 断言 AgentView 源码含 `(isPlanMode || isPermissionPlanMode) && !isDragOver && <PlanModeDashedBorder />`（`:11`）+ PlanModeDashedBorder.tsx 的 7 个实现常量/特征；`:24-38` 断言同心半径 `dashedRadius = metrics.radius + OFFSET - STROKE_WIDTH / 2` 等 7 条；`:40-42` 断言 skin-base.css 的 `--plan-mode-stroke-color` 回落。性质：读文件文本匹配，不渲染组件。
- **间接（测本文件调用的 helper）**：`apps/electron/src/renderer/lib/agent-autosend-turn.test.ts`（16 用例、2 describe：`shouldStartAutoSendFromIdle` `:21`、`evaluateAutoSendTurn` `:47`，断言如 compact_boundary 后等 STREAM_COMPLETE 才发送 `:57-64`、live 交接前后 `:89-91`、轮次信号消费 `:95-96`）；`apps/electron/src/renderer/atoms/agent-atoms.test.ts`/`agent-atoms-lifecycle.test.ts`（applyAgentEvent 语义，见该手册 §9）；`agent-history-pagination.test.ts`、`agent-stream-completion.test.ts`、`agent-live-messages.test.ts`（分别测 normalize/收尾/切片 helper，非本文件逻辑）。
- **无覆盖**：`handleSend` 主链、发送失败恢复链、队列注入/回队、`handleStop/handleCompact` 回滚、附件三类分流、中断消费、fork/explore/rewind、课堂/实验室守卫均无测试（全树 `*.test.*` 检索 `AgentView` 仅 PlanModeDashedBorder.test.ts 命中）。无 e2e/`*.spec.*`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 常量/内部函数/子组件清单 | 已证实 | 逐行读 1-3671 + `grep '^export '` |
| 3 个真实渲染点 + barrel + 测试入向 | 已证实 | §4 行号 |
| 30 个 IPC 方法调用面 | 已证实 | `grep -o window\.electronAPI\.[a-zA-Z.]*` 去重 |
| 发送三级失败恢复链（already-active→queue→重发→回滚） | 已证实 | `:2503-2578` |
| handleStop 失败保持 stopping 不伪装空闲 | 已证实 | `:2729-2737` |
| 压缩回滚必须同时复位 running 的注释契约 | 已证实 | `:2809-2833` |
| effectiveContextMode 三级优先级与两处全局索引双实现 | 已证实 | `:1062-1087`、`AgentSettings.tsx:47-61` |
| contextMode/disableContextMemory 仅主发送+队列新 run 透传 | 已证实 | `:2480-2481`、`:2145-2146` vs `:2797-2808`、`:2889-2897`、`:2931-2941` |
| 课堂/实验室守卫的行为分流 | 已证实 | `:960-980`、`:3395-3461` |
| `window.__pendingAgentFileData` 全局旁路缓存 | 已证实 | `:1558-1561`、`:1641-1644`、`:2407-2410` |
| main 端各 IPC handler 的校验/拒绝条件 | 推断/未知 | 仅抽查 `main/ipc.ts:323/:3934/:3959`，未逐条深读 |
| compact/retry 不带 contextMode 的运行时语义 | 未知 | 主进程编排层属跨批，未读 |
| 真实帧率/渲染性能（切片订阅注释声称 10-30fps） | 未知 | 静态注释（`agent-atoms.ts:258`），NOT_RUN |
| 课堂守卫在多窗口/残留标签页的实际拦截效果 | 未知 | NOT_RUN（GUI） |

**现存实现矛盾/易误读点（照实记录）**：

1. `inputToolbarItems` useMemo 依赖数组含未使用项与重复项（`agentChannelId` 出现两次 `:3289/:3299`、`handleAgentRuntimeChange`/`runtimeSwitchInFlight` 在 deps 但 items 未用，`:3292/:3309`）。
2. 全局索引开关双实现（本文件 `:1068-1079` vs `AgentSettings.tsx:47-61`），行为略异（本处无 saving 禁用）。
3. effort 档位 4 档（`EFFORT_LABELS` `:257-262`）vs 设置页 3 档（详见 AgentSettings 手册 §10-1）。
4. `contextMode/disableContextMemory` 透传覆盖不全（本节表格行 8）。
5. `handleRetry` 重发的最后一条用户消息**不带**附件/引用/中断块（`:2889-2897` 仅 `userMessage`），与原发送内容可能不等价。

## 11. 覆盖表

| 职责/符号 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出 2 条 + 常量/内部函数/子组件 | §2 | `:149-481` | covered |
| 历史分页与消息加载/缓存/乐观合并 | §3.1 | `:505-559`、`:1218-1386` | covered |
| 流式订阅/软空闲/epoch | §3.2 | `:560-610` | covered |
| 渠道/模型/预设解析与自动补全 | §3.3 | `:611-748`、`:891-926` | covered |
| 上下文模式/记忆开关（本批主题） | §3.4 | `:1037-1087` | covered |
| 中断恢复/消费 | §3.5 | `:766-808`、`:1980-1997` | covered |
| 附件全链（含三类分流） | §3.6 | `:1495-1854`、`:2304-2412` | covered |
| handleSend 主链与失败恢复 | §3.7 | `:2186-2579` | covered |
| 队列系统（入队/注入/自动发送/回队） | §3.8 | `:1963-2703` | covered |
| 停止/压缩/重试/分叉/探索/撤销 | §3.9 | `:2706-3104` | covered |
| 快捷键/渲染树/工具栏/守卫 | §3.10 | `:3107-3671` | covered |
| AgentThinkingPopover/AttachMenuButton/ToolbarGraphButton | §2.3/§3.9 | `:277-481` | covered |
| IPC 30 方法与 caller 链 | §4 | 两侧行号 | covered（main handler partial） |
| 权限级联/访问管控 | §7 | `:960-1035`、`:3395-3461` | covered |
| 测试（1 直接源码契约 + 间接 helper） | §9 | 测试文件行号 | covered（NOT_RUN） |
| main 编排语义/运行时性能 | §10 | — | unknown |
