---
path: packages/shared/src/types/runtime.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c043a3941ad0e9b56a1e1a3a43cc5c7319ca3d03
sha256: 855a781640bc714f108a0bf1a9dcf45f066ca71d210dd25cca1ec1e81302314c
lines: 443
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/runtime.ts

## 1. 结论与边界

运行时环境与工具链**类型/常量模块**（`packages/shared/src/types/runtime.ts`，443 行）：平台/架构、Bun/Node/Git 状态、文件 diff/预览、Wsl/Shell 环境、IPC 通道、截图限制。纯声明。

## 2. 导出与关键符号

`export` 共 **35 个**，按语义分 7 组：

**A. 平台（`:9-27`）**：`Platform`（darwin/linux/win32）、`Architecture`（arm64/x64）、`PlatformArch`（组合，`:20`）。

**B. 工具链状态（`:30-97`）**：`BunDownloadInfo`（`:30`）、`BunRuntimeStatus`（`:44`）、`NodeRuntimeStatus`（`:60`）、`GitRuntimeStatus`（`:74`）、`GitRepoStatus`（`:88`）。

**C. Git 变更（`:100-153`）**：`ChangedFileStatus`（modified/deleted/untracked）、`ChangeSource`（session/workspace/both/none，`:103`）、`ChangedFileEntry`（`:106`）、`UntrackedFileEntry`（`:122`）、`UnstagedChangesResult`（`:130`）、`WorktreeInfo`（`:142`）。

**D. 文件操作（`:156-240`）**：`GetFileDiffInput`（`:156`）、`DetachedPreviewWindowInput`/`DetachedPreviewWindowData`（`:168-190`）、`RevertFileInput`（`:193`）、`FileAccessOptions`（`:203`）、`ResolvedFileUrl`（`:215`）、`FileSearchCandidateRequest`/`Result`（`:222-240`）。

**E. 预览与终端环境（`:243-359`）**：`OfficePreviewKind`（spreadsheet/presentation，`:243`）、`OfficePreviewResult`（`:246`）、`GitBashStatus`（`:256`）、`EditorApp`/`DefaultAppInfo`（`:268-285`）、`WslStatus`（`:288`）、`ShellEnvironmentStatus`（`:304`）、`RuntimeStatus`（`:316`）、`RuntimeInitOptions`（`:334`）、`ShellEnvResult`（`:350`）。

**F. IPC（`:362-421`）**：`IPC_CHANNELS`（运行时工具链通道集，`:362`）、`IpcChannel`（`:421`，keyof 推导）。

**G. 截图限制（`:430`）**：`SCREENSHOT_LIMITS`。

## 3. 内部逻辑与关键流程

无逻辑。`ChangeSource` 四态（`:103`）区分会话/工作区变更归属；`PlatformArch`（`:20-27`）是平台×架构组合类型。

## 4. 调用者与调用链

- 消费方：运行时检测服务（Bun/Node/Git/Wsl/Shell 环境自检）、文件 diff/预览 IPC、渲染层设置页；`IPC_CHANNELS` 是跨进程契约。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无运行时行为。

## 6. 分支、失败、取消与恢复

不适用。

## 7. 权限与权威状态

无身份语义；`FileAccessOptions`/`ResolvedFileUrl` 是文件访问契约形状（校验在消费方）。

## 8. 修改影响面

- `IPC_CHANNELS`/`IpcChannel` 变更需同步运行时 IPC 注册与 preload。
- `RuntimeStatus` 聚合字段是设置页自检的数据源。

## 9. 测试证据

- 纯类型无专属测试（全树检索命中 0）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 35 个导出、7 组语义 | 已证实 | `grep -n "^export"` 全表 |
| 无逻辑 | 已证实 | 全文声明 |
| 运行时自检行为 | 未知 | 不在本批 |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 平台 | `:9-27` | covered |
| B 工具链状态 | `:30-97` | covered |
| C Git 变更 | `:100-153` | covered |
| D 文件操作 | `:156-240` | covered |
| E 预览/环境 | `:243-359` | covered |
| F IPC | `:362-421` | covered |
| G 截图限制 | `:430` | covered |
