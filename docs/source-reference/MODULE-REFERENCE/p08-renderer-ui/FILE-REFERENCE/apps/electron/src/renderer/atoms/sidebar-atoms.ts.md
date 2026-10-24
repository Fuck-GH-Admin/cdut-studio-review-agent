---
path: apps/electron/src/renderer/atoms/sidebar-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c9b92dab3bf4f239d60939a1f8c4c8c6cd426019
sha256: 679152fb54f3d0ad689e69eeea2c926476a92378ae856522e5abbebca6b8e9e5
lines: 61
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/sidebar-atoms.ts

## 1. 结论与边界

**侧边栏状态 Atoms**（`apps/electron/src/renderer/atoms/sidebar-atoms.ts:1-5`）：视图模式（活跃/已归档）、**后台静默自动归档的未读红点**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SidebarViewMode` | type | `:12` | active/archived |
| `sidebarViewModeAtom` | atom | `:15` | 视图模式 |
| `archivedUnreadAtom` | atom | `:21` | 归档未读红点 |
| `useArchivedUnreadSync` | hook | `:27-40` | **全局订阅静默归档广播**（须应用根部常驻挂载，`:24-25`） |
| `WorkspaceSortMode` | type | `:43` | default/recent/name |
| `workspaceSortModeAtom` | atom | `:46-49` | 排序方式（localStorage） |
| `projectListHeightAtom` | atom | `:52-55` | 项目列表高度（localStorage） |
| `leftSidebarWidthAtom` | atom | `:58-61` | 左栏宽度（localStorage） |

## 3. 内部逻辑与关键流程

- `useArchivedUnreadSync`（`:27-40`）：`window.electronAPI.onArchivedUnreadChanged`→count>0 点亮红点；`disposed` 防泄漏。
- 三个 `atomWithStorage`（`:46-61`）持久化到 localStorage。

## 4. 调用者与调用链

- 消费方：侧边栏/`AgentListenersInitializer`（根部挂载）。
- 出向：`window.electronAPI`（归档广播）、localStorage。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 归档广播 count>0 | `:32` | 点亮红点 |
| 卸载 | `:34-37` | disposed+unsubscribe |

## 7. 权限与权威状态

「须在应用根部常驻挂载…保证侧栏收起时事件不丢失」（`:25`）——订阅生命周期契约。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

8 个导出、根部挂载契约已证实（`:12-61`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 8 个导出 | `:12-61` | covered |
