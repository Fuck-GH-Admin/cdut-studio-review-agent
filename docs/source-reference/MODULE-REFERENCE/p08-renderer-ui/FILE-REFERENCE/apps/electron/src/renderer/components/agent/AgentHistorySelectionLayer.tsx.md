---
path: apps/electron/src/renderer/components/agent/AgentHistorySelectionLayer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a3cf8a3959c4de13895f94b4a7210c864c3931e
sha256: e36233384823788e30f02ed81b5ea8407f36eba88ec622c4f09a17132d91d379
lines: 317
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentHistorySelectionLayer.tsx

## 1. 结论与边界

Agent 历史选区引用入口（文件头 `:1-6`）：历史消息划选文本后提供轻量动作——添加到当前 Agent 输入框引用、（符合条件时）从该节点开探索分支。透明覆盖层组件（只渲染 `SelectionActionPopover`），选区捕获经 document 级事件。

不做的事：不修改消息内容；嵌入的探索分支自身不创建二级探索（`explorationEnabled` 门，`:33`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SelectionRect` | interface | `:46-52` | 选区包围盒（left/top/right/bottom/width） |
| `SelectionAnchor` | interface | `:54-58` | `{x; y; direction: 'up'\|'down'}` |
| `pickSelectionAnchor` | function | `:68-78` | 锚点纯函数：水平居中包围盒；垂直取抬手点±24（`ANCHOR_GAP` `:61`）按方向展开（按钮落选区外侧不压文字）；无抬手点（键盘选择）退回 `bottom-24` 向上（`:63-67` 注释） |
| `AgentHistorySelectionLayer` | function 组件 | `:87-317` | `({sessionId, rootRef, explorationEnabled=true})` |

内部：`MAX_AGENT_HISTORY_QUOTED_CHARS=2000`（`:18`）；`AgentHistorySelection`（`:20-28`，text/x/y/direction/sourceLabel/messageId?/messageRole?）；`getElementFromNode/normalizeSelectedText/getRoleLabel`（`:37-44/:80-85`）；状态/refs（`:96-100`，openExplorationPending/pointerSelecting/pointerUpY/captureTimer）。

## 3. 内部逻辑与关键流程

### 3.1 选区捕获 `captureSelection`（`:106-164`）

守卫链：焦点在输入器/弹层（`.ProseMirror/[data-input-mode]/弹层选择器`）→ 忽略；选区折叠/跨出 root/起止不在 `[data-message-id]` 消息内 → 清空。文本 `normalizeSelectedText`（压缩空白换行）后超 2000 截断+toast 警告（防重复 id）。锚点：包围盒退 `getClientRects()[0]`；**跨屏选区垂直跟随抬手点**（固定取一端会越界，`:143-145` 注释）。同消息取 `data-message-role`/`data-message-fork-id`（**只认真实 fork 节点**，合成 ID 如 turn-1 不算，`:153-155`）；跨消息 sourceLabel“多条消息”、无 messageId。

### 3.2 事件管线（`:186-238`）

`selectionchange`（非鼠标选择时清空）、`pointerdown`（捕获阶段；root 内=开始选择、清 pointerUpY；弹层内忽略）、`pointerup`（记 `clientY` 作抬手点、80ms 防抖后捕获）、`pointercancel`、`keyup`（shift+方向键等=键盘选择，无抬手点走兜底锚点）。卸载清定时器+全部监听。

### 3.3 动作（`:240-300`）

- `handleAddToAgent`：写 `quotedSelectionMapAtom[sessionId]`（`sourceType:'agent-history'`+label/messageId/role/capturedAt）→ 清选区+toast。
- `handleOpenExplorationBranch`：门禁三重——须 assistant+messageId（否则提示“在已完成的 Agent 回复中选择”）、`piEntryBindings[messageId]` 存在（否则“没有可用的 Pi 分叉节点”）、`openExplorationPendingRef` 防重入；`forkAgentSession({upToMessageUuid, explorationSourceLabel: 文本前 80})` → 会话列表去重插入、引用绑定到分支、`openExplorationBranchTab(autoGroup)` 顶栏并排；失败 console.error+toast。Toast 明示“继承此回复之前的完整上下文；结论可带回主线”。

### 3.4 渲染（`:302-315`）

有 selection 才渲染 `SelectionActionPopover`（x/y/direction+两回调）；探索回调仅在 `explorationEnabled && assistant && messageId` 时注入。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 历史消息容器。出向：`@/atoms/{agent-atoms,preview-atoms}`、`@/components/selection/SelectionActionPopover`、`@/lib/quoted-selection`、`@/lib/exploration-tab`、`window.electronAPI.forkAgentSession`、`sonner`、`jotai`。

## 5. 数据 I/O、读写与副作用

读 DOM 选区/事件；写 jotai（引用映射/会话列表）；IPC forkAgentSession；toast。无持久化（引用映射在内存 atom）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 焦点在输入器/弹层 | `:109-110` | 忽略捕获 |
| 选区无效/跨出/无消息 | `:113-133` | 清空 |
| 超 2000 字 | `:135-141/:166-170` | 截断+toast |
| 探索门禁不满足 | `:250-258` | 提示不执行 |
| fork 失败 | `:288-291` | console.error+toast |
| 防重入 | `:250/:261/:294` | pendingRef |

## 7. 权限与权威状态

- 只认 `data-message-fork-id` 真实 fork 节点作探索锚点（合成 ID 不冒充）。
- 探索分支上下文语义如实披露（继承此前上下文/结论带回）。
- 引用上限 2000 字符如实警告。

## 8. 修改影响面

改锚点/捕获 → 影响划选体验（`pickSelectionAnchor` 有单测）；改探索门禁 → 影响 Pi 分叉链路。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `AgentHistorySelectionLayer.test.ts`（仅 `pickSelectionAnchor`，详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 锚点选区外侧/键盘兜底 | 已证实 | `:63-78` |
| 只认真实 fork 节点 | 已证实 | `:153-155` |
| 探索三重门禁+防重入 | 已证实 | `:250-261` |
| 2000 截断如实警告 | 已证实 | `:135-141/:166-170` |
| 捕获管线运行行为 | 未知 | NOT_RUN（DOM 事件） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 三类型/`pickSelectionAnchor` | 2 | `:46-78` | covered |
| `captureSelection` | 3.1 | `:106-164` | covered |
| 事件管线 | 3.2 | `:186-238` | covered |
| 两动作 | 3.3 | `:240-300` | covered |
| 渲染 | 3.4 | `:302-315` | covered |
