---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 562396bca77df030d5969ed5101faaf76b3d18e3
sha256: b7a1435d34487e63b4ddcab25c5eb4696ed4aaa4a221df437e734d21c6cefe95
lines: 398
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-store.ts

## 1. 结论与边界

长期记忆图谱的唯一存储层：把单个 JSON 文件（默认 `~/.cdutai/user-habit-graph.json`）读成 `LongTermMemoryGraph`，在进程内做节点归一化、500 条容量裁剪、缓存 + `mtimeMs:size` 指纹校验，并把所有写操作放进一条模块级 Promise 串行队列；写盘复用 `writeJsonFileAtomic`（`.tmp` + `rename`，写前 `.bak`）。运行时模块，含真实磁盘读写与进程内并发控制。

不做的事：不定义 IPC（`longterm-memory-ipc.ts:41-85` 注册 handler）；不提取偏好、不做睡眠整合（`longterm-memory-reflector.ts`）；不做 BM25 检索（`longterm-memory-rag.ts`）；不做跨进程锁、文件锁或数据库事务；不校验调用者身份。`resetLongTermMemoryCache` 注释即写明“仅供测试”（`:393`），生产代码没有调用者。

## 2. 导出与关键符号

导出 11 项：1 个 const、7 个 function、3 个类型（1 个 type alias + 2 个 interface）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MAX_LONGTERM_MEMORY_NODES` | const | `:29` | `500` | 节点容量上限；仅 `capNodes` 使用 |
| `readLongTermMemoryGraph` | function | `:183-192` | `(graphPath?: string) => LongTermMemoryGraph` | 缓存命中直接返回；否则读盘、归一化并刷新缓存 |
| `listLongTermMemoryNodes` | function | `:195-199` | `(graphPath?: string) => LongTermMemoryNode[]` | 按 `weight*confidence` 降序返回深拷贝节点 |
| `addLongTermMemoryNode` | function | `:204-232` | `(input: LongTermMemoryNodeInput, graphPath?: string) => Promise<LongTermMemoryNode>` | 手动新增，`source` 固定 `user_manual`，权重固定 1 |
| `LongTermMemoryNodePatch` | type | `:234-236` | `Partial<Pick<LongTermMemoryNode,'category'\|'title'\|'content'\|'tags'\|'confidence'>>` | 更新白名单；不含 `id/weight/source/时间戳` |
| `updateLongTermMemoryNode` | function | `:239-268` | `(nodeId, patch, graphPath?) => Promise<LongTermMemoryNode \| null>` | 找不到或归一化失败返回 `null` |
| `deleteLongTermMemoryNode` | function | `:271-284` | `(nodeId, graphPath?) => Promise<boolean>` | 未命中返回 `false` 且不写盘 |
| `LongTermMemoryMutation` | interface | `:287-299` | `{id; weightDelta?; confidenceDelta?; title?; content?; tags?; touchUpdatedAt?}` | 批量增量变更 |
| `LongTermMemoryCreateInput` | interface | `:302-304` | `LongTermMemoryNodeInput & {weight?: number}` | 批量新建入参 |
| `applyLongTermMemoryMutations` | function | `:310-386` | `(mutations, creates?, graphPath?) => Promise<void>` | 一次读盘、一次写盘；同类别同标题的新建转成加权 |
| `resetLongTermMemoryCache` | function | `:394-398` | `() => Promise<void>` | 排入写队列后清空缓存；仅测试使用 |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `cache` / `writeChain` | `:55-56` | 单槽缓存；全局串行链 |
| `enqueueWrite` | `:59-63` | 前序失败也继续执行后续任务；返回本次任务的 Promise |
| `stampOf` | `:65-72` | `mtimeMs:size`，异常返回 `missing` |
| `clamp` | `:76-79` | 非有限数返回 `min`，否则夹到 `[min,max]` |
| `normalizeTags` | `:81-94` | 去非字符串、trim、截 24 字、去重、最多 8 个 |
| `normalizeNode` | `:96-124` | 内容为空返回 `null`；补 id/标题/类别/权重/置信度/来源 |
| `capNodes` | `:127-135` | 超出 500 时按 `weight*confidence` 升序淘汰自动节点 |
| `normalizeGraph` | `:137-157` | 非对象→空图；按 id 去重；强制 `version:1` |
| `cloneGraph` | `:159-165` | 节点与 tags 深拷贝 |
| `persistGraph` | `:167-170` | 原子写后把传入对象直接放进缓存 |
| `normalizeTitleKey` | `:173-178` | 小写、去空白、去中英标点，用于标题去重 |
| `capGraphNodes` | `:388-391` | 未裁剪时返回原对象，裁剪时返回新对象 |

## 3. 内部逻辑与关键流程

### 3.1 写队列 `enqueueWrite`（`:59-63`）

```ts
const run = writeChain.then(task, task)
writeChain = run.catch(() => undefined)
return run
```

- 队列是**模块级、全路径共享**的：不同 `graphPath` 的写也互相排队（`:56`）。
- `then(task, task)` 表示前一个任务 reject 时仍执行当前任务；前序失败不会毒化链（`:60`）。
- `writeChain` 只保存“已吞掉错误”的尾链，调用者拿到的 `run` 仍会 reject（`:61-62`）。
- 队列只在**单进程**内生效；没有文件锁、没有跨窗口/跨进程互斥，也没有超时/取消。

### 3.2 读路径 `readLongTermMemoryGraph`（`:183-192`）

1. 先 `stampOf(graphPath)` 取 `mtimeMs:size`（`:184`；文件不存在为 `missing`，`:65-72`）。
2. 缓存存在、路径相同、指纹相同 → 直接返回 `cache.graph`（`:185-187`）。**返回的是缓存对象本身，不是副本**。
3. 否则 `readJsonFileSafe<unknown>(graphPath)`（`:188`）→ `normalizeGraph`（`:189`）→ 用**读前**取得的 `stamp` 建缓存（`:190`）→ 返回。
4. 默认参数 `getLongTermMemoryGraphPath()` 在调用时求值（`:183`），该函数经 `getConfigDir()` 会 `mkdirSync` 配置目录（`config-paths.ts:80-89`、`:297-299`），因此“只读”仍可能创建 `~/.cdutai` 目录。
5. `readJsonFileSafe` 不是纯读：主文件损坏时会 `renameSync(.tmp → 主文件)`（`safe-file.ts:56-64`），或从 `.bak` 用 `writeJsonFileAtomic` 回写主文件（`safe-file.ts:74-82`）。所以 `:182` 注释“缺失或损坏时返回空图谱，不写盘”**只对“图谱文件缺失/主文件为空且无 .tmp/.bak”成立**；存在可恢复的 `.tmp`/`.bak` 时会写盘。这是读 API 的真实副作用，不能按注释理解为绝对只读。

### 3.3 归一化（`:96-157`）

`normalizeNode`：

- 非对象或 `content` 非字符串/trim 后为空 → `null`（`:97-100`）。
- `category` 不在 5 个枚举内 → `interaction_style`（`:102-104`，集合见 `:38-44`）。
- `title` 为空时取 `content.slice(0,24)`，最终截 48 字（`:106-107`）。
- `createdAt/updatedAt` 必须是有限 number，否则分别回退 `fallbackNow`/`createdAt`（`:109-110`）。
- `id` 为空则 `randomUUID()`（`:113`）。
- `content` 超过 800 字时截断并追加 `…`，结果长度 801（`:116`）。
- `weight` 非 number 时按 `0` 处理，再夹到 `[0,50]`（`:118`）；`confidence` 非 number 默认 `0.6`，夹到 `[0,1]`（`:119`）。
- `source` 只有精确等于 `user_manual` 才保留，其余一律 `auto_inferred`（`:122`）。

`normalizeGraph`：

- 非对象（含 `null`、字符串、数组）→ `{version:1, updatedAt:now, nodes:[]}`（`:139-141`）。
- `nodes` 非数组 → 空列表（`:143`）。
- 逐项 `normalizeNode`，按 `id` 去重（先到先留，`:146-151`）。
- `updatedAt` 非有限 number 回退 `now`；最后 `capNodes`（`:152-156`）。
- 丢弃原文件的 `version`，恒写 `1`（`:153`）。

### 3.4 容量裁剪 `capNodes`（`:127-135`）

- 不超过 500 直接原样返回（`:128`）。
- 计算 `overflow = nodes.length - 500`（`:132`）。
- 只对 `source === 'auto_inferred'` 的节点按 `weight*confidence` **升序**排序，取前 `overflow` 个 id 淘汰（`:129-134`）。
- **不保证结果 ≤500**：若自动节点数少于 `overflow`，只淘汰全部自动节点，手动节点全部保留。例：600 个节点中 50 个自动 → 淘汰 50 个后仍 550 个；500 个手动 + 新增 1 个手动 → 501 个。注释“用户手动节点永不淘汰”（`:126`）与“上限 500”因此是两条独立约束，后者可被突破。
- 排序只比较乘积，未定义同分顺序；`Array.prototype.sort` 在现代 V8 稳定，但源码未显式 tie-break。

### 3.5 手动新增 `addLongTermMemoryNode`（`:204-232`）

1. 入队（`:208`）。
2. `cloneGraph(readLongTermMemoryGraph(graphPath))`（`:209`）——读盘发生在队列任务内部，符合文件头“读盘必须发生在写队列任务内部”（`:12`）。
3. 用 `randomUUID()`、`weight:1`、`confidence: input.confidence ?? 0.6`、`source:'user_manual'`、同一 `now` 构造并归一化（`:210-225`）。
4. 内容为空 → `normalizeNode` 返回 `null` → 抛 `Error('记忆内容不能为空')`（`:226`），不写盘。
5. push、更新 `graph.updatedAt`、`persistGraph(graphPath, capGraphNodes(graph))`（`:227-229`）。
6. 返回 `node`。该对象同时被放进 `cache.graph.nodes`（`persistGraph:169`），调用者若原地改它，会改到缓存。

### 3.6 更新 `updateLongTermMemoryNode`（`:239-268`）

1. 入队、克隆读盘（`:244-245`）。
2. 按 `node.id === nodeId` 找下标；找不到返回 `null`，**不写盘、不更新 `updatedAt`**（`:246-247`）。
3. 合并 `{...原节点, ...patch, id: nodeId, source: 原source, createdAt: 原createdAt, updatedAt: now}` 后归一化（`:250-260`）。
4. 归一化返回 `null`（例如 patch 把 `content` 改成空串）→ 返回 `null`，不写盘（`:261`）。
5. 写回数组、更新图时间、裁剪、落盘（`:263-265`）。
6. 注意：patch 可改 `title` 为空串，归一化会用内容前 24 字补标题；`tags: []` 会清空标签；`confidence` 会被夹到 `[0,1]`。返回的 `merged` 若在超限图里被 `capNodes` 淘汰，函数仍返回该节点，但磁盘上已不存在。

### 3.7 删除 `deleteLongTermMemoryNode`（`:271-284`）

- 过滤掉目标 id；长度未变 → `false`，不写盘（`:277-278`）。
- 命中 → 替换节点数组、更新时间、落盘、`true`（`:279-282`）。
- 不做容量裁剪，也不检查节点来源（手动/自动都可删）。

### 3.8 批量变更 `applyLongTermMemoryMutations`（`:310-386`）

这是反思器与睡眠整合的唯一批量写入口。

1. 入队、克隆读盘、取 `now`（`:315-317`）。
2. **变更循环**（`:320-348`）：按 id 找节点，找不到 `continue`（`:321-322`）。
   - `weightDelta` 为真值（非 0/NaN）才加并夹 `[0,50]`（`:324-327`）。
   - `confidenceDelta` 同理夹 `[0,1]`（`:328-331`）。
   - `title` 非空才覆盖并截 48（`:332-335`）；`content` 非空才覆盖并截 800（`:336-339`）；`tags` 为数组（含空数组）就整体替换并归一化（`:340-343`）。
   - 任一字段生效才 `dirty=true`；`touchUpdatedAt !== false` 时刷新 `updatedAt`；`changed=true`（`:344-347`）。显式 `touchUpdatedAt:false` 用于时间衰减，避免重置空闲天数（`:294-297`、`:429`）。
3. **新建循环**（`:350-380`）：每个输入归一化为 `source:'auto_inferred'`、`weight: input.weight ?? 1`（`:351-365`）；归一化失败 `continue`（`:366`）。
   - 以 `category + normalizeTitleKey(title)` 在**当前图**中找已有节点（`:368-371`）。
   - 命中 → 该节点 `weight+1`、`confidence+0.05`、`updatedAt=now`（`:372-375`）。**不审核、不区分来源**：命中的即使是 `user_manual` 节点也会被加权和刷新时间。
   - 未命中 → push 新节点（`:377`）。
   - `changed=true`（`:379`）。
4. 全无变化 → 直接返回，不写盘（`:382`）。
5. 有变化 → 更新图时间、裁剪、落盘（`:383-384`）。

关键语义：同批次内两个 `creates` 若同类别同标题，**不会互相去重**——`existing` 只查 `graph.nodes`，新 push 的候选已进入 `graph.nodes`，所以第二个会命中第一个并转成加权（`:377` 后下一次 `:369` 能查到）。`creates` 的 `weight` 只在首次创建时使用；重复创建走 `+1` 而不是 `+input.weight`。

## 4. 调用者与调用链

### 4.1 入向（全冻结树检索）

检索 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts` 及仓库根 `*.{js,mjs,cjs}`（排除 `docs/` 与本目录自身）后，真实调用者只有：

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC 注册 | `apps/electron/src/main/lib/longterm-memory/longterm-memory-ipc.ts:42-44` | `readLongTermMemoryGraph()` |
| 同上 | `:49` | `await addLongTermMemoryNode(input)` |
| 同上 | `:58-64` | `await updateLongTermMemoryNode(node.id, {...})` |
| 同上 | `:73` | `await deleteLongTermMemoryNode(nodeId)` |
| 反思器 | `longterm-memory-reflector.ts:236` | `listLongTermMemoryNodes(graphPath)` |
| 反思器 | `:348` | `await applyLongTermMemoryMutations(mutations, creates, graphPath)` |
| 反思器 | `:382` | `listLongTermMemoryNodes(graphPath)` |
| 反思器 | `:444` | `await applyLongTermMemoryMutations(mutations, [], graphPath)` |
| 反思器 | `:450` | `await deleteLongTermMemoryNode(id, graphPath)` |
| RAG | `longterm-memory-rag.ts:107` | `readLongTermMemoryGraph(graphPath)` |
| 测试 | `longterm-memory-rag.test.ts:14,51`、`longterm-memory-reflector.test.ts:21,50` | `resetLongTermMemoryCache` / `list...` |

