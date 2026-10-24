---
path: apps/electron/src/renderer/viewer/main.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07feaa925d9256083383c849aa10265ccc6c02a2
sha256: 7e7f29ee97c5a6c12e2954761c41bef7376191746cf5281ccbf4551d50d1ca59
lines: 151
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/viewer/main.ts

## 1. 结论与边界

浏览器列独立文件预览页（Open File Viewer 宿主）的 module 入口：装配 OFV 查看器（`createViewer`）、落地主进程烘进 URL 的主题 token、安装“划词→对话引用”回投器、提供失败降级骨架（`apps/electron/src/renderer/viewer/main.ts:1-23`）。

**安全边界（文件头注释 `:4-8,20-22`）**：本页跑在 `sandbox:true/contextIsolation/nodeIntegration:false/无 preload` 的独立 web contents，只能用主进程签发的 `cdut-file://<token>` URL 取文件；向 app 的两条回投（默认应用打开、划词引用）只能借**哨兵 URL**（常量在 `@profer/shared` 的 `browser-file-sentinels`，主进程按同一定义拦截放行）。

边界：不做文件解析（OFV 插件 `@/lib/ofv-plugins`）；工具栏配置在 `@/lib/ofv-toolbar`（与 app 内回退路径共用）。

## 2. 导出与关键符号

文件级 `export` 0（module 入口，全部内部函数）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SELECTION_REPORT_DELAY_MS` | 内部常量 | 41 | `180` | 划词静默期（防拖拽碎片连发） |
| `installSelectionReporter` | 内部函数 | 50-82 | `() => void` | 划词回投器（见 §3.2） |
| `showFallback` | 内部函数 | 84-102 | `(message: string) => void` | 降级骨架（逐节点 textContent） |
| `applyPageTheme` | 内部函数 | 111-119 | `(params) => 'light'\|'dark'` | 主题类 + token 内联变量 |
| `main` | 内部函数 | 121-149 | `() => void` | 装配入口 |
| `isToolbarSelection` | 内部函数 | 55-59 | `(selection) => boolean` | 选区两端都在 `.ofv-toolbar` 内=误拖 |

## 3. 内部逻辑与关键流程

### 3.1 `main`（`apps/electron/src/renderer/viewer/main.ts:121-149`）

`params` 取 `src`/`name`（主进程 `createViewerPreviewUrl` 烘入）→ `applyPageTheme(params)` → `name` 非空设 `document.title`（`:126`）→ `src` 空则 `showFallback('缺少文件地址：主进程未提供受控的本地文件 URL。')`（`:127-130`）→ `installSelectionReporter()` → `createViewer({container: host, file: src, fileName: name, plugins: createOfvPlugins(), theme, locale: 'zh-CN', toolbar: createOfvToolbarOptions(), onError: e => showFallback('预览失败：...')})`（`:133-144`）；`beforeunload` → `viewer.destroy()`（`:145`）；构造抛错 catch → `showFallback`（`:146-148`）。

### 3.2 `installSelectionReporter`（`:50-82`）

`selectionchange` 触发 `schedule`（180ms 防抖，`:72-75`）→ `report`（`:61-70`）：取 `window.getSelection()` 文本 trim；与 `lastReported` 相同跳过；空且上次也空跳过（`:65-66`）；`isToolbarSelection`（选区两端都落在 `.ofv-toolbar`，误拖工具栏不算划词）跳过（`:67`）；否则 `window.open(encodeBrowserLocalFileSelection(text), '_blank')` 哨兵 URL 回投（`:69`）——**选区清空也回投空串**让 app 撤引用（注释 `:48`）。`beforeunload` 清定时器（`:79-81`）。

### 3.3 `applyPageTheme`（`:111-119`）

`theme = params.get('theme')==='dark' ? 'dark' : 'light'`；`classList.add('viewer-page')` + `classList.toggle('dark', ...)`；`parseOfvThemeTokens(params.get('tokens'))`（`@profer/shared` 校验器：名单+白名单+长度上限，契约唯一来源）→ 逐条 `root.style.setProperty(`--${name}`, value)`（`:117`）。注释（`:104-110`）：内联变量优先级高于 `ofv-profer-theme.css` 兜底镜像；幂等（首帧脚本已做过，此处用校验值重落）。

### 3.4 `showFallback`（`:84-102`）

隐藏 `#host`、显示 `#fallback`；**逐节点 `createElement` + `textContent` 写入**（注释 `:90`：避免把 OFV 错误文本当 HTML 注入）；`box.className='ofv-profer-empty'` + title（'无法预览这个文件'）+ detail（message），`fallback.replaceChildren(box)`。

