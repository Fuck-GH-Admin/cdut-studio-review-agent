---
path: apps/electron/src/main/lib/study/study-artifact-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 27b30dc583440696680c1cbc05be95f36bcd8f6a
sha256: f2e5416de1f54a297720cca6e3d4318c7dd1dee51f8a314e5ffd74dc947475ba
lines: 361
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/study/study-artifact-service.ts

## 1. 结论与边界

AI 速课堂的“学习工件生成服务”：聚合当前课堂已启用资料的**大纲**（`navigationMarkdown`，上限 12000 字符），按 `mindmap/flashcard/quiz` 构造提示链，调用一次性 JSON 补全，解析并归一化为强类型工件，再经 `study-session-store` 原子落盘到 `~/.cdutai/study-sessions/{sessionId}/`。运行时模块，含网络模型调用、磁盘写入与 ID 生成。

不做的事：不实现补全协议/渠道鉴权（`oneShotJsonCompletion`，`cdut/cdut-ai-class-manager.ts:533`）；不实现资料索引/大纲（`study-document-indexer.ts`）；不实现工件存储格式（`study-session-store.ts:120-253`）；不做测验判分/FSRS 推进（`submitQuizAnswer`/`updateCardRating`）；不做权限校验。

## 2. 导出与关键符号

导出 3 项，全部是 function。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `extractJsonObject` | function | `:58-71` | `(raw:string)=>unknown \| null` | 剥可选 json 围栏，取首 `{` 到末 `}`，JSON.parse；失败 null |
| `resolveArtifactMaxTokens` | function | `:302-312` | `(input:StudyGenerateArtifactInput)=>number` | 按工件类型/卡模式/题量分配输出 token |
| `generateStudyArtifact` | function | `:320-361` | `(input)=>Promise<StudyGenerateArtifactResult>` | 聚合资料→补全→归一化→落盘；失败抛可读错误 |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `MAX_SOURCE_CHARS` | `:33` | `12_000` |
| `genId` | `:36-38` | `${prefix}-${Date.now().toString(36)}-${random 6}` |
| `buildSourceMaterial` | `:41-55` | 已启用资料 `fileName + navigationMarkdown`，总量截断 |
| `asString`/`asArray` | `:73-79` | 类型收窄，非字符串/数组给默认 |
| `normalizeMindMapNode` | `:83-106` | 递归（深度 <5）归一化节点 |
| `normalizeMindMap` | `:108-119` | 根节点失败抛错；生成 id/title/sourceDocs/createdAt |
| `normalizeFlashcard` | `:123-139` | front/back 必填；生成 FSRS 初始状态 |
| `normalizeDeck` | `:141-153` | 卡片全空抛错；title/difficulty/mode |
| `normalizeQuizQuestion` | `:157-186` | options/answer 必填；type 白名单 |
| `normalizeQuiz` | `:188-207` | 题目全空抛错；打乱题序/选项 |
| `buildMindMapPrompts` | `:211-236` | system/user 提示链 |
| `buildFlashcardPrompts` | `:238-262` | 按卡模式/难度给目标数量 |
| `buildQuizPrompts` | `:264-294` | 题量/题型/难度、Z3 互斥、位置分布、引用锚点 |
| `generateStudyArtifact` 三分支 | `:337-360` | 每种工件独立补全/归一化/保存 |

## 3. 内部逻辑与关键流程

### 3.1 资料聚合 `buildSourceMaterial`（`:41-55`）

1. `listStudyDocuments(sessionId)` 取全部大纲，过滤 `doc.enabled !== false`（`:42`）——`undefined` 视为启用。
2. 每份文档拼 `${fileName}\n${navigationMarkdown || ''}` 后 trim；空则跳过（`:46-47`）。
3. 剩余预算 `remain = 12000 - used`；≤0 break；否则 `text` 超过 remain 就截断（`:48-52`）。
4. 片段用 `\n\n---\n\n` 连接（`:54`）。
5. **只取大纲 `navigationMarkdown`，不取全文/章节内容**；因此模型看到的是资料目录/导航，不是原文。若某文档 `navigationMarkdown` 为空但 `fileName` 非空，`text` 仍非空，服务会认为“有资料”并继续生成（`:46`、`:324`）。
6. `listStudyDocuments` 在 `generateStudyArtifact` 中还会再调一次取 `documentId`（`:327`），两次调用之间资料可能变化；`sourceDocs` 与 `source` 可能不一致。

