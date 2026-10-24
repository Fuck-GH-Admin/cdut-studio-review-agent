---
path: apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d279604155dd4866c5fc89ac7b75e2520334ed1
sha256: 3f0240e9d79f275ff80dfaead6e3454446671da34eca8fc914e28792474211fb
lines: 1235
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts

## 1. 结论与边界

AI 速课堂（cdut-ai-class）专属工作区/会话管理与「资料树图谱按需生成」的主进程服务模块，运行时代码（非纯类型）。三组职责（文件头 `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:4-12`）：

1. 确保速课堂专属工作区（slug `cdut-ai-class`）就绪，与全局 Agent 会话物理隔离；
2. 速课堂会话 CRUD，创建时自动锁定并绑定内部导师预设 `AI速课堂导师`；
3. 资料树知识图谱按需生成（`KnowledgeGraphEdge[]`），三档模式 local_fast / ai_smart / ai_full，恒定由用户主动触发；模型失败静默降级为本地启发式，绝不阻断界面（`:12`）。

边界：

- 不实现会话底层存储（委托 `apps/electron/src/main/lib/agent-session-manager.ts`、`apps/electron/src/main/lib/agent-workspace-manager.ts`、`apps/electron/src/main/lib/agent-preset-manager.ts`）；不实现资料切块索引（委托 `apps/electron/src/main/lib/study/study-document-indexer.ts`）。
- 不注册 IPC（注册在 `apps/electron/src/main/ipc.ts:6588-6615`）；不含渲染端逻辑（渲染端同名判断是独立文件 `apps/electron/src/renderer/lib/cdut-ai-class.ts`，只在注释 `:5` 提到本模块函数名，无 import）。
- 一次性模型补全只做非流式单请求（`oneShotJsonCompletion`），不覆盖流式对话主链路；标题生成另有 `parseTitleResponse`（见 `:420-421` 注释，位于其他文件，本文件不调用）。
- 本文件不直接写图谱之外的业务缓存；唯一落盘产物是 `knowledge-graph.json`（`:1216-1217`）与删除会话时的后台目录清理（`:318-337`）。

## 2. 导出与关键符号

