---
path: apps/electron/src/renderer/components/diff/DiffTabContent.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67dde4828be6c12401d104beb94c671489ecb5d0
sha256: 3bdc4c624de76c215c627bcda283f3924f7cefa04f747063ca497e86df49e5b3
lines: 1241
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DiffTabContent.tsx

## 1. 结论与边界

单文件 Diff / 纯文件预览内容组件：`previewOnly=true` 按文件类型分流渲染（目录清单/拒绝提示/不支持/PDF iframe/图片/Office（Silurus WASM）/OFV/HTML 渲染或源码/Markdown 只读富文本/PierreFile 代码高亮/纯文本），`previewOnly=false` 显示 git diff（`DiffView`）；带内容 LRU 缓存、滚动位置记忆、文件内查找、PDF 聚光灯定位与视口缩放控制器注册（`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:1-6`）。

边界：

- 预览**全局强制只读**：编辑入口被置空实现（`:880-887`），不写回磁盘（见 §6）。
- 文件读取/路径判定全部经主进程 IPC；本组件不做文件系统访问。
- PDF 渲染在 `preparePdfPreview` 产出的临时 HTML iframe 内，通信走 postMessage。

## 2. 导出与关键符号

`export` 逐条核对：3 个函数（类/接口/常量导出 0；`DiffTabContentProps` `:205-227` 未导出）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getPreviewScrollPosition` | 函数（导出） | 95-97 | `(sessionId, filePath) => {top,left}\|undefined` | 读滚动记忆；**冻结树全树无消费者**（检索见 §10） |
| `clearPreviewCacheForSession` | 函数（导出） | 102-110 | `(sessionId) => void` | 清该 session 的滚动+内容缓存（供 useCloseTab） |
| `DiffTabContent` | 函数（导出） | 229-1241 | 13 props（见 §2.1） | 主组件 |
| `CacheEntry`/`contentCache` | 内部类型/常量 | 65-79 | `{oldContent,newContent,pdfSrc?,imageDataUrl?,imagePath?,docxHtml?,officeHtml?,officeText?,htmlPreviewUrl?}` | 模块级 LRU（`CACHE_MAX=50`） |
| `cacheGet`/`cacheSet` | 内部函数 | 111-126 | LRU 读写（命中重插末尾；超 50 淘汰最旧） | |
| `scrollPositionCache`/`scrollCacheKey` | 内部 | 88-92 | `Map<`${sessionId}:${filePath}`, {top,left}>` | 滚动记忆 |
| `getExtension` | 内部函数 | 128-131 | 小写后缀 | |
| `isSelectionInside`/`getDeepSelection`/`discoverShadowRoots` | 内部函数 | 134-203 | 划词选取辅助（含 Shadow DOM 穿透） | **本文件内无调用**（死代码簇，见 §10） |
| `MAX_PREVIEW_CHARS` | 内部常量 | 82 | `500_000` | 超限跳过高亮纯文本截断 |
| `MAX_QUOTED_CHARS` | 内部常量 | 85 | `2000` | **未使用**（死代码） |
| `FILE_FIND_SHORTCUT_OPTIONS` | 内部常量 | 55 | `{exclusive: true}` | 查找快捷键选项 |

### 2.1 props（`:205-227`）

`filePath`、`dirPath`、`sessionId`、`gitRoot?`、`previewOnly?`、`readOnly?`（禁编辑）、`basePaths?`、`onEmptyDiff?`（diff 无差异回调）、`toolbarActions?`、`hideToolbar?`（外层已有操作栏）、`baseRef?`（worktree vs main）、`agentPreviewSession?: {requestId, revision}`（仅透传 .pptx OfficePreview）、`initialTargetLine?`（1-based 行定位）。

## 3. 内部逻辑与关键流程

### 3.1 类型分流（`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:37-53,300-316`）

扩展集合：`MD_EXTS(.md/.markdown)`、`HTML_EXTS(.html/.htm)`、`DOCX_EXTS`（**空集**，注释 `:39` 旧 DOCX 分支退役并入 Office）、`PDF_EXTS`、`OFFICE_PREVIEW_EXTS`（docx/xlsx/pptx 及 macro/template/ppsx 变体 14 种，`:48-52`）、`LEGACY_OFFICE_EXTS(.doc/.xls/.ppt)`。派生：`isMarkdown/isHtml/isPlainTextEditable(EDITABLE_TEXT_EXTS)/isEditableText/isPdf/isDocx/isOfficePreview/isLegacyOffice/isOfvBacked/isImage/isUnsupported`（均限定 `previewOnly`，`:301-316`）；普通图片不走 OFV（注释 `:309-312`：OFV 图片缩放体验差，OFV 只接管 .tif/.heic/.jxl 等）。

### 3.2 缓存（`:57-126,358-366`）

key = `${sessionId}:${mode}:${filePath}@v${version}:${scope}`（scope=dirPath/gitRoot/basePaths，`:358-366`；注释 `:57-64`：refreshVersion 变化 key 自然失效，无需主动清除）。`cacheGet` 命中重插 LRU 末尾；`cacheSet` 超 50 淘汰最旧。

### 3.3 主加载 effect（`:541-708`）

1. 命中缓存 → 同步渲染全部状态 + `restoreScrollRef=true`，无 loading 闪烁（`:550-569`）。
2. 未命中 → 清状态；`scrollPositionCache` 仍有位置则标记恢复（`:589-593`）。
3. `load()`（`:596-703`）：
   - **previewOnly**：先 `describePath(filePath, fileAccess)` 分清目录/拒绝/文件（`:606-617`）；`isUnsupported` 直接停（`:618-621`）；PDF → `preparePdfPreview` 取 `tmpHtmlUrl`，失败 `setPdfError` + **删除缓存条目**（失败结果不入缓存，`:629-630`），成功缓存 `pdfSrc`（`:634`）；图片 → `resolveFilePath` 得 `resolved.url`（成败都缓存，`:645,649`）；Office/legacy/OFV 早退（由组件自渲染，`:653-663`）；其余 → `resolveAndReadFile`（`result===null` ⇒ `notFound`，`:666-667`）；HTML 再取 `resolveHtmlPreviewPath` 得 token URL（`:669-674`）。
   - **diff 模式**：`getDiffContents({dirPath,filePath,gitRoot,sessionId,baseRef})`（`:676`）。
   - 统一写 state + `cacheSet`（`:682-687`）。
   - catch：仅 PDF 分支处理（清 src + error 文案 + 删缓存，`:693-699`）；finally `setLoading(false)`（`:700-702`）；`cancelled` 令牌贯穿（`:542,706`）。

### 3.4 刷新与空 diff（`:710-755`）

- 静默刷新（`:711-742`）：仅 diff 模式、`refreshVersion` 递增后（首跑跳过防双拉 `:715-718`）→ `getDiffContents`（**此处未传 `baseRef`**，与主加载不同，照实记录 `:725`）→ 先写缓存（新版本 key），内容与上次相同不触发渲染（`:731`）。
- 空 diff（`:744-755`）：diff 模式加载完 `oldContent === newContent` → `onEmptyDiff()` 一次性（`emptyDiffFiredRef`，filePath/sessionId 变化重置）。

### 3.5 预览失败 toast（`:757-775`）

按 `filePath:ext` 去重：legacy office「暂不支持 X 格式内联预览」/PDF 错误文案/图片无 dataUrl「图片文件过大，无法在此预览」。

### 3.6 滚动记忆（`:777-858`）

模块级 `scrollPositionCache`（key `sessionId:filePath`）：`refreshVersion` 变化删除位置（只在内容变化时清，切换文件保留，注释 `:784-785`）；恢复等滚动容器高度**连续 3 帧稳定**再设 scrollTop/Left（防 Shiki/ProseMirror 异步渲染偏移，`:798-837`）；保存=rAF 节流写 Map（`:839-850`）；卸载取消两个 rAF（`:852-858`）。

### 3.7 PDF 聚光灯与缩放（`:416-528`）

- message 监听：`pdf-zoom-changed`→`setPdfZoom`；`agent-preview:pdf-ready`→`pdfReadyTick++`（触发重投递）（`:420-428`）；`pdf-highlight-rendered`+匹配 `requestId`→释放 `pdfHighlightTargetAtom`（**回执制**，替代旧 180ms 盲清竞态，注释 `:468-470`）。
- 高亮投递（`:488-528`）：同文件判定（路径归一或 basename 同名，`:490-494`）→ `postMessage('pdf-navigate-highlight',{page,bbox,label,blockId,requestId})`，立即 +180ms 补投（覆盖 iframe 未就绪窗口）+ 8s 宽限兜底清 Atom（iframe 崩溃防悬挂，`:519-522`）。
- 视口控制器注册（`:440-466`）：PDF → `zoomIn/Out`（postMessage `pdf-zoom`）、`panBy`（postMessage `pdf-scroll`，返回 true）；图片 → `imageZoomBy/reset/panBy`（useSmoothZoom）；`reportScale` 上报百分比（`:431-436`）。

### 3.8 Markdown 强制只读（`:880-887,1186-1202`）

`startMarkdownEdit`/`saveMarkdownEdit` 均为空实现（注释 `:880`「预览全局强制只读」）；`exitMarkdownEdit` 只重置 UI 态。因此编辑按钮组（`:946-1000`）中的 `markdownEditing` 分支与保存状态样式（`autosaveStatus`）在当前实现下**不可达**（`markdownEditing` 恒 false）；`MarkdownRichEditor` 以 `editing=false, disabled=true` 挂载（`:1192-1201`），源码模式显 `<pre>`（`:1187-1190`）。

### 3.9 工具栏与渲染（`:904-1236`）

工具栏（`!hideToolbar`，`:906-1034`）：文件名点击复制路径（`handleCopyPath` + toast，`:871-878`）；diff 模式 split/unified 切换（写 `agentDiffViewModeAtom`，`:916-932`）；HTML 源码/渲染切换（`:934-944`）；可编辑文本的编辑钮（§3.8）；复制内容（Office 用 `officeText`，其余 `newContent`；docx/office/ofv 不显示，`:860-869,1002-1008`）；手动刷新（`agentDiffRefreshVersionAtom` session 计数 +1，`:889-895`）；Markdown 目录开关（`markdownTocOpenAtom`，`:1019-1031`）；`toolbarActions` 插槽（`:1033`）。

内容区（`:1065-1237`）按优先级：loading → 目录（`pathKind==='directory'`→`PreviewDirectoryView`）→ denied 提示（「该路径不在允许预览的范围内」+系统/凭据目录说明 `:1075-1081`）→ 不支持提示 → PDF（zoom 条 + iframe；`onError` 清缓存报错 `:1111-1115`；失败屏+重试 `handlePdfRetry` 删缓存重载 `:897-902`）→ 图片（zoom 条 + `useSmoothZoom` 变换；`previewViewport||hideToolbar` 时禁拖拽平移 `:1151`）→ OfficePreview（`agentPreviewSession` 仅 `.pptx` 传入，`:1162-1169`）→ OfvPreview → legacy office null → HTML iframe（`sandbox="allow-scripts allow-forms"`、`referrerPolicy="no-referrer"`，`:1174-1180`；无 URL 提示）→ Markdown（源码/富文本）→ 只读 textarea（`markdownEditing` 不可达）→ 纯文本（`>MAX_PREVIEW_CHARS` 截断 + 说明 `:1211-1217`）/PierreFile 高亮（`pierreFile` memo 带 cacheKey 防重复高亮 `:369-373`）→ notFound 提示 → 「（文件为空）」。diff 模式恒 `DiffView`（`:1235`）。

`initialTargetLine`（`:276-284`）：加载完按 `[data-line-number=…]`/`[data-line=…]` 平滑滚动居中。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DetachedPreviewApp.tsx:15,132`（独立预览窗）、`apps/electron/src/renderer/components/diff/SidebarFilePreview.tsx:23,96,234`（侧栏/全屏弹窗）；导出辅助 `clearPreviewCacheForSession` 被 `apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts:76,497`（关标签清缓存）；`getPreviewScrollPosition` 无任何调用者（§10）。无测试引用（见 §9）。

