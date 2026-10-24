---
path: apps/electron/src/main/lib/review/review-v3-execution-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a12de582b376f3ea6fa83c34e990aaaeebee1ba
sha256: a4c37fb6b15ab5d719385dd22f0197c5892fc91ed837e543422fa40050bc9948
lines: 130
kind: test
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-execution-contract.test.ts

## 1. 测试目标

验证 C 拥有 CR-A-001 提案边界 `validateV3ExecutionProposal`/`executionProposalId`（`review-v3-execution-contract.ts`）：new/replay 语义、fail-closed 各分支、C0 冒充拒绝、terminal 仅技术状态。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 7（`test(` :62/:70/:80/:91/:96/:111/:117），1 describe（:61）。公共 fixture（:11-59）：source/run/plan 字面量（`REVIEW_C0_SCHEMA_VERSION`）、`ctx(receipt)` 上下文工厂（nextSequence 1/committedDigests 空）、check/read 事件构造器（eventId 经 `executionProposalId` 真实计算）。

| # | 用例（行） | 动作 | 断言 |
| --- | --- | --- | --- |
| 1 | new+replay（:62） | 合法 check 事件；随后 committedDigests 记入、nextSequence=2 | `'new'`（:66）、同事件 `'replay'`（:68） |
| 2 | 换体/丢 digest fail-closed（:70） | 改 body 重放；清空 committedDigests | 均 `toThrow()`（:76/:78） |
| 3 | read 物理身份（:80） | 合法 read；extent 换 full-document；activeSourceVersionIds 清空；spoof rawSha256 重算 eventId | `'new'`（:82）、后三者 `toThrow()`（:84/:87/:89） |
| 4 | unknown applicability（:91） | binding applicability 改 unknown | `toThrow()`（:94） |
| 5 | grant/revision/sequence 严格（:96） | grantActive false；caseRevision 3；eventId 伪造；sequence 2 | 均 `toThrow()`（:99/:102/:105/:109-110） |
| 6 | C0 冒充（:111） | 用 `REVIEW_C0_SCHEMA_VERSION` 形状对象 cast | `toThrow()`（:115） |
| 7 | terminal 仅技术（:117） | 合法 terminal；回执 terminalStatus 改 failed | `'new'`（:125）、`toThrow()`（:128） |

依赖顺序：独立（每用例自建 ctx）。

## 3. 真实断言

- `:66`/`:68`：`expect(validateV3ExecutionProposal(event, t)).toBe('new'/'replay')`。
- `:76`/`:78`/`:84`/`:87`/`:89`/`:94`/`:99`/`:102`/`:105`/`:109-110`/`:115`/`:128`：`expect(() => …).toThrow()`（无消息断言）。
- `:82`：`toBe('new')`；`:125`：`toBe('new')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`nextSequence` 缺失（RECOVERY_REQUIRED）分支、`committedDigests` 错配的错误消息内容、check `same` 的字段级负例、`executionProposalId` 稳定性独立断言（仅作 fixture 工具）。
- 脆弱点：`toThrow()` 无消息匹配（错误类型/码变化仍绿）；fixture 以 `as unknown as` 构造 C0 冒充对象（:112-114），形状漂移可能假绿。
- mock 边界：纯函数 + 字面量 fixture，无 mock 框架。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例计数与 `test(` 一致 | 已证实 | :62-117 |
| 断言行如 §3 | 已证实 | 逐行读 :62-129 |
| new/replay/换体/冒充/terminal 语义被断言 | 已证实 | #1-#7 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| new/replay | #1 | covered |
| 换体/丢 digest | #2 | covered |
| read 三负例 | #3 | covered |
| applicability/grant/revision/序列 | #4/#5 | covered |
| schema 冒充 | #6 | covered |
| terminal 回执 | #7 | covered |
| nextSequence 缺失/错误消息 | — | unknown |
