---
path: packages/agent-fabric/src/contract-events.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43dc804be4c8331712c37a1305d1da8843735275
sha256: d30477dc5b65eb99d057ac52625b68eb128b5a9696d6bd88b96b7e27d6bf49e7
lines: 54
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-events.test.ts

## 1. 测试目标

`createInMemoryEventLog`（`events.ts:73`）契约：序列单调、eventId 去重、游标恢复不丢不重（`contract-events.test.ts:3`）。bun:test；真实现直测，无 mock。

## 2. 用例清单

共 **5 个 `it(`**（计数核对）：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:13` | 同任务 eventSequence 从 1 单调递增 | 新 log | append 3 事件 | 独立 |
| `:21` | 不同任务序列独立 | 新 log | t1/t2 各 append | 独立 |
| `:28` | 同 eventId 重复投递去重不产生新序列 | 新 log | append 同 id 两次 | 独立 |
| `:36` | 断线游标恢复只拿之后事件 | 3 事件 | resumeAfter(seq=1/3) | 独立 |
| `:49` | 游标越界报错不静默丢事件 | 1 事件 | resumeAfter(seq=5) | 独立 |

## 3. 真实断言

- `:18` `expect([e1.eventSequence,e2.eventSequence,e3.eventSequence]).toEqual([1,2,3])`。
- `:25` `other.eventSequence` `toBe(1)`（t2 独立计数）。
- `:32-33` `dup` `toBe(first)`（同引用）+ `listByTask('t1')` `toHaveLength(1)`。
- `:43` `resumed.map(e=>e.eventId)` `toEqual(['e2','e3'])`；`:46` `none` `toHaveLength(0)`。
- `:52` `expect(() => log.resumeAfter({taskId:'t1',lastEventSequence:5})).toThrow()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`VALIDATION_FAILED` 错误码字面（`:52` 只断言 throw）；payload 透传；append 返回值除 sequence/引用外字段。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例、断言行 | 已证实 | 全 54 行逐行读 |
| 与 events.ts 实现语义一致 | 已证实 | 逐条对照 `events.ts:73-112` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 用例 | §2/§3 | 13-53 | covered |
| 未覆盖点 | §4 | — | covered（如实） |
