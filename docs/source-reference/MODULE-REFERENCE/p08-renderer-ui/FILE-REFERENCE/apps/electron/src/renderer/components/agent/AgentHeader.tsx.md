---
path: apps/electron/src/renderer/components/agent/AgentHeader.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f0e2e8624bba02dea173bb0b58363afde5b1ffa6
sha256: 6c9ec694e29ea291a2faf8e57602a9d10394c7a2049b222051e949f3a13501ec
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AgentHeader.tsx

## 1. 结论与边界

Agent 会话探索入口（文件头 `:1-6`）：会话标题已收敛到顶部 TabBar；此处保留轻量探索菜单，使关闭右侧 Tab 后仍可从持久化 session 元数据重开分支。React 函数组件（jotai 状态 + DropdownMenu）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentHeader` | function 组件 | `:27-65` | `({sessionId}) => ReactElement \| null`（无分支返回 null） |

内部：`AgentHeaderProps`（`:23-25`）；`branches` useMemo（`:29-34`，过滤 `explorationParentSessionId===sessionId && explorationSourceMessageId` 非空、按 updatedAt 降序）；`reopen`（`:37-40`，`openExplorationBranchTab(getDefaultStore(), sessionId, {sessionId,title}, {autoGroup:true})`——分支是顶栏 Tab，重开=建 Tab 并激活、必要时与父会话自动并排）。

## 3. 内部逻辑与关键流程

`branches.length===0` → null（`:42`）；否则“探索”下拉（Split 图标 + >1 时计数徽标 + aria-label “打开 N 个探索分支”）；菜单项按分支列出（标题 truncate），onSelect → `reopen`（guard `explorationSourceMessageId` 非空）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话头部。出向：`jotai`（`useAtomValue`/`getDefaultStore`）、`@/atoms/agent-atoms.agentSessionsAtom`、`@/lib/exploration-tab.openExplorationBranchTab`、`@profer/ui`（Button/DropdownMenu/Z_LAYER）、`lucide-react`。

## 5. 数据 I/O、读写与副作用

读 jotai atom（session 元数据）；点击经 exploration-tab 开 Tab。无直接 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 无分支 | `:42` | null |
| sourceMessageId 缺失 | `:38` | 不重开 |

## 7. 权限与权威状态

分支元数据以持久化 session 为准（explorationParentSessionId/explorationSourceMessageId 绑定）。

## 8. 修改影响面

改分支语义 → 影响探索 Tab 重开；`exploration-tab`/`agent-atoms` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无分支不渲染 | 已证实 | `:42` |
| 重开=建 Tab+autoGroup | 已证实 | `:36-40` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentHeader` | 2/3 | `:27-65` | covered |
