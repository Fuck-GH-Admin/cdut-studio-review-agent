# gateway 双链 + review 绕行入口 调查报告（源码只读，git HEAD 05fb2565）

路径基准 S=/home/miku/Bot/CDUTStudio/agent-ops/docs-r07-20261023/baseline/source。下文 file:line 均相对 S。除标注外全部为 证实（本人逐行读过代码）。

## 0. 结论先行："gateway" 是两者都有

- A1 = `apps/electron/src/main/lib/review/review-model-gateway.ts`：**远程 API 网关**（内容审核专区唯一模型出口，HTTP 直发 OpenAI 兼容 / Ollama 供应商）。证实（文件头注释 :1-11）。
- A2 = `packages/agent-fabric/src/gateway.ts` `AgentFabricGateway`：**本地 fabric 服务的进程内网关类**，由 loopback HTTP/SSE 传输（`fabric-server.ts`）承载。证实。
- 二者无调用关系（review-model-gateway.ts 全文无 fabric 引用；grep "gateway" 双向核对）。证实。

---

## A1. review-model-gateway（远程 API 网关）链

### 网关核心（所有链共用）
- 白名单闸：`isAllowedProvider` review-model-gateway.ts:156-158 → `REVIEW_MODEL_PROVIDERS = ['openai','deepseek','custom','ollama']`（packages/shared/src/types/review.ts:478）；`performChatCompletion` 入口强制拒绝非白名单 :308-311（抛 `REVIEW_MODEL_PROVIDER_REJECTED_NOTICE`）。证实（注意：文件头注释说"三种 provider"，实际白名单是 4 个含 deepseek——注释与代码不一致，代码为准）。
- 渠道选择：`findFirstAllowedChannel` :170-182（显式选择优先→`getEffectiveReviewModelSelection` module-settings-store；否则首个可用渠道）；`isUsableReviewChannel` :184-189（provider 白名单 + channel.enabled===true + ollama 免模型清单）。证实。
- 凭据：`resolveReviewGatewayChannel` :246-261 → `decryptApiKey(channel.id)`（channel-manager，密文存 ~/.cdutai/channels.json）；解密失败→undefined（降级不抛）。证实。
- 传输：`performChatCompletion` :303-433。URL：ollama → `${baseUrl}/api/chat` :320-322；openai 系 → `resolveOpenAIChatCompletionsUrl` + 兜底补 `/chat/completions` :323-328。鉴权头 Bearer :353-358（ollama 空 key 可省）。代理尊重用户配置 :362-363（`getEffectiveProxyUrl`/`getFetchFn`）。请求体 stream:false、temperature 默认 0.2 :342-351。
- 超时/取消：`AbortController`+内部 timer :368-369；外部 signal 穿透 :371-374；429 限流最多 3 次指数退避（8s/16s/24s）:379-401（`waitForRetry` review-model-identity.ts:22 可被 abort）；错误分支 :404-422（非 2xx 截断 500 字、超时/取消按信号来源区分语义、网络错误中文包装）；finally `clearTimeout` :424。证实。
- 多模态降级：`chatCompletionWithMeta` :283-301 — 图片请求失败疑似不支持多模态→去图重试一次、`imagesDropped=true`。证实。
- **权限负发现**：`grep -n "checkAssignment\|assertC0\|assertSafe\|assertMain\|requireAssignment\|isAuthorized" review-model-gateway.ts` → 0 命中（exit=1）。即网关路径只有"provider 白名单"这一道技术闸，无 actor/会话/指派授权（授权在 IPC 层，见各链）。证实。

### 链 A1-1 规则大纲
`review:generate-rule-outline`（channel 名 packages/shared/src/types/review.ts:546）→ handler review-ipc.ts:1422-1433（`requireString` + 原生案卷拦截 :1426-1428）→ `generateRuleOutline` ai-review-service.ts:356 → `resolveReviewGatewayChannel` :368 → `chatCompletion` :410（maxTokens）→ `parseOutline(extractJson)` :411 → **回写** `updateCase` :422-434（case-store.ts:278，逐案串行写队列）→ `~/.cdutai/review-cases/{caseId}/case.json`（原子写 case-store.ts:64-69 `.tmp`+rename；根目录 getConfigDir = `~/.cdutai[.dev]` config-paths.ts:33-59）→ handler 补 `syncWorkspaceProjectionV2` :1429。错误：无网关→demo 案卷回退 fixture 大纲 :372-380 / 真实案卷抛错 :381；catch→demo 降级 :430-435 / 真实案卷抛错（不动已有大纲）:437-438。**无 sender guard**（负发现，见文末 S1）。全部证实。

