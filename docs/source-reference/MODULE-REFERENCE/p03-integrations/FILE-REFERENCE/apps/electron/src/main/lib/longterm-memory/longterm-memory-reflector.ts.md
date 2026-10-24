---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-reflector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ca105a4006f359547416505b5bf2a5179bf3918
sha256: 33f64496ec5b8633011ffbc6dff1d8d997b0f1e30e2b25504a954e2b1289c699
lines: 509
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-reflector.ts

## 1. 结论与边界

长期记忆的“反思器 + 睡眠整合器”：每轮对话结束后用确定性正则从用户输入提取强偏好候选、统计工具调用频次与 Slash 指令，可选地过一次隔离审核，然后**一次批量**写入图谱；另有空闲定时任务做同义自动节点合并、时间衰减与弱记忆淘汰。运行时模块，含文本规则、审核编排、存储调用与定时器。

不做的事：不做模型调用本身（审核 `complete` 由 `agent-orchestrator.ts:818-830` 注入；本文件只接收 `auditCandidate`）；不做 BM25 检索（`longterm-memory-rag.ts`）；不实现存储/原子写（`longterm-memory-store.ts`）；不调度对话（调用方用 `setImmediate`，`agent-orchestrator.ts:813`）。

## 2. 导出与关键符号

导出 8 项：6 个 function、2 个 interface。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `splitPreferenceCandidates` | function | `:106-129` | `(text:string)=>string[]` | 按句切；>60 字再按逗号/分号切，并与前一子句拼接 |
| `extractPreferenceCandidates` | function | `:155-181` | `(userMessage:string)=>LongTermMemoryNodeInput[]` | 规则提取，最多 3 条 |
| `extractToolNamesFromMessages` | function | `:188-205` | `(messages:unknown[])=>string[]` | 只取 assistant `tool_use.name`，**不去重** |
| `ReflectTurnInput` | interface | `:209-223` | `{userMessage; toolNames?; graphPath?; auditCandidate?}` | 单轮反思入参 |
| `reflectOnTurn` | function | `:229-352` | `(input)=>Promise<void>` | 提取→比对→可选审核→一次 `apply`；异常只 warn |
| `ConsolidationResult` | interface | `:367-371` | `{merged; decayed; removed}` | 整合计数 |
| `consolidateLongTermMemory` | function | `:377-457` | `(options?:{graphPath?; now?})=>Promise<ConsolidationResult>` | 合并→衰减→淘汰 |
| `startLongTermMemoryConsolidator` | function | `:482-509` | `(intervalMs?:number)=>()=>void` | 启动定时器，返回停止函数；已有定时器时不重启 |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `PREFERENCE_PATTERNS` | `:30-49` | 17 条中英偏好句式 |
| `PRONOUN_ONLY_PATTERN` | `:52` | 仅匹配整句等于“把它/把那个/就这样/用那个/改成这样/那样就行/do it/that one” |
| `QUESTION_PATTERN` | `:58-59` | 句尾问号/疑问词开头/句尾“吗呢行不行…” |
| `CATEGORY_KEYWORDS` | `:62-68` | 5 类关键词，按顺序首个命中 |
| `TAG_PATTERN` | `:71` | 专有名词标签，最多 4 个 |
| `MAX_CANDIDATES_PER_TURN` 等 | `:73-78` | 3 条、6 字、0.45、60 字 |
| `fingerprint`/`titleKey` | `:83-92` | 小写、去空白、去中英标点 |
| `isMeaningful` | `:95-100` | 去标点/符号/停用字后 ≥6 字 |
| `inferCategory`/`inferTags`/`buildTitle` | `:131-152` | 类别、标签、标题 |
| `pushMutation` | `:249-264` | 同 id 合并增量，避免重复 mutation |
| `DECAY_HALF_LIFE_DAYS` 等 | `:356-365` | 30 天半衰、0.2/0.6/60 天、6h、300s |
| `round3` | `:459-461` | 保留 3 位小数 |
| `isIdleForConsolidation` | `:464-473` | 电池→false；无 electron→true；否则空闲≥300s |
| `consolidationTimer`/`consolidationRunning` | `:475-476` | 单定时器、防重入 |

