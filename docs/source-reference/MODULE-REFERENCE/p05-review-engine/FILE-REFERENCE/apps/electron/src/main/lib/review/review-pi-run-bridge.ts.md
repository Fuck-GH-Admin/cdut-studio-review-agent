---
path: apps/electron/src/main/lib/review/review-pi-run-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03407ce4cf194933a827fca959c955f29cd65c6a
sha256: 5400a59e753a09be08dfc371589af4a619850be5ba12de1e4ad334b6ec545d93
lines: 129
kind: source
package: p05-review-engine
author: docs-r07-author-models-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-pi-run-bridge.ts

## 1. 结论与边界

「后台 Pi 审核」的 **Main 薄接线**：校验启动/停止请求 → 由 Main 解析渠道/模型并选择或创建**审核专属 Pi 会话** → 走 `preparePiReviewRunV2` 建立 V2 运行与指派 → `admitPreparedPiReviewTurn` 把真实执行权交给 `runAgent`，拿到执行权后返回只读业务状态；停止时按当前绑定 `stopAgentAndWait` 并收尾。运行时模块，含会话/运行/指派磁盘状态与 Agent 执行副作用。

不做的事：不创建 IPC handler（`review-ipc.ts:1117-1126` 注册并做 sender 校验）；不实现 Pi 执行器/工具（`agent-service`、`pi-review-ops-tools`）；不实现运行状态机（`pi-case-review-service`、`run-store-v2`）；不直接暴露 `sessionId/assignmentId` 给渲染层（返回 `ReviewBackgroundPiRunState`）。

**行为差异（r1 修正）**：本文件**不调用** `assertCaseReadyForReview`，`preparePiReviewRunV2` 也只拒绝 `archived`（`pi-case-review-service.ts:456`），不拒绝 `draft`；而 `createCaseFromTemplate` 默认 `stage:'draft'`（`application-service.ts:205`）。因此 **draft 案卷可以启动 Pi 审核**，这与 `run-async-service.ts:93` 的"draft 不能开始审核运行"门禁不同。`review-pi-run-bridge.main.test.ts:61` 的夹具正是 draft 且启动成功，构成静态证据。是否应统一为拒绝 draft 属产品裁决，r1 只如实记录，不改源码。

## 2. 导出与关键符号

导出 2 个 function，无导出类型。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `startBackgroundPiReview` | function | `review-pi-run-bridge.ts:26-107` | `(input: ReviewBackgroundPiStartRequest, webContents: WebContents) => Promise<ReviewBackgroundPiRunState>` | 启动/续交；返回时已获执行权或抛错 |
| `stopBackgroundPiReview` | function | `:110-129` | `(input: {caseId; runId}) => Promise<ReviewBackgroundPiRunState>` | 只停止当前绑定；返回停止后状态 |

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `busyCases` | `:24` | `Set<caseId>`，仅保护准备/停止短临界区；进程内、非持久 |

## 3. 内部逻辑与关键流程

### 3.1 启动 `startBackgroundPiReview`（`:26-107`）

