---
path: apps/electron/src/main/lib/remote-relay-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 320516b0ca5445f9f6232999cf3feb4d1991ab6c
sha256: 4f669fdff3b5ebcf7d265f4212c29d06471f2daeb9cbd3cad0fb88e4b5a73e33
lines: 152
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-relay-client.ts

## 1. 结论与边界

**Profer 桌面端 → 中心 Remote Relay 出站客户端**（`remote-relay-client.ts:1-6` 注释）：**只负责传输层**（ticket 获取、WSS 重连、帧收发）；命令执行与事件生产由 remote-service 回调提供，**避免把 Agent/模型/文件权限移到服务器**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DEFAULT_REMOTE_RELAY_URL` | const | `:10` | `wss://profer.cn/remote/ws` |
| `RemoteRelayClientOptions`/`RemoteRelaySink` | type（export） | `:12-24` | 回调与发送句柄（send/isOpen/close） |
| `RemoteRelayClient` | class（export） | `:30-152` | start/stop/getSink + 私有 connect/scheduleTicketRefresh/scheduleReconnect |

内部：重连 2s→30s 指数（`:26-27`）、ticket 刷新余量 15s（`:28`）、generation 防旧连接竞态（`:39/:71`）。

## 3. 内部逻辑与关键流程

1. `start`（`:46-51`）：enabled===false 或已启动则返回；重置延迟。`stop`（`:53-63`）：清双定时器+关连接（generation++ 防竞态）。
2. `connect`（`:69-132`）：**先取 ticket（失败重连 `:73-79`）**→ 建 WSS（Origin 头 `:84`）→ sink 三防线：非 OPEN 不发、**bufferedAmount≥4MB 主动断开 1013 'slow relay client'**（`:95-97`）、**单帧 >256KB 拒发**（`:99`）。open 时发 `relay_auth`（**:110，ticket 只在握手时发送**）、重置延迟、排 ticket 刷新、回调 onOpen。
3. **ticket 刷新**（`:134-141`）：到期前 15s 主动关连接（4001 'refreshing relay ticket'）换新——**不把 ticket 发到已建立连接**（`:138` 注释）。
4. 重连（`:143-151`）：指数退避至 30s。
5. 事件：message 回调（`:115-118`）；close 清 sink+重连（`:123-131`）。

## 4. 调用者与调用链

入向：remote-service（同批）。出向：`ws`、`./auth-service`（getRemoteRelayTicket `:8`）。

## 5. 数据 I/O、读写与副作用

WSS 连接/收发；定时器；console.warn。ticket 仅握手发送。

## 6. 分支、失败、取消与恢复

ticket 失败→重连（`:75-78`）；慢客户端→断开（`:95-97`）；stop 全清（`:53-63`）；恢复=指数退避重连。不适用 AbortController。

## 7. 权限与权威状态

红线：权限留本地（`:5`）；ticket 不入已建连接（`:138`）；帧限（4MB 缓冲/256KB 帧）防滥用。

## 8. 修改影响面

改传输层 → 远程 Pocket 全部链路可靠性；ticket 策略牵动鉴权安全。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RemoteRelayClient` → 0 命中）。**NOT_RUN**（网络）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+类全链+三防线 | 已证实 | 逐行读 `:1-152` |
| 中心 Relay 侧行为 | 未知 | 服务端 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+传输链 | §2/§3 | `:30-152` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
