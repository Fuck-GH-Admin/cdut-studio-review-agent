---
path: apps/electron/src/main/lib/adapters/pi-agent-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1a532c23d79ff7e1a9272faf8304ada473901273
sha256: 0ba1ed4af088b6fb473ae72364d9f5720f5789e65ff5f29f321818027c8de5f9
lines: 3534
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-agent-adapter.ts

## 1. 结论与边界

Pi Agent SDK 适配器：Proma 内部继续使用 `SDKMessage` 兼容协议，避免渲染层/Jotai/JSONL 持久化/历史会话展示在 SDK 迁移时改名（文件头 `apps/electron/src/main/lib/adapters/pi-agent-adapter.ts:1-6`）。3534 行巨型文件，职责：①查询选项/远端连接/代理设置；②错误归一（友好文案/typed error/超长与思考签名分类）；③上下文消毒与历史折叠（思考剥离/工具结果折叠/写入参数折叠）；④压缩续跑（compaction continuation/审核账本压缩）；⑤受控 Bash（本地/WSL 双执行器、进程生命周期、输出限额）；⑥安全 read 包装（富文档重定向/二进制硬阻断）；⑦产品工具（ask_user_question/compaction 工具等）；⑧`PiAgentAdapter` 主类（会话生命周期、prompt 链、重试门、看门狗、工具执行）。

边界：in-process runtime（无持久 CLI 子进程，`:3524-3526`）；权限判定在 `agent-permission-service`（本文件只包装 `wrapToolWithPermission`）；MCP/CSLab 工具由 `pi-mcp-tools`/`pi-cslab-tools` 提供。

## 2. 导出与关键符号

`export` 逐条核对：**42 条 `export` 语句 = 3 个 re-export 符号 + 3 个接口 + 1 个类 + 35 个函数 + 2 个常量（符号级 44）**（逐条按 `grep ^export` 核对：`:48` re-export 行、`:171,290,1584` 三接口、`:2531` 类、`:948,1103` 两常量、其余 35 函数）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `createPromaSkillsOverride`/`preparePromptForPiSkillQueue`/`preparePromptWithPromaSkills` | re-export | 48 | 自 `./pi-skill-resources` |
| `buildPiRetrySettings` | 函数 | 159-169 | Ollama/审核请求禁用 Pi 原生重试（`:162-163`），否则 maxRetries 8/1s |
| `PiAgentQueryOptions` | 接口 | 171-288 | 扩展 `AgentQueryInput`：apiKey/provider/channelId/context1m/contextWindow/maxTokens/permissionMode/canUseTool/systemPrompt/projectInstructionFiles/projectInstructionScope/resumeSessionId/piAgentDir/piSessionDir/customTools/toolProfile('general'\|'review')/contextPolicy/images/各 on* 回调 |
| `PiRemoteConnectionSettings`/`buildPiRemoteConnectionSettings`/`applyPiProxySettingsForQuery` | 接口/函数 | 290-378 | 远端连接与代理（SOCKS→SDK+dispatcher、HTTP→env、无代理→强制关 env） |
| `friendlyErrorMessage`/`isPromptTooLongError`/`isThinkingSignatureError`/`extractErrorDetails`/`isRuntimeNotFoundError`/`mapSDKErrorToTypedError` | 函数 | 534-653 | 错误归一（友好映射/超长/思考签名/运行时缺失/typed error） |
| `sanitizeContextForInference`/`sanitizeAndPruneOpenAIPayload` | 函数/常量 | 878-948 | 上下文消毒（空图像块拦截等）与 OpenAI payload 裁剪 |
| `wrapToolWithPermission` | 函数 | 1014-1083 | 工具权限包装 |
| `shouldDeferPiOverflowTerminalMessage`/`shouldDeferPiOverflowTerminalError` | 函数 | 1084-1102 | 溢出终态延迟判定（等待 Pi 原生压缩恢复） |
| `PI_COMPACTION_CONTINUATION_PROMPT` | 常量 | 1103 | 压缩后续跑提示词 |
| `planPiCompactionContinuation`/`canRunCurrentSessionCompaction`/`shouldBlockToolForAskUserQuestion` | 函数 | 1187-1217 | 续跑规划/压缩工具资格/ask_user 独占阻断 |
| `isConversationHistoryLookupCommand`/`isConversationHistoryLookupToolCall` | 函数 | 1302-1354 | 会话历史查询命令识别 |
| `buildCurrentSessionCompactionTool`/`compactCurrentSessionAfterTurn`/`estimatePiContextTokens`/`autoCompactWhenIdle` | 函数 | 1355-1450 | 会话内压缩工具与空闲自动压缩 |
| `buildPromaProductToolDefinitions` | 函数 | 1451-1523 | 产品工具（`ask_user_question` 结构化问答等） |
| `windowsPathToWslPath`/`buildWslBashArgs`/`ExecuteWslBashOptions`/`executeWslBashCommand` | 函数/接口 | 1545-1841 | WSL 执行器（路径转换/env 导出/受控进程） |
| `ensureBashWorkingDirectory`/`requireLocalBashShellPath`/`waitForLocalBashProcess`/`executeLocalBashCommand`/`createControlledLocalBashOperations` | 函数 | 1842-2332 | 本地 Bash 执行器（工作目录/stdio 排空/终止宽限/输出限额） |
| `createSafeReadToolDefinition` | 函数 | 2333-2452 | read 包装：富文档重定向 + 二进制硬阻断 |
| `tacoFilterCommandOutput` | 函数 | 2453-2493 | 命令输出过滤 |
| `installRuntimeGuardHooks` | 函数 | 2494-2530 | Agent 运行时守卫钩子 |
| `PiAgentAdapter` | 类 | 2531-3521 | `AgentProviderAdapter` 主实现（会话/prompt/事件流/中断） |
| `cleanupPiRuntimeResources` | 函数 | 3523-3534 | 空实现（残留风险注释） |

