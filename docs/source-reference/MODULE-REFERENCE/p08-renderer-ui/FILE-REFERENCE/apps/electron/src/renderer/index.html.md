---
path: apps/electron/src/renderer/index.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4efe0e03ef546fec3376fceb2a063dbf3ea26eac
sha256: 2ebd99115d9d8a5691c3dac54d9a26096f4bde75c561d67e6bf0bd906e283299
lines: 58
kind: template
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/index.html

## 1. 入口与加载方式

主渲染窗口的 HTML 入口（Vite 模板）：Electron BrowserWindow 加载本页 → `<div id="root">` 挂 React → `<script type="module" src="/main.tsx">`（`apps/electron/src/renderer/index.html:55-56`）。`<head>` 内两个**内联同步脚本**在 React 加载前执行，防首帧闪烁（`:7-52`）。开发经 Vite dev server、打包后为静态资源（file/http 由主进程决定）。

## 2. 脚本块与事件流

两个内联 IIFE（无事件监听、无表单/文件输入）：

1. **标题初始化**（`:7-19`）：`localStorage.getItem('profer-user-profile') || getItem('proma-user-profile')`（注释 `:9`：proma→profer key 迁移兼容，一两个版本后移除旧读）→ `JSON.parse` → `profile.userName` 非空则 `document.title = profile.userName`（`:14-16`）；全程 try/catch 静默（`:17`）。
2. **主题初始化**（`:20-52`）：`mode = 'profer-theme-mode' || 'dark'`、`style = 'profer-theme-style'`（`:24-25`）分支：
   - `mode==='special' && style && style!=='default'`（皮肤机制，`:28`）：读 `cdut-skin-tone` 缓存（由 atoms/theme.ts 写入，`:29-32`）；`tone` 为 dark/light → `html.classList.add('skin-'+style)` + tone==dark 加 `dark`（`:33-35`）；tone 未知 → 仅当 `style.endsWith('-dark')` 加 `dark`（注释 `:37-38`：**不主动加 `theme-*`**，避免 desktop 主路径落入 legacy 双写视觉层）。
   - `mode==='dark'` → 加 `dark`（`:43-44`）；`mode==='system'` → `matchMedia('(prefers-color-scheme: dark)')` 命中才加（`:45-48`）；`mode==='light'` 不加（`:50`）。

## 3. DOM 契约

- `#root`（`:55`）：React 挂载点（main.tsx `document.getElementById('root')`）。
- `document.documentElement` class 契约：`dark` / `skin-<id>`（`:34-44`），被 globals.css/skin-base.css 消费。
- 内联脚本读取的 localStorage 键：`profer-user-profile`/`proma-user-profile`/`profer-theme-mode`/`profer-theme-style`/`cdut-skin-tone`（与 settings-service/atoms/theme.ts 的写入方对应）。
- 无 `<script>` 事件处理器、无表单/文件输入（内容扫描：2 个 `<script>` 均为同步 IIFE，0 个 addEventListener/onclick）。

## 4. 失败与降级

- 标题脚本任何异常静默忽略（`:17`），标题保持默认 `CDUT Studio`（`:6`）。
- localStorage 不可用/JSON 损坏 → 不设标题、主题分支落到 mode 缺省（`'dark'`，`:24`）。
- skin tone 未知 → 保守只恢复明暗（`:36-42`），等 renderer 注册表确认后再应用 skin-*（由 atoms/theme.ts 后续接管）。

## 5. 修改影响面

- 改内联脚本影响所有窗口首帧视觉/标题；与 `atoms/theme.ts`（皮肤 tone 缓存写入）、`settings-service`（localStorage 键）联动。
- localStorage key 迁移链（proma-* → profer-*）另有 `@/lib/localstorage-migration` 在 main.tsx 首行执行；本页旧键读取是迁移前的兼容窗口（`main.tsx:7-9`）。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个内联脚本的完整分支 | 已证实 | `:7-52` 逐行 |
| skin tone 未知时不加 theme-* | 已证实 | `:37-41` 注释+代码 |
| 0 个事件处理器/表单 | 已证实（内容扫描全文件） | 58 行全文 |
| localStorage 写入方（theme.ts/settings-service） | 推断 | 命名对应，写入点未逐行读 |
| 真实首帧表现 | 未知 | NOT_RUN |

## 7. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 入口/挂载 | §1 | 55-56 | covered |
| 标题脚本 | §2 | 7-19 | covered |
| 主题脚本全分支 | §2 | 20-52 | covered |
| DOM/localStorage 契约 | §3 | 34-55 | covered |
| 失败降级 | §4 | 17,36-42 | covered |
| 修改影响面 | §5 | — | covered |
| 运行结果 | §6 | — | unknown（NOT_RUN） |
