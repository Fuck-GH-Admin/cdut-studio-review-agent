---
path: apps/electron/src/renderer/components/agent-skills/SkillDetailSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 944ae79a5a1066c81f21aa44432fd20ac9011fe4
sha256: feb6ff38ab92f185060e953d18114ec482442a86df1aa3c93c3e797bc5c9e24a
lines: 474
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SkillDetailSheet.tsx

## 1. 结论与边界

**Skill 详情右侧抽屉**（`apps/electron/src/renderer/components/agent-skills/SkillDetailSheet.tsx:1-5`）：元数据、SKILL.md 可编辑、资源文件树（复用 `SkillFilesPanel`）、启用/更新/卸载/打开目录操作。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillDetailSheet` | 组件 | `:42-474` | Skill 详情抽屉 |

## 3. 内部逻辑与关键流程

`SkillDetailLayout`（同批）承载布局；`SkillDetailHeader` 承载标题/操作；SKILL.md 编辑保存；文件树（`SkillFilesPanel` 复用）；启用/更新/卸载/打开目录操作。

## 4. 调用者与调用链

- 消费方：AgentSkillsView/MasterSkillsTab（卡片点击）。
- 出向：Skill API、`SkillDetailLayout`/`SkillDetailHeader`/`SkillFilesPanel`。

## 5. 数据 I/O、读写与副作用

经 API 保存/操作；无本地写。

## 6. 分支、失败、取消与恢复

保存失败 toast；操作确认。

## 7. 权限与权威状态

Skill 作用域（工作区/全局）经插槽差异表达（SkillDetailLayout 契约）。

## 8. 修改影响面

Skill API 契约；`SkillFilesPanel` 合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:42-474`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `SkillDetailSheet` | `:42-474` | covered |
