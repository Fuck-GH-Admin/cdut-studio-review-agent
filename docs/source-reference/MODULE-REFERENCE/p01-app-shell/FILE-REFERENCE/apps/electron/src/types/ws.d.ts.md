---
path: apps/electron/src/types/ws.d.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ef610f688624454386b4fd627ff728ecd1b954b
sha256: f3860c7795ba235d3f480192fbdc98601b8db368d93a81a0bf6ee6d715e28c59
lines: 28
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/ws.d.ts

## 1. 结论与边界

`ws` WebSocket 库的环境类型声明（ambient `declare module`），覆盖项目用到的客户端/服务端子集（`apps/electron/src/types/ws.d.ts:1-28`）。纯声明，无逻辑。

边界：只声明 `WebSocket`（default）、`RawData`、`WebSocketServer` 三个符号；事件签名只细化 `connection`，其余 `on(event: string, ...)` 宽签名兜底。

## 2. 导出与关键符号

声明模块内导出逐条核对：3 个（default 类 1 + 类型别名 1 + 类 1）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WebSocket`（default） | 类（模块内导出） | 5-16 | `constructor(url, options?)`；`send(data)`；`close(code?,reason?)`；`terminate()`；静态 `OPEN/CONNECTING/CLOSING/CLOSED`；`readyState` | 客户端，继承 EventEmitter |
| `RawData` | 类型（模块内导出） | 19 | `Buffer \| ArrayBuffer \| Buffer[]` | 收到消息的原始数据 |
| `WebSocketServer` | 类（模块内导出） | 21-27 | `constructor({server?, path?})`；`clients: Set<WebSocket>`；`close(cb?)`；`on('connection', (socket, request)=>void)` | 服务端 |

## 3. 内部逻辑与关键流程

本文件不适用，依据：`.d.ts` 纯声明。

## 4. 调用者与调用链

入向（冻结树 grep `from 'ws'`）：`apps/electron/src/main/lib/remote-service.ts:30`（`import WebSocket, { WebSocketServer, type RawData } from 'ws'`——远程接入服务端/中继）、`apps/electron/src/main/lib/remote-relay-client.ts:7`（`import WebSocket from 'ws'`——中继客户端）；测试侧 `review/review-relay-multi-viewer-contract.p05.test.ts:12`、`review/review-remote-websocket-relay.p05.test.ts:12`（`WebSocketServer`）。

出向：`node:events`（EventEmitter）、`node:http`（HttpServer/IncomingMessage 类型）。

## 5. 数据 I/O、读写与副作用

本文件不适用（声明无副作用）；所述 `WebSocket`/`WebSocketServer` 在消费者侧有真实网络监听/连接（remote-service/remote-relay-client，文件外）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件不适用，依据：无权限逻辑（网络鉴权在 remote-service 实现侧，未在本文件）。

## 8. 修改影响面

- 改声明影响 `remote-service.ts`/`remote-relay-client.ts` 及两个 p05 测试的 typecheck。
- 宽事件签名（`:15,26`）意味着事件 payload 不被类型约束，消费者自行断言。

## 9. 测试证据

**无直接测试**（声明文件）；两个 `*.p05.test.ts` 测消费者 relay 行为（**间接**）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck。测试断言仅指静态读到的 expect 行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 模块内 3 个声明导出 | 已证实 | `:5,19,21` |
| 4 个消费点（2 生产 + 2 测试） | 已证实（检索） | §4 列举 |
| 事件 payload 细节 | 未知 | 宽签名 + 实现未逐行读 |
| 与 `ws` 真实 API 的一致性 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WebSocket` | §2 | 5-16 | covered |
| `RawData` | §2 | 19 | covered |
| `WebSocketServer` | §2 | 21-27 | covered |
| 消费者面 | §4 | — | covered |
| 测试 | §9 | — | unknown |
