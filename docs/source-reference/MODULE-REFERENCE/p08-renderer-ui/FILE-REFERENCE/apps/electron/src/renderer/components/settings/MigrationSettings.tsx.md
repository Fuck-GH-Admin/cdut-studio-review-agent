---
path: apps/electron/src/renderer/components/settings/MigrationSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c7459b9cab39ea427bd067f6f7b10534ed2eb0a6
sha256: c29361563ec0aaf466f4436d41533adc7b63a12457d88d3a3849d807bdbfc4b1
lines: 521
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/MigrationSettings.tsx

## 1. 结论与边界

**已废弃的独立迁移页**（头注释 `:1-5`：`@deprecated`，数据迁移已内联到 DataManagementSettings 的 MigrationSection；**本文件未被任何入口引用，仅历史参考，勿再接线**）。弃用声明经全树 grep 证实（检索范围：frozen 树 `apps/`+`packages/` 全 `*.ts/*.tsx`，排除本文件后 `MigrationSettings` 0 命中）。

## 2. 导出与关键符号

1 导出：`MigrationSettings`（`:70`）。类型：`MigrationMode`（personal/share，`:34`）、`MigrationComponent` 5 种（`:35`）、`ShareDetailMode`（`:36`）、`ShareExportPreview/WsSelection/ExportResult`（`:38-60`）、`COMPONENT_LABELS`（`:62-68`）。内部 `ModeCard`（`:502`）。

## 3. 内部逻辑与关键流程

（历史实现，`:70-`）：双模式导出——Personal 备份（.profer-backup，全量含解密 API Key，`:8`）/Share 分发（.profer-share，凭据自动剥离，`:9`）；Share 多工作区导出（默认全选/自定义逐选，`:11-13`）；`migrationGetShareExportPreview` 预览→wsSelections 初始化（`:93-`）；导入经 `migrationImportDialogOpenAtom` 打开对话框。与 DataManagementSettings 内联版为同源复制。

## 4. 调用者与调用链

- 入向：**无**（全树 0 引用，检索范围见 §1）。
- 出向：migration-atoms/agent-atoms、`window.electronAPI.migration*`。

## 5. 数据 I/O、读写与副作用

设计上=导出写 .profer-backup/.profer-share 文件、导入弹窗；因无入口实际不可达（除非显式引用）。

## 6. 分支、失败、取消与恢复

（历史实现）导出结果三态+warnings 提示。

## 7. 权限与权威状态

Personal 备份**含解密 API Key**（`:8`）——泄露风险已在其复制版 DataManagementSettings 中警示（"避免泄露其中的 API Key"）。

## 8. 修改影响面

**无运行时影响面**（孤儿文件，全树 0 引用，检索范围见 §1）：修改本文件不改变任何执行路径，仅保留历史参照；风险面=若未来误接线，将与 DataManagementSettings 内联 MigrationSection 形成双源分叉（两文件同源复制，类型/常量逐项同）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| @deprecated+0 引用（含检索范围） | 已证实 | 头注释 `:1-5` + 全树 grep |
| 与 DataManagementSettings 内联版同源 | 已证实 | 类型/常量逐项比对（COMPONENT_LABELS 等） |
| 运行验证 | 未知 | NOT_RUN（且不可达） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+类型组 | §2/§3 | 34-521 | covered（弃用件从简） |
