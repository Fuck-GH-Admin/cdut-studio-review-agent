---
path: apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b3c365b61e44be9d7b36bda96c8ca74b55deeb3c
sha256: 3fa4410029763504c05ad7b2f4b2ff093734974669448948146b4cd30294eecb
lines: 817
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx

## 1. 结论与边界

长期记忆图谱的**全屏"记忆星图"工作台**（本批主题核心 UI）：中区纯 SVG 星图（类别锚点 + hash 极坐标散布 + 共享标签连线）、左区搜索/类别筛选/RAG 检索测试、右区节点详情与手动编辑（文件头 `apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx:1-15`）。唯一导出 `LongTermMemoryView`。

边界与红线（文件头 + 逐行核对）：

- **不直接碰 IPC**：所有读写经 `@/atoms/longterm-memory-atoms` 的写入型 atom（`:30-46` 导入、`:187-190` 用 `useSetAtom`）；组件内唯一 IPC 是 `window.electronAPI.longTermMemory.onChanged` 订阅（`:206`）。
- **视觉红线**：面板强制深色隔离（root `dark` 类 + `DREAMY_THEME` 局部 CSS 变量覆盖，`:9-10` 注释、`:51-69`、`:325-331`），避免浅色主题下黑底黑字。
- **挂载契约**：由 `SettingsDialog` 渲染在 Dialog 内容层、`absolute inset-0` 铺满设置面板；**不能 portal 到 body**（Radix 焦点陷阱/pointer-events 会阻断交互且点外部误关设置，`:12-14` 注释；反向约定见 `SettingsDialog.tsx:59-60`）。
- 不做检索算法（BM25+标签桥接在主进程 `longterm-memory-rag.ts`）；不持久化（数据权威 `~/.cdutai/user-habit-graph.json`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LongTermMemoryView` | function（export） | `:173-646` | `() => React.ReactElement \| null` | 唯一导出；`!open` 返回 null（`:287`） |
| `DREAMY_THEME` | const（内部） | `:51-69` | 18 个 `--*` HSL 变量 | 局部深空主题（不污染全局） |
| `AccentColors` | interface（内部） | `:71-75` | `{ node; glow; chip }` | 类别视觉三元组 |
| `ACCENT_COLORS` | const（内部） | `:77-83` | `Record<LongTermMemoryCategory, AccentColors>` | 5 类别配色 |
| `FIELD_CLASS` | const（内部） | `:85-86` | className 字符串 | 表单控件统一样式 |
| `Point` | interface（内部） | `:90-94` | `{ node; x; y }` | 布局点 |
| `Edge` | interface（内部） | `:96-100` | `{ from; to; shared }` | 共享标签连线 |
| `hashString` | function（内部） | `:102-109` | `(value: string) => number` | FNV-1a（种子 2166136261，乘子 16777619，`>>> 0`） |
| `layoutNodes` | function（内部） | `:112-140` | `(nodes, width, height) => Point[]` | 确定性布局（见 §3.1） |
| `buildEdges` | function（内部） | `:143-169` | `(nodes) => Edge[]` | 共享标签连边，每点最多 4 条 |
| `NodeInspector` | function（内部） | `:650-704` | `({ node, onEdit, onDelete }) => JSX` | 右栏详情 |
| `Metric` | function（内部） | `:706-713` | `({ label, value }) => JSX` | 键值行 |
| `DraftEditor` | function（内部） | `:717-817` | `({ draft, onChange, onCancel, onSave }) => JSX` | 右栏编辑表单 |

数据形状来自 `@profer/shared`（`packages/shared/src/types/longterm-memory.ts`：`LongTermMemoryNode` `:25-40`、`LongTermMemoryHit` `:49-53`、`LONGTERM_MEMORY_CATEGORIES` 5 值 `:77-82`、`LONGTERM_MEMORY_CATEGORY_META` `:65-75`）。

## 3. 内部逻辑与关键流程

### 3.1 星图几何（纯函数）

- `hashString`（`apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx:102-109`）：FNV-1a 32 位。
- `layoutNodes`（`:112-140`）：空/尺寸非法返回 `[]`（`:113`）；5 个类别锚点均布在半径 `min(w,h)*0.32` 的圆上（`:116`、`:121-127`，起始角 `-π/2`）；每节点极坐标 = 锚点 + `angle=(hash%360)/180*π`、`radius = minR(0.06) + ((hash>>>9)%1000)/1000 * spread(0.16)`（`:129-139`）——**同 id 每次渲染同位置**（确定性，注释 `:111`）。
- `buildEdges`（`:143-169`）：两两统计共享标签数（`:145-155`）→ 按 `shared` 降序（`:156`）→ 贪心加入，任一端点度数 ≥4 跳过（`:160-167`）。

### 3.2 组件状态与派生（`:174-285`）

- atom 订阅 12 个 + 写入型 4 个（`:174-190`）；本地 `search/confirmDeleteId/size/viewport`（`:192-195`）；`containerRef/dragRef/movedRef`（`:197-200`，`movedRef` 注释 `:199`："click 在 pointerup 之后触发，不能依赖 dragRef 是否已清空"）。
- 派生链：`nodes`（`:255`）→ `visibleNodes`（类别 + 关键词命中 title/content/tags，大小写不敏感，`:256-267`）→ `points`/`edges`/`pointMap`（`:269-271`）；`hitRanks`（命中 id→序号，`:272`）；`selectedNode = nodes.find(id === (draft?.id ?? selectedId))`（**:274-277，draft.id 优先于 selectedId**）；`stats` 按类别计数（**:279-285，基于全量 nodes 而非 visibleNodes**）。
- `if (!open) return null`（`:287`）在所有 hooks 之后。

### 3.3 副作用与交互流程

1. **加载+跨窗口订阅**（`:203-210`）：`open` 时 `refresh()` 并 `onChanged(() => refresh())`，cleanup 退订。
2. **ESC 拦截**（`:213-223`）：window keydown **capture** 阶段 `stopPropagation` + `setOpen(false)`——避免同时触发 Radix Dialog 关闭整个设置面板（注释 `:212`）；`confirmDeleteId` 非空时跳过（`:217`，把 Esc 让给删除确认框）。
3. **尺寸自适应**（`:226-237`）：ResizeObserver 写 `size`。
4. **滚轮缩放**（`:240-253`）：`addEventListener('wheel', …, { passive:false })` 才能 `preventDefault`；scale 钳制 `[0.6, 2.4]`，步进 ×0.92/×1.08（`:248`）。
5. **拖拽平移**（`:299-321`）：pointerdown 仅左键（`:300`）；move 位移和 >4px 置 `movedRef`（`:315`）并更新 `viewport.x/y`；up/cancel/leave 清 `dragRef`（`:319-321`、`:476-477`）。
6. **节点点击**（`:543-548`）：`stopPropagation` + `movedRef` 守卫（拖拽后 click 不选中）→ `setSelectedId(node.id)` + `setDraft(null)`。
7. **新建/编辑**（`:289-297`）：`startCreate` 草稿默认 `{category:'coding_preference', confidence:0.7}`；`startEdit` 用 `draftFromNode`。
8. **删除**（`:610`、`:623-643`）：`setConfirmDeleteId` → AlertDialog 确认 → `void deleteNode(confirmDeleteId)` + 清确认态（`:633-640`）。
9. **RAG 检索测试**（`:428-465`）：输入 Enter → `runQueryTest()`（`:431-433`）；结果区三分支：`querying` 提示 / 空命中提示 / 命中列表（`#{rank+1} title` + `score.toFixed(3)` + `excerpt`，`:441-465`）；点命中 → 选中并清草稿（`:450-453`）。
10. **右栏三态**（`:599-619`）：`draft` → `DraftEditor`；否则 `selectedNode` → `NodeInspector`；否则占位文案。