1. **入参安全**（`:27-30`）：`assertSafeReviewStorageId(caseId,'caseId')`（正则 `^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$`，禁 `.`/`..`/`..` 子串，`review-storage-id.ts:8-16`）；`mode` 只允许 `undefined|'update'|'restart'`，否则"审核启动模式非法"；`resumeInterrupted` 必须是 boolean；`webContents` 存在且未销毁，否则"审核窗口已关闭，无法受理本次启动"。
2. **同案互斥**（`:31-32`）：`busyCases` 命中抛"该案卷正在启动或停止，请稍后再试"；随后加入，`finally` 删除（`:104-106`）。
3. **案卷存在**（`:34-35`）：`getCaseV2Aggregate` 为空抛"案卷不存在或尚未初始化"。**不检查 `stage`**：draft 不会被拒绝（对比 `run-async-service.ts:93`），archived 由后续 `preparePiReviewRunV2` 拒绝（`pi-case-review-service.ts:456`）。
4. **渠道/模型解析**（`:36-46`）：
   - `getEffectiveReviewModelSelection()`（`module-settings-store.ts:41-50`）→ `selection`/`explicit`；
   - `channel = selection?.channelId ? getChannelById(...) : undefined`（`:38`）；
   - `modelId = channel && channel.enabled === true ? pickChannelModelId(channel, selection) : undefined`（`:39-40`）；
   - 任一缺失/停用 → "审核渠道或模型未配置、已停用或已删除，请在审核设置中选择有效模型"（`:41-43`）；
   - 显式选择与解析结果不一致 → "审核所选模型已停用或被删除，请在审核设置中重新选择后再运行"（`:44-46`）。
   - **白名单：本路径不校验，且 Pi 调用不经过网关**。本文件只要求 `channel.enabled === true`（`:39-43`），不检查 `channel.provider`；Pi 后台执行走 `runAgent`（`:92-94`）→ `agent-orchestrator`，由 orchestrator 取渠道并把 `provider` 透传给 Pi 运行时（`agent-orchestrator.ts:1101`、`:2162`），**不经过** `review-model-gateway` 的白名单闸（`review-model-gateway.ts:157`，由 `:309-312` 调用）。本路径能否拿到非白名单 provider，取决于审核选择从哪条路径来，三种情况必须分开看：
     - **显式审核选择（正常 IPC/UI）**：保存时即被拒——`SAVE_MODULE_SETTINGS_V2` 在 `review-ipc.ts:1515` 校验 `REVIEW_MODEL_PROVIDERS`，非白名单渠道无法保存为审核选择；渲染层选择器也用同一白名单过滤（`review-first-use-readiness.ts:9`）。**这条路径不产生绕过。**
     - **全局回退（`explicit:false`，产品可达）**：审核未单独选择时，`getEffectiveReviewModelSelection` 直接取应用全局 `settings.agentChannelId/agentModelId`（`module-settings-store.ts:44-49`）；`updateSettings` 不校验 provider（`settings-service.ts:93-118`），bridge `:37-43` 也只查 `enabled`。用户把任意 provider 渠道设为应用默认 Agent 渠道后再启动 Pi 审核，**就会以该 provider 进入 Pi 运行时**。这是当前真实可达的未校验路径。
     - **直接改写 `review-module-settings.json`（文件级旁路）**：`getReviewModuleSettings` 只做形状校验（`module-settings-store.ts:20-35`），不校验渠道存在/启用/provider；手改文件可写入任意 `{channelId,modelId}`，绕过 `review-ipc.ts:1515`。该路径同样不经过网关。
   - **边界（不要把"无闸"读成"必成功"）**：以上只说明 Pi 路径没有 provider 白名单闸，**不等于任意 provider 一定成功发起远端调用**；能否完成取决于该 provider 在 Pi 运行时的协议适配、凭证与模型可用性，本文件不做判断、不保证成功、也没有降级。是否应在 bridge 或 `preparePiReviewRunV2` 补白名单校验，是产品/安全待决项。
5. **同案并发运行**（`:47-52`）：列出 `owner.kind==='review-case' && owner.caseId===caseId` 的会话（`listAgentSessions(true)` 含归档，`agent-session-manager.ts:447-452`）；任一 `isAgentSessionActive` 或 `listRunsV2` 中存在 `running/queued` → "该案卷已有审核正在进行，请等待结束或先停止本轮"。
6. **会话复用**（`:53-58`）：仅当 `mode !== 'restart'` 时，在会话中找 `!archived`、预设为 `review-operator`（`presetReference?.presetId ?? presetId`）、`agentRuntime==='pi'`、`channelId/modelId` 与本次一致者；否则 `createReviewOwnedAgentSession({caseId, title:'审核：'+标题, channelId, modelId})`（`agent-session-manager.ts:642-657`，owner 固定 `{kind:'review-case',caseId}`，预设 `review-operator`）。注释说明"使用默认会话沙箱，不继承当前聊天工作区；旧普通审核会话不迁移"（`:56`）。
7. **找上一轮 Pi 运行**（`:59-61`）：`listRunsV2(caseId).find(run.id.startsWith('run-pi-'))`——`listRunsV2` 按 `startedAt` 倒序（`run-store-v2.ts:135-146`），因此取**最近一条 Pi 运行**，T04/普通 V2 运行不会遮挡（注释 F09/RUN-43）。
8. **冷启动中断门**（`:65-72`）：`interruptedResumable = !!previous && isResumableInterruptedRunV2(previous)`（要求 `status==='failed'`、诊断含 `interrupted: 进程重启`、且有已接受检查或检查点，`run-store-v2.ts:49-56`）；`interruptedResumeGate`（`review-runtime-contract.ts:220-232`）在"可续交但用户未确认且非 restart"时拒绝，文案要求用户选择"继续上次检查点（新回合）"或"重新审核全部"。
9. **续交资格**（`:73-85`）：必须同时满足
   - 有可复用会话 `reusable` 且有 `previous`；
   - `previous.status==='partially-completed'`，或（中断可续且 `resumeInterrupted===true`）；
   - 有 `execution-failed` 检查，或检查数 < 计划数，或有检查点；
   - `!isWorkspaceRunStaleV2(aggregate, previous.id)`（输入哈希/补件响应已变化则 stale，`workspace-business-service-v2.ts:358-377`）；
   - `listAssignments()` 中存在 `caseId` 相同、`sessionId===session.id`、`activeRunId===previous.id` 的指派（`:79-80`）。**该谓词未排除 `revokedAt`**，已撤销但曾绑定该运行的指派仍满足（`review-agent-assignment.ts:317-324` 返回含 revoked 的副本）；真正阻止重复使用的是 `preparePiReviewRunV2` 的活跃运行检查。
