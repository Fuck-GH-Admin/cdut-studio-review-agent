---
path: apps/electron/src/renderer/components/agent-skills/CreateGlobalSkillDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec35066df1c2a84c2063f6732d961148c589b73a
sha256: 3290735975ecec06bf00fcb5116ade1722742b5ae394a3285817ae82d75c71b1
lines: 50
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/CreateGlobalSkillDialog.tsx

## 1. 结论与边界

**新建全局 Skill 对话框**（`apps/electron/src/renderer/components/agent-skills/CreateGlobalSkillDialog.tsx`，50 行）：保存为用户全局 Skill；**工作区生效范围可在详情页单独添加**（`:41` 文案）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CreateGlobalSkillDialog` | 组件 | `:15-50` | `{open, onOpenChange, onCreated}` |

## 3. 内部逻辑与关键流程

`create`（`:26-37`）：slug/name 必填（`:27`）→`window.electronAPI.globalSkill.createUser(slug, name, description, content)`（`:30`）→toast+关闭；失败 toast。

## 4. 调用者与调用链

- 消费方：MasterSkillsTab（全局 Skill 区）。
- 出向：`window.electronAPI.globalSkill.createUser`（IPC）。

## 5. 数据 I/O、读写与副作用

IPC 创建全局 Skill；toast。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 缺必填 | `:27` | toast 拒 |
| 创建失败 | `:35` | toast error |

## 7. 权限与权威状态

全局=用户级（`:41`）；生效范围另设（详情页）。

## 8. 修改影响面

`globalSkill.createUser` IPC 契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、创建链 | 已证实 | `:15-50` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CreateGlobalSkillDialog` | `:15-50` | covered |
