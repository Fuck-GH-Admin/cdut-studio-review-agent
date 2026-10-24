---
path: apps/electron/src/renderer/components/diff/MarkdownEditorToolbar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8aa55aae2e7ae590a33c17a7009ec8c65917bdd8
sha256: 6c5a6f8bb1e308b978cc86466a9e5faea2071cf2bbf75816703bbb080c0ecd35
lines: 414
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/MarkdownEditorToolbar.tsx

## 1. 结论与边界

Markdown 编辑器工具栏（TipTap）：行内格式/标题/列表/块/链接/表格插入按钮组 + 截图导出（剪贴板/文件）；活跃态经 `useEditorState` 实时反映（`apps/electron/src/renderer/components/diff/MarkdownEditorToolbar.tsx:1-52`）。

边界：

- 不持有编辑器实例（`editor` 由 `MarkdownRichEditor` 传入）；不落盘文档。
- 截图实际渲染由主进程 `screenshotCapture` 完成，本文件只准备 HTML/CSS 载荷。
- 无撤销栈管理（TipTap 自带）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MarkdownEditorToolbar` | 函数（导出） | 289-414 | `({editor}: MarkdownEditorToolbarProps) => React.ReactElement` | 工具栏本体 |
| `collectRuntimeStyles` | 内部函数 | 58-79 | `() => string` | 收集渲染端已编译 CSS（含 `#skin-css` 补取，注释 `:72-74`） |
| `buildScreenshotPayload` | 内部函数 | 81-129 | `(editor) => {html,width,css,themeClass}` | 截图载荷（预检+克隆+去 contenteditable） |
| `ToolbarButton` | 内部组件 | 131-167 | `({icon,label,shortcut?,active?,disabled?,onClick})` | 带 Tooltip 的 ghost 按钮 |
| `TableGridPicker` | 内部组件 | 169-215 | `({editor})` | 6×6 网格插入表格 |
| `LinkPopover` | 内部组件 | 217-287 | `({editor,active})` | 链接编辑浮层 |
| `ToolbarActiveState` | 内部接口 | 37-52 | 14 个 boolean | bold…link 活跃态 |
| `handleScreenshot` | 内部（useCallback） | 316-339 | `(mode:'clipboard'\|'file') => Promise<void>` | 截图主流程 |

## 3. 内部逻辑与关键流程