10. `resumeRunId`（`:81-85`）：中断可续时调 `reopenInterruptedRunForResume(caseId, previous.id, {confirmedByUser:true})`（把 failed 改回 `partially-completed`、保留检查点、写审计诊断、解除中断标记，`run-store-v2.ts:66-83`）并取其 id；普通部分完成直接用 `previous.id`。
11. `turnId = randomUUID()`（`:86`）；`preparePiReviewRunV2({caseId, sessionId, turnId, resumeRunId?, inheritReadReceipts: mode!=='restart'})`（`:87-88`）。prepare 会做归档/D2 计划/有效规则/计划数/续交输入哈希/已有活跃运行等检查，并创建 assignment、落 running 运行（`pi-case-review-service.ts:452-530`）。
12. **绑定并受理**（`:89-94`）：`updateAgentSessionMeta(session.id, {attachedDirectories:[prepared.caseDirectory]})`（`:91`；`updateAgentSessionMeta` 拒绝 `owner` 字段，`agent-session-manager.ts:1420-1422`）；`admitPreparedPiReviewTurn(input, binding, (agentInput,onRunOwned)=>runAgent(agentInput, webContents, undefined, onRunOwned))`（`:92-94`）。`input` 带 `triggeredBy:'user'`、`agentRuntime:'pi'`、`uuid:turnId`。
13. **失败收尾**（`:95-102`）：若受理抛错，重读会话绑定；只有 runId 与 assignmentId 都仍匹配时才 `finishPiReviewRunV2(binding,{status:'failed',error})` 并 `revokeAssignment`，然后 rethrow。若绑定已被新一轮替换，**不**改写新运行。
14. 成功返回 `getBackgroundPiReviewState(caseId)`（`:103`）——只读投影，不含 sessionId/assignmentId。

**关键时序**：`admitPreparedPiReviewTurn` 只在执行器调用 `onRunOwned()`（真正拿到 orchestrator 执行权）时 resolve（`review-pi-admission.ts:186-192`）；因此 `startBackgroundPiReview` 的 Promise 在"运行已落 running 但尚未拿到执行权"期间保持 pending，UI 状态为 `preparing`（`review-background-state.ts:36-40`）。

### 3.2 停止 `stopBackgroundPiReview`（`:110-129`）

