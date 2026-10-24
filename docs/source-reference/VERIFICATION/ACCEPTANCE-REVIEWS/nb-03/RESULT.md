# NB-03 独立复核报告（G0/G1/G2）

- 批次：`NB-03`，包 `p03-integrations`，10 文件 / 2467 行
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（`git rev-parse HEAD` 实核，worktree clean，tree 3083）
- 作者：`docs-r07-author-nb-03-20261023`（sealed）
- 复核：`docs-r07-qa-nb-03-20261023`
- 结论：**G0 PASS / G1 PASS / G2 PASS —— 10 accepted / 0 revision_required / 0 unknown**
- 非阻断备注：2 条（store 1、ipc 1），无 blocking
- 运行状态：**NOT_RUN**。未执行 `bun test`、typecheck、build、Electron/GUI、真实模型请求。文中"断言"均指**静态读到**的用例体，不是执行结果。

## 0. 复核输入（sealed 字节）

| 产物 | sha256 |
| --- | --- |
| `READY.json` | `d94eb57e2d2cd59962d32c81f141d1142d26c2f4c543e4909f6bdb884bb45679` |
| `MANIFEST.json` | `4f557715625762b5ac80e9641845c4a4b035e723f61db55fc6a7e7202057f74d` |
| `DONE.json` | `238e81e7f6ad5f89d27cfb73bae900ebe0f76cbc4b79569f9e9a8b4bfc531ab4` |
| `R07-nb-03-05fb2565.zip` | `216c5c549be266bfe625ea7f538bd8b83d0e7e662cef6c0bf8ee94c0b1195967`（139151 B / 30 条目） |

`MANIFEST`/`DONE`/`ZIP` 三者哈希与 `READY` 内的声明逐一相符；`READY.manualHashes` 10/10 与实际字节相符。

## 1. G0 完整性 —— PASS

1. **冻结树**：HEAD 一致、clean、3083 = `BASELINE-ACCEPTED.trackedCount`；本批 10 path 在 `FILES.tsv` 各恰好 1 行，0 重复，全部 `p03-integrations`，无跨包夹带。
2. **源码绑定**：10 个源文件的 `blob` / `sha256` / `bytes` / `lines` 与 `nb-03-SCOPE.json` **10/10 全等**（独立重算，不采信作者声明）。
3. **手册绑定**：10 个手册 sha256 与 `READY.manualHashes` **10/10 全等**；ZIP 内解出的 10 个手册 = stage 字节 = READY 哈希，**三方两两相等**。
4. **ZIP 安全**：30 条目；无 `../`、无绝对路径、无盘符、无符号链接；只含本批 10 手册 + 9 个交付文件 + 目录条目；**不含** `reviews/`、legacy 正文、外批文件。
5. **重放**：`changes.diff` 在空树 `git apply` 成功，重放出的 10 篇与 stage **逐字节相同**（10/10）。
6. **范围**：`SCOPE.json` 的 `frozenSha/batch/fileCount/lines` 与 manager 分配一致。

**非阻断口径问题（已报 lead）**：`FILES.tsv.reviewer` 本批写 `p08-renderer-ui`，`nb-03-SCOPE.json.reviewer` 写 `docs-r07-qa-nb-03-20261023`。G0 第 1 条只要求"reviewer 非本包"，`p08 ≠ p03` 满足，故不阻断；但两处口径应统一。

## 2. G1 格式与可读性 —— PASS

- 元数据头 11 项：10/10 齐全；`path/frozenSha/blob/sha256/lines/kind/package` 与 SCOPE 逐项一致。
- 章节：6 个 source 各 11 章；4 个 test 各 6 章。薄文件（41/85/104 行）按复杂度裁剪，未凑无关章节。
- **导出清单**：对 6 个 source 的每个"符号→行号"行做机械比对（符号名必须出现在所引行附近），**0 处错位**；导出计数 11/9/1/5/8/3 与源码 grep 一致。
- **行号引用**：本文件内引用全部落在源文件行数内；跨文件引用（`agent-orchestrator.ts`、`safe-file.ts`、`cdut-ai-class-manager.ts`、`study-session-store.ts`、shared types 等）均带文件名，抽查可解析。
- 三分法与 `NOT_RUN`：10/10 具备；全目录检索无"测试通过/已验证"字样。
- 覆盖表：10/10 存在且可对照。

