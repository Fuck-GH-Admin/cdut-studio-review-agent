---
path: apps/electron/src/renderer/lib/agent-autosend-turn.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d8a35796839bfe44fd788b1ef26e32e4142ab590
sha256: c26444ee14cd6bb4edefd0d330f0cd9e02875dbb50594fd4226940d580a9f78c
lines: 56
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-autosend-turn.ts

## 1. 结论与边界

队列「轮结束」信号决策纯函数（头注释 :2-6）：轮结束用版本号表示（running 下降沿 +1）；consumedVersion 记已消费；**空闲队列可自行启动**，不依赖组件捕获下降沿。

## 2. 导出与关键符号

导出 4 条（`export` :8/:11/:25/:41）：`AutoSendTurnDecision`（:8，send/defer/consume/idle）、`shouldStartAutoSendFromIdle(state)`（:11-23）、`evaluateAutoSendTurn(state)`（:41-56）。`AutoSendTurnState`（:25-39）。

## 3. 内部逻辑与关键流程

`evaluateAutoSendTurn` 七步判定（:41-56）：开关关→consume（仍消费防陈旧信号 :42-43）；空闲可发→send（:44-45）；无新信号→idle（:47）；live 未清→defer（不消费 :48-49）；队列空→consume（:51）；停止/运行中/不可发→consume（:53）；否则 send（:55）。

## 4. 调用者与调用链

入向：队列自动发送 effect。出向：无。

## 5-7. 数据/分支/权限

纯函数；七步状态机。

## 8. 修改影响面

- 消费面：队列自动发送。
- 依赖面：turnVersion 协议。
- 需同步测试：`agent-autosend-turn.test.ts`（142 行）。

## 9. 测试证据

`agent-autosend-turn.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 4 条；七步判定 | 已证实 | :41-56 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+状态机 | §2/§3 | :8-56 | covered |
