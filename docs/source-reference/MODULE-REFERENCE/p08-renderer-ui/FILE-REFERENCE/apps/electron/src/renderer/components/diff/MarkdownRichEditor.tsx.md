---
path: apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7efe0f4fde169979807eeae546b33aec774a0d6
sha256: b6a0b23c8fd59b2f8e1ef8641608109e6c0d4257c9fb352dfcce84684ca85537
lines: 228
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx

## 1. 结论与边界

Markdown 富文本编辑/预览一体组件（TipTap）：`editing` 时可编辑（工具栏 + 表格浮窗 + Esc/Cmd+Enter 快捷键），否则只读预览（mermaid 渲染态）；Markdown ↔ HTML 转换经 `tiptap-markdown` 与 `@/lib/markdown-rich-text`（`apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx:1-49`）。

边界：

- 不落盘：`onChange`/`onSave`/`onCancel` 全部回调化，持久化归调用方。
- 不解析 Markdown 语义本身（扩展来自 `./markdown-preview-extensions` 与 `tiptap-markdown`）。
- 文件访问授权（图片/视频加载）只透传 `fileAccess` 给扩展。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MarkdownRichEditor` | 函数（导出） | 39-228 | `({value,editing,onChange,onSave,onCancel,onRequestEdit?,disabled?,fileAccess?,shikiTheme='github-dark'}) => React.ReactElement` | 编辑器本体 |
| `MarkdownRichEditorProps` | 内部接口 | 27-37 | 9 字段 | props |
| `focusEditorFromBlankArea` | 内部（useCallback） | 194-202 | `(event) => void` | 点击空白区聚焦编辑器末尾 |
| ref 镜像组 | 内部 | 52-70 | `onChangeRef/onSaveRef/onCancelRef/onRequestEditRef/fileAccessRef/isEditableRef/disabledRef/shikiThemeRef/localMarkdownRef/rendererVersionRef/pendingFocusPosRef` | 闭包防陈旧 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx:39-228`：

1. `isEditable = editing && !disabled`（`:50`）；props/回调镜像进 ref（`:63-70`），编辑器闭包永远读到最新值。
2. **扩展表**（`:72-103`，memo 依赖 `[]`）：`createMarkdownImage(fileAccessRef)`/`createMarkdownVideo(fileAccessRef)`、RawHtmlBlock/Inline、MathBlock/Inline、TaskList/TaskItem、`tableExtensions`、`createShikiCodeBlock(shikiThemeRef)`、StarterKit（关掉 codeBlock/link/underline，`:83-87`）、Underline、Link（`openOnClick:false`、autolink、linkOnPaste、`validate: /^(https?|mailto|file|cdut-file):/`，`:89-97`）、Markdown（`html:true, tightLists, bulletListMarker:'-'`，`:98-102`）。
3. **useEditor**（`:106-160`）：初始内容 `markdownToHtml(value)`（`:105`）；
   - `handlePaste`（`:123-131`）：非编辑态放行原行为；取 `text/plain`，空则放行；否则 `preventDefault` + `insertText(plainText)`（注释：Electron 39+ sandbox 下 ProseMirror capturePaste 不可靠，手动处理）；
   - `handleKeyDown`（`:132-145`）：`Escape` → `onCancel`；`Enter`+Cmd/Ctrl → `onSave`（均 `preventDefault`）；
   - `handleDoubleClick`（`:146-151`）：只读且未 disabled 且有 `onRequestEdit` → 记录 `pendingFocusPosRef=pos` 并触发进入编辑；
   - `onUpdate`（`:153-159`）：仅编辑态，从 `tiptap-markdown` storage 取 `getMarkdown()`，更新 `localMarkdownRef` 并 `onChange(markdown)`。
4. **同步 effects**：
   - `setEditable(isEditable)` 随编辑态切换（`:162-164`）；
   - `shikiTheme` 变化 → dispatch meta `'markdownShikiCodeBlockRefresh'` 重刷代码高亮（`:166-169`）；
   - `value`/渲染器版本同步（`:171-179`）：渲染器版本未变且 `value === localMarkdownRef.current` 时**跳过**（防覆盖本地编辑）；否则重转 HTML 并 `setContent(html, {emitUpdate:false})`；
   - 双击聚焦恢复（`:181-192`）：`pendingFocusPosRef` 非空且进入编辑 → `setTimeout(0)` 后把位置 clamp 到文档范围（`:186`），`TextSelection.near` + dispatch + `focus()`；cleanup 清定时器。
