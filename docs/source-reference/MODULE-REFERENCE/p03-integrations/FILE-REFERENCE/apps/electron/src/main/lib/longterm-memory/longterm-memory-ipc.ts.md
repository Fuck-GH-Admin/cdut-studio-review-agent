---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-ipc.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 56665813a1c1f338352d80726cb6225d0b349c15
sha256: e7a1714fbc476db2866f994e8f7055ea7556ad19f804544076a0e554402b6fcc
lines: 85
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-ipc.ts

## 1. 结论与边界

长期记忆图谱的 Main 进程 IPC 接线：注册“读图谱 / 增 / 改 / 删 / 检索测试”五个 handler（`:41-85`），写成功后向所有存活窗口广播 `CHANGED`（`:29-39`）。运行时模块，含 IPC 注册、窗口广播与 store/RAG 调用；**不含**业务校验、sender 校验或存储实现。

不做的事：不定义 channel 常量（`packages/shared/src/types/longterm-memory.ts:85-98`）；不做节点归一化/落盘（`longterm-memory-store.ts`）；不做 BM25（`longterm-memory-rag.ts`）；不校验输入形状、不鉴权、不区分窗口角色。

## 2. 导出与关键符号

导出 1 个 function。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `registerLongTermMemoryIpc` | function | `:41-85` | `() => void` | 一次性注册 5 个 `ipcMain.handle`；重复调用会让 Electron 抛“handler already registered” |

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `broadcastChanged` | `:29-39` | 遍历 `BrowserWindow.getAllWindows()`，双重判活后 `webContents.send(CHANGED)`；整体 try/catch |

## 3. 内部逻辑与关键流程

### 3.1 广播 `broadcastChanged`（`:29-39`）

1. `BrowserWindow.getAllWindows()`（`:31`）。
2. 每个窗口同时检查 `!win.isDestroyed()` 与 `!win.webContents.isDestroyed()`（`:32`），再 `win.webContents.send(LONGTERM_MEMORY_IPC_CHANNELS.CHANGED)`（`:33`）。
3. 整个循环包在 try/catch 中；任一窗口发送抛错会中断后续窗口，但异常被 `console.warn` 吞掉（`:36-38`）。注释说明窗口关闭时 `send` 会抛 “Object has been destroyed”（`:25-27`）。
4. 广播不带 payload；渲染层收到后自行重新拉取（`preload/index.ts:4161-4165`）。

### 3.2 `READ_GRAPH`（`:42-44`）

`ipcMain.handle(READ_GRAPH, () => readLongTermMemoryGraph())`。无参数、无校验；返回 store 的图对象，跨 IPC 由 Electron 结构化克隆，渲染层拿到副本。

### 3.3 `ADD_NODE`（`:46-53`）

1. handler 签名 `async (_event, input: LongTermMemoryNodeInput)`。
2. `await addLongTermMemoryNode(input)`（`:49`）；store 负责生成 id/权重/时间戳。
3. 成功 → `broadcastChanged()`（`:50`）→ 返回节点（`:51`）。
4. 失败（如内容为空、写盘失败）→ 不广播，异常经 IPC reject 回渲染层。

### 3.4 `UPDATE_NODE`（`:55-68`）

1. 入参是整个 `LongTermMemoryNode`，不是 patch。
2. 只挑 `category/title/content/tags/confidence` 传给 store（`:58-64`）；`id` 用于定位；`weight/source/createdAt/updatedAt` 由 store 保留/重算。
3. 返回 `null`（目标不存在或内容为空）→ 不广播，返回 `null`（`:65-66`）。
4. 成功 → 广播 → 返回更新后的节点。

### 3.5 `DELETE_NODE`（`:70-77`）

`await deleteLongTermMemoryNode(nodeId)`；只有 `true` 才广播；返回 `{success}`（`:72-75`）。未命中返回 `{success:false}`，不广播。

### 3.6 `QUERY_TEST`（`:79-84`）

`searchLongTermMemory(input?.query ?? '', {topK: input?.topK})`。`input` 为 `undefined` 时安全（可选链）；`topK` 原样透传，store/RAG 只保证最小 1（`longterm-memory-rag.ts:211`），**没有上限**。不广播、不写盘。

