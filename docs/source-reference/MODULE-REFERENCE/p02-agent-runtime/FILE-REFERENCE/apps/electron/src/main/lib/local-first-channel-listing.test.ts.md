---
path: apps/electron/src/main/lib/local-first-channel-listing.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dc386b121961cf27dc588c5afc52f52c998cf030
sha256: f916397a43427247102cab942c9898c64ddc82c68d9c5071675acbeacfd9b177
lines: 77
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/local-first-channel-listing.test.ts

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 1. 测试目标

`listChannelsWithBackgroundSync`：同步返回本地快照不等后台同步；认证/同步失败时本地快照仍可用（失败回调）；非商业模式不启动认证刷新。

## 2. 用例清单

共 3 个 `test(`（`apps/electron/src/main/lib/local-first-channel-listing.test.ts:18,40,59`）。夹具：内存 `localChannels`（`:5-15`）；deps 全注入（promise 门闩/失败/计数开关）。

| # | 用例（行） | 真实断言 |
| --- | --- | --- |
| 1 | 不等 pending 同步（`:18`） | `channels` `toBe(localChannels)`（同引用）；微任务后 `syncStarted===true` |
| 2 | 认证/同步失败快照可用（`:40`） | `getTeamAuthWithRefresh` 抛 `服务器不可达`；`channels` `toBe(localChannels)`；两次微任务后 `failures` `toHaveLength(1)` |
| 3 | 非商业不刷新（`:59`） | `authRequested===false`；`channels` `toBe(localChannels)` |

## 3. 真实断言

逐条见上表（`:34-36,53-56,73-75`）。mock 边界：deps 全为内存注入；被测函数真实实现。

## 4. 未覆盖与脆弱点

未覆盖：`syncChannelsFromServer` 成功路径副作用（只验发起）、`onSyncFailure` 内容。微任务时序断言（`Promise.resolve()`×1-2）依赖调度细节。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个用例 | 已证实 | `grep test(` |
| 同步返回/后台发起 | 已证实 | `:34-36` |
| 失败不阻塞 | 已证实 | `:53-56` |
| 非商业不发起 | 已证实 | `:73-75` |
| 真实服务端 | 未知 | 注入 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 同步返回+后台 | 1 | 18-38 | covered |
| 失败回调 | 2 | 40-57 | covered |
| 非商业 | 3 | 59-76 | covered |
| 成功同步副作用 | 无 | — | unknown |
