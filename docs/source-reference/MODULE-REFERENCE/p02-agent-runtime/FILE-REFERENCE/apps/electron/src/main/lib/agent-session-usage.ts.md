---
path: apps/electron/src/main/lib/agent-session-usage.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aaef66305d9bddaff4abfb4f418f9ffe15d6b462
sha256: 325a5eee1ad0ea6b7c8b681e1cfa9864ad90044b99753070470982304abccca3
lines: 107
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-usage.ts

## 1. 结论与边界

Agent 会话上下文占用率读取（头注释 :1-21）：automation 调度器 daily 模式据此决定切新会话；数据取会话 JSONL 尾部最后一条带 usage 消息（result 优先）；**已用 token 口径=input+cache_read+cache_creation**（:14-17 注释：只取 input 会严重低估，daily 安全阀失效）；尾部反向惰性解析（:19-20，高频任务数百次/天）。

## 2. 导出与关键符号

导出 2 条（`export` :49/:105）：`getSessionContextUsageRatio(sessionId)`（:49-94）、`pickResultContextWindow(result)`（:105-107，委托 `resolveContextWindowFromModelUsage(modelUsage, _channelModelId)`，注释 :96-103：SDK 0.3.142+ 多模型 entry 优先主模型 ID 匹配/再取最大窗口防子 agent 小窗误导）。内部：`sumUsedTokens`（:41-47）。

## 3. 内部逻辑与关键流程

（:49-94）：文件不存在/readFile 失败→undefined（:51-58）；尾部反向逐行（:62）：坏行跳过（:67-71）；`result`→usage+pickResultContextWindow（:75-81）；`assistant`→message.usage+inferContextWindow(model)（:83-90）；都无→undefined（:93，调度器按「保守复用」处理 :12）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `automation-scheduler.ts:40` → 调用 `:157`；测试 `agent-session-usage.test.ts:4`。否定：`pickResultContextWindow` 无外部消费者（模块内 :79+测试）。出向：`@profer/shared`（:23-27）、`node:fs`、`./config-paths`（:30）。

## 5. 数据 I/O、读写与副作用

只读会话 JSONL；无写。性能敏感（惰性解析）。

## 6. 分支、失败、取消与恢复

缺失/损坏→undefined 降级；不适用取消/恢复。

## 7. 权限与权威状态

token 口径与渲染层一致为权威（:14-15）。

## 8. 修改影响面

automation daily 安全阀；渲染层口径同步。需同步测试（37 行）。

## 9. 测试证据

`agent-session-usage.test.ts`（批内，37 行）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；口径/惰性解析 | 已证实 | :14-20/:41-94 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+解析链 | §2/§3 | :41-107 | covered |
