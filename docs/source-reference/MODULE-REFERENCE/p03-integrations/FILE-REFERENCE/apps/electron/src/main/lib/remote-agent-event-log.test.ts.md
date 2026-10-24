---
path: apps/electron/src/main/lib/remote-agent-event-log.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 21b84e69d90e8617b7e59b08a9495808ee992ff9
sha256: 3b58c4a6f6bfce8e1e6bbee15356f5067907b63d9c9174422f3d747ec28ead65
lines: 67
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-agent-event-log.test.ts

## 1. 测试目标

`remote-agent-event-log.ts` 的 `RemoteAgentEventLog`：单调 id、游标补发、首次连接不回放、窗口外需快照、时间/条数裁剪、非法游标拒绝。被测逻辑见同组手册。

## 2. 用例清单

**5 个 `test()`**（describe `RemoteAgentEventLog`）：单调 id+游标补发（`:11-21`）、首连不回放（`:23-32`）、窗口外需快照（`:34-46`）、时间+硬上限裁剪（`:48-58`）、非法游标拒绝（`:60-66`）。

## 3. 真实断言

- `:16-20` eventId 1/2；`replayAfter(1)` records `[2]`、from/to 均 2。
- `:29-31` `replayAfter(null)` records `[]`、requiresSnapshot false、latest 1。
- `:42-45` maxEvents=2 时 `replayAfter(0)` records `[]`、requiresSnapshot **true**、oldest 2/latest 3。
- `:55-57` maxEvents=2+maxAge 100ms：oldest 3/latest 4、`replayAfter(2)` `[3,4]`。
- `:64-65` `replayAfter(-1)`/`(1.5)` 均 requiresSnapshot **true**。

## 4. 未覆盖与脆弱点

未覆盖：clear/append 默认 createdAt。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例断言如 §3 | 已证实 | 逐行读 `:1-67` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 补发/快照/裁剪/拒非法游标 | 5 | covered |
