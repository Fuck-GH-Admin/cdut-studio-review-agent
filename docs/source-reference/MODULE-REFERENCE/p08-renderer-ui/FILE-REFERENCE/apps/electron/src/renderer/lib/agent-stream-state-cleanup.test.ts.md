---
path: apps/electron/src/renderer/lib/agent-stream-state-cleanup.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0a9ee01a64197f85c19c2ec73cbf5152d31ecf43
sha256: e28e3063f0a4c3fc700061f956d8d58744f438f5dbfc04a6dd7319461bc7dc22
lines: 94
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/agent-stream-state-cleanup.test.ts

## 1. 测试目标

验证 `agent-stream-state-cleanup.ts`（同批收录）三个状态收敛函数：`rollbackRejectedAgentRunState` 撤销乐观假运行不留输入锁、`settleCompletedAgentStreamState` STREAM_COMPLETE 终态释放全部锁并补 done、`compactCompletedBackgroundStreamState` 后台完成态压缩保留用量。被测第 4 函数 `isCurrentAgentStreamCompletion` 不在本文件（见 `agent-stream-completion.test.ts`，间接）。

## 2. 用例清单

grep `test(` 机械计数=6、`describe(`=3、`it(`=0：`rollbackRejectedAgentRunState` 1 个（`:10` 五锁全清）；`settleCompletedAgentStreamState` 2 个（`:28` 失败压缩 run 释放全部锁+补 done、`:47` 后台任务残留仅留软空闲态）；`compactCompletedBackgroundStreamState` 3 个（`:62` 无用量整体移除、`:66` 有用量保留展示数据、`:87` 运行中/软空闲原样保留）。合计 6，与标签一致。

## 3. 真实断言

- `:17-23`：toMatchObject 五字段全 false（running/backgroundWaiting/stopping/isCompacting/compactInFlight）。
- `:37-44`：toMatchObject 锁全释放、backgroundWaiting:false、toolActivities:[{...unfinished, done:true}]。
- `:52-57`：toMatchObject running:false、backgroundWaiting:true（backgroundTasksPending=true）、isCompacting:false、compactInFlight:false。
- `:63`：expect(...).toBeUndefined()（无 inputTokens 整体移除）。
- `:74-84`：toEqual 完整对象——running:false、content:''、toolActivities:[]、inputTokens:1200 等 6 个用量字段逐值比对。
- `:91-92`：expect(...).toBe(running)、toBe(waiting)（原引用返回，不改动）。

## 4. 未覆盖与脆弱点

未覆盖：`isCurrentAgentStreamCompletion`（本批 SUT 第 4 函数，另测于 `agent-stream-completion.test.ts:19-33`）；`settleCompletedAgentStreamState` 对 startedAt/content 字段的保留未断言；`state` 工厂（`:5-7`）固定 toolActivities 一条未完成工具，多工具混合 done/!done 分支（`agent-stream-state-cleanup.ts:48-50`）未覆盖。脆弱点：`toEqual` 完整对象断言（`:74-84`）对 SUT 新增字段敏感——SUT 扩字段会导致用例失败而非失真，属可接受脆弱。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例清单与断言文本 | 已证实 | `agent-stream-state-cleanup.test.ts:10-93` 逐行 |
| 测试实际通过 | 未知 | `NOT_RUN`（本轮未运行测试，纯静态阅读） |
| isCurrentAgentStreamCompletion 行为 | 间接 | `agent-stream-completion.test.ts:19-33`（未运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| rollbackRejectedAgentRunState | §2/§3 | 10-25 | covered |
| settleCompletedAgentStreamState | §2/§3 | 28-58 | covered |
| compactCompletedBackgroundStreamState | §2/§3 | 62-93 | covered |
| isCurrentAgentStreamCompletion | §4 | — | unknown（本文件未测） |
