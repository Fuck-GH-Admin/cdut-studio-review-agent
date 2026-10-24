---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-auditor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 51b408985137f6769d6cd387b46ae0244a8b15b7
sha256: 734410ad644103cdf8b3254693fdcdeddf2eaabea879a8c110f17d18fba6f988
lines: 151
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-auditor.test.ts

## 1. 测试目标

`longterm-memory-auditor.ts` 的静态单测：验证审核 system prompt 与主 Agent 上下文隔离、userPrompt 字段结构、用户原文 1200 字截断、裁决 JSON 的容错解析（围栏、闭合/未闭合思考块、非法字段），以及 `complete` 闭包成功/空响应/异常三条路径的降级。全部是纯函数/内存测试，无磁盘、无网络、无 Electron。

测试框架：`bun:test` 的 `describe/test/expect`（`:8`）。夹具是一个固定的 `candidate`（`:19-25`）：`coding_preference`、标题“状态管理统一用 Jotai”、内容“以后都用 Jotai 管理状态”、tags `['jotai']`、confidence 0.65。

## 2. 用例清单

3 个 `describe`，14 个 `test`。

### 2.1 `describe('审核提示词隔离')`（`:27-58`）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | `:28-37` | 固定 candidate + 用户消息 | `buildMemoryAuditPrompt` | `systemPrompt` 恒等 `MEMORY_AUDIT_SYSTEM_PROMPT`；不含 `CDUT Studio`、`<SYSTEM_CONTEXT>`、`<USER_REQUEST>`、`workspace`；`maxTokens===MEMORY_AUDIT_MAX_TOKENS` |
| 2 | `:39-47` | 同上 | 同上 | userPrompt 含 `- Category: coding_preference`、`- Title: …`、`- Content: …`、`- Tags: jotai`，以及完整 `<user_message_context>\n…\n</user_message_context>` |
| 3 | `:49-57` | 用户消息 `'x'.repeat(1200+200)` | 同上 | 含 1200 个 `x`；不含 1201 个 `x` |

### 2.2 `describe('审核裁决解析')`（`:60-110`）

| # | test 行 | 输入 | 断言 |
| --- | --- | --- | --- |
| 4 | `:61-66` | `{"approved": true, "reason": "durable rule"}` | 精确 `{status:'approved', reason:'durable rule'}` |
| 5 | `:68-73` | `{"approved": false, "reason": "one-time task"}` | 精确 `{status:'rejected', reason:'one-time task'}` |
| 6 | `:75-80` | `Verdict:\n```json\n{"approved": true, "reason": "ok"}\n```\nDone` | 精确 approved/ok |
| 7 | `:82-87` | `<think>long reasoning</think>{"approved": false, "reason": "question"}` | 精确 rejected/question |
| 8 | `:89-94` | `<think>budget exhausted before closing {"approved": true, "reason": "ok"}` | 精确 approved/ok |
| 9 | `:96-98` | `{"approved": true}` | 精确 `{status:'approved', reason:'审核通过'}` |
| 10 | `:100-102` | `{"approved": "yes", "reason": "x"}` | `status==='unavailable'` |
| 11 | `:104-109` | `null`、`'   '`、`'no json here'`、`'{"approved": tru'` | 四者 `status==='unavailable'` |

### 2.3 `describe('审核执行')`（`:112-151`）

| # | test 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 12 | `:113-127` | `complete` 捕获 `args` 并返回 approved JSON | `auditLongTermMemoryCandidate` | `verdict.status==='approved'`；`received.systemPrompt===MEMORY_AUDIT_SYSTEM_PROMPT`；`received.maxTokens===700` |
| 13 | `:129-137` | `complete` 返回 `null` | 同上 | `status==='unavailable'` |
| 14 | `:139-150` | `complete` 抛 `Error('network down')` | 同上 | `status==='unavailable'`；`reason` 含 `network down` |

## 3. 真实断言