内部关键：`PI_NATIVE_MAX_RETRIES:113`、`PI_REVIEW_CONTENT_EVENTS/ACTIVITY_EVENTS:122-135`（首字节条件区分——`message_start` 只证明连接建立，`:117-120`）、`piToolExecutionContext`（AsyncLocalStorage，`:137`）、`createAsyncQueue`（`:272-445`）、`FRIENDLY_ERROR_MESSAGES:447`、`SESSION_READY_TIMEOUT_MS:459`、`PROMPT_TOO_LONG_PATTERNS:460-473`、`createActivePiSession/waitForActiveSession`（`:475-532`）、`isThinkingBlock/stripHistoricalReasoning/foldHistoricalToolContent/foldHistoricalWriteToolCalls`（`:754-877`）、`createPiReviewLedgerCompactionExtension`（`:1124-1151`）、`buildPinnedArtifactsContinuationBlock`（`:1153-1185`）、`PI_REVIEW_COMPACTION_*` 常量/提示词（`:1103` 附近与 `:1112-1113`）、`FORCE_KILL_WSL_GRACE_MS/WSL_EXPORT_ENV_KEYS`（`:1525-1539`）、`shellQuote/buildWslCommand`（`:1541-1565`）、`commandExecutionFailureError/classifyLocalBashFailure/formatLocalBashSpawnError`（`:1885-1931`）、`BLOCKED_BINARY_READ_EXTENSIONS/ALLOWED_IMAGE_READ_EXTENSIONS`（`:2320-2326`）。

## 3. 内部逻辑与关键流程

### 3.1 查询与连接

`buildPiRetrySettings`（`:159-169`）：Ollama/审核请求 `{enabled:false}`（重放已提交工具写入的风险交给人工，`:160-162`）。`buildPiRemoteConnectionSettings`/`applyPiProxySettingsForQuery`（`:345-378`）：SOCKS 代理走 SDK transport+dispatcher；HTTP 代理写 env；无代理强制清 env（防系统代理泄漏）。

### 3.2 错误归一

`friendlyErrorMessage`（`:534-543`）：>5000 字符截断+提示；正则映射 API key/validation 两类友好文案（`:447-457`）。`mapSDKErrorToTypedError`（`:654-657`）按 code 产 typed error。`extractErrorDetails`（`:582`）/`isRuntimeNotFoundError`（`:626`）/`isThinkingSignatureError`（`:553`，含 `THINKING_SIGNATURE_ERROR_*` 常量）。

### 3.3 上下文卫生

- `sanitizeContextForInference`（`:878`）/`sanitizeAndPruneOpenAIPayload`（`:948`）：空图像块等会让部分上游挂起，必须每轮请求前拦截（`:2774-2776` 注释）。
- 历史折叠三件套（`:754-877`）：思考块剥离（thinking/redacted_thinking/reasoning + Google `thought:true` part）；工具结果 >1200 字符折叠（`HISTORICAL_TOOL_RESULT_MAX_CHARS:747`）；Write/Edit 参数 >1500 字符折叠（`HISTORICAL_WRITE_ARGS_MAX_CHARS:749`）；最近 6 条不折叠（`RECENT_UNFOLDED_MESSAGES:751`）。
- 压缩续跑：`planPiCompactionContinuation`（`:1187-1202`）——abort/runtime limit/续跑上限（`MAX_AUTOMATIC_COMPACTION_CONTINUATIONS`）拦截；`buildPinnedArtifactsContinuationBlock`（`:1153-1185`）钉住 `.context/artifacts/*.index.json` 文档句柄。
- 审核压缩：`createPiReviewLedgerCompactionExtension`（`:1124-1151`）在 `session_before_compact` 用 `buildPiReviewCompactionSummary` 生成账本检查点（失败回退 Pi 原生摘要，`:1145-1148`）；审核阈值更早压缩（`calculatePiAutoCompactionReserveTokensForPolicy:1115-1122`）。