### 3.4 子组件行为

- `NodeInspector`（`:650-704`）：类别 chip + 来源徽标（`source === 'user_manual' ? '手动添加' : 'AI 自动提炼'`，`:666`）、tags、`Metric`×3（weight `.toFixed(1)`、confidence `.toFixed(2)`、`updatedAt` 本地化字符串，`:683-685`）、编辑/删除按钮。
- `DraftEditor`（`:717-817`）：`update(patch)` 合并草稿（`:728`）；表单=类别 select/标题/内容 textarea/标签文本/置信度 range（0–1 step 0.05，`:790-797`）；标题按 `draft.id` 显示"编辑/新建记忆"（`:733`）；保存→`onSave`（`saveDraft()`，`:604`）。

## 4. 调用者与调用链

- **入向（唯一渲染点）**：`apps/electron/src/renderer/components/settings/SettingsDialog.tsx:16`（import）+ `:60`（`<LongTermMemoryView />`，Dialog Content 内）。冻结树检索 `LongTermMemoryView` 仅命中本文件与 SettingsDialog.tsx。打开入口：`AgentSettings.tsx:96`（"探索记忆星图"按钮 `setMemoryViewOpen(true)`）与 `SettingsDialog.tsx:30-32`（设置关闭时收起）。
- **出向（状态层）**：`@/atoms/longterm-memory-atoms` 全部 15 导出（`:30-46`）；`@/atoms/overlay-atoms` 的 `useGlobalOverlay(open)`（`:29`、`:176`）；`@profer/shared` 常量/类型（`:23-28`）；`@profer/ui` 的 `Z_LAYER`（`:20`）、AlertDialog/Button primitives（`:21-22`）；lucide 图标（`:19`）。
- **出向（IPC）**：`window.electronAPI.longTermMemory.onChanged`（`:206`，桥 `apps/electron/src/preload/index.ts:4159-4164`，主进程广播 `longterm-memory-ipc.ts:25-38`）；其余读写（getGraph/addNode/updateNode/deleteNode/queryTest）经 atoms 间接发起（链详见 `apps/electron/src/renderer/atoms/longterm-memory-atoms.ts` 手册 §4）。

