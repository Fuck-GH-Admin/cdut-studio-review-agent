---
path: apps/electron/src/renderer/components/agent-skills/ImportPresetDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 74a4e659f3d2342bd17a9998a120cde24ffc1dbe
sha256: 86db1b672bcf7f59d85b6bcf5bb38400bf17b1cd584d41893f7d19c348aa38ef
lines: 147
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/ImportPresetDialog.tsx

## 1. 结论与边界

**从其他工作区导入预设**（`apps/electron/src/renderer/components/agent-skills/ImportPresetDialog.tsx:1-6`）：列出其他工作区可用自定义预设（**自动过滤内置**）；选择来源一键导入当前工作区（**深拷贝+新 UUID**）；逻辑与 ImportSkillDialog **同构**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ImportPresetDialog` | 组件 | `:27-147` | `{open, onOpenChange, workspaceSlug, onImported}` |

## 3. 内部逻辑与关键流程

来源工作区列表（滤内置）→选择→导入（深拷贝+新 UUID，`:5`）→`onImported`。

## 4. 调用者与调用链

- 消费方：AgentPresetSettings（导入入口）。
- 出向：预设 API（导入）。

## 5. 数据 I/O、读写与副作用

经 API 导入；无本地写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无可用来源 | — | 空态 |
| 导入失败 | — | toast |

## 7. 权限与权威状态

**深拷贝+新 UUID**（`:5`）——导入不复用来源身份；内置预设不可导入（`:4`）。

## 8. 修改影响面

导入 API 契约；与 ImportSkillDialog 同构（`:6`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、深拷贝新 UUID 已证实（`:1-147`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ImportPresetDialog` | `:27-147` | covered |