渲染层只有同名的 Jotai atom（`renderer/atoms/longterm-memory-atoms.ts:122`），它走 `window.electronAPI.longTermMemory.*`，不直接 import 本文件。

### 4.2 出向

- `getLongTermMemoryGraphPath` ← `../config-paths`（`:23`，实现 `config-paths.ts:297-299`）。
- `readJsonFileSafe` / `writeJsonFileAtomic` ← `../safe-file`（`:24`，实现 `safe-file.ts:15-33`、`:39-90`）。
- `randomUUID`（`:15`）、`statSync`（`:16`）。
- 类型仅来自 `@profer/shared`（`:17-22`，定义 `packages/shared/src/types/longterm-memory.ts:25-62`）。

### 4.3 完整链路

```
renderer atoms (longterm-memory-atoms.ts:101/91/124)
  → preload longTermMemory.addNode/updateNode/deleteNode (preload/index.ts:4152-4160)
  → ipcMain.handle (longterm-memory-ipc.ts:46-77)
  → store add/update/delete
  → enqueueWrite → readLongTermMemoryGraph → readJsonFileSafe
  → persistGraph → writeJsonFileAtomic
  → broadcastChanged (ipc.ts:29-39) → 所有存活窗口 CHANGED

agent-orchestrator STREAM 完成 (agent-orchestrator.ts:3229-3236)
  → setImmediate → reflectOnTurn (longterm-memory-reflector.ts:229)
  → list + applyLongTermMemoryMutations / delete

agent-orchestrator 构造上下文 (agent-orchestrator.ts:1553-1560)
  → buildLongTermMemoryBlock → searchLongTermMemory → getIndex → readLongTermMemoryGraph

启动 (apps/electron/src/main/index.ts:1059-1061) → startLongTermMemoryConsolidator
  → 定时 consolidateLongTermMemory → list/apply/delete
```