## 4. 调用者与调用链

### 4.1 入向

| 调用者 | 位置 | 说明 |
| --- | --- | --- |
| 主进程启动 | `apps/electron/src/main/ipc.ts:148`（import）、`:6226` | `registerLongTermMemoryIpc()`，在 `registerReviewIpc`/`registerCsLabIpc` 之后 |
| 渲染层 | `apps/electron/src/preload/index.ts:4151-4166` | `longTermMemory.getGraph/addNode/updateNode/deleteNode/queryTest/onChanged` |
| 渲染层 atom | `apps/electron/src/renderer/atoms/longterm-memory-atoms.ts:60`、`:91`、`:101`、`:124`、`:152` | 五个调用点 |
| UI | `apps/electron/src/renderer/components/settings/LongTermMemoryView.tsx` | 通过 atom 间接触发 |

全冻结树检索未发现其它 `registerLongTermMemoryIpc` 调用；`ipcMain.handle` 只在 `ipc.ts:6226` 注册一次。

### 4.2 出向

- `readLongTermMemoryGraph` / `addLongTermMemoryNode` / `updateLongTermMemoryNode` / `deleteLongTermMemoryNode` ← `./longterm-memory-store`（`:17-22`）。
- `searchLongTermMemory` ← `./longterm-memory-rag`（`:16`）。
- `BrowserWindow`、`ipcMain` ← `electron`（`:8`）。
- channel 常量与类型 ← `@profer/shared`（`:9-15`，定义 `packages/shared/src/types/longterm-memory.ts:85-98`）。

### 4.3 链路

```
renderer atom (longterm-memory-atoms.ts:60/91/101/124/152)
  → preload longTermMemory.* (preload/index.ts:4152-4160)
  → ipcMain.handle (本文件 :42-84)
  → store / rag
  → 写成功 broadcastChanged (:29-39)
  → preload onChanged (:4161-4165) → renderer 刷新
```

## 5. 数据 I/O、读写与副作用

- **输入**：`READ_GRAPH` 无参；`ADD_NODE` 为 `LongTermMemoryNodeInput`；`UPDATE_NODE` 为完整 `LongTermMemoryNode`；`DELETE_NODE` 为 string；`QUERY_TEST` 为 `{query; topK?}`。
- **输出**：图、节点、`{success}`、`LongTermMemoryHit[]`。
- **磁盘**：本文件不直接读写；经 store 写 `~/.cdutai/user-habit-graph.json`（及 `.tmp/.bak`）。`READ_GRAPH`/`QUERY_TEST` 经 store/RAG 读盘，且 store 读路径可能做 `.tmp/.bak` 恢复写（`safe-file.ts:56-82`）。
- **广播副作用**：每次成功的增/改/删向所有窗口发 `CHANGED`；无 payload、无去重、无节流。一次批量反思不走 IPC，因此不会触发广播。
- **原子性/幂等**：本文件不加锁；依赖 store 的写队列。重复 `ADD_NODE` 会生成不同 id，不幂等；重复 `DELETE_NODE` 第二次 `success:false`。
- **错误**：store/rag 抛错直接让 IPC promise reject；本文件不包装错误码。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 窗口已销毁 | `:32` | 跳过该窗口 |
| 广播发送抛错 | `:36-38` | `console.warn`，中断剩余窗口，但不影响 handler 返回值 |
| `ADD_NODE` 内容为空 | store `:226` | IPC reject，不广播 |
| `UPDATE_NODE` 目标不存在/内容为空 | store `:247`、`:261` | 返回 `null`，不广播 |
| `DELETE_NODE` 未命中 | store `:278` | 返回 `{success:false}`，不广播 |
| `input` 为 `undefined`（QUERY_TEST） | `:82` | `?? ''`/`?? undefined`，安全 |
| `input` 为 `undefined`（ADD_NODE） | store `:215` | `input.category` 抛 TypeError，IPC reject |
| `node` 为 `undefined`（UPDATE_NODE） | `:58` | `node.id` 抛 TypeError，IPC reject |
| 重复注册 | `:41` | `ipcMain.handle` 抛错（Electron 行为），无自定义保护 |
| 取消 | 无 | 无 AbortSignal；已进入 store 的写无法取消 |
| 重启/恢复 | 无 | 无内存状态；下次读走 store 磁盘恢复 |

