---
path: apps/electron/src/renderer/components/agent-skills/CreateWorkspaceSkillDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 19988fd3def545ffa2dcfde5c797f9883cdab302
sha256: 16b8cbe3a3178556feb784952ae0631b4c1e1323dc4eace808f3f47649e6b885
lines: 29
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/CreateWorkspaceSkillDialog.tsx

## 1. 结论与边界

**新建工作区 Skill 对话框**（`apps/electron/src/renderer/components/agent-skills/CreateWorkspaceSkillDialog.tsx`，29 行）：名称/slug 必填、描述、SKILL.md 内容；**创建后仅当前工作区可见生效**（`:28` 文案）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CreateWorkspaceSkillDialog` | 组件 | `:11-29` | `{open, onOpenChange, workspaceSlug, onCreated}` |

## 3. 内部逻辑与关键流程

`create`（`:18-27`）：slug/name 必填校验（`:19`）→`window.electronAPI.createWorkspaceSkill(workspaceSlug, slug, name, description, content)`（`:23`）→toast+`onCreated`+关闭；失败 toast。open 重置状态（`:17`）。

## 4. 调用者与调用链

- 消费方：AgentSkillsView（工作区 Skill 区）。
- 出向：`window.electronAPI.createWorkspaceSkill`（IPC）。

## 5. 数据 I/O、读写与副作用

IPC 创建 Skill；toast 反馈。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 缺必填 | `:19` | toast 拒 |
| 创建失败 | `:26` | toast error |
| saving 中关闭 | `:28` | 忽略 |

## 7. 权限与权威状态

工作区范围（`:28` 文案）；`workspaceSlug` 参数化。

## 8. 修改影响面

`createWorkspaceSkill` IPC 契约；frontmatter 格式（`:22`，注释性构造未使用）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、创建链 | 已证实 | `:11-29` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CreateWorkspaceSkillDialog` | `:11-29` | covered |
