---
path: apps/electron/resources/skins/terminal-dark/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d2613178345670c504812b73a943c59f630b5f7
sha256: 0eb563658354dfaf0c47bd8ff5d5a8a1c284ee34a0cce422dc4e71145b10b494
lines: 451
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/terminal-dark/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「旧屏微光」（CRT 终端）CSS——**本批最大样式文件（451 行）**：token 表（`:8-75`）+ 大量**不 token 化的终端特例规则**（`:77-417`）：全局等宽字体、扫描线/暗角、荧光辉光、灯珠面板动画、机械风滚动条、UI 直角化、消息去气泡化、闪烁光标、全局 `border-radius:0` catch-all。3 组动画均有 `prefers-reduced-motion` 降级。

不做的事：特例效果不 token 化（`:3-4` 注释）；公共组件规则仍在 `skin-base.css`。

### 7. 调用者与加载链

同族：`getSkinCss('terminal-dark')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer。特例规则依赖组件类名（`.mode-switcher-track`/`.scroll-progress-*`/`.agent-input-surface`/`.message-item`/`.ask-user-banner`/`.welcome-empty-state`/`.ProseMirror` 等）——类名契约无测试保护（改名静默失效）。manifest 的 `tooltip`（闪烁提示）与 ②③⑥ 动画对应。

### 8. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 `@import`/`@font-face`/url → 通过。门禁：34 token 全有（基底含 input-surface/popover/dialog/tooltip/code-bg）；值无 `{}`（含多行值 `:59-62`/`:194-197` 被 parseTokens 以 `[^;{}]+` 抓取——`--dialog-glow-shadow` 等多行值含换行但不含 `{}`，合规）；dark 不触发 code-fg 规则。`MAX_SKIN_CSS_BYTES` 512KB vs 本文件 ~17KB。

## 2. 变量与选择器契约

### 2. 结构（451 行全量）

| 段 | 行 | 内容 |
| --- | --- | --- |
| 头注释 | `:1-6` | 结构说明（token 表+特例规则区） |
| `:root` token 表 | `:8-75` | 44 个（含 `--radius: 2px` `:40`） |
| 等宽字体覆写 | `:79-87` | `:root` font-family/font-feature-settings |
| CRT 扫描线/暗角 | `:89-121` | `body::before`（扫描线+动画）、`body::after`（径向暗角） |
| crt-flicker 动画 | `:123-135` | 11 帧 steps(10) 8s |
| 减动效降级 ① | `:137-149` | 关动画/暗角/辉光 |
| 荧光辉光 | `:151-170` | 4 组 text-shadow |
| 灯珠面板模式切换器 | `:172-221` | track/slider 灯珠网格 + indicator-flicker |
| 减动效降级 ② | `:213-217` | 关滑块动画 |
| 机械风滚动条 | `:223-269` | 三态渐变+inset |
| Minimap 指示灯 | `:271-275` | 实色+辉光 |
| UI 终端化 | `:277-338` | 输入表面/设置卡/按钮/闪烁光标 |
| 消息去气泡化 | `:340-362` | message-item/时间戳方括号 |
| 置顶 banner | `:364-374` | 去毛玻璃 |
| 追问选中项 | `:376-402` | 6 组 ask-user 规则 |
| 空态 prompt | `:404-409` | `h1::before '> '` |
| 全局直角化 | `:411-417` | `[class*="rounded"]` catch-all |
| v2 契约块 | `:419-451` | 29 token 映射 |

### 3. `:root` token 全量（`:10-74`，44 个）

`background 100 6% 5%`（#0d0e0c）、`foreground 90 20% 65%`（暖黄绿白）、`content-area 100 6% 3%`、`sidebar/tabbar/input-surface =background`、`muted 100 5% 10%`、`muted-foreground 90 12% 38%`、`border 90 10% 18%`、`primary 100 30% 48%`（收敛暖绿）、`primary-foreground 100 6% 5%`（黑字）、`secondary`、`secondary-foreground`、`accent 70 20% 18%`（暖琥珀暗）、`accent-foreground 70 35% 58%`、`ring 100 35% 42%`、`card 100 6% 7%`、`card-foreground`、`input 100 5% 10%`、`popover 100 6% 8%`、`popover-foreground`、`dialog 100 6% 10%`、`dialog-foreground`、`destructive 10 35% 42%`（暖红）、`destructive-foreground 90 20% 65%`、`stop-hover-bg hsl(10,25%,15%)`、`tooltip 100 8% 14%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted 90 15% 48%`、`code-bg 100 8% 4%`、`radius 2px`（`:40`，注释：rounded-md=calc(2px-2px)=0 全局直角）、`dashed-border 100 30% 48% / 0.25`、`dashed-border-hover …/0.40`；扩展：`selection-bg hsl(var(--primary) / 0.30)`+`selection-color hsl(var(--background))`（`:44-46`）、`shell-bg-gradient`（`:49`）、`item-selected-bg hsl(100 10% 16%)`+`item-selected-fg hsl(var(--primary))`（`:51-53`）、`workspace-badge-color hsl(var(--primary))`（`:56`）、`dialog-glow-shadow`（`:59-62`，**主色磷光**双层白晕换 primary 辉光）、`tiptap-pre-bg 100 8% 4%`（=code-bg `:65`）、`code-block-header-bg rgb(11,14,10)`（`:68`）、`plan-mode-stroke-color hsl(var(--ring) / 0.7)`（`:71`）、`tabbar-shadow-color hsl(var(--border) / 0.6)`（`:74`）。**无** mode-slider 组（被 §5 灯珠规则整体替代）、无 minimap/scroll token（被机械风规则替代）。

### 4. 特例规则逐条（`:77-417`，不 token 化）

1. **等宽字体**（`:80-87`）：Cascadia/JetBrainsMono Nerd Font/monospace 栈 + `font-feature-settings: 'cv11','ss01','ss03','tnum','calt'`、`font-weight:400`。
2. **CRT 扫描线**（`:90-106`）：`body::before` fixed 全屏 2px 周期条纹（rgba(30,35,20,0.18)）+ `crt-flicker 8s steps(10)`（`:123-135`，opacity 0.93-1.0 抖动）；`z-index:100`、`pointer-events:none`。
3. **暗角**（`:108-121`）：`body::after` 径向渐变（中心透明→边角 rgba(0,0,0,0.45)）。
4. **减动效降级 ①**（`:137-149`）：`prefers-reduced-motion: reduce` 时关 ①③ 动画与暗角、去 6 组 text-shadow。
5. **荧光辉光**（`:152-170`）：`.text-foreground`/`[class*="text-foreground"]`、`.crt-sidebar` 两组 text-shadow（亮度差）；`.model-selector-trigger`/`.text-primary` 两组主色辉光。
6. **灯珠面板**（`:177-221`）：`.mode-switcher-track` 暗底+灯珠网格（radial-gradient 4px 网格，`:179-182` `!important`）；`.mode-slider` 点亮灯珠面板（双层 radial 网格+辉光 box-shadow，`:185-198`）+ `indicator-flicker 2.5s steps(15)`（`:201-211`）；注释 `:174-175` 特异性说明**源码数值有误**：注释写 (0,3,0) 覆盖 catch-all (0,2,0)，真实特异性为 (0,2,0)（两个类）覆盖 (0,1,0)（一个属性选择器）——照实标注，覆盖关系成立（两规则均 `!important` 平权，特异性取胜：`border-radius: 2px !important` `:193` vs `0 !important` `:416`）；减动效降级 ②（`:213-217`）；`.mode-btn-selected` 黑字（`:219-221`）。
7. **机械风滚动条**（`:224-269`）：track 透明（`:224-227`）；thumb 三态渐变+inset 边（`:229-268`，hover/active 递进）。
8. **Minimap 指示灯**（`:272-275`）：主色实色+双层辉光。
9. **UI 终端化**：`.agent-input-surface` 直角实色+去 backdrop（`:280-289`）；`.settings-card` 透明+纯边框（`:292-296`）；`button` 去阴影（`:299-301`）；`button.bg-primary` 透明底+主色边框+辉光字（`:303-312`）；`button.bg-secondary` 同（`:314-321`）；**闪烁光标** `terminal-cursor-blink 1s step-end`（`:324-332`）+ 减动效降级 ③（`:334-338`）。
10. **消息去气泡化**（`:341-362`）：`.message-item` 直角+小 padding；`.is-user` 气泡透明；`.message-time::before/::after` 加方括号（`:357-362`）。
11. **置顶 banner**（`:365-374`）：去毛玻璃实色。
12. **追问选中项**（`:377-402`）：6 组 ask-user 规则（深绿实底+亮绿描边/白字去辉光）。
13. **空态 prompt**（`:405-409`）：`h1::before { content: '> ' }`。
14. **全局直角化**（`:415-417`）：`[class*="rounded"] { border-radius: 0 !important }`，注释 `:412-413` 说明与 ⑥ 的特异性约定。

### 5. v2 契约块（`:419-451`）

与同族一致（29 token；`--code-fg: var(--foreground)`、`overlay: 0 0% 0%`、diff 四值 `:440-443`、info→var(--primary) `:449-450`）。

### 6. 逐文件差异表（vs 全部内置）

| 项 | 本文件 | 其余 7 |
| --- | --- | --- |
| 行数 | 451 | 102-133 |
| 特例规则组 | 14 组/3 动画 | 0-4 组 |
| `--radius` 覆写 | `2px` | 无（继承 globals） |
| 动画+减动效降级 | 3 个动画各带降级 | 无动画 |
| mode-slider/scroll/minimap token | 无（被规则替代） | 有 token |

## 3. 层叠

层叠最重的皮肤：14 组特例选择器 + 大量 !important（:178-197 灯珠、:224-268 滚动条、:280-321 UI、:341-402 消息等）。关键特异性约定：.mode-switcher-track .mode-slider (0,2,0) 覆盖全局直角 catch-all [class*="rounded"] (0,1,0)（源码注释 :174-175/:412-413 写 (0,3,0)/(0,2,0) **有误，照实标注**；两规则均 !important 平权，(0,2,0)>(0,1,0) 特异性取胜，:193 vs :416）；--radius: 2px（:40）从 token 层把 rounded-md 变 0。未定义 token 继承 globals.css；组件基础规则被本文件 !important 压过。

## 4. 修改影响面

### 9. 修改影响面

- `[class*="rounded"]` catch-all 与 ⑥ 灯珠的特异性约定（`:412-413`）脆弱：新增高特异性圆角规则需同步。
- `z-index:100` 扫描线可能盖住更高层浮层（推断）。
- 动画对前庭敏感用户的影响是 manifest `tooltip` 承诺的"轻微"；改动动画需同步 tooltip 文案。
- `body::before/after` 全局伪元素与其它皮肤/主题不共享（皮肤卸载后由 CSS 注入生命周期回收，见 `getSkinCss` 缓存/注入链）。

## 5. 已证实

### 10. 测试证据

- 无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）。
- 门禁脚本非 bun test；NOT_RUN。
- `skin-service.test.ts` 仅 manifest（间接）。

### 11. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 451 行结构、30 token、14 组特例逐条 | 已证实 | 文件全读 |
| 3 动画均有 prefers-reduced-motion 降级 | 已证实 | `:137-149`、`:213-217`、`:334-338` |
| `--radius: 2px` 使 rounded-md=0 | 已证实 | `:40` 注释 + `:415-417` |
| 灯珠/catch-all 特异性约定（源码注释数值 (0,3,0)/(0,2,0) 有误，真实 (0,2,0)/(0,1,0)，见 §3） | 已证实 | `:174-175`、`:412-413`、`:193`、`:416` |
| 扫描线 z-index 与浮层的实际叠放 | 推断 | `:94` |
| "轻微闪烁"程度与观感 | 未知 | NOT_RUN |
| 门禁/审计运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

### 12. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 17 段 | §2 | covered |
| token 全量 | §3 | covered |
| 14 组特例逐条 | §4 | covered |
| v2 块/差异 | §5/§6 | covered |
| 加载链/校验/影响面 | §7-§9 | covered |
| 测试缺口/未知 | §10/§11 | covered |
