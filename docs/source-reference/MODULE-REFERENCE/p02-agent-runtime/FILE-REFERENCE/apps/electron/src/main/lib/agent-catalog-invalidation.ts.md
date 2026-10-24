---
path: apps/electron/src/main/lib/agent-catalog-invalidation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7043765b1fff4c8dc8ede972da7d85a61a064064
sha256: 66200c6182ed2dafd22588b7bbd5fb6fc110894583aad836276682b691923a48
lines: 28
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-catalog-invalidation.ts

## 1. 结论与边界

目录失效发布器：目录（channels/presets/workspace_capabilities/workspaces）变更时向 AgentEventBus 发布「失效通知」，每个 catalog/scope 维护独立单调递增 revision；通知**不携带目录正文**（类注释 :5）。运行时类，无磁盘 I/O。

不做的事：不读/存目录内容（消费方自行重拉）；不做去重（客户端按 catalog/scope+revision 去重，注释 :23-24）；不管理 Event 订阅（只 emit）。

## 2. 导出与关键符号

导出 1 条（`export` 逐条核 :6）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentCatalogInvalidationPublisher` | class | `:6-27` | `constructor(private readonly eventBus: AgentEventBus)`（:9）；`invalidate(catalog, workspaceSlug = null): AgentCatalogInvalidation`（:11-27） | 每实例一个 revision 序列（`revisions: Map<string, number>` :7） |

无内部函数。

## 3. 内部逻辑与关键流程

`invalidate(catalog, workspaceSlug = null)`（:11-27）：
1. key = `` `${catalog}:${workspaceSlug ?? '*'}` ``（:12）。
2. revision 自增（`(revisions.get(key) ?? 0) + 1`，:13-14）。
3. 构造 `AgentCatalogInvalidation`（`kind:'catalog_invalidation'`、catalog、workspaceSlug、revision、`changedAt: Date.now()`，:15-21；类型定义 `packages/shared/src/types/agent.ts:699`）。
4. `eventBus.emit(\`catalog:${key}\`, payload)`（:25）——路由键用保留 scope key（注释 :23-24：目录无 session 归属，Remote event log 仍按统一 eventId 记录）。
5. 返回 notification（:26）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`，符号 `AgentCatalogInvalidationPublisher`/`agentCatalogInvalidationPublisher`）：
- `apps/electron/src/main/lib/agent-service.ts:34` 导入；`:53` 创建单例 `agentCatalogInvalidationPublisher`（注释 :51-52：与 ipc.ts/remote-service.ts/workspace-watcher.ts 共享同一 revision 序列）。
- `apps/electron/src/main/ipc.ts:323` 导入单例；`:1672/:1682/:1692` 调 `invalidate('channels')`（渠道增删改路径）。
- 其它注释提及的 remote-service.ts/workspace-watcher.ts 无直接符号引用（检索 `agentCatalogInvalidationPublisher` 全冻结树仅上述行）；是否有别的调用入口见 §10。

出向：`AgentEventBus.emit`（:25）；类型 import `@profer/shared`（:1）与 `./agent-event-bus`（:2，仅类型）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络 I/O（依据：仅 type import + 构造注入的 eventBus）。副作用单一：`eventBus.emit`（:25），payload 为失效通知本身。`revisions` Map 是实例内存状态（跨调用单调递增）；单例化（agent-service.ts:53）保证同进程全局序列单调。

## 6. 分支、失败、取消与恢复

- 无分支（`workspaceSlug` 默认 `null` 是唯一条件，:11/:12）；无 throw；不调用异步。
- 失败/恢复不适用：本文件无持久化状态；revision 从 0 起算，进程重启后重新计数——客户端去重键为 catalog+scope，revision 回绕的影响未在本文件处理（见 §10）。

## 7. 权限与权威状态

无权限分支（依据：本文件无 sender/role 检查）；谁能调 `invalidate` 由导入方决定（现状仅 ipc.ts 渠道管理路径）。revision 权威在本类实例（单例 = 全进程权威序列）；通知不含正文，读权限由各目录自身的消费接口控制。

## 8. 修改影响面

- 改通知形状影响 Pocket/远程客户端去重逻辑与 WS 事件重放日志（`apps/electron/src/main/lib/remote-service.ts:365` 广播入口按 payload kind 处理；`apps/electron/src/main/lib/agent-service.ts:191` 中间件把 `catalog_invalidation` 排除出 backlog，`:205-207` 中间件把它广播到所有窗口 webContents）。
- 改路由键 `catalog:${key}` 影响 `apps/electron/src/main/lib/agent-catalog-invalidation.test.ts`（本批内，:23-27/:62 断言 sessionId 路由键）。
- `AgentCatalogKind` 枚举改动需同步 `packages/shared/src/types/agent.ts:696` 与调用方字符串字面量（ipc.ts:1672 等）。
- 需同步修改的测试：`agent-catalog-invalidation.test.ts`（本批内）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-catalog-invalidation.test.ts`（本批内，3 用例，用真实 `AgentEventBus` 非 mock）。
- 「revision 单调递增，不同 scope 独立计数」（:6）：断言 `first/second/other.revision` 为 1/2/1（:20-22）与 `seen` 数组精确相等（含 sessionId 路由键 `catalog:presets:demo`/`catalog:presets:other`，:23-27）。
- 「通知不含正文或敏感配置」（:30）：断言 payload JSON 逐字段相等（:36-42）且 `not.toContain('mcpServers')`/`('skillContent')`（:43-44）。
- 「无 workspaceSlug 时 scope key 为 catalog:*」（:49）：断言 `toMatchObject({catalog:'channels', workspaceSlug:null, revision:1})`、`second.revision===2`、scopeKeys 序列（:60-62）。
- 未覆盖：`changedAt` 时钟语义、事件总线中间件交互、`workspaces` catalog 值、单例跨消费方共享。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；revision 按 catalog:scope 独立单调递增 | 已证实 | `:7/:12-14`；测试 :20-22 |
| 通知不含目录正文，payload 字段固定 5 个 | 已证实 | `:15-21`；测试 :36-44 |
| 路由键 `catalog:<catalog>:<scope|*>` 作为 bus 的 sessionId | 已证实 | `:25`；测试 :23-27/:62 |
| 生产调用现状：仅 ipc.ts 3 处 `invalidate('channels')` + agent-service 单例 | 已证实 | 全冻结树 `*.ts` 检索 `agentCatalogInvalidationPublisher`/`.invalidate(` |
| 注释称 remote-service/workspace-watcher 共享单例，但无直接 `invalidate` 调用 | 已证实（照实记录） | agent-service.ts:51-53 注释 vs 检索结果 |
| `presets`/`workspace_capabilities`/`workspaces` 的生产调用点 | 未知 | 检索 `.invalidate(` 仅见 channels 与测试用例 |
| 进程重启 revision 归零对客户端去重的影响 | 未知 | 无持久化逻辑，未见补偿代码 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentCatalogInvalidationPublisher.invalidate` | §3 | :11-27 | covered |
| revision 单调性/独立性 | §3/§9 | :12-14 | covered |
| 空 workspaceSlug → `*` key | §3/§9 | :12 | covered |
| payload 不含正文 | §5/§9 | :15-21 | covered |
| 其余 catalog 生产调用点 | §10 | — | unknown |
| revision 重启语义 | §6/§10 | :7 | unknown |
