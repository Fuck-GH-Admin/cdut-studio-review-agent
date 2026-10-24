---
path: apps/electron/src/renderer/styles/globals.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 856d76373253eb1eb928b16620a66c9bdb178492
sha256: d4fcc9d5fa10ef4032f0d432d1c1ed8487c8be0418a958fcf8daa39bf9581526
lines: 3083
kind: style
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/styles/globals.css

## 1. 作用域与加载者

应用主窗口文档的全局样式基座（3083 行、364 个规则块；计数口径：`grep -cE '^\S.*\{$'`——行首非空白且以 `{` 结尾的开块行，含 @keyframes/@media/@layer 等 At 规则开块 29 处；换口径计数不同）：Tailwind 三指令 + `@layer base` 两段 token 化几何/阴影/色板 + 特殊主题（legacy `theme-*`）覆写 + 大批业务组件样式（TabBar/顶栏/输入区/滚动条/Tiptap/CRT 终端特效等）（`apps/electron/src/renderer/styles/globals.css:1-3`）。

调用者/加载者（冻结树 grep）：

- `apps/electron/src/renderer/main.tsx:124`（`import './styles/globals.css'`，皮肤规则 `skin-base.css:125` 紧随其后）。
- 截图导出把本文件编译产物一并注入（`apps/electron/src/renderer/components/diff/MarkdownEditorToolbar.tsx:55` 注释）。
- 跨文件约定引用：`apps/electron/src/main/lib/titlebar-overlay.ts:70`（`data-browser-native-host` 背景即本文件规则）、`apps/electron/src/renderer/components/file-browser/FileBrowser.tsx:947`（`.file-browser-row-flash` 末关键帧 `transparent` 不可改——Agent 依赖）、`apps/electron/src/renderer/components/file-browser/tree-row-layout.tsx:29`（`:has()` 规则按 sticky 链路附加阴影）、`apps/electron/src/renderer/components/tabs/TabBarItem.tsx:249`（草稿入口描边约定）。

作用域：主窗口 app 文档（viewer 独立页**不**引入本文件，见 viewer.html 手册）；皮肤经 `html[class*="skin-"]` 规则（skin-base.css）覆写 token，不改本文件。

## 2. 变量与选择器契约

### 2.1 token 色板（`@layer base`，全量机械清单）

- **几何/阴影**（`:root` `:81-90` / `.dark` `:92-98`）：`--radius`（0.625rem，`82`）+ `--radius-xl-extra/--radius-2xl-extra`（83-84）；`--shadow-xs…--shadow-xl` 五档语义阴影，深色加 inset 顶高光（注释 `:78-79`）。
- **基础色板**（`:root` `:101-138`）：`--background/--foreground/--muted/--muted-foreground/--border/--input/--ring/--primary(±foreground)/--secondary(±)/--accent(±)/--destructive(±)/--stop-hover-bg/--card(±)/--popover(±)/--dialog(±)/--content-area/--sidebar-surface/--tabbar-surface/--input-surface/--tab-surface/--tooltip(±)/--tooltip-muted/--code-bg/--dashed-border(±-hover)/--md-preview-font-size`。
- **Surface Contract v2**（`:142-164`）：`--shell-surface/--raised-surface/--sunken-surface/--surface-border(±-strong)/--input-hover/--control-surface/--control-hover/--selected-surface/--selected-foreground/--focus-ring/--overlay(±)/--message-surface/--message-user-surface/--code-fg/--blockquote-surface/--table-header-surface/--diff-addition-bg/-fg/--diff-deletion-bg/-fg/--browser-host-surface`。
- **CSLab 专区**（`:167-175`）：`--cslab-bg/surface/elevated/border/text/muted/accent/accent-hover/highlight`；**分栏三件**（`:177-179`）`--workspace-canvas/--panel-surface/--panel-border`；**语义色**（`:180-185`）`--success(±)/--warning(±)/--info(±)`。
- **`.dark` 镜像**（`:189-265`）同名全量翻转。
- **特殊主题块**（legacy `theme-*`）：雾纸暖灰 mist-paper-dark（`:284-324`，含 `--mist-paper-message-foreground:287` + 五档阴影 320-324）、ocean（`:341-375`）、forest（`:383-416`）、slate/莫兰迪（`:423-` 起）等逐主题覆写基础色板（各块字段与基础色板同构）。

### 2.2 legacy `theme-*` 组件覆写（皮肤机制的历史对照面）

`theme-terminal-dark` 等宽字体（`:22-29`）；逐主题 `::selection`（ocean/forest `:49-55`、slate-dark `:57-60`、slate-light `:63-66`、terminal `:69-73`，注释 `:31-34`：`--primary` 对比度补偿）；Dialog 光晕（`:775-789`）；`.shell-bg` 渐变逐主题（`:792-798`）；模式切换器选中态（`:800-933`+）；会话/工作区/Tab 选中态逐主题（`:846-1162`）；工作区 Badge 文字色（`:1163-`）。skin-base.css 头注与 `check-skin-token-sync.mjs` 以这些块为 token 同步基准。

### 2.3 业务组件样式群（按分节注释，行号经大纲核对）

