---
path: apps/electron/src/renderer/components/scratch-pad/ScratchPadView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9aee2869062394e80c06610cad415a1550aac09f
sha256: 8d553049e89072c29a4285c3fb95a32cfe83b8bd8adae9f763ef41857ede287b
lines: 304
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/scratch-pad/ScratchPadView.tsx

## 1. 结论与边界

**草稿本编辑器**（304 行，TipTap Markdown）：内容持久化 `~/.proma/scratch-pad.md`（ScratchPadPersistence 监听 atom 自动保存，`:4-5`）；支持快捷输入/图片粘贴/Todo/代码高亮/数学公式/导出 Markdown。

## 2. 导出与关键符号

1 导出：`ScratchPadView`（`:42`）。扩展组（`:51-70`）：StarterKit（heading 1-3、codeBlock 关由 Lowlight 替代）/Placeholder/CodeBlockLowlight/`createMarkdownImage(null)`/`createMarkdownVideo(null)`（**null=无会话上下文跳过路径解析**，`:60` 注释）/RawHtml 块行内/Math 块行内/TaskList/TaskItem/表格组——均来自本批 `markdown-preview-extensions`。

## 3. 内部逻辑与关键流程

- 编辑器（`:72-79`）：onUpdate→`setContent(editor.getHTML())`；`immediatelyRender:false`。
- 内容同步（`:158-165`）：**content 不进 deps 防死循环**（setContent→onUpdate→atom→…，注释 `:154-157`：HTML 规范化会吞尾部空格重置光标）；仅 loaded/编辑器挂载时同步。
- 粘贴（`:174-223`）：图片→FileReader dataURL 插 markdownImage；文本含 markdown 触发字符（`[#*>-\`[\]~|$]` `:209`）→`markdownToHtml` 转 HTML 注入，失败回退纯文本；**preventDefault+stopPropagation 自管插入**（Electron 39+ sandbox 下 ProseMirror paste 不可靠，`:204-205` 注释）。
- 导出（`:112-150`）：`htmlToMarkdown`（识别自定义节点，turndown 会丢，`:115-116` 注释）→三目标：会话目录（getAgentSessionPath）/工作区目录（getWorkspaceFilesPath）/浏览选择（**空 filename 触发 IPC 完整路径模式**，`:145`）。

## 4. 调用者与调用链

- 入向：scratch-pad 标签页（域外）。
- 出向：tab-atoms/agent-atoms、`@/lib/markdown-rich-text`（htmlToMarkdown/markdownToHtml）、`@/lib/lowlight`、本批 `markdown-preview-extensions`、`window.electronAPI.exportScratchPad/chooseExportPath/getAgentSessionPath/getWorkspaceFilesPath`。

## 5. 数据 I/O、读写与副作用

读写 scratchPadContentAtom（持久化由外部组件）；导出写 .md 文件（IPC）。

## 6. 分支、失败、取消与恢复

空内容不导出（`:114`）；导出失败 console.error；无会话/工作区时对应菜单项 disabled（`:276,286`）。

## 7. 权限与权威状态

无权限分支，依据：本地草稿+用户触发导出。

## 8. 修改影响面

草稿编辑/导出链；与 markdown-preview-extensions 的节点集耦合（导出保真依赖 htmlToMarkdown）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 死循环规避/粘贴自管/导出三目标 | 已证实 | `:1-304` 全文 |
| Electron sandbox paste 行为 | 推断（注释记录） | `:204-205` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+扩展组+导出链 | §2/§3 | 42-301 | covered |