出向：`./DiffView`、`./MarkdownRichEditor`、`./PreviewFindBar`、`./PreviewDirectoryView`、`./MarkdownToc`、`./preview-open-path`（`getPreviewCandidateBasePaths`/`isAbsoluteFilePath`）、`./preview-viewport-context`（`usePreviewViewport`）、`@/components/file-browser/office-preview/OfficePreview`、`@/components/file-browser/ofv-preview/OfvPreview`、`@profer/ui`（`useSmoothZoom`）、`@/lib/preview-extension-sets`、`@/lib/ofv-extensions`、`@/components/agent/tool-result-renderers/pierre-styles`（`PIERRE_FILE_CSS`）、`@pierre/diffs/react`（`File`）、`dompurify`（导入于 `:11`）、IPC：`describePath`/`preparePdfPreview`/`resolveFilePath`/`resolveAndReadFile`/`resolveHtmlPreviewPath`/`getDiffContents`。

## 5. 数据 I/O、读写与副作用

- 读（IPC）：上列 6 条（全部只读，路径授权 `fileAccess={sessionId, candidateBasePaths}`，`:348-356`——相对路径补 dirPath 回退、绝对路径不补，注释 `:350-351`）。
- 写：无磁盘写（强制只读）；模块级 `contentCache`/`scrollPositionCache`（进程内存）。
- 副作用：postMessage 与 PDF iframe 通信（zoom/scroll/highlight）；clipboard（`handleCopy`/`handleCopyPath`）；toast；`message`/`scroll` 监听。
- 原子性/并发：`cancelled` 令牌丢弃过期加载；LRU 50 上限；缓存 key 含版本与 scope 防串。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| describePath 目录/denied | 608-617 | 转目录视图 / 拒绝提示 |
| PDF 准备失败 | 626-630 | pdfError + 删缓存（可重试） |
| resolveAndReadFile null | 666-667 | notFound（区别于空文件） |
| 加载异常 | 693-699 | 仅 PDF 处理；其它静默（finally 收 loading） |
| diff 新旧一致 | 749-755 | `onEmptyDiff()` 一次性 |
| PDF iframe onError | 1111-1115 | 清缓存 + 错误屏 + 重试钮 |
| 复制失败 | 866-868 | 静默（内容复制）；路径复制 toast.error（`:875-877`） |
| 预览失败 toast | 757-775 | 按 filePath:ext 去重一次 |