### 链 A1-2 条目识别
`review:extract-items`（review.ts:548）→ review-ipc.ts:1435-1443（requireString + 原生案卷拦截）→ `extractItems` ai-review-service.ts:495 → `resolveReviewGatewayChannel` :504 → `chatCompletionWithMeta` :549 → `parseItems` :550 → **回写** `updateCase` :562-568（→ case.json）→ handler `syncWorkspaceProjectionV2` :1441。错误：无网关→非 demo 抛 :507 / demo 返回既有条目 :508-510；catch→非 demo 抛 :570 / demo 降级 :571-573。**无 sender guard**（S1）。证实。

### 链 A1-3 审核运行（V1）
`review:run-review`（review.ts:550）→ review-ipc.ts:1452-1458：engine = `getReviewModelGatewayStatus().available ? 'ai' : 'mock-engine'` :1456（原生案卷拦截 :1454-1455）→ `startReviewRun` run-service.ts:57 → 先落 running 占位 `saveRun` :88-89 → `runAiReview` ai-review-service.ts:803 → `resolveReviewGatewayChannel` :808 → 输入校验（零依据/零待审文件硬失败 :817-824，先于降级 catch）→ `chatCompletionWithMeta` :896-899（`timeoutMs: REVIEW_RUN_TIMEOUT_MS` = 150s，review-model-gateway.ts:39）→ `parseFindings`+`sanitizeFindingSources`（伪引用降级）:902-905 + 分值守门 :918-928 → **落盘** `saveRun` run-service.ts:131 → `~/.cdutai/review-cases/{caseId}/runs/{runId}.json`（case-store.ts:377）。错误：无网关→demo mock :810-813 / 真实抛 :809；catch→demo 降级 mock :946-951 / 真实抛 :945；run-service 引擎异常一律吞成 failed run :100-117（不向上抛）。**无 sender guard**（S1）。证实。

### 链 A1-4 审核助手对话
`review:assistant-chat`（review.ts:662）→ review-ipc.ts:1471-1482（history 只留 user/assistant 角色 :1476-1480，防渲染层伪造 system 提示注入）→ `reviewAssistantChat` ai-review-service.ts:1032 → `resolveReviewGatewayChannel` :1039 → `chatCompletion` :1083（maxTokens 1024）→ 返回 `{content,references,degraded}`，**无持久化**。错误：无网关/任何失败→`staticAssistantAnswer` 静态降级 degraded:true :1044-1045 / :1103-1105。**无 sender guard**（S1）。证实。

### 链 A1-5 网关自检
`review:get-model-gateway-status`（review.ts:666）→ review-ipc.ts:1495-1497 → `getReviewModelGatewayStatus` review-model-gateway.ts:207-242 → `listChannels()`（channel-manager 读 ~/.cdutai/channels.json）。只读输出 `{available, protocol, channelName, modelId|reason}`，无网络、无持久化。证实。

### 链 A1-6 T01 受控起草
`review-v3:t01-model-draft`（review.ts:614）→ review-ipc.ts:977-982（**有 guard** `assertC0ReviewMainSender(event)` :978，review-c0-authority.ts:21；参数校验 :979）→ `requestT01ModelDraft` review-v3-t01-model-draft-service.ts:31 → `resolveReviewGatewayChannel` :36（不可用抛 `T01_MODEL_GATEWAY_UNAVAILABLE` :37）→ `chatCompletion` :39-45（timeout 120s :28）→ 长度闸 :47-48（>60000 字符抛 `T01_MODEL_RESPONSE_TOO_LONG`）→ 返回 `{raw, channelName, modelId}` :50-54，**Main 不持久化**（草稿保存在 T01 模板侧）。证实。