5. **渲染**（`:204-226`）：`editing && editor` 时挂 `MarkdownEditorToolbar`（`:206`）与 `TableBubbleMenu`（`:225`）；`EditorContent` 类名按 `isEditable` 切换：编辑态隐藏 mermaid 预览/显示源码体，只读态显示 mermaid 渲染块（`:212-222`）；`onMouseDown={focusEditorFromBlankArea}`（左键点 `.ProseMirror` 外 → `focus('end')`，`:194-202`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/automation/AutomationFormView.tsx:43,670`（自动化表单正文编辑）、`apps/electron/src/renderer/components/tabs/TabContent.tsx:14,99`（Markdown 标签页）、`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:24,1192`（预览面板 Markdown 编辑分支）。无测试引用（见 §9）。

出向：`@tiptap/react`（`useEditor`/`EditorContent`）、`./markdown-preview-extensions`（10 个扩展构造器）、`./MarkdownEditorToolbar`、`./TableBubbleMenu`、`@/lib/markdown-rich-text`（`markdownToHtml`、`MARKDOWN_RENDERER_VERSION`）、`tiptap-markdown`（`Markdown`/`MarkdownStorage`）、`@profer/shared`（`FileAccessOptions`）。

## 5. 数据 I/O、读写与副作用

- 无 IPC/磁盘；输入 `value`、输出 `onChange(markdown)`（每次编辑事务，`:158`）。
- 副作用：TipTap 文档状态变更；图片/视频扩展经 `fileAccessRef` 发起资源加载（IPC/文件访问在扩展内，本文件只透传）；`editor.focus()`/selection dispatch（`:188-189`）。
- 幂等/并发：`localMarkdownRef` + 渲染器版本号联合判定外部 `value` 是否需要重灌（`:173-178`），避免“本地编辑↔外部 value 回灌”死循环。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 非编辑态粘贴/按键 | 124,133 | return false（放行默认行为） |
| 粘贴无纯文本 | 127 | return false |
| Escape | 134-138 | `onCancel()` |
| Enter+Cmd/Ctrl | 139-143 | `onSave()` |
| 双击进入编辑 | 146-151 | 记位置 + `onRequestEdit()`（disabled 或无回调则放行） |
| 外部 value 与本地一致 | 174 | 跳过 setContent |
| pendingFocus 越界 | 186 | clamp 到 `[0, doc.size]` |

- 失败后状态：无内部错误处理（扩展层异常不在此捕获）；取消=Esc 回调由调用方决定丢弃/保留。
- 不可恢复点：无；`setTimeout` 有 cleanup（`:191`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。`fileAccess?: FileAccessOptions`（`:35`）只透传给图片/视频扩展作路径授权上下文；`disabled` 是调用方的编辑门权威。

## 8. 修改影响面

- 改 `onChange`/`onSave`/`onCancel`/`onRequestEdit` 契约影响三个调用方（`AutomationFormView.tsx:670`、`TabContent.tsx:99`、`DiffTabContent.tsx:1192`）。
- 改扩展表影响所有 Markdown 渲染/编辑能力（数学、表格、任务、代码高亮、链接协议白名单 `:93`）。
- 改 `markdownToHtml`/`MARKDOWN_RENDERER_VERSION` 语义影响 `:171-179` 的重灌判定（版本号是缓存失效键）。
- 快捷键（Esc/Cmd+Enter）是用户可见契约。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `MarkdownRichEditor` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`markdown-preview-extensions`/`markdown-rich-text` 的测试（若有）不经过本组件装配（未见引用）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：粘贴分支、快捷键、value 回灌跳过条件、双击聚焦均无自动化断言。维护者验证：Markdown 标签页编辑保存/取消；粘贴纯文本；双击只读文档进入编辑并落在原位。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:39`） |
| Escape→onCancel / Cmd+Enter→onSave | 已证实 | `:132-145` |
| 粘贴强制纯文本（Electron 39+ 注释） | 已证实 | `:123-131` |
| value 回灌跳过条件（本地一致且版本未变） | 已证实 | `:171-179` |
| shikiTheme 刷新 meta | 已证实 | `:166-169` |
| 三处生产调用点 | 已证实（检索） | `AutomationFormView.tsx:670`、`TabContent.tsx:99`、`DiffTabContent.tsx:1192` |
| 链接协议白名单 https?/mailto/file/cdut-file | 已证实 | `:93` |
| 扩展内部（image/video/shiki）实现 | 未知 | 文件外，未逐行读 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 扩展表 | §3 | 72-103 | covered |
| handlePaste | §3,§6 | 123-131 | covered |
| handleKeyDown | §3,§6 | 132-145 | covered |
| handleDoubleClick | §3,§6 | 146-151 | covered |
| onUpdate→onChange | §3,§5 | 153-159 | covered |
| 同步 effects | §3 | 162-192 | covered |
| 空白区聚焦 | §3 | 194-202 | covered |
| 渲染（工具栏/浮窗/类名） | §3 | 204-226 | covered |
| 测试 | §9 | — | unknown |
