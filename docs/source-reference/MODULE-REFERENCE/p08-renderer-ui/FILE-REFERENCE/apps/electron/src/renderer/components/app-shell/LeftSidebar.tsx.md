---
path: apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f918639daf7ea5f13853f50ca59c424f36306ae
sha256: 6c1abc1bd6ace160b50fbe7e75268d4d88bbd291e819751df5acb66179ebbf76
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/LeftSidebar.tsx

## 1. 结论与边界

左侧导航栏外壳（文件头 `:1-14`）：组件已按职责拆分到 `left-sidebar/`（use-left-sidebar hook=rail/expanded-sidebar/sidebar-dialogs/session-items/navigation-items/sidebar-utils/session-tree）；**本文件仅 props 透传与折叠/展开外壳装配**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LeftSidebarProps`（re-export） | type | `:25` | 来自 `left-sidebar/types` |
| `LeftSidebar` | function 组件 | `:28-65` | 外壳装配 |

## 3. 内部逻辑与关键流程

- `useLeftSidebar()` 拿全量状态（`s`）；折叠宽 60 / 展开 `width ?? 300`（minWidth 200、flexShrink 折叠不压缩，`:47-51`）。
- 折叠→`SidebarRail`，展开→`ExpandedSidebar`（`:53`）。
- **MacTrafficLights 最后渲染**（位于左上拖拽层之上、仅此区退出窗口拖拽，`:55` 注释）；仅 macOS 显示。
- **`SidebarDialogs`/`SearchDialog` 外层唯一实例**（`:59-62` 注释）：双视图共享状态，Radix Portal 双实例会叠双遮罩+双内容；`renderSearchDialog` 缺省 true（移动端双实例约束见 types.ts 注释）。
- classic 变体换底色；宽度过渡可由 `noTransition` 禁用（拖拽即时响应）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AppShell（横屏固定+竖屏抽屉双实例）。出向：`left-sidebar/*`（hook+rail+expanded+dialogs）、`./SearchDialog`、`./MacTrafficLights`。

## 5. 数据 I/O、读写与副作用

无直接 I/O；状态读写均在 `use-left-sidebar` hook 与子组件内完成。本文件仅装配与条件渲染。

## 6. 分支、失败、取消与恢复

折叠/展开两分支；classic/isMac/renderSearchDialog 条件渲染。

## 7. 权限与权威状态

Portal 唯一实例约束如实记录（防双遮罩回归）；红绿灯层级口径（最后渲染）。

## 8. 修改影响面

改装配 → 影响侧边栏层级/对话框实例数。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 薄外壳/拆分口径 | 已证实 | 文件头 |
| 唯一实例约束 | 已证实 | `:59-62` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `LeftSidebar` | 2/3 | `:28-65` | covered |