## 3. G2 逐文件结论

> 每文件均重读冻结源码；下列"已核"为本次实际比对过的点，非作者自述。

### 3.1 `longterm-memory-store.ts` — **accepted**（1 条 low 备注）

blob `562396bc…` / sha256 `b7a1435d…` / 398 行；手册 `b049e6ee…`

已核：
1. 导出 11 项（1 const + 7 fn + 3 type）与行号 `29/183/195/204/234/239/271/287/302/310/394` 全部正确。
2. 写队列 `writeChain.then(task, task)`（`:60`）——前序失败不阻断后续，且 `run` 仍会 reject；读盘在任务内部（`:209/245/276/316`）。
3. 缓存键 `mtimeMs:size`（`:48-53/65-72/184-191`）；**命中返回 `cache.graph` 本体而非副本**（`:186`）——手册明确写了，属正确。
4. 读路径**可能写盘**：`readJsonFileSafe` 的 `.tmp` 提升（`safe-file.ts:56-64`）与 `.bak` 回写（`:74-82`）；手册据此指出 `:182` 注释"不写盘"只在无 `.tmp/.bak` 时成立。**正确且是本批最重要的一处纠偏。**
5. `capNodes`（`:127-135`）只淘汰 `auto_inferred`，**500 是软上限**；手册给的 600/50 与 500+1 两个算例算术正确。
6. `apply` 的 `creates` 去重键 `category+normalizeTitleKey(title)` **不区分 source**（`:368-375`）→ 手动节点也会被加权并刷新 `updatedAt`；手册把"永不淘汰"限定为 capNodes/consolidate 保证，未由写入路径保证。**正确。**
7. `persistGraph` 先写盘再更缓存（`:168→169`），写失败时缓存不更新。
8. 无跨进程锁（全树无 flock/lockfile）；`resetLongTermMemoryCache` 仅测试调用（全树核实）。
9. 无 `longterm-memory-store.test.ts`（全树 find 确认），间接覆盖清单与实际测试一致。

**NB03-ST-01（low，非阻断）**：`longterm-memory-store.ts.md:144` 把 `creates` 权重写成 `weight: input.weight ?? 1`，源码 `:358` 是 `typeof input.weight === "number" ? input.weight : 1`。对声明类型 `number|undefined` 两者可观察行为相同（`undefined→1`、`0→0`、`NaN→clamp 0`），不影响结论。**动作**：改为源码表达式或补"非 number 一律取 1"。

### 3.2 `longterm-memory-auditor.ts` — **accepted**（无备注）

blob `fef60f8f…` / sha256 `77965343…` / 142 行；手册 `272a5867…`

已核：
1. 导出 9 项（3 const + 3 fn + 1 type + 2 interface），行号 `16/18/21/23/28/35/54/96/130` 全对。
2. 零网络 I/O：`complete` 注入；`auditLongTermMemoryCandidate` 捕获异常 → `unavailable("审核调用异常: …")`（`:139-141`），不向上抛。
3. 解析链：闭合推理块（`:83/99`）→ 未闭合前缀截到最后一个闭合标签（`:85/100-101`）→ 去围栏（`:102`）→ 首 `{` 到末 `}`（`:104-105`）→ `approved` 必须布尔（`:117`）→ reason 缺省文案、截 200（`:119-121`）。逐条与源码一致。
4. 手册指出 prompt 要求"≤20 词"而代码只截 200 字符、不校验词数/语言——**源码确实如此**，属正确发现。
5. 手册指出候选字段（title/content/tags）拼在 `<user_message_context>` **之外**、system 只把标签内声明为不可信——源码 `:67-77` 确实如此，隔离声明只覆盖标签内。**正确且未夸大。**
6. 调用链唯一：`agent-orchestrator.ts:819`，`complete` 走 `runLightweightCompletion`，`timeoutMs:10_000` 在 `:829`（已核）。
7. 测试 14 例、行号 `28,39,49,61,68,75,82,89,96,100,104,113,129,139` 与实际 `test(` 位置**逐一相符**；手册对"未闭合 think"用例的判断（无闭合标签，实际走大括号提取）正确。

