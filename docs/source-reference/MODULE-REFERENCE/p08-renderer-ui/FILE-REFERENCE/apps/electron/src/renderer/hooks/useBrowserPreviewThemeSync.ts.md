---
path: apps/electron/src/renderer/hooks/useBrowserPreviewThemeSync.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2069373b7061860911852a833cd2a3c5260dc609
sha256: 1c04c34f32b2ed0471183e6842ca12afdfaae5e409dadb464c2eca3bb640d13a
lines: 52
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useBrowserPreviewThemeSync.ts

## 1. 结论与边界

**浏览器列本地预览主题同步 hook**（52 行）：viewer 页在无 preload 沙箱 webContents 里读不到 app 皮肤，由渲染进程在主题**真正变化**时通知主进程按新主题重载本地预览（头注释 `:8-26`）。只作用于本地预览标签（普通网页永不跟随）。

## 2. 导出与关键符号

1 导出：`useBrowserPreviewThemeSync(): void`（`:27`）。读 `resolvedThemeAtom`/`activeSkinIdAtom`/`skinCssAppliedRevisionAtom`。

## 3. 内部逻辑与关键流程

（`:32-51`）：effect 三依赖（theme/skinId/skinCssRevision）→`await whenSkinCssApplied(skinId)`（皮肤 CSS 异步注入先等落定，`:35-36`）→cancelled 竞态检查（`:38`）→`refreshBrowserPreviewTheme({theme, tokens: readOfvThemeTokens()})`。**tokens 传递是双深色皮肤互判差异的关键**（只看明暗会漏，注释 `:19-20`）；主进程记住主题供 Agent 打开的预览用（`:21`）；挂载也同步一次（`:23`）。

## 4. 调用者与调用链

- 入向：应用顶层/浏览器列宿主（域外）。
- 出向：theme atoms、`@/lib/ofv-theme-tokens`、`window.electronAPI.refreshBrowserPreviewTheme`。

## 5. 数据 I/O、读写与副作用

IPC 通知主进程刷新本地预览主题；读文档计算 token 值。

## 6. 分支、失败、取消与恢复

sync API 缺失→静默返回（Partial 探测 `:39-41`）；失败 console.error（`:44-45`）；cancelled 防过期轮次。

## 7. 权限与权威状态

预览配色权威=theme+tokens 双通道（注释 `:17-20`）；只限本地预览标签（`:15`）。

## 8. 修改影响面

浏览器列本地文件预览（OFV）的明暗/皮肤一致性；换肤竞态窗口（异步注入未落定）的正确性由 `whenSkinCssApplied` 守护。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 等待落定/tokens 双通道/挂载同步 | 已证实 | `:1-52` 全文 |
| 主进程重载行为 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 27-51 | covered |
