---
path: apps/electron/tailwind.config.js
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 92ad49e801293c5cd610c2d9a5f536eb1bde6c98
sha256: 523a4e1b2d45c9c82058d915dc24e98980ff38bbdeac4af1c86d3bc6d55b9be0
lines: 220
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/tailwind.config.js

## 1. 结论与边界
Tailwind CSS 主题配置（ESM 默认导出的配置对象，220 行）：定义类名扫描范围、8 个 legacy 主题类 safelist、语义色/字体/圆角/阴影/动画的 CSS 变量契约与 2 个插件（`apps/electron/tailwind.config.js:1-220`）。边界：不含 CSS 变量值（定义在 `src/renderer/styles/globals.css`）；不声明 postcss 管线（`apps/electron/postcss.config.js`）；`require()` 仅在 `plugins` 用（`:217-218`），正文是纯数据+1 组注释。

## 2. 导出与关键符号
| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `default`（Tailwind Config） | 导出（默认） | 2-220 | `import('tailwindcss').Config` | 唯一导出（`:1` JSDoc 类型标注） |
| `darkMode` | 配置键 | 3 | `'class'` | 暗色切换走 .dark 类 |
| `content` | 配置键 | 4-19 | `{relative, files[3]}` | 扫描范围（见 §3） |
| `safelist` | 配置键 | 22-31 | `string[8]` | legacy `theme-*` 类 |
| `theme.extend` | 配置键 | 33-214 | colors/fontFamily/borderRadius/boxShadow/keyframes/animation | 见 §3 |
| `plugins` | 配置键 | 216-219 | `[@tailwindcss/typography, tailwindcss-animate]` | `require` 加载（`:217-218`） |

## 3. 内部逻辑与关键流程
按对象顺序：①`content`（`:4-19`）：`relative:true`（`:6`，注释：路径相对配置文件解析，防跨 cwd 漏扫 `:5`）；`files` 3 条——`./src/renderer/**/*.{js,ts,jsx,tsx}`（`:8`）、`../../packages/ui/src/**/*.{js,ts,jsx,tsx}`（`:11`，注释：@profer/ui 源码即入口参与扫描，否则 animate-in、data-[state] 等基元类不生成 `:9-10`）、否定条目 `!./src/renderer/public/**`（`:17`，注释：`scripts/build-ooxml.mjs` 每次 dev/build 清空重写的 vendored OOXML 约 6.3MB 不含类名，不排除则冷启动 CSS 变换 ~1.7s→~8.8s 并阻塞 Vite 单线程首屏 `:12-16`）；②`safelist` 8 个 `theme-*` 类（`:22-31`）：注释自述 `applyThemeToDOM` 自 2026-09-11 不再拼接 `theme-${style}`（tablet 入口退役），保留仅为兼容可能残留的 DOM（`:20-21`）；③`theme.extend.colors`（`:34-138`）：全部映射 `hsl(var(--token) …)`——基础 border/input/ring/background/foreground（`:35-39`）、成对 DEFAULT+foreground 的 primary/secondary/muted/accent/destructive/card/popover/dialog（`:40-71`）、tooltip 三键（`:72-76`）、content-area（`:77`）、workspace-canvas/panel-surface/panel-border 带 var() 兜底（`:78-80`，fallback sunken-surface/raised-surface/surface-border）、sidebar/tabbar/tab（`:81-83`）、**`input` 重复键**（`:36` 与 `:84-87`，JS 对象字面量后者生效，实得 DEFAULT=`--input-surface`/hover=`--input-hover`，`:36` 的映射被覆盖——实现怪癖如实记录）、surface 6 键（`:88-95`）、control 2 键（`:96-99`）、overlay/focus（`:100-101`）、message 2 键（`:102-105`）、code 2 键（`:106-109`）、quote/table-header/browser-host（`:110-112`）、success/warning/info 各 2 键（`:113-124`）、cslab 8 键（`:128-137`，注释：随 .dark 自动切换、变量在 globals.css、带 `<alpha-value>` 兼容 /60 /70 修饰类 `:125-127`）；④`fontFamily.sans`（`:141-152`，Inter Variable→SF Pro Text→中文系统字体）与 `serif`（`:154-166`，Newsreader/思源系→Georgia，注释：优先系统内置保证离线 `:153`）；⑤`borderRadius` 6 档全部由 `--radius` 派生（`:170-177`；xl/2xl 另有 `--radius-xl-extra`/`--radius-2xl-extra` 兜底 2px/4px，`:175-176`；注释动机 `:168-169`）；⑥`boxShadow` 8 档（`:180-190`）：xs/sm/DEFAULT/md/lg/xl/2xl 映射 `--shadow-*` 变量，`subtle` 为字面量微弱浮层（`:189`，注释禁止 cslab 新组件用 lg/2xl `:188`；78 处 shadow-md/lg 既有代码兼容说明 `:179`）；⑦`keyframes` 4 组（`:191-208`：slide-in-from-top/bottom、slide-out-to-right、preview-slide-out）+ `animation` 3 条（`:209-213`：in 0.3s/out 0.2s/preview-slide-out 0.25s forwards）。

