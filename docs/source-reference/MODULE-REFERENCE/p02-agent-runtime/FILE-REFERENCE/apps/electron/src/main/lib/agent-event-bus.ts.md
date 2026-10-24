---
path: apps/electron/src/main/lib/agent-event-bus.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fae05c4de882a02a4a492af6c87ad7304d6e14a6
sha256: 177346b204f9b7182c38d445d68cbe98c4212112a6881de503de5a405dc3c7d1
lines: 93
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-event-bus.ts

## 1. 结论与边界

AgentEventBus — Agent 事件总线（文件头 :2-10）：`emit` 发射事件经中间件链后分发给所有监听器；`on` 注册监听器返回取消函数；`use` 注册中间件。同步分发、进程内单例消费（实例在 `agent-service.ts:49` 创建）。

不做的事：不做持久化/重放（backlog 与 WS 重放日志是 agent-service 中间件职责）；不跨进程（渲染层转发也在 agent-service 中间件）；无异步投递/无背压。

## 2. 导出与关键符号

导出 3 条（`export` 逐条核 :15/:18/:24）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentEventHandler` | type | `:15` | `(sessionId: string, payload: AgentStreamPayload) => void` | 监听器 |
| `AgentEventMiddleware` | type | `:18-22` | `(sessionId, payload, next: () => void) => void` | 中间件可拦截（不调 next） |
| `AgentEventBus` | class | `:24-93` | 见下 | 事件总线 |

类成员：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `handlers` | `:25` | `Set<AgentEventHandler>`（插入序遍历） |
| `middlewares` | `:26` | `AgentEventMiddleware[]`（注册序） |
| `emit` | `:34-73` | 发射（§3） |
| `on` | `:76-81` | 加入 Set，返回删除闭包（:78-80） |
| `use` | `:84-86` | push 追加（注册序执行） |
| `dispose` | `:89-92` | 清空 handlers 与 middlewares |

## 3. 内部逻辑与关键流程

`emit(sessionId, payload)`（:34-73）：
1. `dispatch`（:35-43）：遍历 `handlers`，每个调用包 try/catch——单个 handler 抛错只 `console.error`（:40）不影响其余 handler。
2. 无中间件时直接 `dispatch`（:45-48）。
3. 有中间件时反向包裹成链（:50-66）：从最后一个中间件起包装，每个 `mw(sessionId, payload, next)`，mw 抛错 → `console.error` + 继续 `next()`（:58-63）；mw 不调 `next()` 即拦截（注释 :32）。
4. 链外层再包 try/catch（:68-72）。

同步语义：`emit` 返回时所有 handler 已执行完（依据：全程同步遍历）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- 实例创建：`apps/electron/src/main/lib/agent-service.ts:32` 导入、`:49` `new AgentEventBus()`，随后 `configureAgentSessionProjectionPublisher(eventBus)`（:50）、`new AgentCatalogInvalidationPublisher(eventBus)`（:53）、`new AgentOrchestrator(adapter, eventBus)`（:56）；`:60` `export { eventBus as agentEventBus }`。
- 类型消费：`apps/electron/src/main/lib/agent-orchestrator.ts:59/:288/:319`（构造参数存字段）、`apps/electron/src/main/lib/agent-collaboration-tools.ts:131/:133`（注册监听）、`apps/electron/src/main/lib/agent-catalog-invalidation.ts:2/:9`、`apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts:2/:6/:9`。
- `on()` 订阅方：agent-collaboration-tools.ts:138、`apps/electron/src/main/lib/remote-service.ts:1997`、`apps/electron/src/main/lib/feishu-bridge.ts:287`、`apps/electron/src/main/lib/bridge-command-handler.ts:173`、`apps/electron/src/main/lib/agent-fabric/fabric-executor-headless.ts:124`。
- `use()` 中间件：`agent-service.ts:178`（runtime context store：`context_window` 写入/`run_idle` 清理）、`:190`（非 projection/catalog 进 backlog，先于 IPC 转发）、`:198`（IPC 转发到 webContents；`session_projection`/`catalog_invalidation` 广播全窗口 :205-207；review 会话不转发 :201-204）。
- 测试实例化：`agent-catalog-invalidation.test.ts`（本批内）、`apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts:10/:70`、`review-desktop-isolation.p04.test.ts:12/:94`、`agent-orchestrator-permission-wiring.p06.test.ts:16/:39/:59`（间接）。
- `emit()` 调用面广（remote-service:724/:932/:945/:958/:968/:1129/:1372 等、collaboration-tools :164/:188/:402/:1229/:1243、orchestrator 权限/事件转发）。

出向：类型 `@profer/shared` `AgentStreamPayload`（:12）；无模块调用。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络 I/O（依据：仅类型导入 :12）。副作用是同步调用各 handler/middleware 的副作用（由注册方携带）。
- 状态：handlers Set、middlewares 数组；`dispose` 可清空（:89-92）。
- 并发：单线程同步遍历；handler 内 emit 会重入（无重入保护，见 §10）。

## 6. 分支、失败、取消与恢复

- 分支：middlewares 空/非空（:45）；handler 抛错捕获（:37-41）；middleware 抛错捕获并继续 next（:57-63）；链外捕获（:68-72）。
- 中间件拦截：不调 `next()` 即停止向后（注释 :32；agent-service 三个中间件均调 next，实际无拦截使用）。
- 恢复：无持久化，不适用；`dispose` 后需重新 `on`/`use`。
- 失败可见文本：三条 `console.error` 前缀 `[AgentEventBus] …`（:40/:61/:71）。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role 检查；sessionId 只是路由键）。权威状态：事件分发顺序 = handler 注册序（Set 插入序），中间件序 = 注册序（:84-86）；review 会话的可见性隔离在 agent-service 中间件（:201-204），不在本文件。

## 8. 修改影响面

- 本文件是全 Agent 事件面的咽喉：改分发语义（顺序/异步/拦截）影响 remote-service 广播、WS 重放、渲染层转发（agent-service 三个中间件）、协作阻塞事件、飞书 bridge、fabric headless。
- `AgentStreamPayload` 形状改动影响所有 handler 分支。
- `dispose()` 行为改变会影响测试隔离（review 测试手动建实例）。
- 无本文件直接测试需同步（见 §9）；下游集成测试（review-desktop-isolation 等）按现行为断言。

## 9. 测试证据

直接测试：**无**（检索全冻结树 `*.test.ts` 无 `agent-event-bus` 的专属测试文件；本批 `agent-catalog-invalidation.test.ts` 以真实 AgentEventBus 为依赖间接覆盖 emit/on 基本路径）。
- 间接证据（标注「间接」）：`agent-catalog-invalidation.test.ts`（本批内）3 用例经真实 bus 断言监听器收到 3 条事件及顺序（:23-27）；`review-deleted-owner-tombstone.p04.test.ts`/`review-desktop-isolation.p04.test.ts`/`agent-orchestrator-permission-wiring.p06.test.ts` 以真实/注入 bus 验证各自隔离语义（未逐条读其断言，属其它批）。
- 未覆盖：middleware 链构建/拦截/抛错续跑、handler 抛错隔离、`dispose`、`on` 返回的取消函数。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；同步分发、handler 隔离抛错 | 已证实 | `:34-43` |
| 中间件反向包裹、抛错续 next、可拦截 | 已证实 | `:50-66`；注释 :32 |
| `on` 返回删除闭包；`use` 注册序 | 已证实 | `:76-86` |
| 生产实例唯一（agent-service:49）+ `agentEventBus` 别名导出 | 已证实 | agent-service.ts:49/:60 |
| `dispose()` 无生产调用者 | 已证实 | 全冻结树 `apps/electron/src` 检索 `.dispose()`：命中均非 eventBus（browser-controller/adapter 等） |
| 三个生产中间件的语义（context/backlog/IPC 转发） | 已证实（消费侧） | agent-service.ts:178/:190/:198-217 |
| handler 内重入 emit 的堆叠行为 | 推断 | 代码无重入保护（:34-73 同步遍历），未见使用场景 |
| 每个 handler 的具体消费语义 | 未知（逐个 handler 属他文件） | §4 订阅方清单 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `emit` dispatch/链/异常 | §3/§6 | :34-73 | covered |
| `on`/`use`/`dispose` | §2/§5 | :76-92 | covered |
| `AgentEventHandler`/`AgentEventMiddleware` | §2 | :15-22 | covered |
| 生产实例与 3 中间件 | §4 | agent-service:49-60/:178/:190/:198 | covered |
| `dispose` 调用者 | §10 | — | covered（否定：检索范围见 §10） |
| middleware 拦截/抛错 | §6 | :50-66 | covered（无测试） |
| handler 具体消费语义 | §10 | — | unknown |
