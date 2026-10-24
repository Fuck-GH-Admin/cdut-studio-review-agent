---
path: apps/electron/src/renderer/lib/ofv-theme-tokens.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b4ec052e1b98ee9d9359f2d09c3eaad518e43fc7
sha256: fb86b57deeaed698e9b1cf8de493ccaa9c2fb101bad5c79267695db0729576bc
lines: 49
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/ofv-theme-tokens.test.ts

## 1. 测试目标

OFV 主题桥接的**漂移守卫**（49 行，bun:test，describe `'OFV 主题桥接：CSS 与搬运名单对齐'` `:18`）：`ofv-profer-theme.css` 消费的 CDUT Studio token 集与 `@profer/shared.OFV_THEME_TOKEN_NAMES` 双向严格对齐；`collectOfvThemeTokens` 只收有值项、trim。mock 边界：`collectOfvThemeTokens` 注入 `{getPropertyValue}` 替身（`:38`/`:46`，不引 DOM）；CSS 侧用 `readFileSync` 真实读 `../styles/ofv-profer-theme.css`（`:21`）。

## 2. 用例清单

前置：`BRIDGE_CSS_URL = new URL('../styles/ofv-profer-theme.css', import.meta.url)`（`:16`）。依赖顺序：无（3 用例独立）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | 桥接 CSS 消费的 CDUT Studio token 与 OFV_THEME_TOKEN_NAMES 完全一致（双向） | 19-30 | 读 CSS 去块注释（`:21`，注释内 `var(--x)` 示例不计） | 正则 `var\(--([a-z0-9-]+)` 全量提取，排除 `ofv-` 前缀（桥接内部变量，`:26`） | `consumed.sort()` toEqual `OFV_THEME_TOKEN_NAMES.sort()` |
| 2 | 取值只收有值的 token | 32-42 | 替身三值：`--background`/`--radius` 有值、`--selection-bg` 空 | `collectOfvThemeTokens` | toEqual `{background:'150 8% 14%', radius:'2px'}`（空项不补空串） |
| 3 | 取值去掉前后空白 | 44-48 | 替身 `--foreground` 值带前后空格 | `collectOfvThemeTokens` | toEqual `{foreground:'140 10% 92%'}` |

声明合计 **3 test / 0 it**（机械计数）。

## 3. 真实断言

- `:29` `expect([...consumed].sort()).toEqual([...OFV_THEME_TOKEN_NAMES].sort())`——双向一致（多/少任何一边即失败）。
- `:38-41` `toEqual({ background: '150 8% 14%', radius: '2px' })`——`--selection-bg` 空值不出现在结果。
- `:46-47` `toEqual({ foreground: '140 10% 92%' })`——trim 生效。

## 4. 未覆盖与脆弱点

- **未覆盖**：`readOfvThemeTokens` 全部分支（无 window/`getComputedStyle` 判定 `ofv-theme-tokens.ts:36`）；真实 `getComputedStyle` 值形态；`ofv-` 前缀过滤的反向（若 CSS 新增真消费 `--ofv-*` 会被误排除，设计上 ofv-* 为内部变量）。
- **脆弱点**：用例 1 依赖 CSS 文件实际内容与注释去除正则（`/* */` 非嵌套）；`var(--x` 的提取正则不覆盖 `var(--x, fallback)` 之外的变体空格形态（`var( --x )` 会漏）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例设置/动作/断言如上；替身边界 | 已证实 | `:1-49` 全文逐行 |
| 声明计数 3 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| CSS 实际消费集与名单当前一致 | 未知 | 需运行测试验证（NOT_RUN）；静态看 `ofv-profer-theme.css` 有消费（跨批样式） |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 漂移守卫（双向一致） | §2.1/§3 | 19-30 | covered |
| 只收有值 | §2.2/§3 | 32-42 | covered |
| trim | §2.3/§3 | 44-48 | covered |
| readOfvThemeTokens 分支 | §4 | - | unknown（未覆盖） |