## 4. 调用者与调用链
入向：①postcss 管线——`apps/electron/postcss.config.js:3` 的 `tailwindcss` 插件（工具约定加载本文件，推断）；②测试——`apps/electron/scripts/ui-workspace-contract.test.ts:11` 置 `configPath=resolve(appRoot,'tailwind.config.js')`，`:17` 传入 `tailwindcss(configPath)` 实际编译；③shadcn 接线——`apps/electron/components.json:7` 指向本文件。出向：`require('@tailwindcss/typography')`/`require('tailwindcss-animate')`（`:217-218`）；CSS 变量消费自 `src/renderer/styles/globals.css`（`:82` `--radius: 0.625rem`、`:86/:94` `--shadow-sm` 亮/暗两套、`:105/:193` `--border`、`:167` `--cslab-bg` 等）。类名消费者（grep 证据）：`CdutScienceView.tsx:47`（`bg-cslab-bg text-cslab-text`）、`CsLabPreparationView.tsx:313`（`text-cslab-muted hover:bg-cslab-surface`）；`packages/ui/src/lib/z-layers.ts:52` 注释自述 z-index 字符串集中声明以被 content 扫描。

## 5. 数据 I/O、读写与副作用
不适用，依据：本文件无 I/O 代码。副作用（工具层）：构建期按 `content.files`（`:7-18`）扫描生成 CSS；`safelist`（`:22-31`）强制生成 8 个 legacy 类的 CSS。

## 6. 分支、失败、取消与恢复
不适用，依据：无分支与错误路径（配置对象）。已知风险点（注释自述）：删除 `!./src/renderer/public/**`（`:17`）冷启动显著变慢（`:15-16` 实测数字）；移除 packages/ui 扫描条目（`:11`）基元类丢失（`:10`）。无恢复逻辑。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。主题变量权威在 `globals.css`（变量值由其 :82/:86/:105/:167 等定义）；`input` 重复键的生效者为后者（`:84-87`，JS 语义，推断）。

## 8. 修改影响面
改 `content.files` 影响全 renderer+packages/ui 类名生成与构建耗时（§6）；改 colors 映射（`:34-138`）波及全部使用 `bg-*`/`text-*` 语义类的组件（例见 §4）；改 borderRadius/boxShadow（`:170-190`）影响全站圆角/阴影（注释自述 300+ 处 rounded-*、78 处 shadow-* 免改的兼容设计 `:169`/`:179`）；改 plugins 影响 typography 类与 animate 类。需同步修改：`globals.css` 变量、`ui-workspace-contract.test.ts`（断言 `.z-\[10050\]`、`.bg-tooltip\/90`、`data-\[state=closed\]:zoom-out-95` 生成，`:21-23`）、`packages/ui` 组件类名。

## 9. 测试证据
直接测试：`apps/electron/scripts/ui-workspace-contract.test.ts`（42 行，2 用例）——用例 1（`:16-24`）真实编译（`postcss([tailwindcss(configPath)]).process('@tailwind utilities;')`，`:17-18`）并断言生成选择器 `.z-\[10050\]`（`:21`）、`.bg-tooltip\/90`（`:22`）、`.data-\[state=closed\]:zoom-out-95[data-state="closed"]`（`:23`）——真实断言，mock 边界：无 mock，用真 postcss/tailwindcss。未覆盖：colors/borderRadius/boxShadow/keyframes 各映射无选择器断言。NOT_RUN：本轮未执行测试/构建（静态阅读，断言为读到的代码）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 配置结构与行段如 §2/§3 | 已证实 | `apps/electron/tailwind.config.js:1-220` 逐行 |
| `input` 重复键、后者生效 | 已证实（键存在）/推断（生效语义） | `:36` 与 `:84-87` + JS 对象字面量语义 |
| 测试真实编译并断言 3 选择器 | 已证实 | `ui-workspace-contract.test.ts:17-23` |
| 变量定义真实存在于 globals.css | 已证实 | `globals.css:82/:86/:94/:105/:167/:193` |
| cslab 类真实消费 | 已证实 | `CdutScienceView.tsx:47`、`CsLabPreparationView.tsx:313` |
| content 扫描性能数字（1.7s→8.8s） | 推断 | `:15-16` 注释自述实测记录，未复现 |
| theme-* safelist 的 DOM 残留是否真实存在 | 未知 | `:20-21` 注释自述兼容动机；全 `apps/electron/src` 检索 `theme-ocean-light`/`theme-slate-dark` 0 命中（范围：.ts/.tsx 全量），残留来源未证实 |
| tailwindcss 插件自动读本文件的确切机制 | 推断 | 工具约定 |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| darkMode/content | §3/§6/§8 | `:3-19` | covered |
| safelist | §3/§10 | `:20-31` | covered |
| colors（含 input 重复键/兜底 var） | §3/§7 | `:34-138` | covered |
| fontFamily | §3 | `:139-167` | covered |
| borderRadius/boxShadow | §3/§8 | `:168-190` | covered |
| keyframes/animation | §3 | `:191-213` | covered |
| plugins | §2/§4 | `:216-219` | covered |
| 测试断言 | §9 | `ui-workspace-contract.test.ts:16-24` | covered |