## 5. 数据 I/O、读写与副作用

- **输入形状**：`LongTermMemoryNodeInput` 只有 `category/title/content/tags?/confidence?`（`packages/shared/src/types/longterm-memory.ts:56-62`）；store 自己生成 `id/weight/createdAt/updatedAt/source`。
- **磁盘格式**：`{version:1, updatedAt:number, nodes:LongTermMemoryNode[]}`，`JSON.stringify(data,null,2)`（`safe-file.ts:29`）。
- **写原子性**：`writeJsonFileAtomic` 先 `copyFileSync(主文件,.bak)`（失败忽略），再写 `主文件.tmp`，最后 `renameSync`（`safe-file.ts:20-32`）。**没有 `fsync`**：rename 原子只保证目录项切换，崩溃时仍可能丢最后写入；`.bak` 是上一版，不是本次写前快照的强保证（备份失败被吞，`:21-25`）。
- **读恢复**：主文件损坏 → 尝试 `.tmp` 并提升；再失败 → `.bak` 回写主文件；都失败返回 `null`（`safe-file.ts:39-89`）。恢复动作会写盘/删 `.tmp`。
- **缓存**：单槽 `cache`（`:55`），键是 `path` + `mtimeMs:size`（`:48-53`、`:184-186`）。外部编辑若保持同样的 mtime 毫秒与 size，缓存不会失效；多个 `graphPath` 交替读会互相踢缓存。
- **并发**：同进程写串行；读不进队列。读与写在队列外可交错：`readLongTermMemoryGraph` 可能读到写任务 `rename` 前的旧文件；写任务内部重新读盘，因此写不会基于调用前的快照。
- **幂等**：`add` 每次生成新 id，不幂等；`update/delete` 按 id 幂等（重复 delete 第二次返回 false 且不写）；`apply` 对同一 mutation 重复调用会重复加权，不幂等。
- **副作用**：创建配置目录（`config-paths.ts:84-87`）；写 `.tmp`/`.bak`；`readJsonFileSafe` 的恢复写；无日志（本文件不打印）、无网络、无进程/窗口操作。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 读缓存命中 | `:185-187` | 直接返回缓存对象；不读盘 |
| 文件缺失/损坏且无备份 | `safe-file.ts:89` | 返回 `null` → 空图；不写盘 |
| 主文件损坏但有 `.tmp`/`.bak` | `safe-file.ts:56-82` | 恢复并写盘 |
| 新增内容为空 | `:226` | 抛“记忆内容不能为空”；队列后续任务仍执行 |
| 更新目标不存在 | `:246-247` | 返回 `null`，不写 |
| 更新后内容为空 | `:261` | 返回 `null`，不写 |
| 删除目标不存在 | `:277-278` | 返回 `false`，不写 |
| 批量无变化 | `:382` | 直接返回，不写 |
| 写盘抛错（权限/磁盘满/rename 失败） | `safe-file.ts:29-32` | 异常向上抛；`cache` 不更新（`persistGraph:168` 之后才 `:169`）；队列继续 |
| 前序写失败 | `:60-61` | 后续任务照常执行 |
| 取消 | 无 | 本文件没有 AbortSignal/取消分支；已入队任务无法撤回 |
| 进程重启 | 无内存恢复 | 只依赖磁盘；`.tmp`/`.bak` 由读路径恢复 |

