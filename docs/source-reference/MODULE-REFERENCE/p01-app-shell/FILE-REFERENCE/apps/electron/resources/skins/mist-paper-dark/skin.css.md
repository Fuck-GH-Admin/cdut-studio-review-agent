---
path: apps/electron/resources/skins/mist-paper-dark/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03cfe15abe1d276cabe6d9ed669af1341789ae54
sha256: e8bec6cd2884219aa210acb0320b2c1fa6c1ecab06b2026ef1ee77a29af96192
lines: 133
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skins/mist-paper-dark/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

内置皮肤「雾纸暖灰」CSS：暖石墨色板（色相 35、饱和度 ~3.33%——**文件中大量 `3.3333333333333335%` 浮点字面量**，真实字节如此，非显示问题）；本批**特例规则最多的 dark 皮肤**（4 组选择器规则 + 阴影五档 + 专属 token `--mist-paper-message-foreground`）。

不做的事：不覆写选区/minimap/计划虚线等（无对应扩展 token）。

### 7. 调用者与加载链

同族：`getSkinCss('mist-paper-dark')`（`skin-service.ts:484`）→ `handleProferSkinRequest:567` → renderer。特例选择器依赖 renderer 组件类名（`.agent-input-surface`/`.message-item .prose`/`.ui-classic`/`.ask-user-banner`）——**类名契约**：组件改名会使特例失效（静默，见 §10）。

### 8. 校验（双通道合规，已静态核对）

`auditSkinCss`：无 url/@import → 通过。门禁：34 token 全有（基底含 input-surface/popover/dialog/tooltip/code-bg，扩展+v2 补其余）；值无 `{}`；dark 不触发 code-fg 规则。

## 2. 变量与选择器契约

### 2. 结构（133 行全量）

| 段 | 行 | 内容 |
| --- | --- | --- |
| 头注释 | `:1-8` | 同族说明 |
| `:root` 基底色板 | `:10-49` | 34 个（含专属 `--mist-paper-message-foreground:17`） |
| 阴影五档 | `:51-56` | `--shadow-xs/sm/md/lg/xl`（**唯一覆写阴影的内置皮肤**） |
| 输入区代码块 | `:58-59` | `--tiptap-pre-bg` |
| 特例规则区 | `:62-99` | 4 组选择器（见 §4） |
| v2 契约块 | `:101-133` | 29 token 映射 |

### 3. 基底色板 token 全量（`:14-49`）

`background 35 3.33…% 16%`、`foreground …71%`、`mist-paper-message-foreground …71%`（`:17`，**专属 token**：对话正文独立校准）、`muted …19%`、`muted-foreground …55%`、`border …29%`、`input …29%`、`ring 221 18% 62%`、`primary 221 18% 38%`、`primary-foreground 0 0% 100%`、`secondary …19%`、`secondary-foreground`、`accent …24%`、`accent-foreground …78%`、`destructive 0 58% 50%`、`destructive-foreground`、`stop-hover-bg hsl(0 35% 23%)`（空格语法）、`card …25%`（`:32-33` 注释：Dialog 贴近暖石墨、卡片 3% 层次差）、`card-foreground`、`popover …22%`、`popover-foreground`、`dialog …22%`、`dialog-foreground`、`content-area …17%`、`sidebar-surface/tabbar-surface …16%`、`input-surface …20%`、`tab-surface …25%`、`tooltip …29%`、`tooltip-foreground 0 0% 98%`、`tooltip-muted …76%`、`code-bg …15%`、`dashed-border …92% / 0.26`、`dashed-border-hover 221 18% 62% / 0.68`。

**阴影五档**（`:52-56`，暖石墨专属定制）：`shadow-xs 0 1px 2px …/0.34`、`shadow-sm`（+inset 高光 0.045）、`shadow-md`（0.52/0.32 + inset 0.055）、`shadow-lg`（0.60/0.40 + 0.065）、`shadow-xl`（0.68/0.50 + 0.075）——多层阴影+inset 高光递进。