## 3. 内部逻辑与关键流程

### 3.1 文本规则

**分句 `splitPreferenceCandidates`（`:106-129`）**：

1. 用 `(?<=[。！？!?\n])` 后向断言切句，trim、去空（`:107-110`）。
2. 每句长度 ≤60 → 整句作为一个 unit（`:114-116`）。
3. >60 → 按 `[，,；;]` 切片段；每个片段与前一个片段用 `，` 拼接，截 200（`:118-126`）。**只拼前一个片段，不累积整句**；第三个片段会丢掉第一个片段的语境。
4. 返回 units，不保证覆盖全文（空片段被过滤）。

**有效信息 `isMeaningful`（`:95-100`）**：去掉空白、Unicode 标点/符号，再去掉“的了和与及或是在我你他她它这那请就都会能”，剩余字符 ≥6 才算有意义。

**类别 `inferCategory`（`:131-136`）**：按 `CATEGORY_KEYWORDS` 顺序测试，首个命中；都不命中 → `interaction_style`。顺序是 `cdut_special_domain` → `tool_affinity` → `coding_preference` → `workflow_habit` → `interaction_style`（`:62-68`）。因此“用 Jotai 管理课表”会先命中 CDUT（“课表”）。

**标签 `inferTags`（`:138-144`）**：`TAG_PATTERN` 全局匹配 jotai/react/typescript/tailwind/usestate/useeffect/mcp/skill/origin/matplotlib/cslab，转小写、去重、最多 4 个。

**标题 `buildTitle`（`:146-152`）**：去掉开头“以后/下次/记住/从现在开始/from now on”及随后的逗号/空白，压缩空白，截 36 字；清洗后为空则用原文。

**候选 `extractPreferenceCandidates`（`:155-181`）**：

1. 遍历 units，达到 3 条即 break（`:159-160`）。
2. 跳过：无意义、整句命中 `PRONOUN_ONLY_PATTERN`、疑问句、不含任何 `PREFERENCE_PATTERNS`（`:161-164`）。
3. `content = unit.slice(0,200)`；用 `fingerprint(content)` 去重（`:166-169`）。
4. 生成 `{category, title, content, tags, confidence:0.65}`（`:171-177`）。

**工具名 `extractToolNamesFromMessages`（`:188-205`）**：只处理 `record.type === 'assistant'`（`:193`）；`record.message.content` 必须是数组（`:194-195`）；每个 block 的 `type === 'tool_use'` 且 `name` 是非空字符串，trim 后 push（`:196-201`）。**不去重**，重复调用保留重复（`:186-187` 注释）。

### 3.2 单轮反思 `reflectOnTurn`（`:229-352`）

整体 try/catch；任何异常只 `console.warn`（`:349-351`），不向调用方抛。

1. `message = input.userMessage.trim()`；长度 <4 → 返回；`startsWith('/compact')` → 返回（`:231-233`）。`/compact` 后带参数也会跳过。
2. `graphPath = input.graphPath ?? getLongTermMemoryGraphPath()`；`nodes = listLongTermMemoryNodes(graphPath)`（`:235-236`）。
3. 建两个 Map（`:238-243`）：
   - `byFingerprint[category:fingerprint(content)] = node`；
   - `byTitle[category:titleKey(title)] = node`。
   - 同 key 多节点时**后者覆盖前者**（Map.set 顺序）。
4. 准备 `mutations/creates/touched`（`:245-247`）。
5. `pushMutation(node, delta, confidenceDelta=0)`（`:249-264`）：
   - 已 touched：找同 id mutation，累加 `weightDelta`，非零 `confidenceDelta` 累加；找不到就静默丢弃。
   - 未 touched：加入 touched，push `{id, weightDelta, confidenceDelta?}`。