**恢复边界**：`persistGraph` 先写盘再更新缓存（`:167-170`）。若 `writeJsonFileAtomic` 的 `rename` 成功但随后 `stampOf` 抛错（实际被 `catch` 成 `missing`，`:66-71`），缓存会记为 `missing`，下次读会重读。若写盘失败，内存中的 `graph` 已被修改但未入缓存；调用者拿到异常，磁盘保持旧版。

## 7. 权限与权威状态

- **无权限分支**：本文件没有 sender/role/actor 参数，也没有任何 `assert*`/权限检查。谁能调用取决于上层：
  - IPC 层 `registerLongTermMemoryIpc` 的 5 个 handler 都**没有**校验 `event.senderFrame`/来源（`longterm-memory-ipc.ts:41-85`）；任何能向主进程发 IPC 的渲染上下文都可增删改。
  - 反思器由主进程在每轮结束后自动调用（`agent-orchestrator.ts:3229-3236`），不经过用户确认。
  - 睡眠整合由启动定时器自动调用（`apps/electron/src/main/index.ts:1059-1061`）。
- **权威状态**：磁盘 JSON 是唯一权威；内存缓存是派生副本。`source` 字段决定“手动/自动”，但 `applyLongTermMemoryMutations` 对已存在的手动节点也会加权（`:372-375`），所以“手动节点永不淘汰”只由 `capNodes`/`consolidate` 的 `source` 过滤保证，不由写入路径保证。
- **路径权威**：默认路径由 `getLongTermMemoryGraphPath()` 决定（`config-paths.ts:297-299`），可被 `PROFER_CONFIG_DIR` 覆盖（`config-paths.ts:57-60`）；本文件允许调用者显式传任意 `graphPath`，不校验是否在配置目录内。

