---
path: apps/electron/src/renderer/components/agent/agent-history-pagination.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5288a9c2dca7f3164062c912b93883f925400f6
sha256: 0bb1f9e12dbfef4e8075310a551b85f87c1d102c897cd10432c9794d99900ed5
lines: 131
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/agent-history-pagination.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

历史分页兼容（旧数组/游标回退/hasMore 兜底）与 refresh 归一化（裁前缀防膨胀/连续 refresh 不累积/rewind 整页保留/会话切换不裁/hasMore 误报防护）。

## 2. 用例清单

共 11 个 `test(`（describe `:8` 4 个：`:9,20,25,36`；describe `:44` 7 个：`:45,58,78,88,100,110,118`）。夹具：`message`/`range`/`uuids`（`:4-6`）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 旧数组保游标（`:9`） | cursor `{startIndex:59,hasMore:true}`（legacy 信号）、`isPage` false |
| 2 | 旧空数组停（`:20`） | legacyHasMore=false → `{startIndex:0,hasMore:false}` |
| 3 | 游标回退（`:25`） | 显式 `startIndex:20`；缺省按长回退 `18` |
| 4 | 零点停（`:36`） | `startIndex:0` 缺 hasMore → `hasMore` false |
| 5 | 裁前缀（`:45`） | `clippedCount` 100、cursor `{900,true}`、100 条、首条 `m900` |
| 6 | 连续 3 轮不膨胀（`:58`） | 每轮 100 条、终 `startIndex` 900、`hasMore` true |
| 7 | 未前移不裁（`:78`） | `clippedCount` 0、100 条 |
| 8 | rewind 整页保留（`:88`） | `clippedCount` 0、300 条、cursor `{0,false}` |
| 9 | 会话切换不裁（`:100`） | null → 0、260 条 |
| 10 | 旧数组不裁（`:110`） | `isPage` false、0、1 条 |
| 11 | 裁后 hasMore 防误报（`:118`） | cursor `{40,true}`（页面说到头仍 true）、`clippedCount` 40、60 条、首条 `m40` |

## 3. 真实断言

逐条见上表（`:15-17,22,29-33,40,52-55,72-75,84-85,95-97,106-107,113-115,126-129`）。无 mock；纯函数。

## 4. 未覆盖与脆弱点

未覆盖：`messages` 非数组坏值、`legacyHasMore` 缺省回退 `previous.hasMore`。用例 6 模拟 AgentView tail 计算（`:62` 注释）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个用例 | 已证实 | `grep test(`；`:9-130` |
| 兼容四分支 | 已证实 | `:9-41` |
| 裁剪/膨胀/rewind/防误报 | 已证实 | `:45-130` |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 结果归一 | 1-4 | 9-42 | covered |
| refresh 归一 | 5-11 | 45-131 | covered |
| 坏值分支 | 无 | — | unknown |