1. 校验 `caseId`/`runId` 安全（`:111-112`）。
2. `busyCases` 命中即拒（`:113`）——停止前不加入，找到会话后才加入（`:118`），避免"找不到会话"时留下忙标记。
3. 只接受**当前绑定**：在 `owner.kind==='review-case' && owner.caseId===caseId` 的会话中找 `getPiReviewBindingForSession(session.id)?.runId === input.runId` 的那一个（`:114-115`）；找不到抛"本次审核已结束或运行已变化，请刷新案卷后再试"（`:117`）。`getPiReviewBindingForSession` 只在运行仍 `running` 且非中断时返回绑定（`pi-case-review-service.ts:531-540`）。
4. `await stopAgentAndWait(session.id)`（`:121`，`agent-service.ts:587-589` → orchestrator 停止并等待真实释放）；随后重读绑定，若仍是同一 run/assignment → `finishPiReviewRunV2(binding,{status:'stopped'})`（`:122-123`，仅当运行仍 `running` 才写，`pi-case-review-service.ts:1128-1131`）；`revokeAssignment`（`:124`）。
5. 返回 `getBackgroundPiReviewState(caseId)`（`:125`）；`finally` 清理忙标记（`:126-128`）。

## 4. 调用者与调用链

入向：

| 调用者 | 位置 | 说明 |
| --- | --- | --- |
| `review-ipc.ts` `START_BACKGROUND_PI_REVIEW_V2` | `:1117-1121` | `assertMainWindowSender(event, getMainWindow)` 后 `startBackgroundPiReview(input, event.sender)` |
| `review-ipc.ts` `STOP_BACKGROUND_PI_REVIEW_V2` | `:1122-1125` | 同样 sender 校验后 `stopBackgroundPiReview(input)` |
| `review-pi-run-bridge.main.test.ts` | `:31` import；`:68`、`:101`、`:125` 等 | 直接测试（见 §9） |

出向（import，`:2-21`）：`channel-manager.getChannelById`、`agent-session-manager`（`createReviewOwnedAgentSession`/`listAgentSessions`/`updateAgentSessionMeta`）、`agent-service`（`isAgentSessionActive`/`runAgent`/`stopAgentAndWait`）、`application-service.getCaseV2Aggregate`、`module-settings-store`、`review-model-identity`、`review-background-state`、`review-pi-admission`、`review-runtime-contract`、`pi-case-review-service`（`prepare`/`finish`/`getBinding`）、`review-agent-assignment`（`listAssignments`/`revokeAssignment`）、`run-store-v2`（`isResumableInterruptedRunV2`/`listRunsV2`/`reopenInterruptedRunForResume`）、`review-storage-id`、`workspace-business-service-v2.isWorkspaceRunStaleV2`、`case-store.getCase`。

无动态字符串调用；全部为静态 import。

## 5. 数据 I/O、读写与副作用

- **读**：案卷聚合、模板（经 prepare）、渠道配置、审核模块设置、应用设置、Agent 会话索引、V2 运行文件、指派账本。
- **写**：会话元数据 `attachedDirectories`（`:91`）；V2 运行（prepare 落 `running`、finish 落终态）；指派账本（创建/绑定/撤销）；运行诊断（中断续交）。
- **进程内状态**：`busyCases`（仅本文件）。
- **网络/进程**：`runAgent` 启动 Pi 执行器（模型请求在后续工具调用中）；`stopAgentAndWait` 等待执行权释放。
- **原子性**：会话索引、运行、指派各自 tmp+rename（由各自 store 保证）；本文件没有跨文件事务。prepare 成功但 admission 失败时，catch 内**顺序执行** `finishPiReviewRunV2` 再 `revokeAssignment`（`:95-102`），**没有内层 try**：若 `finishPiReviewRunV2` 抛错（如磁盘写失败），`revokeAssignment` 会被跳过，且该错误替换原 admission 错误向上抛。此时磁盘可能留下 `running` 运行与未撤销的指派，只能依赖启动恢复 `markStaleRunsInterrupted`（`run-store-v2.ts:86-115`）与运行终态判定，不能认为补偿一定完成。
- **幂等**：`finishPiReviewRunV2` 对非 running 运行是 no-op；`revokeAssignment` 重复调用返回 false；但 `preparePiReviewRunV2` 每次都会新建 assignment/运行，重复启动由 `busyCases` + 活跃运行检查 + admission 的 `runningAssignments` 三重拦截（均在进程内）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 非法 caseId/runId | `:27`、`:111-112` | "非法 caseId/runId：…" |
| 非法 mode / resumeInterrupted | `:28-29` | "审核启动模式非法"/"审核续交确认参数非法" |
| 窗口已销毁 | `:30` | "审核窗口已关闭…" |
| 同案正在启动/停止 | `:31`、`:113` | "该案卷正在启动或停止…" |
| 案卷不存在 | `:35` | "案卷不存在或尚未初始化" |
| 案卷为 draft | 无分支 | **不拒绝**；`preparePiReviewRunV2` 只拒 archived（`pi-case-review-service.ts:456`），与 `run-async-service.ts:93` 不同 |
| 案卷为 archived | `pi-case-review-service.ts:456` | "案卷已经归档，不允许启动或续跑 Pi 审核" |
| 渠道/模型缺失/停用 | `:41-43` | "审核渠道或模型未配置、已停用或已删除…" |
| 显式模型失效 | `:44-46` | "审核所选模型已停用或被删除…" |
| 已有活跃会话/运行 | `:49-52` | "该案卷已有审核正在进行…" |
| 冷启动中断未确认 | `:69-72` | `interruptedResumeGate` 文案（`review-runtime-contract.ts:228-231`） |
| prepare 失败 | `:87-88` 抛出 | 归档/模板变化/输入哈希变化/无未完成项/已有运行等（`pi-case-review-service.ts:452-530`） |
| admission 失败 | `:95-102` | 若绑定仍匹配：先 `finishPiReviewRunV2(failed)` 再 `revokeAssignment`；**无内层 try**，finish 抛错会跳过 revoke 并替换原错误 |
| 停止身份不符 | `:117` | "本次审核已结束或运行已变化…" |
| 停止成功 | `:121-124` | 执行器停止 → 运行 `cancelled`（`finishPiReviewRunV2` 映射 `stopped→cancelled`，`pi-case-review-service.ts:1142`） |