## 5. 数据 I/O、读写与副作用

- **读**：图谱来自 `longTermMemoryGraphAtom`（IPC 拉取后写入）；本组件只派生。
- **写**：`setDraft/setSelectedId/setFilter/setQuery` 与 4 个写入型 atom（refresh/save/delete/queryTest）。
- **副作用**：`window` keydown/wheel 监听（`:221`、`:251`，均在 cleanup 移除）；ResizeObserver（`:230-236`）；`useGlobalOverlay` 登记（`:176`）；内联 `<style>` 动画（`ltm-twinkle`/`ltm-pulse`，`:333-345`）；SVG `filter id="ltm-glow"`（`:504-510`）。
- **并发**：无锁；`refresh` 由 onChanged 广播可高频触发（多窗口写入时），无节流（推断会高频全量重拉）。
- **原子性**：不适用（组件不写盘）；删除确认为两步（选中→确认），无中间态持久化。

## 6. 分支、失败、取消与恢复

- 空态双分支（`:481-500`）：`nodes.length === 0`（"星图还没有记忆"+新建按钮）vs 筛选无果（"没有符合筛选条件的记忆"）。
- `visibleNodes` 过滤、`buildEdges` 度数截断（`:163`）、`layoutNodes` 尺寸防御（`:113`）、`hitRanks`/`active` 光圈与标签渲染（`:550-584`）。
- 失败处理：本组件无 try/catch——IPC 失败的 toast/恢复全部在 atoms 层（`longterm-memory-atoms.ts:62-69/:113-118` 等）。
- 取消：ESC 关面板（`:213-223`）；拖拽中断（pointerup/cancel/leave）；组件卸载移除监听/Observer。删除动作不可撤销（AlertDialog 文案 `:628`"此操作不可撤销"，与实际一致：主进程删除无回收站，`deleteLongTermMemoryNode`）。
- 重启/恢复：面板无本地持久化（搜索词/筛选/缩放均内存态，重开重置）；图谱数据随刷新重拉。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查（IPC handler 侧同样无 sender 校验，见 `longterm-memory-atoms.ts` 手册 §7）。
- 权威状态：节点数据（id/weight/createdAt/updatedAt/source）由主进程托管；UI 只编辑 `category/title/content/tags/confidence` 五字段（`DraftEditor` 表单 `:739-799` 与主进程转发面一致，`longterm-memory-ipc.ts:58-65`）。来源徽标 `user_manual`/`auto_inferred` 只读展示（`:666`）。

## 8. 修改影响面

