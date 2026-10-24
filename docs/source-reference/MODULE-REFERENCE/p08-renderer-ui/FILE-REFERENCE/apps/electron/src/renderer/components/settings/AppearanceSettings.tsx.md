---
path: apps/electron/src/renderer/components/settings/AppearanceSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6afdd258a74534d31a1986fe2cc1a6b56a964ef9
sha256: 79760588b6178a830cea7c0a16e41081ae0cbdfa20d409c70e2e2744d18332a1
lines: 183
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/AppearanceSettings.tsx

## 1. 结论与边界

**外观设置页**（`:1-6`）：主题模式（浅/深/跟随系统）、本地皮肤管理（导入 zip/文件夹、删除、冲突替换）、Markdown 字号、界面大小（**仅移动端/浏览器端渲染**，Electron 不渲染控件避免"调了无效果"，`:69-71` 注释）。持久化经 atoms（`~/.proma/settings.json`）。

## 2. 导出与关键符号

1 导出：`AppearanceSettings`（`:60`）。内部常量：`THEME_OPTIONS`（`:41`）、`MARKDOWN_FONT_SIZE_OPTIONS`（`:48`）、`ZOOM_HINT`（按平台，`:55-58`）。状态：`deleteTarget`/`conflict`/`busy`/`isElectron`（`:65-71`）。

## 3. 内部逻辑与关键流程

- `handleThemeChange`（`:76-83`）：模式切换**同时重置 style='default'** 并 `applyThemeToDOM`。
- `handleStyleSelect`（`:86-92`）：皮肤选择→mode='special'。
- `refreshSkins`/`importSkin`（`:94-`）：调 `window.electronAPI.selectSkinZip/selectSkinFolder`；同名冲突→AlertDialog 询问替换（`:178-180`）；删除二次确认（永久删除不可恢复文案，`:176`）。
- 渲染：主题分段控件+皮肤管理器（SkinManager 子组件）+Markdown 字号+界面大小（非 Electron 才显示）。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（appearance 标签，本批）。
- 出向：`@/atoms/theme`/`markdown-font-size`/`ui-scale`、`SkinManager`（同目录域外）、`window.electronAPI`（皮肤文件 API）。

## 5. 数据 I/O、读写与副作用

经主进程 API 选择/导入/删除皮肤文件；主题应用到 DOM（applyThemeToDOM）。

## 6. 分支、失败、取消与恢复

导入失败→toast；冲突→替换/取消二选一；删除不可恢复（AlertDialog 告示）；无自动回滚。

## 7. 权限与权威状态

无权限分支，依据：用户本地皮肤目录。

## 8. 修改影响面

主题/皮肤/字号/缩放全局观感：上游=theme/markdown-font-size/ui-scale 三组 atoms 持久化（`~/.proma/settings.json`）；修改本文件波及 `applyThemeToDOM` 应用一致性、皮肤导入/删除文件操作面；回归面=主题切换重置 style=default 语义（`:76-83`）、Electron 下缩放控件隐藏判定（`:71`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双模式重置语义/Electron 缩放隐藏/冲突替换 | 已证实 | `:1-183` 全文 |
| SkinManager 实现 | 边界 | 同目录域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+处理函数 | §2/§3 | 41-180 | covered |
