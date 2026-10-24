---
path: apps/electron/src/main/lib/agent-send-coordinator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6b20ec9d9814db451c329b000b660417f1fceba
sha256: b1ad0357d6be413a3d474e7f44b7139d00057da7f4dfa4cfc6dd744f14aea9ad
lines: 32
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-send-coordinator.ts

## 1. 结论与边界

SEND_MESSAGE **协调器**（32 行薄文件）：在任何镜像或 Agent 副作用前执行可信绑定校验（`:15`）；**先同步启动编排器原子占用 active session，再等镜像**——避免 runtime 切换落在 mirror await 与 Agent 启动之间的空窗（`:24-25` 注释）；隐藏草稿会话须等用户消息落盘晋升后才建外部镜像（`:27`）。依赖注入式纯编排。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `Dependencies`（内部类型） | 类型 | `:4` | getSession/workspaceExists/getChannel/validatePreset?/startMirror/startAgent/onMirrorError——`startAgent` 注释"在任何 await 前占用会话"（`:10-11`） |
| `coordinateAgentSend` | 函数 | `:16` | `(input, deps): Promise<void>` |

## 3. 内部逻辑与关键流程

（`:16-32`）：getSession→workspaceExists 融合（无 workspaceId 视为存在，`:18`）→ `validateAgentSendBinding` 失败抛 `${code}: ${message}`（`:19-20`）→ session 缺再抛 AGENT_SESSION_NOT_FOUND（`:21`，防御冗余）→ `validatePreset?.`（`:22`）→ **`const agentRun = deps.startAgent()` 先同步启动**（`:26`）→ `!session.draft` 才 `startMirror`（失败转 `onMirrorError` 不中断，`:28-30`）→ `await agentRun`（`:31`）。

## 4. 调用者与调用链

- 入向：ipc.ts SEND_MESSAGE 链（域外，grep）；测试 `agent-send-coordinator.test.ts` 4 用例。
- 出向：`./agent-send-binding`（`:2`，本批）。

## 5. 数据 I/O、读写与副作用

无直接 I/O；副作用经 deps（startMirror/startAgent 由调用方注入）。

## 6. 分支、失败、取消与恢复

绑定失败→抛（零副作用，calls 空）；镜像失败→onMirrorError 记录后 Agent 继续；draft→跳过镜像。无取消。

## 7. 权限与权威状态

校验先于副作用（fail-fast）；运行占用权威=orchestrator active session（startAgent 先行的顺序即保证）。

## 8. 修改影响面

SEND_MESSAGE 主链编排；顺序语义（run 先于 mirror）被测试锁定（`['run','mirror']`）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-send-coordinator.test.ts`（49 行/**4 个 `test(`**）：校验失败不启动镜像/Agent（`:26-30`，`calls` `toEqual([])`）；合法绑定先 run 后 mirror（`:32-36`，`['run','mirror']`）；镜像失败记录后仍运行（`:38-42`，`['run','mirror-error']`）；draft 只 run（`:44-48`，`['run']`）。mock 边界：deps 全为记录替身。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 顺序语义/四分支 | 已证实 | `:1-32` 全文 + 4 测试互证 |
| orchestrator 占用语义 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+流程 | §2/§3 | 4-31 | covered |
| 测试 4 用例 | §9 | test 文件 | covered（NOT_RUN） |
