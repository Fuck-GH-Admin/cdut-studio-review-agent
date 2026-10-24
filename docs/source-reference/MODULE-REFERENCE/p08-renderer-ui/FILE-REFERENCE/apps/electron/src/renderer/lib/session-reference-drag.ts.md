---
path: apps/electron/src/renderer/lib/session-reference-drag.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 924d86649bb19ca30e3f3da44fea2bf9857e083d
sha256: 99554d061753d93acfd4b545822a1d0552349a140cea45f3fe1dc2d2e3d9c6db
lines: 101
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/session-reference-drag.ts

## 1. 结论与边界

左侧 Agent 会话行拖入输入框的**内部拖放协议**（`session-reference-drag.ts:1-4` 文件头自述）：自定义 MIME `application/x-profer-session-reference` 携带 JSON 载荷，`text/plain` 兜底为 `&session:<id>::<encodeURIComponent(title)>` 文本（`:22-25`）；外加模块级 dragstart 内存态（dragover 读不到 payload，`:37` 注释）与「引用此会话」菜单走的 CustomEvent 通道（`:68-72` 注释）。

边界：不插入 mention 文本本体（由 `RichTextInputHandle.insertSessionMention` 实现，`rich-text-input.tsx:202`）；不做发送/持久化（`&session:` 文本的解析在 `agent-message-queue.ts:135` 等下游，见 §8）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SESSION_REFERENCE_DRAG_MIME` | 常量 | 6 | `'application/x-profer-session-reference'` | 自定义 MIME |
| `SessionReferenceDragItem` | interface | 8-11 | `{sessionId: string, title: string}` | 拖拽载荷 |
| `setSessionReferenceDragData` | 函数 | 15-31 | `(dataTransfer, item) => void` | dragstart 写载荷 |
| `isSessionReferenceDrag` | 函数 | 33-35 | `(dataTransfer) => boolean` | MIME 存在判定 |
| `getActiveSessionReferenceDragId` | 函数 | 38-40 | `(dataTransfer) => string \| null` | dragover 取内存态 id |
| `clearSessionReferenceDragState` | 函数 | 42-44 | `() => void` | 清内存态 |
| `canReferenceDraggedSession` | 函数 | 46-51 | `(item, currentSessionId) => boolean` | 防自引用 |
| `getSessionReferenceDragData` | 函数 | 53-66 | `(dataTransfer) => SessionReferenceDragItem \| null` | drop 读载荷+校验 |
| `INSERT_SESSION_REFERENCE_MENTION_EVENT` | 常量 | 73 | `'profer:insert-session-reference-mention'` | 菜单事件名 |
| `InsertSessionReferenceMentionDetail` | interface | 75-79 | `{targetSessionId, item, inserted: boolean}` | 事件 detail |
| `insertSessionReferenceMention` | 函数 | 81-90 | `(targetSessionId, item) => boolean` | dispatch 事件并返回 inserted |

导出计数 11（`export` 逐条核：const 2、interface 2、function 7）。内部：模块级 `activeSessionReferenceDragId: string | null`（`:13`）、类型守卫 `isSessionReferenceDragItem`（`:92-101`，sessionId/title 均须为去空白后非空字符串）。

## 3. 内部逻辑与关键流程

- `setSessionReferenceDragData`（`:15-31`）：先写内存态 `activeSessionReferenceDragId = item.sessionId`（`:19`）→ `setData(MIME, JSON.stringify(item))`（`:21`）→ `setData('text/plain', '&session:<id>::<encodeURIComponent(title)>')`（`:22-25`）→ `effectAllowed = 'copy'`（`:26`）；任一步抛错则内存态复位为 `null` 并原样 rethrow（`:27-30`）。
- `isSessionReferenceDrag`（`:33-35`）：`dataTransfer.types` 可枚举数组含 MIME。
- `getActiveSessionReferenceDragId`（`:38-40`）：MIME 命中才返回内存态 id，否则 `null`——dragover 阶段无法读 payload 的补偿（注释 `:37`）。
- `getSessionReferenceDragData`（`:53-66`）：`getData(MIME)`（`:56`）空 → `null`（`:57`）；`JSON.parse`（`:60`）后过 `isSessionReferenceDragItem` 守卫（`:61`）；JSON 损坏 catch → `null`（`:63-65`）。
- `canReferenceDraggedSession`（`:46-51`）：`item.sessionId !== currentSessionId`（`:50`），仅此一条规则。
- `insertSessionReferenceMention`（`:81-90`）：构造 detail `{targetSessionId, item, inserted: false}`（`:85`）→ `window.dispatchEvent(CustomEvent)`（`:86-88`）→ **同步**返回 `detail.inserted`（`:89`），依赖监听器在派发期间回写 detail。**冻结树内无任何监听器**（见 §4/§10），当前恒返回 `false`。

## 4. 调用者与调用链

入向（grep 全冻结树）：
- `session-items.tsx:18` import clear/set；`:765-773` dragstart 被 `locked` 或命中 `button, input` 时 `preventDefault`+`clearSessionReferenceDragState`（`:766,772`）；`:775` `setSessionReferenceDragData(event.dataTransfer, {sessionId: session.id, title: session.title})`；`:777` `onDragEnd={clearSessionReferenceDragState}`。
- `AgentView.tsx:161` import clear/get/canReference；drop 处理器 `:1780-1793`：`clearSessionReferenceDragState()`（`:1784`）→ `getSessionReferenceDragData(e.dataTransfer)`（`:1786`）→ `canReferenceDraggedSession` 为假时 `toast.warning('不能引用当前会话')` 并 return（`:1788-1790`）→ `richTextInputRef.current?.insertSessionMention(draggedSession)`（`:1792`，接口 `rich-text-input.tsx:202`）。
- `rich-text-input.tsx:42` import `getSessionReferenceDragData`+类型；ProseMirror `handleDrop`（`:422-428`）识别引用拖拽即 `preventDefault` 返回 true，防止 `text/plain` 兜底被当普通文本插入（注释 `:421`）。

出向：无 import；`window.dispatchEvent`（`:86`）。

**CustomEvent 通道的实况**：`insertSessionReferenceMention`/`INSERT_SESSION_REFERENCE_MENTION_EVENT` 全树仅命中本文件定义（`:73,:81,:87`），无 `addEventListener` 监听方；注释 `:68-72` 称「由 AgentView 监听后回写 inserted」，冻结树实际无此监听（矛盾照实记录，§10）。

## 5. 数据 I/O、读写与副作用

- 输入/输出：`DataTransfer` 读写（`setData` `:21-25`、`getData` `:56`、`types` `:34`）；JSON 载荷形状 `{sessionId, title}`。
- 内存状态：模块级 `activeSessionReferenceDragId`（`:13`）——单实例全局，同窗多拖拽交错会互相覆盖（推断，未并发实测）。
- 副作用：DOM `CustomEvent` 派发（`:86-88`）；无磁盘/网络/日志。

## 6. 分支、失败、取消与恢复

- `setSessionReferenceDragData` 抛错路径：内存态复位 + rethrow（`:27-30`），调用方 `session-items.tsx:775` 未捕获（拖拽起始失败会上抛到 React 事件层，推断）。
- `getSessionReferenceDragData` 两级降级：无 MIME/空字符串 → `null`（`:57`）；JSON 非法或形状不符（sessionId/title 空/非字符串）→ `null`（`:61,:63-65`）——调用方 `AgentView.tsx:1786` 拿到 `null` 转而走文件拖放分支（`:1795-1805`）。
- 恢复：`clearSessionReferenceDragState`（`:42-44`）是唯一复位入口，dragstart 失败、dragend（`session-items.tsx:777`）、drop（`AgentView.tsx:1784`）三处调用；若 dragstart 后既不 dragend 也不 drop（拖拽取消 ESC），内存态残留——浏览器通常仍触发 dragend（推断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。`canReferenceDraggedSession` 的「不能引用当前会话」规则由调用方持有 sessionId 后比对（`AgentView.tsx:1788`），本文件只提供纯比较。

## 8. 修改影响面

- 会话引用拖拽全链路：`session-items.tsx`（起）、`AgentView.tsx`（收）、`rich-text-input.tsx`（防误插/insertSessionMention 实现）。
- MIME 常量或 `&session:` 兜底文本格式是跨模块文本契约：下游解析 `agent-message-queue.ts:135`（REF_PATTERN 提取 session id，支持 `~`/`::` 分隔）、`AgentView.tsx:2491`（发送前提取 sessionIds）、`message.tsx:322`（remarkMentions 转 mention 链接）、`markdown-rich-text.ts:566`（`&session:<id>` 生成）、`exploration-session.ts:105`（生成同款文本）。改 `:24` 的格式需同步这些解析点。
- 需同步修改的测试：无专属测试（§9）；`exploration-session.test.ts:77`、`agent-message-queue.test.ts:43-47` 断言的是文本语法（间接）。

## 9. 测试证据

- 直接测试文件：**无**。检索范围：冻结树全文件类型搜 `session-reference-drag|SessionReferenceDrag|insertSessionReferenceMention|INSERT_SESSION_REFERENCE_MENTION|SESSION_REFERENCE_DRAG_MIME|canReferenceDraggedSession|isSessionReferenceDrag|getActiveSessionReferenceDragId|getSessionReferenceDragData|setSessionReferenceDragData|clearSessionReferenceDragState`，仅命中本文件与 §4 三个消费文件，0 测试文件。
- 间接证据（标「间接」）：`exploration-session.test.ts:77` 断言 `&session:branch-1::` 文本；`agent-message-queue.test.ts:43-47` 断言 rawText 含 `&session:abc`——只覆盖文本语法，不覆盖本模块函数。
- 本轮未执行任何测试：`NOT_RUN`（静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出与签名如 §2 | 已证实 | `session-reference-drag.ts:6-90` |
| dragstart 写双载荷+失败复位 rethrow | 已证实 | `session-reference-drag.ts:19-30` |
| drop 侧校验降级链 | 已证实 | `session-reference-drag.ts:56-65,92-101` |
| 防自引用仅比较 sessionId | 已证实 | `session-reference-drag.ts:50` |
| 消费链 session-items/AgentView/rich-text-input | 已证实 | `session-items.tsx:765-777`、`AgentView.tsx:1784-1792`、`rich-text-input.tsx:422-428` |
| `insertSessionReferenceMention` 当前无监听器、inserted 恒 false | 已证实（否定，检索范围：全冻结树搜 `insert-session-reference-mention`/`INSERT_SESSION_REFERENCE_MENTION` 仅命中本文件 :73/:87） | 全树 grep |
| 注释 `:68-72` 称 AgentView 监听回写 inserted 与树实际不符 | 已证实（矛盾照实记录） | 注释 vs 全树 grep |
| `getActiveSessionReferenceDragId`/`isSessionReferenceDrag` 无外部消费者 | 已证实（否定，同上检索范围，外部 0 命中；`isSessionReferenceDrag` 仅内部 `:39` 使用） | 全树 grep |
| 模块内存态多拖拽交错互相覆盖 | 推断 | `:13,:19` 单变量设计 |
| 拖拽取消时 dragend 是否必然触发 | 未知 | 浏览器行为未实测 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| MIME 常量/Item 类型 | §2 | 6-11 | covered |
| `setSessionReferenceDragData`（含失败分支） | §3/§6 | 15-31 | covered |
| `isSessionReferenceDrag`/`getActiveSessionReferenceDragId` | §3 | 33-40 | covered（无消费者，§10） |
| `clearSessionReferenceDragState` | §3/§6 | 42-44 | covered |
| `canReferenceDraggedSession` | §3/§7 | 46-51 | covered |
| `getSessionReferenceDragData`+守卫 | §3/§6 | 53-66,92-101 | covered |
| CustomEvent 通道 | §3/§4/§10 | 73-90 | covered（无监听器） |
| 测试覆盖 | §9 | - | unknown（无直接测试） |
