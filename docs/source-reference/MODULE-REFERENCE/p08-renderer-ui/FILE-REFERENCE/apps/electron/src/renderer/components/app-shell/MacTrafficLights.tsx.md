---
path: apps/electron/src/renderer/components/app-shell/MacTrafficLights.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0fb68376d2b783faa246fc2678f0dd3db9e1dce0
sha256: a850036437c466b45042b5ee6e78c7a3580bdb3d92edf7242e5e10694daa1ac4
lines: 88
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/MacTrafficLights.tsx

## 1. 结论与边界

macOS 自定义红绿灯（文件头 `:1-6`）：Electron 原生 traffic lights 只支持位置不支持尺寸；主窗口 110% 页面缩放后原生按钮与 rail 比例失真，故渲染层用可控尺寸按钮替代。窗口控制（关/最小化/最大化）经 `window.electronAPI`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MacTrafficLights` | function 组件 | `:28-88` | `{classic?（8px 内边距偏移扣除）; collapsed?（收起缩小防裁掉第三钮）; className?}` |

内部：`trafficLights` 三色表（`:20-24`，#ff5f57 关/#febc2e 最小/#28c840 最大+hover 色+中文 label）。

## 3. 内部逻辑与关键流程

- `handleAction`：close/minimize/maximize → `window.electronAPI.windowClose/windowMinimize/windowMaximize`。
- 容器：`titlebar-no-drag`+`WebkitAppRegion:'no-drag'`（**退出窗口拖拽**）+zIndex 999；collapsed 居中收窄（`gap-[2px]`），classic 位置偏移（`left-2.5` vs `left-[18px]`）。
- **pointer/mouse/click 全 stopPropagation**（防穿透到拖拽层）；`role="group"`+`aria-label="窗口控制"`（无障碍）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar`（仅 macOS、最后渲染）。出向：`window.electronAPI`（窗口三操作）。

## 5. 数据 I/O、读写与副作用

仅窗口三操作 IPC（`window.electronAPI.windowClose/windowMinimize/windowMaximize`）；无其它 I/O、无持久化。事件经 stopPropagation 不外溢。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 三按钮 action | `:30-33` | 三 IPC |
| collapsed/classic | `:42-45` | 位置/间距适配 |

## 7. 权限与权威状态

替代原生的理由如实（尺寸不可控/缩放失真）；no-drag 区域口径（仅按钮区退出拖拽）。

## 8. 修改影响面

改窗口控制 → 影响 macOS 窗口交互；IPC 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 替代原生理由/三操作 IPC | 已证实 | 文件头、`:30-33` |
| stopPropagation 防穿透 | 已证实 | `:48-50` |
| 运行表现 | 未知 | NOT_RUN（macOS） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MacTrafficLights` | 2/3 | `:20-88` | covered |
