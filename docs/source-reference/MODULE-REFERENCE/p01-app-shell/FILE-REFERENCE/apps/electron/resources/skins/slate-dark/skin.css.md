---
path: apps/electron/resources/skins/slate-dark/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7b074ec832ea8189b691c792db3e517712795940
sha256: 4a56e10ccb37d8e41caebc2172bde52db68d71037505a647c5ab38bc3422c7b6
lines: 119
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/slate-dark/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「莫兰迪夜」CSS：灰紫色板（背景色相 260/270、前景暖 30、主色淡杏粉 15）。**唯一只定义 `--selection-bg` 不定义 `--selection-color` 的 dark 皮肤**（`:47-50` 注释：保持柔和不覆写文字色）；无 minimap/计划虚线 token；无特例选择器规则。

### 6. 调用者与加载链

同族：`getSkinCss('slate-dark')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer；缺失扩展 token 由 globals.css/skin-base.css 兜底（`:4-5` 注释）。

### 7. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有（minimap/plan-mode 不在 REQUIRED 列表，故缺失不违规——门禁清单 `check-skin-surface-contract.mjs:21-33` 不含二者）；值无 `{}`。

## 2. 变量与选择器契约

### 2. 结构（119 行全量）

头注释 `:1-8`；基底色板 `:10-45`（32 token）；文字选区 `:47-50`（仅 bg）；外层缝隙 `:52-53`；模式切换器 `:55-58`（`--mode-btn-selected-color` 为深色 `hsl(270 8% 12%)`）；选中态 `:60-62`；Badge `:64-65`；Dialog 光晕 `:67-70`；输入区代码块 `:72-73`；代码块标题栏 `:75-76`；滚动条三态 `:78-81`；TabBar 阴影 `:83-84`；v2 契约块 `:87-119`。

### 3. 基底色板 token 全量（`:12-45`，32 个）

`background 260 6% 12%`（#1d1b20）、`foreground 30 10% 90%`（温暖前景）、`content-area 270 8% 9%`、`sidebar/tabbar/input-surface =background`、`muted 260 6% 16%`、`muted-foreground 30 8% 60%`、`border 260 8% 26%`（`:20` 注释：拉开 14%）、`primary 15 25% 68%`（淡杏粉）、`primary-foreground 270 8% 9%`（**深字**——与多数皮肤白字不同）、`secondary 260 5% 18%`、`secondary-foreground 30 10% 88%`、`accent 200 12% 22%`（淡蓝灰）、`accent-foreground 200 25% 75%`（淡天蓝）、`ring 15 45% 72%`、`card 260 6% 13%`、`card-foreground`、`input 260 6% 16%`、`popover 260 6% 15%`、`popover-foreground`、`dialog 260 5% 16%`、`dialog-foreground`、`destructive 0 45% 50%`（柔和）、`destructive-foreground 0 0% 98%`、`stop-hover-bg hsl(0,25%,20%)`、`tooltip 260 8% 22%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 30 8% 65%`、`code-bg 270 10% 10%`、`dashed-border 15 25% 68% / 0.30`、`dashed-border-hover …/0.45`。

**扩展 token 15**（`:50-84`）：`selection-bg hsl(var(--accent-foreground) / 0.4)`（`:50`，**无 selection-color**）、`shell-bg-gradient linear-gradient(135deg, hsl(270 10% 7%), hsl(260 8% 9%))`、`mode-slider-bg hsl(15 25% 68%)`、`mode-slider-shadow rgba(201,168,158,0.3)`、`mode-btn-selected-color hsl(270 8% 12%)`（`:58` 深色文字）、`item-selected-bg hsl(260 10% 22%)`、`item-selected-fg hsl(15 30% 75%)`、`workspace-badge-color`、`dialog-glow-shadow`（`:68-70`）、`tiptap-pre-bg 260 6% 16%`、`code-block-header-bg rgb(36,35,39)`、`scroll-thumb-*` 三态（0.18/0.30/0.40）、`tabbar-shadow-color hsl(260 10% 18% / 0.6)`。

### 4. v2 契约块（`:87-119`）

与同族一致（29 token；`--code-fg: var(--foreground)`、`overlay: 0 0% 0%`、diff 四值 `:108-111`、info→var(--primary) `:117-118`）。

### 5. 逐文件差异表（vs 同族 dark）

| 项 | 本文件 | 对照 |
| --- | --- | --- |
| 选区 | 仅 `--selection-bg`（0.4 低透明） | forest/ocean 双 token（0.75） |
| `--primary-foreground` | 深色 `270 8% 9%` | forest/ocean/terminal 白/黑 |
| `--mode-btn-selected-color` | 深色 | forest/ocean `#ffffff` |
| minimap/plan-mode token | **无** | forest/ocean 有 |
| 色相 | 260 灰紫 + 15 杏粉双色相 | 单色相域 |
| 特例选择器 | 无 | mist-paper/terminal 有 |

## 3. 层叠

双 :root（:10-84 + :87-119）；无 !important、无特例选择器；缺失的扩展 token（minimap/plan 等）由 globals.css/skin-base.css 默认层叠补位（头注释 :4-5）。

## 4. 修改影响面

### 8. 修改影响面

补/删扩展 token 只影响有无专属观感（回退全局默认）；`--selection-bg` 单独存在时选区文字色走浏览器默认（`:47-48` 注释语义）。

## 5. 已证实

### 9. 测试证据

无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）；门禁脚本非 bun test；`skin-service.test.ts` 仅 manifest（间接）。NOT_RUN。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 119 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| 选区仅 bg、minimap/plan 缺失 | 已证实 | 文件全量核对 + 8 skin.css 比对 |
| 缺失 token 不违反门禁 | 已证实 | REQUIRED_TOKENS 不含 minimap/plan（checker `:21-33`） |
| 低透明选区可读性 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 13 段 | §2 | covered |
| 47 token 全量 | §3 | covered |
| v2 块/差异 | §4/§5 | covered |
| 加载链/校验 | §6/§7 | covered |
| 测试缺口 | §9 | covered |
