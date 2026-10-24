---
path: apps/electron/src/renderer/components/diff/DefaultAppOpenButton.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6273bdd86f699c5b6ed7e78938140ee66289dfd4
sha256: bfd65496689ef1eb6ab60ef9e2be10a78626561718dc5b8f9398f12a1a162014
lines: 84
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DefaultAppOpenButton.tsx

## 1. 结论与边界

“用本机默认 App 打开文件”按钮（React 组件，薄包装）：经 `useDefaultAppForFile` 探测该文件类型注册的默认应用（含图标），点击调 `window.electronAPI.systemOpenFile` 交给系统打开；探测失败/进行中渲染通用「外部应用」回退按钮，保证按钮始终可见可点（`apps/electron/src/renderer/components/diff/DefaultAppOpenButton.tsx:1-8`）。

边界：

- 不做默认应用设置/注册（只读探测结果）；不解析文件内容；不校验文件存在性（交给系统报错）。
- 授权（`FileAccessOptions`）只透传，不在本文件判断。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DefaultAppOpenButton` | 函数（导出） | 27-84 | `({filePath, access?, variant?, className?}) => React.ReactElement` | 按钮本体 |
| `DefaultAppOpenButtonProps` | 内部接口 | 18-25 | `{filePath: string; access?: FileAccessOptions; variant?: 'compact'\|'labeled'; className?: string}` | props 形状 |
| `handleClick` | 内部（useCallback） | 35-47 | `() => void` | 调 `systemOpenFile` + toast 反馈 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/DefaultAppOpenButton.tsx:27-84`：

1. `useDefaultAppForFile(filePath, access)` 取探测结果 `info: DefaultAppInfo | null`（`:33`）。
2. `handleClick`（`:35-47`）：`window.electronAPI.systemOpenFile(filePath, undefined, access)` → 成功 `toast.success('已交由系统默认应用打开')`；失败 `console.error` + `toast.error('使用系统默认应用打开失败', {description: err.message})`（`:41-46`）。依赖 `[filePath, access]`。
3. 渲染：`Tooltip > TooltipTrigger(button)`；`variant==='labeled'`（默认）时 `gap-1 h-6 px-1.5 max-w-[140px]` + 名称文本，`compact` 时 `size-6` 仅图标（`:49,57-61`）。
4. 图标分支（`:64-73`）：`info` 存在 → `<img src={info.iconDataUrl}>`；否则 `ExternalLink` 图标。`aria-label`（`:62`）与 `TooltipContent`（`:79-81`）文案按 `info` 有无切换。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx:16,103`（独立预览窗顶栏）、`apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx:22,197`（侧栏预览顶栏）、`apps/electron/src/renderer/components/agent-skills/WorkspaceMemoryTab.tsx:9,679`（工作区记忆附件行）。无测试引用（见 §9）。

出向：`@/hooks/useDefaultAppForFile`（探测+按后缀缓存；带 `access` 时 null 结果不入缓存，防授权失败污染共享缓存——`apps/electron/src/renderer/hooks/useDefaultAppForFile.ts:44-47`）、`window.electronAPI.systemOpenFile`（IPC，打开外部应用）、`sonner` toast、`@profer/ui/primitives/tooltip`、`@profer/shared`（`FileAccessOptions` 类型）。

## 5. 数据 I/O、读写与副作用

- 无磁盘读写；IPC 出向两条：`getDefaultAppForFile`（由 hook 发起）与 `systemOpenFile(filePath, undefined, access)`（`:36-37`）。
- 副作用：`systemOpenFile` 触发**操作系统级**行为（外部应用启动）；toast 通知；console 日志。
- 状态：无本地 state；`info` 由 hook 管理（进程内 Map 缓存按后缀）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `systemOpenFile` 成功 | 38-40 | `toast.success('已交由系统默认应用打开')` |
| `systemOpenFile` 失败 | 41-46 | `console.error` + `toast.error`，`description` 为 `err.message`（非 Error 转 `String(err)`） |
| `info` 为 null（探测失败/进行中） | 64-73 | 渲染 `ExternalLink` 回退图标 + 文案「默认应用」 |
| `variant` 缺省 | 30,49 | `'labeled'` |

- 失败后状态：无本地状态残留，按钮可再次点击（幂等：每次点击重新发起 IPC）。
- 取消：无（无 AbortController）；组件卸载后 promise 仍会 resolve，只产生 toast（无状态写回）。

## 7. 权限与权威状态

- 本文件无 sender/role 检查；`access?: FileAccessOptions`（`:21`）仅透传给 `systemOpenFile` 作**路径授权上下文**，真正授权在主进程侧（本文件不验证）。
- 权威：默认 App 归属由操作系统注册表决定，经主进程 IPC 返回；渲染层只消费（`useDefaultAppForFile.ts:37`）。

## 8. 修改影响面

- 改 props/行为影响三个调用点：`DetachedPreviewApp.tsx:103`、`SidebarFilePreview.tsx:197`、`WorkspaceMemoryTab.tsx:679`。
- 改 `systemOpenFile` 参数顺序（现第二参 `undefined`）需同步 preload/主进程签名。
- 改 toast 文案/变体影响 UI 文案一致性。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DefaultAppOpenButton` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。`useDefaultAppForFile` 亦无专属测试（检索同范围，0 命中）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实系统打开。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：成功/失败 toast 分支、compact/labeled 布局、图标回退均无自动化断言。维护者验证：点击预览顶栏按钮确认外部应用打开与失败 toast。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:27`） |
| 打开走 `systemOpenFile(filePath, undefined, access)` | 已证实 | `:36-37` |
| 失败双动作：console + toast.error | 已证实 | `:41-46` |
| `info` 为 null 时回退 ExternalLink | 已证实 | `:64-73` |
| 三处生产调用点 | 已证实（检索） | `DetachedPreviewApp.tsx:103`、`SidebarFilePreview.tsx:197`、`WorkspaceMemoryTab.tsx:679` |
| 带 access 的 null 不入缓存 | 已证实 | `useDefaultAppForFile.ts:44-47` |
| 主进程 `systemOpenFile` 实现与真实 OS 行为 | 未知 | 未读实现（文件外）；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DefaultAppOpenButton` | §3 | 27-84 | covered |
| `handleClick` 成功/失败 | §3,§6 | 35-47 | covered |
| 图标/文案分支 | §3,§6 | 62-76 | covered |
| variant 布局 | §3 | 49,57-61 | covered |
| access 透传 | §7 | 21,37 | covered |
| 测试 | §9 | — | unknown |
