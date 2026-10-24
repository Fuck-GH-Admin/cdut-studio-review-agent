---
path: apps/electron/resources/skins/ocean-dark/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c53d4d0f8cd41a7d1f6aebb7c60a730dcfbb5c6c
sha256: 10f85f7d029ef30f50388366711c86a32e5882603cff1dcdfdaa6b52d10382ea
lines: 124
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/ocean-dark/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「远山暮霭」CSS：深海蓝色板（色相 210），结构与 forest-dark 完全同族（基底 33 + 扩展 13 + v2 块 29），无特例选择器规则。

### 6. 调用者与加载链

同族：`getSkinCss('ocean-dark')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer；globals.css/skin-base.css 兜底。

### 7. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有、值无 `{}`、dark 不触发 code-fg 规则。

## 2. 变量与选择器契约

### 2. 结构（124 行全量）

与 forest-dark 手册 §2 同构：头注释 `:1-8`；基底色板 `:10-43`（32 token）；文字选区 `:45-49`；外层缝隙 `:51-52`；模式切换器 `:54-57`；选中态 `:59-61`；Badge `:63-64`；Dialog 光晕 `:66-69`；输入区代码块 `:71-72`；代码块标题栏 `:74-75`；Minimap `:77-78`；滚动条三态 `:80-83`；计划虚线 `:85-86`；TabBar 阴影 `:88-89`；v2 契约块 `:92-124`。

### 3. 基底色板 token 全量（`:12-43`，32 个）

`background 210 12% 13%`（深海玻璃）、`foreground 210 14% 92%`、`content-area 210 14% 9%`、`sidebar/tabbar/input-surface =background`、`muted 210 12% 17%`、`muted-foreground 210 10% 60%`、`border 210 14% 24%`（`:20` 注释：与背景拉开 11% 亮度）、`primary 210 28% 48%`、`primary-foreground 0 0% 100%`、`secondary 210 12% 17%`、`secondary-foreground`、`accent 210 14% 22%`、`accent-foreground 210 35% 70%`（选区色源）、`ring 210 35% 60%`、`card 210 8% 18%`（`:28` 注释：sat 12→8 更中性 +2 浮起）、`card-foreground`、`input 210 12% 17%`、`popover 210 12% 18%`（浮 +5%）、`popover-foreground`、`dialog 210 12% 21%`（最高 +8%）、`dialog-foreground`、`destructive 0 55% 50%`、`destructive-foreground 0 0% 98%`、`stop-hover-bg hsl(0,35%,18%)`（逗号语法）、`tooltip 210 14% 24%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 210 14% 72%`、`code-bg 210 30% 8%`（保留饱和）、`dashed-border 210 28% 48% / 0.35`、`dashed-border-hover …/0.55`。

**扩展 token 18**（`:48-89`）：`selection-bg hsl(var(--accent-foreground) / 0.75)`+`selection-color hsl(var(--background))`（`:45-49`，同 forest-dark 注释）、`shell-bg-gradient linear-gradient(135deg,…5%→7%)`、`mode-slider-bg hsl(210 28% 38%)`、`mode-slider-shadow rgba(64,88,116,0.35)`、`mode-btn-selected-color #ffffff`、`item-selected-bg hsl(210 14% 22%)`、`item-selected-fg hsl(210 35% 70%)`、`workspace-badge-color`、`dialog-glow-shadow`（`:67-69` 三层）、`tiptap-pre-bg 210 12% 17%`（=muted）、`code-block-header-bg rgb(26,34,43)`、`minimap-indicator-bg hsl(210 30% 50%)`、`scroll-thumb-*` 三态（0.20/0.32/0.42）、`plan-mode-stroke-color …/0.7`、`tabbar-shadow-color …/0.6`。

### 4. v2 契约块（`:92-124`）

与 forest-dark §4 完全同构（29 token；`--code-fg: var(--foreground)`、`overlay: 0 0% 0%`、diff 四值 `:113-116`、info→var(--primary)）。

### 5. 逐文件差异表（vs forest-dark）

| 项 | 本文件 | forest-dark |
| --- | --- | --- |
| 色相域 | 210 深海蓝 | 140-150 森绿 |
| 结构/段落/特例 | 完全同构、均无选择器规则 | 同 |
| `--stop-hover-bg` | `hsl(0,35%,18%)` | 同值同语法 |
| `--mode-slider-shadow` | `rgba(64,88,116,0.35)` | `rgba(59,84,71,0.3)` |
| 行数 | 124 | 126（注释差异） |

实质差异仅色板数值与两处 rgba——同构模板化产物。

## 3. 层叠

同 forest-dark：双 :root（:10-89 + :92-124）；无 !important、无特例选择器；未定义 token 继承 globals.css。

## 4. 修改影响面

### 8. 修改影响面

同 forest-dark 手册 §8（token 值 → 全界面；v2 映射 → 契约）。

## 5. 已证实

### 9. 测试证据

无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）；门禁脚本非 bun test；`skin-service.test.ts` 仅 manifest（间接）。NOT_RUN。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 124 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| 与 forest-dark 完全同构 | 已证实 | 两文件逐段比对 |
| 观感/边框 11% 亮度差的实际可辨性 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 15 段 | §2 | covered |
| 50 token 全量 | §3 | covered |
| v2 块/差异 | §4/§5 | covered |
| 加载链/校验 | §6/§7 | covered |
| 测试缺口 | §9 | covered |