- 断言的是**函数返回值/字符串包含关系**，没有 mock 模块、没有 spy、没有计时器、没有文件系统。
- 用例 8 的输入没有闭合 `</think>`；`REASONING_TAIL`（源 `:85`）不会命中，最终由首尾 `{`/`}` 提取 JSON。测试名“未闭合的思考前缀”描述的是模型输出形态，不是代码走了专门的未闭合分支。
- 用例 3 只断言“含 1200 个 x、不含 1201 个 x”，没有断言省略号 `…`，也没有断言截断后的总长度；源实现会追加 `…`（`:60-62`）。
- 用例 12 只断言 systemPrompt/maxTokens 透传，没有逐字断言 `userPrompt`；userPrompt 结构由用例 2 单独覆盖。
- 用例 13/14 只断言 `status`（14 还断言 reason 包含异常文本），没有断言完整 reason 文案。

## 4. 未覆盖与脆弱点

**未覆盖**：

- 真实模型调用、网络失败、10 秒超时（`agent-orchestrator.ts:829` 的 `timeoutMs`）与 AbortSignal 取消。
- `buildMemoryAuditPrompt` 的空消息（`(empty)`，源 `:75`）、空 tags（`none`，源 `:63`）、候选内容含换行/XML 的注入场景。
- `parseMemoryAuditVerdict` 的 `approved:false` 且缺 reason（源 `:121` 的“未通过审核”默认文案）。
- reason 超过 200 字符的截断（源 `:120`）、非英文字符计数。
- 多个 `think` 块、非 `json` 围栏（如 ` ```text `）、JSON 前后有多个大括号对象。
- `MEMORY_AUDIT_MAX_TOKENS` 是否足够思考模型（只在断言里比较常量，不验证真实预算）。

**脆弱点**：

- 用例 1 用字符串包含否定断言（`not.toContain('workspace')` 等），prompt 改写时容易误伤/漏检；它证明的是“当前文本没有这些词”，不是结构性隔离。
- 用例 8 的名称暗示“未闭合分支”，实际走通用大括号提取；若未来加入未闭合推理剥离，测试不会区分。
- 用例 14 的 reason 包含 `error.message`（源 `:140`），若实现改成固定文案，测试会失败但行为未必更差。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 共 3 个 describe、14 个 test | 已证实 | `:27,60,112`；`grep -c "test("` = 14 |
| 全部测试不触碰磁盘/网络/Electron | 已证实 | import 仅 `bun:test`、类型与三个函数（`:8-17`）；无 fs/fetch |
| system prompt 隔离断言是文本包含检查 | 已证实 | `:31-36` |
| 截断断言未检查省略号 | 已证实 | `:55-56` |
| 用例 8 无闭合标签，走首尾大括号提取 | 已证实 | 输入 `:90`；源 `:100-106` |
| 真实超时/取消行为 | 未知 | 未运行、未 mock 计时器 |

## 6. 覆盖表

| 源符号/分支 | 测试用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildMemoryAuditPrompt` system 隔离 | #1 | `:28-37` | covered |
| `buildMemoryAuditPrompt` userPrompt 结构 | #2 | `:39-47` | covered |
| 1200 字截断 | #3 | `:49-57` | partial（未断言省略号） |
| `parse` approved | #4 | `:61-66` | covered |
| `parse` rejected | #5 | `:68-73` | covered |
| 围栏/前后缀 | #6 | `:75-80` | covered |
| 闭合 think | #7 | `:82-87` | covered |
| 未闭合 think 前缀 | #8 | `:89-94` | covered（通用提取路径） |
| 缺 reason 默认文案 | #9 | `:96-98` | covered（仅 approved） |
| approved 非布尔 | #10 | `:100-102` | covered |
| 空/非法 JSON | #11 | `:104-109` | covered |
| `complete` 成功透传 | #12 | `:113-127` | covered |
| `complete` null | #13 | `:129-137` | covered |
| `complete` 抛错 | #14 | `:139-150` | covered |
| 真实超时/取消/网络 | — | — | unknown（NOT_RUN） |
