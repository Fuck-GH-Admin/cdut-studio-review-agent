---
path: apps/electron/src/renderer/viewer.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9e4e2617f1b52d5d0f4c72b1685e1d6939f596f4
sha256: ceb2a56c08e90a7ee04390c2f3eef581264de8f4beff01d07966c2e1dd0f04d4
lines: 49
kind: template
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/viewer.html

## 1. 入口与加载方式

浏览器列的独立文件预览页（Open File Viewer 宿主）HTML 入口：主进程 `createViewerPreviewUrl` 烘好参数后由受管浏览器的 WebContentsView 加载（`sandbox:true / contextIsolation / nodeIntegration:false / **无 preload**`，见 `viewer/main.ts` 文件头）；`<script type="module" src="./viewer/main.ts">` 启动 OFV 查看器（`apps/electron/src/renderer/viewer.html:47`）。

## 2. 脚本块与事件流

1 个内联 IIFE（`:22-42`，module 入口前执行防白闪）+ 1 个 module 脚本。无事件处理器/表单/文件输入（内容扫描：0 个 addEventListener/onclick）。

- 内联首帧主题脚本（`:27-41`）：`URLSearchParams(location.search)` 取 `theme`/`tokens`（**仅主进程会烘这两个参数**，`:24`）；`root.classList.add('viewer-page')`；`theme==='dark'` 加 `dark`（`:31`）；`tokens` 缺失或 `length>2048` 直接返回（`:33`）；`JSON.parse` 失败返回（`:35`）；只取 `background` 一条：类型非 string/空/长度>64 一律返回（`:39`），通过则 `root.style.setProperty('--background', background)`（`:40`）。
- 注释（`:25-26`）：其余 token 由 `viewer/main.ts` 经 `@profer/shared` 校验器统一应用，契约（名单+值白名单+长度上限）只维护那一份。

## 3. DOM 契约

- `#host`（`:45`）：OFV 查看器挂载容器（`viewer/main.ts:131,136`）。
- `#fallback`（`:46`）：降级骨架（`viewer/main.ts:84-102` 的 `showFallback` 逐节点写入）。
- `<html>` class：`viewer-page`、`dark`（`:30-31`）；内联变量 `--background`（`:40`）。
- 内联 `<style>`（`:7-21`）：`color-scheme` 显式跟随 `.dark`（注释 `:10`：若跟随 OS，深色下滚动条/表单控件仍浅色）；`body` 背景 `hsl(var(--background, 回退值))` 双态（`:14-15`）；`#host` 全屏绝对定位（`:16`）；`#fallback` 默认 `display:none`（`:17-20`）。

## 4. 失败与降级

- `tokens` 超 2048 字符 / JSON 解析失败 / background 类型长度不合法 → 跳过内联变量，页面回落到 `<style>` 里的默认底色（`:33-39` + `:14-15` 回退值）。
- 安全收口注释（`:37-38`）：值只进 CSS 自定义属性（`setProperty` 安全 API，仅被 `hsl(var(--background))` 消费），无拼接进样式表路径。
- 查看器加载失败 → `viewer/main.ts` 的 `showFallback('无法预览这个文件' + 详情)`（`viewer/main.ts:84-102,143,147`）。

## 5. 修改影响面

- 改参数契约需同步主进程 `createViewerPreviewUrl`（browser-preview-service）与 `viewer/main.ts`。
- 改 `#host`/`#fallback` id 或样式影响 `viewer/main.ts` 的挂载与降级路径。
- `--background` 首帧回退值与 `ofv-profer-theme.css` 的 viewer 兜底镜像同语义（三处底色口径需一致）。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 内联脚本全分支 + 长度/类型闸门 | 已证实 | `:27-41` |
| 0 个事件处理器/表单 | 已证实（内容扫描全文件） | 49 行全文 |
| `#host`/`#fallback` 消费方 | 已证实 | `viewer/main.ts:84-102,131` |
| 主进程烘参实现 | 未知 | 文件外（注释自述 `:24`） |
| 真实渲染/白闪表现 | 未知 | NOT_RUN |

## 7. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 入口/加载 | §1 | 47 | covered |
| 内联脚本事件流 | §2 | 22-42 | covered |
| DOM/样式契约 | §3 | 7-21,45-46 | covered |
| 失败与降级 | §4 | 33-39,14-15 | covered |
| 修改影响面 | §5 | — | covered |
| 运行结果 | §6 | — | unknown（NOT_RUN） |
