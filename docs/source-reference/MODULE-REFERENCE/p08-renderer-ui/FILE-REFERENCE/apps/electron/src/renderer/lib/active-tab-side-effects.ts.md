---
path: apps/electron/src/renderer/lib/active-tab-side-effects.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ea38d9305efec37067fdd13befb847fee3c161ce
sha256: e2ef69987f7574c1f807774069e005d57fe65b4e293efa166b7662f206c0bea3
lines: 80
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/active-tab-side-effects.ts

## 1. 结论与边界

激活标签副作用同步（头注释 :2-7）：与 React hook 共享语义、供非 React 上下文（菜单/IPC 回调）复用；**单一事实源**防两处漂移。

## 2. 导出与关键符号

导出 1 条（`export` :23）：`syncActiveTabSideEffectsForStore(store, newActiveTab)`（:23-80）。

## 3. 内部逻辑与关键流程

四分支（:27-79）：
1. 无标签→清 conversation/session（:27-32）。
2. chat Tab→兼容回 Scratch（:34-40，Chat 不再进 Chat 页）。
3. scratch/tutorial→**团队工作区必须退出团队视图**（:42-58 注释：防留空 Agent 面板；个人模式保持文件面板）。
4. agent/browser→设 agent 模式+session、清「已完成未查看」标记（:67-72）、同步 workspace 并 `updateSettings` 持久化（:78）。

## 4. 调用者与调用链

入向：useSyncActiveTabSideEffects（React hook 委托）+activateTabWithSideEffects/菜单/IPC。出向：`@/atoms/app-mode`/`conversation-atoms`/`agent-atoms`/`tab-atoms`、`window.electronAPI.updateSettings`（:78）。

## 5. 数据 I/O、读写与副作用

Jotai 多原子写+updateSettings 持久化（catch console.error）。

## 6. 分支、失败、取消与恢复

四分支；不适用取消/恢复。

## 7. 权限与权威状态

单一事实源权威（:5-7）；chat 兼容语义。

## 8. 修改影响面

- 消费面：Tab 激活全链。
- 依赖面：5 组 atoms。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；四分支 | 已证实 | :27-79 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+四分支 | §2/§3 | :23-80 | covered |
