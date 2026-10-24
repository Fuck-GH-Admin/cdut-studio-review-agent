---
path: apps/electron/src/renderer/components/agent-preview/AgentPreviewRenderer.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 844dae30c4485cd2536494d130c37c20c4221d10
sha256: 40cf16e7003cc207f88c5005b8d89cb0c1cae1da250d7ae9fc3b3f202e768405
lines: 200
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-preview/AgentPreviewRenderer.tsx

## 1. 结论与边界

隐藏 Agent 预览窗口的 renderer 入口（渲染层运行时，独立无头窗口）：接受主进程签发的受控 `cdut-file` 资源，渲染文档（Office/Markdown/图片/HTML/PDF）并逐页截图回传（文件头 `apps/electron/src/renderer/components/agent-preview/AgentPreviewRenderer.tsx:1`）。宿主是主进程 `show:false` 无头窗口，截图底色固定白（不随深色主题，`:9-17`）。

边界：不做任务调度/截图采集（主进程经 `window.agentPreviewAPI`）；Office 渲染在 `silurus-bridge`；Markdown 转换在 `markdown-rich-text`；iframe 无 Electron API（`:68`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出（其余内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `mountAgentPreviewRenderer` | 函数（导出） | 198-200 | `() => void` | `createRoot(#root).render(<AgentPreviewApp/>)` |
| `MAX_OVERVIEW_PAGES` | 常量（内部） | 8 | `12` | overview 采样上限 |
| `PREVIEW_CAPTURE_BACKGROUND/FOREGROUND` | 常量（内部） | 15-17 | `#ffffff`/`#111111` | 纸面固定色 |
| `nextPaint`/`settleViewer` | 函数（内部） | 18-23 | 双 rAF/等待 140ms 再双 rAF | 渲染沉降 |
| `RenderedPreview` | 接口（内部） | 25-29 | `{viewer, pageCount, navigate?}` | |
| `PreviewCanvas` | 组件（内部） | 31-124 | 任务渲染画布 | §3.1 |
| `requestedPages` | 函数（内部） | 126-140 | `(task, pageCount, canNavigate) => number[]` | 页范围校验 |
| `AgentPreviewApp` | 组件（内部） | 142-196 | 任务分发 + 结果回传 | §3.3 |

## 3. 内部逻辑与关键流程

### 3.1 `PreviewCanvas`（`:31-124`）

按 `task.kind` 分四路（`:44-109`）：Office（`normalizeOfficeFormat` 命中→`createOfficeViewer`+`fitPage`+`settleViewer`，`:46-53`）；markdown→`innerHTML=markdownToHtml`（`:55-56`）；image→`<img>` 等待 load/error（`:57-66`）；html/pdf→`<iframe sandbox="allow-scripts">` 20s 加载超时（`:67-78`）。PDF 另走 postMessage 协议：`agent-preview:pdf-ready` 报页数（20s 超时，`:80-89`）、`select-pdf-page`/`pdf-page-rendered` 逐页导航（`:90-103`）。清理：`cancelled` 防竞态、`destroyOfficeViewer`、`replaceChildren()`（`:115-120`）。

### 3.2 `requestedPages`（`:126-140`）

pageCount 非正整数→throw（`:127`）；`scope:'page'` 越界/不可导航页>1→throw 带 `code:'page_out_of_range'`（`:128-131`）；`scope:'all'` 超 `AGENT_PREVIEW_LIMITS.maxPages`→throw、不可导航且 >1 页→throw（`:133-136`）；overview=有界采样 `min(pageCount, 12)` 页（`:138-139`，注释：刻意不冒充全文档截图）。

### 3.3 `AgentPreviewApp`（`:142-196`）

`handleRendered`（`:145-179`）：`canNavigate` 由 viewer 是否有 scrollToSlide/scrollToPage/goToSheet 或 navigate 判定（`:149-152`）；逐页导航后 `capture(task.id)` 取 PNG（`:155-168`）；warnings：overview 页数不足提示用 scope=all/page 续查、无 viewer 单视口提示（`:170-172`）；`sendResult`/失败 `sendError`（`:173-176`）。`handleFailure`（`:181-184`）。挂载：先 `onRender` 订阅再 `notifyReady`（防丢首个任务，`:186-192`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`renderer/main.tsx:1072-1073`（动态 `import(...).then(mountAgentPreviewRenderer)`——独立预览窗口入口分支）。

出向：`@profer/shared`（`AGENT_PREVIEW_LIMITS`/类型，`:4`）、`@/components/file-browser/office-preview/silurus-bridge`（`:5`）、`@/lib/markdown-rich-text`（`:6`）、`window.agentPreviewAPI`（`onRender`/`notifyReady`/`capture`/`sendResult`/`sendError`，`:146-190`）。

## 5. 数据 I/O、读写与副作用

- 读：任务资源经 `task.sourceUrl`（主进程签发 cdut-file URL）；写：截图/结果经 `agentPreviewAPI` 回传主进程。
- 副作用：iframe 内嵌页面执行脚本（sandbox allow-scripts，`:71`）；postMessage 通信（`:100`）；DOM 渲染。
- 并发/竞态：`cancelled` 标志 + effect cleanup（`:41,48,115-120`）；`key={task.id}` 强制重建画布（`:195`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 四类渲染 | task.kind/format | 44-109 |
| 页码越界/超限 | requestedPages | 126-140 |
| 20s 超时 | iframe load/PDF ready/页渲染 | 75, 81, 92 |
| 图片加载失败 | img error | 65 |
| 导航/截图失败 | catch→sendError | 174-177 |
| 组件卸载取消 | cancelled/destroy | 48, 115-120 |

无重试；失败即 `sendError` 由主进程决定后续（未知）。

## 7. 权限与权威状态

资源边界=主进程签发的 opaque `cdut-file` URL（`:1,:68`）；iframe `sandbox="allow-scripts"` 且不获 Electron API（`:68,71`）。无 sender/role 检查，依据：本文件无 Electron sender 校验；任务权威在主进程（agentPreviewAPI）。

## 8. 修改影响面

- `main.tsx:1072`（预览窗口入口）；主进程 agent-preview 服务（`main/lib/agent-preview-renderer.test.ts` 测试对象，非本批）。
- postMessage 消息名（`agent-preview:*`）与 PDF 侧共享契约；`AGENT_PREVIEW_LIMITS` 在 shared。
- 需同步的测试：无直接测试（§9）。

## 9. 测试证据

直接测试：**无**（本文件无专属测试）。间接证据：`main/lib/agent-preview-renderer.test.ts`（非本批）测主进程侧任务服务，不覆盖本渲染组件。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实无头窗口截图。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 内部 8 符号 | 已证实 | `:8-200` 逐行读 |
| 四路渲染/超时/竞态处理 | 已证实 | `:44-120` |
| requestedPages 三 scope 语义 | 已证实 | `:126-140` |
| 唯一调用方 main.tsx 动态入口 | 已证实 | `main.tsx:1072-1073` |
| PDF 阅读器侧消息实现 | 未知 | 未在本文件（iframe 内容） |
| 主进程 capture 语义 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `mountAgentPreviewRenderer` | §2 | 198-200 | covered |
| `PreviewCanvas` 四路+清理 | §3.1 | 31-124 | covered |
| `requestedPages` | §3.2 | 126-140 | covered |
| `AgentPreviewApp` 回传协议 | §3.3 | 142-196 | covered |
| 调用链 | §4 | - | covered |
| PDF 侧/主进程 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
