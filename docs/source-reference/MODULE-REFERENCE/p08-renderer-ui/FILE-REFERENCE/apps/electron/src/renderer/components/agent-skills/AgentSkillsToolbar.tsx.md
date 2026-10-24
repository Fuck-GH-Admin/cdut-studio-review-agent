---
path: apps/electron/src/renderer/components/agent-skills/AgentSkillsToolbar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5b0058ea2bea5ff0f349b041dacb062951934ce
sha256: 1806f166e98ad8968d564e57e4d4a65a355e7c70d36373aa95da0a95f9ab5348
lines: 145
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/AgentSkillsToolbar.tsx

## 1. 结论与边界

**Agent 技能页唯一工具条**（`apps/electron/src/renderer/components/agent-skills/AgentSkillsToolbar.tsx:40`）：工作区与全局**只替换数据和权限，不再各自维护布局**。

## 2. 导出与关键符号

`export` 共 **4 个**（`:13`-`:41`）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentSkillsToolbarDomain` | type | `:13-14` | `"skills" \| "marketplace" \| "mcp" \| "memory" \| "presets"` |
| `AgentSkillsToolbarScope` | type | `:15` | `"workspace" \| "global"` |
| `AgentSkillsToolbarTab` | interface | `:17-21` | `{value: AgentSkillsToolbarDomain; label: string; count?: number}` |
| `AgentSkillsToolbar` | 组件 | `:41-145` | 唯一工具条 |

## 3. 内部逻辑与关键流程

工作区/全局两态渲染同一布局（`:40`）；Tab 切换、搜索、创建/导入入口（按权限显隐）。

## 4. 调用者与调用链

- 消费方：AgentSkillsView（工作区/全局）。
- 出向：React。

## 5. 数据 I/O、读写与副作用

无 I/O（回调驱动）。

## 6. 分支、失败、取消与恢复

工作区/全局数据与权限差异（`:40`）。

## 7. 权限与权威状态

**布局统一、权限按态显隐**（`:40`）——工作区/全局无重复布局。

## 8. 修改影响面

`AgentSkillsToolbarTab` 合同；工作区/全局权限显隐。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

4 个导出、统一布局约定已证实（`:13-145`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:13-145` | covered |