**取消/恢复**：用户停止走 `stopBackgroundPiReview`；冷启动中断必须用户显式 `resumeInterrupted:true` 或 `mode:'restart'` 才放行（`:65-72`），且续交是**新回合**，不重放中断前未确认的模型请求（`run-store-v2.ts:66-83` 的诊断文案）。运行级 `paused/partially-completed` 的续交复用原 runId（`:81-85`）。

## 7. 权限与权威状态

- **入口权限**：IPC 层 `assertMainWindowSender`（`review-ipc.ts:1118`、`:1123`）只允许当前主窗口；本文件自身不做 sender 校验（参数已含 `webContents`，由 handler 传入）。
- **出口白名单（r2 更正）**：本文件只校验 `channel.enabled === true`（`:41-43`），**不校验 `channel.provider`**。Pi 请求由 `agent-orchestrator` 把渠道 `provider` 透传给 Pi 运行时（`agent-orchestrator.ts:1101`、`:2162`），不经过 `review-model-gateway`（`review-model-gateway.ts:157`、`:309-312`）。
  - **强制点只有两处**：`review-ipc.ts:1515`（`SAVE_MODULE_SETTINGS_V2` 保存时拒绝非白名单）与网关 `review-model-gateway.ts:157`（由 `:309-312` 在发请求前调用）。渲染层 `review-first-use-readiness.ts:9` 用同一白名单过滤可选渠道，是 **UI 过滤，不是强制**。
  - **三条到达路径**：① 显式审核选择——保存时被拒，正常 IPC/UI 无法保存非白名单渠道；② 全局回退（`explicit:false`）——`updateSettings`（`settings-service.ts:93-118`）不校验 provider，bridge 只查 `enabled`，**产品可达**；③ 文件旁路——`getReviewModuleSettings` 只做形状校验（`module-settings-store.ts:20-35`），手改 `review-module-settings.json` 可绕过保存校验。
  - **不承诺成功**：进入 Pi 运行时后能否真正完成请求取决于该 provider 的协议适配、凭证与模型可用性；本文件不判断、不保证、也不降级。是否补校验为待决项。
