---
path: apps/electron/src/renderer/components/agent-skills/ImportSkillDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b1d10539018db3b67e1d7ba1db930cc992b0fd8
sha256: 64a2408a3f2796acae49f95d1618cdde0cb43b613a31f550ca6d616b7e983cc8
lines: 172
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/ImportSkillDialog.tsx

## 1. 结论与边界

**从其他工作区导入 Skill**（`apps/electron/src/renderer/components/agent-skills/ImportSkillDialog.tsx:1-5`）：列出其他工作区可用 Skill（**自动过滤已安装同名项**）；选择来源一键导入当前工作区；逻辑迁移自原 AgentSettings。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ImportSkillDialog` | 组件 | `:25-172` | `{open, onOpenChange, workspaceSlug, installedSkills, onImported}` |

## 3. 内部逻辑与关键流程

来源列表（滤已安装同名，`installedSkills` 参数）→选择→导入→`onImported`。

## 4. 调用者与调用链

- 消费方：AgentSkillsView（导入入口）。
- 出向：Skill API（导入）。

## 5. 数据 I/O、读写与副作用

经 API 导入。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 同名已安装 | `:4` | 过滤不列 |
| 导入失败 | — | toast |

## 7. 权限与权威状态

**过滤已安装同名**（`:4`）防重复；导入到当前工作区。

## 8. 修改影响面

导入 API 契约；`installedSkills` 参数。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、过滤同名已证实（`:1-172`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ImportSkillDialog` | `:25-172` | covered |
