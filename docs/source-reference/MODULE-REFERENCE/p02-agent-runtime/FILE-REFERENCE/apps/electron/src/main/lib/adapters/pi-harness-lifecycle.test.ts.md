---
path: apps/electron/src/main/lib/adapters/pi-harness-lifecycle.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96cb869d71557d524df06cfb6b4907dc0dfb53cb
sha256: 0a4bfebc5e924fb525c7a50daf6b6efbe314f4c52b6155c15bda79ba7511dcd7
lines: 24
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-harness-lifecycle.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

验证 `mapPiHarnessLifecycleEvent`：agent_end/原生重试边界映射且不产生新 Turn；压缩边界映射并区分溢出恢复；无关事件忽略。

## 2. 用例清单

共 3 个 `test(`（`apps/electron/src/main/lib/adapters/pi-harness-lifecycle.test.ts:5,21,31`）。

| # | 用例（行） | 动作 | 真实断言 |
| --- | --- | --- | --- |
| 1 | maps agent-end and native retry boundaries without creating a new Turn（`:5`） | 三事件 | `agent_end`→`[{type:'model_call_completed',timestamp:1}]`；`auto_retry_start`→`retry_started@2`；`auto_retry_end`→`retry_finished@3`（`toEqual` 精确） |
| 2 | maps compaction boundaries and distinguishes overflow recovery（`:21`） | compaction_start/end{willRetry}/end{aborted} | `compaction_started@1`；`{recovered:true}@2`；`{recovered:false}@3`（aborted 优先否决） |
| 3 | ignores unrelated Pi events（`:31`） | `message_end` | `toEqual([])` |

## 3. 真实断言

逐条见上表（`:8-10,24-30,33`）。纯函数无 mock。

## 4. 未覆盖与脆弱点

未覆盖：`turn_running`（源映射不存在，见源手册）、`compaction_end` 无 result/willRetry 组合、`recovered` 的第三条件（`result!==undefined`）单独分支。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep test(`；`:5,21,31` |
| aborted 否决 recovered | 已证实 | `:48-50` |
| 无关事件空数组 | 已证实 | `:33` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| agent_end/retry 边界 | 1 | 5-19 | covered |
| 压缩/recovered | 2 | 21-30 | covered |
| 忽略 | 3 | 31-33 | covered |
| turn_running/其余组合 | 无 | — | unknown |
