---
path: apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 060b6adc752cf0920fd2ca2558972c4c8aa4e2af
sha256: 49a6eb149312d6de1c8979125c1614288b091933c704a0b4039949708c019983
lines: 145
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx

## 1. 结论与边界

独立文件预览窗口的渲染根组件：从 URL 查询参数取 `previewId`，经 IPC `getDetachedPreviewData` 读取主进程保存的预览上下文，复用 `DiffTabContent` 渲染；顶栏提供“默认应用打开/文件夹定位/刷新”三动作（`apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx:1-5`）。

边界：

- 不创建窗口（窗口由主进程开，本组件只在新窗口页面里跑）；不管理预览上下文的生命周期（主进程持有）。
- 不渲染 diff 双栏之外的 UI；预览内容全部委托 `DiffTabContent`。
- 不写盘、不发除 §4 列出之外的 IPC。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DetachedPreviewApp` | 函数（导出） | 23-145 | `() => React.ReactElement` | 独立预览窗口根组件 |
| `getPreviewId` | 内部函数 | 19-21 | `() => string \| null` | 从 `window.location.search` 取 `previewId` |

## 3. 内部逻辑与关键流程

1. **取上下文**（`apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx:29-51`）：`getPreviewId()` 缺失 → `setError('缺少预览窗口 ID')`（`:31-35`）；`window.electronAPI.getDetachedPreviewData(previewId)`：
   - 返回 falsy → `setError('预览数据已失效')`（`:39-42`）；
   - 成功 → `setData(payload)`，并 `document.title = payload.title || getFileBaseName(payload.filePath)`（`:43-44`）；
   - reject → `console.error` + `setError('加载预览数据失败')`（`:46-49`）；
   - `finally(() => setLoading(false))`（`:50`）。
2. **刷新** `handleRefresh`（`:53-60`）：`agentDiffRefreshVersionAtom` 中该 `data.sessionId` 的计数 +1（Map 复制更新），驱动 `DiffTabContent` 重新拉取。`data` 为空直接 return（`:54`）。
3. **文件夹定位** `handleShowInFolder`（`:62-69`）：`getDefaultAppTargetPath(data, data.dirPath)` 得目标路径，`window.electronAPI.showItemInFolder(targetPath, data.basePaths)`，失败仅 `console.error`（`:68`）。
4. **渲染三态**：
   - `loading`（`:71-77`）：全屏“正在打开预览...”；
   - `!data || error`（`:79-88`）：`AlertCircle` + `error ?? '无法打开预览'`；
   - 正常（`:93-144`）：`TooltipProvider` 内：标题区（文件 basename + 完整路径 title，`:97-102`）+ `DefaultAppOpenButton`（`:103-106`，路径/授权经 `getDefaultAppTargetPath`/`getPreviewFileAccess` 预计算 `:90-91`）+ FolderOpen 按钮（`:107-117`）+ RefreshCw 按钮（`:118-128`）；内容区 `<DiffTabContent filePath dirPath sessionId gitRoot previewOnly readOnly basePaths>`（`:132-140`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/main.tsx:1060` 动态 `import('./components/diff/DetachedPreviewApp')`、`main.tsx:1066` 渲染 `<DetachedPreviewApp />`（独立窗口入口分支）。无其它 import；无测试引用（见 §9）。

出向：`./DiffTabContent`（预览/diff 渲染主体）、`./DefaultAppOpenButton`、`./preview-open-path`（`getDefaultAppTargetPath`、`getPreviewFileAccess`）、`@/atoms/agent-atoms`（`agentDiffRefreshVersionAtom`）、`@/lib/file-utils`（`getFileBaseName`）、`@profer/shared`（`DetachedPreviewWindowData` 类型）、`@profer/ui/primitives/tooltip`、`window.electronAPI.getDetachedPreviewData`/`showItemInFolder`。

## 5. 数据 I/O、读写与副作用

- 读：IPC `getDetachedPreviewData(previewId)` —— 一次性读主进程保存的 `DetachedPreviewWindowData`（含 `filePath/dirPath/sessionId/gitRoot/previewOnly/readOnly/basePaths/title`，形状以 `@profer/shared` 为准）。
- 写：无磁盘写；副作用 = `document.title` 赋值（`:44`）、IPC `showItemInFolder`（打开文件管理器，`:65-68`）、Atom 更新（`agentDiffRefreshVersionAtom`，`:55-59`）。
- 幂等：刷新仅自增计数，可重复点击；上下文读取一次性（effect 依赖 `[]`，`:51`），窗口生命周期内不重读。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| URL 无 `previewId` | 31-35 | error='缺少预览窗口 ID'，停止 |
| IPC 返回空 | 39-42 | error='预览数据已失效' |
| IPC reject | 46-49 | console + error='加载预览数据失败' |
| loading | 71-77 | 占位屏 |
| `!data \|\| error` | 79-88 | AlertCircle 错误屏（`error ?? '无法打开预览'`） |
| `data` 为空时刷新/定位 | 54,63 | 直接 return |

- 失败后状态：错误屏常驻，无自动重试；恢复 = 用户关闭窗口或重开预览（无恢复入口，`handleRefresh` 在 error 屏不渲染）。
- 取消：effect 无 cleanup/无 AbortController；卸载后 promise 仍会 settle，只触发 state 更新（React 忽略）。

## 7. 权限与权威状态

- 本文件无 sender/role 检查；路径授权上下文由 `getPreviewFileAccess(data.sessionId, data, data.dirPath)` 计算后透传给 `DefaultAppOpenButton`（`:91,105`）。
- 权威数据（预览上下文）由**主进程**保存与发放（`getDetachedPreviewData`），渲染层只读；`previewId` 是能力凭据（URL 携带）。

## 8. 修改影响面

- 改 `DetachedPreviewWindowData` 消费字段需同步 `@profer/shared` 类型与主进程保存端。
- 改刷新计数语义（`agentDiffRefreshVersionAtom`）影响 `DiffTabContent` 的刷新检测（`apps/electron/src/renderer/atoms/agent-atoms.ts:406` 一带）。
- 改入口条件影响 `main.tsx:1060-1066` 的独立窗口分支。
- 顶栏按钮契约与 `SidebarFilePreview` 顶栏同构（默认应用/定位），改动需两边同步。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DetachedPreviewApp`/`getDetachedPreviewData` 渲染层 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实窗口打开。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：三态渲染、失效上下文、刷新计数、showItemInFolder 失败均无自动化断言。维护者验证：从预览面板弹出独立窗口，验证标题/刷新/定位/默认应用打开。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:23`） |
| previewId 取自 URL 查询串 | 已证实 | `:19-21` |
| 空 payload→'预览数据已失效' | 已证实 | `:39-42` |
| 刷新=按 sessionId 自增 atom 计数 | 已证实 | `:53-60` |
| 入口=main.tsx 动态 import | 已证实（检索） | `main.tsx:1060,1066` |
| title 回退 basename | 已证实 | `:44` |
| 主进程上下文保存/回收机制 | 未知 | 文件外，未读实现 |
| 真实窗口行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getPreviewId` | §2,§3 | 19-21 | covered |
| 上下文加载 effect | §3,§6 | 29-51 | covered |
| `handleRefresh` | §3 | 53-60 | covered |
| `handleShowInFolder` | §3 | 62-69 | covered |
| 三态渲染 | §3,§6 | 71-88,93-144 | covered |
| DiffTabContent 传参 | §3 | 132-140 | covered |
| 测试 | §9 | — | unknown |
