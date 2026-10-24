---
path: apps/electron/src/renderer/components/migration/MigrationImportDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ed63fb6059a3fe22c7d75fac9d282f3269a73fc
sha256: 93e2600e2c11e3aef605b242b9e44163048671081a30a4fa8a70da6683295f28
lines: 407
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/migration/MigrationImportDialog.tsx

## 1. 结论与边界

配置导入对话框（渲染层运行时）：从 `.profer-backup`/`.profer-share` 备份文件导入，三阶段 UI——选文件→预览与配置（跨平台警告/内容摘要/路径映射/工作区映射/冲突处理）→成功提示（文件头 `MigrationImportDialog.tsx:66-236`）。业务逻辑全在 `useMigrationImport` hook，本文件只做 UI 编排。

边界：不解析备份（hook/主进程）；不执行导入写盘（`handleConfirmImport` 在 hook）；导出流程不在本文件。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（其余内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MigrationImportDialog` | 函数/组件（导出） | 27-237 | `() => React.ReactElement` | 导入对话框 |
| `V1ContentSummary` | 组件（内部） | 241-268 | v1 单工作区摘要 | |
| `V2ContentSummary` | 组件（内部） | 282-407 | v2 多工作区摘要+映射 UI | §3.3 |

## 3. 内部逻辑与关键流程

### 3.1 状态与入口（`:27-64`）

`migrationImportDialogOpenAtom`/`migrationImportInitialFilePathAtom` 驱动（`:28-29`）；`useMigrationImport(open ? initialFilePath : null)` 提供全部动作/状态（`:32-48`）。订阅 `onMigrationOpenImportFile`：外部（如文件关联）传 filePath 直接开窗（`:50-56`）。关闭时 `reset()+setInitialFilePath(null)`（`:58-64`）。

### 3.2 三阶段渲染（`:66-236`）

- 阶段 1（无 preview 且无成功结果）：选文件按钮（`importing` 时「解析中...」），失败结果红字（`:78-106`）。
- 阶段 2（有 preview）：跨平台警告（`importPreview.crossPlatform` 时提示 Skills/MCP 命令路径需手调，`:112-120`）；`isV2 && workspaces` → `V2ContentSummary` 否则 `V1ContentSummary`（`:123-135`）；附加目录处理：`pathCheckResults` 逐项 exists 图标 + 不存在时选择「移除（推荐）/推断路径」（`:138-171`）；确认/取消按钮（`importConfirming` 时「导入中...」，`:174-201`）；失败红字（`:203-208`）。
- 阶段 3（success 且无 preview）：成功提示「请重启应用使所有更改生效」（`:213-232`）。

### 3.3 `V2ContentSummary`（`:282-407`）

内容摘要（工作区数/Agent 会话/Chat 对话/channels/chattools，`:287-305`）；逐工作区映射 UI（`:307-382`）：本地存在绿勾/新建蓝圈（`:316-321`）、Skills/MCP 计数与冲突计数（`:325-336`）、操作 select——merge（本地存在→`localWorkspaceId`，否则选本地工作区）/create（`newWorkspaceName`）/skip（`:339-363`）；merge 且本地不存在时二级 select 选目标工作区（`:365-376`）；冲突（`hasConflicts`）时全局冲突处理 select：overwrite（推荐）/skip（`:384-404`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`renderer/App.tsx:22`（`React.lazy`）、`:105,:125`（两处 `<MigrationImportDialog/>` 挂载）。唯一调用方。

出向：`@/atoms/migration-atoms`/`agent-atoms`（`:19-23`）、`@/hooks/useMigrationImport`（`:24-25`）、`window.electronAPI.onMigrationOpenImportFile`（`:51`）、`@profer/ui` Dialog 原子。

## 5. 数据 I/O、读写与副作用

- 本文件无直接 I/O（IPC 全在 hook）；副作用：事件订阅退订（`:50-56`）；atom 写。
- 并发：`importing`/`importConfirming` 状态防重入（`:88,177`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 三阶段切换 | preview/result 组合 | 78, 109, 213 |
| 跨平台警告 | preview.crossPlatform | 112-120 |
| v1/v2 分派 | isV2 && workspaces | 123-135 |
| 路径处理选择 | exists=false | 152-166 |
| 工作区映射四分支 | merge×2/create/skip | 341-352 |
| 导入失败显示 | result.success=false | 99-104, 203-208 |
| 取消/关闭 | reset | 58-64, 191-195 |

失败/恢复：导入失败留在阶段 2 可改配置重试（静态读出）；无自动恢复。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；导入写盘权威=`useMigrationImport`→主进程迁移服务。冲突处理默认 overwrite「推荐」文案（`:398`）是产品策略展示，非权限。

## 8. 修改影响面

- App.tsx 两处挂载；`useMigrationImport` 返回契约（14 字段，`:32-48`）与 `WorkspaceImportPreviewItem` 形状（`:25`）。
- 备份格式 v1/v2 语义（manifest.components/channels/chattools）与主进程迁移服务耦合。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*`/`*.spec.*` 检索 `MigrationImportDialog` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实导入。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 三阶段 UI | 已证实 | `:27-236` 逐行读 |
| v2 映射四分支+冲突双选 | 已证实 | `:339-404` |
| 唯一调用方 lazy 挂载 | 已证实 | `App.tsx:22,105,125` |
| 失败重试语义 | 已证实（静态） | `:203-208` 留在阶段 2 |
| useMigrationImport/主进程实现 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MigrationImportDialog` | §2-3.2 | 27-237 | covered |
| `V1ContentSummary` | §3.2 | 241-268 | covered |
| `V2ContentSummary` 映射/冲突 | §3.3, §6 | 282-407 | covered |
| 调用链 | §4 | - | covered |
| hook/主进程迁移 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
