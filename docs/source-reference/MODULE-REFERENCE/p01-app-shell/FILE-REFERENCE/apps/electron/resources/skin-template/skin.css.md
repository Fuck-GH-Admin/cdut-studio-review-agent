---
path: apps/electron/resources/skin-template/skin.css
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8ab443ae64e7374d113f3095a2797cb5f765666e
sha256: 4238c987937c74d5f971a9e9f1e546f67d0e1afa9f131dbf2ec92dd17022b6b0
lines: 108
kind: style
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---
# apps/electron/resources/skin-template/skin.css

## 1. 作用域与加载者

### 1. 结论与边界

皮肤**模板 CSS** = Skin Surface Contract v2 的参考实现：单个 `:root`（`:6-78`）同时定义基础 shadcn 兼容 token 与 v2 语义表面 token，外加两段**注释掉的可选样例**（消息样式 `:80-96`、包内背景图 `:98-108`）。所有 token 值用 HSL 三元组（`色相 饱和度% 亮度%`，`:2`）。

不做的事：无特例规则（内置皮肤才有个体规则）；注释段不生效；不被运行时加载（仅作复制模板/门禁校验对象）。

### 5. 校验（双通道）

- 运行时 `auditSkinCss`（`skin-service.ts:197-267`）：注释内字符串不绕过（`:205-217`）；禁 `@import`/`@font-face`（`:220-227`）；`url()`/`src()` 仅允许 `assets/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(webp|png|svg|jpe?g)` 小写（`:254-255`，`SKIN_CSS_ASSET_RE :119`）；url 参数禁转义（`:253` fail-closed）。模板注释段的 `url("assets/background.webp")` 在注释内不触发。
- 门禁 `check-skin-surface-contract.mjs:111-139`：模板必须 `contractVersion===2`、tone 合法、34 个 REQUIRED_TOKENS（`:21-33`，v2 组 + `input-surface`/`popover`/`dialog`/`tooltip`/`code-bg`）非空、无禁用 CSS（`FORBIDDEN_CSS_RE :35`）、token 值不含 `{}`（`:95-96`）。
- 34 token 模板全有（§3 列全）；`MAX_SKIN_CSS_BYTES=512KB`（`skin-service.ts:116`）——本文件 5.5KB 远低。

### 6. 调用者与边界

同批 manifest 手册 §4：`SkinManager.tsx:10` `?raw` 导入（新建皮肤文本源）；`skin-manager-service.ts:207` 复制；门禁脚本校验。运行时链（用户拿模板建包后）：`getSkinCss:484`（读+审计+缓存 `SKIN_CSS_CACHE`）→ `handleProferSkinRequest:567`（`profer-skin://`）→ renderer 注入 `<style>`；公共组件规则在 `skin-base.css`（引用本 token，皮肤作者无需知内部类名，`:6-7` 注释）。

### 7. 数据 I/O 与副作用

静态资源，无副作用。

## 2. 变量与选择器契约

### 2. 结构（108 行全量）

| 段 | 行 | 内容 |
| --- | --- | --- |
| 头注释 | `:1-4` | 契约声明（"Skin Surface Contract v2"）、HSL 格式、`:root` 统一定义 |
| `:root` 基础 token | `:6-36` | shadcn 兼容 29 个（`--background`…`--destructive-foreground`） |
| `:root` 框架/交互表面 | `:38-49` | 11 个（`--shell-surface`…`--focus-ring`） |
| `:root` 浮层/内容表面 | `:51-59` | 8 个（`--overlay`…`--table-header-surface`） |
| `:root` Diff/preview | `:61-66` | 5 个（`--diff-*`4 + `--browser-host-surface`） |
| `:root` 语义状态 | `:68-74` | 6 个（`--success`…`--info-foreground`） |
| `:root` 外壳缝隙 | `:76-77` | `--shell-bg-gradient` |
| 注释样例 A/B（消息） | `:80-96` | `.message-item` 卡片化方案 A、气泡着色方案 B（均注释） |
| 注释样例（背景图） | `:98-108` | `.shell-bg` 背景图写法 + 4 条红线 |

### 3. token 全量清单（60 个定义，`:6-77`）

**基础 29**（`:8-36`）：`background 222 25% 13%`、`foreground 215 28% 92%`、`content-area 222 30% 9%`、`sidebar-surface`、`tabbar-surface`（同 background）、`tab-surface`/`input-surface`/`input`（`222 22% 16%`）、`muted 222 20% 18%`、`muted-foreground 215 14% 62%`、`border 220 18% 25%`、`primary 212 85% 61%`、`primary-foreground 0 0% 100%`、`secondary`、`secondary-foreground`、`accent 220 22% 22%`、`accent-foreground 212 90% 75%`、`ring 212 85% 61%`、`card 222 21% 17%`、`card-foreground`、`popover 222 22% 18%`、`popover-foreground`、`dialog 222 22% 20%`、`dialog-foreground`、`tooltip 222 22% 24%`、`tooltip-foreground`、`tooltip-muted 215 14% 70%`、`destructive 0 65% 55%`、`destructive-foreground`。