- 取消：effect cleanup 置 `cancelled`；rAF/定时器（180ms/8s）清理（`:524-527,831-836`）。
- 恢复：PDF 重试（`handlePdfRetry` 删缓存+刷新）；手动刷新（refreshVersion+1）重载；缓存命中即恢复滚动。
- 不可恢复点：无（失败均可重试）。

## 7. 权限与权威状态

- 无渲染层 sender/role 检查；所有路径授权经 `fileAccess`/`basePaths` 传给主进程（deny 时 `describePath` 返回 `denied`，UI 明示“系统目录与凭据目录（~/.ssh、钥匙串等）不参与预览”，`:1079`）。
- 编辑权威：全局强制只读（`:880-887`），`readOnly` prop 进一步约束 UI；`agentPreviewSession` 是 Agent 正式预览的能力凭据（requestId+revision 成对），仅 .pptx 透传（`:1168`）。
- PDF 聚光灯权威：`pdfHighlightTargetAtom`（外部写入，本组件消费并按回执释放）。

## 8. 修改影响面

- 改类型分流/渲染分支影响三个宿主（DetachedPreviewApp/SidebarFilePreview×2 挂载点）及全部预览体验。
- 改 IPC 契约需同步主进程 `file-preview-service.ts`（其 `:579` 注释与本文件 PDF 回执协议耦合）。
- 改缓存 key/滚动记忆影响切文件返回导航体验。
- `clearPreviewCacheForSession` 契约影响 `use-left-sidebar.ts:497`。
- `MarkdownToc`/`PreviewFindBar`/`PreviewDirectoryView`/`DiffView`/`MarkdownRichEditor` 的装配参数（`findContentKey`/`tocContentKey`）在其各自手册中交叉引用。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DiffTabContent`/`clearPreviewCacheForSession`/`getPreviewScrollPosition` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`preview-open-path.test.ts` 测路径解析辅助（`getPreviewCandidateBasePaths` 等，本文件 `:25,352` 消费），未覆盖本组件装配。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实文件读取。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：全部渲染分支、缓存命中/淘汰、滚动恢复、PDF 回执协议均无自动化断言。维护者验证：预览各类型文件；切文件再回来验证滚动/缓存；PDF 溯源胶囊定位。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出（函数） | 已证实 | `:95`、`:102`、`:229` 逐条核 |
| DOCX_EXTS 空集、Office 收敛 Silurus | 已证实 | `:39-52` |
| PDF 失败结果不入缓存 | 已证实 | `:629-630,697-698` |
| 静默刷新不传 baseRef（与主加载不一致） | 已证实 | `:725` vs `:676` |
| 编辑链路空实现（强制只读） | 已证实 | `:880-887` |
| 聚光灯回执制 + 180ms 补投 + 8s 宽限 | 已证实 | `:468-528` |
| PDF iframe sandbox="allow-scripts allow-forms" | 已证实 | `:1178` |
| `getDeepSelection`/`discoverShadowRoots`/`MAX_QUOTED_CHARS` 本文件无调用（死代码） | 已证实（检索本文件全文） | 定义 `:134-203,85`，调用点 0；`isSelectionInside` 仅被 `getDeepSelection` 调用 |
| `getPreviewScrollPosition` 全树零消费者 | 已证实（检索：冻结树 `*.ts/*.tsx` 排除本文件，0 命中） | — |
| 主进程 IPC 实现与临时 HTML 生命周期 | 未知 | 文件外 |
| 真实渲染/性能 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型分流 | §3.1 | 37-53,300-316 | covered |
| LRU/滚动缓存 | §3.2,§3.6 | 57-126,777-858 | covered |
| 主加载 effect 全分支 | §3.3,§6 | 541-708 | covered |
| 静默刷新/空 diff | §3.4 | 710-755 | covered |
| 失败 toast | §3.5 | 757-775 | covered |
| PDF 聚光灯/缩放注册 | §3.7 | 416-528 | covered |
| 强制只读 | §3.8 | 880-887 | covered |
| 工具栏 | §3.9 | 904-1034 | covered |
| 内容区渲染分支 | §3.9,§6 | 1065-1237 | covered |
| 导出辅助/死代码 | §2,§10 | 95-110,134-203 | covered |
| 测试 | §9 | — | unknown |