导出共 14 项：10 函数 + 3 接口 + 1 常量（`export` 逐条核对 `:142/:172/:189/:217/:252/:316/:347/:350/:367/:423/:533/:1144/:1190/:1227`）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ensureAiClassWorkspace` | 导出函数 | 142 | `(): AgentWorkspace` | 确保专属工作区存在并返回（见 §3.1） |
| `listAiClassSessions` | 导出函数 | 172 | `(): AiClassSessionSummary[]` | 速课堂历史课堂简报，按 `updatedAt` 降序 |
| `createAiClassSession` | 导出函数 | 189 | `(courseName: string): AiClassSessionSummary` | 新建会话，绑定专属工作区+内部导师预设 |
| `EnsureDemoAiClassResult` | 导出接口 | 217 | `{session, created, documentIngested, novelPath}` | 演示课堂就绪结果 |
| `ensureDemoAiClassSession` | 导出函数 | 252 | `(): Promise<EnsureDemoAiClassResult>` | 演示课堂幂等就绪（in-flight 去重） |
| `deleteAiClassSession` | 导出函数 | 316 | `(sessionId: string): void` | 删会话 + 后台异步清理资料/工件目录 |
| `ONE_SHOT_COMPLETION_TIMEOUT_MS` | 导出常量 | 347 | `90_000` | 单次请求尝试硬超时（毫秒） |
| `OneShotCompletionOptions` | 导出接口 | 350 | `{channelId?, modelId?, timeoutMs?, maxOutputTokens?, signal?}` | 一次性补全选项 |
| `CompletionResponseInspection` | 导出接口 | 367 | `{text, finishReason, textChars, reasoningChars}` | 响应检查结果 |
| `inspectCompletionResponse` | 导出函数 | 423 | `(protocol: CompletionProtocol, data: unknown): CompletionResponseInspection` | 四协议非流式响应解析 |
| `oneShotJsonCompletion` | 导出函数 | 533 | `(systemPrompt: string, userPrompt: string, options?: OneShotCompletionOptions): Promise<string>` | 一次性非流式 JSON 补全（含超时熔断/扩容重试） |
| `estimateGraphGenerationCost` | 导出函数 | 1144 | `(sessionId: string): StudyGraphCostEstimate` | 三档生成模式费用/Token/耗时预估 |
| `generateKnowledgeGraph` | 导出函数 | 1190 | `(sessionId: string, mode?: KnowledgeGraphGenerationMode, onProgress?: (e: StudyGraphProgressEvent) => void): Promise<KnowledgeGraphData>` | 按模式生成图谱并缓存落盘 |
| `readCachedGraphEdges` | 导出函数 | 1227 | `(sessionId: string): KnowledgeGraphEdge[]` | 读缓存边，无缓存返回 `[]` |

关键内部符号（均未导出）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `resolveCompletionProtocol` | 119-124 | 按渠道 Provider 推导协议族（禁止按 URL 判定，`:112-118` 注释红线） |
| `ensureAiClassPreset` | 159-169 | 幂等创建内部导师预设（workspace scope） |
| `resolveDemoNovelPath` | 230-240 | 演示《红楼梦》路径多候选解析 |
| `lockDemoSessionTitle` | 305-313 | 锁定演示课堂标题防自动改名覆盖 |
| `asRecord` / `asRecordArray` | 379-383 / 386-390 | 未知值收窄 |
| `collectOpenAIContent` / `countReasoningChars` | 393-404 / 407-415 | OpenAI 内容拼接 / 思考字段字符统计 |
| `isLengthFinishReason` | 501-503 | `/^(length|max_tokens|max_output_tokens)$/i` |
| `isContentFilterFinishReason` | 506-508 | `/content_filter|safety|blocked/i` |
| `buildEmptyResponseError` / `buildTruncatedResponseError` | 511-517 / 520-522 | 错误文案构造 |
| `parseJsonLenient` | 716-735 | 容忍 markdown 围栏/前后噪声的 JSON 解析 |
| `coerceEdges` | 738-786 | 模型输出 → 合法关联边（严格校验存在性/去重/上限） |
| `titleTokens` / `jaccard` / `looksLikeExercise` | 800-820 / 822-827 / 830-833 | 启发式相似度工具 |
| `buildHeuristicEdges` | 839-871 | 跨文档本地启发式关联（兜底） |
| `isNoiseSection` / `collectSectionRefs` / `buildPromptFromRefs` | 882-884 / 887-899 / 902-913 | 章节筛选与 Prompt 构造 |
| `batchArray` / `runWithConcurrency` | 916-922 / 925-941 | 分批 + 受限并发（上限 4） |
| `emitGraphProgress` / `mergeUniqueEdges` | 947-962 / 965-978 | 进度上报 / 边去重合并 |
| `runModelEdgeBatches` | 984-1014 | 批量模型抽边（单批失败跳过） |
| `buildIntraHeuristicEdges` | 1043-1069 | 单文档大章骨架启发式（零 Token） |
| `buildIntraDocumentGraph` | 1075-1096 | 场景 1（单文档）图谱构建 |
| `buildHierarchicalMultiDocumentGraph` | 1103-1135 | 场景 2（多文档）分层图谱构建 |

模块级状态：`ensureDemoInFlight: Promise<…> | null`（`let`，`:259`）——演示课堂创建的 in-flight 去重句柄。常量组：工作区/预设名（`:70-74`）、图谱额度 `MAX_EDGES=24`、`GRAPH_MAX_TOKENS=3000`、`MODEL_CONCURRENCY=4`、`SECTIONS_PER_BATCH=40`、`MAX_INTRA_EDGES_PER_DOC=10`（`:76-84`）、费用公式常量（`:89-99`）、噪音正则 `NOISE_SECTION_PATTERN`（`:101`）、`ANTHROPIC_PROXY_PROVIDERS` 集合（`:104-107`，8 个 Provider）、`RELATION_LABELS`（`:127-132`）、`MAX_ONE_SHOT_OUTPUT_TOKENS=32_768`（`:364`）、`TITLE_STOPWORDS`（`:789-797`）。内部类型：`CompletionProtocol`（`:110`）、`SectionRef`（`:874-879`）、`GraphProgressReporter`（`:944`）均未导出。

## 3. 内部逻辑与关键流程

### 3.1 工作区与预设（`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:134-209`）

- `ensureAiClassWorkspace`（`:142-156`）：先按 `slug === CDUT_AI_CLASS_WORKSPACE_SLUG || name === CDUT_AI_CLASS_WORKSPACE_NAME` 找现有（`:143-145`），命中即返回；否则以种子名 `CDUT AI Class` 创建 `personal` 工作区（`:148`，保证 slugify 得 `cdut-ai-class`），再重命名为中文展示名（`:150`）；重命名抛错时 `console.warn` 并返回种子名工作区（`:151-155`），不影响隔离。
- `ensureAiClassPreset`（`:159-169`）：在给定 workspaceSlug 下找 `scope === 'workspace' && name === AI_CLASS_PRESET_NAME` 的预设，无则 `createAgentPreset`，`basePresetId: BUILTIN_PRESET_STANDARD`（`:167`）。
- `listAiClassSessions`（`:172-184`）：`ensureAiClassWorkspace()` → `listAgentSessions()` 过滤 `workspaceId === workspace.id` → 按 `updatedAt` 降序 → 映射为 `AiClassSessionSummary`，`documentCount` 由 `listStudyDocuments(session.id).length` 现算（`:182`），`courseName` 空标题回退 `'新课堂'`（`:179`）。
- `createAiClassSession`（`:189-209`）：标题 `courseName.trim() || '未命名课堂'`（`:192`）；`createAgentSession(title, undefined, workspace.id, undefined, 'pi', false, preset.id)`（`:193-201`，第 5 参引擎固定 `'pi'`，第 6 参 `false`，第 7 参绑定预设 id）；返回 `documentCount: 0`。

### 3.2 演示课堂（`:211-313`）

- `ensureDemoAiClassSession`（`:252-257`）：`ensureDemoInFlight ??= runEnsureDemoAiClassSession().finally(…置 null)`，快速重播/双击复用同一 Promise。
- `runEnsureDemoAiClassSession`（`:261-299`）：幂等查找顺序——① 标题等于 `'演示课堂 · 红楼梦精读'`（`:263-264`）；② 兜底按「已挂载 `hongloumeng-quan-shu.txt` 的速课堂会话」定位（`:265-270`，应对首轮自动改名后标题不再匹配）；③ 都没有才 `createAiClassSession`（`:271`）。随后 `lockDemoSessionTitle`（`:273`）；`resolveDemoNovelPath` 为空时 `console.warn` 并返回 `{documentIngested:false, novelPath:null}`（`:276-279`，绝不伪造导入成功）；文件存在但未挂载则 `await ingestStudyDocuments(session.sessionId, [novelPath])`（`:281-286`）；最后用 `listStudyDocuments` 硬校验是否可枚举到该资料（`:288-291`）并刷新摘要返回。
- `resolveDemoNovelPath`（`:230-240`）：候选顺序 = 环境变量 `CDUT_DEMO_NOVEL_PATH` → 打包态 `process.resourcesPath/demo/`（仅 `app.isPackaged`）→ `appPath/resources/demo/` → `appPath/../../《红楼梦》全书.txt` → `cwd/《红楼梦》全书.txt`，`existsSync` 取第一个命中，全缺返回 `null`。
- `lockDemoSessionTitle`（`:305-313`）：`getAgentSessionMeta` 存在且无 `titleLockedAt` 时 `updateAgentSessionMeta(sessionId, { titleLockedAt: Date.now() })`；任何异常 `console.warn` 静默（防 orchestrator 自动改名破坏标题幂等，`:301-304` 注释）。

### 3.3 删除与后台清理（`:315-338`）

`deleteAiClassSession`：先 `deleteAgentSession(sessionId, { backgroundDiskCleanup: true })`（索引瞬时摘除）；`setImmediate` 后台分别清理两个目录：`resolve(getStudyMaterialsRootDir(), assertStudyId(sessionId,…))`（`:320-324`）与 `resolve(getStudySessionsRootDir(), assertStudyId(sessionId,…))`（`:329-333`）。每个清理前做路径逃逸守卫——仅当结果以 `root + '/'` 或 `root + '\\'` 开头才 `rmSync(recursive, force)`（`:322/:331`）；两段各自 try/catch，失败只 `console.warn`（`:325-327/:334-336`），删除主流程不失败。注意：`deleteAiClassSession` 本身同步返回 void，磁盘清理是最终一致（setImmediate 异步）。

### 3.4 一次性补全（`:340-711`）

- 渠道解析（`:538-547`）：`options.channelId/modelId` 优先于全局 `getSettings()`；两者任一缺失抛 `'尚未配置模型渠道：请先在「设置 → 渠道」中选择默认渠道与模型。'`（`:541-543`）；渠道不存在抛 `'渠道不存在或已被删除（…）'`（`:544-547`）。
- 鉴权双轨（`:549-561`）：`(isCommercialBuild() || isCommercialMode()) && isOfficialManagedChannel(channel)` 时走团队代管——`getTeamAuthWithRefresh()` 为空抛登录过期（`:552-555`）；`ANTHROPIC_PROXY_PROVIDERS` 命中 provider 用 `/v1/proxy/messages` 否则 `/v1/proxy/chat` 拼 `proxyBaseUrl`，key 取 `auth.proxyToken || auth.token`（`:556-558`）；否则 `decryptApiKey(channelId)`（`:560`）。
- 请求构造（`:563-570`）：`getAdapter(channel.provider).buildTitleRequest({baseUrl: proxyBaseUrl || channel.baseUrl, apiKey, modelId, prompt: userPrompt})`；代管模式 `req.url = proxyBaseUrl`（`:570`）。
- 协议注入（`:572-612`）：`resolveCompletionProtocol(channel.provider)`——`google`→google；`openai-responses|xai`→openai-responses；`ANTHROPIC_PROXY_PROVIDERS`（anthropic/anthropic-compatible/kimi-api/kimi-coding/minimax/xiaomi/xiaomi-token-plan/zhipu-coding，`:104-107`）→anthropic；其余→openai-chat（`:119-124`）。红线注释：绝不能按请求 URL 判定（商业代理 URL 改写会让 `includes('/chat/completions')` 恒 false）（`:112-118`）。四分支分别注入 `contents/systemInstruction`（google，删除 `max_tokens/system/messages`，`:581-586`）、`instructions/input` + `temperature:0`（openai-responses，`:587-594`）、`messages=[system,user]` + 非 ollama 才 `response_format:{type:'json_object'}`（openai-chat，`:595-604`）、`system/messages`（anthropic，删除 `response_format`，`:605-612`）。`req.body` 解析失败兜底 `{model: modelId}`（`:574-578`）。
- 输出额度（`:614-630`）：`applyMaxOutputTokens` 写 `generationConfig.maxOutputTokens`（google）/`max_output_tokens`（responses）/`max_tokens`（其余）；`timeoutMs = max(1000, options.timeoutMs ?? 90000)`、`maxOutputTokens = max(1000, options.maxOutputTokens ?? 3000)`。
- 两次尝试循环（`:640-704`）：第 1 次用请求额度，第 2 次 `min(额度×2, 32768)`（`:643-647`）；每次独立 `AbortController` + `setTimeout(timeoutMs)` 熔断（`:651-656`），外部 `options.signal` 转发 abort（`:657-659`），已 aborted 直接中断（`:641/:658`）。fetch 后：
  - `!resp.ok`（`:668-675`）：attempt 0 或 401/403 抛 HTTP 错误（`错误文案含 status 与响应体前 200 字`）；重试遇其它 HTTP 错误回抛 `firstFailure ?? httpError.message`。
  - 正常响应经 `inspectCompletionResponse`（`:677-678`）：有正文且非 `isLengthFinishReason` 截断即返回（`:679-680`）；截断报 `buildTruncatedResponseError`（含当前上限 tokens 与处置建议，`:520-522`），空正文报 `buildEmptyResponseError`（content_filter/safety/blocked 走「调整资料范围/换渠道」文案，否则「换渠道或模型」，`:511-517`）。attempt 0 且未外部取消时记 `firstFailure`、`console.warn` 并 `continue` 扩容重试（`:686-692`），否则抛出（`:693`）。
  - catch（`:694-699`）：外部取消抛 `'生成已取消。'`；`attemptTimedOut` 抛超时熔断文案（含秒数）；其余原样重抛。finally 清理 timer 与 abort 监听（`:700-703`）。循环后兜底抛 `firstFailure ?? '模型返回结果为空，请重试。'`（`:706-707`，注释标「理论上不可达」）。
- 每次请求尝试独立计时，最坏总耗时 2×90s（`:344-346` 注释与 `:629` 行为一致）。

### 3.5 响应解析（`inspectCompletionResponse`，`:423-498`）

四协议分支（全链路畸形响应不抛异常）：
- google（`:430-445`）：`candidates[0].content.parts` 过滤 `thought !== true` 后拼接 `text` 并 trim；`finishReason` 取 `candidate.finishReason`。
- openai-responses（`:447-468`）：`output_text` 优先，否则从 `output[].content[]` 取 `type==='output_text'` 的 `text` 拼接；`finishReason` 取 `incomplete_details.reason`，否则 `status`。
- anthropic（`:470-486`）：`content[]` 中 `type==='text'` 拼正文；`type==='thinking'` 只计 `reasoningChars`；`finishReason` 取 `stop_reason`。
- openai-chat（`:488-497`）：`choices[0].message.content` 经 `collectOpenAIContent`（字符串/块数组/`text` 字段拼接，`:393-404`）；`reasoningChars` 统计 `reasoning_content/reasoning/thinking` 三字段（`:407-415`）。
- 非对象输入统一返回 `{text:null, finishReason:null, textChars:0, reasoningChars:0}`（`:427-428`）。

### 3.6 图谱生成（`:713-1224`）

- `coerceEdges`（`:738-786`）：要求 `edges` 为数组；`sourceDocId/targetDocId` 非空（`:759`）；跨文档场景禁自连、`allowIntraDocument` 时允许同文档跨章节（`:760-761`）；禁同 section 自连（`:762`）；两段 sectionId 必须真实存在于对应文档大纲（`:763-764`）；按 `sourceSectionId->targetSectionId` 去重（`:765-767`）；`relationType` 白名单 `prerequisite|exercise|extension|reference` 否则落 `reference`（`:768-772`）；label 缺省用 `RELATION_LABELS`（`:780`）；`edgeId` 用 `randomUUID()`（`:774`）；上限 `MAX_EDGES=24`（`:783`）。
- 本地启发式：`titleTokens`（小写英文数字词 + 汉字单字/双字二元，过滤 `TITLE_STOPWORDS`，`:789-820`）、`jaccard`（`:822-827`）、`looksLikeExercise`（`fileType==='xlsx'` 或文件名匹配 习题|练习|题库|试卷|真题|题集|作业|test|exercise|quiz，`:830-833`）。`buildHeuristicEdges`（`:839-871`）：对每个 `(i<j)` 文档对，为后者每个章节在前者中找 Jaccard>0.12 的最佳前置章节（`:850-854`），关系类型 `exercise`（后者是题集）否则 `reference`（`:845`），达到 24 条提前返回（`:865`）。
- `runModelEdgeBatches`（`:984-1014`）：`batchArray(refs, 40)` 分批，`runWithConcurrency(batches, 4, …)` 并发；单批 `oneShotJsonCompletion` 失败（含超时熔断）仅 `console.warn` 跳过（`:1005-1007`），每完成一批 `emitGraphProgress`（`:1008-1009`）；输出经 `parseJsonLenient`（围栏剥离 + 首 `{` 尾 `}` 切片兜底，`:716-735`）→ `coerceEdges`；最终 `mergeUniqueEdges(groups, 24)`（`:1013`）。
- 场景 1 单文档（`buildIntraDocumentGraph`，`:1075-1096`）：`local_fast` 直接 `buildIntraheuristicEdges`；AI 模式走模型（`allowIntraDocument=true`，`INTRA_GRAPH_SYSTEM_PROMPT`，每文档上限 10 边），空结果降级启发式。`buildIntraHeuristicEdges`（`:1043-1069`）：窗口 `WINDOW=12` 内找 Jaccard>0.12 最佳后继，找不到退化为相邻章节连线（`:1055`），关系恒 `prerequisite`。
- 场景 2 多文档（`buildHierarchicalMultiDocumentGraph`，`:1103-1135`）：Layer 1 对每文档跑 `buildIntraHeuristicEdges`（零 Token，`:1108-1109`）；Layer 2 跨文档——`local_fast` 用 `buildHeuristicEdges`（`:1112-1114`），AI 模式 `runModelEdgeBatches(…, allowIntraDocument=false, GRAPH_SYSTEM_PROMPT…)` 包 try/catch（失败 `console.warn` 降级，`:1116-1129`），空结果也降级（`:1130`）；`mergeUniqueEdges([crossEdges, intraEdges], 24)`——跨文档映射优先占额度（`:1133-1134`）。
- 入口 `generateKnowledgeGraph`（`:1190-1224`）：`documents.length >= 1` 才生成（`:1202`，0 文档返回空边且不写缓存）；单/多文档分流（`:1203-1209`）；完成后上报 100% 进度（`:1212`）；写缓存 `join(getStudySessionDir(sessionId, { create: true }), 'knowledge-graph.json')`，`writeJsonFileAtomic({documents: [], edges, updatedAt: Date.now()})`（`:1214-1217`，注意缓存体内 `documents` 恒为空数组——只缓存 edges）；写失败仅 `console.warn`（`:1218-1220`）。返回 `{documents, edges, updatedAt: Date.now()}`（`:1223`）。
- `readCachedGraphEdges`（`:1227-1235`）：`readJsonFileSafe` 读同一缓存路径，`edges` 非数组返回 `[]`，整体 try/catch 兜底 `[]`。
- `estimateGraphGenerationCost`（`:1144-1175`）：`smartChunks=⌈totalChunks×0.6⌉`、`fullChunks=totalChunks`；Token = 章节数×1600/2100（`:1153-1154`）；费用 `max(下限, tokens/1e6×1.5)` 元保留 2 位（smart 下限 0.01、full 下限 0.02，`:1166/:1171`）；耗时 `clamp(12+0.5×smart, 15, 25)` / `clamp(25+1.0×full, 40, 70)` 秒（`:1167/:1172`）。纯读计算，无副作用。

## 4. 调用者与调用链

入向（冻结树检索 `apps/**`、`packages/**`、`resources/**` 全扩展名，`ensureAiClassWorkspace|listAiClassSessions|createAiClassSession|ensureDemoAiClassSession|deleteAiClassSession|oneShotJsonCompletion|inspectCompletionResponse|estimateGraphGenerationCost|generateKnowledgeGraph|readCachedGraphEdges`）：

- `apps/electron/src/main/ipc.ts:165-172` 导入 6 个函数；IPC handler 注册在 `apps/electron/src/main/ipc.ts:6588-6615`：
  - `CDUT_AI_CLASS_IPC_CHANNELS.LIST_SESSIONS`（`'cdut-ai-class:list-sessions'`，通道名定义 `packages/shared/src/types/cdut.ts:309`）→ `listAiClassSessions()`（`:6588-6590`）；
  - `CREATE_SESSION`（`'cdut-ai-class:create-session'`，`cdut.ts:311`）→ `createAiClassSession(courseName)`（`:6592-6594`）；
  - `ENSURE_DEMO_SESSION`（`'cdut-ai-class:ensure-demo-session'`，`cdut.ts:323`）→ `ensureDemoAiClassSession()`（`:6596-6598`）；
  - `DELETE_SESSION`（`'cdut-ai-class:delete-session'`，`cdut.ts:313`）→ `deleteAiClassSession(sessionId)` 后返回 `{success:true}`（`:6600-6603`）；
  - `GENERATE_GRAPH_RELATIONS`（`'cdut-ai-class:generate-graph-relations'`，`cdut.ts:315`）→ `generateKnowledgeGraph(input.sessionId, input.mode ?? 'ai_smart', cb)`（`:6605-6611`），进度经 `event.sender.send(GENERATE_PROGRESS)`（`'cdut-ai-class:generate-progress'`，`cdut.ts:317`，转发点 `:6609`）；
  - `ESTIMATE_GRAPH_COST`（`'cdut-ai-class:estimate-graph-cost'`，`cdut.ts:319`）→ `estimateGraphGenerationCost(sessionId)`（`:6613-6615`）。
  - handler 的 `_event` 均被忽略（`:6588/:6592/:6596/:6600/:6613` 无 sender 校验；`:6605` 的 `event` 仅用于回发进度）。
- `oneShotJsonCompletion`（含 `OneShotCompletionOptions` 类型）：`apps/electron/src/main/lib/study/study-artifact-service.ts:25` 导入，调用点 `:339`（思维导图）、`:348`（抽认卡）、`:356`（测验）；渠道继承优先级 = 显式入参 → 会话绑定 → 全局设置（`study-artifact-service.ts:327-335`）。
- `ONE_SHOT_COMPLETION_TIMEOUT_MS`、`inspectCompletionResponse`：仅测试文件 `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts:8-12` 引用。
- `readCachedGraphEdges`：冻结树（`apps/**`、`packages/**`、`resources/**`，全扩展名）检索仅命中本文件定义/导出（`:1227`），**无任何消费者**（已证实-静态，检索范围见 §10）。
- `ensureAiClassWorkspace`：外部调用者仅经 §4 IPC 链路间接需要；直接 import 只有本文件内部调用（`:173/:190`）。`apps/electron/src/renderer/lib/cdut-ai-class.ts:5` 是渲染端独立同名判定文件，只在注释提到「与主进程 ensureAiClassWorkspace 的双条件保持一致」，无 import 关系（已证实-静态）。
- 测试入口：`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts`（见 §9）。

出向（本文件 import 与关键调用点）：

- `@profer/shared`（`packages/shared/src`）：常量 `BUILTIN_PRESET_STANDARD`/`CDUT_AI_CLASS_WORKSPACE_NAME`/`CDUT_AI_CLASS_WORKSPACE_SLUG` 与类型（`:20-36`）。
- `@profer/core`：`getAdapter`（`:37`，调用点 `:563`）。
- `apps/electron/src/main/lib/agent-workspace-manager.ts`：`createAgentWorkspace`/`listAgentWorkspaces`/`updateAgentWorkspace`（`:38-42`，调用 `:143/:148/:150`）。
- `apps/electron/src/main/lib/agent-session-manager.ts`：`createAgentSession`/`deleteAgentSession`/`getAgentSessionMeta`/`listAgentSessions`/`updateAgentSessionMeta`（`:43-49`，调用 `:174/:193/:307/:309/:317`）。
- `apps/electron/src/main/lib/agent-preset-manager.ts`：`createAgentPreset`/`listAgentPresets`（`:50`，调用 `:160/:164`）。
- `apps/electron/src/main/lib/study/study-document-indexer.ts`：`ingestStudyDocuments`/`listStudyDocuments`（`:51`，调用 `:182/:267/:281/:285/:289/:1145/:1195`）。
- `apps/electron/src/main/lib/config-paths.ts`：`assertStudyId`（定义 `apps/electron/src/main/lib/config-paths.ts:1244`）/`getStudyMaterialsRootDir`（`:1256`）/`getStudySessionDir`（`:1263`）/`getStudySessionsRootDir`（`:1300`）（导入 `:52-57`，调用 `:320-321/:329-330/:1216/:1229`）。
- `apps/electron/src/main/lib/safe-file.ts`：`readJsonFileSafe`/`writeJsonFileAtomic`（`:58`，调用 `:1217/:1230`）。
- `apps/electron/src/main/lib/channel-manager.ts`：`listChannels`/`decryptApiKey`/`isCommercialMode`（`:59`，调用 `:544/:551/:560`）；`apps/electron/src/main/lib/auth-service.ts`：`getTeamAuthWithRefresh`（`:60`，`:552`）；`apps/electron/src/main/lib/proxy-fetch.ts`：`getFetchFn`（`:61`，`:638`）；`apps/electron/src/main/lib/proxy-settings-service.ts`：`getEffectiveProxyUrl`（`:62`，`:638`）；`apps/electron/src/main/lib/build-target.ts`：`isCommercialBuild`（`:63`，`:551`）；`apps/electron/src/main/lib/official-channel.ts`：`isOfficialManagedChannel`（`:64`，`:551`）；`apps/electron/src/main/lib/settings-service.ts`：`getSettings`（`:65`，`:538`）。
- `electron`：`app`（`:18`，`resolveDemoNovelPath` 用 `getAppPath/isPackaged/resourcesPath`，`:231-236`）；`node:path join/resolve`、`node:fs existsSync/rmSync`、`node:crypto randomUUID`（`:15-17`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：
  - `knowledge-graph.json`：`writeJsonFileAtomic`（`apps/electron/src/main/lib/safe-file.ts`）写 `<study-sessions>/<sessionId>/knowledge-graph.json`，目录经 `getStudySessionDir(sessionId, {create:true})` 预创建（`:1216`）；内容 `{documents: [], edges, updatedAt}`。原子性由 `writeJsonFileAtomic` 保证（本文件不实现 tmp+rename，推断-依赖实现）。
  - 目录删除：`deleteAiClassSession` 后台 `rmSync(recursive, force)` 删除会话资料目录与会话工件目录（`:323/:332`），带 `startsWith(root+'/'|root+'\\')` 路径逃逸守卫（`:322/:331`）。
- 磁盘读：`readCachedGraphEdges` 经 `readJsonFileSafe` 读缓存（`:1230`）；`resolveDemoNovelPath` 用 `existsSync` 探测候选文件（`:239`）；`listStudyDocuments`/`listAgentSessions` 等读索引（行为在各自模块）。
- 网络：`oneShotJsonCompletion` 经 `getFetchFn(await getEffectiveProxyUrl())` 发单次 POST（`:638/:662-667`），请求体为 JSON，鉴权经代管 proxy token 或解密 API key（§3.4）。图谱 AI 模式经此间接产生网络调用（并发 4）。
- 全局/内存状态：`ensureDemoInFlight`（`:259`）；预设/工作区/会话持久化状态由 manager 模块持有（本文件只读改）。
- 副作用：`console.info` 推演开始/结束日志（`:633/:709`）、多处 `console.warn`（`:153/:277/:311/:326/:335/:688/:1006/:1128/:1219`）；IPC 进度事件经调用方 `event.sender.send` 转发（`ipc.ts:6609`）；无窗口/通知/遥测直接操作。
- 幂等：`ensureAiClassWorkspace`/`ensureAiClassPreset` 按 slug/名称幂等；`ensureDemoAiClassSession` 双层幂等（in-flight Promise + 挂载判重 `:281-283`）；`generateKnowledgeGraph` 重复执行会覆盖同名缓存（每次新 `randomUUID` 边 id，非幂等产物）。
- 并发：模型批并发上限 4（`MODEL_CONCURRENCY`，`:80`）；`runWithConcurrency` 用共享 cursor 分发（`:925-941`）；`generateKnowledgeGraph` 无互斥锁，两次并发调用会各自生成并竞写同一缓存文件（推断-静态：无锁代码）。

## 6. 分支、失败、取消与恢复

- 工作区重命名失败：保留种子名继续用（`:151-155`）。
- 演示小说缺失：返回 `documentIngested:false, novelPath:null` 并 warn（`:276-279`）；标题锁定失败静默（`:310-312`）。
- 删除清理失败：只 warn，不回滚索引删除（`:325-336`）。
- 一次性补全错误矩阵（全部抛出携带可读中文文案的 `Error`）：
  - 未配置渠道（`:542`）/ 渠道不存在（`:546`）/ 代管登录过期（`:554`）；
  - HTTP 非 2xx：首次或 401/403 直接抛（含 status+体前 200 字，`:670-672`）；重试遇其它错误回抛首次失败原因（`:674`）；
  - 空正文：`buildEmptyResponseError`（content_filter/safety/blocked 与其它文案分流，`:511-517`）；输出截断：`buildTruncatedResponseError`（`:520-522`）；attempt 0 命中这两类时自动扩容重试一次（`:686-692`），attempt 1 命中即抛（`:693`）；
  - 超时：每尝试独立 `timeoutMs` 计时，触发 abort 并抛超时熔断文案（`:696-697`）；
  - 取消：`options.signal` 触发后抛 `'生成已取消。'`（循环入口 `:641`、catch `:695`）；attempt 0 的空正文/截断在外部已取消时不再重试（`:686` 条件含 `!externalSignal?.aborted`）。
- 图谱生成失败：单批模型失败跳过该批（`:1005-1007`）；全部失败/空产出降级本地启发式（`:1094-1095/:1130`）；缓存写失败 warn 后仍返回图谱数据（`:1218-1220`）。设计红线：任何模型失败不阻断界面（文件头 `:12`，实现分支 `:998/:1128` 一致）。
- 恢复：无持久化任务队列；`generateKnowledgeGraph` 未完成即丢弃本次结果（异常从 `runModelEdgeBatches` 外层 try/catch 兜不住的部分会向上抛，如 `listStudyDocuments` 抛错——推断：`listStudyDocuments` 失败未被本文件捕获）。进程重启后图谱缓存可由 `readCachedGraphEdges` 读回。

## 7. 权限与权威状态

- 无权限分支：本文件无 sender/role/actor 检查（全文件检索无 `sender`/`role`/`assert` 权限断言）；IPC 入口 handler 也不校验 sender（`ipc.ts:6588-6615`，`_event` 忽略）。
- 鉴权（≠权限）：模型渠道凭据来源二选一——团队代管 token（`getTeamAuthWithRefresh`，`:552-558`）或用户渠道 `decryptApiKey`（`:560`）；这是网络请求凭据，不是调用者授权。
- 权威状态：工作区/会话/预设的权威存储在 `agent-workspace-manager`/`agent-session-manager`/`agent-preset-manager`（本文件读写经其 API）；`titleLockedAt`（`:309`）是防自动改名的权威锁字段，由本文件写入、orchestrator 消费（推断-注释 `:301-304` 声明消费者为自动改名服务，本文件未读到消费者实现行号）；图谱缓存 `knowledge-graph.json` 的权威产出方是 `generateKnowledgeGraph`，`readCachedGraphEdges` 只读。

## 8. 修改影响面

- 改 `oneShotJsonCompletion`/`inspectCompletionResponse` 影响两条链路：图谱生成（`runModelEdgeBatches:1001`）与学习工件生成（`apps/electron/src/main/lib/study/study-artifact-service.ts:339/:348/:356`）；协议注入或超时语义变化会同时影响思维导图/抽认卡/测验与图谱抽边。
- 改会话/工作区函数影响 6 个 IPC 通道（`apps/electron/src/main/ipc.ts:6588-6615`）及其渲染端调用方（`cdut-ai-class:*` 通道名定义 `packages/shared/src/types/cdut.ts:309-323`）。
- 改导出签名需同步：`apps/electron/src/main/ipc.ts:165-172` 导入清单、`apps/electron/src/main/lib/study/study-artifact-service.ts:25`、`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts:8-12`。
- 改 `MAX_EDGES`/`SECTIONS_PER_BATCH`/`MODEL_CONCURRENCY` 影响图谱边数上限与模型调用次数（费用预估公式 `:1144-1175` 的常量独立，改批次大小不影响预估数字——推断-静态）。
- 删除/改名 `readCachedGraphEdges` 当前无消费者受影响（§4 否定结论）；但缓存文件格式（`edges` 数组）是 `generateKnowledgeGraph` 与 `readCachedGraphEdges` 间的隐式契约。
- 渲染端 `apps/electron/src/renderer/lib/cdut-ai-class.ts` 的工作区双条件判定与本文件 `:143-145` 需保持一致（该文件注释自述），改匹配条件需两侧同改。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.test.ts`（158 行，2 个 `describe`、12 个 `it`：`:15/:19/:28` + `:43/:52/:61/:75/:94/:103/:117/:136/:151`）。断言逐条（NOT_RUN——本轮未执行）：

- `:16` `expect(ONE_SHOT_COMPLETION_TIMEOUT_MS).toBe(90_000)`。
- `:19-26` 显式不存在渠道 id → `rejects.toThrow('渠道不存在或已被删除')`（走 `:544-547` 分支）。
- `:28-39` 标题写「pre-aborted signal 应立即抛出生成已取消」，但断言是 `rejects.toThrow('渠道不存在或已被删除')`（`:38`），行尾注释自认「渠道校验早于请求，若渠道存在且 pre-aborted 会抛出已取消」——即该用例实际只证明渠道校验先于请求，**未覆盖** `'生成已取消。'` 路径（`:641/:695`）。
- `inspectCompletionResponse` 9 个用例（`:43-157`）：openai-chat 空正文+`finish_reason=length` → `text:null`+透出（`:48-49`）；`content=null` 不抛（`:57-58`）；块数组拼接 `{"a":1}尾部`、`textChars=9`（`:71-72`）；三思考字段只计 `reasoningChars=9` 不回填正文（`:90-91`）；`content_filter` 原样透出（`:100`）；anthropic thinking+text 混合只取 text、`stop_reason=max_tokens`、`reasoningChars=6`（`:112-114`）；google `thought:true` 片段过滤、`finishReason='MAX_TOKENS'` 透出（`:132-133`）；openai-responses `output_text` 与 `output[]` 兜底双路径 + `incomplete_details.reason`（`:146-148`）；`null/'oops'/{}` 统一空正文不抛（`:151-156`）。

mock/夹具边界：无 mock、无 fixture、无网络拦截——两个错误分支用例依赖真实 `channel-manager` 列表中不存在 `'non-existent-channel-id-xyz'`；`getSettings()` 被真实调用但因显式传 `channelId/modelId` 不影响判定。未覆盖：`ensureAiClassWorkspace`/`listAiClassSessions`/`createAiClassSession`/演示课堂全链/`deleteAiClassSession` 清理/图谱生成与启发式/`estimateGraphGenerationCost`/`readCachedGraphEdges`/超时熔断/扩容重试/HTTP 错误矩阵/`coerceEdges` 校验，均无任何测试（全树检索 `cdut-ai-class-manager.test.ts` 为本文件唯一直接测试；`grep` 其他 `.test.ts` 无对本模块符号的断言）。间接证据：无（`study-artifact-service` 无对应测试文件命中本模块符号）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 项导出清单与行号 | 已证实 | `apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:142-1227` 逐条核对 |
| 协议判定按 provider 而非 URL | 已证实 | `:112-124`（注释红线 + 实现一致） |
| 代管模式 URL 改写 `/v1/proxy/chat|messages`、key 取 `proxyToken||token` | 已证实 | `:551-558` |
| 两次尝试/扩容 `min(2×,32768)`/每尝试独立计时 | 已证实 | `:344-346/:629/:640-647/:651-656` |
| 401/403 重试优先暴露；其余重试回抛 firstFailure | 已证实 | `:671-674` |
| 渠道校验先于取消检查（测试 :28 的真实断言语义） | 已证实 | `:544-547` 早于 `:641` |
| `readCachedGraphEdges` 无消费者 | 已证实（静态） | 冻结树 `apps/**`、`packages/**`、`resources/**` 全扩展名 `grep readCachedGraphEdges` 仅命中本文件 `:1227` 定义/导出 |
| `ensureAiClassWorkspace` 无外部直接调用者 | 已证实（静态） | 同范围检索仅命中本文件 `:142/:173/:190` 与渲染端注释 `apps/electron/src/renderer/lib/cdut-ai-class.ts:5` |
| 6 个 IPC 通道入口与 `_event` 无 sender 校验 | 已证实 | `apps/electron/src/main/ipc.ts:6588-6615` |
| 缓存体内 `documents` 恒空数组 | 已证实 | `:1217` 字面量 |
| 单批失败跳过、全败降级启发式 | 已证实 | `:998-1007/:1094-1095/:1130` |
| `deleteAiClassSession` 磁盘清理为 setImmediate 异步、失败不回滚 | 已证实 | `:318-337` |
| `writeJsonFileAtomic` 原子性实现（tmp+rename 等） | 推断 | 依赖 `apps/electron/src/main/lib/safe-file.ts`，本文件未其实现 |
| `titleLockedAt` 的消费者是 orchestrator 自动改名 | 推断 | 本文件注释 `:301-304` 自述；未读到消费者实现行号 |
| `generateKnowledgeGraph` 并发无锁，双调用竞写缓存 | 推断 | 全文件无互斥代码；竞态后果未实测 |
| `listStudyDocuments` 抛错时 `generateKnowledgeGraph` 未捕获 | 推断 | `:1195` 在 try/catch 之外 |
| 模型端真实行为（费用公式实际命中率等） | 未知 | 运行验证 NOT_RUN；外部服务行为不可静态断定 |
| 费用预估与实际计费一致性 | 未知 | 常量为参考单价（`:88` 注释「以主流大模型约 1.5 元计」） |

否定结论检索范围声明：上表「无消费者/无外部调用者」均以冻结 `05fb2565e2` 全树 `apps/**`、`packages/**`、`resources/**`（含无扩展名文件）字符串检索为准；未检索 `docs/**`、`node_modules/**`（非源码）。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ensureAiClassWorkspace` | §3.1 | 142-156 | covered |
| `ensureAiClassPreset` | §3.1 | 159-169 | covered |
| `listAiClassSessions` / `createAiClassSession` | §3.1 | 172-209 | covered |
| 演示课堂（`ensureDemoAiClassSession`/`runEnsureDemo…`/`resolveDemoNovelPath`/`lockDemoSessionTitle`） | §3.2 | 252-313 | covered |
| `deleteAiClassSession` 后台清理 | §3.3 | 316-338 | covered |
| `resolveCompletionProtocol` + 协议注入四分支 | §3.4 | 110-124/572-612 | covered |
| `oneShotJsonCompletion` 全分支（渠道/鉴权/重试/超时/取消） | §3.4 | 533-711 | covered |
| `inspectCompletionResponse` 四协议 | §3.5 | 423-498 | covered |
| `coerceEdges` 校验规则 | §3.6 | 738-786 | covered |
| 启发式（`titleTokens`/`jaccard`/`buildHeuristicEdges`/`buildIntraHeuristicEdges`） | §3.6 | 789-871/1043-1069 | covered |
| `runModelEdgeBatches`/`runWithConcurrency`/批处理 | §3.6 | 916-1014 | covered |
| `buildIntraDocumentGraph`/`buildHierarchicalMultiDocumentGraph` | §3.6 | 1075-1135 | covered |
| `estimateGraphGenerationCost` | §3.6 | 1144-1175 | covered |
| `generateKnowledgeGraph`/`readCachedGraphEdges`/缓存 I/O | §3.6/§5 | 1190-1235 | covered |
| 测试 12 用例断言 | §9 | test:15-157 | covered |
| 模型真实运行行为 | §10 | — | unknown（NOT_RUN） |
