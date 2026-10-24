---
path: apps/electron/src/renderer/lib/window-controls-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 991d3d090d52cce09b53b1399b9c9d78546a0779
sha256: b7596f6d7e4c302b24b24fd24df0ba49132c3347a078928df4eac21f3c4572c6
lines: 66
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/window-controls-layout.ts

## 1. 结论与边界

Windows 窗口按钮布局常量与宿主选择规则（文件头 `:1-13`）：数字与纯函数被三处共用——拖拽层（drag region）在按钮前结束、内容区为按钮预留右侧空间、宿主优先级决定“谁渲染按钮”。**为什么必须共用**：Electron app-region 命中区由操作系统合成，**不能靠 z-index 压重叠 drag 矩形**；历史上 Windows 高 DPI（125%/150%/175%）“按钮单击无效需双击”正是 drag 矩形覆盖按钮矩形（提交 04090bbc）。纯函数模块。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WINDOWS_WINDOW_CONTROLS_SAFE_WIDTH=126` | const | `:23` | 3×36px 按钮（108）+容器内边距边框（4）+缓冲向上取整；内联变体（34px）余量更大同样安全。**历史债务**（`:19-21`）：AppShell/ChatHeader/TeamWorkspaceView/PreviewPanel（本地常量）/SidePanel/BrowserPanel 尚存字面量未引用本常量（改动需 Windows 真机验收） |
| `WindowControlsHostRegistration` | interface | `:25-31` | `{id; active; priority}`（priority 大者更近窗口右缘） |
| `selectActiveWindowControlsHost` | function | `:42-52` | 选唯一宿主 |
| `resolveWindowControlsRightInset` | function | `:60-66` | 右侧让开宽度（controlsVisible=false→0，否则 max(0,safeWidth)） |

## 3. 内部逻辑与关键流程

- `selectActiveWindowControlsHost`：只考虑 active；priority 大者胜；**平局保留先注册者**（Map 迭代序——防同帧按钮在宿主间跳动，`:36-37`）；**返回 null=回归信号**（Windows 上最小化/最大化/关闭整组消失，非正常态，`:39-40`）。
- `resolveWindowControlsRightInset`：单一口径算预留宽度（拖拽层/内容区共用，不各写 126/118——按钮尺寸变化只改本文件，`:54-58`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：窗口按钮宿主（AppShell/ChatHeader/SidePanel 等）与拖拽层布局。直接测试 `window-controls-layout.test.ts`/`window-controls-host-coverage.test.ts`（详见各手册）。出向：无 import（纯模块）。

## 5. 数据 I/O、读写与副作用

无（纯函数/常量）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| inactive 宿主 | `:47` | 跳过 |
| priority 平局 | `:48` | 先注册者保留 |
| 无宿主 | `:51` | null（回归信号） |
| controls 隐藏 | `:64` | inset=0 |

## 7. 权限与权威状态

单一来源口径如实（防数字分叉）；历史债务清单明示（字面量未引用处+真机验收要求）；null=回归信号口径。

## 8. 修改影响面

改常量/规则 → 影响全部 Windows 窗口按钮命中区与预留布局；两测试锁定。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试两件（详见各手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单一来源/平局保先 | 已证实 | 文件头、`:36-48` |
| null=回归信号 | 已证实 | `:39-40` |
| 历史债务清单 | 已证实 | `:19-21` |
| 运行表现 | 未知 | NOT_RUN（Windows 真机） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/接口 | 2 | `:23-31` | covered |
| 两函数全分支 | 3 | `:42-66` | covered |
