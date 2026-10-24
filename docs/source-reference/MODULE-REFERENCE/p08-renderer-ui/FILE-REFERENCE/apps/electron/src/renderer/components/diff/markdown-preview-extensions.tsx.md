---
path: apps/electron/src/renderer/components/diff/markdown-preview-extensions.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a4247de260061e045246739279187ccdece4fc86
sha256: 846c421d3b89319ca8b6fb7f259af3883f5eb85921e20b3559065f125d116644
lines: 1068
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/markdown-preview-extensions.tsx

## 1. 结论与边界

**TipTap/ProseMirror 富节点扩展集**（1068 行）：markdownImage/Video、RawHtml 块行内、Math 块行内（KaTeX）、Shiki 代码块（含 Mermaid/思维导图渲染）、TaskList/TaskItem、表格组。被 ScratchPad 与消息预览共用（本批 `ScratchPadView.tsx:40` 引用）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `createMarkdownImage/Video(fileAccessRef)` | 工厂 | `:689,736` | block atom+NodeView；**null=跳过路径解析**（`:27-28`） |
| `RawHtmlBlock/RawHtmlInline` | Node | `:784,832` | 静态 HTML 视图（DOMPurify 清洗 `:357-372`，白名单加 video/source/details 等） |
| `MathInline/MathBlock` | Node | `:870,918` | KaTeX（throwOnError:false）；输入触发 `$/$$`（`:907-915,954-962`） |
| `createShikiCodeBlock(themeRef)` | 工厂 | `:965` | 代码块+双 ProseMirror 插件 |
| `TaskList/TaskItem` | 配置 | `:1047,1051` | 官方扩展（inputRule `[ ]`/`[x]`） |
| `tableExtensions` | 数组 | `:1056` | Table/Row/Cell/Header（resizable:false） |

## 3. 内部逻辑与关键流程

- **Shiki 插件**（`:217-286`）：装饰重算只在 `SHIKI_REFRESH_META` 事务（普通事务走 mapping 几乎零开销，注释 `:225-231`）；首挂载异步触发不阻塞（`:221-223`）；文档变更 120ms 节流/主题切换立即（`:264-275`）；token LRU 缓存 160（`:52-53,126-144`）。
- **代码块 NodeView**（`:590-687`）：头部（语言标签+复制按钮 2s 反馈）+编辑层+Mermaid/思维导图宿主（```mindmap 解析成功走 MindMapBlock 否则 Mermaid 回退，`:658-664`；仅 !editable 渲染）。
- 媒体解析（`resolveMediaSrc` `:398-432`）：外链/data/blob/file/cdut-file 直通（协议白名单 `:353-355`）；本地路径候选去重→`window.electronAPI.resolveFilePath` 首个命中；img `referrerPolicy='no-referrer'`（防 B 站 CDN 403，`:472` 注释）。
- 序列化（`:77-120`）：各节点 markdown 输出（image 转义/video HTML/math 定界/代码栅栏取最长反引号 `:112-113`）。

## 4. 调用者与调用链

- 入向：`ScratchPadView.tsx:40`（本批）、消息/预览 Markdown 编辑器（域外）。
- 出向：@tiptap/*、DOMPurify、katex、`@profer/core/highlight`（highlightToTokens/highlightCode）、`@profer/ui`（MermaidBlock）、`../ai-elements/MindMapBlock`、`window.electronAPI.resolveFilePath`。

## 5. 数据 I/O、读写与副作用

本地媒体路径 IPC 解析；剪贴板复制（navigator.clipboard）；React root 挂卸（Mermaid）。

## 6. 分支、失败、取消与恢复

媒体解析失败→空 src（`:427-429`）；KaTeX 异常→原样 latex（`:583-585`）；Shiki 失败 console.error；destroy 清定时器/unmount root（`:676-681`）。

## 7. 权限与权威状态

HTML 安全=DOMPurify 白名单（`:357`）；媒体协议白名单（`:353`）；路径解析经 Main `resolveFilePath` 授权（fileAccessRef 候选根）。

## 8. 修改影响面

全部 Markdown 富预览/编辑（ScratchPad+消息）；序列化影响导出保真。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出/插件节流矩阵/清洗白名单/媒体解析链 | 已证实 | `:1-1068` 全文（分段逐段） |
| DOMPurify/katex/shiki 三方行为 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出+插件+NodeView 族 | §2/§3 | 26-1068 | covered |