6. **偏好候选**（`:266-278`）：对每个 candidate，按 `category + fingerprint(content)` 查 `byFingerprint`；命中 → `pushMutation(existing,1,0.05)`；未命中 → 在 `pending` 内按同 key 去重后 push。
7. **可选审核**（`:280-302`）：
   - 仅当 `pending.length>0 && input.auditCandidate`。
   - `Promise.all` 并发审核；单条 reject 被 catch 成 `{status:'unavailable', reason:'审核调用异常'}`（`:283-287`）。
   - `rejected` → `console.log` 并丢弃（`:290-293`）。
   - `unavailable` → `console.warn`，`candidate.confidence = 0.45`（`:294-297`）。
   - 其余（approved）→ `creates.push(candidate)`（`:298`）。
   - 无 auditor → 全部 pending 直接进 creates（`:300-302`）。
   - **审核只作用于“新增的语义偏好候选”**；已存在节点的加权、工具节点、Slash 节点都不审核。
8. **工具频次**（`:304-326`）：`toolCounts` 统计非空 trim 名称；每个 name 构造标题 `常用工具 ${name}`；按 `tool_affinity:titleKey(title)` 查 `byTitle`；命中 → `pushMutation(existing,count)`；未命中 → create `{category:'tool_affinity', title, content:'用户在本机高频调用 ${name} 工具。', tags:[name,'tool'], confidence:0.6, weight:count}`。
9. **Slash 指令**（`:328-345`）：`message.match(/^\/([a-z][\w-]{1,20})\b/)`；命中 command → 标题 `常用指令 /${command}`；按 `workflow_habit:titleKey(title)` 查 `byTitle`；命中 → `pushMutation(existing,1)`；未命中 → create `{category:'workflow_habit', title, content:'用户经常使用 /${command} 指令推进任务。', tags:[command,'slash'], confidence:0.6}`。
10. 无 mutation 且无 create → 返回（`:347`）；否则 `await applyLongTermMemoryMutations(mutations, creates, graphPath)`（`:348`）。

**关键去重差异**：偏好候选只按“内容指纹”判重（`:269`），不按标题；工具/Slash 按“标题”判重（`:313`、`:333`）。而 store 的 `applyLongTermMemoryMutations` 对 `creates` 按“类别+标题”判重（`longterm-memory-store.ts:368-375`）。因此：若新偏好候选与已有节点同类别同标题但内容不同，反射器认为它是新候选，store 却会把已有节点加权并**丢弃新内容**。这是两层去重口径不一致的真实边界。

### 3.3 睡眠整合 `consolidateLongTermMemory`（`:377-457`）

1. `graphPath`、`now` 取参/默认；`nodes = listLongTermMemoryNodes(graphPath)`；空 → 全 0（`:380-383`）。
2. **同义合并**（`:390-419`）：
   - 只处理 `source==='auto_inferred'`；按 `category + fingerprint(content)` 分组（`:391-398`）。
   - 每组 ≥2：第一个为 `keep`，其余为 duplicates；累加 duplicate 的 weight、取最大 confidence、并集 tags（截 8）（`:399-417`）。
   - 为 keep push 一条 mutation：`weightDelta=sum`、`confidenceDelta=maxConfidence-keep.confidence`、`tags=union`；duplicates 加入 `removalIds`；`merged++`（每组合计 1）。
3. **衰减与淘汰**（`:421-441`）：遍历**原始 nodes**，跳过非自动和已标记删除的 duplicate。
   - `idleDays = max(0,(now-updatedAt)/86400000)`；<1 天跳过（`:424-425`）。
   - `nextWeight = round3(weight * 0.5**(idleDays/30))`（`:427`）。
   - `nextWeight < weight` → push `{id, weightDelta:nextWeight-weight, touchUpdatedAt:false}`，`decayed++`（`:428-432`）。`touchUpdatedAt:false` 保证衰减不重置空闲天数（`:429` 注释）。
   - 淘汰条件同时满足：`nextWeight < 0.2`、`confidence < 0.6`、`idleDays > 60` → 加入 `removalIds`（`:434-440`）。**没有排除已作为 keep 的节点**：一个既被合并又被判定弱的 keep 会先写合并 mutation，再被删除，合并进来的内容随删除丢失。
4. 有 mutation → 一次 `applyLongTermMemoryMutations(mutations, [], graphPath)`（`:443-445`）。
5. 逐个删除 `removalIds`：每个 id 一次 `deleteLongTermMemoryNode`，每次独立入队/读盘/写盘；异常 warn 后继续；`removed` 只计真正删除成功（`:447-454`）。
6. 返回 `{merged, decayed, removed}`（`:456`）。`merged` 是“合并组数”，不是被合并节点数；`decayed` 是“产生衰减的节点数”。