### 3.3 `longterm-memory-auditor.test.ts` — **accepted**（无备注）

blob `51b40898…` / sha256 `734410ad…` / 151 行；手册 `4b544589…`

已核：3 describe（`:27/60/112`）+ 14 test 行号全对；无 fs/fetch/Electron import；断言均为真实 `expect`，无 skip/todo；手册明确标 `NOT_RUN` 且逐条列出未覆盖（超时、AbortSignal、注入、reason 截断等）。测试名与真实机制不符处（用例 8）已由作者主动指出。

### 3.4 `longterm-memory-ipc.ts` — **accepted**（1 条 low 备注）

blob `56665813…` / sha256 `e7a1714f…` / 85 行；手册 `7855095f…`

已核：
1. 仅导出 `registerLongTermMemoryIpc`（`:41-85`）；注册 5 个 handler，无第六个。
2. 广播 `broadcastChanged`（`:29-39`）：遍历 `getAllWindows()`、双重 `isDestroyed` 判活、整体 try/catch，异常只 warn——**任一窗口抛错会中断后续窗口**，手册写对了这一点。
3. 写成功才广播：ADD（`:50`）、UPDATE 仅 `updated` 非空（`:65`）、DELETE 仅 `success`（`:74`）；READ/QUERY 不广播。
4. `UPDATE_NODE` 只透传 5 个可编辑字段（`:58-64`），`id/source/createdAt` 由 store 托管——与 store `:255-257` 一致。
5. `QUERY_TEST` 的 `topK` 无上限（RAG `:211` 只 `Math.max(1,…)`）；`input?.query ?? ''` 对 undefined 安全。
6. **5 个 handler 均无 sender 校验**；全树无 `ipcMain.handle` 全局包装（已 grep `ipcMain.handle =`/`safeHandle`/`wrapHandle`，0 命中）。手册 §7 结论正确。
7. 注册点唯一：`ipc.ts:148` import、`:6226` 调用，位于 `registerReviewIpc`/`registerCsLabIpc` 之后。
8. 无专属测试（全树确认）。

**NB03-IP-01（low，非阻断）**：手册 §7（`:130`）与 §10（`:160`）写"五个 handler 都忽略 `_event`"。源码 `:42` 的 `READ_GRAPH` 签名为 `(): LongTermMemoryGraph =>`，**不接收 event 参数**；只有 ADD/UPDATE/DELETE/QUERY_TEST 取 `_event` 且未使用（`:48/57/72/81`）。结论（无 sender 校验）不变且更强，但"五个都忽略 `_event`"与逐入口事实不符。**动作**：按入口列写，并给出 5 个证据行号。

### 3.5 `longterm-memory-rag.ts` — **accepted**（无备注）

blob `bffcb443…` / sha256 `8a2a2dd3…` / 296 行；手册 `0ae2c2b8…`

