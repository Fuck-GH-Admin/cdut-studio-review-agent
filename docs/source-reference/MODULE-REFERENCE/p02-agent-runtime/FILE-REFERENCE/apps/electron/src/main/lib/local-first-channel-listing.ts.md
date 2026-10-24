---
path: apps/electron/src/main/lib/local-first-channel-listing.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1dbb750ec5756e0779dae30c84cc6220431ff1e
sha256: 86637792ded0eb51ed197d736a05feb6b1eb45e9809aa6edac3c018a93420a76
lines: 37
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/local-first-channel-listing.ts

## 1. 结论与边界

**本地优先**渠道列表：立即返回本地渠道快照，商业模式下后台刷新服务端托管渠道。本地 `channels.json` 是模型选择首屏的可靠缓存；远端刷新是补充，**绝不能**让认证/代理/服务器网络阻塞对话输入（文件头注释 `apps/electron/src/main/lib/local-first-channel-listing.ts:16-20`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 1 个函数 = 2 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LocalFirstChannelListingDeps` | 接口（导出） | 8-14 | `listLocalChannels/isCommercialMode/getTeamAuthWithRefresh/syncChannelsFromServer/onSyncFailure` | 全依赖可注入 |
| `listChannelsWithBackgroundSync` | 函数（导出） | 22-37 | `(deps)=>Channel[]` | 同步返回+异步刷新 |
| `TeamAuth` | 内部 | 3-6 | `{baseUrl,token}` | |

## 3. 内部逻辑与关键流程

`listChannelsWithBackgroundSync`（`:22-37`）：取 `listLocalChannels()`；非商业模式直接返回（`:25`）；否则 `void getTeamAuthWithRefresh().then(auth=>auth&&syncChannelsFromServer(auth.baseUrl,auth.token)).catch(onSyncFailure)`（`:27-34`）——**不 await**，同步返回 `localChannels`（`:36`）。

## 4. 调用者与调用链

入向：渠道列表 IPC/服务（首屏模型选择）；测试：`local-first-channel-listing.test.ts`（77 行，本批）。出向：无 import（纯函数+`@profer/shared` 类型）。

## 5. 数据 I/O、读写与副作用

间接 IO 经注入依赖（本地读/服务端同步）；本文件无直接 IO；副作用=后台刷新 promise（失败走 `onSyncFailure`，不抛回调用方）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 非商业模式 | 不触发同步 | 25 |
| 未认证（auth null） | 静默跳过 | 28 |
| 同步抛错 | `onSyncFailure(error)` | 31-33 |
| 任何情形 | 同步返回本地快照 | 36 |

无取消/恢复概念（单次后台刷新）。

## 7. 权限与权威状态

- 首屏权威=本地 `channels.json` 快照；服务端刷新仅补充（注释 `:18-20`）。
- 认证经 `getTeamAuthWithRefresh`（含刷新），不阻塞 UI。

## 8. 修改影响面

改同步/返回语义影响首屏延迟与渠道新鲜度；影响 `local-first-channel-listing.test.ts`。

## 9. 测试证据

直接测试：`local-first-channel-listing.test.ts`（77 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 同步返回/后台刷新 | 已证实 | `:22-36` |
| 失败不阻塞（onSyncFailure） | 已证实 | `:31-33` |
| 非商业不同步 | 已证实 | `:25` |
| 真实服务端行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `listChannelsWithBackgroundSync` | §3 | 22-37 | covered |
| 失败/非商业分支 | §6 | 25,31-33 | covered |
| 真实网络 | §10 | — | unknown |
