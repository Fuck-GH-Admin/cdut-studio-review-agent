---
path: apps/electron/resources/skins/forest-light/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1d53c588e8c0261742a2a14878c3a2271b063f9
sha256: 8a8aebbacecdf50fe0f1c5cfe4a6af84ca2fdb3d070a93d65c6454462733ebeb
lines: 102
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/forest-light/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「森息晨光」CSS：light 色板（森绿浅调）；`--background: 140 25% 95%` 开始）、扩展 token 10 个（无选区/光晕/minimap/计划虚线/TabBar 阴影）、尾部 v2 契约映射块（`:69-102`）。**v2 块 `--code-fg` 硬编码 `215 28% 92%`**（`:88`，带注释：浅色皮肤代码块用深色背景，不能复用正文前景色）——正是门禁 `check-skin-surface-contract.mjs:92-94` 的强制点。

不做的事：无特例选择器规则；无 `--tab-surface` 之外的浮动面板定制。

### 6. 调用者与加载链

同族：`getSkinCss('forest-light')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer；未定义 token 兜底 globals.css（`:4-5` 注释）。

### 7. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有；**`--code-fg` 硬编码恰好满足 light 禁 `var(--foreground)` 规则**（`check-skin-surface-contract.mjs:92-94`）；值无 `{}`。

## 2. 变量与选择器契约

### 2. 结构（102 行全量）

| 段 | 行 | 内容 |
| --- | --- | --- |
| 头注释 | `:1-8` | 同族说明（token 表自描述/globals 兜底/skin-base 引用） |
| `:root` 基底色板 | `:10-46` | 33 个 token（含 `--stop-hover-bg:38`、`--code-bg:43`、`--dashed-border*:45-46`） |
| 外层缝隙 | `:48-49` | `--shell-bg-gradient` |
| 模式切换器 | `:51-54` | 3 个 |
| 选中态 | `:56-58` | 2 个 |
| 工作区 Badge | `:60-61` | 1 个 |
| 滚动条三态 | `:63-66` | 3 个 |
| v2 契约块 | `:69-102` | 29 token（`--code-fg` 硬编码特例 `:87-88`） |

### 3. 基底色板 token 全量（`:12-46`，33 个）

`background 140 25% 95%`（#eff5f1）、`foreground 150 25% 15%`、`content-area 140 20% 97%`、`sidebar-surface`/`tabbar-surface`（=background）、`input-surface 60 14.3% 98.6%`（`:17`，**白纸色**，与 background 不同——浅色三皮肤共有）、`tab-surface 140 20% 97%`、`muted 140 15% 90%`、`muted-foreground 145 10% 45%`、`border 140 15% 82%`、`primary 150 35% 38%`、`primary-foreground 0 0% 100%`、`secondary 140 15% 92%`、`secondary-foreground 150 20% 20%`、`accent 145 20% 88%`、`accent-foreground 150 30% 30%`、`ring 150 35% 38%`、`card 140 20% 97%`、`card-foreground`、`input 140 18% 92%`、`popover 140 18% 98%`、`popover-foreground`、`dialog 140 15% 96%`、`dialog-foreground`、`destructive 0 72% 51%`、`destructive-foreground`、`stop-hover-bg hsla(0,70%,50%,0.12)`（`:38`，**hsla 逗号+alpha**）、`tooltip 150 20% 18%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 140 10% 60%`、`code-bg 150 35% 12%`（深森绿，浅色页配深码底）、`dashed-border 150 35% 38% / 0.35`、`dashed-border-hover …/ 0.50`。

**扩展 token 10**（`:49-66`）：`shell-bg-gradient linear-gradient(135deg, hsl(140 15% 90%), hsl(140 15% 92%))`、`mode-slider-bg hsl(150 35% 38%)`、`mode-slider-shadow rgba(63,131,97,0.3)`、`mode-btn-selected-color #ffffff`、`item-selected-bg hsl(145 25% 82%)`、`item-selected-fg hsl(150 35% 25%)`、`workspace-badge-color hsl(150 35% 25%)`、`scroll-thumb-*` 三态（0.18/0.30/0.40）。

### 4. v2 契约块（`:69-102`）

与 forest-dark §4 同构映射（29 token），**差异 2 处**：`--code-fg: 215 28% 92%`（`:88` 硬编码，注释 `:87` 解释；dark 同族用 `var(--foreground)`）；其余 var 映射与直值（overlay `0 0% 0%`、diff 四值 `:91-94`、success/warning `:96-99`、info→var(--primary) `:100-101`）与同族一致。

### 5. 逐文件差异表（vs forest-dark）

| 项 | 本文件 | forest-dark |
| --- | --- | --- |
| tone | light（浅底深字） | dark |
| token 数 | 33+10+29 | 32+18+29 |
| 缺少的扩展组 | 选区双 token、dialog-glow、tiptap-pre-bg、code-block-header-bg、minimap、plan-mode、tabbar-shadow | 全有 |
| `--code-fg` | `215 28% 92%` 硬编码 | `var(--foreground)` |
| `--stop-hover-bg` | `hsla(0,70%,50%,0.12)` | `hsl(0,35%,18%)` |
| `--input-surface` | `60 14.3% 98.6%`（白纸） | =background |
| 选择器规则 | 无 | 无 |

## 3. 层叠

同 forest-dark：双 :root（基底 :10-66 + v2 映射 :69-102）；未定义 token 继承 globals.css；无 !important、无特例选择器。--code-fg 硬编码（:88）即为覆盖浅色页面正文前景的层叠意图（代码块深底）。

## 4. 修改影响面

### 8. 修改影响面

若把 `--code-fg` 改回 `var(--foreground)` 会门禁失败且代码块不可读（`:87` 注释即此原因）；删 `--input-surface` 白纸值会退回 background 造成输入区与画布混同（`:17` 注释语义）。

## 5. 已证实

### 9. 测试证据

- 无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）。
- 门禁脚本强制 code-fg 规则（非 bun test）；本轮 NOT_RUN。
- `skin-service.test.ts` 仅 manifest（间接）。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 102 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| `--code-fg` 硬编码是门禁强制点 | 已证实 | `:88` + `check-skin-surface-contract.mjs:92-94` |
| 浅色三皮肤共享 `input-surface 60 14.3% 98.6%` | 已证实 | 本/ocean-light/slate-light 三文件比对 |
| 浅底对比度/观感 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 8 段 | §2 | covered |
| 43 token 全量 | §3 | covered |
| v2 块+code-fg 特例 | §4 | covered |
| 逐文件差异 | §5 | covered |
| 加载链/校验 | §6/§7 | covered |
| 测试缺口 | §9 | covered |
