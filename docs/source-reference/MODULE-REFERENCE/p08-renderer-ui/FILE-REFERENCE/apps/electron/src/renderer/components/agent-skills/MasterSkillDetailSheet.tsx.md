---
path: apps/electron/src/renderer/components/agent-skills/MasterSkillDetailSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fd54c0073bfc84664a6b36410efa4eae6bd0967c
sha256: 422069c6cd0f36aa6f1fb97965135b53da7178a1415bc5506cae1602451610bf
lines: 648
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/MasterSkillDetailSheet.tsx

## 1. 结论与边界

**全局元 Skill 详情抽屉**（`apps/electron/src/renderer/components/agent-skills/MasterSkillDetailSheet.tsx:1-5`）：SKILL.md 编辑（**保存自动 bump 版本+生成快照**）、版本历史浏览与回退、「同步到工作区」入口。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MasterSkillDetailSheet` | 组件 | `:152-648` | `{props: Props}` 元 Skill 详情 |

## 3. 内部逻辑与关键流程

SKILL.md 编辑→保存（**自动 bump 版本+生成快照**，`:4`）；版本历史浏览/回退；「同步到工作区」入口。

## 4. 调用者与调用链

- 消费方：MasterSkillsTab（卡片点击）。
- 出向：Skill API（版本/快照/同步）。

## 5. 数据 I/O、读写与副作用

经 API 保存（版本 bump+快照）；无本地写。

## 6. 分支、失败、取消与恢复

保存失败 toast；版本回退确认。

## 7. 权限与权威状态

元 Skill=全局源（版本历史/回退是权威管理面）。

## 8. 修改影响面

版本/快照 API 契约；同步协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、版本 bump/快照已证实（`:1-648`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `MasterSkillDetailSheet` | `:152-648` | covered |
