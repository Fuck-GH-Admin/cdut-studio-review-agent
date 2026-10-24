---
path: apps/electron/src/renderer/styles/skin-base.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 45831ec244275d7deb152f9c0befc5929796565e
sha256: 330f3e6216ac65bf2494e5c5a47f50d3363f1e58593c4a251cbc9d6b0aad658a
lines: 122
kind: style
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/styles/skin-base.css

## 1. 作用域与加载者

皮肤机制的**公共组件规则**：皮肤包（目录 = manifest.json + skin.css + preview）的 skin.css 注入 `<style>` 提供 `:root` token 表；本文件提供“引用这些 token 的公共组件规则”，全部经 `html[class*="skin-"]` 作用域**只在皮肤激活时生效，默认主题零影响**（`apps/electron/src/renderer/styles/skin-base.css:1-10`）。

调用者/加载者（冻结树 grep）：`apps/electron/src/renderer/main.tsx:125`（`import './styles/skin-base.css'`，紧随 `globals.css:124`）；皮肤 token 由 `atoms/theme.ts` 动态写入 `<style id="skin-css">`。皮肤作者只需在 skin.css 的 `:root` 填 token，无需了解内部类名（`:7`）。间接测试：`PlanModeDashedBorder.test.ts`（readFileSync 本文件断言 plan-mode 规则）。

## 2. 变量与选择器契约

**头注原则（`:8-9`）：`var()` 一律不写 fallback——token 未定义即声明失效 = 不覆写，组件回落 Tailwind 默认，保证默认主题观感一致。**

消费的 token（皮肤可覆写面）：

| token | 用途 | 行 |
| --- | --- | --- |
| `--selection-bg`/`--selection-color` | `::selection`（值需带完整 alpha，`:13-14`） | 18-19 |
| `--shell-bg-gradient` | 外层缝隙 `.shell-bg`（linear-gradient 完整值） | 25-27 |
| `--sunken-surface`/`--raised-surface`/`--surface-border` | 映射到 `--workspace-canvas`/`--panel-surface`/`--panel-border`（分栏背景契约，`:29`） | 30-34 |
| `--mode-slider-bg`/`--mode-slider-shadow`/`--mode-btn-selected-color` | 模式切换器选中态（`!important`） | 37-43 |
| `--item-selected-bg`/`--item-selected-fg` | 会话/工作区/Tab/自动化入口选中态 + 子级 `color: inherit` | 46-68 |
| `--workspace-badge-color` | Badge 文字 | 71-73 |
| `--dialog-glow-shadow` | `[data-radix-dialog-content]` 光晕 | 76-78 |
| `--tiptap-pre-bg`（回退 `--code-bg`） | 输入区代码块背景（**例外 1，见 §5**） | 85-88 |
| `--code-block-header-bg` | 代码块标题栏 | 91-93 |
| `--minimap-indicator-bg` | Minimap 指示器 | 96-98 |
| `--scroll-thumb-bg`/`--scroll-thumb-hover`/`--scroll-thumb-active` | 滚动进度条三态 | 101-109 |
| `--plan-mode-stroke-color`（回退 `hsl(var(--primary)/0.45)`） | 计划模式虚线描边（**例外 2，见 §5**） | 112-114 |
| `--tabbar-shadow-color` | ui-classic TabBar 下缘阴影（`:116-119` 注释：旧 `.ui-classic.theme-*` 组合在皮肤机制下不匹配，迁移为 token） | 120-122 |

选择器约定：一律 `html[class*="skin-"]` 前缀（`:16` 起）；`.shell-bg` 用 `:where()` 压权重（`:25`）。

## 3. 层叠与覆盖顺序

加载顺序 `globals.css`（main.tsx:124）→ `skin-base.css`（:125）；皮肤 `skin.css`（`<style id="skin-css">` 动态注入）提供 token 值，不参与本文件规则竞争。本文件规则对默认主题无效（skin-* 作用域），对皮肤主题以 `!important`/后置顺序覆盖组件基础样式（如 `:49-50,:87`）。文本色多数不覆写（`:81-83` 注释：输入区代码块文字色回落 globals.css 既有规则）。

## 4. 修改影响面

- 改 token 名需同步 `resources/skins/*/skin.css` 与皮肤模板（`skin-template`）；`check-skin-token-sync.mjs` 以 legacy `theme-*` 块为基准校验交集 token（globals.css:268-275 注释）。
- 改选择器作用域会影响默认主题（违背“默认主题零影响”原则）。
- 间接测试 `PlanModeDashedBorder.test.ts` 锁定 `:112-114` 规则存在性。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 头注原则「var() 一律不写 fallback」 | 已证实 | `:8-9` |
| **例外 1**：`--tiptap-pre-bg, var(--code-bg)` 双层回退 | 已证实 | `:87` |
| **例外 2**：`--plan-mode-stroke-color, hsl(var(--primary)/0.45)` 回退 | 已证实 | `:113` |
| 例外定性 | 推断：两处刻意回落到**标准主题 token**（`--code-bg`/`--primary`），与「undefined=不覆写回落组件默认」语义不同；头注原则未同步更新 | `:87,:113` vs `:8-9` |
| 14 组 token 消费面 | 已证实 | §2 表逐行 |
| 皮肤 CSS 注入机制（skin-css） | 已证实（旁证） | `MarkdownEditorToolbar.tsx:72-76` 注释、本文件 `:3-4` |
| 默认主题零影响 | 已证实（作用域收口） | `:16` 起全部选择器 |

## 6. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 作用域与加载者 | §1 | 1-10 | covered |
| token 契约（14 组） | §2 | 16-122 | covered |
| 两处 fallback 例外 | §5 | 87,113 | covered |
| 层叠/覆盖顺序 | §3 | — | covered |
| 修改影响面 | §4 | — | covered |
| 运行渲染 | §5 | — | unknown（NOT_RUN） |
