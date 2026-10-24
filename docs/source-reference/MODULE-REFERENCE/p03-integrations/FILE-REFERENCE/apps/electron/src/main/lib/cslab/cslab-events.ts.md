---
path: apps/electron/src/main/lib/cslab/cslab-events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0ed5449362c7c7f698a2a5938261dd6499b6828a
sha256: 6c4d62a7d0013ce2e38ba2e003fe7de166125479715a7bbf652d5a99d589ac1c
lines: 17
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-events.ts

## 1. 结论与边界

CSLab **主进程事件广播出口**（`apps/electron/src/main/lib/cslab/cslab-events.ts:1-6`）：cslab 模块内**唯一允许依赖 electron 的事件出口**；其余 `cslab-*` 业务模块保持 Electron-free（便于 `bun test` 直跑）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `broadcastCsLabEvent` | 函数 | `:8-17` | `(channel: string, payload: unknown) => void` | 向所有未销毁窗口广播 |

## 3. 内部逻辑与关键流程

`try` 内 `require('electron')` 取 `BrowserWindow`（运行时懒加载，`:10`）→ 遍历 `getAllWindows()`，对 `!isDestroyed()` 的窗口 `webContents.send(channel, payload)`（`:11-13`）。`catch` 只 `console.warn`（非 Electron 环境容忍，`:14-16`）——**广播失败静默降级**。

## 4. 调用者与调用链

- 消费方：cslab 各业务模块（canvas-sync/DB/demo 等）经此发事件。
- 出向：`electron`（唯一依赖点）。

## 5. 数据 I/O、读写与副作用

IPC 广播（渲染进程接收）；无文件/网络。失败仅警告。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 窗口已销毁 | `:12` | 跳过 |
| require/send 异常（非 Electron 等） | `:14-16` | `console.warn` 静默 |

## 7. 权限与权威状态

无 sender 校验（主进程→渲染单向广播）；通道名由调用方给定。

## 8. 修改影响面

- 改为同步 require 或加 Electron 依赖会破坏「业务模块 Electron-free」红线（`:4-5`）。
- 广播静默失败语义变更影响调试体验。

## 9. 测试证据

无专属测试（全树检索 `broadcastCsLabEvent` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出、懒加载 electron、失败静默 | 已证实 | `:8-17` |
| 唯一 Electron 依赖点红线 | 已证实（注释） | `:1-6` |
| 实际广播效果 | 未知 | 未运行 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `broadcastCsLabEvent` | `:8-17` | covered |