## 8. 修改影响面

- **IPC/渲染层**：改导出签名或返回形状会影响 `longterm-memory-ipc.ts:42-77`、preload `preload/index.ts:4152-4160`、renderer atoms（`longterm-memory-atoms.ts:80-163`）与 `LongTermMemoryView.tsx`。
- **反思器**：`listLongTermMemoryNodes` 的排序/副本语义、`applyLongTermMemoryMutations` 的去重/裁剪/`touchUpdatedAt` 语义直接影响 `longterm-memory-reflector.ts:236-348`、`:382-450` 的权重与淘汰结果。
- **RAG**：`readLongTermMemoryGraph` 的缓存指纹与返回对象影响 `longterm-memory-rag.ts:107-129` 的索引 revision；若把返回值改成每次克隆，RAG 的 `revision` 仍按内容计算，但调用方不能再依赖对象身份。
- **磁盘兼容**：`version` 恒写 1；新增字段需考虑旧文件缺字段时的默认值（`normalizeNode`/`normalizeGraph`）。改变容量策略会影响已有 500+ 节点用户的下一次写入。
- **测试**：直接相关测试是 `longterm-memory-rag.test.ts`、`longterm-memory-reflector.test.ts`；**没有 `longterm-memory-store.test.ts`**（全冻结树检索 `**/longterm-memory-store*.test.*` 无结果），store 的原子写/缓存/裁剪只被上述两个测试间接覆盖。
- **同步修改**：若改 `MAX_LONGTERM_MEMORY_NODES` 或裁剪规则，应同步检查 `longterm-memory-reflector.ts:274-322` 的淘汰断言与 RAG 的 topK/权重假设。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建或 Electron/GUI。

