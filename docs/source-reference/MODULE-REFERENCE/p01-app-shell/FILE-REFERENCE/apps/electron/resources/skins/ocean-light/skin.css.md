---
path: apps/electron/resources/skins/ocean-light/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09adadbda266f71e3e54819ccd0ce8375dda7f9a
sha256: 781f25ee71598a90a75606fa589e1c98932c138739a7046b57529fa57705355c
lines: 102
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/ocean-light/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「晴空碧海」CSS：浅海蓝色板（色相 205），结构与 forest-light 同族（基底 33 + 扩展 10 + v2 块 29），无特例选择器规则；`--code-fg` 硬编码 `215 28% 92%`（`:88`）满足浅色门禁强制点。

### 6. 调用者与加载链

同族：`getSkinCss('ocean-light')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer。

### 7. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有；`--code-fg` 硬编码满足 light 强制规则（`check-skin-surface-contract.mjs:92-94`）；值无 `{}`。

## 2. 变量与选择器契约

### 2. 结构（102 行全量）

与 forest-light 手册 §2 同构：头注释 `:1-8`；基底色板 `:10-46`（31 token）；外层缝隙 `:48-49`；模式切换器 `:51-54`；选中态 `:56-58`；Badge `:60-61`；滚动条三态 `:63-66`；v2 契约块 `:69-102`。

### 3. 基底色板 token 全量（`:12-46`，33 个）

`background 205 35% 94%`（#ecf2f7，`:12` 注释"调浅"）、`foreground 210 30% 15%`、`content-area 205 30% 97%`、`sidebar/tabbar-surface =background`、`input-surface 60 14.3% 98.6%`（白纸，浅色三皮肤共有）、`tab-surface 205 30% 97%`、`muted 205 35% 88%`、`muted-foreground 210 15% 40%`、`border 205 30% 82%`、`primary 205 50% 50%`、`primary-foreground 0 0% 100%`、`secondary 205 35% 91%`、`secondary-foreground 210 30% 20%`、`accent 205 35% 82%`、`accent-foreground 205 50% 30%`、`ring 205 50% 50%`、`card 205 30% 97%`、`card-foreground`、`input 205 35% 91%`、`popover 205 30% 97%`、`popover-foreground`、`dialog 0 0% 100%`（纯白，`:34`——**浅色三皮肤中唯一纯白 dialog**）、`dialog-foreground`、`destructive 0 84.2% 60.2%`、`destructive-foreground 0 0% 98%`、`stop-hover-bg hsla(0,80%,60%,0.12)`、`tooltip 210 45% 18%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 210 20% 75%`、`code-bg 210 35% 14%`（深蓝）、`dashed-border 205 50% 50% / 0.30`、`dashed-border-hover …/0.45`。

**扩展 token 10**（`:49-66`）：`shell-bg-gradient linear-gradient(135deg, hsl(205 35% 88%), hsl(205 30% 91%))`、`mode-slider-bg hsl(205 50% 50%)`、`mode-slider-shadow rgba(64,138,191,0.3)`、`mode-btn-selected-color #ffffff`、`item-selected-bg hsl(205 35% 82%)`、`item-selected-fg hsl(205 50% 25%)`、`workspace-badge-color hsl(205 50% 25%)`、`scroll-thumb-*` 三态（0.18/0.30/0.40）。

### 4. v2 契约块（`:69-102`）

与 forest-light §4 同构（29 token；`--code-fg: 215 28% 92%` 硬编码 `:88`，注释 `:87` 同语；其余 var 映射/直值一致）。

### 5. 逐文件差异表（vs forest-light）

| 项 | 本文件 | forest-light |
| --- | --- | --- |
| 色相域 | 205 海蓝 | 140-150 森绿 |
| `--dialog` | `0 0% 100%`（纯白） | `140 15% 96%` |
| `--destructive` | `0 84.2% 60.2%` | `0 72% 51%` |
| `--dashed-border` alpha | 0.30/0.45 | 0.35/0.50 |
| 结构/特例 | 同构、均无选择器规则 | 同 |

## 3. 层叠

同 forest-light：双 :root（:10-66 + :69-102）；--code-fg 硬编码（:88）；无 !important、无特例选择器；未定义 token 继承 globals.css。

## 4. 修改影响面

### 8. 修改影响面

同 forest-light 手册 §8（`--code-fg` 不可回绑 var(--foreground)；`--input-surface` 白纸值防混同）。

## 5. 已证实

### 9. 测试证据

无 CSS 内容测试；门禁脚本非 bun test；`skin-service.test.ts` 仅 manifest（间接）。NOT_RUN。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 102 行结构与 token 全量（§3 全列） | 已证实 | 文件全读 |
| `--code-fg` 硬编码满足门禁 | 已证实 | `:88` + checker `:92-94` |
| 纯白 dialog 的对比度 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 8 段 | §2 | covered |
| 43 token 全量 | §3 | covered |
| v2 块/差异 | §4/§5 | covered |
| 加载链/校验 | §6/§7 | covered |
| 测试缺口 | §9 | covered |
