---
path: apps/electron/src/main/lib/review/review-run-graph.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0ae690dec60c081f3d5c5f4ff39af324bc74c435
sha256: 26b449f18a41a3f3ccc34bad71a1785029ad76c5239a61b1995961372fdb2fa1
lines: 99
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-run-graph.test.ts

## 1. 测试目标

M3 运行图（A11/A18/K18）：计划线性依赖、完成事件、分支暂停、检查点恢复跳过/重试、取消不完成、失败落 checkpoint。

## 2. 用例清单

6 用例 / 2 describe。夹具 `template/ok/okAll/counting/boom`（:6-16）；纯函数+假执行器；无 mock 框架。

| describe | # | 用例（行） | 核心断言 |
| --- | --- | --- | --- |
| planRunGraph | 1 | 两级流程线性依赖（15-30） | 12 节点 id 序列（auto 10 步+2 task）、`dependsOn` 线性、task kind |
| executeRunGraph（A18） | 5 | 全成功 completed（34-43） | 11 checkpoints、含 `node-started`/`run-completed` |
| | | waiting 分支暂停（45-62） | `awaiting-input`、waiting 明细 `缺证明材料`、下游无 checkpoint |
| | | 检查点恢复（64-78） | done+同 hash skip `['n1']`、failed→pending |
| | | 取消 K18（80-94） | `cancelled`+`run-cancelled`、checkpoints<3、无 `run-completed` |
| | | 抛错 failed（96-103） | attempts 1、lastError 含 `模型超时` |

## 3. 真实断言

如 §2 表（逐条读自 :15-103）。

## 4. 未覆盖与脆弱点

- 未覆盖：无法就绪 failed 分支（`N 个节点无法就绪…`）、产物 `outputRef`、`node-skipped` 事件。
- 脆弱点：夹具 `as unknown as TemplateVersion`；auto 步骤命名耦合 `AUTO_CHECK_STEPS`。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| K18/恢复/暂停被固定 | 已证实 | 用例 2-6 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| planRunGraph/restoreCheckpoints | §2 | covered |
| executeRunGraph done/waiting/failed/取消 | §2 | covered |
| 未就绪 failed/skip 事件 | §4 | unknown（未测） |
