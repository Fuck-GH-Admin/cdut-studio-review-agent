---
path: apps/electron/src/main/lib/chat-stream-bus.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fbe73b756d2fe39545f524929ae4051f37fe6d7b
sha256: aef1bbda991851a870e1e8a9421382320a834df830ebb28122122e4cba8ec8a7
lines: 53
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/chat-stream-bus.ts

## 1. 结论与边界

**Chat 流式事件总线——桌面 IPC 与移动端远程通道的共用推送层**（`chat-stream-bus.ts:1-8` 注释）：桌面原走 webContents.send；remote-service 无 webContents 需独立订阅通道。`pushChatStream` 同时发桌面窗口与总线订阅者，**桌面行为零变化**（`:7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `chatEventBus` | const（export） | `:17-33` | `{on(listener): unsubscribe; emit(conversationId, channel, payload)}`；监听器异常 catch+console.error（`:28-30`） |
| `pushChatStream` | function（export） | `:39-53` | `(webContents\|null, conversationId, channel, payload) => void` |

内部：`ChatBusListener`（`:12`）、`listeners` Set（`:14`）。

## 3. 内部逻辑与关键流程

`pushChatStream`（`:39-53`）：webContents 非空且未销毁才 `send`（`:45-47`，异常忽略 `:48-50`）；随后 `chatEventBus.emit` 广播（快照遍历 `[...listeners]` `:25`，单监听器异常不阻断他人 `:26-31`）。

## 4. 调用者与调用链

入向：Chat 流式推送点（跨文件）；remote-service 订阅广播移动端（跨文件）。出向：electron（类型）。

## 5. 数据 I/O、读写与副作用

副作用：同步事件分发；无持久化。

## 6. 分支、失败、取消与恢复

监听器/窗口异常均 catch；退订=on 返回的函数。不适用取消/恢复。

## 7. 权限与权威状态

不适用（通道层）。

## 8. 修改影响面

改总线 → 桌面推送与移动端广播双链。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `chatEventBus|pushChatStream` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+异常隔离 | 已证实 | 逐行读 `:1-53` |
| remote-service 订阅行为 | 未知 | 跨文件未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2/§3 | `:17-53` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
