---
path: apps/electron/src/main/lib/pi-execution-ledger.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 622d48b55444f6453831a2caede55d5905d569b3
sha256: 5bdfa5ffeb97c9d8d817f0871fa5cd43c5eb6ae8f1df8eb6ea3d204fcbbc7dd9
lines: 26
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-execution-ledger.ts

## 1. 结论与边界

Pi 工具调用（toolCallId → 命令结果）的内存账本（26 行，注释 `:3-6`）：每个 tool call 在 tool_result 到达前暂存一条结构化命令结果；orchestrator 拥有生命周期，merge 后删除。纯内存 Map 封装，无持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CommandExecutionLedger` | 接口（导出） | 7-11 | `{set(toolCallId, result): void; get(toolCallId): CommandExecutionResult \| undefined; delete(toolCallId): void}` | 账本契约 |
| `createCommandExecutionLedger` | 函数（导出） | 13-25 | `() => CommandExecutionLedger` | Map 实现工厂 |

导出合计 2。`CommandExecutionResult` 类型来自 `./command-execution`（`:1`，跨批形状未深读）。

## 3. 内部逻辑与关键流程

工厂闭包持 `Map<string, CommandExecutionResult>`（`:14`），三个方法一一转发 `Map.set/get/delete`（`:16-24`）。无容量限制、无过期、无异常路径（`get` 缺失返回 `undefined`）。

## 4. 调用者与调用链

- 入向（全冻结树检索 `createCommandExecutionLedger`/`pi-execution-ledger`）：
  - `lib/agent-orchestrator.ts:130`（import）→ `agent-orchestrator.ts:1028` `const executionResultsByToolUse = createCommandExecutionLedger()`（每轮编排创建一个账本实例）。
  - `lib/pi-execution-ledger.integration.test.ts:5`（批内集成测试，`pi-execution-ledger.integration.test.ts:27`/`pi-execution-ledger.integration.test.ts:83` 两处实例化）。
  - `lib/agent-goal-runtime-bridge.test.ts:62`：mock 形状 `createCommandExecutionLedger: () => new Map()`（对该依赖的替身，间接印证接口被 Map 兼容实现替代的可行性）。
- 出向：类型 `CommandExecutionResult`（`:1`）。无模块级副作用。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：全文仅 Map 操作）。状态=闭包内 Map（进程内存）；生命周期由调用方控制（orchestrator merge 后 delete，注释 `:3-6`）。无并发原语（单线程事件循环；异步交错下 Map 无锁但读写粒度为单次调用）。

## 6. 分支、失败、取消与恢复

无分支（不适用，依据：`:13-25` 无条件语句）。不 throw；`get` 缺失返回 `undefined`（`:20-21`）。恢复：不适用（无持久状态；进程重启后账本丢失——`pi-background-task-manager` 的 hydrate 机制不覆盖本账本，〔证实〕两者无共享代码）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；按 toolCallId 隔离数据（键即隔离维度），权威性由 orchestrator 写入/删除顺序保证（注释 `:3-6`）。

## 8. 修改影响面

- 影响 `agent-orchestrator.ts:1028` 起的命令结果合并流程（tool_result 与执行结果配对）；接口形状变化会波及 `pi-execution-ledger.integration.test.ts` 与 `agent-goal-runtime-bridge.test.ts:62` 的 mock。
- 与 `./command-execution` 的 `CommandExecutionResult` 类型联动（跨批）。

## 9. 测试证据

直接测试：`lib/pi-execution-ledger.integration.test.ts`（批内，见该文件手册）。断言面：两个 Bash toolCallId 的结果保持隔离（`pi-execution-ledger.integration.test.ts:27` 实例）、账本结构形状 set/get/delete（`pi-execution-ledger.integration.test.ts:83` 实例）；另有 `agent-goal-runtime-bridge.test.ts:62` 的 mock 间接证据。

`NOT_RUN`：本轮未运行 bun test（集成测试依赖真实 tool 定义，断言≠已运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 接口/工厂/Map 转发实现 | 已证实 | `:1-26` 全文逐行 |
| 入向=agent-orchestrator.ts:1028 + 批内测试 + 1 mock | 已证实 | 全树检索（§4） |
| `CommandExecutionResult` 字段形状 | 边界（跨批） | `:1` 引入 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CommandExecutionLedger` 接口 | §2 | 7-11 | covered |
| `createCommandExecutionLedger` | §2/§3 | 13-25 | covered |
| 调用者/mock 边界 | §4/§8 | - | covered |
