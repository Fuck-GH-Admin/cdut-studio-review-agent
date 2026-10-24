---
path: apps/electron/src/renderer/atoms/browser-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5c8eb5e6b7eec807486ad00b3d1d3e10322559b9
sha256: 0a5e37268658c93bad4d2da34f0d8907e4511f441a9991b68ec0909144589acc
lines: 12
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/browser-atoms.ts

## 1. 结论与边界

浏览器状态镜像原子（12 行）：**主进程仍是状态权威**（BROWSER_STATE_CHANGED 推送，:4）。

## 2. 导出与关键符号

导出 2 条（`export` :5/:12）：
- `browserStateMapAtom`（:5，会话→BrowserViewState Map）。
- `browserPanelDismissedSessionIdsAtom`（:12，用户手动关 Tab 的会话集合；:7-11 注释：推送不强制重开刚关的 Tab，手动打开清标记）。

## 3-7. 不适用

纯原子声明+推送契约（不适用逻辑分支）——依据：12 行全文。

## 8. 修改影响面

- 消费面：Agent 浏览器面板。
- 依赖面：BROWSER_STATE_CHANGED 推送（主进程权威）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；主进程权威+dismiss 语义 | 已证实 | :4-12 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | :5-12 | covered |