### 链 A1-7 V2 真实运行（双出口：Pi Agent client + 直发 vision）
入口三处（同一服务函数）：
1. IPC `review-v2:run-review`（review.ts:559）review-ipc.ts:1087-1091（仅 `assertSafeReviewStorageId`，**无 sender guard**，S1）；
2. IPC `review-v2:run-batch`（review.ts:635）review-ipc.ts:1070-1085（**无 sender guard**，S1）→ `runBatchQueue` 循环 `assembleAndRunReview` :1074-1079；
3. Agent 工具 `review_start_run` pi-review-ops-tools.ts:431-455（授权 `requireAssignment` :443→checkAssignment）。
→ `assembleAndRunReview` run-async-service.ts:102 / `startReviewRunAsync` :144（预分配 runId、先落 queued `saveRunV2` :183）→ `assertCaseReadyForReview` :83-99（draft/archived/缺材料硬闸）→ `assembleReviewClient` :32-79：
  - (a) 文本 client：`createPiReviewModelClient` pi-review-agent-client.ts:77 → `PiAgentAdapter.query`（**直连 Pi 运行时，绕过 agent-orchestrator**，详见 B2）；
  - (b) 视觉 `imageInspector` 闭包 run-async-service.ts:60-71 → `chatCompletionWithMeta`（review-model-gateway 直发，timeout 150s、signal 穿透、retryWithoutImages:false、maxTokens 1000）；
  - (c) `SystemTesseractOcrPort.create()` :78。
→ `runReviewCaseV2` run-service-v2.ts:97（图执行；节点产物 `writeArtifact`→`saveArtifact` :192-195）→ **落盘** `saveRunV2` run-store-v2.ts:24 → `~/.cdutai/review-cases/{caseId}/runs-v2/{runId}.json` + `runs-v2/{runId}/artifacts/{nodeId}.json`（run-store-v2.ts:148-152）。错误：无渠道抛 :37/:156（"未配置可用模型渠道"）；显式模型失效抛 :42-44；失败落 failed/cancelled run（run-async-service.ts:192-205）。全部证实。

### A2. AgentFabricGateway（本地 fabric 服务）链
- 启动入口：main/index.ts:966-967（`safeRun('startAgentFabricService')`，仅显式启用 PROFER_AGENT_FABRIC=1 或 agent-fabric.json）→ `startAgentFabricService` agent-fabric-service.ts:77-136：config → 文件任务存储/事件日志 fabric-store.ts:48/:111 → `new AgentFabricGateway` :91-95 → 注册本节点 :112 → 孤儿任务恢复 `expireOrphanedTasks` :115 → `startFabricServer` :121-127 → 心跳 timer :129。证实。
- 传输：`fabric-server.ts`（默认 127.0.0.1 :187；端点清单 :10-20：/v1/health、/v1/agents、/v1/tasks、/v1/tasks/:id[/cancel|/result|/artifacts|/events]、/v1/artifacts/:id）。证实。
- 鉴权：`requireCaller` fabric-server.ts:123-136 → Bearer token → `authenticateToken` fabric-pairing.ts:89-100（比对 sha256 哈希，存储 `~/.cdutai/agent-fabric-clients.json` :41-42）→ CallerContext trust=`PAIRED_LOCAL_AGENT`+grants；失败抛 `CALLER_NOT_PAIRED`（403，fabric-server.ts:65-68）。健康检查免认证 :199-202。actor 防冒充：envelope.actor 强制覆盖为认证身份 :221-223。证实。
- 业务/能力闸：`AgentFabricGateway.submitTask` packages/agent-fabric/src/gateway.ts:189-213（幂等 requestId 去重 :193-207）→ `acceptNewTask` :215-249：路由仅限注册表 :219、`assertCapability(TASK_SUBMIT)` :229、非 READ_SHARED 加 `WORKSPACE_WRITE` :232-234、单写租约/并发上限（writerLeases/runningByAgent :146-148）。读/取消/产物各有 `assertTaskCapability`（getTask :256、getArtifact :282-288 + 有效期 `assertArtifactReadable`、cancelTask :294-312 `TASK_CANCEL`）。证实。
- 执行：`fabric-executor-headless.ts`：任务→真实 Agent 会话（createAgentSession :112）→ `runRegisteredHeadlessAgent` :134（`permissionModeOverride: 'bypassPermissions'` :141，头注释 :12-15 明示无人值守免审批、审批转发留 Phase 2/4）→ `reporter.complete(buildTaskResult)` :154。产物内容读取受控：`readArtifactContent` agent-fabric-service.ts:51-65（仅 session-transcript-* 前缀，512KB 截断）。证实。
- 最终持久化：`~/.cdutai/agent-fabric/tasks/{taskId}.json`、`results/{taskId}.json`、`artifacts.json`、`request-index.json`（fabric-store.ts:48-109）、`events/{taskId}.jsonl`（:111-163）。均文件 JSON，无 DB。证实。
- 配对负发现：`pairClient` fabric-pairing.ts:68 应用内无调用方——`grep -rn "pairClient\|agent-fabric-clients"` 全仓仅 fabric-pairing.ts 自身 + `scripts/agent-fabric-pair.mjs`（Phase-1 配对=用户手动跑脚本，fabric-pairing.ts:8-11 注释）。证实。