### 3.4 受控 Bash

- WSL：`windowsPathToWslPath`（`:1545`）/`buildWslBashArgs`（`:1567`）/`executeWslBashCommand`（`:1603`）——受控 WSL launcher + taskkill/SIGKILL 级联（`:1600-1602` 注释）。
- 本地：`waitForLocalBashProcess`（`:1942`）防 detached 子进程继承 pipe 导致 close 永不触发（退出后按输出重算 idle grace，absolute deadline 不重置，`:1938-1941`）；`executeLocalBashCommand`（`:2075`）/`createControlledLocalBashOperations`（`:2215`）；`spawnHook`（`:2290-2305`）在预 spawn 时 `registerPendingPiRuntimeProcess` + `piBackgroundTaskManager.begin`。
- 失败分类（`:1885-1931`）：`shell_not_found`/`working_directory_error`/`spawn_error`。

### 3.5 安全 read（`createSafeReadToolDefinition`，`:2333-2452`）

`.pdf/.docx/.xlsx/.pptx` 等 `PREINGEST_DOCUMENT_EXTENSIONS` → `redirectBinaryDocumentRead`（句柄+前 3 页）；`BLOCKED_BINARY_READ_EXTENSIONS`（exe/zip/媒体等）硬阻断；其它扩展首 512 字节探测（`%PDF-` 魔数→重定向；含 NUL→硬阻断）。

### 3.6 `PiAgentAdapter` 主类（`:2531-3521`）

- 会话装配：`buildModel`/`normalizePiApi`；DeepSeek 仅 `anthropic-messages` 协议注入 reasoning 扩展（否则污染 OpenAI 请求体，`:2683-2690`）；`extensionFactories` 组装（审核压缩/Codex 设置/项目指令/OpenAI/DeepSeek reasoning，`:2698-2719`）；`DefaultResourceLoader`（skillsOverride 在 slug 门禁后加载，`:2724-2726`）；`createAgentSession({noTools:'builtin',customTools,…})`（`:2743-2754`）；`toolExecution='sequential'`（`:2755`）。
- `prepareNextTurnWithContext` 两层包装：项目指令以追加 SystemMessage 进入下一轮（Pi 0.86 起 AgentContext 不再承载 systemPrompt，`:2757-2773`）；外层消毒（`:2774-2776`）。
- 事件流（`agent_end/auto_retry_*/summarization_retry_*/tool_execution_*` 等，`:3090-3200` 区段）：`retryTerminalGate` 门（用户停止/插入 prompt 时不得泄漏错误/result 到下一轮，`:3091-3097`）；溢出延迟（`shouldDeferPiOverflowTerminalError`，`:3101-3111`）；native retry 期间不发终态（`:3112-3115`）；`pendingTerminalResult` 延迟到 auto-compaction 后（防 orchestrator 超时 dispose 打断压缩，`:3119-3129`）；看门狗命中的终态必须带可诊断失败原因（`:3130-3138`）。
- 中断：`pendingInterruptPrompts`/`rejectPendingInterruptPrompts`/`createAbortError`（`:507-526`）；`dispose()`（`:3505-3521`）清理全部 active 会话。
- `cleanupPiRuntimeResources`（`:3523-3534`）：空实现——Pi 是 in-process runtime；bash 子进程由 pi 内部 `killProcessTree`（SIGTERM+5s SIGKILL）级联；残留风险注释（exec 长命令/stdio MCP 可能残留，pi 未导出 `killTrackedDetachedChildren`，如需兜底应 pi 侧补公开 API）。

## 4. 调用者与调用链

入向：Agent 会话/查询装配（`agent-service`/`agent-orchestrator` 等，见 §10）；`buildPromaProductToolDefinitions`/`createSafeReadToolDefinition`/Bash 操作器供会话工具装配。出向：`@profer/shared`/`@profer/core/providers`、`@earendil-works/pi-coding-agent`/`pi-ai`/`pi-agent-core`、`typebox`、`undici`、`node:*`，以及本目录 `pi-message-adapter`/`pi-model-registry`/`pi-review-watchdog`/`pi-streaming-control`/`pi-prompt-chain`/`pi-retry-control`/`pi-harness-lifecycle`/`pi-powershell-tool`/`pi-request-proxy`/`pi-skill-resources`/`pi-resource-loader-overrides`/`pi-project-instruction-scope`/`pi-codex-fast-mode`/`pi-codex-request-settings`/`pi-deepseek-reasoning-request-settings`/`pi-openai-reasoning-request-settings` 与 `../agent-runtime-guards`/`../command-execution`/`../runtime-process-registry`/`../pi-background-task-manager`/`../document-parse-tools`/`../pi-file-checkpoint`/`../error-patterns`/`../agent-permission-service`/`../agent-runtime-env`/`../project-instruction-resolver`。

