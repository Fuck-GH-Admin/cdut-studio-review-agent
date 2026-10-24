---
path: apps/electron/src/renderer/lib/ofv-theme-tokens.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ada3942e41c89bb09d267c3da1b94b84d43ac1e5
sha256: dff35ea527c218b5bd409e71ed29ccc22963a14401fadd5224736f39bc6cb996
lines: 38
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/ofv-theme-tokens.ts

## 1. 结论与边界

读出 app 文档上**实际生效**的 CDUT Studio token 值，交给浏览器列的 OFV viewer 页（38 行，头注释 `:1-12`）：不照抄 `globals.css` 默认值，而是读 `getComputedStyle` 计算值——默认主题/内置皮肤/用户皮肤（含 `var()` 派生链展开）都走同一条路径，预览侧无需维护皮肤清单。

**边界**：token 名单与跨进程契约在 `@profer/shared` 的 ofv-theme-bridge（`:10`，单一真源）；名单与 `ofv-profer-theme.css` 消费面的对齐由同目录漂移守卫测试守住（`:11`）；不改 DOM/样式。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OfvTokenValueSource` | 接口（导出） | 16-18 | `{getPropertyValue(property: string): string}` | 取值源抽象（单测注入替身） |
| `collectOfvThemeTokens` | 函数（导出） | 25-32 | `(source: OfvTokenValueSource) => OfvThemeTokens` | 按名单收集 |
| `readOfvThemeTokens` | 函数（导出） | 35-38 | `() => OfvThemeTokens` | 读 `:root` 计算值 |

导出合计 3。`OFV_THEME_TOKEN_NAMES`/`OfvThemeTokens` 来自 `@profer/shared`（`:13`）。

## 3. 内部逻辑与关键流程

1. **collectOfvThemeTokens**（`:25-32`）：遍历 `OFV_THEME_TOKEN_NAMES`，`source.getPropertyValue('--<name>').trim()`（`:28`），**只收非空值**（`:29`）——留空=当前主题未定义，让页面侧 `var(--x, fallback)` 走主题默认分支（注释 `:21-23`）。
2. **readOfvThemeTokens**（`:35-38`）：`typeof window === 'undefined' || typeof window.getComputedStyle !== 'function'` → 返回 `{}`（`:36`，SSR/测试环境安全）；否则 `collectOfvThemeTokens(window.getComputedStyle(document.documentElement))`（`:37`）。注释（`:34`）：调用前需皮肤 CSS 已落定（`atoms/theme` 的 `whenSkinCssApplied`，跨批）。

## 4. 调用者与调用链

入向（全冻结树检索 `ofv-theme-tokens`/`readOfvThemeTokens`/`collectOfvThemeTokens`）：
- `hooks/useBrowserPreviewThemeSync.ts:5`（import）→ `useBrowserPreviewThemeSync.ts:43` `readOfvThemeTokens()`（随主题同步烘进 viewer URL）。
- 批内测试 `ofv-theme-tokens.test.ts:6`（`collectOfvThemeTokens` 注入替身）。
- 交叉引用（非调用）：`packages/shared/src/constants/ofv-theme-bridge.ts:9` 注释指认本文件为消费方。
出向：`@profer/shared`（`:13`）。

## 5. 数据 I/O、读写与副作用

读 DOM 计算样式（`getComputedStyle`，`:37`）；无磁盘/网络（不适用）。副作用：无（纯读）。

## 6. 分支、失败、取消与恢复

- 无 window/getComputedStyle → `{}`（`:36`）；空值项跳过（`:29`）。
- 无 throw/异步（不适用，依据：全文无 throw）。
- 恢复：不适用（无状态）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=CSS 级联计算值（皮肤 `<style id="skin-css">` 覆写 `:root` 后的最终值，注释 `:4-8`）。

## 8. 修改影响面

- 影响 `useBrowserPreviewThemeSync.ts:43` 烘进 viewer URL 的 token 集合（缺项→预览页 `var()` 未定义→OFV 默认蓝调，漂移守卫测试注释 `:11-14`）。
- 名单变更须同步 `@profer/shared` 的 `OFV_THEME_TOKEN_NAMES` 与 `ofv-profer-theme.css`（双向对齐由 `ofv-theme-tokens.test.ts` 漂移守卫守住）。
- 需同步修改的测试：`ofv-theme-tokens.test.ts`（批内 3 用例）。

## 9. 测试证据

直接测试：`lib/ofv-theme-tokens.test.ts`（批内，3 test，详见其手册）：CSS 消费集与名单双向一致（漂移守卫）、只收有值、trim。未覆盖：`readOfvThemeTokens` 的 window 判定分支（`:36`）无断言；真实 getComputedStyle 行为。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 收集/空值跳过/window 判定 | 已证实 | `:1-38` 全文逐行 |
| 入向=useBrowserPreviewThemeSync.ts:43 + 批内测试 | 已证实 | 全树检索（§4） |
| 皮肤 CSS 落定时序（whenSkinCssApplied） | 边界（跨批） | `:34` 注释 |
| 真实浏览器 getComputedStyle 展开派生链 | 推断 | 头注释 `:5-8` 声明 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `OfvTokenValueSource` | §2 | 16-18 | covered |
| `collectOfvThemeTokens`（trim/只收非空） | §3.1/§9 | 25-32 | covered |
| `readOfvThemeTokens`（window 判定） | §3.2 | 35-38 | covered |
