---
path: apps/electron/resources/skins/slate-light/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0353538498e1df6b97275dd258e0f6aa317e297
sha256: 44b710ca1f1d0e0eb92796ae5eaf1fbe26b3bf89745ec4354d2278641b835d61
lines: 115
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/slate-light/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「云朵舞者」CSS：暖灰浅色板（色相 40）。**唯一带组件级特例的浅色皮肤**：`--heatmap-empty-cell` token（`:73-74`）+ `html.skin-slate-light .heatmap-empty-cell` 规则（`:77-80`，注释：仅本皮肤覆盖热力图 0 级格，其余皮肤用组件原有 bg-muted）。`--code-fg` 硬编码 `215 28% 92%`（`:101`）满足浅色门禁强制点。

### 7. 调用者与加载链

同族：`getSkinCss('slate-light')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer；特例规则依赖 renderer 的 `html.skin-slate-light` 类与 `.heatmap-empty-cell` 组件类（类名契约，改名静默失效）。

### 8. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有；`--code-fg` 硬编码满足 light 强制规则（checker `:92-94`）；值无 `{}`。

## 2. 变量与选择器契约

### 2. 结构（115 行全量）

头注释 `:1-8`；基底色板 `:10-46`（31 token）；文字选区 `:48-51`（仅 bg）；外层缝隙 `:53-54`；模式切换器 `:56-59`；选中态 `:61-63`；Badge `:65-66`；滚动条三态 `:68-71`；热力图 token `:73-74`；热力图特例规则 `:77-80`；v2 契约块 `:82-115`。

### 3. 基底色板 token 全量（`:12-46`，33 个）

`background 40 6% 88%`（#e3e1dc，`:12` 注释：比主题色深）、`foreground 40 8% 18%`、`content-area 40 8% 94%`、`sidebar/tabbar-surface =background`、`input-surface 60 14.3% 98.6%`（白纸，三浅色共有）、`tab-surface 40 8% 94%`、`muted 40 6% 85%`、`muted-foreground 40 5% 45%`、`border 40 6% 80%`、`primary 18 20% 43%`（`:22` 注释：**加深以保证 WCAG AA 4.5:1 对比度**）、`primary-foreground 0 0% 100%`、`secondary 40 6% 90%`、`secondary-foreground 40 8% 22%`、`accent 40 6% 86%`、`accent-foreground 40 10% 30%`、`ring 18 20% 43%`、`card 40 8% 96%`、`card-foreground`、`input 40 6% 90%`、`popover 40 8% 96%`、`popover-foreground`、`dialog 40 8% 94%`、`dialog-foreground`、`destructive 0 65% 50%`、`destructive-foreground`、`stop-hover-bg hsla(0,60%,50%,0.12)`、`tooltip 40 8% 20%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 40 5% 55%`、`code-bg 18 15% 18%`（深暖棕，主色深版）、`dashed-border 18 20% 50% / 0.40`、`dashed-border-hover …/0.55`。

**扩展 token 12**（`:51-74`）：`selection-bg hsl(var(--primary) / 0.6)`（`:48-51` 注释：淡杏粉在亮背景需更高不透明度）、`shell-bg-gradient linear-gradient(135deg, hsl(40 6% 84%), hsl(40 6% 86%))`、`mode-slider-bg hsl(18 20% 67%)`、`mode-slider-shadow rgba(189,165,155,0.4)`、`mode-btn-selected-color #ffffff`、`item-selected-bg hsl(40 8% 84%)`、`item-selected-fg hsl(40 10% 25%)`、`workspace-badge-color`、`scroll-thumb-*` 三态（0.22/0.35/0.45）、`heatmap-empty-cell 40 8% 82%`（`:74`）。

### 4. 特例规则（`:77-80`，1 组）

`html.skin-slate-light .heatmap-empty-cell { background-color: hsl(var(--heatmap-empty-cell)) }`——以 `html.skin-<id>` 类作用域隔离（**证实了皮肤类名机制**：渲染层在 html 根元素打 `skin-<id>` 类）；注释 `:77`：其他皮肤继续用组件原有 `bg-muted`。

### 5. v2 契约块（`:82-115`）

与 forest-light §4 同构（29 token；`--code-fg: 215 28% 92%` 硬编码 `:101`，注释 `:100` 同语）。

### 6. 逐文件差异表（vs 浅色同族）

| 项 | 本文件 | forest-light/ocean-light |
| --- | --- | --- |
| 特例规则 | 1 组（heatmap） | 无 |
| 专属 token | `--heatmap-empty-cell` | 无 |
| `--selection-bg` | `primary/0.6` | 无（forest-light）/ 无（ocean-light） |
| `--primary` | `18 20% 43%`（WCAG 注释） | 各自 |
| 滚动条透明度 | 0.22/0.35/0.45 | 0.18/0.30/0.40 |
| tooltip 组 | 有（`:39-41`） | 同（均有） |

差异仅上表所列（三浅色结构同构）。

## 3. 层叠

双 :root（:10-74 + :82-115）+ 1 组特例（html.skin-slate-light .heatmap-empty-cell :78-80，特异性 (0,2,1) 且以 html.skin-<id> 作用域隔离，不泄漏到其他皮肤）。无 !important；未定义 token 继承 globals.css。

## 4. 修改影响面

### 9. 修改影响面

删 §4 规则 → 热力图 0 级格回退 `bg-muted`（注释语义）；改 `--primary` 影响全主题主色；`html.skin-slate-light` 作用域依赖渲染层类名。

## 5. 已证实

### 10. 测试证据

无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）；门禁脚本非 bun test；`skin-service.test.ts` 仅 manifest（间接）。NOT_RUN。

### 11. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 115 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| heatmap 特例为浅色唯一 | 已证实 | 8 skin.css 比对 |
| `html.skin-<id>` 类机制存在 | 已证实 | `:78` |
| WCAG AA 达标声明的实际测量 | 未知 | 注释自述（`:22`），未测 |
| 热力图 0 级格观感 | 未知 | NOT_RUN |

## 6. 覆盖表

### 12. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 11 段 | §2 | covered |
| 45 token 全量 | §3 | covered |
| 特例规则 | §4 | covered |
| v2 块/差异 | §5/§6 | covered |
| 加载链/校验 | §7/§8 | covered |
| 测试缺口 | §10 | covered |