## 4. 调用者与调用链

入向：`viewer.html:47`（`<script type="module" src="./viewer/main.ts">` 唯一入口）。

出向：`@open-file-viewer/core`（`createViewer`/`FileViewer`，`:24`）；样式导入 `@fontsource-variable/inter`、`@open-file-viewer/core/style.css`、`@/styles/ofv-profer-theme.css`（顺序注释 `:25`：字体/OFV 基础先、桥接最后以赢特异度）；`@profer/shared`（`BROWSER_LOCAL_FILE_SELECTION_URL_PREFIX`/`encodeBrowserLocalFileSelection`/`parseOfvThemeTokens`，`:29-33`）；`@/lib/ofv-plugins`、`@/lib/ofv-toolbar`（`:34-35`）。

## 5. 数据 I/O、读写与副作用

- 读：URL 查询参数；无磁盘/IPC（**无 preload**，见 §1）。
- 副作用：DOM class/内联变量写入；`window.open(哨兵 URL)`（主进程拦截转译，不真导航，注释 `:46-47`）；`viewer.destroy()` on unload；180ms 定时器。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 缺 `src` | 127-130 | showFallback（缺文件地址） |
| `createViewer` 抛错 | 146-148 | showFallback（预览失败+message） |
| OFV `onError` | 143 | showFallback（预览失败） |
| 划词重复/空/工具栏误拖 | 65-67 | 不回投 |
| tokens 非法 | 116（parseOfvThemeTokens 内部收口） | 跳过非法 token |

- 取消：`beforeunload` 清划词定时器（`:79-81`）并销毁 viewer（`:145`）。
- 恢复：无自动重试（降级骨架常驻，用户重开预览）。

## 7. 权限与权威状态

- **文件访问权威 = 主进程签发的 `cdut-file://<token>` URL**（本页无法自取文件，`:6`）；哨兵 URL 由主进程按 `browser-file-sentinels` 同一定义拦截（`:20-22`）。
- 主题权威 = URL 烘入的 `theme`/`tokens`（本页读不到 app 设置与文档变量，`:14-15`）；token 合法性权威 = `@profer/shared` 的 `parseOfvThemeTokens`。
- 划词回投内容仅文本（`toString()`），不注入 HTML（§3.2/§3.4 双重 textContent 防线）。

## 8. 修改影响面

- 改回投协议影响主进程哨兵拦截与 `useBrowserLocalFileSelectionQuote`（渲染端落引用 atom）。
- 改 `parseOfvThemeTokens`/token 名单影响 `ofv-profer-theme.css` 映射（漂移守卫 `lib/ofv-theme-tokens.test.ts`，见该 CSS 手册）。
- 改 `#host`/`#fallback` 契约与 `viewer.html` 联动。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对本文件 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`packages/shared/src/constants/ofv-theme-bridge.test.ts` 测 token 校验契约（`parseOfvThemeTokens` 所属），**不覆盖本文件装配**。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实预览。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：划词回投/防抖/工具栏误拖、降级骨架、token 写入均无自动化断言。维护者验证：受管浏览器打开预览→划词引用进对话→失败文件看降级骨架。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无 preload 仅 cdut-file URL 的安全边界 | 已证实 | 文件头 `:4-8` |
| 划词回投=哨兵 URL + 空串撤销 | 已证实 | `:46-48,69` |
| 工具栏误拖排除 | 已证实 | `:54-59,67` |
| 降级骨架逐节点 textContent 防注入 | 已证实 | `:90-100` |
| token 只进 setProperty、无拼接 | 已证实 | `:117`（+viewer.html:37-38 同口径） |
| 主进程哨兵拦截实现 | 未知 | 文件外 |
| 真实 OFV 行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `main` 装配 | §3.1 | 121-149 | covered |
| `installSelectionReporter` | §3.2 | 50-82 | covered |
| `applyPageTheme` | §3.3 | 111-119 | covered |
| `showFallback` | §3.4 | 84-102 | covered |
| 安全边界 | §1,§7 | 4-8,20-22 | covered |
| 失败分支 | §6 | 127-148 | covered |
| 测试 | §9 | — | unknown |
