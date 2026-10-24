---
path: apps/electron/src/renderer/components/file-browser/FileSearchBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 564efe313c3f581ee9c41cf6116ee811ddb4b050
sha256: 563edf38ddcf7ed8ffffc3b4e0f0cb083861b0339cd9e023b73ad184fc404ee5
lines: 356
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/FileSearchBar.tsx

## 1. 结论与边界

文件搜索栏（运行时组件）：位于侧栏工作区文件与会话文件之间，关键词搜索全文件；**分别搜索会话目录与工作区目录**保证两边相对路径（`apps/electron/src/renderer/components/file-browser/FileSearchBar.tsx:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FileSearchBarProps` | 接口 | 17-26 | workspaceFilesPath/sessionPath/两组 attachedDirs/placeholder?/sessionId?/onFilePreview? |
| `FileSearchBar` | 组件 | 28-300 | 唯一导出组件 |

内部：`ResultItem`（`:303-356`，单条结果：图标+名+父目录副文本+Tooltip 完整路径）；refs：debounce/abort/**dismissedRef**（手动关闭后防 focus 重弹）/**prevQueryRef**（区分用户输入 vs 父组件 rerender）/**pendingShowRef**（跨 rerun 待显示意图，`:44-51`）。

## 3. 内部逻辑与关键流程

- 防抖搜索 effect（`:67-159`）：300ms debounce+AbortController；双目录并行 `searchWorkspaceFiles`（各限 30 条，`:105-127`）；**rerun 类型判定**——仅用户输入才重置 dismissed/置 pendingShow（`:75-92`）；结果只在「待显示且未手动关闭」时开下拉（`:138-143`）；早退显式复位 searching 防 Loader 永久旋转（`:81-83` 注释）。
- 键盘（`:173-207`）：忽略 IME 组合（`:175`）；Escape 关闭+dismissed+blur；↑↓ 循环；Enter→`setAutoReveal`（`fileBrowserAutoRevealAtom` 自动定位）+仅文件开预览（`:199-201`）。
- 点击外部关闭（`:162-171`）；结果分组渲染（会话/工作区，`:249-297`）；`resolveAbsolutePath` 相对→绝对（POSIX/Windows 分隔符感知，`:58-64`）。

## 4. 调用者与调用链

入向：侧栏文件区布局（非本批）。出向：`./FileTypeIcon`、`@/atoms/agent-atoms`（fileBrowserAutoRevealAtom）、`@profer/ui/primitives/tooltip`、`window.electronAPI.searchWorkspaceFiles`。

## 5. 数据 I/O 与副作用

IPC 文件搜索（双目录）；jotai 写（自动定位）。

## 6. 分支、失败、取消与恢复

搜索失败清结果关下拉（`:144-149`）；abort 跳过复位（`:151`）；无根目录返 null（`:222`）。

## 7. 权限与权威状态

不适用（依据：无 sender/role 检查）。

## 8. 修改影响面

searchWorkspaceFiles IPC 契约；autoReveal atom 与 FileBrowser 定位协议同步。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+防抖/竞态守卫/键盘/自动定位 | 已证实 | `:1-356` 逐行 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/交互/竞态 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