### 3.2 JSON 提取 `extractJsonObject`（`:58-71`）

1. 空串/`null` → `null`（`:59`）。
2. trim；用 `/```(?:json)?\s*([\s\S]*?)```/i` 找**第一个**围栏；`fence[1]` 非空才替换为围栏内容（`:60-62`）。
3. 取第一个 `{` 与最后一个 `}`；缺失或 `end <= start` → `null`（`:63-65`）。
4. `JSON.parse` 切片；异常 → `null`（`:66-70`）。
5. 只接受以 `{` 开始的对象；顶层数组、纯字符串、多个对象拼接都可能失败或取到跨对象片段。

### 3.3 思维导图归一化（`:83-119`）

`normalizeMindMapNode(raw, depth)`：

- 非对象或 `label` 非字符串/trim 空 → `null`（`:84-87`）。
- 只有 `depth < 5` 才递归 children；深度 5 的节点保留自身、丢弃其后代（`:90-95`）。根 depth=0，所以最多 6 层（0..5）。
- 结果只保留 `id/label/notes?/studyPrompt?/children?`（`:96-104`）；模型返回的 `position` 被丢弃（由 `saveMindmapCoords` 后续写）。
- `id` 为空 → `genId('mm-node')`；`label` 截 40；`notes` 截 200；`studyPrompt` 截 400。
- children 为空数组时不写 `children` 字段（`:104`）。

`normalizeMindMap(json, sourceDocs)`：

- `obj = (json ?? {}) as Record`；根取 `obj.root ?? obj`（`:109-110`）。若模型直接返回根节点对象（无 `root` 包裹），也能解析。
- 根归一化失败 → 抛“模型返回的思维导图 JSON 无法解析或结构不完整（可能被输出上限截断），请重试或降低导图规模。”（`:111`）。
- 生成新 `id`（`mindmap-...`）、`title`（默认“学习思维导图”，截 60）、`sourceDocs`、`createdAt`（`:112-118`）。

### 3.4 抽认卡归一化（`:123-153`）

- `normalizeFlashcard`：非对象、front/back 任一 trim 空 → `null`（`:124-128`）；id 空则 `card-...`；front 截 200、back 截 1200、topic 默认“综合”截 40；`fsrs: createInitialFsrs()`（`:129-135`，初始 `stability:0,difficulty:5,reps:0,lapses:0,lastReview:0,nextReview:0,state:'new'`，`fsrs-scheduler.ts:126-136`）；`sourceAnchor` 可选截 120（`:136-137`）。
- `normalizeDeck`：`obj.cards` 数组逐项归一化并过滤；**一张有效卡都没有** → 抛“模型返回的抽认卡 JSON 无法解析或结构不完整（可能被输出上限截断），请减少卡片数量或更换模型后重试。”（`:141-144`）。
- deck 的 `title` 默认 `input.focusedTopic || '抽认卡卡包'` 截 60；`difficulty` 默认 `medium`；`mode` 默认 `standard`；`createdAt`（`:145-152`）。**不按 id 去重**，模型重复 id 会原样保留。

### 3.5 测验归一化（`:157-207`）

`normalizeQuizQuestion`：

- `question` 非空必填（`:160-161`）。
- `options` 逐项要求对象、`key`/`text` 非空；text 截 300；无效项丢弃（`:162-171`）。
- `answer` 逐项 `asString(...).trim()` 后过滤空；options 或 answer 为空 → `null`（`:172-173`）。
- `type` 只接受 `multiple`/`boolean`，其余（含 `single`、非法值、缺省）→ `single`（`:174-176`）。
- 结果：id 空则 `q-...`；question 截 400；explanation 默认“暂无解析”截 1200；sourceTrace 默认“课程资料”截 300（`:177-185`）。
- **不校验**：answer key 是否存在于 options；single/boolean 是否只有一个答案；boolean 选项是否恰好“正确/错误”；选项 key 是否重复。

`normalizeQuiz`：

- `obj.questions` 逐项归一化并过滤；全空 → 抛“模型返回的测验 JSON 无法解析或结构不完整（可能被输出上限截断），请减少题目数量、降低难度或更换模型后重试。”（`:188-193`）。
- `difficulty` 默认 `medium`；生成 id/title（默认 `focusedTopic || '自测练习'`，截 60）/`totalQuestions=questions.length`/`completed:false`/`score:0`/`estimatedTheta:0`/`createdAt`（`:194-204`）。
- `questions: shuffleQuiz(questions)`（`:205`）：打乱题序与选项序，按选项 key 重映射答案；boolean 或选项 <2 不重排；answer 与任何选项 key 都对不上时原样返回（`quiz-options.ts:71-90`）。

