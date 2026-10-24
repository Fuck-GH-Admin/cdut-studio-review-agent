---
path: apps/electron/src/renderer/components/agent/WorkspaceSelector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e5b61e2c1621f4ce9b08d7fad24f473027b7d56e
sha256: 16b63b334a07fb4cea728fd2e743b7121af3ffeabcee82b4f9d400f431883f5b
lines: 437
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/WorkspaceSelector.tsx

## 1. 结论与边界

Agent 项目切换器（文件头 `apps/electron/src/renderer/components/agent/WorkspaceSelector.tsx:2-6`）：垂直项目列表，支持新建/重命名/删除/切换/拖拽排序；切换后持久化到 workspace 设置。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出（类/常量/接口 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `WorkspaceSelector` | 组件（导出） | 28-437 | 全部逻辑内聚于组件 |

内部分段：高度拖拽（`:45-74`，clamp 80-400，`:56`；实际渲染高为起点防不跟手 `:50-51`）；新建（`:101-122`，Enter/Escape+**isComposing 防输入法回车误触** `:116`）；重命名（`:126-164`，IPC `updateAgentWorkspace`+toast；空名取消 `:140-143`）；删除（`:168-198`，AlertDialog 确认——**删除仅移除配置、目录保留**（`:420` 文案）；`canDelete`：default slug 保护+至少保留 1 个 `:196-198`；删当前项目回退 default/首个 `:185-188`）；拖拽排序（`:202-278`：上/下半区 before/after+**中线 30% 死区防横线闪烁** `:215-228`；插入索引 splice 调整 `:255-257`；**只重排可见项目保隐藏团队工作区** `:259-267`；`reorderAgentWorkspaces` 持久化 `:273`）。

## 3. 内部逻辑与关键流程

切换（`:94-97`）：编辑态禁切换。拖拽 drop 前置校验（dragId/dropIndicator 一致，`:242-248`）。列表高度 `projectListHeightAtom` 持久化；resize 时禁选/`row-resize` 光标，清理回调（`:42,59-71`）。

## 4. 调用者与调用链

入向：侧栏项目区（index.ts re-export `:8`）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai atoms（`sidebar-atoms`/`agent-atoms`）、`@/hooks/useProjectActions`、`@profer/ui/primitives/alert-dialog`、`window.electronAPI`（update/delete/reorder/list）。

## 5. 数据 I/O、读写与副作用

IPC：`updateAgentWorkspace`/`deleteAgentWorkspace`/`reorderAgentWorkspaces`/`listAgentWorkspaces`/`listAgentSessions`；DOM：document 监听器/光标/选择态；本地状态（creating/editing/deleteTarget/drag）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 重命名失败 | toast.error | 148-150 |
| 删除失败 | console.error | 189-190 |
| 空名 | 静默取消 | 140-143 |
| default/最后一个 | 禁删 | 196-198 |
| 删当前项目 | 回退 default/首个 | 185-188 |
| drop 无效 | 清态返回 | 242-248 |
| isComposing | 忽略 Enter | 116,158 |

## 7. 权限与权威状态

项目列表权威=workspace 设置（持久化排序/删除）；隐藏团队工作区数据不被重排覆盖（`:259`）。

## 8. 修改影响面

改 CRUD/排序影响项目管理；改状态机影响交互。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| default 保护/删当前回退 | 已证实 | `:185-198` |
| 可见重排保隐藏数据 | 已证实 | `:259-267` |
| 死区/输入法守卫 | 已证实 | `:116,215-228` |
| 渲染/IPC 行为 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件全量 | §2,§3 | 28-437 | covered |
| 断言 | §9,§10 | — | unknown |