已核：
1. 导出 5 项（4 fn + 1 interface），行号 `50/193/203/261/294` 全对；内部符号行号 `22-23/24/26/28/29/31-32/34-36/39-44/67-79/81/83-96/98-104/106-129/133-145/148-163/165-171/174-191` 全对。
2. 词元化：英文/数字 `{2,}` 整词去停用词；汉字单字去停用词 + 相邻 bigram **不过滤停用词、且因 `match(/[\u4e00-\u9fa5]/g)` 先剥标点而跨标点**——手册的 `"状态，管理"` → `状态/态管/管理` 例子**成立**（已核）。
3. `bm25 <= 0` 的文档在标签/标题直通之前就被跳过（`:224-225` 早于 `:227-243`）→ 手册"没有任何查询词命中的文档不会因标签/标题直通被召回"**正确**，这是本文件最易写错的一处。
4. 直通需 `meaningfulHit`（长度≥2 且命中 doc）**且**（标签命中 / queryCoverage≥0.6 / titleCoverage≥0.5）；首行不受 1400 预算约束（`:284` 的 `lines.length > 0`）——手册两处都写对。
5. 索引 revision = `max(updatedAt, graph.updatedAt):nodes.length`（`:98-104`），不含内容哈希；手册标为"推断"并说明"外部改内容不改 updatedAt"才失效，等级标注恰当。
6. 上下文块用 `hit.node.content`（`:280-282`）而非 `hit.excerpt`；`LONGTERM_MEMORY_CATEGORY_META` 引用 `shared:65-74` 正确。
7. 标签桥接 `queryLower.includes(tagLower)` 是子串匹配（`:153`），手册指出 `notjotai` 会命中 `jotai`——正确。
8. 调用者仅 IPC `:80-83` 与 `agent-orchestrator.ts:1553-1560`（已核），渲染层不 import；"全冻结树检索"的范围声明已给出。

### 3.6 `longterm-memory-rag.test.ts` — **accepted**（无备注）

blob `bee33c29…` / sha256 `4fb134b0…` / 161 行；手册 `cda69eef…`

已核：1 describe（`:58`）+ 10 test 行号 `59,77,89,99,107,120,135,140,148,156` 全对；夹具用 `mkdtempSync` + `writeJsonFileAtomic` 直写、`beforeEach` 清索引与 store 缓存、`afterEach` 删目录；**手册对用例 4 的判断正确**：`'的了和与'` 仍产生 bigram，返回空是因无词频交集而非 tokenize 为空——与本报告预读结论一致。用例 8/9 靠直通通过 `minScore:5`（`:143/151`）已核。

### 3.7 `longterm-memory-reflector.ts` — **accepted**（无备注）

blob `3ca105a4…` / sha256 `33f64496…` / 509 行；手册 `a154cf40…`

已核（这是本批逻辑最密的文件，逐点验证）：
1. 导出 8 项（6 fn + 2 interface），行号 `106/155/188/209/229/367/377/482` 全对。
2. `splitPreferenceCandidates` **只与前一子句拼接、不累积整句**（`:123-125`），手册"第三个片段会丢掉第一个片段的语境"正确。
3. 类别推断顺序 `cdut→tool→coding→workflow→interaction`（`:62-68`），手册"用 Jotai 管理课表先命中 CDUT"正确。
4. `reflectOnTurn`：`<4` 字与 `startsWith('/compact')` 双早退（`:232-233`）；一次 `apply`（`:348`）；异常只 warn（`:349-351`）。
5. 审核只作用于**待新建的语义候选**（`:280-302`）；已存在节点加权、工具节点、Slash 节点均不审核——手册与测试 `:233-270` 的 `calls===0` 断言一致。
6. `pushMutation` 同 id 累加、找不到则静默丢弃（`:249-264`）；Map 同 key **后者覆盖前者**（`:238-243`）。
7. **去重口径不一致**：reflector 偏好按内容指纹（`:269`），store `creates` 按类别+标题（`store:368-375`）→ 同类别同标题不同内容会被 store 加权并**丢弃新内容**。手册明确写出该边界，且与 store 手册表述一致（跨手册无矛盾）。
8. `consolidate`：合并按 `category:fingerprint(content)`、keep 取列表首、duplicate 权重求和/置信度取最大/tags 并集截 8（`:391-419`）；衰减 `0.5**(idleDays/30)` 且 `touchUpdatedAt:false`（`:427-431`）；淘汰 `next<0.2 && conf<0.6 && idle>60`（`:434-440`）；删除逐个执行（`:447-454`）。
9. **keep 可先合并后被淘汰**：衰减循环只排除 `removalIds`（`:423`），而 keep 不在其中 → 合并内容随删除丢失。手册标为"推断"并给出行号，**判断正确、等级恰当**。
10. **同 id 两条 mutation**：合并先 push、衰减后 push；衰减 delta 基于**合并前**原始权重（`nodes` 是快照）→ 最终权重 ≠ "合并后再衰减一半"。手册判断正确，且未在测试中断言（已核：测试无 merged 用例）。
11. 定时器：单例、`Math.max(60_000,…)`、`unref`、`consolidationRunning` 防重入、首次执行在第一个 interval 后（`:482-509`）；`isIdleForConsolidation` 电池→false、非 Electron→true（`:464-473`）。
12. 生命周期 `index.ts:1059-1061` 启动、`:1261-1262` 停止（已核）。