**同 id 两条 mutation 的顺序**：合并 mutation 先 push，衰减 mutation 后 push；store 按数组顺序应用。衰减 delta 用**合并前的原始 weight** 计算，因此合并后最终权重不等于“合并后权重再衰减一半”。这是可观察的数值边界，未在测试中断言。

### 3.4 空闲判定与定时器（`:463-509`）

`isIdleForConsolidation`（`:464-473`）：

- `require('electron').powerMonitor` 不存在 → `true`（测试/非 Electron 环境视为空闲）。
- `powerMonitor.isOnBatteryPower()` 为 true → `false`（**电池供电永不整合**）。
- 否则 `getSystemIdleTime() >= 300` 秒。

`startLongTermMemoryConsolidator`（`:482-509`）：

1. 已有 `consolidationTimer` → 直接返回一个“清掉现有 timer”的停止函数，**不创建新 timer、不改变间隔**（`:485-491`）。
2. `setInterval` 间隔 `Math.max(60_000, intervalMs)`（`:501`）；回调先检查 `consolidationRunning` 与空闲，再置 true，`void consolidate...catch(warn).finally(()=>false)`（`:493-500`）。
3. `timer.unref?.()` 不阻塞进程退出（`:502`）；保存到模块变量。
4. 返回停止函数：`clearInterval(timer)`，仅当模块变量仍是该 timer 时置 null（`:505-508`）。
5. 首次执行在第一个 interval 之后（≥60s），没有立即跑；停止不会中断已开始的整合，`consolidationRunning` 会在其 finally 复位。

## 4. 调用者与调用链

### 4.1 入向

| 调用者 | 位置 | 用法 |
| --- | --- | --- |
| Agent 编排 | `agent-orchestrator.ts:175`（import）、`:3229-3236` | 每轮成功完成后 `scheduleLongTermMemoryReflection`；`toolNames` 来自 `extractToolNamesFromMessages(accumulatedMessages)` |
| 同上 | `agent-orchestrator.ts:803-835` | `setImmediate` 后 `reflectOnTurn({... auditCandidate})`；`auditCandidate` 走 `auditLongTermMemoryCandidate` + `runLightweightCompletion`（10s） |
| 启动 | `apps/electron/src/main/index.ts:231`（import）、`:1059-1061` | `startLongTermMemoryConsolidator()`，停止函数存 `stopLongTermMemoryConsolidator` |
| 退出 | `apps/electron/src/main/index.ts:1261-1262` | 调用停止函数并置 null |
| 测试 | `longterm-memory-reflector.test.ts:14-21` | 直接调 5 个导出 |

全冻结树检索未发现其它调用者；渲染层不直接调用。

### 4.2 出向

- `applyLongTermMemoryMutations` / `deleteLongTermMemoryNode` / `listLongTermMemoryNodes` ← `./longterm-memory-store`（`:20-26`）。
- `getLongTermMemoryGraphPath` ← `../config-paths`（`:18`）。
- `MemoryAuditVerdict` 类型 ← `./longterm-memory-auditor`（`:19`）。
- `electron.powerMonitor` 通过 `require` 动态加载（`:466`）。

### 4.3 链路

```
STREAM 完成 (agent-orchestrator.ts:3225-3236)
  → scheduleLongTermMemoryReflection
  → setImmediate
  → reflectOnTurn
      → listLongTermMemoryNodes (store)
      → extractPreferenceCandidates / toolCounts / slash
      → auditCandidate? (auditor → runLightweightCompletion)
      → applyLongTermMemoryMutations (store, 一次写)
  → .catch(warn)（reflectOnTurn 内部已 catch，外层再兜底）

启动 (apps/electron/src/main/index.ts:1059) → startLongTermMemoryConsolidator
  → setInterval(≥60s)
  → isIdleForConsolidation (powerMonitor)
  → consolidateLongTermMemory
      → list → apply → delete*
```

## 5. 数据 I/O、读写与副作用