TabBar 背景（`:1198-`）、`topbar-editorial` 顶栏 Tab 族（`:1219-1390`：active/inactive/scratch/focused/状态环 running=blue-500 `1292`、blocked=orange-500 `1297`、completed=green-500 `1301`，深色同语义层级补色 `1304-1319`；`:where(.topbar-tab-scratch)` 压权重注释 `:1263-1269`；拖拽层几何注释 `:1382-1388`）；输入框段落紧凑/代码块分色（`:1639-1674`）；全局滚动条（`:1757-1808`）；面板分隔拖动条（`:1808-`）；Spinner（`:1966`+ keyframes `1968`）；minimap 指示器（`:2002-`）；滚动进度条三态（`:2016-2106`）；CRT 机械滚动条（`:2106-`）；计划模式定位上下文（`:2158-`）；prose 行内代码反引号伪元素移除（`:2175-`）；FileBrowser 定位脉冲（`:2181`，keyframes `2191`）与 sticky 链路末行阴影（`:2200`）；Office 内联预览（`:2210-2344`）；语音浮窗拖动区（`:2344-`）；Tiptap 可编辑表格（`:2362-2459`）/代码块（`:2459-2639`）；Session Mini Map（`:2639-2690`，三 keyframes `2657/2668/2679`）；CRT 终端特效/UI 终端化/消息去气泡/空态欢迎屏/全局直角化（`:2690-3027`，keyframes `crt-flicker:2738`、`terminal-cursor-blink:2852`；直角化注释 `:3018-3024`：`[class*="rounded"]` 是有意为之的脆弱性）；工作区切换高亮（`:3029-3037`）；窄屏 Agent 收拢（`:3040-3065`，容器查询 `:3049`）；对话节点树浮层入场（`:3067-3083`，keyframes `3071`，注释 `:3068-3069`：用 keyframes 不用 transition 以适配 React 18 双阶段挂载）。

## 3. 层叠与覆盖顺序

- 顺序：`@tailwind base/components/utilities`（`:1-3`）→ `@layer base`×2（`:75` token 段、`:641`）→ 各组件/主题块（后者靠选择器特异度与源顺序取胜）。
- 特殊主题（`theme-*`/`.dark`）覆写 token 值；皮肤机制另经 skin-base.css 的 `html[class*="skin-"]` + `!important` 覆写组件规则（不改本文件）。
- 无障碍/动效降级：`@media (forced-colors: active)`（`:750`、`:1354`——顶栏 Tab 强制色映射 Highlight/HighlightText，注释 `:1349-1353`）；`prefers-reduced-motion` 降级 ×7（`:981,1059,1082,1468,2756,2862,2909`）。
- 容器查询（`:3049`）收窄屏行为（注释 `:3043`：兼容右侧面板打开后的桌面布局）。

## 4. 修改影响面

- token 名/层级改动牵动：skin-base.css 皮肤契约、`check-skin-token-sync.mjs`（以 legacy `theme-*` 块为基准）、tailwind.config.js（`--radius` 派生按钮圆角，`:77`）、`MarkdownEditorToolbar` 截图样式收集。
- 业务类名是组件 JSX 契约（topbar/tabbar/tiptap/scroll 等类名散见各组件）；`file-browser-row-flash` 末帧 `transparent` 被 Agent 链路依赖（`FileBrowser.tsx:947` 注释红线）。
- 间接测试：`PlanModeDashedBorder.test.ts`（readFileSync skin-base.css 断言 plan-mode 规则——消费本文件同族 token）；无直接测试（§5）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 加载者 4 处跨文件约定 | 已证实 | §1 列举（grep 复核） |
| token 色板全量清单（§2.1 名称@行号） | 已证实 | 逐行机械提取（grep `^\s+--…:` 全文件）+ 人工实读 `:1-102,81-98` |
| 364 规则块（口径 `^\S.*\{$`，含 At 规则开块 29 处）/31 处 At 规则/18 个 @keyframes（:970,987,992,997,1002,1007,1020,1070,1321,1968,2191,2657,2668,2679,2738,2852,3030,3071） | 已证实 | 机械全量提取（规则头逐行，`grep -nE '^@keyframes'` 复现 18） |
| 顶栏状态色/权重注释/拖拽层几何 | 已证实 | 人工实读 `:1244-1390` |
| CRT 末段/直角化/容器查询/keyframes 收尾 | 已证实 | 人工实读 `:2948-3083` |
| 分节职责地图（§2.3） | 已证实（注释标题逐条提取）+ 各节代表行段实读 | 大纲 grep + 实读段 |
| **人工逐行实读范围** | 本文件按「全量机械逐行提取（规则头/变量/注释/At 规则）+ 人工实读 `:1-102,81-98,1244-1390,2948-3083`」覆盖；其余行段为机械清单+注释标题证据，QA 行号抽查以此口径为准 | 见 UNVERIFIED.md §2 |
| 各主题块逐值色卡 | 未知（未逐值人工抄录） | 机械清单可定位；NOT_RUN 渲染 |

## 6. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 作用域/加载者 | §1 | 1-3 + §1 引用 | covered |
| token 色板（基础/Surface/CSLab/语义/暗镜/特殊主题） | §2.1 | 81-445+ | covered（机械全量） |
| legacy theme-* 覆写群 | §2.2 | 22-1162 | covered |
| 业务组件样式群（13 组） | §2.3 | 1198-3083 | covered（分节全量+实读段） |
| 层叠/无障碍/降级 | §3 | 75,641,750,1354,981-2909,3049 | covered |
| 修改影响面 | §4 | — | covered |
| 运行渲染/逐值色卡 | §5 | — | unknown（NOT_RUN） |
