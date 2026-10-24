---
path: apps/electron/src/main/lib/review/pi-review-agent-client.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0833a91c2143e3ddaa9c895178f0a1f3152f9573
sha256: 8cfff00e5188ce446836e7232c7e6d1c569044c5bc96b252f272ad1d88ec3d12
lines: 216
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-agent-client.test.ts

## 1. 测试目标

`createPiReviewModelClient` 的工具终止判定、兜底语义、图像降级、超时/取消与 Pi 会话参数（describe :6）。mock 边界：`loadSdk` 返回 fake `{defineTool}`（透传定义），`query` 为手写异步生成器模拟 Pi 运行时流；**无真实 SDK/网络**。

## 2. 用例清单

8 个 test 声明 / 1 describe（其中 `test.each` ×3 参数 = 10 运行用例）：

| # | 用例 | 行 | 要点 |
| --- | --- | --- | --- |
| 1 | 批量内检查被拒不终止工具轮 | 7-38 | |
| 2 | requiredToolKeys 全到齐才提前结束 | 40-64 | |
| 3 | 非终止工具不误判为完成 | 66-92 | |
| 4 | 服务超时 → 人工待办兜底 | 94-110 | |
| 5 | 三种带图失败 → 纯文本重试（each×3） | 112-140 | |
| 6 | retryWithoutImages:false 不重试 | 142-158 | |
| 7 | review profile 注册受控工具+视觉透传 | 160-199 | |
| 8 | query 无事件时限结束并取消上游 | 201-215 | |

## 3. 真实断言

- 1：`terminateHint` `toBeUndefined()`、`content==='{"ok":true}'`（:36-37）。
- 2：`terminateHints` `toEqual([undefined, true])`（:63）。
- 3：`rejects.toThrow('没有返回可用的结构化结果')`（:91）。
- 4：兜底 `opinion` 含 `'本轮未得到可核验的模型结论'`（:109）。
- 5：`{content:'{"ok":true}', imagesDropped:true}`、`imageFailureReason` 含 `'带图请求失败'`、observedImages `toEqual([[img], []])`、第二次 prompt 含 `'图像事实一律待人工核对'`（:135-138）。
- 6：原错 `502…` 重抛、observedImages 仅一次带图（:156-157）。
- 7：`client.runtime==='pi'`、`protocol==='ollama-chat'`、`observed.toolProfile==='review'`、`agentRuntime==='pi'`、customTools 仅 `['read_rule']`、images 透传、`toolCalls` `toEqual(['read_rule'])`（:189-198）。
- 8：耗时 `<500ms`、`aborted===true`、兜底 opinion 同 4（:212-214）。

## 4. 未覆盖与脆弱点

- 未覆盖：`REVIEW_TOOL_RESULT_FALLBACK`（工具执行后无摘要）分支、`assistant.error` 分支、`result` subtype≠success 分支、真实 SDK 加载、`context1m/contextWindow/maxTokens` 透传。
- 脆弱点：`test.each` 参数化与文案子串断言；fake `defineTool` 透传掩盖真实 ToolDefinition 类型差异；超时用例 15ms 依赖机器时序（<500ms 上限缓冲）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 声明/10 用例断言如 §2-3 | 已证实 | 本文件逐行 |
| mock 边界=SDK/运行时全 fake | 已证实 | :15/:16-23 等 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 终止判定（拒绝/requiredToolKeys/非终止） | §3 | 36-91 | covered |
| 超时兜底 | §3 | 109 | covered |
| 图像降级/禁降级 | §3 | 135-157 | covered |
| 会话参数/工具注册 | §3 | 189-198 | covered |
| 无事件超时+abort | §3 | 212-214 | covered |
| TOOL_RESULT_FALLBACK/assistant.error | §4 | — | unknown（未测） |
