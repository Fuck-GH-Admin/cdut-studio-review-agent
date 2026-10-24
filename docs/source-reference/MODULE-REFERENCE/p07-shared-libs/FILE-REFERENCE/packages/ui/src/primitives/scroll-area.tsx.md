---
path: packages/ui/src/primitives/scroll-area.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 27f33452edd2f9f5242907335513e0f4fe1270e7
sha256: 91ab6e6259ad5f0e76e406a1003d29b8e4620a0c811cb87c6b0ad679d9ef140e
lines: 46
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/scroll-area.tsx

## 1. 结论与边界

滚动区域（Radix `@radix-ui/react-scroll-area`）：Root+Viewport+默认 ScrollBar+Corner 组合。

## 2. 导出与关键符号

导出 2 条（`export` :46）：`ScrollArea`（:6-22，forwardRef；内部渲染 Viewport :15-17、默认 `<ScrollBar/>` :18、Corner :19）、`ScrollBar`（:24-44，forwardRef；`orientation` 默认 "vertical" :27，横竖两套尺寸类 :33-36，Thumb :41）。

## 3. 内部逻辑与关键流程

ScrollArea 内嵌默认 ScrollBar；orientation 二分支样式（:33-36）。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向（5，全生产）：`file-browser/FileBrowser.tsx:32`、`bulletin/BulletinDialog.tsx:18`、`settings/SettingsPanel.tsx:28`、`settings/ChannelForm.tsx:54`、`settings/BotHubSettings.tsx:10`。出向：react、`@radix-ui/react-scroll-area`、`../lib/cn`。

## 5-7. 数据/分支/权限

orientation 二分支（:33-36）；余不适用，依据=纯展示。

## 8. 修改影响面

- 消费面：5 个消费组件（file-browser/FileBrowser、bulletin/BulletinDialog、settings/SettingsPanel、settings/ChannelForm、settings/BotHubSettings）的滚动容器行为与滚动条样式依赖本件；`ScrollArea` 内嵌默认 `ScrollBar` 的组合（:18）改动会同时改变这 5 处的滚动条外观。
- 依赖面：`@radix-ui/react-scroll-area` 的 Viewport/Thumb/Corner 结构契约；`[&>div]:!block`（:15）对子层布局的强制样式是与各消费方布局兼容的关键点。
- 需同步测试：无（本批无组件测试）；GUI 滚动行为未实测（NOT_RUN）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；ScrollArea 内嵌默认 ScrollBar | 已证实 | :6-46 |
| 5 使用点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| ScrollArea/ScrollBar | §2/§3 | :6-46 | covered |