- **输入**：`userMessage`、`toolNames`、`graphPath`、可选 `auditCandidate`。
- **输出**：`reflectOnTurn` 无返回值；`consolidate` 返回三个计数。
- **磁盘**：不直接写；经 store 写 `user-habit-graph.json`。`reflectOnTurn` 一次 `apply`（一次读+一次写）；`consolidate` 一次 `apply` + N 次 `delete`（N 个删除各一次读+写）。
- **内存**：无模块级候选缓存；只有定时器状态 `consolidationTimer/consolidationRunning`。
- **副作用**：`console.log`（审核拒绝/成功日志）、`console.warn`（审核不可用、整合/淘汰失败）；定时器 `unref`；无网络（审核闭包在调用方）、无窗口操作。
- **幂等**：`reflectOnTurn` 对同一消息重复调用会重复加权（非幂等）；`consolidate` 同 `now` 重复调用会再次衰减（测试 `:318` 正是利用这一点），非幂等。
- **并发**：`reflectOnTurn` 可并发调用；store 写队列串行，且每个 apply 在队列任务内重读，所以并发轮次不会基于同一旧快照互相覆盖。`consolidate` 由 `consolidationRunning` 防重入，但不阻止与 `reflectOnTurn` 并发；两者都走 store 队列，写串行，但合并/淘汰的“读”发生在各自任务内，仍可能交错。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 消息 <4 字 | `:232` | 直接返回 |
| `/compact` 开头 | `:233` | 直接返回 |
| 无候选/工具/Slash | `:347` | 不写盘 |
| 审核拒绝 | `:290-293` | 丢弃候选，其余继续 |
| 审核不可用/异常 | `:294-297`、`:283-287` | 置信度 0.45 写入 |
| 审核 Promise reject | `:284-287` | 单条降级，不影响同轮其它候选 |
| store 写失败 | `:348` | 异常被外层 catch，warn；已写部分由 store 原子写保证 |
| 整轮异常 | `:349-351` | warn，不抛 |
| 整合空图 | `:383` | 返回全 0 |
| 合并 keep 同时被淘汰 | `:412-417`、`:434-440` | 先合并 mutation，后删除；内容丢失（边界） |
| 删除失败 | `:451-453` | warn，继续其它 id |
| 电池供电 | `:468` | 跳过整合 |
| 非 Electron | `:470-472` | 视为空闲（测试环境会整合） |
| 定时器已存在 | `:485-491` | 不重启，返回停止旧 timer 的函数 |
| 取消 | 无 | 无 AbortSignal；`reflectOnTurn`/`consolidate` 不可取消 |
| 重启 | 无持久定时器状态 | 启动时重新 `startLongTermMemoryConsolidator`；未完成的整合丢失，磁盘保持最后一次写 |

## 7. 权限与权威状态

- **无权限分支**：本文件没有 sender/role/actor 参数；`reflectOnTurn` 由主进程自动触发，`consolidate` 由定时器自动触发。用户不能直接经 IPC 触发反思/整合（IPC 只暴露读/增/改/删/检索测试，`longterm-memory-ipc.ts:41-85`）。
- **权威状态**：图谱文件由 store 产生；本文件的候选/合并/淘汰都是“建议”，最终由 store 的归一化/裁剪/写盘决定。`confidence 0.45`、`weight` 增量、`source` 都由本文件指定，store 可再夹取。
- **审核权威**：审核结论只影响新候选是否写入/置信度；不改变已有节点、工具节点、Slash 节点。审核不可用是“降级放行”，不是失败关闭。

## 8. 修改影响面

