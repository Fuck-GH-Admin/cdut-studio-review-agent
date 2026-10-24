---
path: apps/electron/src/renderer/styles/ofv-profer-theme.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b913bd9717f70a0a3176fcdda028751a9109f9a8
sha256: 8d5edde3e1a87f90efb71f2295912a49877fc520c88bab6885bb3c53af76a5ac
lines: 242
kind: style
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/styles/ofv-profer-theme.css

## 1. 作用域与加载者

调用者（冻结树 grep，两路加载点见下）：`OfvPreview.tsx:32`、`viewer/main.ts:28`。

OFV（Open File Viewer）→ Profer 主题桥接样式，**两条路径共用同一份映射**（`apps/electron/src/renderer/styles/ofv-profer-theme.css:1-25`）：

- **app 内回退路径**：`components/file-browser/ofv-preview/OfvPreview.tsx:32`（`import '@/styles/ofv-profer-theme.css'`）——token 来自 `globals.css`/皮肤 CSS，`var()` 随 `:root` 变，换肤即时生效（`:5-6`）。
- **viewer 独立页**（浏览器列主路径）：`viewer/main.ts:28`（import）——无 preload 沙箱页读不到 app 主题，主进程把明暗+实际 token 值烘进 URL，页面写成 `<html>` 内联变量（内联 > 本文件兜底镜像，`:7-9`）。

分工边界（`:11-18`）：**配色跟随主题**（底/纸面/文字/边框/悬停/强调映射 Profer token）；**排版不跟随**（字体/字号/行高/文档版式保持 OFV 原样——预览保真）；皮肤的外壳特效（扫描线/辉光/全局直角化）不搬运，跨进程只传颜色/几何值（shared 的 `ofv-theme-bridge`，不是皮肤 CSS 文本）。

## 2. 变量与选择器契约

**消费的 Profer token**（必须都在 `@profer/shared` 的 `OFV_THEME_TOKEN_NAMES` 名单里——漂移守卫 `lib/ofv-theme-tokens.test.ts`，`:23-24`）：

| 段 | 选择器 | token → 输出 | 行 |
| --- | --- | --- | --- |
| 1) viewer 兜底镜像 | `html.viewer-page` / `.viewer-page.dark` | `--radius/--primary/--background/--foreground/--muted/--muted-foreground/--raised-surface/--surface-border` 双态默认值 + `--panel-surface/--panel-border` 派生 | 34-58 |
| 2) 配色映射 | `.ofv-root, .ofv-root.ofv-theme-dark` | `--background→--ofv-bg`、`--raised-surface→--ofv-surface`、`--muted→--ofv-surface-muted/--ofv-button-hover`、`--foreground→--ofv-text/--ofv-accent`、`--muted-foreground→--ofv-text-muted`、`--surface-border→--ofv-border`、`--foreground/0.1→--ofv-accent-soft`、`--panel-surface→--ofv-toolbar-bg`（只映射颜色，`:62`） | 65-77 |
| 3) 工具栏 | `.ofv-toolbar`(±button/input/hover/disabled) | `--panel-border`/`--radius`（`border-radius: max(0px, calc(var(--radius) - 4px))`，注释 `:93-94`：防 terminal-dark 小半径产生负值致声明失效）、`--primary` | 83-151 |
| 4) 空态 | `.ofv-fallback`(+title/detail) | `hsl(var(--muted-foreground, 0 0% 45.1%))`（**含 fallback**，注释 `:157-158`：`hsl(var(--x), 回退)` 语法错误曾致整条失效——历史 bug 修复） | 156-175 |
| 5) 选区 | `.ofv-root ::selection` | `hsl(var(--primary)/0.25)`（fallback 0 0% 9%）、`hsl(var(--foreground), 回退)` | 184-187 |
| 6) OFV 蓝收敛 | focus ring/tab/resize-handle/code-action/lrc/links | 蓝色系（#2563eb 家族）逐条改 `--primary`/`--ofv-accent`；链接深浅双态（`:234-241` 注释：OFV 深色特异度更高，只写浅色会被 #60a5fa 盖回） | 200-242 |

选择器约定：`.ofv-root.ofv-theme-dark` 双类提高特异度与 OFV 默认值竞争（`:20-21`）；兜底镜像必须带 `.viewer-page`（`:31-32`：本文件也进 app 文档，无此类不能改写 `:root` 抢所有权）。

## 3. 层叠与覆盖顺序

viewer 页：OFV 基础样式 → 本文件（`viewer/main.ts:25-28` 导入顺序：字体/OFV 先、桥接最后，同特异度时由本文件决胜）；页面内联变量（`setProperty`）> 本文件 `html.viewer-page` 兜底镜像。app 内：globals.css/皮肤 CSS 的 `:root` token > 本文件映射（映射只读 token 不定值）。刻意不动项（`:193-197`）：Prism 代码高亮、docx 白纸底、UA 语义色。

## 4. 修改影响面

- 改 token 名单需同步 `@profer/shared` 的 `OFV_THEME_TOKEN_NAMES` 与主进程烘参（`browser-preview-service.ts:75-79` 注释）；`ofv-theme-tokens.test.ts` 漂移守卫会红。
- 改 `--ofv-*` 映射影响两路预览配色；改工具栏几何与 `@/lib/ofv-toolbar`/BrowserPanel 按钮约定联动（`:81`）。
- 间接测试：`packages/shared/src/constants/ofv-theme-bridge.test.ts`（token 校验契约）、`lib/ofv-theme-tokens.test.ts`（名单 vs 本文件消费面漂移守卫）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双路径共用映射/排版不跟随 | 已证实 | `:1-18` 注释与代码一致 |
| 兜底镜像仅 `.viewer-page` 作用域 | 已证实 | `:34-58` 选择器 |
| `max(0px, calc(var(--radius)-4px))` 防负值 | 已证实 | `:93-95` |
| 空态 var() fallback 为历史 bug 修复 | 已证实 | `:157-158` 注释 |
| 链接深浅双态防特异度被盖 | 已证实 | `:232-241` |
| token 契约守卫=ofv-theme-tokens.test.ts | 已证实 | `:23-24` + 该测试文件存在 |
| OFV `dist/style.css` 默认值形状 | 未知 | 依赖包文件未读（`:20` 注释自述依据） |
| 真实渲染配色 | 未知 | NOT_RUN |

## 6. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 作用域与两路加载者 | §1 | 1-25 | covered |
| token 映射（6 段） | §2 | 34-242 | covered |
| 层叠顺序/不动项 | §3 | 25-32,193-197 | covered |
| 漂移守卫/影响面 | §4 | 23-24 | covered |
| 例外与历史 bug | §5 | 93-95,157-158 | covered |
| 运行渲染 | §5 | — | unknown（NOT_RUN） |
