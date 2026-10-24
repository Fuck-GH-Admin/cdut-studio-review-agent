# STAGE2 轨道核对 — 模型/运行时/权限（CHAINS.md）

- 根：`docs-r07-index-qa-extra-01-20261024`（DSH 执行；Codex 只统筹）。开始 `2026-10-23T21:29Z`（date -u）。
- 源：`baseline/source@05fb2565e20eb1760233696be1832f68196b37c2`，只读；已核 HEAD 一致、clean。
- 事实依据：`inventory/FILES.tsv`、`ACCEPTED.json`、`INDEX-ACCEPTED.json`、`candidate/source-reference`、冻结源码。旧 922 legacy 不继承接受。
- 标注：**证实**=本轨亲自读源核到 file:line（caller/callee/分支/参数/副作用）；**推断**=由已证实代码推出未实跑；**待验**=本轮未逐边核实，仅登记待查（不冒充已验）；真实运行 NOT_RUN。
- 本文不写阶段三文档（无 CODEBASE-MAP/ARCHITECTURE）；不复制手册正文。

## C1 provider 选择与 fallback

- 入口（待验→部分证实）：渠道/模型清单与断言 `apps/electron/src/main/lib/agent-model-selection.ts:24` `assertEnabledModelForChannel`、`:54` `listEnabledAgentModelsForChannel`；路由策略 `agent-model-routing.ts:27` `resolveAgentModelRouting` → `:48` `applyAgentModelRoutingToEnv`（把路由结果落到环境，终点=env 注入）。
- provider→SDK 归一：`lib/adapters/pi-model-registry.ts:233` `normalizePiApi(provider, baseUrl)`（provider 归一为 Pi Api）；`:615` `buildModel`、`:754` `buildCodexModel`、`:573/:608/:836` Codex/XAI 目录拉取；`:537` `resolvePiApiKey`、`:511` `buildPiRequestHeaders`（凭据进入请求头）。
- fallback 语义、渠道禁用分支、实际可调用差异（C5）：**待验**（下一轮补 caller/分支）。

## C2 Pi 链（运行时 A）

- 入口：`lib/adapters/pi-agent-adapter.ts`（agent 适配器；`:159` `buildPiRetrySettings(provider,{isReviewRequest})`=重试策略入口，review 与普通分流参数已见）、`:345` `buildPiRemoteConnectionSettings`、`:379` `applyPiProxySettingsForQuery`（代理链边，proxy→查询设置）。
- 生命周期/取消：`pi-harness-lifecycle.ts`（待验）、`pi-retry-control.ts`（待验）、`pi-native-retry.ts`（待验）、`:273 abortRequested`、`:487 abortRequested:false`（取消状态字段已见，恢复/清理边待验）。
- 错误面：`:534 friendlyErrorMessage`、`:545 isPromptTooLongError`、`:553 isThinkingSignatureError`、`:626 isRuntimeNotFoundError`、`:654 mapSDKErrorToTypedError`（错误映射→TypedError）。
- 上下文净化：`:878 sanitizeContextForInference`（副作用边界待验）。
- prompt 链：`pi-prompt-chain.ts`（待验）；消息面 `pi-message-adapter.ts`（待验）。

## C3 gateway 链（运行时 B）

- 涉及文件（grep "gateway" 命中，调用边待验）：`lib/agent-fabric/agent-fabric-service.ts`、`lib/agent-fabric/fabric-server.ts`、`lib/review/review-ipc.ts`、`lib/review/ai-review-service.ts`、`lib/review/review-v3-t01-model-draft-service.ts`、`lib/review/run-async-service.ts`。
- 入口→持久化/输出、与 Pi 链的分工/回退：**待验**（30 分钟窗口内未逐边核完，记缺口）。

## C4 凭据/代理/OAuth/子进程

- 凭据：`lib/agent-runtime-credentials.ts`（OAuth 命中；含运行时凭据装配，写入/不落盘边界待验）。
- OAuth：`lib/codex-oauth-service.ts`；`ipc.ts`（OAuth IPC 入口，待验具体 handler 行号）。
- 代理：`lib/adapters/pi-request-proxy.ts`（C2 :379 已见消费边）；`pi-agent-proxy.test.ts` 为测试（非证据）。
- 子进程：`pi-powershell-tool.ts`、`pi-harness-lifecycle.ts`（子进程生命周期/清理待验）；`agent-runtime-env.ts`（env 装配待验）。

## C5 工具权限/MCP 与「模型自检 vs 实际可调用」

- 权限：`lib/agent-permission-service.ts`（导出签名本轮 grep 未命中=待验，不冒充）；`agent-preset-manager.ts`/`agent-preset-operations.ts`（预设=权限策略源，待验）；`agent-orchestrator-permission-wiring.p06.test.ts` 为测试（非证据）。
- MCP：`lib/mcp-validator.ts`、`lib/adapters/pi-mcp-tools.ts`、`lib/lark-mcp-service.ts`（接入点/校验边待验）。
- 模型自检 vs 实际可调用差异：**待验**（候选线索：`pi-codex-fast-mode.ts`、`pi-codex-request-settings.ts`、渠道 enabled 清单 C1；未核前不结论）。

## C6 review 与普通 chat 绕行入口

- 线索（待验）：`lib/review/review-ipc.ts`、`lib/review/ai-review-service.ts`、`lib/adapters/pi-review-ops-tools.ts`、`pi-review-watchdog.ts`；`buildPiRetrySettings` 的 `isReviewRequest` 分支（pi-agent-adapter.ts:159，已见签名=review/普通分流参数存在，语义待验）。
- 绕行=直连工具/独立 IPC 还是复用 chat 入口、权限差异、审计落点：**待验**。