- 改 `PREFERENCE_PATTERNS`/`QUESTION_PATTERN`/`isMeaningful` → 直接影响哪些用户话被写入；测试 `longterm-memory-reflector.test.ts:57-104` 会变。
- 改 `MAX_CANDIDATES_PER_TURN`/`LONG_SENTENCE_THRESHOLD`/`splitPreferenceCandidates` → 影响长句召回与候选数量；测试 `:73-82` 只覆盖 44 字短句，无法防止长句回归。
- 改 `AUDIT_DEGRADED_CONFIDENCE` → 影响审核不可用节点的淘汰速度；测试 `:207-231` 断言 0.45。
- 改 `consolidate` 的合并/衰减/淘汰条件 → 影响所有自动节点的生命周期；测试 `:273-322` 只覆盖弱节点淘汰、新鲜节点、40 天衰减。
- 改 `startLongTermMemoryConsolidator` 的间隔/空闲判定 → 影响后台写频率与电池策略；无测试。
- 改 `apply` 调用次数/批量形状 → 影响 store 写次数与原子性；当前 `reflectOnTurn` 一次、`consolidate` 一次+N 次删除。
- 无存储格式变更；但去重口径（内容 vs 标题）与 store 不一致，修一边需同步另一边。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建或 Electron/GUI。

直接测试：`apps/electron/src/main/lib/longterm-memory/longterm-memory-reflector.test.ts`，5 个 `describe`、**23 个 `test`**（`:58,66,73,84,88,92,98,107,116,126,140,149,160,167,180,197,207,219,233,256,274,296,307`）。夹具：临时目录 + 显式 `graphPath`；`beforeEach` 只 `resetLongTermMemoryCache`（`:47-51`）；`afterEach` 删目录；`writeGraph` 直接 `writeJsonFileAtomic`。

| # | 用例 | 设置/动作 | 真实断言 | 缺口 |
| --- | --- | --- | --- | --- |
| 1 | 强偏好 | `extractPreferenceCandidates('以后都用 Jotai 管理状态')` | `length===1`、category `coding_preference`、content 含 `Jotai`（`:61-63`） | 未断言 title/tags |
| 2 | 校园域 | `'以后查空教室都用 CDUT 专区'` | category `cdut_special_domain`（`:69-70`） | 关键词优先级 |
| 3 | 含逗号长句 | 44 字消息；`split` + `extract` | units 1、candidates 1、content 含 matplotlib 与 Origin（`:78-81`） | **44<60，未触发逗号二次切分**；未测 >60 |
| 4 | 纯指代 | `'把它换掉'` | `[]`（`:85`） | 实际因 `isMeaningful` 长度不足（“把换掉”3 字），不是 `PRONOUN_ONLY_PATTERN` 整句命中 |
| 5 | 普通问答 | `'这个函数是做什么的'` | `[]`（`:89`） | — |
| 6 | 疑问句 | 三句：请记住…吗？/…对不对/下次…？ | 全 `[]`（`:93-95`） | 句尾“吧”不误杀由 #7 覆盖 |
| 7 | “吧”建议 | `'以后都用 Jotai 吧'` | 1 条，含 Jotai（`:101-102`） | — |
| 8 | 首轮落盘 | `reflectOnTurn` | 1 节点、source auto、category coding（`:110-113`） | 未断言 confidence |
| 9 | 重复偏好 | 连续两次 | 1 节点、weight 2、confidence≈0.7（`:120-123`） | 未断言 updatedAt |
| 10 | 同轮重复工具 | `toolNames:['read_file','read_file','grep']` | tool 节点 2 个；read_file weight 2（`:133-137`） | 未断言 grep weight 1 |
| 11 | Slash | `'/goal 跑一个长任务'` | 1 节点、workflow_habit、title `常用指令 /goal`（`:143-146`） | 未断言 content/tags |
| 12 | 并发两轮 | `Promise.all` 两条不同偏好 | 2 节点、id 唯一（`:155-157`） | 未断言顺序/权重 |
| 13 | `/compact` | 单条 | `[]`（`:162`） | 未测 `/compact x` |
| 14 | 工具名提取 | 2 assistant tool_use + text + user tool_use | 精确 `['read_file','read_file']`（`:175`） | 未测非数组 content/空 name |
| 15 | 审核通过 | auditor 记录 candidate | audited 1、节点 1、confidence≈0.65（`:191-194`） | 未断言 reason |
| 16 | 审核拒绝 | auditor 返回 rejected | `[]`（`:204`） | — |
| 17 | 审核不可用 | auditor 返回 unavailable | 1 节点、confidence≈0.45（`:214-216`） | — |
| 18 | 审核抛错 | auditor throw | 1 节点、confidence≈0.45（`:228-230`） | — |
| 19 | 已存在不审核 | 第一次 approved，第二次 auditor 计数 | `calls===0`、1 节点、weight 2（`:250-253`） | 未断言 confidence 0.75 |
| 20 | 工具/Slash 不审核 | `/goal` + tool，auditor 计数 | `calls===0`、2 节点（`:268-269`） | 未断言具体节点 |
| 21 | 陈旧弱自动淘汰 | 90 天前 weight .1/conf .4 + 手动同条件 | removed 1、只剩 manual、manual weight .1（`:291-293`） | 未测合并 |
| 22 | 新鲜节点 | weight 2/conf .8 | removed 0、1 节点、weight 2（`:302-304`） | — |
| 23 | 衰减不刷新 | 40 天前，同一 now 整合两次 | 第一次 <1；updatedAt 仍旧；第二次更小（`:313-321`） | 未断言精确值 |