## 7. 权限与权威状态

- **无权限分支**：五个 handler 都忽略 `_event`，没有 `senderFrame`/`senderId`/角色校验，也没有来源 URL 白名单。任何能向主进程发这些 channel 的渲染上下文都可读全图、增删改节点、执行检索测试。
- **权威状态**：磁盘图谱由 store 产生；IPC 只是转发。`UPDATE_NODE` 只允许改五个字段（`:58-64`），`source/weight/createdAt` 不能经 IPC 篡改；但 `category` 可被改成任意字符串，store 归一化会回退 `interaction_style`（`longterm-memory-store.ts:102-104`）。
- **广播范围**：所有 `BrowserWindow`，不区分主窗/CSLab 次窗；注释明确这是为了多窗口一致（`:5`）。

## 8. 修改影响面

- 改 channel 名/参数形状 → 同步 `packages/shared/src/types/longterm-memory.ts:85-98`、`preload/index.ts:4151-4166`、`renderer/atoms/longterm-memory-atoms.ts:60-163`。
- 改 `UPDATE_NODE` 入参为 patch → 影响 renderer 的 `saveLongTermMemoryDraftAtom`（`longterm-memory-atoms.ts:91-98` 传完整节点）。
- 加 sender 校验 → 需要所有调用窗口满足；当前 `LongTermMemoryView` 在主窗，CSLab 次窗是否也调用需另行核对（本轮未读该窗口代码）。
- 改广播策略（如带 payload/只广播主窗）→ 影响 `preload` 的 `onChanged` 消费者；当前只传空事件。
- 无存储格式变更；但若在 IPC 层加校验，错误文案会从 store 的中文错误变为 IPC 层错误，影响 UI toast。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建或 Electron/GUI。

**直接测试：无**。全冻结树检索 `**/longterm-memory-ipc*.test.*` 无结果；本文件没有专属测试。

**间接证据**：`longterm-memory-rag.test.ts` 直接测 `searchLongTermMemory`（不经过 IPC）；`longterm-memory-reflector.test.ts` 直接测 store（不经过 IPC）。IPC handler 的参数透传、广播、错误路径均无测试断言。

**未覆盖**：五个 handler 的注册/调用、窗口销毁判活、广播异常、`UPDATE_NODE` 字段白名单、`QUERY_TEST` 的 `topK` 透传、无 sender 校验的安全边界。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 注册 5 个 handler，无第六个 | 已证实 | `:42,47,56,71,80` |
| 写成功才广播，读/检索不广播 | 已证实 | `:50,65,74`；`:43,82` 无广播 |
| 广播遍历所有窗口并双重判活 | 已证实 | `:31-33` |
| 广播异常被吞，不影响返回值 | 已证实 | `:36-38` |
| 无 sender/role/来源校验 | 已证实 | 五个 handler 的 `_event` 均未使用（`:42,48,57,72,81`） |
| `UPDATE_NODE` 只传五个可编辑字段 | 已证实 | `:58-64` |
| `QUERY_TEST` 的 `topK` 无上限 | 已证实 | `:82`；RAG `:211` 只 `Math.max(1,…)` |
| 重复注册会抛错 | 推断 | 依赖 Electron `ipcMain.handle` 语义；本文件无保护，未运行验证 |
| CSLab 次窗是否实际调用这些 channel | 未知 | 本轮只读 renderer atoms/主窗 view，未逐窗核对 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `broadcastChanged` | 3.1、6 | `:29-39` | covered |
| `READ_GRAPH` | 3.2 | `:42-44` | covered |
| `ADD_NODE` | 3.3、6 | `:46-53` | covered |
| `UPDATE_NODE` | 3.4、6、7 | `:55-68` | covered |
| `DELETE_NODE` | 3.5、6 | `:70-77` | covered |
| `QUERY_TEST` | 3.6、6 | `:79-84` | covered |
| 注册调用点 | 4.1 | `ipc.ts:6226` | covered |
| preload 桥 | 4.1、4.3 | `preload/index.ts:4151-4166` | covered |
| 测试 | 9 | — | unknown（无专属测试，NOT_RUN） |
