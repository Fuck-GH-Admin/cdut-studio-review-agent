---
path: apps/electron/src/renderer/components/app-shell/RightSidePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 42932c7008a836b6c4a6bcfc912cba0b6e8a090b
sha256: cb5f0ab537e54b1f2ed71a421a7a900a64ef3464a3b984fd50780b7de816b7c4
lines: 52
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/RightSidePanel.tsx

## 1. 结论与边界

右侧边栏容器（文件头 `:1-7`）：Agent 模式下显示文件面板（样式同 LeftSidebar）；从全局 atom 读当前会话 ID/路径；管理「会话文件/工作区文件/代码改动」Tab 切换。薄适配层（实际面板在 `@/components/agent/SidePanel`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RightSidePanel` | function 组件 | `:20-52` | `({width?}) => ReactElement \| null` |

## 3. 内部逻辑与关键流程

- 读 `appModeAtom`/`currentAgentSessionIdAtom`/`agentSessionPathMapAtom`/`agentDiffPanelTabAtom`；`setActiveTab` 写 per-session Tab Map（`:27-34`，无 sessionId 不写）。
- **非 agent 模式或无会话 → null**（`:36-38`）。
- 渲染 `SidePanel`（sessionId/sessionPath（Map 取，缺省 null）/activeTab（缺省 `'session'`）/onTabChange/width）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AppShell 右侧。出向：`@/atoms/{app-mode,agent-atoms}`、`@/components/agent/SidePanel`。

## 5. 数据 I/O、读写与副作用

atom 读写（per-session Tab 状态）。无 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 非 agent/无会话 | `:36-38` | null |
| 无 sessionPath/Tab 记录 | `:40-41` | null/`'session'` 回退 |

## 7. 权限与权威状态

Tab 状态以 per-session Map 为权威（跨会话互不串）。

## 8. 修改影响面

改绑定 → 影响右侧文件面板；`SidePanel` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批清单中无直接测试文件；`bun test`/typecheck/GUI 均未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 模式/会话门禁 | 已证实 | `:36-38` |
| per-session Tab Map | 已证实 | `:27-41` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `RightSidePanel` | 2/3 | `:20-52` | covered |
