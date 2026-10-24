---
path: apps/electron/src/main/lib/agent-end-reason.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f574403231bfa5c6a0c4357cfd1e43309d3942b1
sha256: 079f55292cb56384baf0b176ebdb4bcd2dfd1941f0fc3c9710c1469080303fd2
lines: 125
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-end-reason.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-end-reason.ts`：`normalizeAgentEndReason` 全分支（优先级链 10 出口）与 `AGENT_END_REASON_LABELS` 一致性（覆盖全部枚举、completed 空串、输出 label 与表一致）。文件头注释声明对应 design.md 4.1 单元测试表。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 16（`test(` 计数：:13/:19/:24/:30/:36/:42/:48/:53/:58/:63/:69/:74/:91/:97/:101/:107），2 个 describe（:12/:80）。

describe「normalizeAgentEndReason」（12 用例）：

| # | 用例（行） | 动作（输入） | 断言 |
| --- | --- | --- | --- |
| 1 | 用户停止优先（:13） | `{stoppedByUser:true, resultSubtype:'success'}` | reason `stopped_by_user`、label `已被用户中断`（:15-16） |
| 2 | success→completed（:19） | `{resultSubtype:'success'}` | `completed`（:21） |
| 3 | max_tokens（:24） | `{resultSubtype:'max_tokens'}` | `max_tokens` + label `已中断：达到长度上限`（:26-27） |
| 4 | error_max_turns（:30） | `{resultSubtype:'error_max_turns'}` | `max_turns` + label（:32-33） |
| 5 | error_max_budget_usd（:36） | 同法 | `max_budget` + label（:38-39） |
| 6 | error_during_execution（:42） | 同法 | `error` + label `执行出错`（:44-45） |
| 7 | hasError（:48） | `{hasError:true}` | `error`（:50） |
| 8 | subtype 优先于 hasError（:53） | `{resultSubtype:'error_max_turns', hasError:true}` | `max_turns`（:55） |
| 9 | 级联取消专用文案（:58） | `{resultSubtype: DELEGATION_CANCELLED_RESULT_SUBTYPE}` | `toEqual({reason:'unknown', label:'因父会话停止而取消'})`（:59-60） |
| 10 | 未知 subtype（:63） | `{resultSubtype:'some_future_subtype'}` | `unknown` + label `任务中断`（:65-66） |
| 11 | 空输入防御（:69） | `{}` | `completed`（:71） |
| 12 | 空串 subtype 防御（:74） | `{resultSubtype:''}` | `completed`（:76） |

describe「AGENT_END_REASON_LABELS 一致性」（4 用例，`reasons` 7 枚举数组 :81-89）：

| # | 用例（行） | 动作 | 断言 |
| --- | --- | --- | --- |
| 13 | 表覆盖全部枚举（:91） | 遍历 7 reason | `toBeTypeOf('string')`（:93） |
| 14 | completed 空串（:97） | — | `toBe('')`（:98） |
| 15 | 非 completed 非空（:101） | 遍历 6 reason | `length > 0`（:103） |
| 16 | 输出 label 与表一致（:107） | 9 组输入逐一归一化（:108-118） | reason 与 label 双断言（:121-122） |

依赖顺序：独立（纯函数）。

## 3. 真实断言

- `:15-16`：`expect(result.reason).toBe('stopped_by_user')`、`expect(result.label).toBe('已被用户中断')`。
- `:21`：`expect(result.reason).toBe('completed')`。
- `:26-27`：`expect(result.reason).toBe('max_tokens')`、`expect(result.label).toBe('已中断：达到长度上限')`。
- `:32-33`/`:38-39`/`:44-45`：同构 reason+label 对。
- `:50`：`expect(result.reason).toBe('error')`。
- `:55`：`expect(result.reason).toBe('max_turns')`。
- `:59-60`：`expect(normalizeAgentEndReason({...})).toEqual({ reason: 'unknown', label: '因父会话停止而取消' })`。
- `:65-66`：`unknown` + `任务中断`。
- `:71`/`:76`：`toBe('completed')`。
- `:93`：`expect(AGENT_END_REASON_LABELS[reason]).toBeTypeOf('string')`。
- `:98`：`expect(AGENT_END_REASON_LABELS.completed).toBe('')`。
- `:103`：`expect(AGENT_END_REASON_LABELS[reason].length).toBeGreaterThan(0)`。
- `:121-122`：`expect(result.reason).toBe(expected)`、`expect(result.label).toBe(AGENT_END_REASON_LABELS[expected])`。

## 4. 未覆盖与脆弱点

- 未覆盖：orchestrator 侧 `effectiveSubtype` 合成（agent-orchestrator.ts:3595-3596）、`DELEGATION_CANCELLED_RESULT_SUBTYPE` 与 registry 的集成链、真实 SDK result subtype 的取值面（测试用字面量）。
- 脆弱点：用例 16 的期望表（:108-118）与实现优先级独立维护——实现加分支时两处需同步；用例 9 依赖常量字面量（import 自被测文件 :8），若常量值改动断言跟随改动，不锁外部契约（registry:45 的字符串契约未在此锁）。
- mock/真实边界：纯函数直调，无 mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例计数与 `test(` 一致 | 已证实 | :13-107 |
| 断言行如 §3 | 已证实 | 逐行读 :14-123 |
| 优先级链全出口被断言（含冲突场景 #8/#9） | 已证实 | #1-#12 |
| label 表三性质被断言 | 已证实 | #13-#15 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 10 出口归一化 | #1-#12 | covered |
| label 表一致性 | #13-#16 | covered |
| orchestrator 合成输入/registry 集成 | — | unknown |
