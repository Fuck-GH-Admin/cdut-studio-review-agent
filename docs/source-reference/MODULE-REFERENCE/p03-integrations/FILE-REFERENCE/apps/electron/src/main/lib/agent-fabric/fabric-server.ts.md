---
path: apps/electron/src/main/lib/agent-fabric/fabric-server.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e178321356471311a9fa972d56741fc4048c607
sha256: 3eda155a86010bae1ec7c1e0989c57d159b68b012ecfc02ff94212fe3aad6e3d
lines: 321
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-server.ts

## 1. 结论与边界

**Loopback HTTP/SSE 传输适配**（设计文档 §4）：只做 HTTP 路由、Bearer 认证→CallerContext、SSE 事件转发；业务语义全在 `@profer/agent-fabric` Gateway；不 import electron 可直接 bun test 起真实端口（`apps/electron/src/main/lib/agent-fabric/fabric-server.ts:1-8`）。端点清单（`:10-19`）：GET /v1/health（免认证）、GET /v1/agents、POST /v1/tasks、GET /v1/tasks/:id、POST /v1/tasks/:id/cancel、GET /v1/tasks/:id/result、GET /v1/tasks/:id/artifacts、GET /v1/tasks/:id/events?after=N（SSE）、GET /v1/artifacts/:id(?content=1)。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FabricAuthResult` | 接口 | 35-39 | |
| `FabricServerDeps` | 接口 | 41-49 | gateway/authenticate/readArtifactContent?/host?/port? |
| `FabricServerHandle` | 接口 | 51-55 | `{address, close}` |
| `startFabricServer` | 异步函数 | 185-321 | 启动并返回 handle |

内部：`MAX_BODY_BYTES=256KB`、`SSE_HEARTBEAT_MS=15s`（`:57-58`）、`errorStatus`（ProtocolErrorCode→HTTP 映射：404/403/409/503/410/400，`:60-84`）、`sendJson/sendError`（`:86-105`）、`readBody`（超限抛 PAYLOAD_TOO_LARGE，`:107-123`）、`requireCaller`（Bearer 解析，未配对抛 CALLER_NOT_PAIRED，`:126-138`）、`streamTaskEvents`（**:140-183 先按游标重放再挂实时监听、终态事件主动结束流、15s 心跳、close 时清理**）。

## 3. 内部逻辑与关键流程

`handleRequest`（`:193-305`）：health 免认证（`:200`）→`requireCaller`→各端点；**POST /v1/tasks 的 actor 以认证身份覆盖**（payload 自称 actor 不能冒充，`:221-222`）；提交返回 201/200（deduplicated）；SSE 先校验任务存在与读权限再升级（`:236-242`）；artifact content=1 经受控 readArtifactContent（无实现 501、内容无 404，`:284-295`）；未知端点 404（`:301`）。

## 4. 调用者与调用链

入向：`agent-fabric-service.ts:24`、`fabric-server.test.ts:22`。出向：node:http、`@profer/agent-fabric`。

## 5. 数据 I/O 与副作用

HTTP 监听（默认 127.0.0.1:0 系统分配）；SSE 长连接。

## 6. 分支、失败、取消与恢复

错误统一 sendError 形状（`{ok:false,requestId,error}`）；未捕获异常 500 VALIDATION_FAILED 形状（`:96-104`）；SSE 终态/断线清理（`:160-182`）。

## 7. 权限与权威状态

认证强制（除 health）；CallerContext trust=PAIRED_LOCAL_AGENT（`:135`）；actor 防冒充（`:221`）。

## 8. 修改影响面

端点/错误码映射是外部客户端契约；SSE 帧格式（id:event:data）与客户端游标协议同步。

## 9. 测试证据

`fabric-server.test.ts`（10 用例端到端：认证 5+生命周期 5，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+9 端点+错误映射+SSE 语义 | 已证实 | `:1-321` 逐行 |
| 运行行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/端点/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
