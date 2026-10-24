---
path: apps/electron/src/renderer/lib/agent-running-indicator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3fa8466b55f75f64f7ceaa15f2a1025797ffde91
sha256: b2f811b3087c2353147ff3d7d32af5ea1c8b1a46f4995ab1744a3d5a7e37b30c
lines: 26
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-running-indicator.ts

## 1. 结论与边界

**Agent Running 视觉指示器判定纯函数**（26 行）：唯一职责是决定「Agent Running」计时指示器是否显示，与终态错误卡互斥（`agent-running-indicator.ts:9-14` 注释）。边界：STREAM_COMPLETE 仍是释放会话运行锁的唯一权威信号（`agent-running-indicator.ts:12`），本文件不参与任何状态写入。

## 2. 导出与关键符号

导出 1 个函数、0 常量、0 类型：`shouldShowAgentRunningIndicator`（`agent-running-indicator.ts:15`）。内部符号 1 个：`interface AgentRunningIndicatorState`（`agent-running-indicator.ts:3`，内部，含 streaming/streamError?/liveMessages? 三字段）。

## 3. 内部逻辑与关键流程

单函数（`agent-running-indicator.ts:15-26`）：`:20` 短路——`!streaming || streamError` 为真直接返回 false；`:22-25` 对 `liveMessages?.some(...)` 检查是否存在 `type === 'assistant' && record.error != null` 的消息，取反返回；`liveMessages` 缺省时 `?? false` 兜底使 `some` 结果为 false，整体返回 true。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/agent/AgentMessages.tsx:45` import、`:799` 调用（传 streaming/streamError/liveMessages）；测试 `apps/electron/src/renderer/lib/agent-running-indicator.test.ts:3` import。
- 出向：`import type { SDKMessage }` from `@profer/shared`（`agent-running-indicator.ts:1`，仅类型）。
- 动态调用：未知；检索方式——冻结树 `apps/electron/src` 全树 `*.ts/*.tsx/*.cjs` grep `agent-running-indicator|shouldShowAgentRunningIndicator`，未见 import()/require() 动态装载，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

纯函数：无模块级状态/缓存/Map，无事件订阅、DOM、toast、窗口副作用；只读入参对象，返回 boolean。

## 6. 分支、失败、取消与恢复

- `!streaming` → false（`agent-running-indicator.ts:20`）；`streamError` 非空 → false（同）。
- `liveMessages` 含 assistant 错误消息 → false（`agent-running-indicator.ts:22-25`）；无错误或 `liveMessages` 缺省 → true。
- 无 throw、无异步、无取消路径。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威注释：STREAM_COMPLETE 是运行锁权威，本函数仅控视觉（`agent-running-indicator.ts:12-13`）。

## 8. 修改影响面

`apps/electron/src/renderer/components/agent/AgentMessages.tsx` 的 running 指示器渲染判定；改动判定条件直接影响错误卡与指示器互斥体验。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。间接证据：`apps/electron/src/renderer/lib/agent-running-indicator.test.ts` 3 个 test（grep `test(` 计数=3），如 `:16-19` expect true、`:23-27` expect false（streamError）、`:31-34` expect false（assistant error）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 短路与互斥判定逻辑 | 已证实 | `agent-running-indicator.ts:20-25` |
| AgentMessages 消费点 | 已证实 | `AgentMessages.tsx:45,799` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| shouldShowAgentRunningIndicator | §2/§3/§6 | 15-26 | covered |
| AgentRunningIndicatorState | §2 | 3-7 | covered |
