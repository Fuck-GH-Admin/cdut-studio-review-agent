---
path: apps/electron/src/renderer/atoms/longterm-memory-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 47483693fc54f774b2b77fb3e31ec54b36b1520f
sha256: 4f9aa27791cc27ec789b32cfaa3af0bdbe60bc0b3bea9104c625cba9a0d5c664
lines: 163
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/longterm-memory-atoms.ts

## 1. 结论与边界

长期记忆图谱的**渲染层状态 + 全部 IPC 收敛点**：15 个导出（1 接口、13 atom、1 函数）管理星图面板的图谱/草稿/选中/筛选/检索状态，并把 5 个 `window.electronAPI.longTermMemory.*` 调用收敛在 4 个写入型 atom 中——文件头明确"UI 组件只消费状态，不直接碰 window.electronAPI"（`apps/electron/src/renderer/atoms/longterm-memory-atoms.ts:1-5`）。

边界：

- 不渲染 UI（渲染在 `apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx`）；不做数据算法（BM25/标签桥接检索在主进程 `longterm-memory-rag.ts`，UI 只调 `queryTest`）。
- 不持久化：数据权威在主进程 `~/.cdutai/user-habit-graph.json`（路径 `apps/electron/src/main/lib/config-paths.ts:295-298`），本文件只缓存内存态。
- 不校验字段限幅（title/content 长度、confidence 范围、节点上限 `MAX_LONGTERM_MEMORY_NODES = 500`，`apps/electron/src/main/lib/longterm-memory/longterm-memory-store.ts:29`）；唯一前端校验是"内容非空"（`:78-81`）。

## 2. 导出与关键符号