**v2 语义表面 31**（`:38-77`）：`shell-surface`、`raised-surface`、`sunken-surface`、`surface-border`、`surface-border-strong 220 18% 34%`、`input-hover 222 20% 20%`、`control-surface 222 20% 18%`、`control-hover 222 20% 23%`、`selected-surface 212 38% 24%`、`selected-foreground`、`focus-ring`、`overlay 222 30% 4%`、`overlay-foreground`、`message-surface 222 22% 15%`、`message-user-surface 222 20% 19%`、`code-bg 222 30% 8%`、`code-fg 215 28% 92%`、`blockquote-surface`、`table-header-surface`、`diff-addition-bg 142 71% 45% / 0.14`、`diff-addition-fg 142 55% 76%`、`diff-deletion-bg 0 84% 60% / 0.14`、`diff-deletion-fg 0 85% 78%`、`browser-host-surface`、`success 142 71% 45%`、`success-foreground`、`warning 38 92% 50%`、`warning-foreground 26 83% 14%`、`info 212 85% 61%`、`info-foreground`、`shell-bg-gradient linear-gradient(145deg, hsl(222 32% 7%), hsl(222 24% 12%))`（`:77`）。

注意 `:62-65` 的 diff 四 token 值带 **alpha 后缀**（`HSL / 0.14` 形式）；模板是唯一"单 :root 内联全部 v2 token"的文件（内置皮肤把 v2 组放尾部独立 `:root` 且多用 `var(--…)` 映射）。

### 4. 注释样例（可选，均不生效）

- `:80-96` 消息样式：方案 A（`.message-item.is-assistant/.is-user` 整卡着色）、方案 B（`.message-item.is-user [class~="bg-primary/10"]` 只改气泡色）；注释说明默认布局 Agent 透明、`--message-surface`/`--message-user-surface` 仅提供颜色。
- `:98-108` 背景图：`.shell-bg` 挂 `url("assets/background.webp")`；**4 条红线**（`:99-102`）：必须挂 `.shell-bg` 不是 body；`assets/` 由主进程改写为 `profer-skin://<skin-id>/assets/…`；禁止 `file:`/`data:`/外链/`@import`；单图 ≤4MB、整包 ≤5MB。

## 3. 层叠

皮肤 token 在单个 :root 内定义（无层叠冲突源）；注释样例不参与层叠；未定义 token 继承 globals.css 的 :root/.dark 默认值，组件公共规则由 skin-base.css 引用 token（头注释 :3、:6-7 语义）。本文件无 !important、无特例选择器。

## 4. 修改影响面

### 8. 修改影响面

改 v2 token 值影响所有以此为模板的新皮肤；改注释样例只影响文档性；删 token 会门禁失败（`check-skin-surface-contract.mjs:129-130`）。`--code-fg: 215 28% 92%`（深色值）符合浅色皮肤规则——模板 tone 为 dark 不触发 `:92-94` 检查但样例安全。

## 5. 已证实

### 9. 测试证据

- 无 `.test.ts` 覆盖 `auditSkinCss`/模板（全冻结树检索 `auditSkinCss`/`getSkinCss` 于 `--include=*.test.ts` 为 0 命中）。
- 门禁脚本（`check-skin-surface-contract.mjs`）是构建/CI 侧检查，非 bun test；本轮未运行（NOT_RUN）。
- `skin-service.test.ts` 覆盖 manifest 解析（间接相关）。

### 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 60 token 全量值如 §3 | 已证实 | 文件全读 |
| 注释段 4 条红线（.shell-bg/profer-skin://改写/禁外链/4MB·5MB） | 已证实 | `:98-102` |
| 34 REQUIRED_TOKENS 全覆盖 | 已证实 | §3 vs `check-skin-surface-contract.mjs:21-33` |
| 单图 4MB/整包 5MB 的执行点 | 未知 | 注释自述；执行代码在安装侧（未逐行核） |
| 门禁脚本运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

### 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 108 行结构 | §2 | covered |
| 60 token 全量 | §3 | covered |
| 注释样例/红线 | §4 | covered |
| 双通道校验 | §5 | covered |
| 消费者/加载链 | §6 | covered |
| 测试/缺口 | §9 | covered |