### 3.6 提示链（`:211-294`）

- **MindMap**（`:211-236`）：system 4 段——角色（成都理工大学 AI 速课堂 Lead Knowledge Architect）、学生语言约定、只输出单个 JSON 对象、禁止 Mermaid/箭头/形状包装，层级只能靠 `children`；user 给 schema、深度 2–4、每层 2–6 分支、label ≤14 中文字、notes 一句、非叶节点 studyPrompt，最后插入 `source`。
- **Flashcard**（`:238-262`）：按 `cardMode` 给目标数量——`concise` 5–8、`in_depth` 20+、其余 10–15；difficulty 映射为 Foundational/Application/Comprehensive；system 强调 MIP、Miller 7±2、学生语言、单 JSON；user 给 schema 与 source。
- **Quiz**（`:264-294`）：`count = clamp(1,50,input.questionCount ?? 5)`；`types = input.questionTypes?.join(', ') || 'single'`；difficulty 映射；system 含 Z3 一阶逻辑互斥、答案位置分布（不得连续首位置、A/B/C/D 尽量均匀）、学生语言、单 JSON；user 要求每题 options/answer/explanation/sourceTrace，sourceTrace 必须是 `[第X页·小节名](#fN:pX)` 形式，boolean 必须用 `[{key:"A",text:"正确"},{key:"B",text:"错误"}]`，最后插入 source。
- 提示词只约束模型，**不做输出后校验**（如 Mermaid、位置分布、sourceTrace 格式都可能在归一化后仍存在）。

### 3.7 输出额度 `resolveArtifactMaxTokens`（`:302-312`）

- `mindmap` → 8192。
- `flashcard`：`concise` 6144、`in_depth` 16384、其余 8192。
- quiz：`count = clamp(1,50,input.questionCount ?? 5)`；`count>=20` → 16384；否则 `min(16384, max(8192, 4096 + count*600))`。因此 5 题 → 8192（4096+3000=7096 被抬到 8192），10 题 → 10096，19 题 → 15496。
- 该值传给 `oneShotJsonCompletion` 的 `maxOutputTokens`（`:331-335`）；底层 `Math.max(1000, options.maxOutputTokens ?? GRAPH_MAX_TOKENS)`（`cdut-ai-class-manager.ts:630`），首次失败/截断时第二次尝试 `min(maxOutputTokens*2, MAX_ONE_SHOT_OUTPUT_TOKENS)`（`:643-647`）。

### 3.8 生成主流程 `generateStudyArtifact`（`:320-361`）

1. `source = buildSourceMaterial(input.sessionId)`；`source.trim()` 为空 → 抛“当前课堂暂无可用资料：请先导入课程资料后再生成。”（`:323-326`）。
2. `docs = listStudyDocuments(...).filter(enabled).map(documentId)`（`:327`）——第二次读资料列表。
3. `sessionMeta = getAgentSessionMeta(input.sessionId)`（`:330`）：`sessionId` 是 AI 速课堂的 **agent session id**（`createAiClassSession` 返回 `session.id`，`cdut-ai-class-manager.ts:189-208`），所以能查到 meta；查不到则 undefined。
4. `completionOptions`：`channelId = input.channelId || sessionMeta?.channelId || undefined`；`modelId` 同理；`maxOutputTokens = resolveArtifactMaxTokens(input)`（`:331-335`）。空字符串会回退。
5. 按 `input.kind` 分支（`:337-360`）：
   - `mindmap`：`buildMindMapPrompts` → `await oneShotJsonCompletion` → `!raw` 抛“思维导图生成失败：模型未返回结果，请检查渠道配置。” → `normalizeMindMap(extractJsonObject(raw), docs)` → `saveMindmap(input.sessionId, mindmap)` → 返回 `{kind:'mindmap',mindmap}`。
   - `flashcard`：同构；`normalizeDeck`；`saveFlashcardDeck`；返回 `{kind:'flashcard',deck}`。
   - **其它任何 kind（包括非法字符串）落入 quiz 分支**：`buildQuizPrompts` → 补全 → `normalizeQuiz` → `saveQuiz` → 返回 `{kind:'quiz',quiz}`。类型上 `StudyArtifactKind` 只有三个值，但运行时没有 `else` 校验。
