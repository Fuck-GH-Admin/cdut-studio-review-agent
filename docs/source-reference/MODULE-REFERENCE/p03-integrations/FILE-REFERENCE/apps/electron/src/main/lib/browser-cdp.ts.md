---
path: apps/electron/src/main/lib/browser-cdp.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 38fe61d8a7be68cb5342535e51f373f05da99294
sha256: bd7ea6e5e0342b755cce7a319621009dd6d85f2b968e185fbcd0dc2ab2d71bcd
lines: 57
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-cdp.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

浏览器 CDP 超时/中止基建（57 行）：`withBrowserCdpTimeout` 包裹 Electron Debugger `sendCommand`（其在页面卡死时可能永不 settle，头注 :46-48）；超时/中止只负责让调用方继续执行，底层命令后续 settle 被安全忽略。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BROWSER_CDP_COMMAND_TIMEOUT_MS` | const | 1 | 8000ms |
| `BROWSER_OBSERVE_TIMEOUT_MS` | const | 2 | 5000ms |
| `BROWSER_OBSERVE_AX_DEPTH`/`..._EXTENDED_AX_DEPTH` | const | 3-4 | 8/16 |
| `resolveBrowserObserveAxDepth` | fn | 10-12 | maxElements>240 才读深树（注释 :6-9 防常规观察退化） |
| `BrowserCdpTimeoutError` | class | 14-20 | 中文超时文案 |
| `BrowserOperationAbortedError` | class | 23-28 | 「已发送的页面指令可能已执行」（:22） |
| `throwIfBrowserOperationAborted` | fn | 30-32 | 中止即抛 |
| `withBrowserCdpTimeout` | fn | 49-57 | Promise.race 化超时/中止 |

## 3. 内部逻辑与关键流程

`withBrowserCdpTimeout`：`settled` 一次性闸门；`settle` 清 timer+移除 abort 监听；timeout→`BrowserCdpTimeoutError`；abort→`BrowserOperationAbortedError`；命令 resolve/reject 归一收口。已发出的 DevTools 命令无法撤销（注释 :22/46-48）。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:17`（cdp 封装/超时重连）。测试：`browser-controller-screenshot.test.ts` 等经 controller 间接。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无（纯 Promise 逻辑）。

## 6. 分支、失败、取消与恢复

超时→throw（调用方 `recoverDebugger` 重连）；中止→throw；命令异常原样抛；无重试。

## 7. 权限与权威状态

- 诚实状态权威：中止文案明示「结果未知，请重新观察」（:26）；不伪造命令结果。
- 无 sender/role 检查。

## 8. 修改影响面

全部 CDP 页面操作（observe/click/fill/screenshot）。同测经 `browser-controller.*` 族。

## 9. 测试证据

直接测试：无独立文件；经 `browser-controller-screenshot.test.ts`（3 用例，timeout 路径未直测）间接覆盖 controller 层。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出/行号如 §2 | 已证实 | 逐行核对 |
| settle 一次性/超时中止语义 | 已证实（代码） | :49-57 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `withBrowserCdpTimeout` | §3 | 49-57 | covered（未直测） |
| `resolveBrowserObserveAxDepth` | §2 | 10-12 | covered（间接） |
| 两个 Error 类 | §2 | 14-28 | covered |