**直接测试：无**。全冻结树检索 `apps/electron/src/**/longterm-memory-store*.test.*` 与 `**/*store*.test.ts` 中匹配本文件的用例均为 0；store 没有专属测试文件。

**间接覆盖**：

| 测试 | 行 | 设置/动作 | 真实断言 | 覆盖到 store 的点 |
| --- | --- | --- | --- | --- |
| `longterm-memory-reflector.test.ts` “首轮强偏好” | `:107-114` | 临时目录 `graphPath`，`reflectOnTurn` | `nodes.length===1`、`source==='auto_inferred'`、`category==='coding_preference'` | `applyLongTermMemoryMutations` 新建 + 读回 |
| 同上 “重复偏好” | `:116-124` | 连续两次同文 | `length===1`、`weight===2`、`confidence≈0.7` | 标题去重 + 加权（`:368-375`） |
| 同上 “并发两轮” | `:149-158` | `Promise.all` 两轮不同偏好 | `length===2`、id 唯一 | 写队列串行 + 每次任务内重读 |
| 同上 “睡眠整合淘汰” | `:274-294` | 90 天前弱自动节点 + 手动节点 | `removed===1`、只剩 `manual`、手动权重不变 | `apply` 衰减 + `delete` |
| 同上 “衰减不刷新 updatedAt” | `:307-322` | 40 天前节点，同一 `now` 整合两次 | 第二次权重更小、`updatedAt` 保持旧值 | `touchUpdatedAt:false`（`:345`） |
| `longterm-memory-rag.test.ts` 全部 10 例 | `:59-160` | 直接 `writeJsonFileAtomic` 写图，再检索 | 见该测试手册 | 只读路径 + 缓存/索引 |