6. `save*` 是同步 void；写失败会抛，调用方已生成的对象不回滚（磁盘可能保留旧文件或本次原子写结果）。

## 4. 调用者与调用链

### 4.1 入向

| 调用者 | 位置 | 用法 |
| --- | --- | --- |
| Main IPC | `apps/electron/src/main/ipc.ts:195`（import）、`:6579-6581` | `ipcMain.handle(STUDY_IPC_CHANNELS.GENERATE_ARTIFACT, async (_event,input)=>generateStudyArtifact(input))` |
| Preload | `apps/electron/src/preload/index.ts:2081`（类型）、`:4673-4674` | `generateArtifact: (input)=>ipcRenderer.invoke(GENERATE_ARTIFACT,input)` |
| Renderer | `renderer/components/cdut-zone/ai-class-tabs/AiClassRightTabs.tsx:326-369` | `handleGenerate` 组装 `sessionId/channelId/modelId`，await 结果后建 tab/刷新/Toast |
| 测试 | `study-artifact-service.test.ts:10` | 只调 `resolveArtifactMaxTokens` |

全冻结树检索未发现其它 `generateStudyArtifact` 调用者；`STUDY_IPC_CHANNELS.GENERATE_ARTIFACT` 只在上述 IPC/preload 出现。

### 4.2 出向

- `oneShotJsonCompletion` ← `../cdut/cdut-ai-class-manager`（`:25`，实现 `:533-711`）。
- `shuffleQuiz` ← `./quiz-options`（`:26`，实现 `:96-110`）。
- `getAgentSessionMeta` ← `../agent-session-manager`（`:27`，实现 `:469-472`）。
- `listStudyDocuments` ← `./study-document-indexer`（`:28`，实现 `:830-842`）。
- `createInitialFsrs` ← `./fsrs-scheduler`（`:29`，实现 `:126-136`）。
- `saveFlashcardDeck` / `saveMindmap` / `saveQuiz` ← `./study-session-store`（`:30`，实现 `:120-130`、`:177-187`、`:243-253`）。
- 类型 ← `@profer/shared`（`:14-24`，定义 `packages/shared/src/types/study.ts:391-414` 等）。

### 4.3 链路

```
UI handleGenerate (AiClassRightTabs.tsx:326-369)
  → preload study.generateArtifact (preload/index.ts:4673-4674)
  → ipc STUDY_IPC_CHANNELS.GENERATE_ARTIFACT (ipc.ts:6579-6581)
  → generateStudyArtifact
      → listStudyDocuments ×2 (study-document-indexer.ts:830)
      → getAgentSessionMeta (agent-session-manager.ts:469)
      → build prompts
      → oneShotJsonCompletion (cdut-ai-class-manager.ts:533; 90s timeout, 2 attempts)
      → extractJsonObject → normalize* → shuffleQuiz (quiz)
      → saveMindmap/saveFlashcardDeck/saveQuiz
          → read list → ensureSessionDataDir → writeJsonFileAtomic
  → result → UI 建 tab / refreshArtifacts / toast
```

## 5. 数据 I/O、读写与副作用

- **输入**：`StudyGenerateArtifactInput`（`sessionId/kind/focusedTopic?/cardMode?/difficulty?/questionCount?/questionTypes?/channelId?/modelId?`，`packages/shared/src/types/study.ts:391-408`）。
- **输出**：三选一联合体 `{kind, mindmap|deck|quiz}`（`:411-414`）。
- **读盘**：
  - `listStudyDocuments` 读 `study-materials/{sessionId}` 下每份文档的 `index.json` 与 `active-documents.json`（`study-document-indexer.ts:830-842`、`:491-504`）。
  - `getAgentSessionMeta` 读 agent session index（`agent-session-manager.ts:469-472`）。
- **写盘**：
  - `saveMindmap` → `mindmaps.json`；`saveFlashcardDeck` → `flashcards.json`；`saveQuiz` → `quizzes.json`（`study-session-store.ts:120-130`、`:177-187`、`:243-253`）。
  - 每个 save 都“读现有数组 → 覆盖/追加 → `ensureSessionDataDir`（`mkdirSync recursive`）→ `writeJsonFileAtomic`”（`study-session-store.ts:46-48`、`:120-130`）。
  - 文件路径经 `getStudySessionDataDir` 的 `assertStudyId`（`^[A-Za-z0-9_-]+$`）与 `startsWith(root+sep)` 防穿越（`config-paths.ts:1241-1249`、`:1307-1313`）。