导出 15 条 = 1 interface + 13 `export const` + 1 `export function`；另有 1 个内部函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LongTermMemoryDraft` | interface（export） | `:17-25` | `{ id: string\|null; category; title; content; tagsText; confidence }` | `id:null` = 新建（`:16`） |
| `longTermMemoryGraphAtom` | const（export） | `:27` | `atom<LongTermMemoryGraph \| null>(null)` | 全量图谱 |
| `longTermMemoryLoadingAtom` | const（export） | `:28` | `atom(false)` | 拉取中 |
| `longTermMemoryViewOpenAtom` | const（export） | `:29` | `atom(false)` | 星图面板开关 |
| `longTermMemorySelectedIdAtom` | const（export） | `:30` | `atom<string \| null>(null)` | 选中节点 |
| `longTermMemoryDraftAtom` | const（export） | `:31` | `atom<LongTermMemoryDraft \| null>(null)` | 编辑草稿 |
| `longTermMemoryFilterAtom` | const（export） | `:32` | `atom<LongTermMemoryCategory \| 'all'>('all')` | 类别筛选 |
| `longTermMemoryQueryAtom` | const（export） | `:33` | `atom('')` | 检索测试输入 |
| `longTermMemoryHitsAtom` | const（export） | `:34` | `atom<LongTermMemoryHit[]>([])` | 检索命中 |
| `longTermMemoryQueryingAtom` | const（export） | `:35` | `atom(false)` | 检索中 |
| `draftFromNode` | function（export） | `:38-47` | `(node: LongTermMemoryNode) => LongTermMemoryDraft` | `tags.join(', ')`（`:44`） |
| `parseTags` | function（内部） | `:49-54` | `(text: string) => string[]` | 按 `/[,，;；\s]+/` 切分、trim、去空 |
| `refreshLongTermMemoryAtom` | const（export，写入型） | `:57-70` | `atom(null, async (_get, set) => void)` | 拉全量图谱 |
| `saveLongTermMemoryDraftAtom` | const（export，写入型） | `:73-119` | `atom(null, async (get, set) => void)` | 新建/编辑保存 |
| `deleteLongTermMemoryNodeAtom` | const（export，写入型） | `:122-141` | `atom(null, async (get, set, nodeId: string) => void)` | 删除节点 |
| `runLongTermMemoryQueryTestAtom` | const（export，写入型） | `:144-163` | `atom(null, async (get, set) => void)` | 检索测试（topK 固定 6） |

数据形状（跨文件，`packages/shared/src/types/longterm-memory.ts`，该文件主手册在 p07-shared-libs 批，本处交叉引用）：`LongTermMemoryNode` `:25-40`（含 `weight/confidence/createdAt/updatedAt/source`）、`LongTermMemoryGraph` `:42-46`（`version:1`）、`LongTermMemoryHit` `:49-53`（`node/score/excerpt`）、`LongTermMemoryNodeInput` `:56-62`（无 id/时间戳/weight，主进程托管）、类别 5 值 `:14-20`。

## 3. 内部逻辑与关键流程

1. `draftFromNode`（`apps/electron/src/renderer/atoms/longterm-memory-atoms.ts:38-47`）：字段直拷，`tagsText = node.tags.join(', ')`。
2. `refreshLongTermMemoryAtom`（`:57-70`）：`loading=true` → `getGraph()` → 写 `graphAtom`；catch：`console.error` + `toast.error('加载记忆图谱失败')` 带 error.message（`:63-66`）；finally `loading=false`（`:68`）。
3. `saveLongTermMemoryDraftAtom`（`:73-119`），按真实顺序：
   - 空草稿短路（`:74-75`）；`title/content` trim；`content` 空 → `toast.error('记忆内容不能为空')` 返回（`:78-81`）。
   - **编辑分支**（`draft.id` 真值，`:84-99`）：在内存 graph 中按 id 找 `existing`；找不到 → `toast.error('该记忆已不存在，请刷新后重试')` 返回（`:87-90`）；否则 `updateNode({...existing, category, title: title || content.slice(0,24), content, tags: parseTags(tagsText), confidence})`（`:91-98`）→ `setSelectedId(draft.id)`（`:99`）。**返回值 `LongTermMemoryNode | null` 未被检查/使用**（preload 类型 `apps/electron/src/preload/index.ts:1693`）。
   - **新建分支**（`:100-109`）：`addNode({category, title: title || content.slice(0,24), content, tags, confidence})` → `setSelectedId(node.id)`。
   - 两分支后：`draftAtom=null`（`:110`）→ `await set(refreshLongTermMemoryAtom)`（`:111`）→ `toast.success('记忆已保存')`（`:112`）。
   - catch：`console.error` + `toast.error('保存记忆失败')`（`:113-118`）。
4. `deleteLongTermMemoryNodeAtom`（`:122-141`）：`deleteNode(nodeId)` → `{success:false}` → `toast.error('删除失败，该记忆可能已不存在')` 返回（`:125-128`）；成功且被删者是当前选中 → 清 `selectedId` 与 `draft`（`:129-132`）→ `await refresh` → `toast.success('记忆已删除')`；catch 同上模式（`:135-140`）。
5. `runLongTermMemoryQueryTestAtom`（`:144-163`）：query trim 空 → `hits=[]` 返回（`:145-149`）；`querying=true` → `queryTest({query, topK: 6})` → `hits`（`:152-153`）；catch：`console.error`、`hits=[]`、`toast.error('检索测试失败')`（`:154-159`）；finally `querying=false`（`:161`）。

## 4. 调用者与调用链

**入向**（冻结树 apps+packages 检索 `atoms/longterm-memory-atoms`，恰好 3 个文件）：

- `apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx:30-46`：导入全部 15 个符号，消费每个 atom（`:174-190` 订阅、`:289-297`/`:600-611`/`:633-640` 触发 save/delete/refresh/queryTest）。
- `apps/electron/src/renderer/components/settings/AgentSettings.tsx:16,29,96`：仅 `longTermMemoryViewOpenAtom`（"探索记忆星图"按钮 `setMemoryViewOpen(true)`）。
- `apps/electron/src/renderer/components/settings/SettingsDialog.tsx:12,27,30-32`：仅 `longTermMemoryViewOpenAtom`（设置面板关闭时同步收起）。

**出向（IPC 链，逐侧行号）**：

- `window.electronAPI.longTermMemory.*` 5 个方法，桥接实现 `apps/electron/src/preload/index.ts:4151-4166`（`invoke`），类型声明 `:1688-1700`。
- 主进程注册 `apps/electron/src/main/lib/longterm-memory/longterm-memory-ipc.ts`（`registerLongTermMemoryIpc` `:40`）：`READ_GRAPH` `:42-44`（同步 `readLongTermMemoryGraph()`）、`ADD_NODE` `:46-52`、`UPDATE_NODE` `:54-69`、`DELETE_NODE` `:71-78`、`QUERY_TEST` `:80-84`（`searchLongTermMemory(input?.query ?? '', {topK})`）。
- 写路径落盘：`longterm-memory-store.ts` 的 `addLongTermMemoryNode:204` / `updateLongTermMemoryNode:239` / `deleteLongTermMemoryNode:271`，文件为 `~/.cdutai/user-habit-graph.json`（`apps/electron/src/main/lib/config-paths.ts:297-298`）。
- 多窗口同步：主进程写成功后 `broadcastChanged()` 向所有存活窗口发 `CHANGED`（`longterm-memory-ipc.ts:25-38`，双判活防 "Object has been destroyed"）；渲染侧 `onChanged(callback)` 返回退订函数（`preload/index.ts:4159-4164`）。

## 5. 数据 I/O、读写与副作用

- **读**：`getGraph()` 全量拉取（无分页）；`queryTest` 读索引做检索（topK=6 硬编码 `:152`）。
- **写**：`addNode/updateNode/deleteNode` 经 IPC 写 JSON 文件（主进程原子性不在本文件，见 store 手册）；本文件自身只写 jotai 状态。
- **副作用**：`toast`（sonner）提示 9 处 = 失败 7 + 成功 2（`:64/:79/:88/:112/:115/:126/:134/:137/:157`，回源 `grep -c` 复算修正）；`console.error` 失败日志 4 处。
- **并发/交错**：全部操作无锁；`saveLongTermMemoryDraftAtom` 的编辑分支"查 existing→update"非原子，检查与更新之间节点被其他窗口删除时，`updateNode` 返回 null 且本文件不检查（`:91-98`），随后 `refresh` 会拉到无该节点的图谱（行为已证实自源码，实际发生概率推断）。
- **幂等**：`refresh` 幂等；`save` 新建分支非幂等（重复点保存会建多条）；`delete` 对已删节点返回 `{success:false}` 并 toast。

## 6. 分支、失败、取消与恢复

- 早退分支：空草稿（`:74-75`）、空内容（`:78-81`）、编辑目标不存在（`:87-90`）、空 query（`:145-149`）、`deleteNode` 失败（`:125-128`）。
- IPC 失败（reject）：4 个写入型 atom 均 catch → toast + console.error；**不重试**；`refresh`/`save` 失败后状态回退为"最后已知数据"（graph 不清空）。
- 加载/查询中的 finally 保证 `loading/querying` 复位（`:67-69`、`:160-162`）；无 AbortController、无请求取消——快速重复触发 refresh 以最后落点为准（无竞态保护，推断）。
- 恢复：删除失败/保存失败提示用户"刷新后重试"（`:88`）；面板层有 onChanged 订阅自动 refresh（`LongTermMemoryView.tsx:203-210`）。

## 7. 权限与权威状态

- 本文件无任何 sender/role 检查（全文无权限分支）。
- **跨层安全事实（照实记录）**：5 个长期记忆 IPC handler 均忽略 `_event`、无 sender 校验（`longterm-memory-ipc.ts:46/:54/:71/:80` 均 `_event` 形参未用；`READ_GRAPH` `:42` 同样无校验）；对比同仓 team-memory 通道有 `assertSensitiveAgentIpcSender`（`apps/electron/src/main/ipc.ts:8028-8031`）。是否需要补 sender 保护属产品/安全待决，本手册不改源码。
- 权威状态：节点 id/时间戳/weight 由主进程托管（`LongTermMemoryNodeInput` 注释 `packages/shared/src/types/longterm-memory.ts:55-62`）；`updateNode` 尽管渲染层 spread 了 `weight/createdAt/updatedAt/source`（`:92`），主进程 handler 只转发 `category/title/content/tags/confidence` 五字段（`longterm-memory-ipc.ts:58-65`），其余字段被丢弃——读写契约以此为准。

## 8. 修改影响面

- 改 atom 名/形状 → 3 个入向文件（§4）全部需要同步；`LongTermMemoryView.tsx` 是唯一全量消费者。
- 改 IPC 方法签名 → preload（`apps/electron/src/preload/index.ts:4151-4166` 与类型 `:1688-1700`）、主进程 `longterm-memory-ipc.ts`、store 四侧同步；`queryTest` 的 `topK:6` 改动只影响 UI 展示条数。
- 改校验（如加 title 长度校验）会改变 §6 早退分支与 toast 文案；与主进程 store 限幅（`longterm-memory-store.ts:29` 等）是两层独立校验，勿混淆。
- 无直接测试可同步（§9）；主进程侧 `longterm-memory-*.test.ts` 覆盖 store/rag/reflector/auditor，不受本文件改动影响。

## 9. 测试证据

- **直接测试：无**。负向检索范围：冻结树 `baseline/source@05fb2565` 下 `apps/`+`packages/` 的 `*.test.*`/`*.spec.*` 文件全文检索 `longterm-memory-atoms|LongTermMemoryView|draftFromNode|saveLongTermMemoryDraftAtom` 等本文件符号 → 0 命中。
- **间接证据（主进程侧，测的是被调用方而非本文件）**：`apps/electron/src/main/lib/longterm-memory/longterm-memory-rag.test.ts:13-14`（`searchLongTermMemory`/`resetLongTermMemoryCache`）、`longterm-memory-reflector.test.ts:20-21`、`longterm-memory-auditor.test.ts:17`。它们断言主进程算法，**不覆盖**渲染层 atom 的分支/竞态。
- 未覆盖：编辑分支 existing 检查、`updateNode` 返回 null 被忽略、toast 文案、`parseTags` 分隔符集合、topK=6 均无断言。本轮 **NOT_RUN**（未执行任何测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 导出 + 1 内部函数；IPC 收敛在 4 个写入型 atom | 已证实 | `:17-144` 逐行读 |
| 5 个 IPC 方法与主进程 handler/落盘路径的完整链 | 已证实 | `preload/index.ts:4151-4166`、`longterm-memory-ipc.ts:41-85`、`config-paths.ts:297-298` 两侧行号 |
| `updateNode` 返回值被忽略；spread 的 weight/时间戳/source 由主进程丢弃 | 已证实 | `:91-98` + `longterm-memory-ipc.ts:58-65` |
| 5 个 handler 无 sender 校验，与 team-memory 通道不对称 | 已证实 | `longterm-memory-ipc.ts:42-84` vs `main/ipc.ts:8028-8031` |
| 渲染层仅校验"内容非空" | 已证实 | `:78-81` |
| 快速重复 refresh 的竞态结果（无取消机制） | 推断 | `:57-70` 无 Abort/序号；未运行验证 |
| store 侧字段限幅细节（clamp 行为） | 未知 | 仅核 `longterm-memory-store.ts:29` 常量；clamp 分支未逐行读（不在本批 SCOPE） |
| BM25 + 标签桥接算法实现 | 未知 | UI 文案自述（`LongTermMemoryView.tsx:438`），实现 `longterm-memory-rag.ts` 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 15 导出 + `parseTags` | §2 | `:17-144` | covered |
| `refreshLongTermMemoryAtom` 全分支 | §3/§6 | `:57-70` | covered |
| `saveLongTermMemoryDraftAtom` 编辑/新建/早退/catch | §3/§6 | `:73-119` | covered |
| `deleteLongTermMemoryNodeAtom` 分支 | §3/§6 | `:122-141` | covered |
| `runLongTermMemoryQueryTestAtom` 分支 | §3/§6 | `:144-163` | covered |
| IPC 链（preload→ipc→store→磁盘→CHANGED 广播） | §4/§5 | 两侧行号 | covered |
| updateNode 字段转发差异 / 无 sender 校验 | §7/§10 | `:91-98`、`longterm-memory-ipc.ts:58-65` | covered |
| 测试覆盖 | §9 | — | covered（无直接测试，NOT_RUN） |
| store clamp / RAG 算法 | §10 | — | unknown（不在 SCOPE） |
