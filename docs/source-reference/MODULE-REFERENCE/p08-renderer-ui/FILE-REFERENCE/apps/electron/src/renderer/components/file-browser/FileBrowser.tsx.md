---
path: apps/electron/src/renderer/components/file-browser/FileBrowser.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d83907eace733acbd8ec4ba7d1bf2e114b39327
sha256: edcab2c4534b564cc631022130ea1f56ca6e3f1ca1c25d41daedb9c9cbd6b5c1
lines: 1323
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FileBrowser.tsx

## 1. 结论与边界

通用文件浏览器面板（运行时组件，1323 行）：懒加载树展开、单击选中、Cmd/Ctrl+Click 多选、三点菜单（添加到聊天/文件夹中显示/重命名/移动/删除）、删除确认、原位重命名（同名检查）、自动刷新、列表/网格双视图、**团队网盘模式**（workspaceId 时经 teamFile IPC 走清单/上传/下载）与个人模式（listDirectory/文件操作 IPC）双轨（`apps/electron/src/renderer/components/file-browser/FileBrowser.tsx:1-11/:108-118`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `computeRevealAncestors` | 函数 | 80-98 | 目标相对 rootPath 的祖先目录集合（自动定位展开） |
| `isPathUnderRoot` | 函数 | 101-106 | 路径是否在 rootPath 内 |
| `FileBrowser` | 组件 | 169-… | 主组件（导出仅此 3 项） |

内部：`stripIpcErrorPrefix:65-71`、`friendlyDeleteError:74-77`、`buildFileTree:126-167`（扁平→树，目录前文件后，团队模式用）、`FileGridView:706-802`（卡片视图+自定义三点菜单 :739-773）、`formatSize:804-809`、`FileTreeItemProps:813-848`、`FileTreeItem:850-1323`（递归树行）。

## 3. 内部逻辑与关键流程

- 状态群（`:170-228`）：entries/loading/uploading/dragOver/viewMode/error/filesVersion；**自动定位** autoReveal+revealAncestors+select 脉冲去重消费（`:180-203`）；最近修改 60s 竖条（`:206-218`）；selectedPaths/deleteTarget/renamingPath/moving；`loadSeqRef` 防乱序（`:235`）。
- 加载：`loadRoot:237-268`（团队 `teamFile.getManifest`→`buildFileTree`，`.catch(()=>null)` 保留旧列表 `:244-246`；个人 `listDirectory:257`）；`filesVersion` 变化重载（`:366-368`）。
- 文件操作：上传 `handleFileUpload:271-307`（团队 teamFile.upload/个人 saveFilesToWorkspaceFiles）；预览 `handlePreviewFile:338-351`（团队先 `ensureTeamFileLocal:331-336` 下载落盘）；重命名 `handleRename:434-467`（同名检查 `:444-452`，团队拒接 `:439-443`）；删除 `handleDelete:476-499`/`handleMoveToTrash:502-517`（确认对话框 `:673-700`）；移动 `handleMove:520-542`（团队 return）；显示于文件夹 `:406-421`。
- 树行 `FileTreeItem`：懒加载展开+空目录 800ms 重试（`toggleDir:967-1006`）；**reveal 自动定位**（祖先展开→滚动→flash 1200ms，`:899-957`）；原位重命名（延时聚焦只选主文件名 `:1031-1052`）；三点菜单（预览/下载 cloud-only/加聊天/显示/默认应用/重命名/移动/删除，`:1178-1268`）；删后刷新（`:1019-1029`）。

## 4. 调用者与调用链

入向：侧栏文件区/内嵌视图（非本批）。出向：`./{FileTypeIcon,DefaultAppMenuItem,tree-row-layout}`（tree-row-layout 非本批）、`@/atoms/agent-atoms`、`@/lib/file-utils`、`@profer/ui` primitives、sonner、`window.electronAPI.*`（teamFile.*/listDirectory/renameFile/deleteFile/moveToTrash/moveFile/openFolderDialog/showItemInFolder/openFile 等 15+ IPC，全列于证据报告）。

## 5. 数据 I/O 与副作用

IPC 文件系统/团队网盘全套；toast 通知；隐藏 file input 上传。

## 6. 分支、失败、取消与恢复

失败分类：加载 setError 清空（`:260-264`）+乱序防护（`:234-235/:255-266`）；重命名失败/同名冲突 toast（`:448/:462-466`）；删除失败 toast（`:494-497`）；移动失败仅 console.error（`:537-538`，如实登记）；目录列举失败静默跳过（`:453-455`）。

## 7. 权限与权威状态

团队/个人双轨语义分流（多处 `workspaceId` 分支）；下载仅 cloud-only（`:755/:1204`）；候选目录授权 `candidateBasePaths=[rootPath]`（`:1236`）。

## 8. 修改影响面

teamFile.* IPC 契约与网盘后端同步；tree-row-layout 布局契约；autoReveal atom 与 FileSearchBar 定位协议。

## 9. 测试证据

无专属测试（glob `**/FileBrowser*test*` 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+双轨文件操作+树行交互 | 已证实 | `:1-1323`（子代理两段逐行全读 1-700/700-1323） |
| 疑点照实 | 已证实 | `:751` 合成 MouseEvent 强转、`:1005` 展开时序、`:1235` resolveFilePath 条件与 cloud-only 不一致、`:897/:957` eslint-disable 收窄依赖、多选菜单回调单 entry（聚合在父，unknown）——详见 UNVERIFIED |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/双轨操作/树行 | §2/§3 | 65-1323 | covered |
| 拖放/搜索 UI | — | — | 拖放在 `handleDrop:354-364`；搜索在 FileSearchBar（另篇） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
