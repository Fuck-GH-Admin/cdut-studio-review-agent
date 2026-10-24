---
path: scripts/agent-fabric-client.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 84664990c0c9636f3f32ee3557bb75fcd0dd82de
sha256: 52f6173618515ab0856012e79e18885f51246ae96181d6445ac979c5b07115df
lines: 166
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/agent-fabric-client.mjs

## 1. 结论与边界

Agent Fabric 外部客户端示例（Hermes/调度器最小参考实现，独立 node 脚本）：演示提交任务（幂等 requestId）、SSE 事件订阅（after 游标断线恢复）、取消、结果/产物读取（文件头 `scripts/agent-fabric-client.mjs:1-17`）。直连 `http://127.0.0.1:<port>` 的 Fabric HTTP API（`--token` Bearer）。

边界：不是生产调度器（示例）；不做 token 管理（`agent-fabric-pair.mjs` 配对）；不实现重连循环（打印恢复提示由调用方重跑 `--task --after`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（CLI 脚本）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `parseArgs` | 函数（内部） | 21-38 | 手写 flag 解析（token/port/objective/target/workspace/task/after/cancel/agents/no-wait） |
| `call` | 函数（内部） | 49-61 | fetch JSON API，非 2xx 抛错（`json.error.message`） |
| `streamEvents` | 函数（内部） | 63-92 | SSE 解析（id:/event:/data: 帧），终态事件返回 |
| `main` | 函数（内部） | 94-161 | 三模式分发 |

## 3. 内部逻辑与关键流程

1. 参数门（`:41-44`）：help 或缺 token 或三模式（agents/objective/task）全无 → 用法 + exit 1。
2. `--agents`：`GET /v1/agents` 列出 agentId/status/version/endpoint（`:95-101`）。
3. `--task --cancel`：`POST /v1/tasks/<id>/cancel`（幂等 requestId=randomUUID，`:104-108`）。
4. `--objective`：构造任务（`taskId=task_<12hex>`、`requesterAgentId:'external-client'`、`targetAgentId` 默认 `profer-stable`（`:111`）、policy=`auto_deny`/禁委派/`read-shared`/`safe-to-retry`/1800s（`:122-130`））→ `POST /v1/tasks`（`protocolVersion:'1.0'`+requestId 幂等，`:135-141`）；打印 deduplicated 标记（`:143`）；`--no-wait` 即返回（`:144`）。
5. 订阅：`streamEvents(taskId, after)`（`:147-148`）——SSE 按 `\n\n` 分帧、`id:` 更新游标（`:84`）、`task.completed/failed/cancelled/expired` 四终态退出（`:87-89`）；随后 `GET /v1/tasks/<id>` 打印终态与 failureReason（`:150-151`），`GET …/result` 打印 summary+artifacts（`:153-159`）。

## 4. 调用者与调用链

入向：无代码调用（独立 CLI，`node scripts/agent-fabric-client.mjs`）；文档引用 `docs/plans/2026-09-27-profer-agent-fabric-design.md`、`agent-fabric-pair.mjs` 注释、`apps/electron/src/main/lib/agent-fabric/fabric-pairing.ts`（grep 命中为文档/注释性引用，非代码 import）。

出向：`node:crypto`（`:19`）、全局 fetch、目标 Fabric API（`/v1/agents`、`/v1/tasks*`）。

## 5. 数据 I/O、读写与副作用

网络：HTTP+SSE 对 `127.0.0.1:<port>`（默认 4788，`:22`）；输出 stdout；无盘写。副作用=提交任务（真实执行，policy auto_deny 限制动作）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| 用法 | 参数不足/help | 41-44 | 1/0 |
| API 失败 | 非 2xx | 56-59 | 1（main catch） |
| SSE 断流 | body done | 73-74 | 返回游标 |
| 终态退出 | 四事件 | 87-89 | - |
| 恢复 | 打印 `--task --after` 提示 | 147 | 手动 |

JSON 解析错（`:85`）直接冒泡→exit 1。断线恢复=人工用 `--after <lastSeq>` 重跑（`:147` 注释）。

## 7. 权限与权威状态

`--token` Bearer 即权限凭证（服务端鉴权；配对/授权模型见 agent-fabric-pair 手册与 fabric-pairing）；任务 policy 固定 `auto_deny`+禁委派（`:122-130`）是最小权限示例。本文件无本地权限检查。

## 8. 修改影响面

- 无代码消费者；作为协议参考实现，API 形状（taskId/requestId/after 游标/policy 字段）与服务端 `agent-fabric` 实现耦合。
- 修改示例 policy 会误导集成方（文档性质影响）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `agent-fabric-client` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行/真实 Fabric API。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 三模式全流程 | 已证实 | `:21-161` 逐行读 |
| 幂等 requestId/after 恢复语义 | 已证实 | `:135-147` |
| policy 最小权限默认 | 已证实 | `:122-130` |
| 无代码调用（文档/注释引用） | 已证实 | 全树检索（§4 范围） |
| 服务端 API 实现 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseArgs/call/streamEvents/main | §2-3 | 21-161 | covered |
| 三模式+恢复提示 | §3, §6 | 94-160 | covered |
| 权限/policy | §7 | 47, 122-130 | covered |
| 调用链 | §4 | - | covered |
| 运行期/服务端 | §10 | - | unknown（NOT_RUN/非本批） |