### 3.8 `longterm-memory-reflector.test.ts` — **accepted**（无备注）

blob `bb9c6bbd…` / sha256 `bd082c4c…` / 323 行；手册 `4d0c7dfc…`

已核：5 describe（`:57/106/166/179/273`）+ 23 test 行号 `58,66,73,84,88,92,98,107,116,126,140,149,160,167,180,197,207,219,233,256,274,296,307` **逐一相符**（实测 `grep -c` 亦为 23）。
手册两处独立判断经实测确认：
- 用例 3 的消息**实测 44 字**（阈值 60），未触发逗号二次切分；
- 用例 4 `'把它换掉'` 去停用字后仅剩 `把换掉`（**3 字** <6），返回空是 `isMeaningful` 所致，**不是** `PRONOUN_ONLY_PATTERN` 命中。
这两点都是"测试名与真实机制不符"，作者主动指出而非照抄测试名，符合 `FACT-CHECKING-NOTES`。

### 3.9 `study-artifact-service.ts` — **accepted**（无备注）

blob `27b30dc5…` / sha256 `f2e5416d…` / 361 行；手册 `2165aa5d…`（`CHANGES.tsv` 标 `M`）

已核：
1. 导出 3 项全为 function，行号 `58/302/320` 全对；内部符号 `33/36/41/73/83/108/123/141/157/188/211/238/264` 全对。
2. `buildSourceMaterial` 只取 `fileName + navigationMarkdown`，总预算 12000（`:33/41-55`）；**只有文件名无 navigation 时仍视为有资料**——手册指出该边界，正确。
3. `listStudyDocuments` 被调**两次**（`:323` 与 `:327`）→ TOCTOU；手册写明"`sourceDocs` 与 `source` 可能不一致"，正确。
4. 渠道优先级 `input.channelId || sessionMeta?.channelId || undefined`（`:331-335`），空串回退；`sessionId` 确为 agent session id（`createAiClassSession` 返回 `session.id`，`cdut-ai-class-manager.ts:189-208`），故 `getAgentSessionMeta` 能命中——手册正确。
5. 三分支：`mindmap`/`flashcard` 显式判断，**其它任何 kind 落 quiz 分支**（`:355-360` 无 else 校验）。手册标"已证实"，正确。
6. `resolveArtifactMaxTokens`：mindmap 8192；flashcard 6144/8192/16384；quiz `count>=20→16384` 否则 `min(16384,max(8192,4096+600*count))`；手册的 5→8192、10→10096、19→15496 三个算例**算术正确**。
7. 归一化：导图 `depth<5` 递归（根 depth 0 → 最多 6 层）、label 40/notes 200/studyPrompt 400、空 children 不写字段；卡片 front 200/back 1200/topic 40/`createInitialFsrs()`；quiz question 400/option 300/explanation 1200/sourceTrace 300、type 只认 `multiple|boolean` 其余 `single`；最终 `shuffleQuiz`。逐条与源码一致。
8. 手册明确"不校验 answer key 是否存在于 options""不按 id 去重""不校验 Mermaid/位置分布/sourceTrace 格式"——均为**提示词约束而非输出后校验**，正确。
9. 本文件无 try/catch，错误原样上抛至 `ipc.ts:6579-6581` → renderer `toast.error`（`AiClassRightTabs.tsx:361-363`）；手册对"本层无重试、无 catch"的表述正确（重试只在 `oneShotJsonCompletion` 内部 2 次）。
10. 两个根目录区分正确：素材 `study-materials/{id}`、工件 `study-sessions/{id}`；`assertStudyId` + `startsWith(root+sep)` 防穿越（`config-paths.ts:1241-1249/1307-1313`）已核。
11. `save*` 同步写盘、无锁 → 同 session 并发生成后写覆盖先写；手册标"已证实"，正确。
12. 未传 AbortSignal，UI 取消只忽略结果不中止请求——`oneShotJsonCompletion` 支持 `options.signal`（`:631`）但本文件未传，正确。

