---
path: apps/electron/src/main/lib/planning-window.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0916d7963ad02821c26858274732e20bf78df0f4
sha256: 4d86ccb24743b32254bf8a816b5faf6de8b08ec6e39130fd117718b22e4b5077
lines: 183
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/planning-window.ts

## 1. 结论与边界

规划中心单例窗口（`Profer · 规划中心` :12）：创建/恢复/状态持久化/导航安全。单例语义（:164 注释）。

## 2. 导出与关键符号

导出 2 条（`export` :165/:178）：`showPlanningWindow`（:165-174，单例：存在则 ensureWindowOnScreen+restore+focus）、`destroyPlanningWindow`（:178-183，退出时保存状态+destroy）。

内部：`getIconPath`（:16-29，打包/开发资源+三平台图标）、`getInitialBounds`（:31-46，savedState 或光标所在屏居中+MIN/MAX 限制）、`ensureWindowOnScreen`（:48-63，中心点不在任何屏→主屏居中）、`isDevServerNavigation`（:65-71，仅 127.0.0.1:5173）、`persistPlanningWindowState`（:73-81，失败 console.error）、`createPlanningWindow`（:83-162）。

## 3. 内部逻辑与关键流程

`createPlanningWindow`（:83-162）：平台标题栏三态（mac hiddenInset+vibrancy/win hidden/linux 默认 :85-96）；contextIsolation+无 nodeIntegration（:104-108）；dev URL/打包 loadFile（:114-119）；**状态保存防抖 500ms**（:127-141，close 立即 flush :146）；**导航安全**（:148-156）：仅 dev server 放行，外部 http(s)→shell.openExternal，window.open 拒绝+外开。

## 4. 调用者与调用链

入向（子agent 交叉核）：**生产 2 处**——`ipc.ts:6916`（动态 import，OPEN_WINDOW 处理器 :6917）、`main/index.ts:232`（destroyPlanningWindow :1264）。出向：electron（app/BrowserWindow/screen/shell :1）、`./main-window-lifecycle`（:5）、`./settings-service`（:84/:77 持久化）。

## 5. 数据 I/O、读写与副作用

窗口生命周期+设置持久化（planningWindowState）。

## 6. 分支、失败、取消与恢复

单例二分支（:166-173）；导航拦截（:148-156）；状态保存失败降级（:78-80）。

## 7. 权限与权威状态

导航安全边界：外部 URL 弹出浏览器而非内导航（:151）；window.open 拒（:155）。

## 8. 修改影响面

- 消费面：`ipc.ts:6916-6918`（OPEN_WINDOW 动态 import）、`main/index.ts:1264`（destroy）——规划中心入口与退出清理。
- 依赖面：`main-window-lifecycle`（状态形状）、`settings-service`（planningWindowState 持久化）、preload/renderer（window=planning 查询参数）。
- 需同步测试：无专属测试；导航拦截/状态防抖/单例语义未直接覆盖。

## 9. 测试证据

无专属测试文件。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；单例+导航安全+状态防抖 | 已证实 | :83-183 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+窗口生命周期 | §2/§3 | :16-183 | covered |
