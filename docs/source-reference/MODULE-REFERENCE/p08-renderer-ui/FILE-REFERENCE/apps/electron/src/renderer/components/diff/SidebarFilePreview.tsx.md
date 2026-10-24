---
path: apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 845bf2a99f3f6f126dd4e1099aaf46df6d8a97b7
sha256: 2f6b466639718707d25d9a626018e62f5fe5bad4b9dd15802e5e37a9322a9818
lines: 270
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx

## 1. 结论与边界

右侧边栏的文件预览宿主（Agent 模式 / AI 速课堂共用）：数据源为会话级 `previewFileMapAtom`，内容统一由只读 `DiffTabContent` 渲染，外面套 `InteractivePreviewViewport`（缩放/平移）；顶栏提供关闭/文件名、路径复制、默认应用打开、文件夹定位、全屏弹窗（`apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx:1-7`）。

边界：

- 不产生预览数据（`PreviewFile` 由 preview-opener 等写入 atom）；不渲染具体内容类型（归 DiffTabContent）。
- 侧栏内 `hideToolbar` 且 `readOnly`（`:240,247`）；编辑能力不在此（全屏弹窗内同样 readOnly，`:102`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SidebarFilePreview` | 函数（导出） | 115-270 | `({sessionId, closeToTab='changes'}) => React.ReactElement` | 预览宿主 |
| `PreviewFullscreenModal` | 内部组件 | 39-113 | `({open,onOpenChange,sessionId,filePath,dirPath,...,fileName})` | 近全屏弹窗（88vh/90vw） |
| `SidebarFilePreviewProps` | 内部接口 | 27-31 | `{sessionId; closeToTab?: 'session'\|'workspace'\|'changes'}` | props |
| `closePreview` | 内部（useCallback） | 127-143 | `() => void` | 关闭预览（两模式不同语义，见 §3） |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx:115-270`：

