---
path: apps/electron/src/renderer/lib/agent-live-message-upsert.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d2e14ad9ddec9dee52b2662b0b316b96844cd9a4
sha256: fbe822faee4603ca8e60779d05739d31fe5551f610e520400db25e9cb65f26d4
lines: 40
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-live-message-upsert.ts

## 1. 结论与边界

实时消息按 UUID 写入转录（头注释 :2-7）：Pi 对同助手回复持续发 `_partial` 累计帧最后同 UUID final——**不能沿用「UUID 同即丢弃」**；任一侧 partial 时最新帧覆盖，仅 final→final 去重。

## 2. 导出与关键符号

导出 2 条（`export` :8/:17）：`LiveMessageWithUuid`（:8-11）、`upsertLiveMessageByUuid<T>(current, incoming)`（:17-40）。

## 3. 内部逻辑与关键流程

无 uuid 追加（:23）；未命中追加（:28）；**任一 partial→原位覆盖**（:33-37）；final→final 丢弃（:39）。

## 4. 调用者与调用链

入向：实时消息事件链。出向：无。

## 5-7. 数据/分支/权限

纯函数；不适用。

## 8. 修改影响面

- 消费面：live 转录更新。
- 依赖面：_partial 帧协议。
- 需同步测试：`agent-live-message-upsert.test.ts`（41 行）。

## 9. 测试证据

`agent-live-message-upsert.test.ts`（批内）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；partial 覆盖契约 | 已证实 | :2-7/:33-39 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+upsert 三分支 | §2/§3 | :17-40 | covered |
