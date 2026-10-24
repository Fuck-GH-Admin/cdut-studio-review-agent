---
path: apps/electron/src/renderer/components/agent-skills/AgentSkillsView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 697c811e7d9a1b7252ba0329af0858403fc73098
sha256: 2042ffb073fd3837e987a7905e435a7087df6c620d05784bd977d774f172fe24
lines: 1157
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/AgentSkillsView.tsx

## 1. 结论与边界

**「Agent 技能」全屏视图**（`apps/electron/src/renderer/components/agent-skills/AgentSkillsView.tsx:2-9`）：侧边栏触发全屏（隐藏 TabBar 与右侧文件面板）。结构：顶部标题+工作区切换下拉；工具条 Skills/MCP 切换+搜索+社区市场（占位）+新增；内容能力卡片网格（商店风）→右侧详情抽屉。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentSkillsView` | 组件 | `:65-1157` | 全屏视图 |

## 3. 内部逻辑与关键流程

工作区切换→数据加载（Skill/MCP 列表）→卡片网格→详情抽屉（`SkillDetailSheet`/`McpDetailSheet`）；Skills/MCP 切换；搜索过滤；创建/导入入口。

## 4. 调用者与调用链

- 消费方：侧边栏「Agent 技能」入口。
- 出向：Skill/MCP API、同批子组件（Toolbar/Card/DetailSheet/ImportDialog）。

## 5. 数据 I/O、读写与副作用

经 API 加载/操作；无本地写。

## 6. 分支、失败、取消与恢复

空态/加载态；操作失败 toast。

## 7. 权限与权威状态

工作区切换（`:7`）；社区市场占位（`:8`）。

## 8. 修改影响面

- 全屏布局（隐藏 TabBar/文件面板）。
- 子组件合同（同批）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、三段结构已证实（`:2-9`、`:65-1157`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `AgentSkillsView` | `:65-1157` | covered |
| 结构注释 | `:2-9` | covered |
