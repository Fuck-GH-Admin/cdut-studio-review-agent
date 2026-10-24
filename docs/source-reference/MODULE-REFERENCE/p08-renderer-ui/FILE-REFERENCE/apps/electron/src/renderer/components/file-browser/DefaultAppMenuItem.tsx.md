---
path: apps/electron/src/renderer/components/file-browser/DefaultAppMenuItem.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 53e7875250d5aabd6e180ce4b82614d2fb2fab11
sha256: 004821daf5db7adc4bacd71eb9642559178899fbec761d64b6d2d179ab8b7bd5
lines: 58
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/DefaultAppMenuItem.tsx

## 1. 结论与边界

「用默认 App 打开」下拉菜单项（运行时组件）：探测本机该文件类型注册的默认 App，动态显示「用 XX 打开」+App Logo；探测失败（图标读取失败/未注册/平台不支持）整个菜单项不渲染（`apps/electron/src/renderer/components/file-browser/DefaultAppMenuItem.tsx:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DefaultAppMenuItemProps` | 接口 | 12-19 | filePath/probePath?/className?/resolveFilePath?/candidateBasePaths? |
| `DefaultAppMenuItem` | 组件 | 21-58 | 唯一导出组件 |

## 3. 内部逻辑与关键流程

`useDefaultAppForFile(probePath ?? filePath)`（`:28`）；info null→返 null（`:30`）；onSelect 异步：`resolveFilePath` 兜底→`systemOpenFile(targetPath, undefined, {candidateBasePaths})`（`:36-43`）；失败 console.error（`:44-46`）。

## 4. 调用者与调用链

入向：FileBrowser 三点/树行菜单（`FileBrowser.tsx:1231-1239`）。出向：`@profer/ui/primitives/dropdown-menu`、`@/hooks/useDefaultAppForFile`（非本批）、`window.electronAPI.systemOpenFile`。

## 5. 数据 I/O 与副作用

IPC `systemOpenFile`；读默认 App 信息（经 hook）。

## 6. 分支、失败、取消与恢复

探测失败不渲染（`:30`）；resolveFilePath 返 null 中止（`:38`）；打开失败 console.error 不抛。

## 7. 权限与权威状态

`candidateBasePaths` 供 IPC 授权上下文（`:17-18/:42`）。

## 8. 修改影响面

hook/IPC 契约同步；菜单挂载方（FileBrowser）。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+降级渲染 | 已证实 | `:1-58` |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
