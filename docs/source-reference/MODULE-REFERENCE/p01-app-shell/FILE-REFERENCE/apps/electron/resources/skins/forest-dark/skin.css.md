---
path: apps/electron/resources/skins/forest-dark/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 37003b2deb95728e404e5ea2828502a84c8e6642
sha256: 15da03a162c77717d7c606bfb6f4cf413286802651bcfc68f36d335d10c7bf8b
lines: 126
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/forest-dark/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「森息夜语」CSS：三段结构——头注释（`:1-8`，声明"皮肤文件 = :root token 表 + 特例规则"）、`--background: 150 8% 14%` 开始）+ 18 个扩展 token、尾部 v2 契约映射块（`:96-126`）。dark 色板（森绿色相 140-150）。

不做的事：无组件级特例规则（除 token 外无选择器——与 mist-paper/terminal 不同）；公共组件规则在 `skin-base.css`（`:6-7` 注释）。

### 6. 调用者与加载链

`getSkinCss('forest-dark')`（`skin-service.ts:484`，读文件+`auditSkinCss`+缓存）→ `handleProferSkinRequest:567`（`profer-skin://forest-dark/skin.css`）→ renderer 注入；`html.skin-forest-dark` 类名由渲染层打在根元素（slate-light css `:78` 引用同类机制可证）。`skin-base.css`/`globals.css` 提供组件规则与未定义 token 兜底（`:4-5` 注释）。

### 7. 校验（双通道合规，已静态核对）

- `auditSkinCss`：无 `@import`/`@font-face`/url 引用 → 通过（本文件无 url()）。
- 门禁 `check-skin-surface-contract.mjs`：34 REQUIRED_TOKENS 全有（基底+扩展+v2 覆盖）、无禁用 CSS、值无 `{}`；dark tone 不触发 code-fg 检查。`MAX_SKIN_CSS_BYTES`（512KB）远超本文件（~4KB）。

## 2. 变量与选择器契约

### 2. 结构（126 行全量）

| 段 | 行 | 内容 |
| --- | --- | --- |
| 头注释 | `:1-8` | token 表自描述、globals.css 兜底、skin-base.css 引用说明 |
| `:root` 基底色板 | `:10-45` | 32 个 token（含 `--stop-hover-bg:37`、`--code-bg:42`、`--dashed-border*:44-45`） |
| 文字选区 | `:47-51` | `--selection-bg`/`--selection-color` |
| 外层缝隙 | `:53-54` | `--shell-bg-gradient` |
| 模式切换器 | `:56-59` | `--mode-slider-bg/shadow`、`--mode-btn-selected-color` |
| 选中态 | `:61-63` | `--item-selected-bg/fg` |
| 工作区 Badge | `:65-66` | `--workspace-badge-color` |
| Dialog 光晕 | `:68-71` | `--dialog-glow-shadow`（多行值） |
| 输入区代码块 | `:73-74` | `--tiptap-pre-bg` |
| 代码块标题栏 | `:76-77` | `--code-block-header-bg: rgb(34,42,37)` |
| Minimap | `:79-80` | `--minimap-indicator-bg` |
| 滚动条三态 | `:82-85` | `--scroll-thumb-bg/hover/active` |
| 计划虚线 | `:87-88` | `--plan-mode-stroke-color` |
| TabBar 阴影 | `:90-91` | `--tabbar-shadow-color` |
| v2 契约块 | `:94-126` | 29 token 映射（见 §4） |

### 3. 基底色板 token 全量（`:12-45`，32 个）

`background 150 8% 14%`（侧边栏近中性灰+森绿）、`foreground 140 10% 92%`、`content-area 150 10% 9%`、`sidebar-surface`/`tabbar-surface`/`input-surface`（=background）、`muted 150 10% 17%`、`muted-foreground 145 8% 60%`、`border 150 12% 25%`、`primary 145 25% 42%`、`primary-foreground 0 0% 100%`、`secondary 150 10% 17%`、`secondary-foreground`、`accent 150 12% 22%`、`accent-foreground 145 35% 65%`、`ring 145 35% 55%`、`card 150 10% 17%`、`card-foreground`、`input 150 10% 17%`、`popover 150 10% 19%`、`popover-foreground`、`dialog 150 10% 22%`、`dialog-foreground`、`destructive 0 55% 50%`、`destructive-foreground 0 0% 98%`、`stop-hover-bg hsl(0,35%,18%)`（`:37`，**rgb 逗号语法**，与其余 HSL 三元组不同）、`tooltip 150 14% 24%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 140 10% 70%`、`code-bg 150 20% 8%`、`dashed-border 145 25% 42% / 0.35`、`dashed-border-hover …/ 0.55`。

