---
path: apps/electron/src/main/lib/agent-ask-user-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1bb7c695f8bc271c19031830c4d77ab2ae7dc6d1
sha256: 975d2e1e885184a94297463a4b313f47c19f8de3e3f91ade7ef29961468fc2e5
lines: 74
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-ask-user-service.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-ask-user-service.ts` 的题型归一化 `normalizeAskUserQuestionType`（4 分支）与 `handleAskUserQuestion` 闭环（平铺单题解析、空题熔断）。不运行测试，只读断言（`NOT_RUN`）。

## 2. 用例清单

用例数 7（`test(` 计数：:5/:11/:17/:22/:29/:51/:64），2 个 describe（:4/:28）。逐条：

| # | 用例（行） | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | 显式合法 type 优先（:5） | — | 调 `normalizeAskUserQuestionType('single',3,false)` 等 3 次 | `toBe('single'/'multiple'/'fill-blank')`（:6-8） |
| 2 | 缺省 type 降级（:11） | — | `(undefined,0,false)`/`(undefined,3,true)`/`(undefined,3,false)` | `toBe('fill-blank'/'multiple'/'single')`（:12-14） |
| 3 | 非法 type 不信任（:17） | — | `('essay',3,true)`/`(42,0,false)` | `toBe('multiple'/'fill-blank')`（:18-19） |
| 4 | 选择题缺 options 降级填空（:22） | — | `('single',0,false)`/`('multiple',0,true)` | 均 `toBe('fill-blank')`（:23-24） |
| 5 | 平铺单题解析（:29） | AbortController + 捕获回调 | `handleAskUserQuestion('session-flat', {question, options:[A,B]}, …)` | questions 是数组且长度 1、question 文本、`options.map(label)` toEqual `['A','B']`（:40-44）；收尾 `controller.abort()` 后 `await pending`（:47-48） |
| 6 | 空题熔断（:51） | notified 标志 | `handleAskUserQuestion('session-empty', {}, …)` | `result.behavior==='deny'`、`notified===false`（:60-61） |
| 7 | 空 questions 数组熔断（:64） | — | `{questions: []}` | `result.behavior==='deny'`（:72） |

依赖顺序：用例 5 依赖 `sendToRenderer` 同步捕获（`handleAskUserQuestion` 先登记再通知，捕获发生在调用内）；用例间共享全局单例 `askUserService`（:2 import 真身），用例 5 用 abort 清理 pending（:47）避免泄漏给后续。

## 3. 真实断言

- `:6-8`：`expect(normalizeAskUserQuestionType('single', 3, false)).toBe('single')` 等 3 行。
- `:12-14`：`expect(normalizeAskUserQuestionType(undefined, 0, false)).toBe('fill-blank')` 等 3 行。
- `:18-19`：`expect(normalizeAskUserQuestionType('essay', 3, true)).toBe('multiple')`、`expect(normalizeAskUserQuestionType(42, 0, false)).toBe('fill-blank')`。
- `:23-24`：`expect(normalizeAskUserQuestionType('single', 0, false)).toBe('fill-blank')`、`expect(normalizeAskUserQuestionType('multiple', 0, true)).toBe('fill-blank')`。
- `:40-44`：`expect(Array.isArray(capturedQuestions)).toBe(true)`、`expect(capturedQuestions).toHaveLength(1)`、`expect(first.question).toBe('选哪个方案？')`、`expect(first.options.map((o) => o.label)).toEqual(['A', 'B'])`。
- `:60-61`：`expect(result.behavior).toBe('deny')`、`expect(notified).toBe(false)`。
- `:72`：`expect(result.behavior).toBe('deny')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`respondToAskUser`（answers 注入 `updatedInput` 形状、二次调用返回 null）、`getPendingRequests`、`clearSessionPending`、abort 竞态（应答与 abort 同时）、`parseSingleQuestion` 的 preview/placeholder 截断与空 label 过滤、rendererToolInput 浅拷贝语义。
- 脆弱点：用例 5 依赖 `handleAskUserQuestion` 同步调用 `sendToRenderer`（实现 :106 先登记再通知且同步）；若实现改为异步通知，捕获断言会假红。用例 5 用 abort 作为清理手段，若 abort 处理改动，可能残留 pending 影响全局单例（测试未重置单例）。
- mock/真实边界：被测为真身单例；`sendToRenderer` 是捕获替身；无 Electron/IPC/SDK。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例计数与 `test(` 一致 | 已证实 | :5/:11/:17/:22/:29/:51/:64 |
| 断言行如 §3 | 已证实 | 逐行读 :6-72 |
| 归一化 4 分支被断言 | 已证实 | :6-24 |
| 平铺单题兼容被断言 | 已证实 | :40-44 |
| 空题熔断不通知渲染层被断言 | 已证实 | :60-61 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测符号/分支 | 用例 | 状态 |
| --- | --- | --- |
| `normalizeAskUserQuestionType` 4 分支 | #1-#4 | covered |
| `handleAskUserQuestion` 平铺解析 | #5 | covered |
| `handleAskUserQuestion` 熔断 | #6/#7 | covered |
| `respondToAskUser`/`clearSessionPending`/`getPendingRequests` | — | unknown（无用例） |
| abort 竞态 | #5 仅清理用 | unknown |