1. **平台/快捷键文案**（`apps/electron/src/renderer/components/diff/MarkdownEditorToolbar.tsx:290-293`）：`userAgentData.platform ?? navigator.platform` 判 Mac，`mod` = ⌘ / Ctrl+。
2. **活跃态**（`:296-314`）：`useEditorState` selector 逐项 `editor.isActive(...)`（heading 1/2/3 分别检测）。
3. **截图** `handleScreenshot`（`:316-339`）：`screenshottingRef` 同步重入锁（注释 `:317-318`：state 同 tick 不生效，锁会漏）→ `requestAnimationFrame` 等一帧 → `buildScreenshotPayload` → `window.electronAPI.screenshotCapture({html, isDark, width, mode, css, themeClass})`（`isDark=documentElement.classList.contains('dark')`，`:325`）→ 成功 `toast.success(result.message)` / 失败 `toast.warning(result.message)`（`:327-331`）；异常 `console.error` + `toast.error(err.message ?? '截图失败')`（`:332-334`）；finally 解锁。
4. **载荷** `buildScreenshotPayload`（`:81-129`）：预检元素数 > `SCREENSHOT_LIMITS.MAX_ELEMENTS` → throw「文档结构过于复杂…」；`outerHTML` 字节数 > `MAX_RAW_HTML_BYTES` → throw「文档过大…」（`:90-96`）；克隆 DOM 去 `contenteditable`/`spellcheck`（`:100-106`）；宽度 clamp 到 `[MIN_WIDTH, MAX_WIDTH]`（rect 宽或 960，`:108-116`）；`themeClass = document.documentElement.className`（`:121`，透传 dark/主题 class）。
5. **collectRuntimeStyles**（`:58-79`）：遍历 `document.styleSheets` 取 `cssRules`（CORS sheet catch 跳过 `:67-69`）；显式补 `#skin-css` 文本（Chromium inline sheet 不稳定，注释 `:72-74`）。
6. **LinkPopover**（`:217-287`）：打开时读 `editor.getAttributes('link').href`（`:223`）；`apply`：URL 非空则协议白名单 `^(https?|mailto|file|cdut-file):` 通过原样、否则补 `https://` 前缀（`:232`）后 `setLink`；空串 `unsetLink`（`:235`）；active 时显示 Unlink 红钮（`:270-282`）。
7. **TableGridPicker**（`:169-215`）：6 列 36 格 hover 预选（`:194-210`），点击 `insertTable({rows, cols, withHeaderRow: true})`（`:174`）。
8. **渲染**（`:349-412`）：行内 5 钮（加粗/斜体/下划线/删除线/行内代码，快捷键 ⌘B/I/U/⇧X/E，`:352-356`）、标题 3 钮、列表 3 钮、块 3 钮（引用/代码块/分隔线）、LinkPopover+TableGridPicker；截图进行中显示 Loader2 并禁用两截图钮（`:388-411`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx:24`（import）、`MarkdownRichEditor.tsx:206`（`{editing && editor && <MarkdownEditorToolbar editor={editor} />}`）。无测试引用（见 §9）。

出向：`@tiptap/react`（`useEditorState`/`Editor`）、`@profer/shared`（`SCREENSHOT_LIMITS`）、`window.electronAPI.screenshotCapture`（IPC）、`sonner`、`@profer/ui/primitives/button|tooltip|popover|separator`。

## 5. 数据 I/O、读写与副作用

- 读：`document.styleSheets`/`#skin-css`/`documentElement.className`（截图载荷）。
- IPC 出向：`screenshotCapture`（渲染→图片，写剪贴板或文件由主进程完成）。
- 副作用：编辑器文档变更（各 toggle/insert 命令）；toast；DOM 克隆（临时）。
- 并发：截图重入锁（ref）；`screenshotting` state 只驱动 UI。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 截图重入 | 319 | 直接 return |
| 文档过复杂/过大 | 91-96 | throw 文案 → toast.error |
| `result.success` 真/假 | 327-331 | toast.success / toast.warning |
| 截图异常 | 332-334 | console + toast.error |
| URL 无协议 | 232 | 补 `https://` |
| 链接输入为空 | 234-236 | unsetLink |
| 截图进行中 | 403,409 | 两钮 disabled + spinner |

- 失败后状态：`finally` 解锁（`:335-338`），可重试；无残留。
- 取消：无（截图不可中断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；`screenshotCapture` 的 IPC 授权在主进程。编辑态权威在 `MarkdownRichEditor`（仅 editing 挂载本组件）。

## 8. 修改影响面

- 改按钮/命令集影响 Markdown 编辑能力面（用户可见）。
- 改截图载荷形状（html/isDark/width/mode/css/themeClass）需同步主进程 `screenshotCapture` 实现。
- `SCREENSHOT_LIMITS`（`@profer/shared`）变更为共享契约。
- 链接协议白名单 `MarkdownEditorToolbar.tsx:232` 与 `MarkdownRichEditor.tsx:93` 的 Link.validate 同源语义，需同步。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `MarkdownEditorToolbar` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实截图。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：截图两模式、预检 throw、表格网格、链接协议补全均无自动化断言。维护者验证：编辑文档试各按钮；截图到剪贴板/保存文件；超大文档看预检文案。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:289`） |
| 截图重入锁用 ref | 已证实 | `:316-320` |
| 预检两 throw（元素数/字节数） | 已证实 | `:90-96` |
| 链接协议白名单/补 https | 已证实 | `:232` |
| 表格 withHeaderRow: true | 已证实 | `:174` |
| `#skin-css` 显式补取 | 已证实 | `:72-76` |
| 唯一调用点 MarkdownRichEditor | 已证实（检索） | `MarkdownRichEditor.tsx:24,206` |
| 主进程截图实现 | 未知 | 文件外，未读 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `handleScreenshot` | §3,§6 | 316-347 | covered |
| `buildScreenshotPayload` | §3,§6 | 81-129 | covered |
| `collectRuntimeStyles` | §3 | 58-79 | covered |
| `LinkPopover` | §3,§6 | 217-287 | covered |
| `TableGridPicker` | §3 | 169-215 | covered |
| 按钮组/活跃态 | §3 | 296-412 | covered |
| 测试 | §9 | — | unknown |