- **网络**：`oneShotJsonCompletion` 发起模型请求；本文件不直接 fetch。
- **原子性/并发**：单个 save 是 `.tmp`+`rename`，无 `fsync`；**没有跨进程/跨窗口锁**。两个并发生成同一 session/同一工件类型会各自读旧数组、各自写，后写覆盖先写（`study-session-store.ts:120-130` 等无队列）。本文件也不做去重/幂等，每次生成新 id。
- **副作用**：生成 id 用 `Date.now()+Math.random`；写盘；无日志（本文件不打印）；无窗口操作；模型调用由底层打日志。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无可用资料（source 空） | `:324-326` | 抛“当前课堂暂无可用资料…” |
| 资料只有文件名、无 navigation | `:46-47` | `text` 非空，继续生成（不报无资料） |
| 模型返回空 | `:340`、`:349`、`:357` | 抛对应“生成失败：模型未返回结果…” |
| JSON 无法提取 | `:341`、`:350`、`:358` | `extractJsonObject` 返回 null → normalize 抛结构错误 |
| 导图根无效/无 label | `:111` | 抛结构错误（提示可能截断） |
| 卡片全无效 | `:144` | 抛结构错误 |
| 题目全无效 | `:193` | 抛结构错误 |
| 补全 HTTP/超时/鉴权失败 | `cdut-ai-class-manager.ts:668-699` | 底层抛可读错误；本文件不包装 |
| 输出截断 | `cdut-ai-class-manager.ts:679-693` | 首次截断会扩容重试一次；仍失败抛“达到长度上限被截断…” |
| 保存失败 | `study-session-store.ts:126-129` 等 | 异常向上抛；已生成对象不返回 |
| 非法 kind | `:355-360` | 落入 quiz 分支（无校验） |
| 取消 | 无 | 本文件不接收 AbortSignal；`oneShotJsonCompletion` 支持 `options.signal`（`:631`）但本文件未传。UI 的 `generationSeqRef/cancelledGenRef` 只忽略结果/Toast（`AiClassRightTabs.tsx:328-352`），**不中止请求** |
| 重启/恢复 | 无 | 生成中的请求丢失；已落盘工件保留；无临时文件清理逻辑（依赖 `.tmp` 读恢复） |

**用户可见文案**：无资料、三类“模型未返回结果”、三类“JSON 无法解析或结构不完整…”；补全错误来自底层（未配置渠道、渠道不存在、团队登录过期、HTTP、超时、截断）。

## 7. 权限与权威状态

- **无权限分支**：本文件不接收 sender/role；IPC handler 也忽略 `_event`（`ipc.ts:6579`），没有 senderFrame 校验。任何能发 `STUDY_IPC_CHANNELS.GENERATE_ARTIFACT` 的渲染上下文都能触发模型请求与写盘。
- **权威状态**：`sessionId` 决定资料目录与存储目录；路径由 `assertStudyId` 限制。渠道/模型优先级为“显式入参 → 会话 meta → 全局默认”（`:329-335`，底层 `cdut-ai-class-manager.ts:538-543`）；本文件不校验渠道是否启用/模型是否存在，由底层 `listChannels`/`getAdapter` 决定。
- **数据权威**：生成结果以磁盘 `mindmaps.json/flashcards.json/quizzes.json` 为准；本文件返回的内存对象与落盘对象是同一引用（save 前构造），但 IPC 结构化克隆后 UI 拿到副本。

## 8. 修改影响面

- 改 `MAX_SOURCE_CHARS`/`buildSourceMaterial` → 影响所有工件的输入上下文与模型成本；只取 `navigationMarkdown` 的边界会改变生成质量。
- 改 prompt → 影响模型输出结构/语言/引用格式；`extractJsonObject`/normalize 的容错必须同步评估。
- 改 normalize 的截断/默认值 → 影响落盘数据与 UI 展示；`MindMapNode.label` 40、`FlashcardItem.front/back` 200/1200、`QuizQuestion.question` 400 等是实际契约。
- 改 `resolveArtifactMaxTokens` → 影响输出预算/截断率；测试 `study-artifact-service.test.ts:16-40` 直接断言 5 个场景。
- 改保存调用 → 影响 `study-session-store` 的文件格式/并发覆盖；需同步 `listStudyArtifacts`/`getMindmap`/`getFlashcards`/`getQuiz`。
- 改 kind 分支 → 若新增工件类型，必须补 `StudyGenerateArtifactResult`、IPC/preload/UI tab 类型与 save 函数；当前未知 kind 会静默走 quiz。
- 无迁移/版本字段；`study-session-store` 的 `STUDY_SESSION_STORE_VERSION=1` 由存储层写。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建、Electron/GUI 或真实模型请求。

