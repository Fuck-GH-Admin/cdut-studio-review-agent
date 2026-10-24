---
path: apps/electron/src/renderer/lib/session-update-batcher.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ba683ebf2af09a8ff9c88325d25d218fd177ebc
sha256: edd41af1977b0ae3467bd0eb0a043623c4e377089736ae083cd47367acdf8a21
lines: 46
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/session-update-batcher.test.ts

## 1. 测试目标

`createSessionUpdateBatcher`（`./session-update-batcher`）的合并/隔离/终态/丢弃语义：同帧同会话更新合并为一次提交且不跨会话混合；`flush` 终态前提交最后一批；`cancel` 丢弃过期会话更新。纯函数级单测（bun:test），无主进程/渲染边界。

## 2. 用例清单

用例数 2（`test(` 实测计数：grep `test(` 命中 `:5`、`:27`，1 个 `describe` `:4`）：

| # | 用例（行） | 设置 | 动作 | 断言（行） | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 合并同一 session 的一帧更新，但不混合其他 session（`session-update-batcher.test.ts:5-25`） | 注入收集式 `schedule`（回调入数组，返回下标作句柄）与空 `cancel`（`:10`）；flush 收集 `[sessionId, updates]`（`:9`） | `enqueue('a','thinking-1')`、`enqueue('a','thinking-2')`、`enqueue('b','text-1')`（`:13-15`）→ 手动执行 `callbacks[0]()`、`callbacks[1]()`（`:18,:20`） | `:16` 提交前 `flushed` 长度 0；`:19` a 批 `['thinking-1','thinking-2']` 保序；`:21-24` b 批独立 `['text-1']` | 先 a 后 b 入队；两个回调对应两次调度（a、b 各一） |
| 2 | flush 会在终态前提交最后一批，cancel 会丢弃过期 session 更新（`:27-45`） | 同上注入（`:32`） | `enqueue('a','final-delta')`→`flush('a')`（`:35-36`）；再手动 `callbacks[0]()`（`:38`）；`enqueue('old','stale')`→`cancel('old')`→`callbacks[1]()`（`:41-43`） | `:37` flush 后立即 `[['a',['final-delta']]]`；`:39` 被取消的调度回调再执行不产生第二次提交（长度仍 1）；`:44` cancel 丢弃 'stale' 后长度仍 1 | 用例 2 依赖批次器行为与用例 1 相同；`callbacks[0]` 是已消费句柄的回调，验证幂等 |

## 3. 真实断言

- `:16` `expect(flushed).toHaveLength(0)` —— 调度前不提交。
- `:19` `expect(flushed).toEqual([['a', ['thinking-1', 'thinking-2']]])` —— 合并且保序。
- `:21-24` `expect(flushed).toEqual([...['a',...], ['b', ['text-1']]])` —— 会话隔离。
- `:37` `expect(flushed).toEqual([['a', ['final-delta']]])` —— flush 同步提交。
- `:39` `expect(flushed).toHaveLength(1)` —— 已 flush 的调度回调不重复提交。
- `:44` `expect(flushed).toHaveLength(1)` —— cancel 后无提交。

mock 边界：`schedule`/`cancel` 全注入（`:10,:32`），**不测**默认 rAF/`setTimeout(16)` 路径；`createSessionUpdateBatcher` 为真实实现（无 `mock.module`，无 Electron/IPC 依赖）。

## 4. 未覆盖与脆弱点

- 默认调度器（`requestAnimationFrame`/`setTimeout(16)` 退化分支）未测；`options.schedule`/`cancel` 部分注入错配未测。
- `flushAll` 无用例；`cancel` 不存在的会话、`enqueue` 后空数组场景未测。
- 外部 `flush` 回调抛错（源码先 delete 后回调，批即丢）无断言。
- 多会话交错高频 enqueue、并发（同 tick 交错）未测。
- 脆弱点：用例依赖手动回调数组下标与调度顺序的耦合（`:18,:20,:38,:43`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例、断言 6 处如 §2/§3 | 已证实 | `session-update-batcher.test.ts:5-45` |
| mock 边界=注入调度器，核心逻辑真实 | 已证实 | `:10,:32` + import `:2` |
| 用例 2 的幂等语义（取消句柄回调安全） | 已证实 | `:38-39` |
| 默认调度路径行为 | 未知 | 未覆盖、NOT_RUN |
| 测试是否通过 | 未知 | 本轮 `NOT_RUN`，未执行 bun test，断言为静态阅读所得 |

## 6. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `enqueue` 合并 | §2/§3 用例 1 | 5-25 | covered |
| 会话隔离 | §2/§3 用例 1 | 5-25 | covered |
| `flush` 终态提交 | §2/§3 用例 2 | 27-39 | covered |
| `cancel` 丢弃 | §2/§3 用例 2 | 41-44 | covered |
| `flushAll`/默认调度/flush 抛错 | §4 | - | unknown（未覆盖） |