- **权限模式来源（r1 更正）**：Pi 审核会话的权限模式来自会话预设策略，不是 `pi-review-agent-client.ts:144`（那是 V2 审查图 `createPiReviewModelClient` 的字段）。`review-operator` 预设未声明 `permissionMode`（`packages/shared/src/types/agent-preset.ts:563-574`），经 `resolveEffectivePermissionMode` 回退默认值 `PROFER_DEFAULT_PERMISSION_MODE='bypassPermissions'`（`packages/shared/src/types/agent-preset-policy.ts:90-101`、`packages/shared/src/types/agent.ts:1935`），最终由 `agent-orchestrator.ts:1613` 取 `presetPolicy.permissionMode` 生效。即：**默认仍是 bypassPermissions**，但归属是 orchestrator 预设策略；工具写权限靠 assignment 层约束，不依赖交互式权限弹窗。
- **开审门禁差异**：本文件没有 `stage` 门禁，draft 案卷可直接启动 Pi 审核；`run-async-service` 的 `assertCaseReadyForReview` 会拒绝 draft/archived/缺必填输入/缺必交槽（`run-async-service.ts:86-100`）。这是两条运行链的真实流程差异，修改任一侧前需确认是否要对齐。
- **归属由 Main 派生**：`sessionId`、`assignmentId`、`runId` 均不接受渲染层传入；会话 owner 在 `createReviewOwnedAgentSession` 固定为 `{kind:'review-case', caseId}`（`agent-session-manager.ts:655-656`），指派在 `preparePiReviewRunV2` 内创建（`pi-case-review-service.ts:490-497`），admission 再核对 assignment/run/session/`turnId` 一致（`review-pi-admission.ts:74-81`）。
- **停止权限**：只认"当前案卷 + 当前绑定 runId"（`:114-117`），旧 runId 不能停新运行。
- **权威状态**：V2 运行文件是运行状态权威；会话索引是指派/归属权威；`admitPreparedPiReviewTurn` 的进程内 `admittedByCase` 只证明"执行权已授予"，不替代持久状态（`review-pi-admission.ts:29-45`）。

## 8. 修改影响面

