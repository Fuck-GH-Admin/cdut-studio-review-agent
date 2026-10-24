---
path: apps/electron/src/renderer/components/WindowControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca2c8de7872fe4632483601cc776fbcf5581ee09
sha256: 19fed40d74b2a3d5a4d81583e19549fcbe9a074afd71f84deea49c9e2db59577
lines: 90
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/WindowControls.tsx

## 1. 结论与边界

Windows 自定义窗口控制按钮（最小化/最大化/关闭，渲染层运行时）：仅 Windows 渲染，替换 Electron 原生 titleBarOverlay 按钮（文件头 `apps/electron/src/renderer/components/WindowControls.tsx:1-4`）。两种变体：`fixed`（悬浮右上）/`inline`（宿主顶栏内嵌）（`:11-14,52-56`）。

边界：不做布局仲裁（`WindowControlsTemplate` 选择宿主）；不监听窗口状态来源（经 preload API）；图标来自 Lucide（`:57` 注释）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（`WindowControlsProps` 为内部接口）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WindowControls` | 函数/组件（导出） | 16-90 | `({variant='fixed', className}) => React.ReactElement \| null` | 窗口按钮组 |
| `WindowControlsProps` | 接口（内部） | 11-14 | `{variant?: 'fixed'\|'inline', className?}` | |

## 3. 内部逻辑与关键流程

1. `isWindows = detectIsWindows()` memo（`:20`）；非 Windows 直接 `null`（`:49`）。
2. 状态 effect（`:24-47`）：初始 `windowIsMaximized()`（`:26`）；订阅主进程 `onWindowMaximizeChanged`（精确事件，`:29-31`）+ `onWindowResize` 降级兜底（`:34-41`）——**只在状态实际变化时 setState**（`:36-39` 注释：每次重渲染都会让 Chromium 重算可拖拽区，产生数十 ms stale 窗口被 OS 误判为标题栏点击）。清理退订（`:43-46`）。
3. 渲染三按钮（`:58-87`）：最小化 `windowMinimize`；最大化/还原 `windowMaximize`（图标按 `isMaximized` 切 Copy/Square，`:70-77`）；关闭 `windowClose`（`:80-87`，类 `window-control-close`）。容器 class：fixed=`fixed top-[2px] right-[8px] Z_LAYER.dialog`，inline=`relative Z_LAYER.chrome shrink-0`（`:52-56`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`components/WindowControlsTemplate.tsx:2`（import）、`:86`（`<WindowControls variant="inline">`，经 WindowControlsHost）；`components/cdut-science/agent-window/ScienceAgentWindowView.tsx:58,457`（`<WindowControls variant="inline">`）。**`variant:'fixed'`（默认）无任何渲染点**——两处调用均显式 inline（否定范围：全树 `<WindowControls` JSX 检索）。

出向：`@profer/ui`（`detectIsWindows`/`Z_LAYER`，`:8`）、`window.electronAPI`（`windowIsMaximized`/`onWindowMaximizeChanged`/`onWindowResize`/`windowMinimize`/`windowMaximize`/`windowClose`，`:26-84`）、lucide 图标（`:7`）。

## 5. 数据 I/O、读写与副作用

- 读：窗口最大化状态（IPC）；写：窗口 minimize/maximize/close（IPC 一次性动作）。
- 副作用：主进程事件订阅/退订；React state。
- 并发/幂等：状态去重（`:30,39`）避免无谓重渲染；无锁。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 非 Windows null | `!isWindows` | 49 |
| 状态去重 | prev===next | 30, 39 |
| 最大化图标切换 | isMaximized | 73-77 |
| fixed/inline 布局 | variant | 52-56 |

IPC Promise 无 catch（`:26,35`，失败静默，推断）；无恢复概念，依据：纯 UI 组件。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；窗口操作经 preload 白名单 API，权威在主进程窗口管理。

## 8. 修改影响面

- 调用方 2 处（§4）；改 props 影响 Template 与 ScienceAgentWindowView。
- 与 `window-controls-layout`（宿主选择）协作：改按钮结构影响 `window-controls-host-coverage.test.ts`（非本批，间接）。
- 需同步的测试：无直接测试（§9）。

## 9. 测试证据

直接测试：**无**（本组件无专属测试）。间接证据：`lib/window-controls-layout.test.ts`、`lib/window-controls-host-coverage.test.ts`（非本批）引用 WindowControls/Template 概念做布局选择测试，不覆盖本组件渲染与 IPC 行为。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实窗口操作。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 双变体 | 已证实 | `:11-56` |
| 状态去重防 stale 窗口 | 已证实 | `:36-39` 注释 + `:30,39` |
| fixed 变体无渲染点 | 已证实 | 全树 JSX 检索（§4） |
| IPC Promise 失败静默 | 推断 | 无 catch |
| 主进程事件语义 | 未知 | preload/主进程非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WindowControls` | §2-3 | 16-90 | covered |
| 状态 effect+去重 | §3 | 24-47 | covered |
| 三按钮/双变体 | §3 | 52-87 | covered |
| 调用链 | §4 | - | covered |
| 运行期/主进程 | §9-10 | - | unknown（NOT_RUN/非本批） |
