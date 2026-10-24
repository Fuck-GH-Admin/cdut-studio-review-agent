---
path: apps/electron/src/main/lib/feishu/sleep-blocker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 099a68a8bc8b9b247667e7624c4b221b39e24cd4
sha256: 7b4bfd1674df8a0b02162d899574c30b92937842670e714036d5b866ffb9b129
lines: 52
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/sleep-blocker.ts

## 1. 结论与边界

飞书同步**防休眠**（`apps/electron/src/main/lib/feishu/sleep-blocker.ts`）：stream 镜像期间阻止系统休眠（**允许息屏锁屏**——`prevent-app-suspension` 语义，`:42`）。适配器接口化（`SleepBlockerAdapter`，Electron powerSaveBlocker 注入）。

边界：仅 `mode==='stream'` 启用（`:12-14`）；stop 幂等（`:27`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SleepBlockerType` | type | 3 | `'prevent-app-suspension'` | 唯一类型 |
| `SleepBlockerAdapter` | interface | 5-9 | `{start;stop;isStarted}` | 平台注入 |
| `shouldPreventSleepForFeishuSync` | function | 11-14 | settings 判定 | |
| `FeishuSyncSleepBlocker` | class | 16-52 | `sync(settings)`/`stop()` | 单激活 blocker |

## 3. 内部逻辑与关键流程

`sync`（`:20-25`）：stream→start 否则 stop。`start`（`:37-44`）：已有 id 但 `isStarted` false 则重置重开（防外部 stop 后状态漂移）；`stop`（`:27-35`）：id 先清空再 stop（防重入）。console.log 启停日志。

## 4. 调用者与调用链

出向：`../../../types`（AppSettings）。入向（检索=符号名+模块名，全冻结树）：包装模块 `feishu-sleep-blocker.ts:3-4`（new FeishuSyncSleepBlocker）→ **产品入口直连** main/index.ts:237,1046,1277 + main/ipc.ts:449,2205,2308（syncFeishuSyncSleepBlocker/stopFeishuSyncSleepBlocker）。`shouldPreventSleepForFeishuSync` 无外部生产调用（仅自用+测试）。⚠ 近似名：`lib/feishu-sleep-blocker.ts`（包装）≠ `lib/feishu/sleep-blocker.ts`（本文件）。测试：本批 sleep-blocker.test（5 test）。

## 5. 数据 I/O、读写与副作用

系统休眠阻止（经 adapter）；console.log。

## 6. 分支、失败、取消与恢复

状态漂移恢复（`isStarted` 复查，`:38-41`）；无异步/无异常路径。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

适配器契约影响 Electron 电源管理面；测试 `sleep-blocker.test.ts`。

## 9. 测试证据

`feishu/sleep-blocker.test.ts`（本批 86 行，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| stream 唯一启用条件 | 已证实 | `:12-14` |
| 重入/漂移防护 | 已证实 | `:27-44` |
| 真实电源行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 3-52 | covered |
| 状态机 | §3 | 16-52 | covered |