**未覆盖**：`addLongTermMemoryNode`、`updateLongTermMemoryNode`、`deleteLongTermMemoryNode` 的专属断言；`capNodes` 超过 500 的行为；`.tmp`/`.bak` 恢复；写失败/权限失败；缓存 mtime 失效；多 `graphPath` 交替；跨进程并发。测试使用临时目录与显式 `graphPath`，不会触碰用户 `~/.cdutai`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 所有写操作经模块级 Promise 串行队列，前序失败不阻断后续 | 已证实 | `:56-63` |
| 读盘在写队列任务内部执行 | 已证实 | `:209`、`:245`、`:276`、`:316` |
| `capNodes` 只淘汰自动节点，可能仍超过 500 | 已证实 | `:127-135`；手动节点不参与 `auto` 过滤 |
| `readLongTermMemoryGraph` 可能写盘（`.tmp`/`.bak` 恢复） | 已证实 | `safe-file.ts:56-82`；`:188` |
| 默认读路径会创建配置目录 | 已证实 | `config-paths.ts:84-87`、`:297-299`；`:183` |
| 缓存命中返回缓存对象本身，不是副本 | 已证实 | `:185-187` |
| `apply` 对已存在的手动节点也会加权/刷新时间 | 已证实 | `:368-375` |
| 同批次同标题 `creates` 第二次会转成 `+1` 加权 | 已证实 | `:368-379` 的顺序；`graph.nodes` 已被 push |
| 没有跨进程锁/文件锁 | 已证实 | 本文件无 `flock`/锁文件/`O_EXCL`；队列是模块级 `:56` |
| 无 store 专属测试 | 已证实 | 冻结树 `glob **/longterm-memory-store*.test.*` 为空；见 §9 |
| 外部编辑若 mtime 与 size 不变则缓存不失效 | 推断 | 指纹只含 `mtimeMs:size`（`:50`、`:68`）；未构造实测 |
| `update` 返回的节点可能已被 `capNodes` 淘汰 | 推断 | `:263-266` 先裁剪再返回 `merged`；未构造 500+ 场景 |
| 调用者原地修改 `read` 返回值会污染缓存 | 推断 | `:185-187` 返回 `cache.graph`；当前调用者均只读/经 IPC 克隆 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MAX_LONGTERM_MEMORY_NODES` | 2、3.4 | `:29` | covered |
| `enqueueWrite` | 3.1 | `:59-63` | covered |
| `stampOf` | 3.2、5 | `:65-72` | covered |
| `normalizeNode` | 3.3 | `:96-124` | covered |
| `capNodes` | 3.4 | `:127-135` | covered |
| `normalizeGraph` | 3.3 | `:137-157` | covered |
| `cloneGraph` | 3.3 | `:159-165` | covered |
| `persistGraph` | 3.2、5、6 | `:167-170` | covered |
| `normalizeTitleKey` | 3.8 | `:173-178` | covered |
| `readLongTermMemoryGraph` | 3.2、4、5 | `:183-192` | covered |
| `listLongTermMemoryNodes` | 2、4 | `:195-199` | covered |
| `addLongTermMemoryNode` | 3.5、6 | `:204-232` | covered |
| `updateLongTermMemoryNode` | 3.6、6 | `:239-268` | covered |
| `deleteLongTermMemoryNode` | 3.7、6 | `:271-284` | covered |
| `applyLongTermMemoryMutations` | 3.8、6 | `:310-386` | covered |
| `capGraphNodes` | 3.4、3.8 | `:388-391` | covered |
| `resetLongTermMemoryCache` | 2、9 | `:394-398` | covered |
| `.tmp`/`.bak` 恢复 | 3.2、5、6 | `safe-file.ts:39-89` | covered（依赖侧） |
| 跨进程并发/锁 | 5、6、10 | `:56-63` | unknown（无实现可读） |
