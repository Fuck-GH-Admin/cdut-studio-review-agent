---
path: apps/electron/src/main/lib/agent-fabric/agent-fabric-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8fe98202186fc3fbbc9bd84d753e258c2a669ab6
sha256: fac9b378f3b5f1ef0a5ea12404399807d3f58b20b4df772df038dcedce684118
lines: 147
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/agent-fabric-service.ts

## 1. 结论与边界

**Agent Fabric 本地服务装配**（运行时代码）：组装顺序 配置→文件持久化→Gateway（含本节点注册）→Headless 执行器→Loopback HTTP/SSE 传输；启动先执行孤儿任务恢复（非终态任务过期、safe-to-retry 排队保留）再接受新请求（`apps/electron/src/main/lib/agent-fabric/agent-fabric-service.ts:1-8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getAgentFabricGateway` | 函数 | 63-65 | 运行中 Gateway 或 null |
| `isAgentFabricRunning` | 函数 | 67-69 | |
| `startAgentFabricService` | 异步 | 76-136 | 启动（未启用 no-op 返 null；返回监听地址） |
| `stopAgentFabricService` | 异步 | 138-147 | 停止（清心跳+关 HTTP） |

内部：`FabricServiceState`（`:26-32`）、`HEARTBEAT_INTERVAL_MS=10s`、`ARTIFACT_CONTENT_CHAR_LIMIT=512KB`（`:36-37`）、`getAppVersion`（electron require 失败回退 '0.0.0-dev'，`:39-47`）、`readArtifactContent`（**:50-61 受控只支持 `session-transcript-*` 产物**，转 Markdown 截 512KB）。

## 3. 内部逻辑与关键流程

`startAgentFabricService`：`loadAgentFabricConfig` enabled 校验（`:79-83`）→instanceId 生成（`:85`）→registry/store/eventLog/executor 装配（`:86-89`）→Gateway（`resolveExecutor` 仅本 agentId，`:95`）→selfNode 注册（ALL_CAPABILITIES、maxConcurrency 1、allowDelegation maxDepth 2，`:98-112`）→**孤儿任务过期**（`expireOrphanedTasks`，`:115-118`）→`startFabricServer`（authenticate=pairing、readArtifactContent，`:120-126`）→10s 心跳（unref，`:128-131`）。

## 4. 调用者与调用链

入向：主进程启动编排（非本批）。出向：`@profer/agent-fabric`（Gateway/registry）、`../agent-session-manager`、`./fabric-{config,pairing,store,executor-headless,server}`。

## 5. 数据 I/O 与副作用

经子模块落盘（配置目录 agent-fabric/）；HTTP 监听 127.0.0.1:4788/4789；`console.log`。

## 6. 分支、失败、取消与恢复

未启用返 null（`:80-83`）；重复 start 返回已有地址（`:77`）；stop 关服失败 console.error 不抛（`:141-145`）。

## 7. 权限与权威状态

产物读取受控白名单（仅会话转录，`:49-51`）；启动时孤儿收敛（`:114` 注释）。

## 8. 修改影响面

改动 Gateway 装配/恢复策略影响任务持久性语义；心跳间隔与 fabric-server 端口契约。

## 9. 测试证据

无专属测试（glob `**/agent-fabric-service*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+装配链+孤儿恢复 | 已证实 | `:1-147` 逐行 |
| 运行行为 | 未知 | NOT_RUN（网络/多进程） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/流程 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