---

## B. review 直连 model/runtime 的绕行入口（vs 正常 chat 路径）

正常 chat 路径 = 渲染层→IPC→`runAgent`（agent-service）→`agent-orchestrator`（会话/预设/canUseTool/重试/工具装配）→`PiAgentAdapter`→Pi SDK。以下为绕行面：

### B1. review-model-gateway HTTP 直发（A1 全部链）
绕行点：不经 agent-orchestrator，无会话、无 canUseTool、无工具、无编排层重试；自建 prompt、自管重试（429×3 退避 review-model-gateway.ts:379-401 + 去图重试 :283-301）。与正常路径差异：重试策略（编排层是 `shouldRetryFromError` 瞬时错误重试 agent-orchestrator.ts:2545/3197）、权限（无）、上下文（无会话压缩/历史，单发消息）。证实。

### B2. createPiReviewModelClient：一次性 Pi 会话直连运行时（最大绕行面）
`run-async-service.assembleReviewClient` → `createPiReviewModelClient` pi-review-agent-client.ts:77-202：每个语义调用建**临时 Pi transcript**（`review-{uuid}`，mkdtemp tmpdir :94-95），关键参数：`permissionMode: 'bypassPermissions'` :144、`toolProfile: 'review'` :148、`maxTurns: 24` :151、`thinkingLevel: 'off'` :152、`customTools` 仅 review 语义工具 :87-94、结束即 `rmSync` 删会话目录 :181。**完全绕过 agent-orchestrator**（无 canUseTool、无预设、无会话持久化、无编排层重试）。
- 取消/超时：signal→`AbortError` :120-125；deadline timer→`Pi 审核 Agent 超时` :104-108；finally 清 timer+删目录 :179-181。
- 降级：工具已执行但无摘要→`REVIEW_TOOL_RESULT_FALLBACK` :168-175；可恢复服务失败（5xx/timeout/fetch failed，正则 :71-74）→`REVIEW_TIMEOUT_FALLBACK` :174-176；视觉失败→去图重试一次 :193-198。
- 输出：结构化 JSON 文本交 `runReviewCaseV2` 解析 → runs-v2 落盘（A1-7）。证实。

### B3. 模型回合内的运行触发工具（pi-review-ops-tools.ts）
`buildReviewOpsTools` pi-review-ops-tools.ts:77（装配点 pi-builtin-tools.ts:2083-2103：review-operator 预设+directReviewBinding 时注入）。写类工具前置授权 `requireAssignment` :201-208 → `checkAssignment` review-agent-assignment.ts:259-315（撤销 :286、turnTriggeredBy 必须 'user' :307-308、动作白名单 :310-311）。
- `review_start_run` :431-455 → `startReviewRunAsync`（= B2 的后台模型调用，模型可自行拉起一次真实审核）；
- `review_cancel_run` :492-517 → `cancelAsyncRun`；
- `review_submit_result` :157-199（绑定版，无 assignmentId 参数，binding 由应用注入）→ `submitPiReviewResultV2` pi-case-review-service.ts:915 → `saveRunV2`+`saveArtifact`（node-pi-submit-attempts :1045-1052 等）→ runs-v2 落盘。
差异：正常 chat 工具走 canUseTool 各权限分支+用户审批；这里是 Main 侧指派校验直接执行。证实。