1. 派生（`:123-125`）：`currentFile = previewFileMapAtom.get(sessionId)`、`sessionPath`、`inAiClass = activeView==='cdut-zone' && cdutSubView==='ai-class'`。
2. **closePreview**（`:127-143`）：AI 速课堂内 → 把 `previewFileMapAtom[sessionId]` 置 null（已 null 保持原引用，`:130`）；否则写 `agentDiffPanelTabAtom[sessionId] = closeToTab`（默认 'changes'，相同值保持引用，`:138`）。两分支互斥（`:128,136`）。
3. 空态（`:145-154`）：`!currentFile` → “尚未打开任何文件”引导文案。
4. 路径派生（`:156-163`）：`dirPath = currentFile.dirPath || sessionPath || resolvePreviewDirPath(filePath, sessionPath)`；默认应用目标/授权经 `getDefaultAppTargetPath`/`getPreviewFileAccess`；`ext` 截取后缀（无 '.' 则空串），`isImagePreview = IMAGE_PREVIEW_EXTS.has(ext)`（控制背景色，`:166`）。
5. 顶栏（`:167-228`）：返回按钮（`closePreview`，tooltip 文案按 `inAiClass` 在「关闭预览/返回文件列表」间切换，`:179`）；路径行点击复制（`navigator.clipboard.writeText` + toast 成功/失败，`:186-190`）；`DefaultAppOpenButton`（`:197`）；全屏按钮（`:202`）；文件夹定位（`showItemInFolder(defaultAppTargetPath, currentFile.basePaths)`，失败仅 console，`:216-217`）。
6. 内容区（`:229-250`）：`InteractivePreviewViewport`（`key = sessionId:filePath:previewRevision`，文件/修订变化即重挂载 `:231`；`memoryKey = previewViewportMemoryKey(sessionId, filePath)` `:232`）内嵌 `DiffTabContent`（`readOnly`、`hideToolbar`、`baseRef`、`initialTargetLine`、`agentPreviewSession` 仅当 `previewRequestId && previewRevision` 成对时传入，`:244-246`）。
7. **PreviewFullscreenModal**（`:39-113`）：`Dialog` 关闭时渲染 `null`（卸载内容释放大文件内存，`:66-69,110`）；`DialogContent hideClose` 88vh/90vw 卡片 + `DialogTitle sr-only`；右上关闭按钮（ESC 同效，`:84-92`）；内嵌完整 `DiffTabContent`（`readOnly` 但**带工具栏**：缩放/平移/搜索全保留，`:94-107`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/AiClassRightTabs.tsx:50`（import）、`AiClassRightTabs.tsx:517`（`<SidebarFilePreview sessionId>`，AI 速课堂右栏）；`apps/electron/src/renderer/components/agent/SidePanel.tsx:37`（import）、`SidePanel.tsx:611`（Agent 模式右栏）。无测试引用（见 §9）。

出向：`./DiffTabContent`、`./InteractivePreviewViewport`、`./DefaultAppOpenButton`、`./preview-open-path`（`getDefaultAppTargetPath`/`getPreviewFileAccess`/`resolvePreviewDirPath`）、`@/atoms/preview-atoms`（`previewFileMapAtom`/`previewViewportMemoryKey`）、`@/atoms/agent-atoms`（`agentDiffPanelTabAtom`/`agentSessionPathMapAtom`）、`@/atoms/active-view`、`@/atoms/cdut-account-atoms`、`@/lib/preview-extension-sets`（`IMAGE_PREVIEW_EXTS`）、`sonner`、`@profer/ui/primitives/dialog|tooltip`。

## 5. 数据 I/O、读写与副作用

- 无磁盘写；IPC 出向：`showItemInFolder`（`:216`）、经 DefaultAppOpenButton 的 `systemOpenFile`/`getDefaultAppForFile`。
- Atom 读写：`previewFileMapAtom`（关闭预览写 null）、`agentDiffPanelTabAtom`（切边栏 Tab）；其余只读。
- 副作用：剪贴板写（路径复制 `:187`）、toast、全屏 Dialog 挂卸。
- 并发：关闭预览的写都是条件复制 Map（幂等保引用）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 无预览文件 | 145-154 | 空态引导 |
| inAiClass 关闭 | 128-135 | 清 previewFileMap 项 |
| 非 inAiClass 关闭 | 137-142 | 切边栏 Tab 至 closeToTab |
| 复制失败 | 189 | toast.error('文件路径复制失败') |
| 定位失败 | 217 | console.error（无 toast） |
| Dialog 关闭 | 69,110 | 内容卸载（内存释放） |

- 失败后状态：复制/定位失败不改状态，可重试；无自动恢复。
- `agentPreviewSession` 缺一半（有 requestId 无 revision 或反之）→ 传 undefined（`:244-246`）。

## 7. 权限与权威状态

- 无 sender/role 检查；路径授权经 `getPreviewFileAccess(sessionId, currentFile, sessionPath)` 计算后透传（`:159`）。
- 预览数据权威：`previewFileMapAtom`（会话级，写入方为 preview-opener/各调用点）；`basePaths` 是传给 IPC 的授权上下文（`:216,241`）。

## 8. 修改影响面

- 改 props/`closeToTab` 语义影响 `AiClassRightTabs.tsx:517` 与 `SidePanel.tsx:611` 两宿主。
- 改 `PreviewFile` 消费字段需同步 preview-opener 写入端与 `@profer/shared` 类型。
- 改 viewport `key`/`memoryKey` 组成影响状态记忆粒度（`previewViewportMemoryKey`）。
- 全屏弹窗内 DiffTabContent 带工具栏、侧栏不带（`:102` vs `:240`）——改工具栏策略需两处同步。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `SidebarFilePreview` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`agent-tab-access.test.ts` 测 `preview-opener` 的 `openFilePreviewTab*`（上游数据写入），不覆盖本组件渲染。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：closePreview 两分支、复制 toast、全屏挂卸均无自动化断言。维护者验证：两宿主打开预览→复制路径→全屏→关闭。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:115`） |
| closePreview 双模式分支 | 已证实 | `:127-143` |
| Dialog 关闭即卸载内容 | 已证实 | `:66-69,110` |
| 侧栏 readOnly+hideToolbar / 全屏 readOnly 带工具栏 | 已证实 | `:240,247` / `:102` |
| 两处生产调用点 | 已证实（检索） | `AiClassRightTabs.tsx:517`、`SidePanel.tsx:611` |
| agentPreviewSession 成对条件 | 已证实 | `:244-246,263-265` |
| preview-open-path 解析细节 | 未知 | 文件外（有专属测试 preview-open-path.test.ts，未在本批逐行读） |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `closePreview` | §3,§6 | 127-143 | covered |
| 空态 | §3,§6 | 145-154 | covered |
| 路径/ext 派生 | §3 | 156-163 | covered |
| 顶栏五动作 | §3 | 167-228 | covered |
| viewport+DiffTabContent 装配 | §3 | 229-250 | covered |
| `PreviewFullscreenModal` | §3 | 39-113 | covered |
| 测试 | §9 | — | unknown |
