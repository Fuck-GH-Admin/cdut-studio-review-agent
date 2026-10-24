---
path: apps/electron/src/renderer/hooks/useMigrationImport.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1f112f815930fa95d36a8059818bfb9aecef66d7
sha256: 53475eb77cc976102b4b39bf14f558ace23c7f214e8fadb33f5e80683ce7dd8c
lines: 212
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useMigrationImport.ts

## 1. 结论与边界

**迁移导入流程 hook**（212 行）：选文件→解析预览（路径检查/工作区预览）→路径映射/工作区映射/冲突解决→确认导入→结果。支持 v2 多工作区格式（`isV2` 判定 `:79`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ImportPreview` | 接口 | `:11` | manifest/计数/skillNames/hasMcp/crossPlatform/pathCheckResults/tempDir/workspaces? |
| `WorkspaceImportPreviewItem` | 接口 | `:34` | 存在性+冲突清单 |
| `WorkspaceImportMapping` | 接口 | `:45` | `merge|create|skip`+目标 |
| `useMigrationImport(initialFilePath?)` | Hook | `:70` | 返回状态+7 动作（接口 `:52-68`） |

## 3. 内部逻辑与关键流程

- `initFromPreview`（`:87-107`）：路径检查不存在项→映射 null 初值；v2→工作区映射默认 `existsLocally?merge:create`。
- `parseFile/handleSelectImportFile`（`:109-148`）：`migrationParseImportFile`（文件对话框或 initialFilePath 直解析）；失败→importResult 错误。
- `handleConfirmImport`（`:150-169`）：`migrationConfirmImport({tempDir, manifest, pathMappings, conflictResolution?（有冲突才传）, workspaceMappings?（v2）})`。
- `hasConflicts`（`:81-85`）：merge 动作的工作区存在 skill/mcp 冲突。
- `reset`（`:181-193`）：**清理主进程临时解压目录**（migrationCancelImport）+全状态复位。

## 4. 调用者与调用链

- 入向：迁移导入对话框（DataManagementSettings 的 MigrationImportDialog，域外）。
- 出向：`window.electronAPI.migration*`（OpenFileDialog/ParseImportFile/ConfirmImport/CancelImport）。

## 5. 数据 I/O、读写与副作用

IPC 解析/导入/取消；主进程临时目录生命周期（reset 清理）。

## 6. 分支、失败、取消与恢复

v1/v2 双格式；冲突双解（overwrite/skip）；解析/导入失败→importResult；reset 清临时目录（`.catch(()=>{})` 容忍失败 `:184`）。

## 7. 权限与权威状态

导入执行权威=主进程 migration 服务；冲突解决语义由 conflictResolution 参数承载。

## 8. 修改影响面

备份导入全链（.profer-backup/.profer-share）；临时目录清理正确性防磁盘残留。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| v2 映射默认/冲突判定/reset 清理 | 已证实 | `:1-212` 全文 |
| 主进程导入实现 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+状态机 | §2/§3 | 11-211 | covered |