### 3.10 `study-artifact-service.test.ts` — **accepted**（无备注）

blob `e47546f3…` / sha256 `07ee7af4…` / 41 行；手册 `5813ad44…`

已核：1 describe（`:16`）+ 5 `it` 行号 `17,21,27,32,36` 全对；只 import `resolveArtifactMaxTokens`，无 mock/磁盘/网络；额度断言值与源实现一致。手册对 `questionCount=NaN` 的推演（`Math.max(1,Math.min(50,NaN))=NaN` → `count>=20` 为 false → `Math.min(16384,Math.max(8192,NaN))=NaN`）**正确**且正确标为"推断"。

## 4. 跨文件一致性（抽查 9 条不变量，全部一致）

| 不变量 | 涉及手册 | 结果 |
| --- | --- | --- |
| 读路径可能写盘（`.tmp`/`.bak` 恢复） | store / ipc / rag | 一致，均带 safe-file 行号 |
| 500 为软上限，手动节点不淘汰 | store | 正确且给算例 |
| 原子性 = `.bak`+`.tmp`+`rename`，无 fsync | store | 正确 |
| 无跨进程锁，仅进程内队列 | store / reflector / study | 一致 |
| 审核三态：approved 写 / rejected 丢 / unavailable 降 0.45 | auditor / reflector | 一致 |
| `<user_longterm_memory>` 只进 `<SYSTEM_CONTEXT>` | rag | 正确，且声明"本文件不校验调用点" |
| `/compact` 三处拦截 | reflector / rag | 一致 |
| 去重口径不一致（内容指纹 vs 类别+标题） | reflector / store | 两篇表述互相吻合，无矛盾 |
| 两个 study 根目录 | study | 正确区分 |

## 5. QA 自我更正（经理质询项）

经理指出我预读清单 3.5 的"非法 category **只有**绕过 store 直接写文件才可能"可能与 3.1"读会归一化、cache 返回内部引用"不一致。**重核结论：我原推论错误。**

- **直接写 JSON 不是通路**：`getIndex`→`readLongTermMemoryGraph`→`normalizeGraph`→`normalizeNode`，非法 category 在 `store:102-104` 被强制改为 `interaction_style`，进入 RAG 前已被消除。
- **缓存引用是另一路**：`store:186` 返回 `cache.graph` 本体；若主进程调用者就地改写即可注入非法值而**无需写文件**。但全树 6 个调用点（rag:107、ipc:43、store:196/209/245/276/316）均只读或先 `cloneGraph`，**当前无触发者** → 潜在风险，非当前路径。
- **第三路**：`VALID_CATEGORIES`（store:38-44）与 `LONGTERM_MEMORY_CATEGORY_META`（shared:65-74）当前同键；仅未来漂移时可达。

已作废原"只有…"表述，改为条件式，详见 `SOURCE-CHECKLIST.md §3.11`。

**对作者无影响**：10 篇手册均未沿用该错误因果——`ipc.ts.md:131` 与 `store.ts.md:86` 都正确写"store 归一化回退 `interaction_style`"，`rag.ts.md:106` 只陈述查表本身、未断言可达性。故不构成 finding。

## 6. 结论

- **10 accepted**，acceptedHashes 见 `REVIEWED-HASHES.json`，lead 可按确切 manualSha256 逐篇合入。
- 2 条 low 备注**不阻断**合入；若作者愿意修，须按合同另开 `nb-03-r1` 目录/ZIP 并重新封版，QA 按新字节复验——**不得原地改已封版字节**。
- 本轮 `NOT_RUN`：未执行任何测试/typecheck/build/GUI/真实模型请求；未把静态断言写成"通过"。
- 未改作者正文/源码/candidate/全局总账；只写 `reviews/nb-03/` 与 `handoffs/`。
