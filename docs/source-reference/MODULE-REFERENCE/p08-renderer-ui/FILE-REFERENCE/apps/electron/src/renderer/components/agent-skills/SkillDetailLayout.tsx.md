---
path: apps/electron/src/renderer/components/agent-skills/SkillDetailLayout.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53a5ee57b38d2d9b24479bee37ffc9277d6e6587
sha256: 539ca8e88cf69ef672484c8fc5b181bcce2ac7e3de23c1bde832f62778cc2fdf
lines: 52
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/SkillDetailLayout.tsx

## 1. 结论与边界

**Skill 详情正文统一布局契约**（`apps/electron/src/renderer/components/agent-skills/SkillDetailLayout.tsx:20-25`）：**作用域差异只能通过 header actions/toolbar/正文 children 三个插槽表达**；抽屉尺寸、标题、元数据/内容正文纵向结构由该组件统一承载。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SkillDetailLayout` | 组件 | `:26-52` | 统一布局（三插槽） |

## 3. 内部逻辑与关键流程

固定纵向结构（标题→元数据→正文）；作用域差异只经三插槽（`:23-24`）——布局强制统一。

## 4. 调用者与调用链

- 消费方：`SkillDetailSheet`/`MasterSkillDetailSheet`。
- 出向：React。

## 5. 数据 I/O、读写与副作用

无 I/O。

## 6. 分支、失败、取消与恢复

空态。

## 7. 权限与权威状态

「只能通过三插槽表达作用域差异」（`:23-24`）是布局契约（防工作区/全局布局分叉）。

## 8. 修改影响面

三插槽合同；抽屉尺寸/纵向结构。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、三插槽契约已证实（`:20-52`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `SkillDetailLayout` | `:26-52` | covered |