### B4. `isAuthorizedDirectReviewTool`（直接审核授权闸）
位置 review-strict-pi-tools.ts:51-58。授权条件：①工具名 ∈ `STRICT_RUNTIME_TOOL_NAMES` :41-45（review_read_documents / review_inspect_document_image / review_submit_result / review_inspect_original / CompactContext，其余全拒）；②`verifyCurrentBinding` :35-41——binding 必须与 `getPiReviewBindingForSession(sessionId)` 现状完全一致（caseId/runId/assignmentId 三元组，指派一变立即失效）。
- binding 来源（谁授权）：`getPiReviewBindingForSession` pi-case-review-service.ts:531-538 = 活跃指派（`findActivePiReviewAssignment`，非撤销 :75-81）+ run 绑定（`bindRunToAssignment` review-agent-assignment.ts:233-241）+ run.status==='running' 且非 interrupted。指派创建：`preparePiReviewRunV2` pi-case-review-service.ts:452-529（`createAssignment` :486-491，actions=['submit-result']）——入口 IPC `review-v2:prepare-pi-review` review-ipc.ts:1093-1107（校验 assertOrdinaryAgentSession + 会话 runtime=pi + 预设必须 review-operator :1101-1105）或 `startBackgroundPiReview` review-pi-run-bridge.ts:26→prepare :99。
- 触发条件（agent-orchestrator.ts:1433-1445）：agentRuntime==='pi' && 预设 review-operator && triggeredBy==='user' && 存在 binding。
- 用法（绕过什么）：agent-orchestrator.ts:1851-1854——`canUseTool` 首段短路：binding 有效→仅上述 5 工具放行，**其余一律 deny**；注释明示"普通 auto 权限弹窗不可见时若沿用通用审批会导致后台永久等待；Main 校验指派后放行"。即：**绕过正常 chat 的用户审批/权限模式/plan 模式/SAFE_TOOLS 全套语义**，换成指派白名单。同时工具面收窄：1706 `selectDirectReviewStrictTools`（review-strict-pi-tools.ts:87-…）替代全部 builtin+MCP 工具（正常路径 1708-1709）。原件工具还做路径沙箱 `originalForCurrentBinding` :67-85（realpath 限定案卷目录内）。
- 模型调用与输出：本轮模型仍走 runAgent→PiAgentAdapter（此路**经过** orchestrator，被绕过的是权限/工具/审批子系统，且 contextPolicy 走 review 压缩策略 agent-orchestrator.ts:2174-2180）；输出经 review_submit_result→runs-v2（B3）。ABORT 兜底：`review-v2:abort-pi-review` review-ipc.ts:1132-1143——binding 三元组复核 :1138 后 `finishPiReviewRunV2(failed)`+`revokeAssignment`。
全部证实。

---

## C. 取消 / 清理边（沿路所见）

