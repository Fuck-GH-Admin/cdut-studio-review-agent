---
path: apps/electron/src/renderer/components/app-shell/AppShell.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8574e661dd44f76bbc1dea4e8ba24f20f44aef07
sha256: bf7bf361152429a0f7b665fb8153a0981c5adf7ee5fd9cae8ebd36500564b5e8
lines: 297
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/AppShell.tsx

## 1. 结论与边界

应用主布局容器（文件头 `:1-6`）：布局 `[LeftSidebar 可折叠 | MainArea(TabBar+TabContent) | RightSidePanel 可折叠]`；MainArea 多标签页、Settings 独立覆盖。布局编排 + 面板宽度管理（jotai atoms）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AppShellProps` | interface | `:43-46` | `{contextValue}` |
| `AppShell` | 组件 | `:48-297` | 主布局 |

内部：宽度夹取常量（`:32-37`，右面板 300-560、预览面板 ≥340、左栏 300-420）+`clampLeftSidebarWidth`（`:39`）；宽度 atom 族（`agentSidePanelWidthAtom`/`agentPreviewPanelWidthAtom`/`leftSidebarWidthAtom`）；`profer:focus-right-panel` 事件监听（`:58-72`，聚焦右面板）。

## 3. 内部逻辑与关键流程

### 3.1 状态与派生（`:49-170`）

`appMode`/`currentSessionId`/`interfaceVariant`/`filePanelVisible`（`panelVisibilityAtom.filePanel`）/`activeRightPanelTab`（per-session Map 回退 `'session'`）；`activeView`/`cslabVerified`（`cslabAuthAtom.isVerified`）；宽度三 atom 可拖调整（拖拽禁过渡保即时）。

### 3.2 布局（`:214-297`）

- 顶端 8px 全局拖拽缝隙（`:217` 注释）。
- **左栏：CSLab 授权后完全隐藏**（`:231`）；拖动命中区复用主区 8px 外边距（不额外占宽/不覆盖滚动条，`:242`）。
- **macOS 红绿灯接管**（`:255`）：原挂侧栏内，CSLab 沉浸态隐藏侧栏后由 AppShell 渲染。
- 右侧边栏可见性=「filePanelVisible（意图 A + 窗口足够）」驱动（`:267`）；透明命中区收窄 6px 仅落中缝中心（不参与布局、无额外留白，`:281`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：应用根（渲染层入口）。出向：`@/atoms`（多枚）、`./LeftSidebar`/`./RightSidePanel`/`./ModeSwitcher` 等 app-shell 件、TabBar/TabContent。

## 5. 数据 I/O、读写与副作用

窗口事件监听（`profer:focus-right-panel`，卸载移除）；atom 读写。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| CSLab 授权 | `:231/:255` | 隐左栏+红绿灯接管 |
| filePanel 意图/窗口宽度 | `:267` | 右面板显隐 |
| 宽度越界 | `:32-39` | clamp |
| 事件监听 | `:58-72` | 卸载清理 |

## 7. 权限与权威状态

布局口径如实（命中区不占位/缝隙 8px/6px）；CSLab 沉浸态语义（隐侧栏）。

## 8. 修改影响面

改布局/宽度 → 影响全局 shell；各 atom 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 布局三栏+宽度夹取 | 已证实 | `:32-39/:214-297` |
| CSLab 隐栏/红绿灯接管 | 已证实 | `:231/:255` |
| 命中区不占位口径 | 已证实 | `:242/:281` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 常量/Props | 2 | `:32-46` | covered |
| 状态/事件 | 3.1 | `:49-170` | covered |
| 布局 | 3.2 | `:214-297` | covered |