- 改挂载位置/portal 策略 → `SettingsDialog.tsx:60` + 焦点陷阱/外部点击语义（文件头 `:12-14` 警告）。
- 改 atom 消费面（`:30-46`）→ `longterm-memory-atoms.ts` 同步；改 `onChanged` 语义 → preload/主进程广播三侧。
- 改几何常量（0.32/0.06/0.16、度数 4、`hashString` 算法）→ 星图布局变化；确定性被 `hashString` 保证，改算法会"重排星图"（纯视觉，无持久化影响）。
- 改 `ACCENT_COLORS`/`LONGTERM_MEMORY_CATEGORY_META` 显示 → 与 `packages/shared/src/types/longterm-memory.ts:65-82` 的类别定义联动。
- 无测试需同步（§9）。

## 9. 测试证据

- **直接测试：无**。负向检索范围：冻结树 `apps/`+`packages/` 的 `*.test.*`/`*.spec.*` 全文检索 `LongTermMemoryView|layoutNodes|buildEdges|hashString`（组件/内部符号）→ 0 命中。
- **间接证据**：主进程侧 `longterm-memory-rag.test.ts`/`longterm-memory-reflector.test.ts`/`longterm-memory-auditor.test.ts` 断言后端算法（非本文件）；`longterm-memory-store` 相关测试不覆盖 UI。无组件渲染测试。
- 未覆盖：布局确定性、连边截断、ESC 拦截、拖拽/click 区分、删除确认流、检索结果渲染、`movedRef` 语义均无断言。本轮 **NOT_RUN**（未渲染、未运行 GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `LongTermMemoryView` + 12 内部符号 | 已证实 | 逐行读 `:1-817` |
| 唯一挂载点 SettingsDialog.tsx:16/:60；打开入口 AgentSettings.tsx:96 | 已证实 | 全树检索 + 两侧行号 |
| 布局确定性（hash 极坐标）与度数≤4 连边 | 已证实 | `:102-169` |
| ESC capture 拦截不关设置面板；confirmDeleteId 时让位 | 已证实 | `:213-223` |
| 数据读写全部经 atoms；组件内唯一 IPC 是 onChanged 订阅 | 已证实 | `:30-46`、`:206`（全文逐行核） |
| `selectedNode` 的 draft.id 优先、`stats` 用全量 nodes | 已证实 | `:274-285` |
| onChanged 高频广播下无节流的性能表现 | 推断 | `:203-210` 无防抖；NOT_RUN |
| "同一套 BM25 + 标签桥接算法"文案与真实召回一致性 | 未知 | `:437-438` 为 UI 文案；`longterm-memory-rag.ts` 未逐行读 |
| 强制深色隔离在各主题下的实际渲染 | 未知 | NOT_RUN（GUI） |

**现存实现矛盾/易误读点（照实记录）**：

1. 类别筛选 chips 显示的计数来自**全量** `nodes`（`:279-285`、`:404/:415`），不是当前搜索/筛选结果计数——搜索后数字不随之变化。
2. `LongTermMemoryView` 文件头称挂载在"设置面板"（`:12`），但其 `useGlobalOverlay(open)`（`:176`）与 `Z_LAYER.fullscreen`（`:325`）使它在打开时是**独立全屏层**，同时 Radix 焦点仍在 Dialog Content 内——两种描述并存，行为以 `SettingsDialog.tsx:59-60` 的实现为准。
3. 删除 AlertDialog 与星图同层渲染（`:623-643`），ESC 分流（`:217`）依赖 `confirmDeleteId` 状态同步，两处键盘语义不同（capture vs Radix 默认）。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `LongTermMemoryView` 生命周期/9 个交互流程 | §2/§3.3 | `:173-646` | covered |
| `hashString`/`layoutNodes`/`buildEdges` | §3.1 | `:102-169` | covered |
| 派生链（visibleNodes/selectedNode/stats/hitRanks） | §3.2 | `:255-285` | covered |
| `NodeInspector`/`Metric`/`DraftEditor` | §3.4 | `:650-817` | covered |
| ESC/拖拽/缩放/ResizeObserver 副作用 | §3.3/§5 | `:213-253`、`:299-321` | covered |
| IPC/atoms 出向与挂载链 | §4 | 两侧行号 | covered |
| 计数口径/全屏与 Dialog 双重语义 | §10 | `:279-285`、`:176/:325` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
| RAG 算法一致性 / 主题渲染 | §10 | — | unknown |