## 5. 数据 I/O、读写与副作用

- 读：`.context/artifacts/*.index.json`（`:1156-1160`）、文件首 512 字节探测（`:2404-2420`）。
- 子进程：bash（本地/WSL）spawn + 进程树终止；`piBackgroundTaskManager`/`runtime-process-registry` 登记。
- 副作用：注册工具/扩展钩子；`console.warn/log`；AsyncLocalStorage 工具上下文。
- 资源回收：`activeSessions` dispose（`:3505-3521`）；WSL/本地执行器的 stdio destroy/timeout。

## 6. 分支、失败、取消与恢复

| 场景 | 行为 | 行 |
| --- | --- | --- |
| Ollama/审核请求 | 禁用 Pi 原生重试 | 162-163 |
| prompt 过长（13 种文案） | `isPromptTooLongError` 分类 | 460-473,545 |
| 思考签名错误 | 标题/文案常量 + 分类 | 553-581 |
| 会话初始化 | 60s 超时 `SESSION_READY_TIMEOUT_MS` | 459,520-532 |
| 溢出终态 | 延迟到原生压缩恢复后 | 1084-1102,3101-3111 |
| 看门狗 | 终态强制失败原因 | 3130-3138 |
| 中止/插 prompt | 错误与 result 不泄漏下一轮 | 3091-3097 |
| bash 失败 | 三分类错误 + 友好文案 | 1885-1931 |
| 二进制 read | 硬阻断/重定向 | 2380-2445 |
| dispose | 拒绝 pending prompts + abort | 3505-3521 |

取消：`abortRequested`/`interrupting` 状态机（`:485-506`）；恢复：native retry（≤8）、压缩续跑（有上限）、看门狗超时。

## 7. 权限与权威状态

- 工具权限经 `wrapToolWithPermission`（`:1014`）与 `canUseTool`（注入 `agent-permission-service`）。
- `toolProfile:'review'` 仅注册审核业务工具（`:186-187` 注释 N2d）；`contextPolicy:{kind:'review'}` 仅辅助审核工作台绑定启用。
- 项目指令为 Profer 已验证文件，不触发 Pi 磁盘自动发现（`:75-76`）。

## 8. 修改影响面

- 改 `PiAgentQueryOptions` 影响整个 Agent 查询链与渲染层参数。
- 改事件流/重试门影响 orchestrator 的终态语义与前端显示。
- 改 Bash/read 包装影响工具执行安全边界与 `pi-agent-bash.test.ts`/`pi-agent-adapter.test.ts` 断言。

## 9. 测试证据

直接测试（本批）：`pi-agent-adapter.test.ts`（185 行）、`pi-agent-bash.test.ts`（329 行）、`pi-agent-proxy.test.ts`（130 行）、`pi-adapter-module-smoke.test.ts`（32 行）——详见各自手册。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/网络。

缺口（静态判断）：`PiAgentAdapter` 事件流大状态机、看门狗、压缩续跑、WSL 执行器的分支覆盖以测试手册为准；真实模型/网络路径无自动化断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| SDKMessage 兼容协议（不改名） | 已证实 | 文件头 `:1-6` |
| 首字节区分（message_start≠生成） | 已证实 | `:115-120` |
| 审核/ollama 禁原生重试 | 已证实 | `:160-163` |
| 空图像块拦截/历史折叠 | 已证实 | `:754-877,2774-2776` |
| 溢出延迟/终态门/看门狗 | 已证实 | `:1084-1102,3091-3138` |
| 二进制 read 硬阻断 | 已证实 | `:2380-2445` |
| cleanup 空实现+残留风险注释 | 已证实 | `:3523-3534` |
| 生产装配点 | 未知 | 本批未逐行核 orchestrator/service |
| 真实 SDK/模型行为 | 未知 | 未运行 |

## 11. 覆盖表

| 职责 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 查询选项/连接/代理 | §3.1 | 159-378 | covered |
| 错误归一 | §3.2 | 447-657 | covered |
| 上下文消毒/折叠 | §3.3 | 754-948 | covered |
| 压缩续跑/审核压缩 | §3.3 | 1103-1217,1355-1450 | covered |
| WSL/本地 Bash | §3.4 | 1525-2332 | covered |
| 安全 read | §3.5 | 2320-2452 | covered |
| 产品工具/权限包装 | §3.6 | 1014-1083,1451-1523 | covered |
| 主类事件流/生命周期 | §3.6 | 2531-3521 | covered |
| 测试断言 | §9 | — | 见测试手册 |