直接测试：`apps/electron/src/main/lib/study/study-artifact-service.test.ts`，1 个 `describe`、**5 个 `it`**（`:17,21,27,32,36`）。夹具 `input(overrides)` 返回 `{sessionId:'test-session', kind:'quiz', ...overrides}`（`:12-14`）。只测 `resolveArtifactMaxTokens`，**不测** `generateStudyArtifact`、prompt、normalize、extractJsonObject、保存。

| # | 用例 | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | 思维导图固定 8192 | `resolveArtifactMaxTokens({kind:'mindmap'})` | `toBe(8_192)`（`:18`） |
| 2 | 抽认卡三模式递增 | concise/standard/in_depth | `6_144`/`8_192`/`16_384`（`:22-24`） |
| 3 | 默认 5 题不低于 8192 | 无 questionCount / 5 | 均 `8_192`（`:28-29`） |
| 4 | 10 题线性增加 | questionCount 10 | `10_096`（`:33`） |
| 5 | 20 题及以上封顶 | 20/50/200 | 均 `16_384`（`:37-39`） |

**未覆盖**：`generateStudyArtifact` 的无资料/空返回/JSON 失败/保存失败分支；三种 prompt 的字段；`extractJsonObject` 的围栏/多对象/数组；mindmap 深度/截断；flashcard 无效卡过滤；quiz 的 type/answer/option 校验与 `shuffleQuiz` 重映射；渠道继承；并发保存覆盖；UI 取消不中止请求。测试全部是纯函数，无磁盘/网络/Electron。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 资料输入只取 `fileName + navigationMarkdown`，上限 12000 | 已证实 | `:41-55` |
| 只有文件名、无 navigation 时仍视为有资料 | 已证实 | `:46-47`、`:324` |
| `extractJsonObject` 取首个围栏、首 `{` 到末 `}` | 已证实 | `:60-70` |
| 导图最大 6 层（depth 0..5） | 已证实 | `:90-95` |
| 卡片/题目全无效时抛结构错误 | 已证实 | `:144`、`:193` |
| quiz 未知 kind 落入 quiz 分支 | 已证实 | `:355-360` 无 else |
| 渠道优先级显式→会话→全局 | 已证实 | `:329-335`；`cdut-ai-class-manager.ts:538-543` |
| 未传 AbortSignal，UI 取消不中止请求 | 已证实 | `:339/348/356` 无 signal；`AiClassRightTabs.tsx:328-352` 只忽略结果 |
| 保存无并发锁，后写覆盖先写 | 已证实 | `study-session-store.ts:120-130` 等无队列/锁 |
| 生成结果不幂等（每次新 id） | 已证实 | `genId:36-38`；normalize 每次新建 id |
| 真实模型输出/截断率/UI 行为 | 未知 | 本轮未发请求、未跑 GUI |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MAX_SOURCE_CHARS` | 2、3.1 | `:33` | covered |
| `genId` | 2、5 | `:36-38` | covered |
| `buildSourceMaterial` | 3.1、6 | `:41-55` | covered |
| `extractJsonObject` | 3.2、6 | `:58-71` | covered |
| `asString`/`asArray` | 2、3.3-3.5 | `:73-79` | covered |
| `normalizeMindMapNode` | 3.3 | `:83-106` | covered |
| `normalizeMindMap` | 3.3、6 | `:108-119` | covered |
| `normalizeFlashcard` | 3.4 | `:123-139` | covered |
| `normalizeDeck` | 3.4、6 | `:141-153` | covered |
| `normalizeQuizQuestion` | 3.5 | `:157-186` | covered |
| `normalizeQuiz` | 3.5、6 | `:188-207` | covered |
| `buildMindMapPrompts` | 3.6 | `:211-236` | covered |
| `buildFlashcardPrompts` | 3.6 | `:238-262` | covered |
| `buildQuizPrompts` | 3.6 | `:264-294` | covered |
| `resolveArtifactMaxTokens` | 3.7、9 | `:302-312` | covered |
| `generateStudyArtifact` | 3.8、4、6 | `:320-361` | covered |
| 5 个额度测试 | 9 | `:16-40` | covered（静态读） |
| 模型/保存/并发/取消 | 5、6、9、10 | — | unknown（NOT_RUN） |
