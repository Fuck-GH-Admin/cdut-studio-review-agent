---
path: apps/electron/src/renderer/lib/agent-message-queue.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7b16d7840d42d0411055eb6c21627abeaed1e1ab
sha256: 5ceccb176d7c20bd0d60eb531eb9fd639de362a8fe721e3282c73708530fc072
lines: 52
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-message-queue.test.ts

## 1. 测试目标

队列生命周期错误识别/epoch 恢复/mention 解析。不运行（`NOT_RUN`）。

## 2. 用例清单

5 用例（:7/:14/:22/:35/:41），1 describe「queue target lifecycle errors」（:6）：
1. 仅「会话未运行」为可恢复竞态（:7）。
2. owner run 活跃识别（含 IPC 包装）（:14）。
3. **回归**：Electron 包装前缀仍识别（:22）。
4. 仅同未 Stop epoch 恢复 in-flight（:35）。
5. 保留引用选区 payload+mention 解析（:41）。

## 3. 真实断言

- :7-12：isQueueTargetNoLongerActiveError 仅对「会话未运行」文案 toBe true。
- :14-20：isAgentRunAlreadyActiveError 对 AGENT_RUN_ALREADY_ACTIVE（含 IPC 包装）toBe true。
- :22-33：回归——Electron 包装前缀错误仍 toBe true（stripIpcErrorPrefix 语义）。
- :35-39：shouldRestoreQueuedMessageAfterFailure 仅同未 Stop epoch toBe true。
- :41-50：buildQueuedMessageSendPayload toEqual 保留 quotedSelection+mentions 解析。

## 4. 未覆盖与脆弱点

mock 边界：Error fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 错误识别/epoch/mention | 5 用例 | covered |