- `review-ipc.ts:1117-1125`：IPC 契约 `ReviewBackgroundPiStartRequest`/`ReviewBackgroundPiRunState`（`packages/shared/src/types/review.ts`）；改返回字段会影响 preload/renderer 状态展示。
- `pi-case-review-service.ts:452-530`、`:1128-1183`：prepare/finish 的检查顺序与终态映射；改 `resumeRunId`/`inheritReadReceipts` 语义会影响 RUN-43 续交。
- `review-pi-admission.ts:65-204`：受理/收尾/撤销；改 binding 字段会破坏 `isCurrent` 与迟到回调防护。
- `review-background-state.ts:20-53`：phase 由运行状态 + admission 推导；`accepted` 只表示执行权已授予，不是业务通过。
- `review-agent-assignment.ts:317-335`：`listAssignments` 的 revoked 语义影响 `resumeEligible`（当前未排除 revoked）。
- `REVIEW_MODEL_PROVIDERS`（`packages/shared/src/types/review.ts:478`）：改白名单会同时影响三处——`review-ipc.ts:1515`（保存拒绝）、网关 `review-model-gateway.ts:157`/`:309-312`（请求拒绝）、渲染层 `review-first-use-readiness.ts:9`（`eligibleReviewChannels` 的可选渠道列表）。三处需同步验证，否则会出现"UI 可选但保存被拒"或"保存通过但请求被拒"的不一致。
- 测试：`review-pi-run-bridge.main.test.ts` 12 个用例（§9）；改错误文案（"正在启动或停止"、"已有审核正在进行"、"运行已变化"、"仅允许"）会直接破坏断言。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/review-pi-run-bridge.main.test.ts`（309 行，12 个 `test(`，见该篇手册）。摘要：mock `../agent-service` 后走真实 V2/会话/指派/IPC，覆盖 preparing→accepted、ACK 不泄漏内部 ID、默认工作区、忙碌/重复、F09 续交、停止身份、停用渠道、预设复用、显式/回退模型、指派时间戳并列、迟到回调、停止释放、IPC sender。**NOT_RUN**：本轮未执行。

间接（r1 更正）：`pi-case-review-service.test.ts` **确实存在**（273 行，4 个 `test(`：`:102`、`:164`、`:213`、`:246`），覆盖 Pi 结果提交/续审/读取回执继承/历史结果修复，不是"无测试"。此外 `review-background-reuse.probe.test.ts:145-432` 覆盖 admission/复用探测。它们覆盖的是 submit/续审/回执与复用，**不是**本 bridge 的启动受理路径；本文件测试仍是启动路径的主要证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 启动返回时执行权已授予（admission 在 onRunOwned 才 resolve） | 已证实 | `review-pi-run-bridge.ts:92-94`；`review-pi-admission.ts:186-192` |
| 会话/指派/runId 全由 Main 生成，渲染层不能指定 | 已证实 | `:57-58`、`:86-89`；`agent-session-manager.ts:642-657` |
| 续交只认最近一条 `run-pi-` 运行 | 已证实 | `:61`；`run-store-v2.ts:135-146` |
| `resumeEligible` 的指派谓词不排除已撤销 | 已证实 | `:79-80`；`review-agent-assignment.ts:317-324` |
| 中断未确认时拒绝自动续跑 | 已证实 | `:65-72`；`review-runtime-contract.ts:220-232` |
| 停止只接受当前绑定，旧 runId 拒绝 | 已证实 | `:114-117` |
| admission 失败时按绑定相等补偿 failed+revoke | 已证实 | `:95-102` |
| Pi 路径无 provider 白名单闸；显式选择保存时被拒，全局回退与文件旁路可带入非白名单 provider | 已证实 | `:37-43`、`:92-94`；`review-ipc.ts:1515`；`module-settings-store.ts:44-49`、`:20-35`；`settings-service.ts:93-118`；`agent-orchestrator.ts:1101`、`:2162`；`review-model-gateway.ts:157`、`:309-312` |
| `REVIEW_MODEL_PROVIDERS` 在 `.ts/.tsx` 源码与测试中共 19 处引用；生产强制点仅 `review-ipc.ts:1515` 与网关 `:157` | 已证实 | `grep -rn --include=*.ts --include=*.tsx REVIEW_MODEL_PROVIDERS` = 19 行；另 `docs/`、`work/reports/` 6 处为历史文档提及，非代码；渲染层 `review-first-use-readiness.ts:2`、`:9` 为 UI 过滤 |
| 非白名单 provider 在 Pi 运行时是否成功远端调用 | 未知 | 本文件不做 provider 校验；未读 Pi 运行时协议适配实现，不保证成功 |
| draft 案卷可启动 Pi 审核；run-async 会拒绝 draft | 已证实 | `:26-107` 无门禁调用；`pi-case-review-service.ts:456`；`application-service.ts:205`；`run-async-service.ts:93`；测试夹具 `review-pi-run-bridge.main.test.ts:61` |
| 补偿无内层 try：finish 抛错会跳过 revoke | 已证实 | `:95-102` |
| Pi 权限模式来自预设策略默认 bypassPermissions，不是 pi-review-agent-client.ts:144 | 已证实 | `agent-orchestrator.ts:1613`；`packages/shared/src/types/agent-preset-policy.ts:90-101`；`packages/shared/src/types/agent.ts:1935`；`packages/shared/src/types/agent-preset.ts:563-574` |
| `pi-case-review-service.test.ts` 存在（273 行 4 用例） | 已证实 | `pi-case-review-service.test.ts:101-246`；`review-background-reuse.probe.test.ts:145-432` |
| 跨进程并发启动同一案卷不被 `busyCases` 拦截 | 推断 | `:24` 进程内 Set |
| `reopenInterruptedRunForResume` 返回 undefined 时 `resumeRunId` 变 undefined 会新建运行 | 推断 | `:81-85` 的 `?.id`；未读该分支运行证据 |
| 真实 Electron 窗口/工具调用表现 | 未知 | 本轮未跑 GUI；测试用 fake WebContents |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 条导出 | §2 | `:26-129` | covered |
| 入参校验/忙标记 | §3.1、§6 | `:27-32` | covered |
| 渠道/模型解析与显式失效 | §3.1 | `:36-46` | covered |
| 会话复用/创建 | §3.1 | `:47-58` | covered |
| 上一轮查找/中断门/续交资格 | §3.1、§6 | `:59-85` | covered |
| prepare/admission/失败补偿 | §3.1 | `:86-102` | covered |
| 停止绑定校验与收尾 | §3.2 | `:110-129` | covered |
| 权限/权威状态 | §7 | 跨文件 | covered |
| 真实 GUI/跨进程 | §9、§10 | — | unknown（NOT_RUN） |