## C7 取消与清理

- 已见：`pi-agent-adapter.ts:273/:487 abortRequested`（状态字段）。
- 待验：AbortController 传播、`pi-retry-control`/`pi-harness-lifecycle` 清理顺序、会话/临时文件回收、watchdog 复位。

## 缺口声明（诚实边界，不虚报 DONE 完整）

- 本版为 15 分钟窗口内**第一份实物**：C1/C2 关键边已实核（上列 file:line 为本人 grep/读源所得），C3-C7 以**待验**登记并给出候选文件；30 分钟窗口内继续补边并发布 CHAIN-REGISTER.tsv / CONFLICTS.json / RESULT.json / DONE.json。

## 补核结果（30 分钟窗口内收口；标注见各行）

- **C1 全链证实（本人逐行）**：`assertEnabledModelForChannel`（agent-model-selection.ts:24）三重守卫分支（modelId 空→throw；无 channelId→throw；`getChannelById`+`isChannelEnabledForRuntime` 失败→throw；`channel.models.find(enabled)` 不中→throw），真实 caller=agent-collaboration-tools.ts:800、agent-session-manager.ts:1923；`listEnabledAgentModelsForChannel`（:54）=自检清单面，caller=agent-collaboration-tools.ts:708；`resolveAgentModelRouting`（agent-model-routing.ts:27，caller agent-orchestrator.ts:1232）deepSeekFamily 判定（provider==='deepseek'||前缀）+1M 三态+`DEEPSEEK_SUBAGENT_MODEL_ID='deepseek-v4-flash'`；消费边=orchestrator:2082 `deepSeekSubagentModel` 传参（下游 SDK 装配边待验）。**`applyAgentModelRoutingToEnv`（:48）生产零调用**（仅 test）→CONFLICTS C-03。
- **C3 gateway 双链证实**（本轨调查组逐行+本人抽查 5 处全命中）：`review-model-gateway.ts`=远程 API 网关（provider 白名单 `REVIEW_MODEL_PROVIDERS` 4 项，shared review.ts:478 本人亲读；`isAllowedProvider` :156-158；`performChatCompletion` :303-433 ollama `/api/chat` / openai 系 `/chat/completions`+Bearer :353-358+代理尊重用户配置 :362-363+Abort/timer :368-374+429 指数退避 3 次 :379-401；凭据 `resolveReviewGatewayChannel` :246-261→decryptApiKey）；6 条链入口→持久化：rule-outline（review-ipc.ts:1422-1433→ai-review-service:356→updateCase:422→`~/.cdutai/review-cases/{caseId}/case.json` 原子写 case-store.ts:64-69）、extract-items（:1435-1443→:495→case.json）、run-review V1（:1452-1458→run-service:57→`runs/{runId}.json`）、assistant-chat（:1471-1482→无持久化+staticAssistantAnswer 降级）、gateway-status（:1495-1497 只读）、T01（:977-982 **有** assertC0ReviewMainSender :978）。V2 运行（review-v2:run-review/run-batch :1087/:1070 无 sender guard；review_start_run pi-review-ops-tools.ts:431-455 requireAssignment→run-async-service:102→run-service-v2:97→`runs-v2/{runId}.json`+artifacts）。`AgentFabricGateway`（packages/agent-fabric/src/gateway.ts:189-213）=本地 loopback 网关（fabric-server.ts:123-136 Bearer+sha256 配对；能力闸 assertCapability TASK_SUBMIT :229；持久化 `~/.cdutai/agent-fabric/*` fabric-store.ts:48-163），与 A1 无调用关系。
- **C6 绕行证实**：`createPiReviewModelClient`（pi-review-agent-client.ts:77-202，`permissionMode:'bypassPermissions'` :144 本人亲读；toolProfile review :148；customTools 仅 review 工具 :87-94；finally rmSync :181）完全绕过 orchestrator（无 canUseTool/预设/会话持久化）；`isAuthorizedDirectReviewTool`（review-strict-pi-tools.ts:51-58 本人亲读）=5 工具白名单+`verifyCurrentBinding` 三元组校验；orchestrator `canUseTool` 短路（:1851-1854）旁路用户审批/权限模式/SAFE_TOOLS，工具面收窄 `selectDirectReviewStrictTools` :1706。
- **C7 取消清理证实（调查组）**：网关 Abort+可中断退避+finally clearTimeout（review-model-gateway.ts:368-424）；`cancelAsyncRun`（run-async-service.ts:215-225 三杀、cancelled/failed 终态 :192-205、延迟清表 :206-208）；watchdog（pi-review-watchdog.ts:22/:24 240s/20min、判定 :98-121）+`abortReviewTurn`（pi-agent-adapter.ts:2847-2858）+`cleanupActiveSession`（:2578-2597）；`stopBackgroundPiReview`（review-pi-run-bridge.ts:110-128 stopAgentAndWait→finish+revokeAssignment）。
- **仍缺（不虚报完整）**：C4 凭据/OAuth/代理生产端/子进程（内部调查组中断，含「凭据严禁进 process.env/日志」断言待验）；C5 agent-permission-service 导出 API、MCP 接入边、「模型自检 vs 实际可调用差异」；C2 内部边（pi-prompt-chain/pi-message-adapter/sanitizeContextForInference/buildModel fallback）；C-05 决策 #27 一致性。详见 RESULT.json.gaps 与 CONFLICTS.json。