**未覆盖**：同义合并（`merged`）、keep 同时被淘汰、合并+衰减同 id 数值、删除失败、`isIdleForConsolidation` 的电池/空闲分支、定时器启动/停止/重复启动、>60 字逗号切分、`PRONOUN_ONLY_PATTERN` 真正命中、偏好标题与 store 标题去重冲突、工具名大小写导致的双创建、Slash 大小写/长度边界、`/compact` 带参数、审核并发多候选。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 每轮反思一次 `apply`，异常只 warn | 已证实 | `:347-351` |
| 审核只作用于新增语义偏好，工具/Slash/已存在节点不审核 | 已证实 | `:269-302`、`:311-345`；测试 `:233-270` |
| 审核不可用/异常降置信度 0.45 | 已证实 | `:294-297`、`:283-287`；测试 `:207-231` |
| 工具名提取不去重 | 已证实 | `:186-187`、`:199-201`；测试 `:175` |
| 分句阈值 60 字，测试消息 44 字未触发 | 已证实 | `:78`；实测长度 44；`split:114-116` |
| “把它换掉”返回空是因有效字符不足，不是整句指代正则 | 已证实 | `isMeaningful:95-100`；`PRONOUN_ONLY:52` 只匹配“把它”整句 |
| 合并 mutation 与衰减 mutation 可能同 id，衰减基于原权重 | 已证实 | `:412-417`、`:427-432`；store 顺序应用 `:320-348` |
| keep 节点可能先合并后被淘汰 | 推断 | `:434-440` 未排除 `removalIds` 之外的 keep；未构造测试 |
| 电池供电永不整合 | 已证实 | `:468` |
| 非 Electron 环境视为空闲 | 已证实 | `:470-472` |
| 定时器重复启动不重启 | 已证实 | `:485-491` |
| 真实定时器/空闲行为 | 未知 | 未运行，未 mock powerMonitor |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PREFERENCE_PATTERNS` | 3.1 | `:30-49` | covered |
| `PRONOUN_ONLY_PATTERN` | 3.1、9 | `:52` | covered |
| `QUESTION_PATTERN` | 3.1 | `:58-59` | covered |
| `CATEGORY_KEYWORDS` | 3.1 | `:62-68` | covered |
| `splitPreferenceCandidates` | 3.1 | `:106-129` | covered |
| `extractPreferenceCandidates` | 3.1 | `:155-181` | covered |
| `extractToolNamesFromMessages` | 3.1 | `:188-205` | covered |
| `reflectOnTurn` | 3.2、6 | `:229-352` | covered |
| `pushMutation` | 3.2 | `:249-264` | covered |
| 审核分支 | 3.2、6 | `:280-302` | covered |
| 工具/Slash 分支 | 3.2 | `:304-345` | covered |
| `consolidateLongTermMemory` | 3.3、6 | `:377-457` | covered |
| 合并/衰减/淘汰 | 3.3、6 | `:390-454` | covered |
| `isIdleForConsolidation` | 3.4 | `:464-473` | covered |
| `startLongTermMemoryConsolidator` | 3.4、6 | `:482-509` | covered |
| 23 个测试断言 | 9 | `:58-321` | covered（静态读） |
| 定时器/电池/真实并发 | 3.4、9、10 | — | unknown（NOT_RUN） |
