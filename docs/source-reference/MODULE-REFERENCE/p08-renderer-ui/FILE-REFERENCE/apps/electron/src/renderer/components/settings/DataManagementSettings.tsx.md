---
path: apps/electron/src/renderer/components/settings/DataManagementSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e00fd52b4b922dd29809094e6721b7ef4054812d
sha256: 950c7b6a8bc9545b1c5b9e72a3fa1f5b5e998fbe9f8ce96e907b804721a23424
lines: 1013
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/DataManagementSettings.tsx

## 1. 结论与边界

**数据管理（迁移+磁盘）**（`:1-6`）：上半=数据迁移（导入/导出备份，MigrationSettings 的内联现行版）；下半=磁盘管理（存储用量、自动清理、深度清理、**会话压缩**）。注释声明 `SessionCompactionResult` 与 `main/lib/agent-session-compaction.ts` 对应（`:107`）。

## 2. 导出与关键符号

1 导出：`DataManagementSettings`（`:142`）。类型组：Migration 6 类型+`COMPONENT_LABELS` 5 项（`:47-81`，同 MigrationSettings 同源）；存储 3 接口 `StorageCategory/StorageStats/CleanupResult`（`:85-105`）；`SessionCompactionResult` 11 字段（`:108-121`）；`formatBytes`（`:123`）、`BAR_COLORS` 6 色（`:131`）。内部 `MigrationSection`/`StorageSection`（`:571`）/`ModeCard`（`:994`）。

## 3. 内部逻辑与关键流程

- MigrationSection：双模式卡（personal/share）+组件勾选+share 多工作区预览（`migrationGetShareExportPreview`→wsSelections 全选初始化）+导出按钮（禁用条件=无工作区或 share 空选，`:509`）；导出结果条+warnings（"已跳过 N 项"，`:538`）；导入→`migrationImportDialogOpenAtom`（`:555`）。
- StorageSection（`:571-`）：`getStorageStats` 统计+`getSettings` 自动清理开关（`autoCleanupTempOnStart`/`autoCleanupArchivedDays`，`:597-600`）；分类清理 `handleCleanCategory`（orphansOnly 两种）；会话压缩 preview/result 双态（`SessionCompactionResult`，compacting 忙态）。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（data-management 标签，本批）。
- 出向：agent-atoms（消息刷新/缓存失效：`agentMessageRefreshAtom`/`agentSDKMessagesCacheAtom` 等）、migration-atoms、`window.electronAPI.migration*/getStorageStats`/`cleanupStorage`（分类/孤儿清理 `:607,:639`）/`cleanupTempStorage`（临时清理 `:625`）/`previewSessionCompaction`（整理预检 `:677`）/`applySessionCompaction`（整理执行 `:691`）等（主进程域外）。

## 5. 数据 I/O、读写与副作用

导出写 .profer-backup（**含解密 API Key**，警示 `:498-501`）/.profer-share（凭据剥离）；清理删除磁盘数据；压缩重写会话文件（备份目录字段 `backupDir` `:119`）。

## 6. 分支、失败、取消与恢复

导出失败→错误条；warnings 部分跳过；清理 errors 数组收集（`:104`）；压缩错误列表+backupDir 兜底（`:119,120`）。

## 7. 权限与权威状态

备份泄露面=Personal 含 API Key（警示文案）；清理/压缩不可逆面=有 backupDir 兜底声明（照实记录）。

## 8. 修改影响面

数据备份/恢复主入口；磁盘占用治理；会话体积压缩。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双模式导出/导入/统计/清理/压缩结构 | 已证实 | `:1-1013` 全文（中段 UI 分段读） |
| SessionCompactionResult 与 main/lib 对应关系 | 推断（注释声明） | `:107`；实现域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+类型组+2 Section | §2/§3 | 47-1013 | covered |