**扩展 token 18**（`:50-91`）：`selection-bg hsl(var(--accent-foreground) / 0.75)`、`selection-color hsl(var(--background))`（`:47-51` 注释：primary 在暗背景太暗改用亮色）、`shell-bg-gradient linear-gradient(135deg,…)`、`mode-slider-bg hsl(150 18% 28%)`、`mode-slider-shadow 0 2px 4px rgba(59,84,71,0.3)`、`mode-btn-selected-color #ffffff`、`item-selected-bg hsl(150 12% 22%)`、`item-selected-fg hsl(145 35% 65%)`、`workspace-badge-color`、`dialog-glow-shadow`（`:69-71` 三层：白晕 0.06 + 深影 0.5）、`tiptap-pre-bg 150 20% 9%`、`code-block-header-bg rgb(34,42,37)`、`minimap-indicator-bg hsl(145 25% 45%)`、`scroll-thumb-*` 三态（0.20/0.32/0.42 透明度）、`plan-mode-stroke-color …/ 0.7`、`tabbar-shadow-color …/ 0.6`。

### 4. v2 契约块（`:94-126`，29 token）

映射模式：语义表面 → 既有色板 var（`shell-surface: var(--background)`、`raised-surface: var(--card)`、`sunken-surface: var(--muted)`、`surface-border(-strong): var(--border)`、`input-hover: var(--muted)`、`control-surface: var(--secondary)`、`control-hover: var(--accent)`、`selected-*: var(--accent/…)`、`focus-ring: var(--ring)`、`message-surface: var(--content-area)`、`message-user-surface: var(--secondary)`、`code-fg: var(--foreground)`、`blockquote/table-header: var(--muted)`、`browser-host-surface: var(--content-area)`、`info: var(--primary)`）。直值：`overlay: 0 0% 0%`、`overlay-foreground: var(--foreground)`、diff 四 token（`142 65% 45% / 0.18` 等，`:115-118`）、`success 142 65% 45%`、`warning 38 92% 50%` 等（`:120-125`）。块注释（`:94-95`）："业务组件不得依赖具体色相"。

### 5. 逐文件差异表（vs 同结构皮肤）

| 项 | 本文件 | 对照 |
| --- | --- | --- |
| 色相域 | 140-150 森绿 | ocean 210 蓝、slate 260 紫、terminal 100 绿 |
| 特例选择器规则 | **无** | mist-paper 4 组、terminal 15+ 组、slate-light 1 组 |
| `--selection-bg/fg` 双 token | 有 | slate-dark 仅 bg；slate-light 仅 bg |
| `--stop-hover-bg` 语法 | `hsl(0, 35%, 18%)` 逗号 | mist/terminal 用空格 `hsl(0 35% 23%)` |
| `--code-fg` | `var(--foreground)`（dark 合法） | light 三皮肤硬编码 `215 28% 92%`（门禁要求） |

## 3. 层叠

token 单层 :root 定义（:10-91）+ 尾部 v2 映射 :root（:94-126，后者同名 token 覆盖前者仅限 v2 组）；未定义 token 继承 globals.css，组件规则在 skin-base.css（头注释 :4-7）。无 !important、无特例选择器；--stop-hover-bg 等值用 hsl() 函数包裹参与正常层叠。

## 4. 修改影响面

### 8. 修改影响面

改 token 值影响森林主题全界面；删扩展 token（如 `--scroll-thumb-*`）由 skin-base.css 规则回退 globals 默认（`:4-5` 注释语义）；v2 块改 var 映射会破坏"业务组件不依赖色相"的契约。`--stop-hover-bg` 用逗号语法——若工具链统一改为 HSL 三元组格式需全文件一致（视觉等价，无功能差异）。

## 5. 已证实

### 9. 测试证据

- 无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 `.test.ts` 断言，全冻结树检索 0 命中）。
- 门禁脚本非 bun test，本轮 NOT_RUN。
- `skin-service.test.ts` 仅 manifest 解析（间接）。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 126 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| v2 块 29 token 映射模式 | 已证实 | `:94-126` |
| 无特例选择器规则 | 已证实 | 文件全量核对 |
| 双通道校验合规 | 已证实（静态比对规则） | §7 |
| 观感/对比度 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 15 段 | §2 | covered |
| 50 token 全量 | §3 | covered |
| v2 契约块 | §4 | covered |
| 逐文件差异 | §5 | covered |
| 加载链/校验 | §6/§7 | covered |
| 测试缺口 | §9 | covered |
