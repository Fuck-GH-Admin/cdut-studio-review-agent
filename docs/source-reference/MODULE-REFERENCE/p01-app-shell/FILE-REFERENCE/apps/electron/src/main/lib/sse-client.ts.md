---
path: apps/electron/src/main/lib/sse-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e8869ac562adc7cfa835aa9545c1267e0f37360
sha256: 999d952566726981e40e759acf0d6d6df6c7ccf9075b89e69476db21e6b7a080
lines: 272
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/sse-client.ts

## 1. 结论与边界

**团队服务器 SSE 客户端**（272 行，主进程单例）：按工作区连接 `/v1/workspaces/<id>/events`，解析 SSE 帧后经 `webContents.send` 转发渲染进程；断线指数退避重连（1s→30s 封顶+抖动）、401 停止重连、窗口聚焦感知自动恢复。

边界：不做业务解析（事件转发给 `team-notification-service`/渲染层）；令牌来自 `getTeamAuth`（auth-service 域外）；`undici.fetch` 显式使用（绕过 Electron net 代理语义，照实记录 §10）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SSEEvent` | 导出接口 | 14-19 | `{type, data, workspaceId, timestamp}` | 转发事件形状 |
| `sseClient` | 导出常量 | 272 | `new SSEClientManager()` | 全局单例 |
| `SSEClientManager` | 内部类 | 39-269 | 见下 | 连接管理 |
| `init` | 方法 | 46-63 | 窗口聚焦监听 | blur 置 false/focus 重连未连 |
| `onEvent`/`removeListener` | 方法 | 66-73 | 监听器注册 | |
| `connect`/`doConnect` | 方法 | 76-175 | 建连/流式读取+重连 | |
| `parseFrame` | 方法 | 178-222 | SSE 帧解析+转发 | |
| `broadcastStatus` | 方法 | 225-231 | 连接状态广播 | |
| `disconnect`/`disconnectAll` | 方法 | 234-254 | 断开 | |
| `getConnectionCount`/`isConnected` | 方法 | 257-268 | 查询 | |
| 常量 | 内部 | 35-37 | `DEFAULT_RETRY_DELAY=1000`、`MAX_RETRY_DELAY=30000`、`RETRY_BACKOFF=2` | |

导出计数：`export` 2 条（`:14`、`:272`），与源码一致。

## 3. 内部逻辑与关键流程

- **doConnect**（`:93-175`）：`undiciFetch(url, {headers:{Authorization: Bearer, Accept: text/event-stream}, signal})`；401 → `broadcastStatus('auth-error')` **停止重连**（`:106-110`）；其余 !ok/无 body → throw；成功 → `connected=true`、重试计数/延迟复位、`broadcastStatus('connected')`（`:118-122`）。
- 流式读取（`:125-143`）：`response.body.getReader()` + `TextDecoder(stream:true)`，缓冲按 `\n\n` 切帧交 `parseFrame`；`AbortError` 静默 return（`:145`）。
- **重连**（`:148-174`）：断开（非 abort）→ `connected=false`、指数退避 `min(1000 * 2^(retryCount-1), 30000)` + 0-1000ms 抖动（`:155-163`）；`broadcastStatus('reconnecting')`；`reconnectTimer` 定时 `doConnect`（abort 检查，`:168-172`）。
- **parseFrame**（`:178-222`）：`event: ` / `data: ` 行解析，`: ` 注释心跳忽略（`:183-191`）；缺 type/data 返回（`:193`）；`connected` 事件不转发（`:196`）；`JSON.parse` 失败跳过（`:219-221`）；构造 `SSEEvent` 通知本地 listeners（单个异常不影响其他，`:207-211`）并广播全部窗口 `SSE_IPC_CHANNELS.EVENT`（`:214-218`）。
- **init**（`:46-63`）：幂等；`browser-window-blur/focus` 监听，focus 时对未连连接批量 `connect(...).catch(() => {})`（`:55-61`）。
- **disconnect**（`:234-247`）：清 `reconnectTimer`、`abortController.abort()`、删记录。

## 4. 调用者与调用链

- 入向（全冻结树 `grep sse-client|sseClient|SSEEvent`，apps+packages 全类型）：
  - `apps/electron/src/main/ipc.ts:7645` 动态 require；`:7650` `sseClient.onEvent(...)`（转 `team-notification-service`）；`:7667` `init()`；`:7671` `connect(workspaceId, auth.baseUrl, auth.token)`；`:7678` `disconnect`；`:7685` `disconnectAll`（登录/登出生命周期）。
  - `apps/electron/src/main/lib/team-notification-service.ts:9` `import type { SSEEvent }`（事件消费类型）。
  - 渲染经 preload `SSE_IPC_CHANNELS.EVENT/CONNECTION_CHANGED` 接收（域外）。
- 出向：`undici.fetch`（`:8`）、`electron.BrowserWindow/app`（`:9`）、`@profer/shared.SSE_IPC_CHANNELS`（`:10`）。

## 5. 数据 I/O、读写与副作用

- 网络：HTTPS 长连接 GET `text/event-stream`（Bearer 令牌）。
- 磁盘：无。
- 副作用：`webContents.send`（EVENT/CONNECTION_CHANGED）；console 日志；定时器/AbortController。

## 6. 分支、失败、取消与恢复

- 401：停止重连（`:106-110`）——需重新登录由 `ipc.ts` 生命周期重建（`:7671`）。
- 断线：指数退避重连（封顶 30s+抖动，`:155-163`）；`abort` 静默（`:145`、`:149`）。
- `connect` 先 `disconnect` 旧连接（`:78`）防重复。
- 取消：`disconnect`/`disconnectAll` abort；`reconnectTimer` 清理。
- 恢复：窗口 focus 恢复未连连接（`:55-61`）；重试计数在成功后复位（`:119-120`）。

## 7. 权限与权威状态

- 无 sender/role 检查（主进程内部服务）；令牌由 `getTeamAuth` 提供（auth-service 域外）。
- 权威状态：服务端事件流为权威；本地转发不做业务校验（`data` 原样 JSON.parse 后转发）。

## 8. 修改影响面

- `ipc.ts:7645-7685` 生命周期与 `team-notification-service` 事件消费；渲染 `SSE_IPC_CHANNELS` 契约。
- 重连参数（1s/30s/×2/抖动）影响实时性与服务端压力。
- 测试：无专属测试（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：无。
- 未覆盖：帧解析、退避重连、401 停连、聚焦恢复、并发连接。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实 SSE；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与类结构 | 已证实 | `:14-272` |
| 401 停止重连/退避封顶 30s+抖动 | 已证实 | `:106-110`、`:155-163` |
| `connected` 事件不转发、坏帧跳过 | 已证实 | `:196`、`:219-221` |
| 单监听器异常隔离 | 已证实 | `:207-211` |
| 焦点恢复未连连接 | 已证实 | `:55-61` |
| 无专属测试 | 已证实 | 全冻结树检索（§9 范围） |
| undici 而非 Electron net（代理语义差异） | 已证实 | `:8`、`:97` |
| 真实 SSE 行为/服务端兼容 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `doConnect` 建连/流式/重连 | §3/§6 | 93-175 | covered |
| `parseFrame` | §3 | 178-222 | covered |
| `init` 焦点感知 | §3 | 46-63 | covered |
| `disconnect*`/查询方法 | §3 | 234-268 | covered |
| 生命周期接线 | §4 | ipc.ts:7645-7685 | covered |
| 真实网络行为 | §10 | — | unknown（NOT_RUN） |