- review-model-gateway.ts:368-374 超时 timer+外部 signal 并联 abort；:394 退避等待同受 abort；:413-424 按信号来源区分"已取消/超时"，finally clearTimeout。证实。
- run-async-service.ts：`activeRuns` 注册表 :26-27；`cancelAsyncRun` :215-225 三处同杀（注册表+`cancelRunV2` 运行图+controller.abort）；错误路径落 cancelled/failed :192-205；finally 延迟 5s 清注册表 :206-208。证实。
- run-service-v2.ts:20-27 `cancelRunV2`/`isRunCancelled`；:185 取消后不再启动新节点（K18）。证实。
- pi-review-agent-client.ts:104-127 超时/abort→`options.abort(sessionId)`+reject；finally :179-181 clearTimeout+rmSync 临时目录。证实。
- pi-review-watchdog.ts（判定器，248 行）：首字节超时 240s（:22，可 env 覆盖 :52-56，低于传输层 300s 空闲超时 :44-50）、整轮无进展 20min（:24）；`evaluatePiReviewWatchdog` :98-121 纯函数判定；触发后文案刻意避开"可重试"特征 `isWatchdogReasonRetryable` :235-241 + `formatDuration` :84-92。证实。
- 看门狗接线 pi-agent-adapter.ts：仅 review 档案启用 :2822-2842（`isReviewProfile`）；5s 周期 timer :2867-2875（fire-once :2871-2872）；`abortReviewTurn` :2847-2858（断在途请求 + `session.abort()`）；触发后新请求直接拒止 :2893-2894（`startRequest()===true→abort`）；终态改写 `applyWatchdogToAssistantError`/`TerminalReason`（watchdog :218-248；adapter :2968-2970、:3064-3066、:3132-3136、:3376-3384）。清理序 `cleanupActiveSession` :2578-2597：clearInterval(reviewWatchdogTimer)→releaseActiveRequestSignal→coalescer.dispose→session.dispose；:3286/:3379 finally 挂接。证实。
- review-pi-run-bridge.ts：`stopBackgroundPiReview` :110-128——先 `stopAgentAndWait`（释放真实执行权）再 finish+revoke :121-125；`busyCases` 短临界区 finally 释放 :126-128；start 失败→finish(failed)+revokeAssignment :104-108。证实。
- fabric：SSE 流清理 fabric-server.ts:174-182（res close→clearInterval+unsubscribe；终态事件自动收流 :160-170）；`cancelTask` gateway.ts:294-312（executor.cancel :302 + 释放并发/写租约 :306）；`stopAgentFabricService` agent-fabric-service.ts:141-147（clearInterval 心跳→server.close→state=null）。证实。
- case-store 原子写 :64-69（.tmp+rename，中断不留半写文件）。证实。

---

## 负发现（附所跑检索）

- S1. AI 网关 6 个 IPC 入口**无 sender/actor guard**：`grep -n "assertC0ReviewMainSender(event)\|assertMainWindowSender(event" apps/electron/src/main/lib/review/review-ipc.ts` 共 43 处（行号 159…1382），不含 GENERATE_RULE_OUTLINE(:1423)、EXTRACT_ITEMS(:1435)、RUN_REVIEW(:1452)、ASSISTANT_CHAT(:1472)、RUN_REVIEW_V2(:1087)、RUN_BATCH_V2(:1070)；逐一读了 handler 体确认无其他调用（T01_MODEL_DRAFT :978 有 guard，对照成立）。对照总量 `grep -c "ipcMain.handle"` = 105。证实。
- S2. review-model-gateway.ts 内无任何授权符号（grep `checkAssignment|assertC0|assertSafe|assertMain|requireAssignment|isAuthorized` → 0 命中，exit=1）。证实。
- S3. review-model-gateway 仅 5 个消费文件（grep "review-model-gateway"）：review-ipc.ts:57（仅 status）、ai-review-service.ts:54、review-v3-t01-model-draft-service.ts:11、run-async-service.ts:34/:148。证实。
- S4. `pairClient` 无应用内入口（grep 全仓 `pairClient|agent-fabric-clients` → 仅定义文件 + scripts/agent-fabric-pair.mjs）。证实。
- S5. fabric 无 IPC 入口：grep "fabric" apps/electron/src/main/{ipc.ts,index.ts} → 仅 index.ts:195/964-967/1270（启停），无 ipcMain 面。证实。

## 未知/未核
- `scripts/agent-fabric-pair.mjs` 内部（未读，仅 grep 到写同一配对文件）。
- `runRegisteredHeadlessAgent`（agent-headless-runner-registry.ts）内部执行细节（执行边已见 fabric-executor-headless.ts:134-154，内部未逐行核）。
- A2 的 HTTP 端点是否有 TLS/防火墙约束（默认绑 127.0.0.1 已见 fabric-server.ts:187；host 可配自 fabric-config，具体默认值未逐行核）。