### 4. 特例规则（`:62-99`，4 组，逐条）

1. `.agent-input-surface`（`:65-74`）：`background-color: hsl(var(--input-surface) / 0.98)` + `border-color …/ 0.92` + `var(--shadow-md)`；`:focus-within` 加 `ring/0.72` 边框与 `0 0 0 3px ring/0.14` 光圈（注释 `:64`：避免 backdrop 透明度把输入区混回主画布）。
2. `.ui-classic .agent-input-surface`（`:77-79`）：`background-color: hsl(var(--input-surface)) !important`（注释 `:76`：经典界面默认以 background 覆盖输入表面，此处恢复专用 token）。
3. `.message-item .prose`（`:82-92`）：`--tw-prose-body/headings/bold/bullets/counters` 全绑 `--mist-paper-message-foreground`（`p, li, blockquote, strong, em, h1-h6` 统一色，`:90-92`）；注释 `:81`：代码块仍保留 Shiki 高亮。
4. `.ask-user-banner .ask-user-question-tab-answered`（`:95-99`）：`primary/0.32` 底 + `hsl(0 0% 96%)` 字 + `inset 0 0 0 1px ring/0.28` 边（温和提示已回答 tab）。

### 5. v2 契约块（`:101-133`）

与同族一致的 29 token 映射；`--code-fg: var(--foreground)`（dark 合法）。`message-surface: var(--content-area)`/`message-user-surface: var(--secondary)` 与 §4-3 的 prose 规则并存（前者给容器、后者给文字）。

### 6. 逐文件差异表（vs 同族 dark）

| 项 | 本文件 | 对照 |
| --- | --- | --- |
| 专属 token | `--mist-paper-message-foreground` | 内置唯一 |
| 阴影覆写 | `--shadow-xs…xl` 五档 | 内置唯一 |
| 特例选择器 | 4 组（输入表面/prose/ask-user/经典界面） | forest/ocean/slate-dark 0 组 |
| 色相域 | 35 暖灰（饱和 3.33%） | 其余 100-270 |
| 浮点饱和度字面量 | `3.3333333333333335%` ×20+ | 其余整数 |

## 3. 层叠

双 :root（基底 :10-59 + v2 映射 :101-133）+ 4 组特例选择器（:65-99）。唯一 !important 在 .ui-classic .agent-input-surface（:78，特异性 (0,2,0) 压过经典界面默认 background 覆盖）；.agent-input-surface :focus-within 依赖伪类层叠。未定义 token 继承 globals.css；组件规则在 skin-base.css。

## 4. 修改影响面

### 9. 修改影响面

改 `--mist-paper-message-foreground` 影响全部对话正文；阴影五档影响全局浮层深度感；`!important` 规则（`:78`）与 ui-classic 的覆盖关系脆弱（特异性依赖 `.ui-classic` 前缀存在）。删特例规则会退回全局样式（无报错）。

## 5. 已证实

### 10. 测试证据

- 无 CSS 内容测试（`auditSkinCss`/`getSkinCss` 无 test 断言）。
- 门禁脚本非 bun test；NOT_RUN。
- `skin-service.test.ts` 仅 manifest（间接）。

### 11. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 133 行结构、token 全量、4 组特例逐条 | 已证实 | 文件全读 |
| 阴影五档为内置唯一 | 已证实 | 8 个 skin.css 比对 |
| `3.3333333333333335%` 为真实字节 | 已证实 | 文件读取（非显示假象） |
| 特例选择器与组件类名的耦合无测试保护 | 已证实 | §9 检索 |
| 观感 | 未知 | NOT_RUN |

## 6. 覆盖表

### 12. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 结构 6 段 | §2 | covered |
| token 全量+阴影五档 | §3 | covered |
| 4 组特例逐条 | §4 | covered |
| v2 块/差异 | §5/§6 | covered |
| 加载链/校验 | §7/§8 | covered |
| 测试缺口 | §10 | covered |
